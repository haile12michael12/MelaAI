export async function sendPushNotification(token: string, message: string) {
  return { token, message, status: "sent" };
}
