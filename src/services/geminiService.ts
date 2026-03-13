import { GoogleGenAI } from "@google/genai";
import { Message } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

const SYSTEM_INSTRUCTION = `
You are the AI assistant for Crown Mobility Rent A Car, a premium car rental company in the UAE.
Your goal is to help users find the perfect car, explain rental terms, and provide information about the fleet.
Be professional, luxury-oriented, and helpful.

Fleet Information:
- Luxury: Rolls Royce Cullinan, Range Rover Vogue, Tesla Model S Plaid.
- Sports: Lamborghini Huracan, Ferrari F8 Tributo.
- SUV: Mercedes G63 AMG.

Rental Terms:
- Minimum age: 21 for economy, 25 for luxury/sports.
- Documents: Passport, Driving License, International Driving Permit (if applicable).
- Security Deposit: Varies by car (AED 2000 - AED 10000).
- Locations: Dubai, Abu Dhabi, Sharjah.

Keep responses concise and elegant.
`;

export async function chatWithAI(messages: Message[]) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      })),
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
      },
    });

    return response.text || "I'm sorry, I couldn't process that request.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "I'm having trouble connecting right now. Please try again later.";
  }
}
