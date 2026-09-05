import React from "react";

export function AiInsightCard() {
  return (
    <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-6 dark:border-indigo-950 dark:bg-indigo-950/20">
      <h4 className="font-semibold text-indigo-950 dark:text-indigo-200">AI Financial Insights</h4>
      <p className="mt-2 text-sm text-indigo-800 dark:text-indigo-300">
        Mela AI analyzes your expenses and recommends budget adjustments.
      </p>
    </div>
  );
}
