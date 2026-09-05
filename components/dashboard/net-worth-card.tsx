import React from "react";

export function NetWorthCard() {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
      <p className="text-sm font-medium text-neutral-500">Total Net Worth</p>
      <h3 className="mt-2 text-3xl font-bold">$0.00</h3>
    </div>
  );
}
