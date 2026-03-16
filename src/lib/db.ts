import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

export const query = (text: string, params?: any[]) => pool.query(text, params);

export const initDb = async () => {
  if (!process.env.DATABASE_URL) {
    console.warn('DATABASE_URL not found. Skipping database initialization.');
    return;
  }

  try {
    await query(`
      CREATE TABLE IF NOT EXISTS contacts (
        id SERIAL PRIMARY KEY,
        chat_id TEXT UNIQUE NOT NULL,
        contact_name TEXT NOT NULL,
        contact_phone TEXT NOT NULL,
        last_message_preview TEXT,
        last_message_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        unread_count INTEGER DEFAULT 0,
        status TEXT DEFAULT 'new',
        human_takeover BOOLEAN DEFAULT FALSE
      );

      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        chat_id TEXT NOT NULL REFERENCES contacts(chat_id) ON DELETE CASCADE,
        body TEXT NOT NULL,
        direction TEXT NOT NULL,
        is_ai_reply BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        status TEXT DEFAULT 'sent'
      );
    `);
    console.log('Database initialized successfully');
  } catch (err) {
    console.error('Error initializing database:', err);
  }
};
