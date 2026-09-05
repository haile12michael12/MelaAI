"use client";

import React, { useMemo } from "react";
import { Sparkles, TrendingUp, AlertCircle, Lightbulb, ArrowRight } from "lucide-react";

interface AIInsightSectionProps {
  monthlyIncome: number;
  monthlyExpenses: number;
  savingsRate: number;
  subscriptionCount: number;
  portfolioCount: number;
  taskCount: number;
  currency: string;
  onAskMela?: (prompt?: string) => void;
}

export function AIInsightSection({
  monthlyIncome,
  monthlyExpenses,
  savingsRate,
  subscriptionCount,
  portfolioCount,
  taskCount,
  currency,
  onAskMela,
}: AIInsightSectionProps) {
  const insights = useMemo(() => {
    const list: { type: "tip" | "warning" | "positive"; title: string; desc: string; prompt: string }[] = [];

    if (savingsRate >= 30) {
      list.push({
        type: "positive",
        title: "Exceptional Savings Rate",
        desc: `You're currently saving ${savingsRate.toFixed(1)}% of your income. Consider allocating surplus to index funds or compounding instruments.`,
        prompt: "How can I optimize my investment allocation for my current savings rate?",
      });
    } else if (savingsRate < 15 && monthlyIncome > 0) {
      list.push({
        type: "warning",
        title: "High Outflow Velocity",
        desc: `Expenses account for ${(100 - savingsRate).toFixed(1)}% of income. Analyze discretionary spending to target a 20%+ savings buffer.`,
        prompt: "Analyze my largest spending categories and suggest where I can cut costs.",
      });
    }

    if (subscriptionCount >= 4) {
      list.push({
        type: "tip",
        title: "Subscription Audit Recommended",
        desc: `You have ${subscriptionCount} recurring subscriptions active. Check for overlapping services or annual payment discounts.`,
        prompt: "Review my active subscriptions and suggest optimization strategies.",
      });
    }

    if (portfolioCount === 0) {
      list.push({
        type: "tip",
        title: "Start Building Wealth",
        desc: "You haven't logged any investment assets yet. Diversifying across equities and fixed deposits helps beat inflation.",
        prompt: "What is a good beginner investment strategy for my risk profile?",
      });
    } else {
      list.push({
        type: "positive",
        title: "Portfolio Health",
        desc: `Tracking ${portfolioCount} active asset holdings. Keep reviewing quarterly asset rebalancing.`,
        prompt: "Review my investment portfolio allocation and diversification.",
      });
    }

    return list;
  }, [monthlyIncome, monthlyExpenses, savingsRate, subscriptionCount, portfolioCount]);

  return (
    <div className="relative overflow-hidden rounded-3xl border border-indigo-200/80 bg-gradient-to-r from-indigo-50/90 via-purple-50/70 to-pink-50/90 p-6 shadow-xs backdrop-blur-md dark:border-indigo-900/50 dark:from-indigo-950/30 dark:via-purple-950/20 dark:to-pink-950/30">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-md">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-neutral-900 dark:text-white">MELA AI Financial Intelligence</h3>
              <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-[10px] font-semibold text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-300">
                Live Analysis
              </span>
            </div>
            <p className="text-xs text-neutral-600 dark:text-neutral-400">
              Personalized insights and proactive financial optimization
            </p>
          </div>
        </div>

        {onAskMela && (
          <button
            onClick={() => onAskMela()}
            className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500"
          >
            <span>Ask MELA</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3.5 md:grid-cols-2 lg:grid-cols-3">
        {insights.map((ins, i) => (
          <div
            key={i}
            onClick={() => onAskMela?.(ins.prompt)}
            className="group flex cursor-pointer flex-col justify-between rounded-2xl border border-indigo-100/80 bg-white/80 p-4 shadow-2xs transition duration-150 hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md dark:border-neutral-800/80 dark:bg-neutral-900/80 dark:hover:border-indigo-700"
          >
            <div>
              <div className="flex items-center gap-2">
                {ins.type === "positive" && <TrendingUp className="h-4 w-4 text-emerald-500" />}
                {ins.type === "warning" && <AlertCircle className="h-4 w-4 text-rose-500" />}
                {ins.type === "tip" && <Lightbulb className="h-4 w-4 text-amber-500" />}
                <h4 className="text-xs font-bold text-neutral-900 dark:text-white">{ins.title}</h4>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-neutral-600 dark:text-neutral-300">{ins.desc}</p>
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-neutral-100 pt-2 text-[11px] font-medium text-indigo-600 group-hover:text-indigo-700 dark:border-neutral-800 dark:text-indigo-400">
              <span>Deep dive with Mela</span>
              <ArrowRight className="h-3 w-3 transition transform group-hover:translate-x-1" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
