import { GoogleGenAI, Type, Modality } from "@google/genai";
import { Message } from "../types";
import { SYSTEM_INSTRUCTION, KNOWLEDGE_BANK } from "../constants/aiConfig";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function generateSpeech(text: string, language: string = 'English'): Promise<string | null> {
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

export async function chatWithAI(messages: Message[], fleetData?: any[], language: string = 'English') {
  try {
    let dynamicInstruction = SYSTEM_INSTRUCTION;
    
    // Add language instruction
    dynamicInstruction += `\n\nCRITICAL: YOU MUST RESPOND ONLY IN ${language.toUpperCase()}. Even if the user speaks another language, your reply must be in ${language}.`;

    if (fleetData && fleetData.length > 0) {
      const fleetString = fleetData.map(car => 
        `- ${car.vehicle_make} ${car.vehicle_model} (${car.vehicle_year}): ` +
        `Price: AED ${car.day_price}/day, AED ${car.week_price}/week, AED ${car.month_price}/month. ` +
        `Type: ${car.fleet_type}, Color: ${car.vehicle_color}, Mileage Limit: ${car.milage_limit}km, ` +
        `Extra KM: AED ${car.extra_km_charge}, Deposit: AED ${car.deposit_amount || car['deposit - amount'] || 3000}. ` +
        `Features: ${car.car_features}. Description: ${car.car_description}`
      ).join('\n');
      
      dynamicInstruction = dynamicInstruction.replace(
        '${KNOWLEDGE_BANK}',
        `REAL-TIME FLEET DATA (USE THIS AS SINGLE SOURCE OF TRUTH):\n${fleetString}\n\n${KNOWLEDGE_BANK}`
      );
    }

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: messages.map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }]
      })),
      config: {
        systemInstruction: { parts: [{ text: dynamicInstruction }] },
        temperature: 0.7,
        tools: [{ functionDeclarations: [notifyManagerTool] }],
      },
    });

    // Check for function calls
    const functionCalls = response.functionCalls;
    if (functionCalls && functionCalls.length > 0) {
      const call = functionCalls[0];
      if (call.name === "notify_manager") {
        console.log("Escalating to manager:", call.args);
        return {
          text: "I will check with manager and get back to you within 5 mnts. 😊",
          escalated: true,
          escalationArgs: call.args
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
      text: "I'm having trouble connecting right now. Please try again later.",
      escalated: false
    };
  }
}
