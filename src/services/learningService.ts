import { query } from "../lib/db.ts";
import { GoogleGenAI, Type } from "@google/genai";

const getAI = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("[AI-DEBUG] GEMINI_API_KEY is not set in process.env. Learning features will fail.");
  }
  return new GoogleGenAI({ apiKey: apiKey || "" });
};

export const learningService = {
  async analyzeManualChat(chatId: string) {
    const ai = getAI();
    try {
      // 1. Get recent messages
      const messagesResult = await query(
        "SELECT body, direction, is_ai_reply FROM messages WHERE chat_id = $1 ORDER BY created_at DESC LIMIT 20",
        [chatId]
      );
      const messages = messagesResult.rows.reverse();

      // 2. Find manual replies
      const manualReplies = messages.filter(m => m.direction === 'outgoing' && !m.is_ai_reply);
      if (manualReplies.length === 0) return;

      // 3. Use Gemini to extract knowledge
      const prompt = `
        Analyze the following chat history between a customer and a car rental manager.
        The manager (model) is replying manually because the AI bot couldn't handle it or was paused.
        
        Identify if the manager provided a specific piece of information (a fact, a policy, a price, a requirement) 
        that would be useful to add to the AI's Knowledge Bank.
        
        If you find something, extract it as a Question-Answer pair.
        The question should be what a customer would typically ask.
        The answer should be the professional response provided by the manager.
        Also suggest a category (e.g., Pricing, Policy, Requirements, Fleet, Support) and 3-5 keywords.
        
        Chat History:
        ${messages.map(m => `${m.direction === 'incoming' ? 'Customer' : 'Manager'}: ${m.body}`).join('\n')}
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              hasSuggestion: { type: Type.BOOLEAN },
              suggestion: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  answer: { type: Type.STRING },
                  category: { type: Type.STRING },
                  keywords: { type: Type.ARRAY, items: { type: Type.STRING } },
                  confidence: { type: Type.NUMBER, description: "A value between 0 and 1 indicating how confident you are that this is a good knowledge base entry." }
                }
              }
            }
          }
        }
      });

      const result = JSON.parse(response.text);

      if (result.hasSuggestion && result.suggestion) {
        // 4. Check if this suggestion already exists (simple check by question)
        const existing = await query(
          "SELECT id FROM learning_suggestions WHERE question = $1 AND chat_id = $2 AND status = 'pending'",
          [result.suggestion.question, chatId]
        );

        if (existing.rows.length === 0) {
          await query(
            "INSERT INTO learning_suggestions (chat_id, question, answer, category, keywords, confidence) VALUES ($1, $2, $3, $4, $5, $6)",
            [
              chatId,
              result.suggestion.question,
              result.suggestion.answer,
              result.suggestion.category,
              result.suggestion.keywords,
              result.suggestion.confidence || 0.8
            ]
          );
          console.log(`[LEARNING] New suggestion generated for chat ${chatId}`);
        }
      }
    } catch (err) {
      console.error("[LEARNING ERROR]", err);
    }
  }
};
