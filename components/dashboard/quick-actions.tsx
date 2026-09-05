"use client";

import React, { useState } from "react";
import { Plus, ArrowDownRight, ArrowUpRight, Target, CheckSquare, StickyNote, Sparkles, X } from "lucide-react";

export interface QuickActionsProps {
  onAddExpense: (data: { title: string; amount: number; category: string; date: string; notes?: string }) => Promise<void>;
  onAddIncome: (data: { title: string; amount: number; date: string }) => Promise<void>;
  onAddGoal: (data: { title: string; targetAmount: number; currentAmount: number }) => void;
  onAddTask: (data: { title: string; dueDate?: string }) => void;
  onAskMela: (prompt?: string) => void;
  currency: string;
}

type ActionType = "expense" | "income" | "goal" | "task" | "note" | null;

export function QuickActions({
  onAddExpense,
  onAddIncome,
  onAddGoal,
  onAddTask,
  onAskMela,
  currency,
}: QuickActionsProps) {
  const [activeModal, setActiveModal] = useState<ActionType>(null);
  const [loading, setLoading] = useState(false);

  // Form states
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("General");
  const [targetAmount, setTargetAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [noteContent, setNoteContent] = useState("");

  const resetForm = () => {
    setTitle("");
    setAmount("");
    setCategory("General");
    setTargetAmount("");
    setDueDate("");
    setNoteContent("");
    setActiveModal(null);
  };

  const handleExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !amount) return;
    setLoading(true);
    try {
      await onAddExpense({
        title,
        amount: parseFloat(amount),
        category,
        date: new Date().toISOString().slice(0, 10),
      });
      resetForm();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleIncomeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !amount) return;
    setLoading(true);
    try {
      await onAddIncome({
        title,
        amount: parseFloat(amount),
        date: new Date().toISOString().slice(0, 10),
      });
      resetForm();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !targetAmount) return;
    onAddGoal({
      title,
      targetAmount: parseFloat(targetAmount),
      currentAmount: amount ? parseFloat(amount) : 0,
    });
    resetForm();
  };

  const handleTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    onAddTask({
      title,
      dueDate: dueDate || undefined,
    });
    resetForm();
  };

  const actions = [
    { id: "expense", label: "Add Expense", icon: ArrowDownRight, color: "hover:border-rose-300 hover:text-rose-600 dark:hover:border-rose-900" },
    { id: "income", label: "Add Income", icon: ArrowUpRight, color: "hover:border-emerald-300 hover:text-emerald-600 dark:hover:border-emerald-900" },
    { id: "goal", label: "Add Goal", icon: Target, color: "hover:border-teal-300 hover:text-teal-600 dark:hover:border-teal-900" },
    { id: "task", label: "Add Task", icon: CheckSquare, color: "hover:border-blue-300 hover:text-blue-600 dark:hover:border-blue-900" },
    { id: "mela", label: "Ask MELA", icon: Sparkles, color: "bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-600 border-transparent text-white" },
  ];

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        {actions.map((act) => {
          const Icon = act.icon;
          const isMela = act.id === "mela";

          return (
            <button
              key={act.id}
              onClick={() => {
                if (isMela) onAskMela();
                else setActiveModal(act.id as ActionType);
              }}
              className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium transition shadow-2xs ${
                isMela
                  ? act.color
                  : `border-neutral-200/80 bg-white/80 text-neutral-700 backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-900/80 dark:text-neutral-200 ${act.color}`
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{act.label}</span>
            </button>
          );
        })}
      </div>

      {/* Modal Dialog */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl border border-neutral-200 bg-white p-6 shadow-xl dark:border-neutral-800 dark:bg-neutral-900">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3 dark:border-neutral-800">
              <h3 className="text-base font-semibold text-neutral-900 dark:text-white capitalize">
                {activeModal === "expense" && "Record Expense"}
                {activeModal === "income" && "Record Income"}
                {activeModal === "goal" && "Create New Goal"}
                {activeModal === "task" && "Create New Task"}
              </h3>
              <button
                onClick={resetForm}
                className="rounded-lg p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Expense Form */}
            {activeModal === "expense" && (
              <form onSubmit={handleExpenseSubmit} className="mt-4 space-y-3.5">
                <div>
                  <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-300">Title</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Grocery shopping, Coffee"
                    className="mt-1 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-300">Amount ({currency})</label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      className="mt-1 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm font-mono text-neutral-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-300">Category</label>
                    <input
                      type="text"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      placeholder="Food, Utilities, etc."
                      className="mt-1 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                    />
                  </div>
                </div>
                <div className="mt-6 flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="rounded-xl px-4 py-2 text-xs font-medium text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="rounded-xl bg-neutral-900 px-5 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-neutral-800 disabled:opacity-50 dark:bg-white dark:text-neutral-900"
                  >
                    {loading ? "Saving..." : "Save Expense"}
                  </button>
                </div>
              </form>
            )}

            {/* Income Form */}
            {activeModal === "income" && (
              <form onSubmit={handleIncomeSubmit} className="mt-4 space-y-3.5">
                <div>
                  <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-300">Source / Title</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Salary, Freelance, Dividend"
                    className="mt-1 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-300">Amount ({currency})</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="mt-1 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm font-mono text-neutral-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                  />
                </div>
                <div className="mt-6 flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="rounded-xl px-4 py-2 text-xs font-medium text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="rounded-xl bg-emerald-600 px-5 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-emerald-700 disabled:opacity-50"
                  >
                    {loading ? "Saving..." : "Save Income"}
                  </button>
                </div>
              </form>
            )}

            {/* Goal Form */}
            {activeModal === "goal" && (
              <form onSubmit={handleGoalSubmit} className="mt-4 space-y-3.5">
                <div>
                  <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-300">Goal Title</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Emergency Fund, New Laptop"
                    className="mt-1 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-300">Target Amount</label>
                    <input
                      type="number"
                      required
                      value={targetAmount}
                      onChange={(e) => setTargetAmount(e.target.value)}
                      placeholder="5000"
                      className="mt-1 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm font-mono text-neutral-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-300">Initial Saved</label>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0"
                      className="mt-1 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm font-mono text-neutral-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                    />
                  </div>
                </div>
                <div className="mt-6 flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="rounded-xl px-4 py-2 text-xs font-medium text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-teal-600 px-5 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-teal-700"
                  >
                    Create Goal
                  </button>
                </div>
              </form>
            )}

            {/* Task Form */}
            {activeModal === "task" && (
              <form onSubmit={handleTaskSubmit} className="mt-4 space-y-3.5">
                <div>
                  <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-300">Task Title</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Review monthly budget, Pay electricity bill"
                    className="mt-1 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-300">Due Date (Optional)</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                  />
                </div>
                <div className="mt-6 flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="rounded-xl px-4 py-2 text-xs font-medium text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-blue-700"
                  >
                    Create Task
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
