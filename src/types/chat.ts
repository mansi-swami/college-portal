export type ChatRole = "user" | "ai" | "system";

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: number; // Date.now()
}
