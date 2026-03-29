import { GoogleGenAI, Type, Modality } from "@google/genai";
import { Message } from "../types";
import { SYSTEM_INSTRUCTION, KNOWLEDGE_BANK } from "../constants/aiConfig";

const getAI = () => {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.GEMINI_KEY;
  if (!apiKey && typeof window === 'undefined') {
    console.warn("[AI-DEBUG] GEMINI_API_KEY is not set in process.env. AI features will fail.");
  }
  return new GoogleGenAI({ apiKey: apiKey || "" });
};

export async function generateSpeech(text: string, language: string = 'English'): Promise<string | null> {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Say naturally and warmly in ${language}: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' }, // Kore is a natural sounding female voice
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    return base64Audio || null;
  } catch (error) {
    console.error("TTS Error:", error);
    return null;
  }
}

const notifyManagerTool = {
  name: "notify_manager",
  parameters: {
    type: Type.OBJECT,
    description: "Escalate the conversation to a human manager.",
    properties: {
      customer_query: {
        type: Type.STRING,
        description: "The user's message that triggered the escalation.",
      },
      reason: {
        type: Type.STRING,
        description: "The reason for escalation (e.g., 'negotiation' or 'unknown_question').",
        enum: ["negotiation", "unknown_question"],
      },
    },
    required: ["customer_query", "reason"],
  },
};

const sendCarImagesTool = {
  name: "send_car_images",
  parameters: {
    type: Type.OBJECT,
    description: "Send multiple images of a specific car to the customer.",
    properties: {
      vehicle_id: {
        type: Type.STRING,
        description: "The unique ID of the vehicle.",
      },
    },
    required: ["vehicle_id"],
  },
};

export async function chatWithAI(messages: Message[], fleetData?: any[], kbData?: any[], language: string = 'English') {
  const ai = getAI();
  try {
    let dynamicInstruction = SYSTEM_INSTRUCTION;
    
    // Add language instruction
    dynamicInstruction += `\n\nCRITICAL: YOU MUST RESPOND ONLY IN ${language.toUpperCase()}. Even if the user speaks another language, your reply must be in ${language}.`;

    // REPETITION PREVENTION: Check the last model message in history
    const lastModelMessage = [...messages].reverse().find(m => m.role === 'model');
    if (lastModelMessage && lastModelMessage.text) {
      dynamicInstruction += `\n\nREPETITION PREVENTION: Your last response was: "${lastModelMessage.text}". DO NOT repeat this or say something too similar. Ensure your new response is fresh and moves the conversation forward.`;
    }

    let knowledgeBankContent = KNOWLEDGE_BANK;
    if (kbData && kbData.length > 0) {
      knowledgeBankContent = kbData.map(e => `Q: ${e.question}\nA: ${e.answer}\nKeywords: ${e.keywords?.join(', ')}`).join('\n\n');
    }

    if (fleetData && fleetData.length > 0) {
      const fleetString = fleetData.map(car => {
        let images = [];
        try {
          images = typeof car.vehicle_images === 'string' ? JSON.parse(car.vehicle_images) : (car.vehicle_images || []);
        } catch (e) {
          console.warn(`[AI-DEBUG] Failed to parse vehicle_images for ${car.vehicle_id}:`, e);
        }
        const allImages = [car.vehicle_image_url, ...images].filter(Boolean);
        
        return `- ${car.vehicle_make} ${car.vehicle_model} (${car.vehicle_year}): ` +
        `ID: ${car.vehicle_id}, Offer: ${car.offer}, Offer Name: ${car.offer_name || 'N/A'}, Special Price: AED ${car.special_day_price || car.day_price}/day, Actual Price: AED ${car.daily_price}/day, Weekly: AED ${car.week_price}/week, Monthly: AED ${car.month_price}/month. ` +
        `Type: ${car.fleet_type}, Color: ${car.vehicle_color}, Mileage Limit: ${car.milage_limit}km, ` +
        `Extra KM Charge: AED ${car.extra_km_charge}, Deposit: AED ${car.deposit_amount || car['deposit - amount'] || 3000}. ` +
        `Features: ${car.car_features}. Description: ${car.car_description}. ` +
        `Images Available: ${allImages.length} images. URLs: ${allImages.join(', ')}`;
      }).join('\n');
      
      dynamicInstruction = dynamicInstruction.replace(
        '${KNOWLEDGE_BANK}',
        `REAL-TIME FLEET DATA (USE THIS AS SINGLE SOURCE OF TRUTH):\n${fleetString}\n\n${knowledgeBankContent}`
      );
    } else {
      dynamicInstruction = dynamicInstruction.replace('${KNOWLEDGE_BANK}', knowledgeBankContent);
    }

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: messages.map(m => {
        let text = m.text;
        if (m.media_url) {
          const type = m.media_type?.split('/')[0]?.toUpperCase() || 'MEDIA';
          text = `[USER SENT A ${type}] ${text || ''}`;
        }
        return {
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text }]
        };
      }),
      config: {
        systemInstruction: { parts: [{ text: dynamicInstruction }] },
        temperature: 0.7,
        tools: [{ functionDeclarations: [notifyManagerTool, sendCarImagesTool] }],
      },
    });

    if (!response || !response.candidates || response.candidates.length === 0) {
      console.error("[AI-DEBUG] Empty response from Gemini API");
      throw new Error("Empty response from Gemini API");
    }

    // Check for function calls
    const functionCalls = response.functionCalls;
    if (functionCalls && functionCalls.length > 0) {
      const call = functionCalls[0];
      if (call.name === "notify_manager") {
        console.log("Escalating to manager:", call.args);
        return {
          text: "I will check with manager and get back to you 😊",
          escalated: true,
          escalationArgs: call.args
        };
      }
      if (call.name === "send_car_images") {
        console.log("AI requested to send images:", call.args);
        return {
          text: "Sure! I'm sending you the images of the car right now. 📸",
          sendImages: true,
          imageArgs: call.args
        };
      }
    }

    return {
      text: response.text || "I'm sorry, I couldn't process that request.",
      escalated: false
    };
  } catch (error) {
    console.error("Gemini Error:", error);
    return {
      text: "I'm sorry, I'm having a bit of trouble connecting to our system right now. Please try again in a moment! 😊",
      escalated: false
    };
  }
}
