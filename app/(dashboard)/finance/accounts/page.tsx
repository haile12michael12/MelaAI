"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Phone, Building2, CreditCard, Banknote, ShieldCheck } from "lucide-react";
import { formatCurrency } from "@/lib/finance/intelligence";

export default function AccountsPage() {
  const [accounts, setAccounts] = useState([
    { id: "1", name: "Telebirr (ቴሌብር)", type: "wallet", balance: 14250.0, accountNum: "0911***234", icon: Phone, color: "bg-amber-500 text-white" },
    { id: "2", name: "Commercial Bank of Ethiopia (CBE)", type: "bank", balance: 52400.0, accountNum: "100012948****", icon: Building2, color: "bg-purple-600 text-white" },
    { id: "3", name: "Awash Bank (አዋሽ ባንክ)", type: "bank", balance: 31800.0, accountNum: "013204928****", icon: CreditCard, color: "bg-blue-600 text-white" },
    { id: "4", name: "Cash on Hand (ጥሬ ገንዘብ)", type: "cash", balance: 4500.0, accountNum: "Physical Wallet", icon: Banknote, color: "bg-emerald-600 text-white" },
  ]);

  const total = accounts.reduce((sum, a) => sum + a.balance, 0);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/finance" className="rounded-xl border border-neutral-200 p-2 text-neutral-500 hover:bg-neutral-100 dark:border-neutral-800">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-neutral-900 dark:text-white">Accounts & Digital Wallets</h1>
            <p className="text-xs text-neutral-500">Telebirr, CBE, Awash, and Cash account balances</p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[11px] font-medium text-neutral-400">Total Liquid Balance</span>
          <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
            {formatCurrency(total, "ETB")}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {accounts.map((acc) => {
          const Icon = acc.icon;
          return (
            <div
              key={acc.id}
              className="rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-xs dark:border-neutral-800/80 dark:bg-neutral-900"
            >
              <div className="flex items-center justify-between">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${acc.color} shadow-xs`}>
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-[10px] font-mono font-medium text-neutral-400">
                  {acc.accountNum}
                </span>
              </div>

              <div className="mt-4">
                <h3 className="text-sm font-bold text-neutral-900 dark:text-white">{acc.name}</h3>
                <p className="mt-1 text-2xl font-bold text-neutral-900 dark:text-white">
                  {formatCurrency(acc.balance, "ETB")}
                </p>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-neutral-100 pt-3 text-[11px] text-neutral-400 dark:border-neutral-800">
                <span>Account verified</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Active</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}