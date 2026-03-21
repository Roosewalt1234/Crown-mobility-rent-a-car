import { query } from "../lib/db.ts";
import { wahaService } from "./wahaService.ts";
import { chatWithAI } from "./geminiService.ts";
import { fleetService } from "./fleetService.ts";

export const heartbeatService = {
  async checkDeadConversations() {
    try {
      console.log("[HEARTBEAT] Checking for dead conversations...");
      
      // Find conversations that have been silent for > 15 minutes
      // and haven't been revived for the current silence
      // and are not in human takeover mode
      const result = await query(`
        SELECT chat_id, last_message_at, revive_sent_at 
        FROM contacts 
        WHERE human_takeover = false 
        AND last_message_at < NOW() - INTERVAL '15 minutes'
        AND (revive_sent_at IS NULL OR revive_sent_at < last_message_at)
        LIMIT 10
      `);

      for (const contact of result.rows) {
        await this.reviveConversation(contact.chat_id);
      }
    } catch (err) {
      console.error("[HEARTBEAT ERROR]", err);
    }
  },

  async reviveConversation(chatId: string) {
    try {
      console.log(`[HEARTBEAT] Reviving conversation for ${chatId}`);

      // 1. Get history for context
      const historyResult = await query(
        "SELECT body, direction, is_ai_reply, media_url, media_type FROM messages WHERE chat_id = $1 ORDER BY created_at DESC LIMIT 5",
        [chatId]
      );
      
      const history = historyResult.rows.reverse().map(m => ({
        text: m.body,
        role: m.direction === 'incoming' ? 'user' : 'model',
        media_url: m.media_url,
        media_type: m.media_type
      }));

      // 2. Get fleet and KB
      const fleetData = await fleetService.getFleetForAI();
      const kbResult = await query("SELECT * FROM knowledge_base WHERE is_active = true");
      const kbData = kbResult.rows;

      // 3. Generate AI revive message with user's suggested nudge
      const revivePrompt = `
        You are Sophie from Crescent Mobility. 
        The customer has stopped replying for more than 15 minutes. 
        Your goal is to politely revive the conversation.
        
        USER SUGGESTION FOR NUDGE: "Hello Sir, Are you still interested? We can also offer other cars if your budget is less."
        
        Use the suggestion above as a base, but make it natural and friendly. 
        Mention a car if relevant from history.
        Keep it very short (under 25 words). Use emojis.
      `;

      const aiResponse = await chatWithAI(
        [...history as any, { role: 'user', text: revivePrompt }], 
        fleetData,
        kbData
      );

      if (aiResponse && aiResponse.text) {
        // 4. Send via WAHA
        await wahaService.sendMessage(chatId, aiResponse.text);

        // 5. Save to DB
        await query(
          "INSERT INTO messages (chat_id, body, direction, is_ai_reply) VALUES ($1, $2, $3, $4)",
          [chatId, aiResponse.text, 'outgoing', true]
        );

        // 6. Update contact (including revive_sent_at)
        await query(
          "UPDATE contacts SET last_message_preview = $1, last_message_at = CURRENT_TIMESTAMP, revive_sent_at = CURRENT_TIMESTAMP WHERE chat_id = $2",
          [aiResponse.text, chatId]
        );
        
        console.log(`[HEARTBEAT] Revive message sent to ${chatId}`);
      }
    } catch (err) {
      console.error(`[HEARTBEAT] Error reviving ${chatId}:`, err);
    }
  },

  start() {
    // Run every 5 minutes
    setInterval(() => {
      this.checkDeadConversations();
    }, 5 * 60 * 1000);
    
    // Run once on startup after a short delay
    setTimeout(() => {
      this.checkDeadConversations();
    }, 10000);
    
    console.log("[HEARTBEAT] Service started (5m interval)");
  }
};
