"use client";

import React from "react";
import Link from "next/link";
import {
  Target,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Calendar,
  AlertCircle,
  TrendingUp,
} from "lucide-react";

export default function ProductivityAnalyticsPage() {
  const taskStats = [
    { label: "High Priority Tasks Completed", count: 14, total: 15, pct: 93 },
    { label: "Medium Priority Tasks Completed", count: 18, total: 22, pct: 81 },
    { label: "Financial / Equb Routine Tasks", count: 8, total: 8, pct: 100 },
    { label: "Work & Project Deliverables", count: 12, total: 16, pct: 75 },
  ];

  return (
    <div className="space-y-6">
      {/* Back Link & Header */}
      <div>
        <Link
          href="/analytics"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-white mb-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Analytics Overview</span>
        </Link>
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <Target className="h-5 w-5" />
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            Productivity & Goal Execution Analytics
          </h1>
        </div>
        <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
          Tracking task velocity, turnaround times, and milestone progress
        </p>
      </div>

      {/* Grid of Task Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-xs dark:border-neutral-800/80 dark:bg-neutral-900">
          <span className="text-xs text-neutral-500 font-medium">Average Task Completion Time</span>
          <p className="mt-2 text-2xl font-bold text-neutral-900 dark:text-white">1.4 Days</p>
          <p className="mt-1 text-[11px] text-emerald-600 dark:text-emerald-400">18% faster than previous month</p>
        </div>

        <div className="rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-xs dark:border-neutral-800/80 dark:bg-neutral-900">
          <span className="text-xs text-neutral-500 font-medium">Equb & Obligation On-Time Rate</span>
          <p className="mt-2 text-2xl font-bold text-emerald-600 dark:text-emerald-400">100%</p>
          <p className="mt-1 text-[11px] text-neutral-400">Zero missed deadlines</p>
        </div>

        <div className="rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-xs dark:border-neutral-800/80 dark:bg-neutral-900">
          <span className="text-xs text-neutral-500 font-medium">Weekly Focus Score</span>
          <p className="mt-2 text-2xl font-bold text-blue-600 dark:text-blue-400">89 / 100</p>
          <p className="mt-1 text-[11px] text-neutral-400">Calculated across 5 priority streams</p>
        </div>
      </div>

      {/* Breakdown by Category */}
      <div className="rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-xs dark:border-neutral-800/80 dark:bg-neutral-900">
        <h2 className="text-sm font-bold text-neutral-900 dark:text-white">
          Execution Rates by Category
        </h2>
        <div className="mt-4 space-y-4">
          {taskStats.map((item) => (
            <div key={item.label} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-neutral-700 dark:text-neutral-300">
                  {item.label}
                </span>
                <span className="font-bold text-neutral-900 dark:text-white">
                  {item.count} / {item.total} ({item.pct}%)
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-neutral-100 dark:bg-neutral-800">
                <div
                  className="h-2 rounded-full bg-blue-500"
                  style={{ width: `${item.pct}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}