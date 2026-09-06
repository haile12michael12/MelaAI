import { RoutePlaceholder } from "@/components/route-placeholder";
"use client";

export default function HabitsPage() { return <RoutePlaceholder title="Habits" />; }
import React, { useState, useEffect } from "react";
import { Zap, Plus, Check, Flame, Award, Trash2 } from "lucide-react";

interface HabitItem {
  id: string;
  title: string;
  category: string;
  streak: number;
  completedToday: boolean;
  history: boolean[]; // last 7 days
}

export default function HabitsPage() {
  const [habits, setHabits] = useState<HabitItem[]>([
    { id: "1", title: "Daily Expense Ledger Check", category: "Finance", streak: 12, completedToday: true, history: [true, true, true, true, true, true, true] },
    { id: "2", title: "Read 20 pages of a book", category: "Learning", streak: 5, completedToday: false, history: [true, true, false, true, true, true, false] },
    { id: "3", title: "30-min Morning Walk / Workout", category: "Health", streak: 8, completedToday: true, history: [true, true, true, true, true, true, true] },
    { id: "4", title: "Amharic / English writing practice", category: "Language", streak: 3, completedToday: false, history: [false, true, true, false, true, true, false] },
  ]);

  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Daily");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("mela_habits");
      if (saved) {
        try {
          setHabits(JSON.parse(saved));
        } catch {}
      }
    }
  }, []);

  const saveHabits = (updated: HabitItem[]) => {
    setHabits(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("mela_habits", JSON.stringify(updated));
    }
  };

  const handleToggle = (id: string) => {
    saveHabits(
      habits.map((h) => {
        if (h.id === id) {
          const nextState = !h.completedToday;
          return {
            ...h,
            completedToday: nextState,
            streak: nextState ? h.streak + 1 : Math.max(0, h.streak - 1),
          };
        }
        return h;
      })
    );
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newHabit: HabitItem = {
      id: String(Date.now()),
      title: title.trim(),
      category,
      streak: 0,
      completedToday: false,
      history: [false, false, false, false, false, false, false],
    };

    saveHabits([newHabit, ...habits]);
    setTitle("");
    setShowAdd(false);
  };

  const handleDelete = (id: string) => {
    saveHabits(habits.filter((h) => h.id !== id));
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Habits & Daily Routines
          </h1>
          <p className="text-xs text-neutral-500">
            Maintain daily consistency, streaks, and disciplined lifestyle habits
          </p>
        </div>

        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-1.5 rounded-xl bg-neutral-900 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-neutral-800 dark:bg-white dark:text-neutral-900"
        >
          <Plus className="h-4 w-4" />
          <span>New Habit</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {habits.map((h) => (
          <div
            key={h.id}
            className="flex flex-col justify-between rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-xs dark:border-neutral-800/80 dark:bg-neutral-900"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-bold text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
                  {h.category}
                </span>

                <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
                  <Flame className="h-4 w-4 fill-amber-500" />
                  <span>{h.streak} Day Streak</span>
                </div>
              </div>

              <h3 className="mt-3 text-sm font-bold text-neutral-900 dark:text-white">{h.title}</h3>

              {/* 7-day completion dots */}
              <div className="mt-4 flex items-center gap-1.5">
                {h.history.map((done, idx) => (
                  <div
                    key={idx}
                    className={`h-2.5 flex-1 rounded-full ${
                      done ? "bg-emerald-500" : "bg-neutral-100 dark:bg-neutral-800"
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-neutral-100 pt-3 dark:border-neutral-800">
              <button
                onClick={() => handleToggle(h.id)}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                  h.completedToday
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                    : "border border-neutral-200 text-neutral-700 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-300"
                }`}
              >
                <Check className="h-3.5 w-3.5" />
                <span>{h.completedToday ? "Completed Today" : "Mark as Done"}</span>
              </button>

              <button
                onClick={() => handleDelete(h.id)}
                className="text-neutral-400 hover:text-red-500"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl border border-neutral-200 bg-white p-6 shadow-xl dark:border-neutral-800 dark:bg-neutral-900">
            <h3 className="text-base font-bold text-neutral-900 dark:text-white">New Habit</h3>
            <form onSubmit={handleAdd} className="mt-4 space-y-3.5">
              <div>
                <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300">Habit Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Read 20 mins, Drink 2L water"
                  className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs text-neutral-900 outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs text-neutral-900 outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                >
                  <option value="Finance">Finance</option>
                  <option value="Health">Health</option>
                  <option value="Learning">Learning</option>
                  <option value="Language">Language</option>
                  <option value="Mindfulness">Mindfulness</option>
                </select>
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