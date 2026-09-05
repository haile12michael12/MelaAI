"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import type { ExpenseRecord } from "@/lib/firebase";
import {
  MelaFinanceIntelligence,
  formatCurrency,
  CurrencyCode,
  CURRENCY_SYMBOLS,
  ETHIOPIAN_CATEGORIES,
} from "@/lib/finance/intelligence";
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  AlertTriangle,
  RefreshCcw,
  Search,
  PieChart,
  HelpCircle,
  Calculator,
  Compass,
  ArrowRight,
  LayoutDashboard,
  Coins,
} from "lucide-react";
import Link from "next/link";

export default function MelaFinanceIntelligencePage() {
  const { user, loading: authLoading } = useAuth();

  const [currency, setCurrency] = useState<CurrencyCode>("ETB");
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);
  const [monthlySalary, setMonthlySalary] = useState(0);
  const [loading, setLoading] = useState(true);

  // Q&A state
  const [query, setQuery] = useState("");
  const [qaAnswer, setQaAnswer] = useState<string | null>(null);
  const [qaLoading, setQaLoading] = useState(false);

  // Month comparison state
  const [monthA, setMonthA] = useState("2026-08");
  const [monthB, setMonthB] = useState("2026-07");

  // Affordability calculator state
  const [purchaseAmount, setPurchaseAmount] = useState("");
  const [affordResult, setAffordResult] = useState<{ canAfford: boolean; message: string } | null>(null);

  useEffect(() => {
    if (!user) {
      if (!authLoading) setLoading(false);
      return;
    }

    async function loadFinanceData() {
      setLoading(true);
      try {
        const headers = { Authorization: `Bearer ${user?.idToken || ""}` };
        const res = await fetch("/api/expenses", { headers });
        if (res.ok) {
          const data = await res.json();
          setExpenses(Array.isArray(data) ? data : []);
        }

        const setRes = await fetch("/api/settings", { headers });
        if (setRes.ok) {
          const s = await setRes.json();
          if (s.monthlySalary) setMonthlySalary(Number(s.monthlySalary));
          if (s.currency && s.currency in CURRENCY_SYMBOLS) setCurrency(s.currency);
        }
      } catch (err) {
        console.error("Failed to load finance records:", err);
      } finally {
        setLoading(false);
      }
    }

    loadFinanceData();
  }, [user, authLoading]);

  // Calculations
  const spending = useMemo(() => MelaFinanceIntelligence.analyzeSpending(expenses), [expenses]);
  const income = useMemo(() => MelaFinanceIntelligence.analyzeIncome(expenses, monthlySalary), [expenses, monthlySalary]);
  const savings = useMemo(() => MelaFinanceIntelligence.analyzeSavings(income.totalInflow, spending.totalOutflow), [income, spending]);
  const categories = useMemo(() => MelaFinanceIntelligence.analyzeCategories(expenses), [expenses]);
  const merchants = useMemo(() => MelaFinanceIntelligence.analyzeMerchants(expenses), [expenses]);
  const recurring = useMemo(() => MelaFinanceIntelligence.detectRecurringExpenses(expenses), [expenses]);
  const anomalies = useMemo(() => MelaFinanceIntelligence.detectAnomalies(expenses), [expenses]);
  const health = useMemo(
    () => MelaFinanceIntelligence.calculateHealthScore(income.totalInflow, spending.totalOutflow, anomalies.length, categories.length),
    [income, spending, anomalies, categories]
  );
  const monthComparison = useMemo(() => MelaFinanceIntelligence.compareMonths(expenses, monthA, monthB), [expenses, monthA, monthB]);

  const handleAsk = async (customText?: string) => {
    const qText = customText || query;
    if (!qText.trim()) return;
    setQaLoading(true);
    try {
      const res = await fetch("/api/mela/finance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.idToken || ""}`,
        },
        body: JSON.stringify({ query: qText, currency, salary: monthlySalary }),
      });
      const data = await res.json();
      setQaAnswer(data.answer || "No response.");
    } catch {
      setQaAnswer("Failed to process question.");
    } finally {
      setQaLoading(false);
    }
  };

  const checkAffordability = (e: React.FormEvent) => {
    e.preventDefault();
    const cost = parseFloat(purchaseAmount);
    if (isNaN(cost) || cost <= 0) return;

    const netSurplus = income.totalInflow - spending.totalOutflow;
    const canAfford = netSurplus >= cost;

    setAffordResult({
      canAfford,
      message: canAfford
        ? `You can comfortably afford this. You will have ${formatCurrency(netSurplus - cost, currency)} remaining this month.`
        : `This exceeds your current monthly liquid surplus of ${formatCurrency(netSurplus, currency)}.`,
    });
  };

  const presetQuestions = [
    "How much did I spend on food?",
    "Where am I overspending?",
    "How much can I save monthly?",
    "Compare August and July.",
  ];

  return (
    <div className="min-h-screen bg-neutral-50/50 pb-20 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-50">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-neutral-200/80 bg-white/80 px-6 py-4 backdrop-blur-md dark:border-neutral-800/80 dark:bg-neutral-900/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white shadow-xs">
              <Coins className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-neutral-950 dark:text-white">
                MELA Finance Intelligence
              </h1>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                Deterministic analytics, cashflow reasoning & Ethiopian financial categories
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Currency Selector */}
            <div className="flex items-center gap-1 rounded-xl border border-neutral-200 bg-neutral-100 p-1 dark:border-neutral-800 dark:bg-neutral-800">
              {(Object.keys(CURRENCY_SYMBOLS) as CurrencyCode[]).map((c) => (
                <button
                  key={c}
                  onClick={() => setCurrency(c)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                    currency === c
                      ? "bg-white text-neutral-900 shadow-xs dark:bg-neutral-900 dark:text-white"
                      : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            <Link
              href="/mela/assistant"
              className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-indigo-700"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Ask Mela</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6">
        {/* 1. Health Score Banner */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <div className="flex flex-col justify-between rounded-3xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50/90 via-teal-50/60 to-cyan-50/90 p-6 shadow-xs backdrop-blur-md dark:border-emerald-900/50 dark:from-emerald-950/30 dark:via-teal-950/20 dark:to-cyan-950/30">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                  Financial Health Index
                </span>
                <span className="rounded-full bg-emerald-600 px-2.5 py-0.5 text-xs font-bold text-white">
                  Grade {health.grade}
                </span>
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-4xl font-extrabold text-neutral-950 dark:text-white">{health.score}</span>
                <span className="text-sm font-semibold text-neutral-400">/ 100</span>
              </div>
              <div className="mt-3 space-y-1.5 text-xs text-neutral-700 dark:text-neutral-300">
                {health.keyInsights.map((ins, i) => (
                  <p key={i} className="flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                    <span>{ins}</span>
                  </p>
                ))}
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 border-t border-emerald-200/60 pt-3 text-[11px] text-neutral-600 dark:border-emerald-900/40 dark:text-neutral-400">
              <div>Savings Score: <strong className="text-neutral-900 dark:text-white">{health.savingsScore}/40</strong></div>
              <div>Cashflow Score: <strong className="text-neutral-900 dark:text-white">{health.cashflowScore}/25</strong></div>
            </div>
          </div>

          {/* 2. Interactive Natural Language Q&A */}
          <div className="flex flex-col justify-between rounded-3xl border border-neutral-200/80 bg-white/80 p-6 shadow-xs backdrop-blur-md dark:border-neutral-800/80 dark:bg-neutral-900/80 lg:col-span-2">
            <div>
              <div className="flex items-center gap-2">
                <HelpCircle className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-sm font-bold text-neutral-900 dark:text-white">Ask MELA Finance Intelligence</h3>
              </div>
              <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                Ask deterministic financial questions in plain English or Amharic concepts.
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                {presetQuestions.map((pq, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setQuery(pq);
                      handleAsk(pq);
                    }}
                    className="rounded-xl border border-neutral-200 bg-neutral-50 px-2.5 py-1 text-xs text-neutral-600 transition hover:bg-neutral-100 hover:text-neutral-900 dark:border-neutral-800 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700 dark:hover:text-white"
                  >
                    {pq}
                  </button>
                ))}
              </div>

              {qaAnswer && (
                <div className="mt-4 rounded-2xl border border-indigo-100 bg-indigo-50/70 p-4 text-xs leading-relaxed text-indigo-950 dark:border-indigo-900/40 dark:bg-indigo-950/30 dark:text-indigo-200">
                  <span className="font-bold">MELA Analysis:</span>
                  <div className="mt-1 whitespace-pre-line">{qaAnswer}</div>
                </div>
              )}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAsk();
              }}
              className="mt-4 flex gap-2"
            >
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. How much did I spend on Equb? Can I afford 5000 ETB purchase?"
                className="flex-1 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs text-neutral-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
              />
              <button
                type="submit"
                disabled={qaLoading || !query.trim()}
                className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-indigo-700 disabled:opacity-50"
              >
                {qaLoading ? "Evaluating..." : "Ask"}
              </button>
            </form>
          </div>
        </div>

        {/* 3. Metrics Summary Grid */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-2xl border border-neutral-200/80 bg-white/80 p-4 shadow-xs dark:border-neutral-800/80 dark:bg-neutral-900/80">
            <span className="text-xs text-neutral-500 dark:text-neutral-400">Total Inflow</span>
            <h4 className="mt-1 text-lg font-bold text-neutral-900 dark:text-white">{formatCurrency(income.totalInflow, currency)}</h4>
          </div>
          <div className="rounded-2xl border border-neutral-200/80 bg-white/80 p-4 shadow-xs dark:border-neutral-800/80 dark:bg-neutral-900/80">
            <span className="text-xs text-neutral-500 dark:text-neutral-400">Total Outflow</span>
            <h4 className="mt-1 text-lg font-bold text-neutral-900 dark:text-white">{formatCurrency(spending.totalOutflow, currency)}</h4>
          </div>
          <div className="rounded-2xl border border-neutral-200/80 bg-white/80 p-4 shadow-xs dark:border-neutral-800/80 dark:bg-neutral-900/80">
            <span className="text-xs text-neutral-500 dark:text-neutral-400">Savings Rate</span>
            <h4 className="mt-1 text-lg font-bold text-emerald-600 dark:text-emerald-400">{savings.savingsRate.toFixed(1)}%</h4>
          </div>
          <div className="rounded-2xl border border-neutral-200/80 bg-white/80 p-4 shadow-xs dark:border-neutral-800/80 dark:bg-neutral-900/80">
            <span className="text-xs text-neutral-500 dark:text-neutral-400">Daily Average Outflow</span>
            <h4 className="mt-1 text-lg font-bold text-neutral-900 dark:text-white">{formatCurrency(spending.dailyAverage, currency)}</h4>
          </div>
        </div>

        {/* 4. Month-over-Month Comparison & Affordability Calculator */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Month Comparison */}
          <div className="rounded-3xl border border-neutral-200/80 bg-white/80 p-5 shadow-xs backdrop-blur-md dark:border-neutral-800/80 dark:bg-neutral-900/80">
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">Deterministic Month-over-Month Comparison</h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">Select any two months to calculate exact shifts</p>

            <div className="mt-4 flex gap-3">
              <input
                type="month"
                value={monthA}
                onChange={(e) => setMonthA(e.target.value)}
                className="rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-xs text-neutral-900 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
              />
              <span className="self-center text-xs text-neutral-400">vs</span>
              <input
                type="month"
                value={monthB}
                onChange={(e) => setMonthB(e.target.value)}
                className="rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-xs text-neutral-900 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
              />
            </div>

            <div className="mt-4 rounded-2xl bg-neutral-50 p-4 dark:bg-neutral-800/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] text-neutral-500">{monthA}</p>
                  <p className="text-base font-bold text-neutral-900 dark:text-white">{formatCurrency(monthComparison.monthA.total, currency)}</p>
                </div>
                <div className={`flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold ${
                  monthComparison.isHigher ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300" : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                }`}>
                  {monthComparison.isHigher ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  <span>{monthComparison.percentageChange >= 0 ? "+" : ""}{monthComparison.percentageChange.toFixed(1)}%</span>
                </div>
                <div>
                  <p className="text-[11px] text-neutral-500">{monthB}</p>
                  <p className="text-base font-bold text-neutral-900 dark:text-white">{formatCurrency(monthComparison.monthB.total, currency)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Affordability Calculator */}
          <div className="rounded-3xl border border-neutral-200/80 bg-white/80 p-5 shadow-xs backdrop-blur-md dark:border-neutral-800/80 dark:bg-neutral-900/80">
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">Affordability Checker</h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">Test if a purchase fits your monthly savings buffer</p>

            <form onSubmit={checkAffordability} className="mt-4 flex gap-2">
              <input
                type="number"
                value={purchaseAmount}
                onChange={(e) => setPurchaseAmount(e.target.value)}
                placeholder={`Enter planned purchase amount (${currency})`}
                className="flex-1 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs text-neutral-900 focus:bg-white focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
              />
              <button
                type="submit"
                className="rounded-xl bg-neutral-900 px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-neutral-800 dark:bg-white dark:text-neutral-900"
              >
                Evaluate
              </button>
            </form>

            {affordResult && (
              <div className={`mt-4 rounded-2xl p-3.5 text-xs ${
                affordResult.canAfford
                  ? "border border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-200"
                  : "border border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200"
              }`}>
                <p className="font-bold">{affordResult.canAfford ? "✅ Safe Purchase" : "⚠️ High Impact"}</p>
                <p className="mt-1">{affordResult.message}</p>
              </div>
            )}
          </div>
        </div>

        {/* 5. Anomalies & Recurring Charges */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Spending Anomalies */}
          <div className="rounded-3xl border border-neutral-200/80 bg-white/80 p-5 shadow-xs backdrop-blur-md dark:border-neutral-800/80 dark:bg-neutral-900/80">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">Detected Anomalies & Spikes</h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">Transactions exceeding statistical threshold</p>
              </div>
              <AlertTriangle className="h-4 w-4 text-rose-500" />
            </div>

            {anomalies.length === 0 ? (
              <p className="mt-4 text-xs text-neutral-400">No anomalous spending spikes detected.</p>
            ) : (
              <div className="mt-4 space-y-2 max-h-48 overflow-y-auto">
                {anomalies.map((a) => (
                  <div key={a.id} className="flex items-center justify-between rounded-xl border border-rose-100 bg-rose-50/50 p-2.5 text-xs dark:border-rose-900/30 dark:bg-rose-950/20">
                    <div>
                      <p className="font-bold text-neutral-900 dark:text-white">{a.title}</p>
                      <span className="text-[10px] text-neutral-400">{a.date} • {a.category}</span>
                    </div>
                    <span className="font-mono font-bold text-rose-600 dark:text-rose-400">
                      {formatCurrency(a.amount, currency)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recurring Charges */}
          <div className="rounded-3xl border border-neutral-200/80 bg-white/80 p-5 shadow-xs backdrop-blur-md dark:border-neutral-800/80 dark:bg-neutral-900/80">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">Detected Recurring Charges</h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">Repeating transaction patterns</p>
              </div>
              <RefreshCcw className="h-4 w-4 text-indigo-500" />
            </div>

            {recurring.length === 0 ? (
              <p className="mt-4 text-xs text-neutral-400">No recurring patterns found yet.</p>
            ) : (
              <div className="mt-4 space-y-2 max-h-48 overflow-y-auto">
                {recurring.map((r, i) => (
                  <div key={i} className="flex items-center justify-between rounded-xl border border-neutral-100 p-2.5 text-xs dark:border-neutral-800">
                    <div>
                      <p className="font-semibold text-neutral-800 dark:text-neutral-200 capitalize">{r.title}</p>
                      <span className="text-[10px] uppercase text-neutral-400">{r.frequency} ({r.occurrences}x)</span>
                    </div>
                    <span className="font-mono font-bold text-neutral-900 dark:text-white">
                      {formatCurrency(r.amount, currency)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 6. Ethiopian Categories & Merchant Breakdown */}
        <div className="rounded-3xl border border-neutral-200/80 bg-white/80 p-6 shadow-xs backdrop-blur-md dark:border-neutral-800/80 dark:bg-neutral-900/80">
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">Category & Merchant Distribution</h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">Localized breakdown across standard & Ethiopian categories</p>

          <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <h4 className="text-xs font-bold uppercase text-neutral-400">Categories</h4>
              <div className="mt-2 space-y-2 max-h-52 overflow-y-auto">
                {categories.map((c) => (
                  <div key={c.category} className="flex items-center justify-between text-xs">
                    <span className="text-neutral-700 dark:text-neutral-300">{c.category}</span>
                    <span className="font-mono font-semibold text-neutral-900 dark:text-white">
                      {formatCurrency(c.total, currency)} ({c.percentage.toFixed(0)}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase text-neutral-400">Top Merchants & Payees</h4>
              <div className="mt-2 space-y-2 max-h-52 overflow-y-auto">
                {merchants.map((m) => (
                  <div key={m.merchant} className="flex items-center justify-between text-xs">
                    <span className="text-neutral-700 dark:text-neutral-300">{m.merchant}</span>
                    <span className="font-mono font-semibold text-neutral-900 dark:text-white">
                      {formatCurrency(m.total, currency)} ({m.count}x)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
