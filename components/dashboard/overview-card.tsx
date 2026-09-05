import React from "react";

interface OverviewCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
}

export function OverviewCard({ title, value, subtitle }: OverviewCardProps) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
      <p className="text-sm font-medium text-neutral-500">{title}</p>
      <h3 className="mt-2 text-2xl font-semibold text-neutral-950 dark:text-neutral-50">{value}</h3>
      {subtitle && <p className="mt-1 text-xs text-neutral-400">{subtitle}</p>}
    </div>
  );
}
