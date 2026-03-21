import "dotenv/config";
import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { initDb, query } from "./src/lib/db.ts";
import { chatWithAI } from "./src/services/geminiService.ts";
import { fleetService } from "./src/services/fleetService.ts";
import { wahaService } from "./src/services/wahaService.ts";
import { learningService } from "./src/services/learningService.ts";
import { heartbeatService } from "./src/services/heartbeatService.ts";
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function normalizeChatId(id: string): string {
  if (!id) return "";
  // Remove +, spaces, and ensure @c.us suffix if not present
  let clean = id.replace(/\+/g, "").replace(/\s/g, "");
  if (!clean.includes("@")) {
    clean = `${clean}@c.us`;
  }
  return clean;
}

async function startServer() {
  const app = express();
  const port = process.env.PORT || 3000;
  const isProduction = process.env.NODE_ENV === "production";

  app.use(express.json());

  console.log(`[STARTUP] WAHA_URL: ${process.env.WAHA_URL ? 'SET' : 'MISSING'}`);
  console.log(`[STARTUP] WAHA_SESSION: ${process.env.WAHA_SESSION || 'default'}`);

  // Initialize Database
  initDb().then(() => {
    console.log("Database init process finished");
  }).catch(err => {
    console.error("Database init process failed", err);
  });

  // API Routes
  app.get("/api/health", async (req, res) => {
    res.json({ 
      status: "ok", 
      env: {
        DATABASE_URL: process.env.DATABASE_URL ? "SET" : "MISSING",
        GEMINI_API_KEY: process.env.GEMINI_API_KEY ? "SET" : "MISSING",
        WAHA_URL: process.env.WAHA_URL ? "SET" : "MISSING",
        WAHA_API_KEY: process.env.WAHA_API_KEY ? "SET" : "MISSING",
        WAHA_SESSION: process.env.WAHA_SESSION || "default",
        NODE_ENV: process.env.NODE_ENV
      }
    });
  });

  app.get("/api/db-check", async (req, res) => {
    try {
      if (!process.env.DATABASE_URL) {
        return res.status(500).json({ status: "error", message: "DATABASE_URL missing" });
      }
      const result = await query("SELECT NOW()");
      const tables = await query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
      `);
      res.json({ 
        status: "connected", 
        time: result.rows[0], 
        tables: tables.rows.map(r => r.table_name) 
      });
    } catch (err) {
      res.status(500).json({ status: "error", message: err instanceof Error ? err.message : String(err) });
    }
  });

  app.get("/api/settings/:key", async (req, res) => {
    try {
      const { key } = req.params;
      const result = await query("SELECT value FROM settings WHERE key = $1", [key]);
      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Setting not found" });
      }
      res.json(result.rows[0].value);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/settings/:key", async (req, res) => {
    try {
      const { key } = req.params;
      const { value } = req.body;
      await query(
        "INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = $2",
        [key, value]
      );
      res.json({ success: true, value });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/migrate", async (req, res) => {
    try {
      const supabaseUrl = process.env.VITE_SUPABASE_URL;
      const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseKey) {
        return res.status(400).json({ error: "Supabase credentials missing" });
      }

      const supabase = createClient(supabaseUrl, supabaseKey);

      // 1. Migrate fleet_stock
      const { data: fleet } = await supabase.from('fleet_stock').select('*');
      if (fleet) {
        for (const item of fleet) {
          await query(
            `INSERT INTO fleet_stock (
              vehicle_id, vehicle_make, vehicle_model, vehicle_year, 
              fleet_type, vehicle_image_url, car_description, 
              day_price, week_price, month_price, 
              milage_limit, extra_km_charge, car_features
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
            ON CONFLICT (vehicle_id) DO UPDATE SET
              vehicle_make = $2, vehicle_model = $3, vehicle_year = $4,
              fleet_type = $5, vehicle_image_url = $6, car_description = $7,
              day_price = $8, week_price = $9, month_price = $10,
              milage_limit = $11, extra_km_charge = $12, car_features = $13`,
            [
              item.vehicle_id, item.vehicle_make, item.vehicle_model, item.vehicle_year, 
              item.fleet_type, item.vehicle_image_url, item.car_description, 
              item.day_price, item.week_price, item.month_price, 
              item.milage_limit, item.extra_km_charge, item.car_features
            ]
          );
        }
      }

      // 2. Migrate contacts
      const { data: contacts } = await supabase.from('contacts').select('*');
      if (contacts) {
        for (const contact of contacts) {
          await query(
            `INSERT INTO contacts (chat_id, contact_name, contact_phone, last_message_preview, last_message_at, unread_count, status, human_takeover)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             ON CONFLICT (chat_id) DO UPDATE SET
             contact_name = $2, contact_phone = $3, last_message_preview = $4, last_message_at = $5, unread_count = $6, status = $7, human_takeover = $8`,
            [
              contact.chat_id, contact.contact_name, contact.contact_phone, 
              contact.last_message_preview, contact.last_message_at, 
              contact.unread_count, contact.status, contact.human_takeover
            ]
          );
        }
      }

      // 3. Migrate messages
      const { data: messages } = await supabase.from('messages').select('*');
      if (messages) {
        for (const msg of messages) {
          await query(
            `INSERT INTO messages (chat_id, body, direction, is_ai_reply, created_at, status)
             VALUES ($1, $2, $3, $4, $5, $6)
             ON CONFLICT DO NOTHING`,
            [msg.chat_id, msg.body, msg.direction, msg.is_ai_reply, msg.created_at, msg.status]
          );
        }
      }

      res.json({ success: true });
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/contacts", async (req, res) => {
    try {
      const result = await query("SELECT * FROM contacts ORDER BY last_message_at DESC");
      res.json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Fleet API
  app.get("/api/fleet", async (req, res) => {
    try {
      const result = await query("SELECT * FROM fleet_stock ORDER BY created_at DESC");
      res.json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/fleet", async (req, res) => {
    try {
      const { 
        vehicle_id, vehicle_make, vehicle_model, vehicle_year, 
        fleet_type, vehicle_image_url, car_description, 
        day_price, week_price, month_price, 
        milage_limit, extra_km_charge, car_features,
        deposit_amount
      } = req.body;
      
      // Handle both column names
      const finalDeposit = deposit_amount ?? req.body['deposit - amount'] ?? 3000;

      const result = await query(
        `INSERT INTO fleet_stock (
          vehicle_id, vehicle_make, vehicle_model, vehicle_year, 
          fleet_type, vehicle_image_url, car_description, 
          day_price, week_price, month_price, 
          milage_limit, extra_km_charge, car_features,
          deposit_amount
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        ON CONFLICT (vehicle_id) DO UPDATE SET
          vehicle_make = $2, vehicle_model = $3, vehicle_year = $4,
          fleet_type = $5, vehicle_image_url = $6, car_description = $7,
          day_price = $8, week_price = $9, month_price = $10,
          milage_limit = $11, extra_km_charge = $12, car_features = $13,
          deposit_amount = $14
        RETURNING *`,
        [
          vehicle_id || `v-${Date.now()}`, vehicle_make, vehicle_model, vehicle_year, 
          fleet_type, vehicle_image_url, car_description, 
          day_price, week_price, month_price, 
          milage_limit, extra_km_charge, car_features,
          finalDeposit
        ]
      );
      res.json(result.rows[0]);
    } catch (err: any) {
      console.error("[API] Error in POST /api/fleet:", err);
      res.status(500).json({ error: err.message || "Internal server error" });
    }
  });

  app.delete("/api/fleet/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await query("DELETE FROM fleet_stock WHERE id = $1 OR vehicle_id = $1", [id]);
      res.json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/messages/:chatId", async (req, res) => {
    try {
      const { chatId } = req.params;
      const normalizedId = normalizeChatId(chatId);
      const result = await query(
        "SELECT * FROM messages WHERE chat_id = $1 ORDER BY created_at ASC",
        [normalizedId]
      );
      res.json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/messages", async (req, res) => {
    try {
      console.log("[API] Received POST /api/messages. Body:", JSON.stringify(req.body));
      
      if (!process.env.DATABASE_URL) {
        console.error("[API] Error: DATABASE_URL is not set");
        return res.status(500).json({ error: "Database configuration missing" });
      }

      // 1. Extract fields, handling potential WAHA nesting
      const event = req.body.event;
      const payload = req.body.payload || req.body;
      
      const raw_chat_id = payload.chat_id || payload.chatId || payload.sender_number || payload.from || payload.to;
      const raw_body = payload.body || payload.message || payload.text;
      const raw_direction = payload.direction;
      const is_ai_reply = req.body.is_ai_reply === true;
      const contact_name = payload.contact_name || payload.sender?.name || payload.pushName;
      const contact_phone = payload.contact_phone || payload.sender?.id || raw_chat_id;

      // 2. Determine direction
      // If direction is explicitly provided (e.g. from dashboard), use it.
      // Otherwise, check WAHA fields: fromMe or event type
      let direction = raw_direction;
      if (!direction) {
        if (event === 'message.sent' || payload.fromMe === true) {
          direction = 'outgoing';
        } else {
          direction = 'incoming';
        }
      }

      // 3. Determine chat_id (the customer's ID)
      // If it's outgoing from the phone, 'to' is the customer.
      // If it's incoming, 'from' is the customer.
      let chat_id_raw = raw_chat_id;
      if (event === 'message.sent' || (direction === 'outgoing' && payload.fromMe === true)) {
        chat_id_raw = payload.to || payload.chatId || raw_chat_id;
      } else if (direction === 'incoming') {
        chat_id_raw = payload.from || payload.chatId || raw_chat_id;
      }
      
      const chat_id = normalizeChatId(chat_id_raw);
      const body = raw_body;
      const has_media = payload.hasMedia || payload.media || !!payload.mediaUrl;
      const media_url = payload.mediaUrl || payload.url;
      const media_type = payload.mediaType || payload.mimetype;

      console.log(`[API] Processing message for chat_id: ${chat_id}, direction: ${direction}, has_media: ${has_media}`);
      
      if (!chat_id) {
        console.error("[API] Error: chat_id is missing in payload:", req.body);
        return res.status(400).json({ error: "chat_id is missing" });
      }

      // If no body and no media, then it's an invalid message
      if (!body && !has_media) {
        console.error("[API] Error: body/message and media are missing in payload:", req.body);
        return res.status(400).json({ error: "message body or media is missing" });
      }

      // 4. Avoid Duplicates
      const recentCheck = await query(
        "SELECT id FROM messages WHERE chat_id = $1 AND (body = $2 OR media_url = $3) AND created_at > NOW() - INTERVAL '10 seconds' LIMIT 1",
        [chat_id, body || '', media_url || '']
      );
      
      if (recentCheck.rows.length > 0) {
        console.log(`[API] Duplicate message detected for ${chat_id}. Skipping save.`);
        return res.json({ success: true, duplicate: true });
      }

      // 5. Upsert contact
      const preview = body || (has_media ? `[${media_type || 'Media'}]` : 'New Message');
      await query(
        `INSERT INTO contacts (chat_id, contact_name, contact_phone, last_message_preview, last_message_at)
         VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
         ON CONFLICT (chat_id) DO UPDATE SET
         last_message_preview = $4,
         last_message_at = CURRENT_TIMESTAMP,
         unread_count = CASE WHEN $5 = 'incoming' THEN contacts.unread_count + 1 ELSE contacts.unread_count END`,
        [chat_id, contact_name || 'Unknown', contact_phone || chat_id || 'Unknown', preview, direction]
      );

      // 6. Insert message
      const result = await query(
        "INSERT INTO messages (chat_id, body, direction, is_ai_reply, media_url, media_type) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
        [chat_id, body, direction, is_ai_reply, media_url, media_type]
      );
      
      const savedMessage = result.rows[0];
      console.log(`[API] Message saved successfully: ${savedMessage.id}`);

      // Send response to caller immediately to prevent timeouts
      res.json(savedMessage);

      // 7. --- Handle Outgoing Human Messages from Dashboard (Send to WhatsApp) ---
      // If it's from the dashboard (raw_direction is set) and not an AI reply, send it.
      // If it's a webhook (event is set), don't send it back to WAHA!
      if (raw_direction === 'outgoing' && !is_ai_reply && !event) {
        console.log(`[API] Dashboard outgoing message detected. Sending to WAHA for ${chat_id}`);
        wahaService.sendMessage(chat_id, body).catch(err => {
          console.error(`[API] Error sending human message to WAHA:`, err);
        });
      }

      // --- Trigger AI Learning Analysis for ANY manual outgoing message ---
      if (direction === 'outgoing' && !is_ai_reply) {
        learningService.analyzeManualChat(chat_id).catch(err => {
          console.error(`[LEARNING] Error analyzing manual chat:`, err);
        });
      }

      // 8. --- AI Auto-Reply Logic (Background) ---
      if (direction === 'incoming' && !is_ai_reply) {
        // Run AI logic in background without awaiting it for the HTTP response
        (async () => {
          try {
            console.log(`[AI-DEBUG] Starting background process for ${chat_id}`);
            
            // 0. Check DND and Global Auto-Reply
            const settingsResult = await query("SELECT key, value FROM settings WHERE key IN ('dnd_config', 'general_config')");
            const settings: any = {};
            settingsResult.rows.forEach(r => settings[r.key] = r.value);
            
            const dndConfig = settings['dnd_config'];
            let generalConfig = settings['general_config'];

            // Parse if it's a string (sometimes happens with JSONB in pg)
            if (typeof generalConfig === 'string') {
              try {
                generalConfig = JSON.parse(generalConfig);
              } catch (e) {
                console.error(`[AI-DEBUG] Failed to parse generalConfig:`, e);
              }
            }

            console.log(`[AI-DEBUG] generalConfig:`, JSON.stringify(generalConfig));

            if (generalConfig && (generalConfig.autoReply === false || generalConfig.autoReply === 'false')) {
              console.log(`[AI-DEBUG] Global Auto-Reply is disabled. Skipping AI.`);
              return;
            }

            // Skip AI for web users on the server side (handled by Chatbot.tsx)
            if (chat_id.startsWith('user_')) {
              console.log(`[AI-DEBUG] Web user message. Skipping server-side AI auto-reply.`);
              return;
            }
            
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
                console.log(`[AI-DEBUG] DND is active (${currentTimeStr}). Skipping AI response.`);
                return;
              }
            }

            // 1. Check if human takeover is active
            const contactResult = await query("SELECT human_takeover, last_message_at FROM contacts WHERE chat_id = $1", [chat_id]);
            const contact = contactResult.rows[0];
            let isHumanTakeover = contact?.human_takeover || false;

            // AUTO-RESET Takeover after 48 hours of inactivity
            if (isHumanTakeover && contact?.last_message_at) {
              const lastMsgTime = new Date(contact.last_message_at).getTime();
              const fortyEightHours = 48 * 60 * 60 * 1000;
              if (Date.now() - lastMsgTime > fortyEightHours) {
                console.log(`[AI-DEBUG] Human takeover expired (48h). Resetting to false.`);
                await query("UPDATE contacts SET human_takeover = false WHERE chat_id = $1", [chat_id]);
                isHumanTakeover = false;
              }
            }

            if (!isHumanTakeover) {
              console.log(`[AI-DEBUG] Human takeover is OFF. Proceeding.`);
              
              // 2. Get context (last 10 messages)
              const historyResult = await query(
                "SELECT body, direction, is_ai_reply, media_url, media_type FROM messages WHERE chat_id = $1 ORDER BY created_at DESC LIMIT 10",
                [chat_id]
              );
              
              const history = historyResult.rows.reverse().map(m => ({
                text: m.body,
                role: m.direction === 'incoming' ? 'user' : 'model',
                media_url: m.media_url,
                media_type: m.media_type
              }));
              console.log(`[AI-DEBUG] Context retrieved: ${history.length} messages.`);

              // 3. Get fleet data directly from Railway DB
              const fleetResult = await query("SELECT * FROM fleet_stock ORDER BY created_at DESC");
              const fleetData = fleetResult.rows;
              console.log(`[AI-DEBUG] Fleet data retrieved from Railway: ${fleetData?.length || 0} cars.`);

              // 4. Get Knowledge Base data
              const kbResult = await query("SELECT * FROM knowledge_base WHERE is_active = true");
              const kbData = kbResult.rows;

              // 5. Generate AI response
              console.log(`[AI-DEBUG] Calling Gemini AI...`);
              const aiResponse = await chatWithAI(history as any, fleetData, kbData);

              // If AI failed (returned fallback message), don't send it automatically
              if (aiResponse && aiResponse.text && aiResponse.text.includes("trouble connecting")) {
                console.warn(`[AI-DEBUG] Skipping auto-reply for ${chat_id} due to AI connection error.`);
                return;
              }

              if (aiResponse && aiResponse.text) {
                console.log(`[AI-DEBUG] AI generated text: ${aiResponse.text.substring(0, 30)}...`);

                // If AI escalated, set human_takeover to true
                if (aiResponse.escalated) {
                  console.log(`[AI-DEBUG] AI requested escalation. Setting human_takeover = true for ${chat_id}`);
                  await query("UPDATE contacts SET human_takeover = true WHERE chat_id = $1", [chat_id]);

                  // Notify Manager (Only once)
                  const contactResult = await query("SELECT contact_name, contact_phone, manager_notified_at FROM contacts WHERE chat_id = $1", [chat_id]);
                  const contact = contactResult.rows[0];

                  if (contact && !contact.manager_notified_at) {
                    const generalConfigResult = await query("SELECT value FROM settings WHERE key = 'general_config'");
                    const generalConfig = generalConfigResult.rows[0]?.value;
                    const managerId = generalConfig?.escalationId || "971507172790@c.us";

                    if (managerId) {
                      const notificationMsg = `🚨 This client Need your Attention\n\nContact name: ${contact.contact_name}\nContact number: ${contact.contact_phone}\nReason: ${aiResponse.escalationArgs?.reason || 'AI Escalation'}`;
                      
                      console.log(`[AI-DEBUG] Notifying manager ${managerId} about ${chat_id}`);
                      await wahaService.sendMessage(managerId, notificationMsg);
                      
                      // Update manager_notified_at
                      await query("UPDATE contacts SET manager_notified_at = CURRENT_TIMESTAMP WHERE chat_id = $1", [chat_id]);
                    }
                  }
                }

                // 5. Save AI response to DB
                await query(
                  "INSERT INTO messages (chat_id, body, direction, is_ai_reply) VALUES ($1, $2, $3, $4)",
                  [chat_id, aiResponse.text, 'outgoing', true]
                );
                console.log(`[AI-DEBUG] AI response saved to database.`);

                // 6. Update contact preview
                await query(
                  "UPDATE contacts SET last_message_preview = $1, last_message_at = CURRENT_TIMESTAMP WHERE chat_id = $2",
                  [aiResponse.text, chat_id]
                );

                // 7. Send via WAHA
                console.log(`[AI-DEBUG] Attempting to send via WAHA to ${chat_id}...`);
                await wahaService.sendMessage(chat_id, aiResponse.text);
              } else {
                console.warn(`[AI-DEBUG] AI failed to generate a response text.`);
              }
            } else {
              console.log(`[AI-DEBUG] Human takeover is ON. Skipping AI.`);
            }
          } catch (aiErr) {
            console.error("[AI-DEBUG] CRITICAL ERROR in background process:", aiErr);
          }
        })();
      }
    } catch (err) {
      console.error("[API] Error saving message:", err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      const errorStack = err instanceof Error ? err.stack : undefined;
      
      res.status(500).json({ 
        error: "Internal server error", 
        details: errorMessage || "Unknown error",
        stack: process.env.NODE_ENV !== 'production' ? errorStack : undefined
      });
    }
  });

  app.post("/api/revive/:chatId", async (req, res) => {
    try {
      const { chatId } = req.params;
      const normalizedId = normalizeChatId(chatId);
      
      // 1. Get history
      const historyResult = await query(
        "SELECT body, direction, is_ai_reply, media_url, media_type FROM messages WHERE chat_id = $1 ORDER BY created_at DESC LIMIT 10",
        [normalizedId]
      );
      
      const history = historyResult.rows.reverse().map(m => ({
        text: m.body,
        role: m.direction === 'incoming' ? 'user' : 'model',
        media_url: m.media_url,
        media_type: m.media_type
      }));

      // 2. Get fleet data and Knowledge Base
      const fleetData = await fleetService.getFleetForAI();
      const kbResult = await query("SELECT * FROM knowledge_base WHERE is_active = true");
      const kbData = kbResult.rows;

      // 3. Generate revive message
      const revivePrompt = `
        You are Sophie from Crescent Mobility. 
        The customer has stopped replying. 
        Based on the conversation history and our fleet, generate a SHORT, friendly, and personalized nudge to revive the conversation.
        Maybe mention a car they liked or a special Ramadan offer.
        Keep it under 30 words. Use emojis.
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

        // 6. Update contact
        await query(
          "UPDATE contacts SET last_message_preview = $1, last_message_at = CURRENT_TIMESTAMP WHERE chat_id = $2",
          [aiResponse.text, chatId]
        );

        res.json({ success: true, message: aiResponse.text });
      } else {
        res.status(500).json({ error: "Failed to generate revive message" });
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.patch("/api/contacts/:chatId", async (req, res) => {
    try {
      const { chatId } = req.params;
      const normalizedId = normalizeChatId(chatId);
      const { human_takeover, status, unread_count } = req.body;
      
      let updateFields = [];
      let values = [];
      let i = 1;

      if (human_takeover !== undefined) {
        updateFields.push(`human_takeover = $${i++}`);
        values.push(human_takeover);
        // Reset manager_notified_at if switching to AI mode
        if (human_takeover === false) {
          updateFields.push(`manager_notified_at = NULL`);
        }
      }
      if (status !== undefined) {
        updateFields.push(`status = $${i++}`);
        values.push(status);
      }
      if (unread_count !== undefined) {
        updateFields.push(`unread_count = $${i++}`);
        values.push(unread_count);
      }

      if (updateFields.length === 0) {
        return res.status(400).json({ error: "No fields to update" });
      }

      values.push(normalizedId);
      const q = `UPDATE contacts SET ${updateFields.join(", ")} WHERE chat_id = $${i} RETURNING *`;
      const result = await query(q, values);
      res.json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Learning Suggestions API
  app.get("/api/learning-suggestions", async (req, res) => {
    try {
      const result = await query("SELECT * FROM learning_suggestions WHERE status = 'pending' ORDER BY created_at DESC");
      res.json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/learning-suggestions/:id/approve", async (req, res) => {
    try {
      const { id } = req.params;
      const suggestion = await query("SELECT * FROM learning_suggestions WHERE id = $1", [id]);
      if (suggestion.rows.length === 0) return res.status(404).json({ error: "Suggestion not found" });

      const s = suggestion.rows[0];
      // 1. Add to knowledge_base
      await query(
        "INSERT INTO knowledge_base (question, answer, category, keywords) VALUES ($1, $2, $3, $4)",
        [s.question, s.answer, s.category, s.keywords]
      );
      // 2. Mark as approved
      await query("UPDATE learning_suggestions SET status = 'approved' WHERE id = $1", [id]);
      
      res.json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/learning-suggestions/:id/reject", async (req, res) => {
    try {
      const { id } = req.params;
      await query("UPDATE learning_suggestions SET status = 'rejected' WHERE id = $1", [id]);
      res.json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Knowledge Base API
  app.get("/api/knowledge-base", async (req, res) => {
    try {
      const result = await query("SELECT * FROM knowledge_base ORDER BY created_at DESC");
      res.json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/knowledge-base", async (req, res) => {
    try {
      const { question, answer, category, keywords } = req.body;
      const result = await query(
        "INSERT INTO knowledge_base (question, answer, category, keywords) VALUES ($1, $2, $3, $4) RETURNING *",
        [question, answer, category, keywords]
      );
      res.json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.patch("/api/knowledge-base/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { question, answer, category, keywords, is_active } = req.body;
      const result = await query(
        "UPDATE knowledge_base SET question = $1, answer = $2, category = $3, keywords = $4, is_active = $5 WHERE id = $6 RETURNING *",
        [question, answer, category, keywords, is_active, id]
      );
      res.json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/knowledge-base/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await query("DELETE FROM knowledge_base WHERE id = $1", [id]);
      res.json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(process.cwd(), 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(process.cwd(), 'dist', 'index.html'));
    });
  }

  app.listen(Number(port), '0.0.0.0', () => {
    console.log(`[VERSION] Server v1.0.3 started on http://localhost:${port}`);
    
    // Start Heartbeat Service
    heartbeatService.start();
  });
}

startServer().catch(err => {
  console.error(err);
  process.exit(1);
});
