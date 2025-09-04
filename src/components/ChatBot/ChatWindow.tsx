import React, { useEffect, useRef, useState } from "react";
import MessageBubble from "./MessageBubble";
import { useChatHistory } from "../../hooks/useChatHistory";
import useLocalStorage from "../../hooks/useLocalStorage";

const ChatWindow: React.FC = () => {
  const { messages, addMessage, clear, search } = useChatHistory();
  const [input, setInput] = useState("");
  const [query, setQuery] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [draft, setDraft] = useLocalStorage<string>("chat_draft", "");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => setInput(draft), [draft]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isTyping]);

  const filtered = query ? search(query) : messages;

  const handleSend = () => {
    const content = input.trim();
    if (!content) return;
    addMessage({ role: "user", content });
    setInput(""); setDraft("");
    setIsTyping(true);
    setTimeout(() => { addMessage({ role: "ai", content: `**You said:**\n\n${content}` }); setIsTyping(false); }, 900);
  };

  return (
    <section aria-labelledby="chat-heading" className="w-full max-w-2xl mx-auto p-4 border rounded-lg bg-white dark:bg-gray-900">
      <h3 id="chat-heading" className="text-lg font-semibold">AI Assistant</h3>

      {/* Search controls (proper labels) */}
      <div className="flex items-center gap-2 mb-3 mt-2">
        <label htmlFor="chat-search" className="text-sm">Search</label>
        <input
          id="chat-search"
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="flex-1 border rounded px-2 py-1 dark:bg-gray-800 dark:text-gray-100"
          placeholder="Search history…"
        />
        <button onClick={clear} className="px-3 py-1 rounded border hover:bg-gray-100 dark:hover:bg-gray-800">
          Clear
        </button>
      </div>

      {/* Live region log */}
      <div
        ref={scrollRef}
        className="h-80 overflow-y-auto flex flex-col gap-2 p-2 rounded bg-gray-50 dark:bg-gray-800"
        role="log"
        aria-live="polite"
        aria-relevant="additions"
      >
        {filtered.map(m => (<MessageBubble key={m.id} msg={m} />))}
        {isTyping && (
          <div role="status" aria-label="AI typing" className="mr-auto bg-gray-200 dark:bg-gray-700 rounded-xl px-3 py-2">
            <em>AI is typing…</em>
          </div>
        )}
      </div>

      {/* Composer — label + description */}
      <div className="mt-3">
        <label htmlFor="chat-input" className="block text-sm">Message</label>
        <p id="chat-help" className="text-xs opacity-70 mb-1">Supports Markdown. Press Enter to send, Shift+Enter for newline.</p>
        <textarea
          id="chat-input"
          placeholder="Need help? Start typing..."
          aria-describedby="chat-help"
          value={input}
          onChange={e => { setInput(e.target.value); setDraft(e.target.value); }}
          onKeyDown={e => {
            if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
          }}
          rows={2}
          className="w-full resize-none border rounded px-3 py-2 bg-white dark:bg-gray-200 text-gray-900 dark:text-black focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <div className="mt-2 flex justify-end">
          <button onClick={handleSend} className="btn bg-blue-600 text-white px-4 rounded hover:bg-blue-700">
            Send
          </button>
        </div>
      </div>
    </section>
  );
};
export default ChatWindow;
