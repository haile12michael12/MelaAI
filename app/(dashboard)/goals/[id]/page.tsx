"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { formatCurrency } from "@/lib/finance/intelligence";
import { DEFAULT_GOALS, MelaGoalsIntelligence, GoalItem } from "@/lib/goals/intelligence";
import { ArrowLeft, Target, Plus, CheckCircle2, Sparkles, Calendar, TrendingUp, Clock, ShieldCheck, Trash2 } from "lucide-react";

export default function GoalDetailPage() {
  const params = useParams();
  const goalId = params?.id as string;

  const [goals, setGoals] = useState<GoalItem[]>(DEFAULT_GOALS);
  const goal = useMemo(() => goals.find((g) => g.id === goalId) || goals[0], [goals, goalId]);
  const intel = useMemo(() => MelaGoalsIntelligence.analyzeGoal(goal), [goal]);

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/goals"
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              {goal.category}
            </span>
            <h1 className="text-xl font-bold text-neutral-900 dark:text-white">{goal.title}</h1>
          </div>
        </div>

        <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
          {intel.paceStatus} ({intel.probabilityScore}%)
        </span>
      </div>

      {/* Main Intelligence Overview */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Progress Card */}
        <div className="rounded-3xl border border-neutral-200/80 bg-white p-6 shadow-xs dark:border-neutral-800/80 dark:bg-neutral-900 md:col-span-2">
          <h3 className="text-sm font-bold text-neutral-900 dark:text-white">Savings Progress & Demands</h3>

          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-2xl font-extrabold text-neutral-900 dark:text-white">
                {formatCurrency(goal.currentAmount, "ETB")}
              </span>
              <span className="text-xs font-semibold text-neutral-400">
                Target: {formatCurrency(goal.targetAmount, "ETB")} ({intel.progressPercent}%)
              </span>
            </div>

            <div className="h-3 w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
              <div
                style={{ width: `${intel.progressPercent}%` }}
                className="h-full rounded-full bg-indigo-600 transition-all duration-500"
              />
            </div>
          </div>

          {/* Key Rates Grid */}
          <div className="mt-6 grid grid-cols-3 gap-3 border-t border-neutral-100 pt-4 dark:border-neutral-800">
            <div>
              <span className="text-[10px] font-medium text-neutral-400">Required Monthly</span>
              <p className="mt-0.5 text-sm font-bold text-indigo-600 dark:text-indigo-400">
                {formatCurrency(intel.requiredMonthlyContribution, "ETB")}/mo
              </p>
            </div>
            <div>
              <span className="text-[10px] font-medium text-neutral-400">Required Weekly</span>
              <p className="mt-0.5 text-sm font-bold text-neutral-900 dark:text-white">
                {formatCurrency(intel.requiredWeeklyContribution, "ETB")}/wk
              </p>
            </div>
            <div>
              <span className="text-[10px] font-medium text-neutral-400">Time Remaining</span>
              <p className="mt-0.5 text-sm font-bold text-emerald-600 dark:text-emerald-400">
                {intel.daysRemaining} days ({intel.monthsRemaining} mos)
              </p>
            </div>
          </div>
        </div>

        {/* AI Recommendations Card */}
        <div className="rounded-3xl border border-neutral-200/80 bg-gradient-to-br from-indigo-900 to-neutral-900 p-6 text-white shadow-xs">
          <div className="flex items-center gap-2 font-bold text-indigo-300 text-xs">
            <Sparkles className="h-4 w-4" />
            <span>MELA AI Recommendations</span>
          </div>

          <p className="mt-3 text-xs leading-relaxed text-indigo-100">
            {intel.aiExplanation}
          </p>

          <div className="mt-4 space-y-2 border-t border-indigo-800 pt-3">
            {intel.aiRecommendations.map((rec, idx) => (
              <div key={idx} className="flex items-start gap-1.5 text-[11px] text-neutral-300">
                <span className="text-indigo-400">•</span>
                <span>{rec}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Milestones & Contributions */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Milestones Checklist */}
        <div className="rounded-3xl border border-neutral-200/80 bg-white p-6 shadow-xs dark:border-neutral-800/80 dark:bg-neutral-900">
          <h3 className="text-sm font-bold text-neutral-900 dark:text-white">Goal Milestones</h3>
          <p className="text-xs text-neutral-500">Incremental target check-ins</p>

          <div className="mt-4 space-y-3">
            {goal.milestones.map((m) => (
              <div
                key={m.id}
                className={`flex items-center justify-between rounded-2xl p-3.5 text-xs transition ${
                  m.isCompleted
                    ? "bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300"
                    : "bg-neutral-50 text-neutral-600 dark:bg-neutral-800/50 dark:text-neutral-400"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <CheckCircle2
                    className={`h-4 w-4 ${m.isCompleted ? "text-emerald-600 dark:text-emerald-400" : "text-neutral-300 dark:text-neutral-700"}`}
                  />
                  <span className="font-semibold">{m.title}</span>
                </div>
                <span className="font-bold">{formatCurrency(m.targetAmount, "ETB")}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Contribution History */}
        <div className="rounded-3xl border border-neutral-200/80 bg-white p-6 shadow-xs dark:border-neutral-800/80 dark:bg-neutral-900">
          <h3 className="text-sm font-bold text-neutral-900 dark:text-white">Contribution History</h3>
          <p className="text-xs text-neutral-500">{goal.contributions.length} recorded deposits</p>

          <div className="mt-4 divide-y divide-neutral-100 dark:divide-neutral-800">
            {goal.contributions.map((c) => (
              <div key={c.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-xs font-bold text-neutral-900 dark:text-white">{c.note || "Contribution"}</p>
                  <p className="text-[11px] text-neutral-400">{c.date}</p>
                </div>
                <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
                  +{formatCurrency(c.amount, "ETB")}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
