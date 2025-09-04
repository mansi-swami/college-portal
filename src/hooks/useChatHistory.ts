import { useCallback, useEffect, useMemo, useState } from "react";
import type { ChatMessage } from "../types/chat";

const STORAGE_KEY = "chat_history_v1";

export function useChatHistory() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // Load once
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setMessages(JSON.parse(raw));
    } catch {
      // ignore parse errors
    }
  }, []);

  // Persist on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {
      // quota or private mode – ignore
    }
  }, [messages]);

  const addMessage = useCallback((msg: Omit<ChatMessage, "id" | "createdAt">) => {
    setMessages(prev => [
      ...prev,
      { ...msg, id: crypto.randomUUID(), createdAt: Date.now() },
    ]);
  }, []);

  const replaceMessage = useCallback((id: string, content: string) => {
    setMessages(prev => prev.map(m => (m.id === id ? { ...m, content } : m)));
  }, []);

  const clear = useCallback(() => setMessages([]), []);

  const search = useCallback((q: string) => {
    const needle = q.trim().toLowerCase();
    if (!needle) return messages;
    return messages.filter(
      m =>
        m.role.toLowerCase().includes(needle) ||
        m.content.toLowerCase().includes(needle)
    );
  }, [messages]);

  const lastUserMessage = useMemo(
    () => [...messages].reverse().find(m => m.role === "user"),
    [messages]
  );

  return { messages, addMessage, replaceMessage, clear, search, lastUserMessage };
}
