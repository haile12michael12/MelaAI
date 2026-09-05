"use client";

import React, { useMemo } from "react";
import type { InvestmentAsset } from "@/types";
import { EmptyState } from "./empty-state";
import { Briefcase, TrendingUp, TrendingDown, ArrowUpRight } from "lucide-react";
import Link from "next/link";

interface InvestmentsWidgetProps {
  assets: InvestmentAsset[];
  currency: string;
  onAddAsset?: () => void;
}

export function InvestmentsWidget({ assets, currency, onAddAsset }: InvestmentsWidgetProps) {
  const activeAssets = useMemo(() => assets.filter((a) => !a.isSold), [assets]);

  const summary = useMemo(() => {
    let totalVal = 0;
    let totalInvested = 0;

    for (const a of activeAssets) {
      totalVal += a.amount || 0;
      totalInvested += a.investedAmount || a.amount || 0;
    }

    const pnl = totalVal - totalInvested;
    const pnlPercent = totalInvested > 0 ? (pnl / totalInvested) * 100 : 0;

    return { totalVal, totalInvested, pnl, pnlPercent };
  }, [activeAssets]);

  return (
    <div className="flex h-full flex-col rounded-3xl border border-neutral-200/80 bg-white/80 p-5 shadow-xs backdrop-blur-md dark:border-neutral-800/80 dark:bg-neutral-900/80">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">Investment Portfolio</h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">Holdings & Valuation</p>
        </div>
        <Link
          href="/investments"
          className="flex items-center gap-1 text-xs font-medium text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
        >
          Portfolio <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>

      {activeAssets.length === 0 ? (
        <div className="my-auto">
          <EmptyState
            icon={<Briefcase className="h-5 w-5" />}
            title="No investments tracked"
            description="Add stocks, crypto, mutual funds, gold or FDs."
            actionLabel="Add Holding"
            onAction={onAddAsset}
          />
        </div>
      ) : (
        <div className="mt-4 flex flex-1 flex-col justify-between space-y-4">
          <div className="rounded-2xl bg-neutral-50 p-3.5 dark:bg-neutral-800/50">
            <div className="flex items-baseline justify-between">
              <div>
                <p className="text-[11px] font-medium text-neutral-400">Portfolio Value</p>
                <h4 className="text-xl font-bold text-neutral-900 dark:text-white">
                  {currency}{summary.totalVal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </h4>
              </div>
              <div className={`flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold ${
                summary.pnl >= 0 ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" : "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300"
              }`}>
                {summary.pnl >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                <span>{summary.pnl >= 0 ? "+" : ""}{summary.pnlPercent.toFixed(2)}%</span>
              </div>
            </div>
          </div>

          <div className="space-y-2 overflow-y-auto max-h-48 pr-1">
            {activeAssets.slice(0, 4).map((asset) => (
              <div
                key={asset.id}
                className="flex items-center justify-between rounded-xl border border-neutral-100 p-2.5 transition hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-800/60"
              >
                <div>
                  <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">{asset.name}</p>
                  <span className="text-[10px] uppercase tracking-wider text-neutral-400">{asset.category}</span>
                </div>
                <div className="text-right">
                  <p className="text-xs font-mono font-medium text-neutral-900 dark:text-white">
                    {currency}{(asset.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>
                  {asset.quantity ? (
                    <span className="text-[10px] text-neutral-400">{asset.quantity} units</span>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
