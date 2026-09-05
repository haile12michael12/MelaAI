import React from "react";

export interface ChatMessageProps {
  role: "user" | "assistant" | "system";
  content: string;
}

export function ChatMessage({ role, content }: ChatMessageProps) {
  return (
    <div className={`my-2 flex ${role === "user" ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-xl rounded-2xl px-4 py-2 text-sm ${
        role === "user" ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-white"
      }`}>
        {content}
      </div>
    </div>
  );
}
