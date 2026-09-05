import React from "react";

interface SuggestedPromptsProps {
  onSelect?: (prompt: string) => void;
}

export function SuggestedPrompts({ onSelect }: SuggestedPromptsProps) {
  const prompts = [
    "Analyze my spending for this month",
    "How are my investment goals progressing?",
    "Summarize my recent tasks and habits",
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {prompts.map((p) => (
        <button
          key={p}
          onClick={() => onSelect?.(p)}
          className="rounded-lg border border-neutral-200 px-3 py-1.5 text-xs text-neutral-600 hover:bg-neutral-100 dark:border-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-800"
        >
          {p}
        </button>
      ))}
    </div>
  );
}
