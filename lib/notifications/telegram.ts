export async function sendTelegramNotification(chatId: string, text: string) {
  return { chatId, text, status: "sent" };
}
