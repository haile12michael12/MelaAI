export async function sendEmailNotification(to: string, subject: string, body: string) {
  return { to, subject, status: "queued" };
}
