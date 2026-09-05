export function requireAuth(session: unknown): boolean {
  return Boolean(session);
}
