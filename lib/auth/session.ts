export interface UserSession {
  uid: string;
  email?: string | null;
  displayName?: string | null;
}

export function getCurrentSession(): UserSession | null {
  return null;
}
