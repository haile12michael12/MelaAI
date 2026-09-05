import React from "react";

export function RecommendationCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-xl border border-neutral-200 p-4 dark:border-neutral-800">
      <h5 className="font-medium text-sm">{title}</h5>
      <p className="mt-1 text-xs text-neutral-500">{description}</p>
    </div>
  );
}
