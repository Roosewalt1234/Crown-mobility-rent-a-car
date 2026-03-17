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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const port = process.env.PORT || 3000;
  const isProduction = process.env.NODE_ENV === "production";

  app.use(express.json());

  // Initialize Database
  initDb().then(() => {
    console.log("Database init process finished");
  }).catch(err => {
    console.error("Database init process failed", err);
  });

  // API Routes
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

  app.get("/api/contacts", async (req, res) => {
    try {
      const result = await query("SELECT * FROM contacts ORDER BY last_message_at DESC");
      res.json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/messages/:chatId", async (req, res) => {
    try {
      const { chatId } = req.params;
      const result = await query(
        "SELECT * FROM messages WHERE chat_id = $1 ORDER BY created_at ASC",
        [chatId]
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

      const { 
        chat_id: raw_chat_id, 
        body: raw_body, 
        direction: raw_direction, 
        is_ai_reply, 
        contact_name, 
        contact_phone,
        // Support for common webhook formats (WAHA/n8n)
        sender_number,
        message,
        from
      } = req.body;

      const chat_id = raw_chat_id || sender_number || from;
      const body = raw_body || message;
      const direction = raw_direction || 'incoming';

      console.log(`[API] Saving message for chat_id: ${chat_id}, direction: ${direction}`);
      
      if (!chat_id) {
        console.error("[API] Error: chat_id is missing in payload:", req.body);
        return res.status(400).json({ error: "chat_id is missing" });
      }

      if (!body) {
        console.error("[API] Error: body/message is missing in payload:", req.body);
        return res.status(400).json({ error: "message body is missing" });
      }

      // Upsert contact
      await query(
        `INSERT INTO contacts (chat_id, contact_name, contact_phone, last_message_preview, last_message_at)
         VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
         ON CONFLICT (chat_id) DO UPDATE SET
         last_message_preview = $4,
         last_message_at = CURRENT_TIMESTAMP,
         unread_count = CASE WHEN $5 = 'incoming' THEN contacts.unread_count + 1 ELSE contacts.unread_count END`,
        [chat_id, contact_name || 'Unknown', contact_phone || chat_id || 'Unknown', body, direction]
      );

      // Insert message
      const result = await query(
        "INSERT INTO messages (chat_id, body, direction, is_ai_reply) VALUES ($1, $2, $3, $4) RETURNING *",
        [chat_id, body, direction, is_ai_reply === true]
      );
      
      const savedMessage = result.rows[0];
      console.log(`[API] Message saved successfully: ${savedMessage.id}`);

      // Send response to caller immediately to prevent timeouts
      res.json(savedMessage);

      // --- AI Auto-Reply Logic (Background) ---
      if (direction === 'incoming' && !is_ai_reply) {
        // Run AI logic in background without awaiting it for the HTTP response
        (async () => {
          try {
            // 1. Check if human takeover is active
            const contactResult = await query("SELECT human_takeover FROM contacts WHERE chat_id = $1", [chat_id]);
            const isHumanTakeover = contactResult.rows[0]?.human_takeover || false;

            if (!isHumanTakeover) {
              console.log(`[AI] Triggering auto-reply for ${chat_id}`);
              
              // 2. Get context (last 10 messages)
              const historyResult = await query(
                "SELECT body, direction, is_ai_reply FROM messages WHERE chat_id = $1 ORDER BY created_at DESC LIMIT 10",
                [chat_id]
              );
              
              const history = historyResult.rows.reverse().map(m => ({
                text: m.body,
                role: m.direction === 'incoming' ? 'user' : 'model'
              }));

              // 3. Get fleet data
              const fleetData = await fleetService.getFleetForAI();

              // 4. Generate AI response
              const aiResponse = await chatWithAI(history as any, fleetData);

              if (aiResponse && aiResponse.text) {
                console.log(`[AI] Generated response: ${aiResponse.text.substring(0, 50)}...`);

                // 5. Save AI response to DB
                await query(
                  "INSERT INTO messages (chat_id, body, direction, is_ai_reply) VALUES ($1, $2, $3, $4)",
                  [chat_id, aiResponse.text, 'outgoing', true]
                );

                // 6. Update contact preview
                await query(
                  "UPDATE contacts SET last_message_preview = $1, last_message_at = CURRENT_TIMESTAMP WHERE chat_id = $2",
                  [aiResponse.text, chat_id]
                );

                // 7. Send via WAHA
                await wahaService.sendMessage(chat_id, aiResponse.text);
              }
            } else {
              console.log(`[AI] Human takeover active for ${chat_id}, skipping auto-reply.`);
            }
          } catch (aiErr) {
            console.error("[AI] Error in background auto-reply:", aiErr);
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

  app.patch("/api/contacts/:chatId", async (req, res) => {
    try {
      const { chatId } = req.params;
      const { human_takeover, status, unread_count } = req.body;
      
      let updateFields = [];
      let values = [];
      let i = 1;

      if (human_takeover !== undefined) {
        updateFields.push(`human_takeover = $${i++}`);
        values.push(human_takeover);
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

      values.push(chatId);
      const q = `UPDATE contacts SET ${updateFields.join(", ")} WHERE chat_id = $${i} RETURNING *`;
      const result = await query(q, values);
      res.json(result.rows[0]);
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
    console.log(`Server started on http://localhost:${port}`);
  });
}

startServer().catch(err => {
  console.error(err);
  process.exit(1);
});
