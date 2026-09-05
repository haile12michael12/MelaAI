"use client";

import React, { useState } from "react";

interface ChatInputProps {
  onSend?: (msg: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [value, setValue] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim() && onSend) {
      onSend(value);
      setValue("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 p-4">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Ask Mela anything..."
        disabled={disabled}
        className="flex-1 rounded-xl border border-neutral-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:border-neutral-700 dark:bg-neutral-800"
      />
      <button
        type="submit"
        disabled={disabled || !value.trim()}
        className="rounded-xl bg-neutral-900 px-5 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-white dark:text-neutral-900"
      >
        Send
      </button>
    </form>
  );
}
