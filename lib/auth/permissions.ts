export type Permission = "read" | "write" | "admin";

export function hasPermission(userRole: string, required: Permission): boolean {
  if (userRole === "admin") return true;
  if (required === "read") return true;
  return userRole === required;
}
