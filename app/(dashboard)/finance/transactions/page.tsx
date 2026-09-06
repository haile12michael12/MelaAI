"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, ArrowDownLeft, Search } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import type { ExpenseRecord } from "@/lib/firebase";
import { formatCurrency } from "@/lib/finance/intelligence";

export default function TransactionsPage() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<ExpenseRecord[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      if (!user) return;
      const res = await fetch("/api/expenses", {
        headers: { Authorization: `Bearer ${user.idToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        setTransactions(Array.isArray(data) ? data : []);
      }
    }
    load();
  }, [user]);

  const filtered = transactions.filter(
    (t) =>
      !search ||
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      (t.category && t.category.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/finance" className="rounded-xl border border-neutral-200 p-2 text-neutral-500 hover:bg-neutral-100 dark:border-neutral-800">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-neutral-900 dark:text-white">Transaction History</h1>
          <p className="text-xs text-neutral-500">Chronological transaction audit in ETB</p>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter transactions..."
          className="w-full rounded-xl border border-neutral-200 bg-white py-2 pl-9 pr-3 text-xs text-neutral-900 outline-none dark:border-neutral-800 dark:bg-neutral-900 dark:text-white"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
        <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-xs text-neutral-400">No transactions found.</div>
          ) : (
            filtered.map((t) => {
              const isExpense = (t.amount || 0) >= 0;
              return (
                <div key={t.id} className="flex items-center justify-between p-4 hover:bg-neutral-50/50 dark:hover:bg-neutral-800/40">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-xl text-xs font-bold ${isExpense ? "bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400" : "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400"}`}>
                      {isExpense ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownLeft className="h-4 w-4" />}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-neutral-900 dark:text-white">{t.title}</p>
                      <p className="text-[11px] text-neutral-400">{t.category || "General"} • {t.date || "Today"}</p>
                    </div>
                  </div>
                  <span className={`text-xs font-bold ${isExpense ? "text-neutral-900 dark:text-white" : "text-emerald-600 dark:text-emerald-400"}`}>
                    {isExpense ? "-" : "+"}{formatCurrency(Math.abs(t.amount || 0), "ETB")}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}