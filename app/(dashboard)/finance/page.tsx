"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import type { ExpenseRecord } from "@/lib/firebase";
import {
  MelaFinanceIntelligence,
  formatCurrency,
  ETHIOPIAN_CATEGORIES,
} from "@/lib/finance/intelligence";
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Plus,
  CreditCard,
  Building2,
  Phone,
  Banknote,
  PiggyBank,
  TrendingDown,
  Sparkles,
  PieChart,
  Calendar,
  AlertCircle,
  FileSpreadsheet,
} from "lucide-react";
import Link from "next/link";

interface AccountSummary {
  name: string;
  nameAm: string;
  type: "telebirr" | "cbe" | "awash" | "cash";
  balance: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

export default function FinanceHubPage() {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(ETHIOPIAN_CATEGORIES[0]);
  const [type, setType] = useState<"expense" | "income">("expense");
  const [account, setAccount] = useState<string>("telebirr");
  const [submitting, setSubmitting] = useState(false);

  // Sample balances
  const [accounts, setAccounts] = useState<AccountSummary[]>([
    { name: "Telebirr", nameAm: "ቴሌብር", type: "telebirr", balance: 14250.0, icon: Phone, color: "bg-amber-500 text-white" },
    { name: "CBE Birr", nameAm: "ንግድ ባንክ", type: "cbe", balance: 52400.0, icon: Building2, color: "bg-purple-600 text-white" },
    { name: "Awash Bank", nameAm: "አዋሽ ባንክ", type: "awash", balance: 31800.0, icon: CreditCard, color: "bg-blue-600 text-white" },
    { name: "Cash (ጥሬ ገንዘብ)", nameAm: "ጥሬ ገንዘብ", type: "cash", balance: 4500.0, icon: Banknote, color: "bg-emerald-600 text-white" },
  ]);

  useEffect(() => {
    async function loadData() {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch("/api/expenses", {
          headers: { Authorization: `Bearer ${user.idToken}` },
        });
        if (res.ok) {
          const data = await res.json();
          setExpenses(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error("Finance fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user]);

  const spending = useMemo(() => MelaFinanceIntelligence.analyzeSpending(expenses), [expenses]);
  const categoryStats = useMemo(() => MelaFinanceIntelligence.analyzeCategories(expenses), [expenses]);
  const recurring = useMemo(() => MelaFinanceIntelligence.detectRecurringExpenses(expenses), [expenses]);

  const totalLiquidCash = useMemo(() => accounts.reduce((sum, a) => sum + a.balance, 0), [accounts]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !amount) return;
    setSubmitting(true);
    try {
      const parsedAmt = parseFloat(amount);
      const finalAmount = type === "expense" ? Math.abs(parsedAmt) : -Math.abs(parsedAmt);
      const dateStr = new Date().toISOString().slice(0, 10);

      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.idToken || ""}`,
        },
        body: JSON.stringify({
          title: title.trim(),
          amount: finalAmount,
          category,
          date: dateStr,
          notes: `Logged via Account: ${account}`,
        }),
      });

      if (res.ok) {
        const created = await res.json();
        const newRecord: ExpenseRecord = {
          id: created.id || String(Date.now()),
          title: title.trim(),
          amount: finalAmount,
          category,
          date: dateStr,
          notes: `Logged via Account: ${account}`,
          createdAt: Date.now(),
        };
        setExpenses((prev) => [newRecord, ...prev]);

        // Update local account balance
        setAccounts((prev) =>
          prev.map((acc) =>
            acc.type === account
              ? { ...acc, balance: Math.max(0, acc.balance - (type === "expense" ? parsedAmt : -parsedAmt)) }
              : acc
          )
        );

        setTitle("");
        setAmount("");
        setShowAddModal(false);
      }
    } catch (err) {
      console.error("Failed to add transaction:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Finance & Accounts Hub
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Unified Ethiopian Birr (ETB) personal ledger, digital wallets, bank balances & Equb savings
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/mela/finance"
            className="flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-xs font-semibold text-emerald-800 transition hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
          >
            <Sparkles className="h-4 w-4" />
            <span>AI Finance Intel</span>
          </Link>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 rounded-xl bg-neutral-900 px-3.5 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
          >
            <Plus className="h-4 w-4" />
            <span>Add Transaction</span>
          </button>
        </div>
      </div>

      {/* Ethiopian Accounts & Wallets Carousel */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            Ethiopian Wallets & Accounts
          </h2>
          <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
            Total Liquid: {formatCurrency(totalLiquidCash, "ETB")}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {accounts.map((acc) => {
            const Icon = acc.icon;
            return (
              <div
                key={acc.type}
                className="group relative overflow-hidden rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-xs transition hover:-translate-y-0.5 hover:shadow-md dark:border-neutral-800/80 dark:bg-neutral-900"
              >
                <div className="flex items-center justify-between">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${acc.color} shadow-xs`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-[11px] font-medium text-neutral-400 dark:text-neutral-500">
                    {acc.nameAm}
                  </span>
                </div>
                <div className="mt-4">
                  <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">{acc.name}</p>
                  <p className="mt-1 text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
                    {formatCurrency(acc.balance, "ETB")}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-xs dark:border-neutral-800/80 dark:bg-neutral-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Monthly Spending</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-400">
              <ArrowUpRight className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-neutral-900 dark:text-white">
            {formatCurrency(spending.totalOutflow, "ETB")}
          </p>
          <p className="mt-1 text-[11px] text-neutral-400">
            {spending.transactionCount} recorded transactions
          </p>
        </div>

        <div className="rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-xs dark:border-neutral-800/80 dark:bg-neutral-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Daily Burn Rate</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
              <TrendingDown className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-neutral-900 dark:text-white">
            {formatCurrency(spending.dailyAverage, "ETB")}/day
          </p>
          <p className="mt-1 text-[11px] text-neutral-400">Paced over 30-day window</p>
        </div>

        <div className="rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-xs dark:border-neutral-800/80 dark:bg-neutral-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Equb & Collective Funds</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <PiggyBank className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-neutral-900 dark:text-white">
            {formatCurrency(
              categoryStats.find((c) => c.category.includes("Equb"))?.total || 0,
              "ETB"
            )}
          </p>
          <p className="mt-1 text-[11px] text-neutral-400">Active rotating savings contribution</p>
        </div>
      </div>

      {/* Category Breakdown & Recent Transactions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Ethiopian Category Distribution */}
        <div className="rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-xs lg:col-span-1 dark:border-neutral-800/80 dark:bg-neutral-900">
          <h3 className="text-sm font-bold text-neutral-900 dark:text-white">Ethiopian Categories</h3>
          <p className="mt-0.5 text-[11px] text-neutral-500 dark:text-neutral-400">
            Equb, Edir, Teff, Ride, Utilities & Rent
          </p>

          <div className="mt-4 space-y-3">
            {categoryStats.slice(0, 6).map((c) => (
              <div key={c.category} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-neutral-700 dark:text-neutral-300">{c.category}</span>
                  <span className="font-bold text-neutral-900 dark:text-white">
                    {formatCurrency(c.total, "ETB")}
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
                  <div
                    className="h-full rounded-full bg-emerald-500"
                    style={{ width: `${Math.min(100, c.percentage)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Ledger Records */}
        <div className="rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-xs lg:col-span-2 dark:border-neutral-800/80 dark:bg-neutral-900">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white">Recent Transactions</h3>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">All ledger entries in ETB</p>
            </div>
            <Link
              href="/finance/expenses"
              className="text-xs font-semibold text-emerald-600 hover:underline dark:text-emerald-400"
            >
              View Full Ledger &rarr;
            </Link>
          </div>

          <div className="mt-4 divide-y divide-neutral-100 dark:divide-neutral-800">
            {expenses.length === 0 ? (
              <div className="py-8 text-center text-xs text-neutral-400">
                No transactions recorded yet. Click &ldquo;Add Transaction&rdquo; above.
              </div>
            ) : (
              expenses.slice(0, 8).map((e) => {
                const isExpense = (e.amount || 0) >= 0;
                return (
                  <div key={e.id} className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-xl text-xs font-bold ${
                          isExpense
                            ? "bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400"
                            : "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400"
                        }`}
                      >
                        {isExpense ? "-" : "+"}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-neutral-900 dark:text-white">{e.title}</p>
                        <p className="text-[11px] text-neutral-400">
                          {e.category || "General"} • {e.date || "Today"}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`text-xs font-bold ${
                        isExpense
                          ? "text-neutral-900 dark:text-white"
                          : "text-emerald-600 dark:text-emerald-400"
                      }`}
                    >
                      {formatCurrency(Math.abs(e.amount || 0), "ETB")}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Add Transaction Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-6 shadow-xl dark:border-neutral-800 dark:bg-neutral-900">
            <h3 className="text-base font-bold text-neutral-900 dark:text-white">Record Transaction</h3>
            <p className="text-xs text-neutral-500">Log an Ethiopian expense or income transaction</p>

            <form onSubmit={handleCreate} className="mt-4 space-y-3.5">
              <div className="flex rounded-xl bg-neutral-100 p-1 dark:bg-neutral-800">
                <button
                  type="button"
                  onClick={() => setType("expense")}
                  className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition ${
                    type === "expense" ? "bg-white text-neutral-900 shadow-xs dark:bg-neutral-700 dark:text-white" : "text-neutral-500"
                  }`}
                >
                  Expense (ወጪ)
                </button>
                <button
                  type="button"
                  onClick={() => setType("income")}
                  className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition ${
                    type === "income" ? "bg-white text-neutral-900 shadow-xs dark:bg-neutral-700 dark:text-white" : "text-neutral-500"
                  }`}
                >
                  Income (ገቢ)
                </button>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300">
                  Title / Description
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Teff Market, Ride Addis, Monthly Equb"
                  className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs text-neutral-900 outline-none focus:border-emerald-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300">
                    Amount (ETB / ብር)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs text-neutral-900 outline-none focus:border-emerald-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300">
                    Account / Wallet
                  </label>
                  <select
                    value={account}
                    onChange={(e) => setAccount(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs text-neutral-900 outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                  >
                    <option value="telebirr">Telebirr (ቴሌብር)</option>
                    <option value="cbe">CBE Birr (ንግድ ባንክ)</option>
                    <option value="awash">Awash Bank (አዋሽ ባንክ)</option>
                    <option value="cash">Cash (ጥሬ ገንዘብ)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs text-neutral-900 outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                >
                  {ETHIOPIAN_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mt-5 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-xl border border-neutral-200 px-3.5 py-1.5 text-xs font-semibold text-neutral-600 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 disabled:opacity-50"
                >
                  {submitting ? "Saving..." : "Save Transaction"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}