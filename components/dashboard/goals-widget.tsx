"use client";

import React from "react";
import type { GoalItem } from "@/types/goals";
import { EmptyState } from "./empty-state";
import { Target, Plus, ArrowUpRight } from "lucide-react";
import Link from "next/link";

interface GoalsWidgetProps {
  goals: GoalItem[];
  currency: string;
  onAddGoal?: () => void;
}

export function GoalsWidget({ goals, currency, onAddGoal }: GoalsWidgetProps) {
  return (
    <div className="flex h-full flex-col rounded-3xl border border-neutral-200/80 bg-white/80 p-5 shadow-xs backdrop-blur-md dark:border-neutral-800/80 dark:bg-neutral-900/80">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">Active Goals</h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">Savings & Milestones</p>
        </div>
        <div className="flex items-center gap-2">
          {onAddGoal && (
            <button
              onClick={onAddGoal}
              className="flex h-7 w-7 items-center justify-center rounded-lg bg-neutral-100 text-neutral-600 transition hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
              title="Add Goal"
            >
              <Plus className="h-4 w-4" />
            </button>
          )}
          <Link
            href="/goals"
            className="flex items-center gap-1 text-xs font-medium text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
          >
            Goals <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>
      </div>

      {goals.length === 0 ? (
        <div className="my-auto">
          <EmptyState
            icon={<Target className="h-5 w-5" />}
            title="No active goals"
            description="Set milestone targets for emergency fund, vacation, or investments."
            actionLabel="Create Goal"
            onAction={onAddGoal}
          />
        </div>
      ) : (
        <div className="mt-4 space-y-3 overflow-y-auto max-h-56 pr-1">
          {goals.map((g) => {
            const pct = Math.min(100, Math.round((g.currentAmount / (g.targetAmount || 1)) * 100));

            return (
              <div key={g.id} className="space-y-1.5 rounded-2xl border border-neutral-100 p-3 dark:border-neutral-800">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-neutral-800 dark:text-neutral-200">{g.title}</span>
                  <span className="font-mono text-neutral-500 dark:text-neutral-400">{pct}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-neutral-400">
                  <span>{currency}{g.currentAmount.toLocaleString()} saved</span>
                  <span>Target: {currency}{g.targetAmount.toLocaleString()}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
