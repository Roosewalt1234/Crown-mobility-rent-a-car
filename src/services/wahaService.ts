
import "dotenv/config";

export const wahaService = {
  async sendMessage(chatId: string, text: string) {
    const wahaUrl = process.env.WAHA_URL;
    const wahaKey = process.env.WAHA_API_KEY;
    const sessionName = process.env.WAHA_SESSION || 'default';

    if (!wahaUrl) {
      console.warn(`[WAHA-DEBUG] WAHA_URL is not set in process.env. Current keys: ${Object.keys(process.env).filter(k => k.includes('WAHA')).join(', ')}`);
      return;
    }

    try {
      // Clean up the URL - handle cases where user might have included /api/sendText in the base URL
      let baseUrl = wahaUrl.replace(/\/$/, '');
      if (baseUrl.endsWith('/api/sendText')) {
        baseUrl = baseUrl.replace(/\/api\/sendText$/, '');
      }
      
      const url = `${baseUrl}/api/sendText`;
      const payload = {
        chatId: chatId,
        text: text,
        session: sessionName,
      };

      console.log(`[WAHA-DEBUG] Sending to: ${url}`);
      console.log(`[WAHA-DEBUG] Auth Key present: ${wahaKey ? 'YES' : 'NO'}`);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(wahaKey ? { 'X-Api-Key': wahaKey } : {}), // WAHA often uses X-Api-Key or Authorization
          ...(wahaKey ? { 'Authorization': `Bearer ${wahaKey}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[WAHA-DEBUG] Error response (${response.status}): ${errorText}`);
      } else {
        console.log(`[WAHA-DEBUG] Message sent successfully to ${chatId}`);
      }
    } catch (error) {
      console.error('[WAHA-DEBUG] Network error sending message:', error);
    }
  },

  async sendImage(chatId: string, imageUrl: string, caption?: string) {
    const wahaUrl = process.env.WAHA_URL;
    const wahaKey = process.env.WAHA_API_KEY;
    const sessionName = process.env.WAHA_SESSION || 'default';

    if (!wahaUrl) return;

    try {
      let baseUrl = wahaUrl.replace(/\/$/, '');
      if (baseUrl.endsWith('/api/sendText')) {
        baseUrl = baseUrl.replace(/\/api\/sendText$/, '');
      }
      
      const url = `${baseUrl}/api/sendImage`;
      
      // Modern WAHA versions often expect an object for the file property when using a URL
      const payload = {
        chatId: chatId,
        file: {
          url: imageUrl
        },
        caption: caption,
        session: sessionName,
      };

      console.log(`[WAHA-DEBUG] Sending image to: ${url}`);
      console.log(`[WAHA-DEBUG] Payload: ${JSON.stringify(payload)}`);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(wahaKey ? { 'X-Api-Key': wahaKey } : {}),
          ...(wahaKey ? { 'Authorization': `Bearer ${wahaKey}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      const responseText = await response.text();
      if (!response.ok) {
        console.error(`[WAHA-DEBUG] Error sending image (${response.status}): ${responseText}`);
      } else {
        console.log(`[WAHA-DEBUG] Image sent successfully to ${chatId}: ${imageUrl}. Response: ${responseText}`);
      }
    } catch (error) {
      console.error('[WAHA-DEBUG] Error sending image:', error);
    }
  }
};
