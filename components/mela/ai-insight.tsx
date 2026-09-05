import React from "react";

export function AiInsight({ insight }: { insight?: string }) {
  return (
    <div className="rounded-lg bg-neutral-50 p-4 text-sm dark:bg-neutral-800">
      {insight ?? "No insights available."}
    </div>
  );
}
