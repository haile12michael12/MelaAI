"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Wallet,
  TrendingUp,
  ArrowLeft,
  ArrowUpRight,
  ArrowDownRight,
  PieChart,
  BarChart2,
  AlertCircle,
  Building,
} from "lucide-react";
import { formatETB } from "@/lib/utils";

export default function FinancialAnalyticsPage() {
  const [selectedMonth, setSelectedMonth] = useState("2026-08");

  const financialData = {
    income: 60000,
    outflow: 42800,
    savings: 17200,
    savingsRate: 28.7,
    topMerchants: [
      { name: "Abyssinia Equb", amount: 15000, category: "Equb (እቁብ)" },
      { name: "Bole Landlord", amount: 12000, category: "House Rent (ቤት ኪራይ)" },
      { name: "Merkato Teff Wholesaler", amount: 8500, category: "Food & Teff" },
      { name: "Feres / Ride Transport", amount: 4200, category: "Transport" },
      { name: "Ethio Telecom Telebirr", amount: 2100, category: "Utilities & Tele" },
    ],
    accountDistribution: [
      { name: "Commercial Bank of Ethiopia (CBE)", balance: 145000, pct: 45 },
      { name: "Telebirr SuperApp Account", balance: 68500, pct: 21 },
      { name: "Awash Bank Savings", balance: 82000, pct: 25 },
      { name: "Physical Cash (ጥሬ ብር)", balance: 28000, pct: 9 },
    ],
  };

  return (
    <div className="space-y-6">
      {/* Back Link & Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/analytics"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-white mb-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Analytics Overview</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Wallet className="h-5 w-5" />
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
              Financial Velocity & Outflow Analytics
            </h1>
          </div>
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            Comprehensive breakdown of cash flows, Ethiopian banking distribution, and merchant spending
          </p>
        </div>

        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs font-semibold text-neutral-800 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200"
        >
          <option value="2026-08">August 2026 (ነሐሴ 2018)</option>
          <option value="2026-07">July 2026 (ሐምሌ 2018)</option>
          <option value="2026-06">June 2026 (ሰኔ 2018)</option>
        </select>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-xs dark:border-neutral-800/80 dark:bg-neutral-900">
          <span className="text-xs text-neutral-500 font-medium">Total Monthly Inflow</span>
          <p className="mt-2 text-2xl font-bold text-neutral-900 dark:text-white">
            {formatETB(financialData.income)}
          </p>
          <p className="mt-1 text-[11px] text-emerald-600 dark:text-emerald-400">Salary + Freelance</p>
        </div>

        <div className="rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-xs dark:border-neutral-800/80 dark:bg-neutral-900">
          <span className="text-xs text-neutral-500 font-medium">Total Monthly Outflow</span>
          <p className="mt-2 text-2xl font-bold text-rose-600 dark:text-rose-400">
            {formatETB(financialData.outflow)}
          </p>
          <p className="mt-1 text-[11px] text-neutral-400">Across 38 recorded transactions</p>
        </div>

        <div className="rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-xs dark:border-neutral-800/80 dark:bg-neutral-900">
          <span className="text-xs text-neutral-500 font-medium">Retained Savings</span>
          <p className="mt-2 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {formatETB(financialData.savings)}
          </p>
          <p className="mt-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
            {financialData.savingsRate}% Savings Rate (Grade: A)
          </p>
        </div>
      </div>

      {/* Two Column Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Account Balances Distribution */}
        <div className="rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-xs dark:border-neutral-800/80 dark:bg-neutral-900">
          <h2 className="text-sm font-bold text-neutral-900 dark:text-white">
            Ethiopian Banking & Wallet Asset Distribution
          </h2>
          <p className="text-[11px] text-neutral-400">Liquid reserves held across institutions</p>

          <div className="mt-4 space-y-3.5">
            {financialData.accountDistribution.map((acc) => (
              <div key={acc.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-neutral-700 dark:text-neutral-300">
                    {acc.name}
                  </span>
                  <span className="font-mono font-bold text-neutral-900 dark:text-white">
                    {formatETB(acc.balance)} ({acc.pct}%)
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-neutral-100 dark:bg-neutral-800">
                  <div
                    className="h-2 rounded-full bg-teal-500"
                    style={{ width: `${acc.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Outflow Merchants */}
        <div className="rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-xs dark:border-neutral-800/80 dark:bg-neutral-900">
          <h2 className="text-sm font-bold text-neutral-900 dark:text-white">
            Top Outflow Entities & Merchants
          </h2>
          <p className="text-[11px] text-neutral-400">Primary recipients of monthly capital</p>

          <div className="mt-4 divide-y divide-neutral-100 dark:divide-neutral-800">
            {financialData.topMerchants.map((merchant, idx) => (
              <div key={merchant.name} className="flex items-center justify-between py-2.5">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-6 w-6 items-center justify-center rounded-md bg-neutral-100 text-[11px] font-bold text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                    {idx + 1}
                  </span>
                  <div>
                    <p className="text-xs font-bold text-neutral-900 dark:text-white">{merchant.name}</p>
                    <p className="text-[10px] text-neutral-400">{merchant.category}</p>
                  </div>
                </div>
                <span className="font-mono text-xs font-bold text-neutral-900 dark:text-white">
                  {formatETB(merchant.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}