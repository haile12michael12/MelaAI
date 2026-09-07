"use client";

import React, { useState } from "react";
import Link from "next/link";
import { formatCurrency } from "@/lib/finance/intelligence";
import { DEFAULT_ASSETS, ASSET_CATEGORIES, AssetCategory, AssetItem } from "@/lib/finance/net-worth";
import { ArrowLeft, Plus, Landmark, TrendingUp, Coins, Sparkles, Building, Car, CircleDollarSign, Edit2, Trash2 } from "lucide-react";

export default function AssetsSubPage() {
  const [assets, setAssets] = useState<AssetItem[]>(DEFAULT_ASSETS);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const filteredAssets = assets.filter((a) =>
    selectedCategory === "all" ? true : a.category === selectedCategory
  );

  const total = filteredAssets.reduce((sum, a) => sum + (a.amount || 0), 0);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Cash":
      case "Bank Accounts":
        return <Landmark className="h-4 w-4 text-emerald-500" />;
      case "Investments":
        return <TrendingUp className="h-4 w-4 text-indigo-500" />;
      case "Crypto":
        return <Coins className="h-4 w-4 text-amber-500" />;
      case "Gold":
        return <Sparkles className="h-4 w-4 text-yellow-500" />;
      case "Real Estate":
        return <Building className="h-4 w-4 text-blue-500" />;
      case "Vehicles":
        return <Car className="h-4 w-4 text-purple-500" />;
      default:
        return <CircleDollarSign className="h-4 w-4 text-neutral-500" />;
    }
  };

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
          <h1 className="text-xl font-bold text-neutral-900 dark:text-white">Assets Portfolio</h1>
          <p className="text-xs text-neutral-500">Track and manage your asset inventory</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setSelectedCategory("all")}
          className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
            selectedCategory === "all"
              ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
              : "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"
          }`}
        >
          All ({assets.length})
        </button>
        {ASSET_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
              selectedCategory === cat
                ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                : "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="rounded-3xl border border-neutral-200/80 bg-white p-6 shadow-xs dark:border-neutral-800/80 dark:bg-neutral-900">
        <div className="flex items-center justify-between border-b border-neutral-100 pb-4 dark:border-neutral-800">
          <span className="text-xs font-bold text-neutral-500">Total Portfolio Value</span>
          <span className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">
            {formatCurrency(total, "ETB")}
          </span>
        </div>

        <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
          {filteredAssets.map((asset) => (
            <div key={asset.id} className="flex items-center justify-between py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-neutral-100 dark:bg-neutral-800">
                  {getCategoryIcon(asset.category)}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-neutral-900 dark:text-white">{asset.name}</h4>
                  <p className="text-xs text-neutral-400">{asset.category} {asset.institutionOrLocation ? `• ${asset.institutionOrLocation}` : ""}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-sm font-extrabold text-neutral-900 dark:text-white">
                  {formatCurrency(asset.amount, "ETB")}
                </span>
                <button
                  onClick={() => setAssets((prev) => prev.filter((a) => a.id !== asset.id))}
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
