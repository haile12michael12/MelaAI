"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import type { InvestmentAsset } from "@/types";
import { formatCurrency } from "@/lib/finance/intelligence";
import { TrendingUp, Plus, DollarSign, Calculator, PieChart, ShieldCheck, ArrowUpRight } from "lucide-react";

export default function InvestmentsPage() {
  const { user } = useAuth();
  const [assets, setAssets] = useState<InvestmentAsset[]>([]);
  const [loading, setLoading] = useState(true);

  // New asset form
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState<InvestmentAsset["category"]>("fixed_deposit");
  const [amount, setAmount] = useState("");
  const [interestRate, setInterestRate] = useState("14"); // Typical Ethiopian bank FD interest rate ~14-16%

  useEffect(() => {
    async function load() {
      if (!user) return setLoading(false);
      try {
        const res = await fetch("/api/portfolio", {
          headers: { Authorization: `Bearer ${user.idToken}` },
        });
        if (res.ok) {
          const data = await res.json();
          const list = Array.isArray(data) ? data : data?.assets || [];
          setAssets(list);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  const totalValuation = useMemo(
    () => assets.filter((a) => !a.isSold).reduce((sum, a) => sum + (a.amount || 0), 0),
    [assets]
  );

  const handleAddAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !amount) return;

    const parsedAmt = parseFloat(amount);
    const newAsset: InvestmentAsset = {
      id: String(Date.now()),
      name: name.trim(),
      category,
      amount: parsedAmt,
      investedAmount: parsedAmt,
      interestRate: category === "fixed_deposit" ? parseFloat(interestRate) : undefined,
      createdAt: Date.now(),
    };

    const updated = [...assets, newAsset];
    setAssets(updated);

    try {
      await fetch("/api/portfolio", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.idToken || ""}`,
        },
        body: JSON.stringify({ assets: updated }),
      });
    } catch (err) {
      console.error(err);
    }

    setName("");
    setAmount("");
    setShowAdd(false);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Investment Portfolio
          </h1>
          <p className="text-xs text-neutral-500">
            Fixed deposits, equities, crypto, gold & Ethiopian bank yields
          </p>
        </div>

        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-1.5 rounded-xl bg-neutral-900 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-neutral-800 dark:bg-white dark:text-neutral-900"
        >
          <Plus className="h-4 w-4" />
          <span>Add Asset</span>
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-xs dark:border-neutral-800/80 dark:bg-neutral-900">
          <span className="text-xs font-medium text-neutral-500">Total Portfolio Value</span>
          <p className="mt-2 text-2xl font-bold text-neutral-900 dark:text-white">
            {formatCurrency(totalValuation, "ETB")}
          </p>
          <p className="mt-1 text-[11px] text-neutral-400">
            ≈ ${(totalValuation / 130).toFixed(2)} USD reference rate
          </p>
        </div>

        <div className="rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-xs dark:border-neutral-800/80 dark:bg-neutral-900">
          <span className="text-xs font-medium text-neutral-500">Active Holdings</span>
          <p className="mt-2 text-2xl font-bold text-neutral-900 dark:text-white">
            {assets.filter((a) => !a.isSold).length}
          </p>
          <p className="mt-1 text-[11px] text-neutral-400">Across diversified asset classes</p>
        </div>

        <div className="rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-xs dark:border-neutral-800/80 dark:bg-neutral-900">
          <span className="text-xs font-medium text-neutral-500">Average Yield / Interest</span>
          <p className="mt-2 text-2xl font-bold text-emerald-600 dark:text-emerald-400">14.5% p.a.</p>
          <p className="mt-1 text-[11px] text-neutral-400">Commercial bank term deposit rate</p>
        </div>
      </div>

      {/* Asset Table */}
      <div className="rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-xs dark:border-neutral-800/80 dark:bg-neutral-900">
        <h3 className="text-sm font-bold text-neutral-900 dark:text-white">Holdings & Yields</h3>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-neutral-100 bg-neutral-50 text-[11px] font-semibold text-neutral-500 dark:border-neutral-800 dark:bg-neutral-800">
              <tr>
                <th className="px-4 py-3">Asset</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Interest / Yield</th>
                <th className="px-4 py-3 text-right">Valuation (ETB)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {assets.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-neutral-400">
                    No investment assets recorded yet. Click &ldquo;Add Asset&rdquo; above.
                  </td>
                </tr>
              ) : (
                assets.map((a) => (
                  <tr key={a.id || a.name} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/40">
                    <td className="px-4 py-3 font-semibold text-neutral-900 dark:text-white">{a.name}</td>
                    <td className="px-4 py-3 uppercase tracking-wider text-[10px] text-neutral-500">
                      {a.category.replace(/_/g, " ")}
                    </td>
                    <td className="px-4 py-3 text-neutral-600 dark:text-neutral-300">
                      {a.interestRate ? `${a.interestRate}% p.a.` : "—"}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-neutral-900 dark:text-white">
                      {formatCurrency(a.amount || 0, "ETB")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-6 shadow-xl dark:border-neutral-800 dark:bg-neutral-900">
            <h3 className="text-base font-bold text-neutral-900 dark:text-white">Add Investment Asset</h3>
            <form onSubmit={handleAddAsset} className="mt-4 space-y-3.5">
              <div>
                <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300">Asset Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. CBE 1-Year Term Deposit, Awash Shares, Bitcoin"
                  className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs text-neutral-900 outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs text-neutral-900 outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                  >
                    <option value="fixed_deposit">Fixed Deposit (የቁጠባ ሂሳብ)</option>
                    <option value="equity">Equity / Stocks (አክሲዮን)</option>
                    <option value="crypto">Crypto</option>
                    <option value="gold">Gold (ወርቅ)</option>
                    <option value="cash">Cash Fund</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300">Amount (ETB)</label>
                  <input
                    type="number"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="100000"
                    className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs text-neutral-900 outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                  />
                </div>
              </div>

              {category === "fixed_deposit" && (
                <div>
                  <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300">Annual Interest Rate (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={interestRate}
                    onChange={(e) => setInterestRate(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs text-neutral-900 outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                  />
                </div>
              )}

              <div className="mt-5 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAdd(false)}
                  className="rounded-xl border border-neutral-200 px-3.5 py-1.5 text-xs font-semibold text-neutral-600 hover:bg-neutral-50 dark:border-neutral-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
                >
                  Save Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}