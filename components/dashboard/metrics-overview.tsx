"use client";

import React from "react";
import { Wallet, TrendingUp, ArrowDownRight, ArrowUpRight, PiggyBank, Briefcase } from "lucide-react";

export interface MetricsOverviewProps {
  currency: string;
  netWorth: number;
  currentBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  savingsRate: number;
  investmentValue: number;
  incomeChange?: number;
  expensesChange?: number;
}

export function MetricsOverview({
  currency,
  netWorth,
  currentBalance,
  monthlyIncome,
  monthlyExpenses,
  savingsRate,
  investmentValue,
}: MetricsOverviewProps) {
  const formatVal = (num: number) => {
    return `${currency}${Math.abs(num).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const metrics = [
    {
      id: "net-worth",
      label: "Net Worth",
      value: (netWorth < 0 ? "-" : "") + formatVal(netWorth),
      icon: Wallet,
      color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40",
      pill: "Assets - Liabilities",
      positive: netWorth >= 0,
    },
    {
      id: "balance",
      label: "Current Balance",
      value: (currentBalance < 0 ? "-" : "") + formatVal(currentBalance),
      icon: PiggyBank,
      color: "text-blue-500 bg-blue-50 dark:bg-blue-950/40",
      pill: "Available Liquid",
      positive: currentBalance >= 0,
    },
    {
      id: "income",
      label: "Monthly Income",
      value: formatVal(monthlyIncome),
      icon: ArrowUpRight,
      color: "text-teal-500 bg-teal-50 dark:bg-teal-950/40",
      pill: "This Month",
      positive: true,
    },
    {
      id: "expenses",
      label: "Monthly Expenses",
      value: formatVal(monthlyExpenses),
      icon: ArrowDownRight,
      color: "text-rose-500 bg-rose-50 dark:bg-rose-950/40",
      pill: "Total Outflow",
      positive: false,
    },
    {
      id: "savings-rate",
      label: "Savings Rate",
      value: `${Math.min(100, Math.max(0, savingsRate)).toFixed(1)}%`,
      icon: TrendingUp,
      color: "text-purple-500 bg-purple-50 dark:bg-purple-950/40",
      pill: savingsRate >= 20 ? "Target Met" : "Below 20%",
      positive: savingsRate >= 20,
    },
    {
      id: "investments",
      label: "Investment Value",
      value: formatVal(investmentValue),
      icon: Briefcase,
      color: "text-amber-500 bg-amber-50 dark:bg-amber-950/40",
      pill: "Portfolio Total",
      positive: true,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {metrics.map((m) => {
        const Icon = m.icon;
        return (
          <div
            key={m.id}
            className="group relative overflow-hidden rounded-2xl border border-neutral-200/80 bg-white/80 p-4 shadow-xs transition duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-neutral-800/80 dark:bg-neutral-900/80"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">{m.label}</span>
              <div className={`flex h-7 w-7 items-center justify-center rounded-xl ${m.color}`}>
                <Icon className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 truncate text-lg font-bold tracking-tight text-neutral-900 sm:text-xl dark:text-white">
              {m.value}
            </div>
            <div className="mt-1 flex items-center text-[11px] text-neutral-400 dark:text-neutral-500">
              <span className="truncate">{m.pill}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
