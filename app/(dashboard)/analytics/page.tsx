import { RoutePlaceholder } from "@/components/route-placeholder";
"use client";

export default function AnalyticsPage() { return <RoutePlaceholder title="Analytics" />; }
import React, { useState } from "react";
import Link from "next/link";
import {
  BarChart3,
  TrendingUp,
  Target,
  Zap,
  BookOpen,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  Calendar,
  Wallet,
  Activity,
  Award,
} from "lucide-react";
import { formatETB } from "@/lib/utils";

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<"30d" | "90d" | "1y">("30d");

  // Summary Metrics
  const metrics = {
    monthlySpend: 42800,
    monthlySavings: 17200,
    savingsRate: 28.6,
    taskCompletionRate: 84,
    habitConsistency: 78,
    booksReadThisYear: 6,
    pagesPerWeek: 145,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
              <BarChart3 className="h-5 w-5" />
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
              Personal Operating Analytics
            </h1>
          </div>
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            Holistic cross-domain intelligence across finances, productivity habits, and lifestyle reading
          </p>
        </div>

        {/* Time range selector */}
        <div className="flex items-center gap-1 rounded-xl border border-neutral-200 bg-white p-1 dark:border-neutral-800 dark:bg-neutral-900">
          {(["30d", "90d", "1y"] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${
                timeRange === range
                  ? "bg-teal-600 text-white"
                  : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
              }`}
            >
              {range === "30d" ? "Past 30 Days" : range === "90d" ? "Past Quarter" : "Past Year"}
            </button>
          ))}
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex border-b border-neutral-200 dark:border-neutral-800">
        <Link
          href="/analytics"
          className="border-b-2 border-teal-600 px-4 py-2.5 text-xs font-bold text-teal-600 dark:text-teal-400"
        >
          Executive Overview
        </Link>
        <Link
          href="/analytics/financial"
          className="px-4 py-2.5 text-xs font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
        >
          Financial Velocity
        </Link>
        <Link
          href="/analytics/productivity"
          className="px-4 py-2.5 text-xs font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
        >
          Productivity & Tasks
        </Link>
        <Link
          href="/analytics/lifestyle"
          className="px-4 py-2.5 text-xs font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
        >
          Lifestyle & Habits
        </Link>
      </div>

      {/* Executive Key Scorecards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Financial Surplus */}
        <div className="rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-xs dark:border-neutral-800/80 dark:bg-neutral-900">
          <div className="flex items-center justify-between text-xs text-neutral-500">
            <span>Net Monthly Surplus</span>
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
              <Wallet className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-3 text-2xl font-bold text-neutral-900 dark:text-white">
            {formatETB(metrics.monthlySavings)}
          </p>
          <div className="mt-2 flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
            <ArrowUpRight className="h-3.5 w-3.5" />
            <span>Savings Rate: {metrics.savingsRate}%</span>
          </div>
        </div>

        {/* Task Completion Rate */}
        <div className="rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-xs dark:border-neutral-800/80 dark:bg-neutral-900">
          <div className="flex items-center justify-between text-xs text-neutral-500">
            <span>Task Completion Rate</span>
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
              <Target className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-3 text-2xl font-bold text-neutral-900 dark:text-white">
            {metrics.taskCompletionRate}%
          </p>
          <div className="mt-2 flex items-center gap-1 text-xs text-neutral-400">
            <span>28 of 33 tasks completed on time</span>
          </div>
        </div>

        {/* Habit Consistency */}
        <div className="rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-xs dark:border-neutral-800/80 dark:bg-neutral-900">
          <div className="flex items-center justify-between text-xs text-neutral-500">
            <span>Habit Streak Consistency</span>
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
              <Zap className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-3 text-2xl font-bold text-amber-600 dark:text-amber-400">
            {metrics.habitConsistency}%
          </p>
          <div className="mt-2 flex items-center gap-1 text-xs text-neutral-400">
            <span>Highest active streak: 18 days</span>
          </div>
        </div>

        {/* Reading Velocity */}
        <div className="rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-xs dark:border-neutral-800/80 dark:bg-neutral-900">
          <div className="flex items-center justify-between text-xs text-neutral-500">
            <span>Books Completed</span>
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400">
              <BookOpen className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-3 text-2xl font-bold text-neutral-900 dark:text-white">
            {metrics.booksReadThisYear} <span className="text-xs font-normal text-neutral-400">/ 12 goal</span>
          </p>
          <div className="mt-2 flex items-center gap-1 text-xs text-neutral-400">
            <span>~{metrics.pagesPerWeek} pages / week velocity</span>
          </div>
        </div>
      </div>

      {/* Main Breakdown Sections */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Spending Velocity by Ethiopian Category */}
        <div className="rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-xs dark:border-neutral-800/80 dark:bg-neutral-900">
          <div className="flex items-center justify-between pb-4 border-b border-neutral-100 dark:border-neutral-800">
            <div>
              <h2 className="text-sm font-bold text-neutral-900 dark:text-white">
                Monthly Spending Distribution
              </h2>
              <p className="text-[11px] text-neutral-400">Top outflow categories in ETB</p>
            </div>
            <Link
              href="/analytics/financial"
              className="text-xs font-semibold text-teal-600 hover:text-teal-700 dark:text-teal-400"
            >
              View Report →
            </Link>
          </div>

          <div className="mt-4 space-y-3">
            {[
              { category: "Equb & Savings (እቁብ)", amount: 15000, pct: 35, color: "bg-emerald-500" },
              { category: "House Rent (ቤት ኪራይ)", amount: 12000, pct: 28, color: "bg-blue-500" },
              { category: "Food & Teff (ምግብ / ጤፍ)", amount: 8500, pct: 20, color: "bg-amber-500" },
              { category: "Transport & Ride (ትራንስፖርት)", amount: 4200, pct: 10, color: "bg-purple-500" },
              { category: "Utilities & Tele (ቴሌ / መብራት)", amount: 3100, pct: 7, color: "bg-rose-500" },
            ].map((item) => (
              <div key={item.category} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-neutral-700 dark:text-neutral-300">
                    {item.category}
                  </span>
                  <span className="font-mono font-bold text-neutral-900 dark:text-white">
                    {formatETB(item.amount)} ({item.pct}%)
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-neutral-100 dark:bg-neutral-800">
                  <div
                    className={`h-2 rounded-full ${item.color}`}
                    style={{ width: `${item.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Productivity & Consistency Radar */}
        <div className="rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-xs dark:border-neutral-800/80 dark:bg-neutral-900">
          <div className="flex items-center justify-between pb-4 border-b border-neutral-100 dark:border-neutral-800">
            <div>
              <h2 className="text-sm font-bold text-neutral-900 dark:text-white">
                Execution Consistency Breakdown
              </h2>
              <p className="text-[11px] text-neutral-400">Target execution by domain</p>
            </div>
            <Link
              href="/analytics/productivity"
              className="text-xs font-semibold text-teal-600 hover:text-teal-700 dark:text-teal-400"
            >
              Details →
            </Link>
          </div>

          <div className="mt-4 space-y-4">
            <div className="rounded-xl bg-neutral-50 p-3.5 dark:bg-neutral-800/40">
              <div className="flex items-center justify-between text-xs font-medium">
                <span className="text-neutral-700 dark:text-neutral-300">Daily Routine Adherence</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">88% Optimal</span>
              </div>
              <p className="mt-1 text-[11px] text-neutral-400">
                Morning walk, reading, and evening financial review completed on 22 of the last 25 days.
              </p>
            </div>

            <div className="rounded-xl bg-neutral-50 p-3.5 dark:bg-neutral-800/40">
              <div className="flex items-center justify-between text-xs font-medium">
                <span className="text-neutral-700 dark:text-neutral-300">Financial Budget Adherence</span>
                <span className="font-bold text-teal-600 dark:text-teal-400">92% Compliance</span>
              </div>
              <p className="mt-1 text-[11px] text-neutral-400">
                Discretionary dining and shopping kept within planned limits with no budget violations this cycle.
              </p>
            </div>

            <div className="rounded-xl bg-neutral-50 p-3.5 dark:bg-neutral-800/40">
              <div className="flex items-center justify-between text-xs font-medium">
                <span className="text-neutral-700 dark:text-neutral-300">Reading Goal Pace</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">On Track (+1 book ahead)</span>
              </div>
              <p className="mt-1 text-[11px] text-neutral-400">
                Currently reading "Girmawi Nigus" by Hadis Alemayehu. 65% completed.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}