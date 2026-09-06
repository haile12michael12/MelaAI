"use client";

import React from "react";
import Link from "next/link";
import {
  Zap,
  ArrowLeft,
  BookOpen,
  Film,
  Flame,
  Award,
  CheckCircle2,
} from "lucide-react";

export default function LifestyleAnalyticsPage() {
  const habits = [
    { name: "Morning Prayer / Meditation (ፀሎት)", streak: 21, best: 45, consistency: 95 },
    { name: "30-Minute Reading (ንባብ)", streak: 14, best: 30, consistency: 85 },
    { name: "Expense Logging in Mela", streak: 18, best: 28, consistency: 90 },
    { name: "Hydration & Exercise", streak: 7, best: 21, consistency: 70 },
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
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <Zap className="h-5 w-5" />
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            Lifestyle & Habit Consistency Analytics
          </h1>
        </div>
        <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
          Tracking personal habits, reading goals, and media engagement trends
        </p>
      </div>

      {/* Habits Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {habits.map((h) => (
          <div
            key={h.name}
            className="rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-xs dark:border-neutral-800/80 dark:bg-neutral-900"
          >
            <span className="line-clamp-1 text-xs font-bold text-neutral-900 dark:text-white">
              {h.name}
            </span>
            <div className="mt-3 flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
              <Flame className="h-5 w-5 fill-amber-500 text-amber-500" />
              <span className="text-2xl font-bold">{h.streak}</span>
              <span className="text-xs text-neutral-400">day streak</span>
            </div>
            <div className="mt-3 flex items-center justify-between text-[11px] text-neutral-400 border-t border-neutral-100 pt-2 dark:border-neutral-800">
              <span>Best: {h.best}d</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">{h.consistency}% consistency</span>
            </div>
          </div>
        ))}
      </div>

      {/* Reading & Media Analytics */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-xs dark:border-neutral-800/80 dark:bg-neutral-900">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            <h2 className="text-sm font-bold text-neutral-900 dark:text-white">
              Reading Trajectory
            </h2>
          </div>
          <p className="mt-1 text-[11px] text-neutral-400">Pacing toward the 12-book annual goal</p>

          <div className="mt-4 rounded-xl bg-purple-50/50 p-4 dark:bg-purple-950/20">
            <div className="flex items-center justify-between text-xs font-semibold text-purple-900 dark:text-purple-300">
              <span>Goal: 12 Books in 2026</span>
              <span>6 of 12 Completed (50%)</span>
            </div>
            <div className="mt-2 h-2.5 w-full rounded-full bg-purple-200/60 dark:bg-purple-900/60">
              <div className="h-2.5 rounded-full bg-purple-600" style={{ width: "50%" }} />
            </div>
            <p className="mt-3 text-[11px] text-purple-700 dark:text-purple-300">
              Reading speed averages ~28 pages per day. Expected completion of current book within 4 days.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-xs dark:border-neutral-800/80 dark:bg-neutral-900">
          <div className="flex items-center gap-2">
            <Film className="h-4 w-4 text-rose-600 dark:text-rose-400" />
            <h2 className="text-sm font-bold text-neutral-900 dark:text-white">
              Media & Cinema Consumption
            </h2>
          </div>
          <p className="mt-1 text-[11px] text-neutral-400">Screen time and watchlist velocity</p>

          <div className="mt-4 rounded-xl bg-neutral-50 p-4 dark:bg-neutral-800/40">
            <div className="flex items-center justify-between text-xs font-medium text-neutral-800 dark:text-neutral-200">
              <span>Watchlist Completion Rate</span>
              <span className="font-bold text-rose-600 dark:text-rose-400">14 Titles Watched</span>
            </div>
            <p className="mt-2 text-[11px] text-neutral-400">
              Balanced leisure: averages 4.5 hours of documented movie/series viewing weekly without impacting productivity.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}