import { createClient } from '@supabase/supabase-js';
import pg from 'pg';
import 'dotenv/config';

const { Pool } = pg;

async function migrate() {
  console.log('🚀 Starting migration from Supabase to Railway...');

  // 1. Initialize Supabase
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Supabase credentials missing in environment variables.');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // 2. Initialize Railway (PostgreSQL)
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  const query = (text: string, params?: any[]) => pool.query(text, params);

  try {
    // --- Migrate fleet_stock ---
    console.log('📦 Migrating fleet_stock...');
    const { data: fleet, error: fleetError } = await supabase.from('fleet_stock').select('*');
    
    if (fleetError) {
      console.error('❌ Error fetching fleet_stock from Supabase:', fleetError);
    } else if (fleet && fleet.length > 0) {
      for (const item of fleet) {
        await query(
          `INSERT INTO fleet_stock (
            vehicle_id, vehicle_make, vehicle_model, vehicle_year, 
            fleet_type, vehicle_image_url, car_description, 
            day_price, week_price, month_price, 
            milage_limit, extra_km_charge, car_features, deposit_amount
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
          ON CONFLICT (vehicle_id) DO UPDATE SET
            vehicle_make = $2, vehicle_model = $3, vehicle_year = $4,
            fleet_type = $5, vehicle_image_url = $6, car_description = $7,
            day_price = $8, week_price = $9, month_price = $10,
            milage_limit = $11, extra_km_charge = $12, car_features = $13,
            deposit_amount = $14`,
          [
            item.vehicle_id, item.vehicle_make, item.vehicle_model, item.vehicle_year, 
            item.fleet_type, item.vehicle_image_url, item.car_description, 
            item.day_price, item.week_price, item.month_price, 
            item.milage_limit, item.extra_km_charge, item.car_features,
            item.deposit_amount ?? item['deposit - amount'] ?? 3000
          ]
        );
      }
      console.log(`✅ Migrated ${fleet.length} vehicles.`);
    } else {
      console.log('⚠️ No vehicles found in Supabase.');
    }

    // --- Migrate contacts ---
    console.log('👥 Migrating contacts...');
    const { data: contacts, error: contactsError } = await supabase.from('contacts').select('*');
    
    if (contactsError) {
      console.error('❌ Error fetching contacts from Supabase:', contactsError);
    } else if (contacts && contacts.length > 0) {
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
      console.log(`✅ Migrated ${contacts.length} contacts.`);
    } else {
      console.log('⚠️ No contacts found in Supabase.');
    }

    // --- Migrate messages ---
    console.log('💬 Migrating messages...');
    const { data: messages, error: messagesError } = await supabase.from('messages').select('*');
    
    if (messagesError) {
      console.error('❌ Error fetching messages from Supabase:', messagesError);
    } else if (messages && messages.length > 0) {
      for (const msg of messages) {
        // We use chat_id as reference, so ensure contacts are migrated first
        await query(
          `INSERT INTO messages (chat_id, body, direction, is_ai_reply, created_at, status)
           VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT DO NOTHING`, // Messages don't have a unique constraint besides ID, so skip duplicates
          [msg.chat_id, msg.body, msg.direction, msg.is_ai_reply, msg.created_at, msg.status]
        );
      }
      console.log(`✅ Migrated ${messages.length} messages.`);
    } else {
      console.log('⚠️ No messages found in Supabase.');
    }

    console.log('🎉 Migration completed successfully!');
  } catch (err) {
    console.error('❌ Migration failed:', err);
  } finally {
    await pool.end();
  }
}

migrate();
