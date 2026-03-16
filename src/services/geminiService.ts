import { GoogleGenAI, Type } from "@google/genai";
import { Message } from "../types";
import { SYSTEM_INSTRUCTION } from "../constants/aiConfig";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

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

export async function chatWithAI(messages: Message[]) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: messages.map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }]
      })),
      config: {
        systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
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
