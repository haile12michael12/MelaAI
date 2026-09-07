"use client";

import React, { useState } from "react";
import Link from "next/link";
import { formatCurrency } from "@/lib/finance/intelligence";
import { DEFAULT_LIABILITIES, LIABILITY_CATEGORIES, LiabilityItem } from "@/lib/finance/net-worth";
import { ArrowLeft, Layers, Trash2 } from "lucide-react";

export default function LiabilitiesSubPage() {
  const [liabilities, setLiabilities] = useState<LiabilityItem[]>(DEFAULT_LIABILITIES);

  const total = liabilities.reduce((sum, l) => sum + (l.amount || 0), 0);

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-12">
      <div className="flex items-center gap-3">
        <Link
          href="/net-worth"
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-neutral-900 dark:text-white">Liabilities & Obligations</h1>
          <p className="text-xs text-neutral-500">Track loans, credit card debt, and repayment schedules</p>
        </div>
      </div>

      <div className="rounded-3xl border border-neutral-200/80 bg-white p-6 shadow-xs dark:border-neutral-800/80 dark:bg-neutral-900">
        <div className="flex items-center justify-between border-b border-neutral-100 pb-4 dark:border-neutral-800">
          <span className="text-xs font-bold text-neutral-500">Total Outstanding Debt</span>
          <span className="text-lg font-extrabold text-red-600 dark:text-red-400">
            {formatCurrency(total, "ETB")}
          </span>
        </div>

        <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
          {liabilities.map((liab) => (
            <div key={liab.id} className="flex items-center justify-between py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-red-50 text-red-500 dark:bg-red-950/50">
                  <Layers className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-neutral-900 dark:text-white">{liab.name}</h4>
                  <p className="text-xs text-neutral-400">
                    {liab.category} {liab.interestRate ? `• ${liab.interestRate}% APR` : ""} {liab.lender ? `• ${liab.lender}` : ""}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-sm font-extrabold text-red-600 dark:text-red-400">
                  {formatCurrency(liab.amount, "ETB")}
                </span>
                <button
                  onClick={() => setLiabilities((prev) => prev.filter((l) => l.id !== liab.id))}
                  className="p-1.5 text-red-400 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
