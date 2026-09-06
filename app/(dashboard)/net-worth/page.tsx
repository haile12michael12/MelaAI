import { RoutePlaceholder } from "@/components/route-placeholder";
"use client";

export default function NetWorthPage() { return <RoutePlaceholder title="Net worth" />; }
import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { formatCurrency } from "@/lib/finance/intelligence";
import { Scale, TrendingUp, ShieldCheck, ArrowUpRight, ArrowDownRight, Plus, Building } from "lucide-react";
import Link from "next/link";

export default function NetWorthPage() {
  const { user } = useAuth();
  const [liquidCash, setLiquidCash] = useState(102950.0); // Telebirr + CBE + Awash + Cash
  const [investmentVal, setInvestmentVal] = useState(250000.0);
  const [tangibleAssets, setTangibleAssets] = useState(850000.0); // Vehicle, Land/House equity
  const [liabilities, setLiabilities] = useState(45000.0); // Bank loan / credit

  const totalAssets = useMemo(() => liquidCash + investmentVal + tangibleAssets, [liquidCash, investmentVal, tangibleAssets]);
  const netWorth = useMemo(() => totalAssets - liabilities, [totalAssets, liabilities]);
  const debtRatio = useMemo(() => (totalAssets > 0 ? (liabilities / totalAssets) * 100 : 0), [totalAssets, liabilities]);

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
          Net Worth & Balance Sheet
        </h1>
        <p className="text-xs text-neutral-500">
          Total assets, liquid cash reserves, investment equity, and liabilities in ETB
        </p>
      </div>

      {/* Hero Card */}
      <div className="rounded-3xl border border-neutral-200/80 bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 p-8 text-white shadow-xl dark:border-neutral-800">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
              Total Net Worth (ጠቅላላ የተጣራ ሀብት)
            </span>
            <p className="mt-2 text-4xl font-extrabold tracking-tight">
              {formatCurrency(netWorth, "ETB")}
            </p>
            <p className="mt-2 text-xs text-neutral-400">
              ≈ ${(netWorth / 130).toLocaleString(undefined, { maximumFractionDigits: 0 })} USD reference rate
            </p>
          </div>

          <div className="flex gap-6 border-t border-neutral-700 pt-4 sm:border-t-0 sm:border-l sm:pl-8 sm:pt-0">
            <div>
              <span className="text-xs text-neutral-400">Total Assets</span>
              <p className="mt-1 text-lg font-bold text-emerald-400">
                {formatCurrency(totalAssets, "ETB")}
              </p>
            </div>
            <div>
              <span className="text-xs text-neutral-400">Total Debt</span>
              <p className="mt-1 text-lg font-bold text-red-400">
                {formatCurrency(liabilities, "ETB")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Asset Breakdown */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-xs dark:border-neutral-800/80 dark:bg-neutral-900">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white">Assets Breakdown</h3>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
              {formatCurrency(totalAssets, "ETB")}
            </span>
          </div>

          <div className="mt-5 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3 dark:border-neutral-800">
              <div>
                <p className="text-xs font-semibold text-neutral-900 dark:text-white">Liquid Cash & Accounts</p>
                <p className="text-[11px] text-neutral-400">Telebirr, CBE, Awash, Cash</p>
              </div>
              <span className="text-xs font-bold text-neutral-900 dark:text-white">
                {formatCurrency(liquidCash, "ETB")}
              </span>
            </div>

            <div className="flex items-center justify-between border-b border-neutral-100 pb-3 dark:border-neutral-800">
              <div>
                <p className="text-xs font-semibold text-neutral-900 dark:text-white">Investments & Fixed Deposits</p>
                <p className="text-[11px] text-neutral-400">Term deposits, shares & crypto</p>
              </div>
              <span className="text-xs font-bold text-neutral-900 dark:text-white">
                {formatCurrency(investmentVal, "ETB")}
              </span>
            </div>

            <div className="flex items-center justify-between pb-1">
              <div>
                <p className="text-xs font-semibold text-neutral-900 dark:text-white">Tangible Assets & Property</p>
                <p className="text-[11px] text-neutral-400">Vehicle, real estate equity, gold</p>
              </div>
              <span className="text-xs font-bold text-neutral-900 dark:text-white">
                {formatCurrency(tangibleAssets, "ETB")}
              </span>
            </div>
          </div>
        </div>

        {/* Liabilities */}
        <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-xs dark:border-neutral-800/80 dark:bg-neutral-900">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white">Liabilities & Obligations</h3>
            <span className="text-xs font-bold text-red-600 dark:text-red-400">
              {formatCurrency(liabilities, "ETB")}
            </span>
          </div>

          <div className="mt-5 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3 dark:border-neutral-800">
              <div>
                <p className="text-xs font-semibold text-neutral-900 dark:text-white">Bank Loans & Credit</p>
                <p className="text-[11px] text-neutral-400">Personal & vehicle loan</p>
              </div>
              <span className="text-xs font-bold text-neutral-900 dark:text-white">
                {formatCurrency(liabilities, "ETB")}
              </span>
            </div>

            <div className="rounded-xl bg-neutral-50 p-4 dark:bg-neutral-800/50">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-neutral-700 dark:text-neutral-300">Debt-to-Asset Ratio</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{debtRatio.toFixed(1)}%</span>
              </div>
              <p className="mt-1 text-[11px] text-neutral-400">
                Healthy financial standing. Debt ratio is under the recommended 25% threshold.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}