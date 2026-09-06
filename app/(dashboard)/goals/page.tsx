import { RoutePlaceholder } from "@/components/route-placeholder";
"use client";

export default function GoalsPage() { return <RoutePlaceholder title="Goals" />; }
import React, { useState, useEffect } from "react";
import { formatCurrency } from "@/lib/finance/intelligence";
import { Target, Plus, CheckCircle, TrendingUp, Calendar, Trash2 } from "lucide-react";
import type { GoalItem } from "@/types/goals";

export default function GoalsPage() {
  const [goals, setGoals] = useState<GoalItem[]>([
    { id: "1", title: "Equb Payout Target (የእቁብ ድርሻ)", targetAmount: 120000, currentAmount: 60000, deadline: "2026-12-31" },
    { id: "2", title: "Emergency Reserve Fund", targetAmount: 80000, currentAmount: 48000, deadline: "2027-03-01" },
    { id: "3", title: "New Laptop / Tech Setup", targetAmount: 75000, currentAmount: 35000, deadline: "2026-11-15" },
  ]);

  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [currentAmount, setCurrentAmount] = useState("");
  const [deadline, setDeadline] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("mela_goals");
      if (saved) {
        try {
          setGoals(JSON.parse(saved));
        } catch {}
      }
    }
  }, []);

  const saveGoals = (updated: GoalItem[]) => {
    setGoals(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("mela_goals", JSON.stringify(updated));
    }
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !targetAmount) return;

    const newGoal: GoalItem = {
      id: String(Date.now()),
      title: title.trim(),
      targetAmount: parseFloat(targetAmount),
      currentAmount: currentAmount ? parseFloat(currentAmount) : 0,
      deadline: deadline || undefined,
    };

    saveGoals([newGoal, ...goals]);
    setTitle("");
    setTargetAmount("");
    setCurrentAmount("");
    setDeadline("");
    setShowAdd(false);
  };

  const handleDelete = (id: string) => {
    saveGoals(goals.filter((g) => g.id !== id));
  };

  const handleContribute = (id: string, addAmt: number) => {
    saveGoals(
      goals.map((g) => (g.id === id ? { ...g, currentAmount: g.currentAmount + addAmt } : g))
    );
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Life & Financial Goals
          </h1>
          <p className="text-xs text-neutral-500">
            Target savings, Equb milestones & progress tracking in ETB
          </p>
        </div>

        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-1.5 rounded-xl bg-neutral-900 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-neutral-800 dark:bg-white dark:text-neutral-900"
        >
          <Plus className="h-4 w-4" />
          <span>New Goal</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {goals.map((g) => {
          const pct = Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100));
          const isComplete = pct >= 100;

          return (
            <div
              key={g.id}
              className="flex flex-col justify-between rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-xs dark:border-neutral-800/80 dark:bg-neutral-900"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-neutral-900 dark:text-white text-sm">{g.title}</span>
                  {isComplete ? (
                    <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                      <CheckCircle className="h-3 w-3" /> Done
                    </span>
                  ) : (
                    <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-bold text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
                      {pct}%
                    </span>
                  )}
                </div>

                <div className="mt-4">
                  <div className="flex items-baseline justify-between text-xs">
                    <span className="text-lg font-bold text-neutral-900 dark:text-white">
                      {formatCurrency(g.currentAmount, "ETB")}
                    </span>
                    <span className="text-neutral-400">
                      of {formatCurrency(g.targetAmount, "ETB")}
                    </span>
                  </div>

                  <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isComplete ? "bg-emerald-500" : "bg-indigo-600"
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                {g.deadline && (
                  <div className="mt-3 flex items-center gap-1.5 text-[11px] text-neutral-400">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>Target: {g.deadline}</span>
                  </div>
                )}
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-neutral-100 pt-3 dark:border-neutral-800">
                <button
                  onClick={() => handleContribute(g.id, 1000)}
                  className="text-xs font-semibold text-emerald-600 hover:underline dark:text-emerald-400"
                >
                  +1,000 Br Deposit
                </button>
                <button
                  onClick={() => handleDelete(g.id)}
                  className="text-neutral-400 hover:text-red-500"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl border border-neutral-200 bg-white p-6 shadow-xl dark:border-neutral-800 dark:bg-neutral-900">
            <h3 className="text-base font-bold text-neutral-900 dark:text-white">New Goal</h3>
            <form onSubmit={handleAdd} className="mt-4 space-y-3.5">
              <div>
                <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300">Goal Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Equb Payout, House Down Payment"
                  className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs text-neutral-900 outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300">Target (ETB)</label>
                  <input
                    type="number"
                    required
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    placeholder="50000"
                    className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs text-neutral-900 outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300">Current (ETB)</label>
                  <input
                    type="number"
                    value={currentAmount}
                    onChange={(e) => setCurrentAmount(e.target.value)}
                    placeholder="0"
                    className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs text-neutral-900 outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300">Target Date</label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs text-neutral-900 outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                />
              </div>

              <div className="mt-5 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAdd(false)}
                  className="rounded-xl border border-neutral-200 px-3.5 py-1.5 text-xs font-semibold text-neutral-600 hover:bg-neutral-50 dark:border-neutral-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
                >
                  Save Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}