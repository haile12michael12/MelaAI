"use client";

import React, { useMemo } from "react";
import type { ExpenseRecord } from "@/lib/firebase";
import { EmptyState } from "./empty-state";
import { PieChart, ArrowUpRight } from "lucide-react";
import Link from "next/link";

interface SpendingBreakdownProps {
  expenses: ExpenseRecord[];
  currency: string;
  onAddExpense?: () => void;
}

export function SpendingBreakdownWidget({ expenses, currency, onAddExpense }: SpendingBreakdownProps) {
  const categoryStats = useMemo(() => {
    const map: Record<string, number> = {};
    let total = 0;

    for (const exp of expenses) {
      if ((exp.amount || 0) > 0) {
        const cat = exp.category || "General";
        map[cat] = (map[cat] || 0) + (exp.amount || 0);
        total += exp.amount || 0;
      }
    }

    const list = Object.entries(map)
      .map(([name, amount]) => ({
        name,
        amount,
        percentage: total > 0 ? (amount / total) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    return { list: list.slice(0, 5), total };
  }, [expenses]);

  const palette = [
    "bg-indigo-500",
    "bg-emerald-500",
    "bg-amber-500",
    "bg-rose-500",
    "bg-cyan-500",
    "bg-purple-500",
  ];

  return (
    <div className="flex h-full flex-col rounded-3xl border border-neutral-200/80 bg-white/80 p-5 shadow-xs backdrop-blur-md dark:border-neutral-800/80 dark:bg-neutral-900/80">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">Spending Breakdown</h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">Top categories this month</p>
        </div>
        <Link
          href="/finance"
          className="flex items-center gap-1 text-xs font-medium text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
        >
          Ledger <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>

      {categoryStats.list.length === 0 ? (
        <div className="my-auto">
          <EmptyState
            icon={<PieChart className="h-5 w-5" />}
            title="No expense data"
            description="Log expenses to see category distribution and trends."
            actionLabel="Add Expense"
            onAction={onAddExpense}
          />
        </div>
      ) : (
        <div className="mt-4 flex flex-1 flex-col justify-between space-y-3">
          <div className="space-y-2.5">
            {categoryStats.list.map((cat, idx) => (
              <div key={cat.name} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-neutral-700 dark:text-neutral-300">{cat.name}</span>
                  <span className="font-mono text-neutral-900 dark:text-neutral-100">
                    {currency}{cat.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })} ({cat.percentage.toFixed(0)}%)
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
                  <div
                    className={`h-full rounded-full ${palette[idx % palette.length]}`}
                    style={{ width: `${cat.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 border-t border-neutral-100 pt-3 text-xs text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
            Total Tracked: <span className="font-semibold text-neutral-900 dark:text-white">{currency}{categoryStats.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>
        </div>
      )}
    </div>
  );
}
