
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
      const response = await fetch(`${wahaUrl}/api/sendText`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': wahaKey ? `Bearer ${wahaKey}` : '',
        },
        body: JSON.stringify({
          chatId: chatId,
          text: text,
          session: sessionName,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[WAHA] Error sending message: ${response.status} ${errorText}`);
      } else {
        console.log(`[WAHA] Message sent successfully to ${chatId}`);
      }
    } catch (error) {
      console.error('[WAHA] Network error sending message:', error);
    }
  }
};
