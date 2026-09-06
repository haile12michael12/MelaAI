"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, BarChart3, TrendingUp, Calendar, Download } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import type { ExpenseRecord } from "@/lib/firebase";
import { MelaFinanceIntelligence, formatCurrency } from "@/lib/finance/intelligence";

export default function ReportsPage() {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);

  useEffect(() => {
    async function load() {
      if (!user) return;
      const res = await fetch("/api/expenses", {
        headers: { Authorization: `Bearer ${user.idToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        setExpenses(Array.isArray(data) ? data : []);
      }
    }
    load();
  }, [user]);

  const categories = useMemo(() => MelaFinanceIntelligence.analyzeCategories(expenses), [expenses]);
  const merchants = useMemo(() => MelaFinanceIntelligence.analyzeMerchants(expenses), [expenses]);
  const spending = useMemo(() => MelaFinanceIntelligence.analyzeSpending(expenses), [expenses]);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/finance" className="rounded-xl border border-neutral-200 p-2 text-neutral-500 hover:bg-neutral-100 dark:border-neutral-800">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-neutral-900 dark:text-white">Financial Reports & Insights</h1>
          <p className="text-xs text-neutral-500">Spending patterns, merchant breakdowns & velocity in ETB</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
          <h3 className="text-sm font-bold text-neutral-900 dark:text-white">Top Expense Outflows</h3>
          <p className="text-[11px] text-neutral-400">Categorical spending breakdown</p>
          <div className="mt-4 space-y-3">
            {categories.slice(0, 6).map((c) => (
              <div key={c.category} className="space-y-1">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-neutral-700 dark:text-neutral-300">{c.category}</span>
                  <span className="font-bold text-neutral-900 dark:text-white">{formatCurrency(c.total, "ETB")}</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(100, c.percentage)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
          <h3 className="text-sm font-bold text-neutral-900 dark:text-white">Top Merchants & Payees</h3>
          <p className="text-[11px] text-neutral-400">Frequent transaction destinations</p>
          <div className="mt-4 space-y-3">
            {merchants.slice(0, 6).map((m) => (
              <div key={m.merchant} className="flex items-center justify-between text-xs py-1 border-b border-neutral-100 dark:border-neutral-800">
                <span className="font-medium text-neutral-700 dark:text-neutral-300">{m.merchant}</span>
                <span className="font-bold text-neutral-900 dark:text-white">{formatCurrency(m.total, "ETB")}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}