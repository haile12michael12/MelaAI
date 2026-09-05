export interface MelaMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: number;
}
