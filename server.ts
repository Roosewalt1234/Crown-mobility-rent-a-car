import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { initDb, query } from "./src/lib/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const port = process.env.PORT || 3000;
  const isProduction = process.env.NODE_ENV === "production";

  app.use(express.json());

  // Initialize Database
  await initDb();

  // API Routes
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
      const { chat_id, body, direction, is_ai_reply, contact_name, contact_phone } = req.body;
      
      // Upsert contact
      await query(
        `INSERT INTO contacts (chat_id, contact_name, contact_phone, last_message_preview, last_message_at)
         VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
         ON CONFLICT (chat_id) DO UPDATE SET
         last_message_preview = $4,
         last_message_at = CURRENT_TIMESTAMP,
         unread_count = CASE WHEN $5 = 'incoming' THEN contacts.unread_count + 1 ELSE contacts.unread_count END`,
        [chat_id, contact_name || 'Unknown', contact_phone || 'Unknown', body, direction]
      );

      // Insert message
      const result = await query(
        "INSERT INTO messages (chat_id, body, direction, is_ai_reply) VALUES ($1, $2, $3, $4) RETURNING *",
        [chat_id, body, direction, is_ai_reply]
      );
      
      res.json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal server error" });
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
