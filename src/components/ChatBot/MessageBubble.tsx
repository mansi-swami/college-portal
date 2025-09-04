import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import type { ChatMessage } from "../../types/chat";

type Props = { msg: ChatMessage };

const MessageBubble: React.FC<Props> = ({ msg }) => {
  const isUser = msg.role === "user";
  return (
    <div
      className={`max-w-[90%] rounded-xl px-3 py-2 whitespace-pre-wrap break-words
      ${isUser ? "ml-auto bg-blue-500 text-white" : "mr-auto bg-gray-200 dark:bg-gray-700 dark:text-gray-100"}`}
      aria-label={isUser ? "User message" : "AI message"}
    >
      <ReactMarkdown
        // GitHub-flavored markdown + sanitize HTML
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSanitize]}
        // Basic markdown typography
        components={{
          a(props) {
            return <a {...props} className="underline hover:no-underline" target="_blank" rel="noreferrer" />;
          },
          code(props) {
            const { className, children, ...rest } = props;
            return (
              <code
                {...rest}
                className={`rounded px-1 py-0.5 text-sm font-mono
                  ${className ?? ""} 
                  ${isUser ? "bg-blue-600/70" : "bg-black/10 dark:bg-black/30"}`}
              >
                {children}
              </code>
            );
          },
          pre(props) {
            return (
              <pre
                {...props}
                className="overflow-auto rounded-lg p-3 my-2 text-sm bg-black/90 text-gray-100"
              />
            );
          },
          ul(props) {
            return <ul {...props} className="list-disc ml-6 my-2" />;
          },
          ol(props) {
            return <ol {...props} className="list-decimal ml-6 my-2" />;
          },
          blockquote(props) {
            return <blockquote {...props} className="border-l-4 pl-3 italic opacity-90" />;
          },
          table(props) {
            return (
              <div className="overflow-auto my-2">
                <table {...props} className="min-w-[300px] border-collapse" />
              </div>
            );
          },
          th(props) {
            return <th {...props} className="border px-2 py-1 bg-black/10 dark:bg-white/10" />;
          },
          td(props) {
            return <td {...props} className="border px-2 py-1" />;
          },
        }}
      >
        {msg.content}
      </ReactMarkdown>
      <div className="mt-1 text-[10px] opacity-70 text-right">
        {new Date(msg.createdAt).toLocaleTimeString()}
      </div>
    </div>
  );
};

export default MessageBubble;
