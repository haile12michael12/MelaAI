export function scheduleJob(cron: string, handler: () => void | Promise<void>) {
  return { cron, handler };
}
