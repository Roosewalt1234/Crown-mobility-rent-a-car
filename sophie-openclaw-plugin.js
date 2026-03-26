/**
 * SOPHIE AI PLUGIN FOR OPENCLAW / WA BOT
 * 
 * This plugin clones Sophie's full intelligence, including:
 * 1. System Instructions (Personality & Rules)
 * 2. Knowledge Bank (Static Q&A)
 * 3. Real-time Fleet Data (from Railway Postgres)
 * 4. Tool Handling (Escalation & Car Images)
 */

const { Client } = require('pg');
const { GoogleGenerativeAI } = require("@google/generative-ai");

// --- CONFIGURATION ---
// Ensure these environment variables are set in your bot environment
const CONFIG = {
  DATABASE_URL: process.env.DATABASE_URL, // Your Railway Postgres URL
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  MANAGER_NUMBER: process.env.MANAGER_NUMBER || '971500000000@s.whatsapp.net', // Number to notify for escalations
};

// --- SOPHIE'S CORE INTELLIGENCE (SYSTEM PROMPT) ---
const KNOWLEDGE_BANK = `
SOPHIE'S KNOWLEDGE BANK (CRESCENT MOBILITY RENT A CAR)
IMPORTANT: You are Sophie. You only work for Crescent Mobility.

Crescent Mobility Rent A Car — Knowledge Bank
ADVANCE / DEPOSIT
Q: How much is the advance / deposit? / How much advance? / Advance? / Deposit?
A: The security deposit for the [Car Name] is AED [Amount]. (Refer to fleet data for specific amount).

ADVANCE PAYMENT
Q: Why do I need to pay in advance? / I don't want to pay upfront / Can I pay on pickup?
A: I completely understand your concern! 😊 The advance simply locks in your preferred car and dates — no last-minute surprises. It's fully counted toward your total, so you're not paying anything extra. Shall I help you secure it now? It just takes a moment! 🚗

CANCELLATION
Q: What is your cancellation policy? / Can I cancel?
A: Free cancellation up to 24 hours before your pickup time. If cancelled within 24 hours, a 1-day charge applies.

LOCATION
Q: Where are you located? / Office address? / Can I come to the office?
A: We are located in Warsan, Morocco I 12, Dubai. 📍 Here is our location on Google Maps: https://maps.app.goo.gl/idKUbcDBpZBivovP7. However, please note that our office is currently closed due to the situation. We are handling all bookings digitally and providing delivery!

REQUIREMENTS (UAE RESIDENT)
Q: What documents do I need? (UAE Resident)
A: For UAE residents, we'll need: Emirates ID and a Valid UAE Driving Licence.

REQUIREMENTS (TOURIST)
Q: What documents do I need? (Tourist)
A: For tourists, we'll need: Passport with Visa Entry Stamp, Valid Home Country Driving Licence, and an International Driving Permit (IDP).

RENTAL EXTENSION
Q: Can I extend my rental? / How to extend?
A: Yes, you can! However, please note that for extensions, we need to close the current contract and make a new one due to the RTA system.

SALIK / FINES
Q: How do you handle Salik (tolls) and fines?
A: Salik and fines are tracked by the car's plate number. We will provide you with the official reports and deduct these from your security deposit.
`;

const SYSTEM_INSTRUCTION = `
CRITICAL: YOUR NAME IS SOPHIE. YOU WORK FOR CRESCENT MOBILITY RENT A CAR IN DUBAI. 
NEVER MENTION NATHALIA. NEVER MENTION ADVENTURE COMPANIES. YOU ARE IN THE CAR RENTAL BUSINESS.

You are Sophie, a friendly and professional team member at Crescent Mobility Rent A Car in Dubai.
Your goal is to answer customer questions accurately based ONLY on the provided Knowledge Bank and the REAL-TIME FLEET DATA.

REAL-TIME DATA SOURCE:
You are provided with a list of cars from our 'fleet_stock' table. This is your SINGLE SOURCE OF TRUTH for:
- Available models and makes
- Pricing (Daily by default; Weekly/Monthly only if requested)
- Mileage limits and extra charges
- Security deposit amounts
- Car features and descriptions

STRICT CONVERSATIONAL FLOW:
1. CAR SELECTION: "Excellent choice! The daily rate for the [Car Name] is AED [Price]. Which dates would you like to have the car?"
2. DATE CONFIRMATION: "Perfect! We do have the car available on these days. could you confirm if you are a resident of UAE or Visitor"
3. REQUIREMENTS: List documents based on residency and ask for delivery location.
4. FINALIZATION: Calculate Total (Days x Rate), mention Deposit, ask for delivery time, and inform them a manager will send bank details manually.

STRICT RULES:
- DO NOT provide bank details (Manager sends them manually).
- DO NOT include 'car_description' in chats.
- NEVER mention 'Mileage' or 'Deposit' unless asked or at the finalization stage.
- NEVER repeat a request for documents if already asked.
- DO NOT acknowledge receipt of images/documents; just move to the next step.
- Discounts: "This is Ramadhan Promo offer, BEST DEAL IN TOWN ! 😊". If they insist, offer up to 500 AED discount, then ask for their budget or escalate.
- NEVER mention that you are an AI, a bot, or a virtual assistant. Act as a real person.
`;

// --- DATABASE SERVICE ---
async function getFleetData() {
  const client = new Client({ connectionString: CONFIG.DATABASE_URL });
  try {
    await client.connect();
    const res = await client.query("SELECT * FROM fleet_stock ORDER BY created_at DESC");
    return res.rows.map(car => {
      return `- ${car.vehicle_make} ${car.vehicle_model} (${car.vehicle_year}): ` +
             `ID: ${car.vehicle_id}, Price: AED ${car.day_price}/day, Deposit: AED ${car.deposit_amount || 3000}. ` +
             `Features: ${car.car_features}.`;
    }).join('\n');
  } catch (err) {
    console.error("DB Error:", err);
    return "Fleet data currently unavailable.";
  } finally {
    await client.end();
  }
}

// --- AI SERVICE ---
async function processSophieResponse(chatId, userMessage, history = []) {
  const genAI = new GoogleGenerativeAI(CONFIG.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const fleetString = await getFleetData();
  
  const fullInstruction = SYSTEM_INSTRUCTION
    .replace('${KNOWLEDGE_BANK}', KNOWLEDGE_BANK) + 
    `\n\nREAL-TIME FLEET DATA:\n${fleetString}`;

  // Format history for Gemini
  const contents = history.map(h => ({
    role: h.fromMe ? 'model' : 'user',
    parts: [{ text: h.body }]
  }));
  
  // Add current message
  contents.push({ role: 'user', parts: [{ text: userMessage }] });

  // Define Tools (Function Declarations)
  const tools = [
    {
      functionDeclarations: [
        {
          name: "notify_manager",
          description: "Escalate the conversation to a human manager.",
          parameters: {
            type: "object",
            properties: {
              reason: { type: "string", description: "Reason for escalation" }
            },
            required: ["reason"]
          }
        },
        {
          name: "send_car_images",
          description: "Send images of a specific car.",
          parameters: {
            type: "object",
            properties: {
              vehicle_id: { type: "string", description: "The ID of the vehicle" }
            },
            required: ["vehicle_id"]
          }
        }
      ]
    }
  ];

  try {
    const result = await model.generateContent({
      contents,
      systemInstruction: fullInstruction,
      tools
    });

    const response = result.response;
    const call = response.functionCalls()?.[0];

    if (call) {
      if (call.name === "notify_manager") {
        return { 
          text: "I will check with my manager and get back to you shortly! 😊", 
          action: "NOTIFY_MANAGER", 
          args: call.args 
        };
      }
      if (call.name === "send_car_images") {
        return { 
          text: "Sure! I'm sending you the images of the car right now. 📸", 
          action: "SEND_IMAGES", 
          args: call.args 
        };
      }
    }

    return { text: response.text() };
  } catch (err) {
    console.error("AI Error:", err);
    return { text: "I'm sorry, I'm having a bit of trouble connecting. Please try again! 😊" };
  }
}

// --- OPENCLAW PLUGIN EXPORT ---
module.exports = {
  name: "sophie",
  async handle(msg, bot) {
    const chatId = msg.key.remoteJid;
    const userMessage = msg.message?.conversation || msg.message?.extendedTextMessage?.text;

    if (!userMessage) return;

    // Optional: Only respond to specific triggers or if AI mode is ON
    // if (!userMessage.startsWith('.sophie')) return;

    console.log(`[SOPHIE] Processing message from ${chatId}`);

    // 1. Get AI Response
    const sophie = await processSophieResponse(chatId, userMessage);

    // 2. Send Text Response
    await bot.sendMessage(chatId, { text: sophie.text });

    // 3. Handle Special Actions
    if (sophie.action === "NOTIFY_MANAGER") {
      await bot.sendMessage(CONFIG.MANAGER_NUMBER, { 
        text: `⚠️ ESCALATION: Customer ${chatId} needs help with: ${sophie.args.reason}` 
      });
    }

    if (sophie.action === "SEND_IMAGES") {
      // Fetch images from DB for this vehicle_id and send them
      const client = new Client({ connectionString: CONFIG.DATABASE_URL });
      await client.connect();
      const res = await client.query("SELECT vehicle_image_url, vehicle_images FROM fleet_stock WHERE vehicle_id = $1", [sophie.args.vehicle_id]);
      await client.end();

      if (res.rows.length > 0) {
        const car = res.rows[0];
        const images = JSON.parse(car.vehicle_images || "[]");
        const allImages = [car.vehicle_image_url, ...images].filter(Boolean);
        
        for (const url of allImages) {
          await bot.sendMessage(chatId, { image: { url }, caption: "📸 Car Detail" });
        }
      }
    }
  }
};
