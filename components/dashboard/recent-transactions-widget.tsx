"use client";

import React from "react";
import type { ExpenseRecord } from "@/lib/firebase";
import { EmptyState } from "./empty-state";
import { Receipt, ArrowUpRight, Plus } from "lucide-react";
import Link from "next/link";

interface RecentTransactionsWidgetProps {
  expenses: ExpenseRecord[];
  currency: string;
  onAddExpense?: () => void;
}

export function RecentTransactionsWidget({ expenses, currency, onAddExpense }: RecentTransactionsWidgetProps) {
  const recent = expenses.slice(0, 6);

  return (
    <div className="flex h-full flex-col rounded-3xl border border-neutral-200/80 bg-white/80 p-5 shadow-xs backdrop-blur-md dark:border-neutral-800/80 dark:bg-neutral-900/80">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">Recent Transactions</h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">Latest expense & income entries</p>
        </div>
        <div className="flex items-center gap-2">
          {onAddExpense && (
            <button
              onClick={onAddExpense}
              className="flex h-7 w-7 items-center justify-center rounded-lg bg-neutral-100 text-neutral-600 transition hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
              title="Add Transaction"
            >
              <Plus className="h-4 w-4" />
            </button>
          )}
          <Link
            href="/finance"
            className="flex items-center gap-1 text-xs font-medium text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
          >
            All <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>
      </div>

      {recent.length === 0 ? (
        <div className="my-auto">
          <EmptyState
            icon={<Receipt className="h-5 w-5" />}
            title="No transactions yet"
            description="Start recording your daily expenses or income."
            actionLabel="Add Transaction"
            onAction={onAddExpense}
          />
        </div>
      ) : (
        <div className="mt-3 divide-y divide-neutral-100 overflow-y-auto max-h-72 dark:divide-neutral-800/70">
          {recent.map((item) => {
            const isIncome = (item.amount || 0) < 0;
            const displayAmt = Math.abs(item.amount || 0);

            return (
              <div key={item.id} className="flex items-center justify-between py-2.5">
                <div className="min-w-0 pr-2">
                  <p className="truncate text-xs font-semibold text-neutral-900 dark:text-neutral-100">{item.title}</p>
                  <div className="flex items-center gap-2 text-[10px] text-neutral-400">
                    <span>{item.date || "Today"}</span>
                    {item.category && (
                      <span className="rounded bg-neutral-100 px-1.5 py-0.5 font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
                        {item.category}
                      </span>
                    )}
                  </div>
                </div>
                <span
                  className={`font-mono text-xs font-semibold ${
                    isIncome ? "text-emerald-600 dark:text-emerald-400" : "text-neutral-900 dark:text-white"
                  }`}
                >
                  {isIncome ? "+" : "-"}
                  {currency}{displayAmt.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
