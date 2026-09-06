"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, PieChart, AlertTriangle, CheckCircle2 } from "lucide-react";
import { formatCurrency, ETHIOPIAN_CATEGORIES } from "@/lib/finance/intelligence";

interface BudgetItem {
  category: string;
  limit: number;
  spent: number;
}

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<BudgetItem[]>([
    { category: "Food & Teff (ምግብ / ጤፍ)", limit: 8000, spent: 5400 },
    { category: "Transport & Ride (ትራንስፖርት / ራይድ)", limit: 4500, spent: 3100 },
    { category: "Equb (እቁብ)", limit: 6000, spent: 6000 },
    { category: "Utilities & Tele (መብራት / ውሃ / ቴሌ)", limit: 2500, spent: 1800 },
    { category: "House Rent (ቤት ኪራይ)", limit: 15000, spent: 15000 },
  ]);

  const [showAdd, setShowAdd] = useState(false);
  const [newCategory, setNewCategory] = useState(ETHIOPIAN_CATEGORIES[0]);
  const [newLimit, setNewLimit] = useState("");

  const handleAddBudget = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLimit) return;
    setBudgets((prev) => [
      ...prev.filter((b) => b.category !== newCategory),
      { category: newCategory, limit: parseFloat(newLimit), spent: 0 },
    ]);
    setNewLimit("");
    setShowAdd(false);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/finance" className="rounded-xl border border-neutral-200 p-2 text-neutral-500 hover:bg-neutral-100 dark:border-neutral-800">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-neutral-900 dark:text-white">Monthly Budgets</h1>
            <p className="text-xs text-neutral-500">Category spending limits & velocity in ETB</p>
          </div>
        </div>

        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-1.5 rounded-xl bg-neutral-900 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-neutral-800 dark:bg-white dark:text-neutral-900"
        >
          <Plus className="h-4 w-4" />
          <span>Set Budget Limit</span>
        </button>
      </div>

      {/* Budget Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {budgets.map((b) => {
          const pct = Math.round((b.spent / b.limit) * 100);
          const isOver = pct > 100;
          const isNear = pct >= 80 && !isOver;

          return (
            <div
              key={b.category}
              className="rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-xs dark:border-neutral-800/80 dark:bg-neutral-900"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-neutral-900 dark:text-white text-xs">{b.category}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    isOver
                      ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"
                      : isNear
                      ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                      : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                  }`}
                >
                  {pct}% Spent
                </span>
              </div>

              <div className="mt-4 flex items-baseline justify-between">
                <span className="text-xl font-bold text-neutral-900 dark:text-white">
                  {formatCurrency(b.spent, "ETB")}
                </span>
                <span className="text-xs text-neutral-400">
                  of {formatCurrency(b.limit, "ETB")} limit
                </span>
              </div>

              {/* Progress bar */}
              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
                <div
                  className={`h-full rounded-full transition-all ${
                    isOver ? "bg-red-500" : isNear ? "bg-amber-500" : "bg-emerald-500"
                  }`}
                  style={{ width: `${Math.min(100, pct)}%` }}
                />
              </div>

              <p className="mt-2 text-[11px] text-neutral-500 dark:text-neutral-400">
                {isOver
                  ? `Over budget by ${formatCurrency(b.spent - b.limit, "ETB")}`
                  : `Remaining: ${formatCurrency(b.limit - b.spent, "ETB")}`}
              </p>
            </div>
          );
        })}
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl border border-neutral-200 bg-white p-6 shadow-xl dark:border-neutral-800 dark:bg-neutral-900">
            <h3 className="text-base font-bold text-neutral-900 dark:text-white">Set Budget Limit</h3>
            <form onSubmit={handleAddBudget} className="mt-4 space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs text-neutral-900 outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                >
                  {ETHIOPIAN_CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300">Monthly Limit (ETB)</label>
                <input
                  type="number"
                  required
                  value={newLimit}
                  onChange={(e) => setNewLimit(e.target.value)}
                  placeholder="5000"
                  className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs text-neutral-900 outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                />
              </div>

              <div className="mt-5 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAdd}
                  className="rounded-xl border border-neutral-200 px-3 py-1.5 text-xs font-semibold text-neutral-600 hover:bg-neutral-50 dark:border-neutral-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
                >
                  Save Budget
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}