"use client";

import React, { useMemo } from "react";
import type { Subscription } from "@/types";
import { EmptyState } from "./empty-state";
import { CreditCard, Calendar, ArrowUpRight } from "lucide-react";
import Link from "next/link";

interface UpcomingSubscriptionsWidgetProps {
  subscriptions: Subscription[];
  currency: string;
  onAddSubscription?: () => void;
}

export function UpcomingSubscriptionsWidget({
  subscriptions,
  currency,
  onAddSubscription,
}: UpcomingSubscriptionsWidgetProps) {
  const sortedSubs = useMemo(() => {
    return [...subscriptions].sort((a, b) => {
      const dateA = a.nextBillingDate || "9999";
      const dateB = b.nextBillingDate || "9999";
      return dateA.localeCompare(dateB);
    });
  }, [subscriptions]);

  const totalMonthlyBurn = useMemo(() => {
    return subscriptions.reduce((sum, sub) => {
      if (sub.billingCycle === "yearly") {
        return sum + (sub.cost || 0) / 12;
      }
      return sum + (sub.cost || 0);
    }, 0);
  }, [subscriptions]);

  return (
    <div className="flex h-full flex-col rounded-3xl border border-neutral-200/80 bg-white/80 p-5 shadow-xs backdrop-blur-md dark:border-neutral-800/80 dark:bg-neutral-900/80">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">Upcoming Subscriptions</h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">Recurring bills & renewals</p>
        </div>
        <Link
          href="/subscriptions"
          className="flex items-center gap-1 text-xs font-medium text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
        >
          Manage <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>

      {sortedSubs.length === 0 ? (
        <div className="my-auto">
          <EmptyState
            icon={<CreditCard className="h-5 w-5" />}
            title="No subscriptions"
            description="Track Netflix, Spotify, iCloud and other recurring bills."
            actionLabel="Add Subscription"
            onAction={onAddSubscription}
          />
        </div>
      ) : (
        <div className="mt-4 flex flex-1 flex-col justify-between space-y-3">
          <div className="rounded-2xl bg-neutral-50 p-3 text-xs text-neutral-600 dark:bg-neutral-800/50 dark:text-neutral-300">
            Monthly Run Rate: <span className="font-bold text-neutral-900 dark:text-white">{currency}{totalMonthlyBurn.toFixed(2)}/mo</span>
          </div>

          <div className="space-y-2 overflow-y-auto max-h-52 pr-1">
            {sortedSubs.slice(0, 4).map((sub) => (
              <div
                key={sub.id}
                className="flex items-center justify-between rounded-xl border border-neutral-100 p-2.5 transition hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-800/60"
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">{sub.name}</p>
                    <span className="text-[10px] text-neutral-400">Due: {sub.nextBillingDate || "Ongoing"}</span>
                  </div>
                </div>
                <div className="text-right font-mono text-xs font-semibold text-neutral-900 dark:text-white">
                  {currency}{sub.cost.toFixed(2)}
                  <span className="text-[10px] text-neutral-400 font-normal">/{sub.billingCycle === "yearly" ? "yr" : "mo"}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
