import React from "react";

export function ThinkingIndicator() {
  return (
    <div className="flex items-center gap-1 p-2 text-xs text-neutral-400">
      <span className="animate-pulse">●</span>
      <span className="animate-pulse [animation-delay:200ms]">●</span>
      <span className="animate-pulse [animation-delay:400ms]">●</span>
      <span className="ml-2">Mela is thinking...</span>
    </div>
  );
}
