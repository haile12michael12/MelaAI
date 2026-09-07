"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  HabitItem,
  HabitLog,
  HabitCategory,
  HabitFrequency,
  HABIT_CATEGORIES,
  DEFAULT_HABITS,
  generateSeedLogs,
  MelaHabitsIntelligence,
} from "@/lib/habits/intelligence";
import {
  Flame,
  Zap,
  Plus,
  CheckCircle2,
  Circle,
  Sparkles,
  Award,
  TrendingUp,
  Calendar as CalendarIcon,
  Trash2,
  ArrowRight,
  Filter,
  Check,
  RotateCcw,
} from "lucide-react";

export default function HabitsDashboardPage() {
  const [habits, setHabits] = useState<HabitItem[]>(DEFAULT_HABITS);
  const [logs, setLogs] = useState<HabitLog[]>(generateSeedLogs());
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [melaQuery, setMelaQuery] = useState("");
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);

  // Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [habitForm, setHabitForm] = useState({
    title: "",
    description: "",
    category: "Health & Fitness" as HabitCategory,
    frequency: "daily" as HabitFrequency,
    targetPerWeek: 7,
    color: "#6366f1",
  });

  const refDateStr = "2026-09-07";

  // Compute stats for all habits
  const habitsWithStats = useMemo(() => {
    return habits.map((h) => ({
      ...h,
      stats: MelaHabitsIntelligence.calculateStats(h, logs, refDateStr),
      completedToday: logs.some((l) => l.habitId === h.id && l.date === refDateStr && l.completed),
    }));
  }, [habits, logs]);

  const heatmap = useMemo(() => {
    return MelaHabitsIntelligence.generateHeatmap(habits, logs, refDateStr);
  }, [habits, logs]);

  const summary = useMemo(() => {
    return MelaHabitsIntelligence.generateSummaryReport(habits, logs, refDateStr);
  }, [habits, logs]);

  const filteredHabits = useMemo(() => {
    return habitsWithStats.filter((h) => {
      if (selectedCategory !== "all" && h.category !== selectedCategory) return false;
      return true;
    });
  }, [habitsWithStats, selectedCategory]);

  // Toggle habit check-in for today
  const handleToggleToday = (habitId: string) => {
    setLogs((prev) => {
      const existingIdx = prev.findIndex((l) => l.habitId === habitId && l.date === refDateStr);
      if (existingIdx >= 0) {
        return prev.map((l, idx) => (idx === existingIdx ? { ...l, completed: !l.completed } : l));
      } else {
        return [...prev, { id: `log_${habitId}_${refDateStr}_${Date.now()}`, habitId, date: refDateStr, completed: true }];
      }
    });
  };

  // Create Habit
  const handleSaveHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!habitForm.title.trim()) return;

    const newHabit: HabitItem = {
      id: "h_" + Date.now(),
      title: habitForm.title.trim(),
      description: habitForm.description.trim() || undefined,
      category: habitForm.category,
      frequency: habitForm.frequency,
      targetPerWeek: Number(habitForm.targetPerWeek) || 7,
      color: habitForm.color,
      createdAt: new Date().toISOString().slice(0, 10),
    };

    setHabits((prev) => [...prev, newHabit]);
    setHabitForm({ title: "", description: "", category: "Health & Fitness", frequency: "daily", targetPerWeek: 7, color: "#6366f1" });
    setIsAddModalOpen(false);
  };

  // Handle MELA AI Question
  const handleAskMela = (q: string) => {
    const res = MelaHabitsIntelligence.answerQuestion(q, habits, logs, refDateStr);
    setAiAnswer(res.answer);
  };

  // 7-day rolling dates helper
  const last7Days = useMemo(() => {
    const list: string[] = [];
    const ref = new Date(refDateStr);
    for (let i = 6; i >= 0; i--) {
      const d = new Date(ref);
      d.setDate(ref.getDate() - i);
      list.push(d.toISOString().slice(0, 10));
    }
    return list;
  }, [refDateStr]);

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Habit Consistency & Routines
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Deterministic streak algorithms, heatmaps, and zero-hallucination habit intelligence.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4" />
          <span>New Habit</span>
        </button>
      </div>

      {/* KPI Stats Banner */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-xs dark:border-neutral-800/80 dark:bg-neutral-900">
          <span className="text-[11px] font-medium text-neutral-500">Overall Consistency</span>
          <p className="mt-1 text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {summary.overallConsistencyRate}%
          </p>
          <span className="text-[10px] text-neutral-400">30-day average</span>
        </div>

        <div className="rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-xs dark:border-neutral-800/80 dark:bg-neutral-900">
          <span className="text-[11px] font-medium text-neutral-500">Best Active Streak</span>
          <p className="mt-1 text-2xl font-extrabold text-amber-500 flex items-center gap-1">
            <Flame className="h-5 w-5 fill-amber-500 text-amber-500" />
            {summary.bestActiveStreak.streak} Days
          </p>
          <span className="truncate text-[10px] text-neutral-400 block">{summary.bestActiveStreak.title}</span>
        </div>

        <div className="rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-xs dark:border-neutral-800/80 dark:bg-neutral-900">
          <span className="text-[11px] font-medium text-neutral-500">All-Time Record</span>
          <p className="mt-1 text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
            <Award className="h-5 w-5" />
            {summary.bestAllTimeStreak.streak} Days
          </p>
          <span className="truncate text-[10px] text-neutral-400 block">{summary.bestAllTimeStreak.title}</span>
        </div>

        <div className="rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-xs dark:border-neutral-800/80 dark:bg-neutral-900">
          <span className="text-[11px] font-medium text-neutral-500">Month Check-ins</span>
          <p className="mt-1 text-2xl font-extrabold text-teal-600 dark:text-teal-400">
            {summary.monthlyCompletions}
          </p>
          <span className="text-[10px] text-neutral-400">September logs</span>
        </div>
      </div>

      {/* MELA AI Intelligence Quick Prompts */}
      <div className="rounded-3xl border border-indigo-200/70 bg-gradient-to-br from-indigo-50/80 to-purple-50/80 p-6 dark:border-indigo-900/50 dark:from-indigo-950/30 dark:to-purple-950/30">
        <div className="flex items-center gap-2 text-xs font-bold text-indigo-900 dark:text-indigo-300">
          <Sparkles className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          <span>MELA Habit Intelligence</span>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {[
            "What habits am I failing to maintain?",
            "What is my best streak?",
            "Which habit should I focus on?",
            "Summarize my habits this month.",
          ].map((prompt) => (
            <button
              key={prompt}
              onClick={() => handleAskMela(prompt)}
              className="rounded-xl border border-indigo-200/80 bg-white px-3 py-1.5 text-xs font-semibold text-indigo-700 shadow-2xs transition hover:bg-indigo-50 dark:border-indigo-800 dark:bg-neutral-900 dark:text-indigo-300 dark:hover:bg-indigo-950/50"
            >
              &ldquo;{prompt}&rdquo;
            </button>
          ))}
        </div>

        {aiAnswer && (
          <div className="mt-4 rounded-2xl bg-white p-4 text-xs shadow-xs dark:bg-neutral-900">
            <div className="whitespace-pre-line leading-relaxed text-neutral-800 dark:text-neutral-200">
              {aiAnswer}
            </div>
          </div>
        )}
      </div>

      {/* Calendar Activity Heatmap */}
      <div className="rounded-3xl border border-neutral-200/80 bg-white p-6 shadow-xs dark:border-neutral-800/80 dark:bg-neutral-900">
        <div className="flex items-center justify-between pb-4">
          <div>
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white">Activity Heatmap (Past 12 Weeks)</h3>
            <p className="text-xs text-neutral-500">Daily habit check-in frequency and consistency matrix</p>
          </div>

          <div className="flex items-center gap-1 text-[10px] text-neutral-400">
            <span>Less</span>
            <div className="h-2.5 w-2.5 rounded-xs bg-neutral-100 dark:bg-neutral-800" />
            <div className="h-2.5 w-2.5 rounded-xs bg-emerald-200 dark:bg-emerald-950" />
            <div className="h-2.5 w-2.5 rounded-xs bg-emerald-400 dark:bg-emerald-700" />
            <div className="h-2.5 w-2.5 rounded-xs bg-emerald-600 dark:bg-emerald-500" />
            <span>More</span>
          </div>
        </div>

        <div className="mt-2 flex flex-wrap gap-1.5">
          {heatmap.map((cell) => {
            const getColorClass = (intensity: number) => {
              switch (intensity) {
                case 4:
                  return "bg-emerald-600 dark:bg-emerald-500";
                case 3:
                  return "bg-emerald-500 dark:bg-emerald-600";
                case 2:
                  return "bg-emerald-400 dark:bg-emerald-700";
                case 1:
                  return "bg-emerald-200 dark:bg-emerald-950";
                default:
                  return "bg-neutral-100 dark:bg-neutral-800";
              }
            };

            return (
              <div
                key={cell.date}
                title={`${cell.date}: ${cell.count} habits completed`}
                className={`h-3.5 w-3.5 rounded-xs transition-all hover:ring-2 hover:ring-indigo-400 ${getColorClass(cell.intensity)}`}
              />
            );
          })}
        </div>
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setSelectedCategory("all")}
          className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
            selectedCategory === "all"
              ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
              : "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"
          }`}
        >
          All Habits ({habits.length})
        </button>
        {HABIT_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
              selectedCategory === cat
                ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                : "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Habits List */}
      <div className="space-y-4">
        {filteredHabits.map((h) => {
          const stats = h.stats;
          const completedSet = new Set(
            logs.filter((l) => l.habitId === h.id && l.completed).map((l) => l.date)
          );

          return (
            <div
              key={h.id}
              className="flex flex-col justify-between rounded-3xl border border-neutral-200/80 bg-white p-5 shadow-xs transition hover:shadow-md dark:border-neutral-800/80 dark:bg-neutral-900"
            >
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                {/* Left info */}
                <div className="flex items-start gap-3.5">
                  <button
                    onClick={() => handleToggleToday(h.id)}
                    className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-xl border border-neutral-200 bg-neutral-50 transition hover:scale-105 dark:border-neutral-700 dark:bg-neutral-800"
                  >
                    {h.completedToday ? (
                      <Check className="h-4 w-4 text-emerald-600 stroke-[3]" />
                    ) : (
                      <div className="h-3 w-3 rounded-full border border-neutral-300 dark:border-neutral-600" />
                    )}
                  </button>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                        {h.category}
                      </span>
                      <span className="text-neutral-300">•</span>
                      <span className="text-[10px] font-semibold text-neutral-400">
                        {h.frequency} ({h.targetPerWeek}d/wk)
                      </span>
                    </div>

                    <h3 className="mt-0.5 text-sm font-bold text-neutral-900 dark:text-white">
                      {h.title}
                    </h3>

                    {h.description && (
                      <p className="mt-0.5 text-xs text-neutral-500 leading-relaxed">
                        {h.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right stats */}
                <div className="flex items-center gap-6 border-t border-neutral-100 pt-3 sm:border-t-0 sm:pt-0">
                  {/* Streak Flame */}
                  <div className="text-right">
                    <div className="flex items-center gap-1 font-extrabold text-amber-500 text-sm">
                      <Flame className="h-4 w-4 fill-amber-500" />
                      <span>{stats.currentStreak}d</span>
                    </div>
                    <span className="text-[10px] text-neutral-400 font-medium">Best: {stats.bestStreak}d</span>
                  </div>

                  {/* 7-Day Dot Matrix */}
                  <div className="flex items-center gap-1.5">
                    {last7Days.map((dStr) => {
                      const isDone = completedSet.has(dStr);
                      return (
                        <div
                          key={dStr}
                          title={`${dStr}: ${isDone ? "Completed" : "Missed"}`}
                          className={`flex h-5 w-5 items-center justify-center rounded-lg text-[10px] font-bold ${
                            isDone
                              ? "bg-emerald-500 text-white"
                              : "bg-neutral-100 text-neutral-400 dark:bg-neutral-800"
                          }`}
                        >
                          {dStr === refDateStr ? "T" : ""}
                        </div>
                      );
                    })}
                  </div>

                  {/* 30-Day Completion % */}
                  <div className="w-16 text-right">
                    <span className="text-xs font-bold text-neutral-900 dark:text-white">
                      {stats.last30DaysRate}%
                    </span>
                    <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
                      <div
                        style={{ width: `${stats.last30DaysRate}%` }}
                        className="h-full rounded-full bg-indigo-600"
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => setHabits((prev) => prev.filter((item) => item.id !== h.id))}
                    className="p-1 text-neutral-400 hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Habit Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-neutral-900">
            <h3 className="text-base font-bold text-neutral-900 dark:text-white">Create New Habit</h3>

            <form onSubmit={handleSaveHabit} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">Habit Title</label>
                <input
                  type="text"
                  required
                  value={habitForm.title}
                  onChange={(e) => setHabitForm({ ...habitForm, title: e.target.value })}
                  placeholder="e.g. Read 20 pages"
                  className="mt-1 w-full rounded-xl border border-neutral-200 px-3 py-2 text-xs dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">Description (Optional)</label>
                <textarea
                  rows={2}
                  value={habitForm.description}
                  onChange={(e) => setHabitForm({ ...habitForm, description: e.target.value })}
                  placeholder="Notes or target details..."
                  className="mt-1 w-full rounded-xl border border-neutral-200 px-3 py-2 text-xs dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">Category</label>
                  <select
                    value={habitForm.category}
                    onChange={(e) => setHabitForm({ ...habitForm, category: e.target.value as HabitCategory })}
                    className="mt-1 w-full rounded-xl border border-neutral-200 px-3 py-2 text-xs dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                  >
                    {HABIT_CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">Frequency</label>
                  <select
                    value={habitForm.frequency}
                    onChange={(e) => setHabitForm({ ...habitForm, frequency: e.target.value as HabitFrequency })}
                    className="mt-1 w-full rounded-xl border border-neutral-200 px-3 py-2 text-xs dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                  >
                    <option value="daily">Daily (7d/wk)</option>
                    <option value="weekdays">Weekdays (5d/wk)</option>
                    <option value="weekends">Weekends (2d/wk)</option>
                    <option value="weekly_target">Custom Target</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">Target Days per Week (1–7)</label>
                <input
                  type="number"
                  min={1}
                  max={7}
                  value={habitForm.targetPerWeek}
                  onChange={(e) => setHabitForm({ ...habitForm, targetPerWeek: parseInt(e.target.value) || 7 })}
                  className="mt-1 w-full rounded-xl border border-neutral-200 px-3 py-2 text-xs dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700"
                >
                  Save Habit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
