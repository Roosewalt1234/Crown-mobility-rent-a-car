import { query } from "../lib/db.ts";
import { wahaService } from "./wahaService.ts";
import { chatWithAI } from "./geminiService.ts";
import { fleetService } from "./fleetService.ts";

export const heartbeatService = {
  async checkDeadConversations() {
    try {
      console.log("[HEARTBEAT] Checking for dead conversations...");
      
      // 0. Check global auto-reply setting
      const settingsResult = await query("SELECT key, value FROM settings WHERE key IN ('general_config', 'dnd_config')");
      const settings: Record<string, any> = {};
      settingsResult.rows.forEach(r => settings[r.key] = r.value);

      const generalConfig = settings['general_config'];
      const dndConfig = settings['dnd_config'];

      if (generalConfig && (generalConfig.autoReply === false || generalConfig.autoReply === 'false')) {
        console.log("[HEARTBEAT] Auto-reply is globally disabled. Skipping revival.");
        return;
      }

      // 0.1 Check DND
      if (dndConfig?.enabled) {
        const now = new Date();
        // Dubai Time (UTC+4)
        const dubaiTime = new Date(now.getTime() + (4 * 60 * 60 * 1000));
        const currentHour = dubaiTime.getUTCHours();
        const currentMinute = dubaiTime.getUTCMinutes();
        const currentTimeStr = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
        
        const [startH, startM] = dndConfig.start.split(':').map(Number);
        const [endH, endM] = dndConfig.end.split(':').map(Number);
        
        const isDnd = (startH < endH) 
          ? (currentTimeStr >= dndConfig.start && currentTimeStr <= dndConfig.end)
          : (currentTimeStr >= dndConfig.start || currentTimeStr <= dndConfig.end);
          
        if (isDnd) {
          console.log(`[HEARTBEAT] DND is active (${currentTimeStr}). Skipping revival.`);
          return;
        }
      }

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

      // 0. Check if human takeover is active
      const initialContactResult = await query("SELECT human_takeover FROM contacts WHERE chat_id = $1", [chatId]);
      const initialContact = initialContactResult.rows[0];
      
      // CRITICAL: Ensure we treat human_takeover as a boolean
      let wasHumanTakeover = false;
      if (initialContact) {
        wasHumanTakeover = initialContact.human_takeover === true || String(initialContact.human_takeover) === 'true';
      }

      if (wasHumanTakeover) {
        console.log(`[HEARTBEAT] Contact ${chatId} is in manual mode. Skipping revival.`);
        return;
      }

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
      const fleetResult = await query("SELECT * FROM fleet_stock ORDER BY created_at DESC");
      const fleetData = fleetResult.rows;
      const kbResult = await query("SELECT * FROM knowledge_base WHERE is_active = true");
      const kbData = kbResult.rows;

      // 3. Generate AI revive message with user's suggested nudge
      const revivePrompt = `
        You are Sophie from Crescent Mobility. 
        The customer has stopped replying for more than 15 minutes. 
        Your goal is to politely revive the conversation.
        
        USER SUGGESTION FOR NUDGE: "Hello, Are you still interested? We can also offer other cars if your budget is less."
        
        Use the suggestion above as a base, but make it natural and friendly. 
        Mention a car if relevant from history.
        Keep it very short (under 25 words). Use emojis.
      `;

      const aiResponse = await chatWithAI(
        [...history as any, { role: 'user', text: revivePrompt }], 
        fleetData,
        kbData
      );

      // If AI failed (returned fallback message), don't send it to customer
      if (aiResponse && aiResponse.text && aiResponse.text.includes("trouble connecting")) {
        console.warn(`[HEARTBEAT] Skipping revival for ${chatId} due to AI connection error.`);
        return;
      }

      if (aiResponse && aiResponse.text) {
        // If AI escalated during revival, set human_takeover to true
        if (aiResponse.escalated) {
          console.log(`[HEARTBEAT] AI requested escalation for ${chatId}. Setting human_takeover = true and manager_notification = true`);
          await query("UPDATE contacts SET human_takeover = true, manager_notification = true WHERE chat_id = $1", [chatId]);

          // Notify Manager (Only once)
          const contactResult = await query("SELECT contact_name, contact_phone, manager_notified_at, human_takeover FROM contacts WHERE chat_id = $1", [chatId]);
          const contact = contactResult.rows[0];

          // Only notify if not already in manual mode (before we just set it)
          // and manager hasn't been notified yet
          if (contact && !contact.manager_notified_at && !wasHumanTakeover) {
            const generalConfigResult = await query("SELECT value FROM settings WHERE key = 'general_config'");
            const generalConfig = generalConfigResult.rows[0]?.value;
            const managerId = generalConfig?.escalationId || "971507172790@c.us";

            if (managerId) {
              const notificationMsg = `🚨 This client Need your Attention (Revival Escalation)\n\nContact name: ${contact.contact_name}\nContact number: ${contact.contact_phone}\nReason: ${aiResponse.escalationArgs?.reason || 'AI Revival Escalation'}`;
              
              console.log(`[HEARTBEAT] Notifying manager ${managerId} about ${chatId}`);
              await wahaService.sendMessage(managerId, notificationMsg);
              
              // Update manager_notified_at
              await query("UPDATE contacts SET manager_notified_at = CURRENT_TIMESTAMP WHERE chat_id = $1", [chatId]);
            }
          }
        }

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
