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
        human_takeover BOOLEAN DEFAULT FALSE,
        is_hot BOOLEAN DEFAULT FALSE,
        revive_sent_at TIMESTAMP WITH TIME ZONE,
        manager_notified_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Migration: Add columns to contacts if they don't exist
    await query(`
      ALTER TABLE contacts ADD COLUMN IF NOT EXISTS is_hot BOOLEAN DEFAULT FALSE;
      ALTER TABLE contacts ADD COLUMN IF NOT EXISTS revive_sent_at TIMESTAMP WITH TIME ZONE;
      ALTER TABLE contacts ADD COLUMN IF NOT EXISTS manager_notified_at TIMESTAMP WITH TIME ZONE;
      ALTER TABLE contacts ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
    `).catch(() => {});

    await query(`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        chat_id TEXT NOT NULL REFERENCES contacts(chat_id) ON DELETE CASCADE,
        body TEXT,
        direction TEXT NOT NULL,
        is_ai_reply BOOLEAN DEFAULT FALSE,
        media_url TEXT,
        media_type TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        status TEXT DEFAULT 'sent'
      );
    `);

    // Migration: Add media columns if they don't exist
    await query(`
      ALTER TABLE messages ADD COLUMN IF NOT EXISTS media_url TEXT;
      ALTER TABLE messages ADD COLUMN IF NOT EXISTS media_type TEXT;
      ALTER TABLE messages ALTER COLUMN body DROP NOT NULL;
    `).catch(() => {});

    await query(`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value JSONB NOT NULL
      );
    `);

    // Initialize default settings if not exists
    await query(`
      INSERT INTO settings (key, value)
      VALUES ('dnd_config', '{"enabled": true, "start": "23:00", "end": "07:00"}')
      ON CONFLICT (key) DO NOTHING;
    `);

    await query(`
      INSERT INTO settings (key, value)
      VALUES ('general_config', '{"wahaUrl": "", "wahaKey": "", "sessionName": "default", "escalationId": "971507172790@c.us", "autoReply": true, "notifications": true}')
      ON CONFLICT (key) DO NOTHING;
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS fleet_stock (
        id SERIAL PRIMARY KEY,
        vehicle_id TEXT UNIQUE NOT NULL,
        vehicle_make TEXT NOT NULL,
        vehicle_model TEXT NOT NULL,
        vehicle_year TEXT NOT NULL,
        fleet_type TEXT,
        vehicle_image_url TEXT,
        vehicle_images JSONB DEFAULT '[]',
        car_description TEXT,
        special_day_price NUMERIC,
        daily_price NUMERIC,
        week_price NUMERIC,
        month_price NUMERIC,
        milage_limit NUMERIC,
        extra_km_charge NUMERIC,
        car_features TEXT,
        deposit_amount NUMERIC,
        offer BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Migration: Add vehicle_images column if it doesn't exist
    await query(`
      ALTER TABLE fleet_stock ADD COLUMN IF NOT EXISTS vehicle_images JSONB DEFAULT '[]';
      ALTER TABLE fleet_stock ADD COLUMN IF NOT EXISTS week_price NUMERIC;
      ALTER TABLE fleet_stock ADD COLUMN IF NOT EXISTS month_price NUMERIC;
      ALTER TABLE fleet_stock ADD COLUMN IF NOT EXISTS daily_price NUMERIC;
      ALTER TABLE fleet_stock ADD COLUMN IF NOT EXISTS offer BOOLEAN DEFAULT FALSE;
      ALTER TABLE fleet_stock ADD COLUMN IF NOT EXISTS offer_name TEXT;
      
      -- Rename day_price to special_day_price if it exists
      DO $$ 
      BEGIN 
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='fleet_stock' AND column_name='day_price') THEN
          ALTER TABLE fleet_stock RENAME COLUMN day_price TO special_day_price;
        ELSIF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='fleet_stock' AND column_name='special_day_price') THEN
          ALTER TABLE fleet_stock ADD COLUMN special_day_price NUMERIC;
        END IF;
      END $$;
    `).catch(() => {});

    await query(`
      CREATE TABLE IF NOT EXISTS learning_suggestions (
        id SERIAL PRIMARY KEY,
        chat_id TEXT NOT NULL REFERENCES contacts(chat_id) ON DELETE CASCADE,
        question TEXT NOT NULL,
        answer TEXT NOT NULL,
        category TEXT DEFAULT 'Uncategorized',
        keywords TEXT[],
        confidence FLOAT DEFAULT 0.0,
        status TEXT DEFAULT 'pending',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    await query(`
      CREATE TABLE IF NOT EXISTS knowledge_base (
        id SERIAL PRIMARY KEY,
        question TEXT NOT NULL,
        answer TEXT NOT NULL,
        category TEXT DEFAULT 'Uncategorized',
        keywords TEXT[],
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Ensure all existing vehicles have a vehicle_id
    await query("UPDATE fleet_stock SET vehicle_id = 'v-' || id WHERE vehicle_id IS NULL");
    await query("ALTER TABLE fleet_stock ALTER COLUMN vehicle_id SET NOT NULL").catch(() => {});

    // Handle deposit_amount column migration/creation
    await query(`
      DO $$ 
      BEGIN 
        -- If the old column with spaces exists, rename it
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='fleet_stock' AND column_name='deposit - amount') THEN
          ALTER TABLE fleet_stock RENAME COLUMN "deposit - amount" TO deposit_amount;
        -- If neither exists, add the correct one
        ELSIF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='fleet_stock' AND column_name='deposit_amount') THEN
          ALTER TABLE fleet_stock ADD COLUMN deposit_amount NUMERIC DEFAULT 3000;
        END IF;
      END $$;
    `).catch(err => console.error('Migration error (deposit_amount):', err));

    console.log('Database tables verified/created successfully');
  } catch (err) {
    console.error('DATABASE INITIALIZATION ERROR:', err);
  }
};
