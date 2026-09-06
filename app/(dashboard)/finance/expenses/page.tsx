import { RoutePlaceholder } from "@/components/route-placeholder";
"use client";

export default function ExpensesPage() { return <RoutePlaceholder title="Expenses" />; }
import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import type { ExpenseRecord } from "@/lib/firebase";
import { formatCurrency, ETHIOPIAN_CATEGORIES } from "@/lib/finance/intelligence";
import { Search, ArrowUpDown, Filter, Download, Plus, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ExpensesLedgerPage() {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!user) return setLoading(false);
      try {
        const res = await fetch("/api/expenses", {
          headers: { Authorization: `Bearer ${user.idToken}` },
        });
        if (res.ok) {
          const data = await res.json();
          setExpenses(Array.isArray(data) ? data : []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  const filtered = useMemo(() => {
    return expenses.filter((e) => {
      const matchQ =
        !search ||
        e.title.toLowerCase().includes(search.toLowerCase()) ||
        (e.notes && e.notes.toLowerCase().includes(search.toLowerCase()));
      const matchCat = categoryFilter === "all" || e.category === categoryFilter;
      return matchQ && matchCat;
    });
  }, [expenses, search, categoryFilter]);

  const exportCsv = () => {
    const headers = ["Title", "Amount (ETB)", "Category", "Date", "Notes"];
    const rows = filtered.map((e) => [
      `"${e.title.replace(/"/g, '""')}"`,
      e.amount,
      `"${(e.category || "").replace(/"/g, '""')}"`,
      e.date || "",
      `"${(e.notes || "").replace(/"/g, '""')}"`,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encoded = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encoded);
    link.setAttribute("download", `mela_expenses_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/finance" className="rounded-xl border border-neutral-200 p-2 text-neutral-500 hover:bg-neutral-100 dark:border-neutral-800">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-neutral-900 dark:text-white">Expenses Ledger</h1>
          <p className="text-xs text-neutral-500">Comprehensive transaction ledger in Ethiopian Birr</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search expenses by title or note..."
              className="w-full rounded-xl border border-neutral-200 bg-white py-2 pl-9 pr-3 text-xs text-neutral-900 outline-none focus:border-emerald-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-white"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs text-neutral-700 outline-none dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300"
          >
            <option value="all">All Categories</option>
            {ETHIOPIAN_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={exportCsv}
          className="flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-3.5 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300"
        >
          <Download className="h-4 w-4" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-neutral-200/80 bg-white shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-neutral-100 bg-neutral-50/50 text-[11px] font-semibold text-neutral-500 dark:border-neutral-800 dark:bg-neutral-800/40">
            <tr>
              <th className="px-4 py-3">Transaction</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3 text-right">Amount (ETB)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-neutral-400">
                  No matching expense records found.
                </td>
              </tr>
            ) : (
              filtered.map((e) => {
                const isExpense = (e.amount || 0) >= 0;
                return (
                  <tr key={e.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/40">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-neutral-900 dark:text-white">{e.title}</p>
                      {e.notes && <p className="text-[10px] text-neutral-400">{e.notes}</p>}
                    </td>
                    <td className="px-4 py-3 text-neutral-600 dark:text-neutral-300">{e.category || "General"}</td>
                    <td className="px-4 py-3 text-neutral-500 dark:text-neutral-400">{e.date || "—"}</td>
                    <td className="px-4 py-3 text-right font-bold">
                      <span className={isExpense ? "text-neutral-900 dark:text-white" : "text-emerald-600 dark:text-emerald-400"}>
                        {formatCurrency(Math.abs(e.amount || 0), "ETB")}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}