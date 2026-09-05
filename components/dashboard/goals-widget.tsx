import React from "react";

export function GoalsWidget() {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
      <h4 className="font-semibold">Active Goals</h4>
      <p className="mt-2 text-sm text-neutral-500">No active goals found.</p>
    </div>
  );
}
