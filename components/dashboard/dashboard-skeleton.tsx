"use client";

import React from "react";

export function MetricsOverviewSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse rounded-2xl border border-neutral-200/80 bg-white/70 p-4 backdrop-blur-md dark:border-neutral-800/80 dark:bg-neutral-900/70"
        >
          <div className="h-3 w-16 rounded bg-neutral-200 dark:bg-neutral-800" />
          <div className="mt-3 h-6 w-24 rounded bg-neutral-200 dark:bg-neutral-800" />
          <div className="mt-2 h-2.5 w-12 rounded bg-neutral-200 dark:bg-neutral-800" />
        </div>
      ))}
    </div>
  );
}

export function WidgetCardSkeleton({ title }: { title?: string }) {
  return (
    <div className="animate-pulse rounded-2xl border border-neutral-200/80 bg-white/70 p-5 backdrop-blur-md dark:border-neutral-800/80 dark:bg-neutral-900/70">
      <div className="flex items-center justify-between">
        <div className="h-4 w-32 rounded bg-neutral-200 dark:bg-neutral-800" />
        <div className="h-3 w-12 rounded bg-neutral-200 dark:bg-neutral-800" />
      </div>
      <div className="mt-6 space-y-3">
        <div className="h-10 w-full rounded-xl bg-neutral-200/60 dark:bg-neutral-800/60" />
        <div className="h-10 w-full rounded-xl bg-neutral-200/60 dark:bg-neutral-800/60" />
        <div className="h-10 w-full rounded-xl bg-neutral-200/60 dark:bg-neutral-800/60" />
      </div>
    </div>
  );
}

export function AIInsightSkeleton() {
  return (
    <div className="animate-pulse rounded-3xl border border-indigo-200/60 bg-gradient-to-r from-indigo-50/80 via-purple-50/60 to-pink-50/80 p-6 dark:border-indigo-900/50 dark:from-indigo-950/30 dark:via-purple-950/20 dark:to-pink-950/30">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-full bg-indigo-200 dark:bg-indigo-800" />
        <div className="h-4 w-40 rounded bg-indigo-200 dark:bg-indigo-800" />
      </div>
      <div className="mt-4 space-y-2">
        <div className="h-3.5 w-full rounded bg-indigo-200/70 dark:bg-indigo-800/70" />
        <div className="h-3.5 w-4/5 rounded bg-indigo-200/70 dark:bg-indigo-800/70" />
      </div>
    </div>
  );
}
