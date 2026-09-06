import { RoutePlaceholder } from "@/components/route-placeholder";
"use client";

export default function TasksPage() { return <RoutePlaceholder title="Tasks" />; }
import React, { useState, useEffect } from "react";
import { CheckSquare, Plus, Trash2, Calendar, Sparkles, Filter } from "lucide-react";
import type { TaskItem } from "@/types/tasks";

interface ExtendedTask extends TaskItem {
  priority?: "urgent" | "high" | "normal" | "low";
  category?: string;
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<ExtendedTask[]>([
    { id: "1", title: "Pay monthly Equb contribution via Telebirr", completed: false, dueDate: "2026-09-10", priority: "urgent", category: "Equb & Finance" },
    { id: "2", title: "Review monthly electricity & Ethio Telecom bills", completed: false, dueDate: "2026-09-12", priority: "high", category: "Utilities" },
    { id: "3", title: "Prepare for Meskel festival family gathering", completed: false, dueDate: "2026-09-25", priority: "normal", category: "Family" },
    { id: "4", title: "Reconcile weekly ledger transactions", completed: true, dueDate: "2026-09-05", priority: "low", category: "Finance" },
  ]);

  const [filter, setFilter] = useState<"all" | "pending" | "completed">("all");
  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<ExtendedTask["priority"]>("normal");
  const [category, setCategory] = useState("Finance");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("mela_tasks");
      if (saved) {
        try {
          setTasks(JSON.parse(saved));
        } catch {}
      }
    }
  }, []);

  const saveTasks = (updated: ExtendedTask[]) => {
    setTasks(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("mela_tasks", JSON.stringify(updated));
    }
  };

  const handleToggle = (id: string) => {
    saveTasks(tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
  };

  const handleDelete = (id: string) => {
    saveTasks(tasks.filter((t) => t.id !== id));
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newTask: ExtendedTask = {
      id: String(Date.now()),
      title: title.trim(),
      completed: false,
      dueDate: dueDate || undefined,
      priority,
      category,
    };

    saveTasks([newTask, ...tasks]);
    setTitle("");
    setDueDate("");
    setShowAdd(false);
  };

  const filtered = tasks.filter((t) => {
    if (filter === "pending") return !t.completed;
    if (filter === "completed") return t.completed;
    return true;
  });

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Daily Task Planner
          </h1>
          <p className="text-xs text-neutral-500">
            Organize personal errands, Equb commitments & work priorities
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-1.5 rounded-xl bg-neutral-900 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-neutral-800 dark:bg-white dark:text-neutral-900"
          >
            <Plus className="h-4 w-4" />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between border-b border-neutral-200 pb-2 dark:border-neutral-800">
        <div className="flex gap-2 text-xs font-medium">
          {(["all", "pending", "completed"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-lg px-3 py-1 capitalize transition ${
                filter === f
                  ? "bg-neutral-900 font-semibold text-white dark:bg-white dark:text-neutral-900"
                  : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <span className="text-[11px] text-neutral-400">
          {tasks.filter((t) => !t.completed).length} pending
        </span>
      </div>

      {/* Task List */}
      <div className="space-y-2.5">
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-neutral-300 p-12 text-center text-xs text-neutral-400 dark:border-neutral-700">
            No tasks found in this view.
          </div>
        ) : (
          filtered.map((task) => (
            <div
              key={task.id}
              className={`group flex items-center justify-between rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-xs transition hover:border-neutral-300 dark:border-neutral-800/80 dark:bg-neutral-900 ${
                task.completed ? "opacity-60" : ""
              }`}
            >
              <div className="flex items-center gap-3.5">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => handleToggle(task.id)}
                  className="h-4 w-4 cursor-pointer rounded border-neutral-300 accent-emerald-600 dark:border-neutral-700"
                />
                <div>
                  <p
                    className={`text-xs font-semibold ${
                      task.completed
                        ? "text-neutral-400 line-through dark:text-neutral-500"
                        : "text-neutral-900 dark:text-white"
                    }`}
                  >
                    {task.title}
                  </p>
                  <div className="mt-1 flex items-center gap-2 text-[10px] text-neutral-400">
                    {task.category && (
                      <span className="rounded bg-neutral-100 px-1.5 py-0.5 dark:bg-neutral-800">
                        {task.category}
                      </span>
                    )}
                    {task.dueDate && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> Due {task.dueDate}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                {task.priority && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ${
                      task.priority === "urgent"
                        ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"
                        : task.priority === "high"
                        ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                        : "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400"
                    }`}
                  >
                    {task.priority}
                  </span>
                )}
                <button
                  onClick={() => handleDelete(task.id)}
                  className="opacity-0 transition-opacity group-hover:opacity-100 text-neutral-400 hover:text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl border border-neutral-200 bg-white p-6 shadow-xl dark:border-neutral-800 dark:bg-neutral-900">
            <h3 className="text-base font-bold text-neutral-900 dark:text-white">Add Task</h3>
            <form onSubmit={handleAdd} className="mt-4 space-y-3.5">
              <div>
                <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300">Task Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Telebirr Equb Transfer, Grocery Market"
                  className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs text-neutral-900 outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs text-neutral-900 outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                  >
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs text-neutral-900 outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                  >
                    <option value="Finance">Finance</option>
                    <option value="Equb & Edir">Equb & Edir</option>
                    <option value="Utilities">Utilities</option>
                    <option value="Family">Family</option>
                    <option value="Work">Work</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300">Due Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
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
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}