import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // Force SSL for Railway
});

export const query = (text: string, params?: any[]) => pool.query(text, params);

export const initDb = async () => {
  console.log('Attempting to initialize database...');
  if (!process.env.DATABASE_URL) {
    console.error('CRITICAL: DATABASE_URL not found in environment variables.');
    return;
  }

  try {
    // Test connection first
    const testResult = await query('SELECT NOW()');
    console.log('Database connection test successful:', testResult.rows[0]);

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
    `);
    
    await query(`
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
    console.log('Database tables verified/created successfully');
  } catch (err) {
    console.error('DATABASE INITIALIZATION ERROR:', err);
  }
};
