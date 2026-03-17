
export const wahaService = {
  async sendMessage(chatId: string, text: string) {
    const wahaUrl = process.env.WAHA_URL;
    const wahaKey = process.env.WAHA_API_KEY;
    const sessionName = process.env.WAHA_SESSION || 'default';

    if (!wahaUrl) {
      console.warn('[WAHA] WAHA_URL not set, skipping message send');
      return;
    }

    try {
      const url = `${wahaUrl.replace(/\/$/, '')}/api/sendText`;
      const payload = {
        chatId: chatId,
        text: text,
        session: sessionName,
      };

      console.log(`[WAHA-DEBUG] Sending to: ${url}`);
      console.log(`[WAHA-DEBUG] Payload: ${JSON.stringify(payload)}`);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': wahaKey ? `Bearer ${wahaKey}` : '',
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
  }
};
