"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  CurrencyCode,
  formatCurrency,
} from "@/lib/finance/intelligence";
import {
  AssetCategory,
  LiabilityCategory,
  AssetItem,
  LiabilityItem,
  NetWorthSnapshot,
  NetWorthSummary,
  ASSET_CATEGORIES,
  LIABILITY_CATEGORIES,
  DEFAULT_ASSETS,
  DEFAULT_LIABILITIES,
  DEFAULT_SNAPSHOTS,
  MelaNetWorthService,
} from "@/lib/finance/net-worth";
import {
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  Plus,
  Trash2,
  Edit2,
  Camera,
  Coins,
  Building,
  Landmark,
  Car,
  CircleDollarSign,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  PieChart,
} from "lucide-react";

export default function NetWorthDashboardPage() {
  const [currency, setCurrency] = useState<CurrencyCode>("ETB");
  const [assets, setAssets] = useState<AssetItem[]>(DEFAULT_ASSETS);
  const [liabilities, setLiabilities] = useState<LiabilityItem[]>(DEFAULT_LIABILITIES);
  const [snapshots, setSnapshots] = useState<NetWorthSnapshot[]>(DEFAULT_SNAPSHOTS);
  const [activeTab, setActiveTab] = useState<"overview" | "assets" | "liabilities" | "snapshots">("overview");

  // Modal states
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [isLiabilityModalOpen, setIsLiabilityModalOpen] = useState(false);
  const [isSnapshotModalOpen, setIsSnapshotModalOpen] = useState(false);

  // Form states
  const [editingAsset, setEditingAsset] = useState<AssetItem | null>(null);
  const [editingLiability, setEditingLiability] = useState<LiabilityItem | null>(null);
  const [assetForm, setAssetForm] = useState({ name: "", category: "Cash" as AssetCategory, amount: "", institutionOrLocation: "", notes: "" });
  const [liabilityForm, setLiabilityForm] = useState({ name: "", category: "Loans" as LiabilityCategory, amount: "", interestRate: "", monthlyPayment: "", lender: "", notes: "" });
  const [snapshotNote, setSnapshotNote] = useState("");

  const summary = useMemo(() => {
    return MelaNetWorthService.calculateSummary(assets, liabilities, snapshots);
  }, [assets, liabilities, snapshots]);

  // Handle Add / Edit Asset
  const handleSaveAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assetForm.name || !assetForm.amount) return;

    if (editingAsset) {
      setAssets((prev) =>
        prev.map((a) =>
          a.id === editingAsset.id
            ? {
                ...a,
                name: assetForm.name,
                category: assetForm.category,
                amount: parseFloat(assetForm.amount) || 0,
                institutionOrLocation: assetForm.institutionOrLocation,
                notes: assetForm.notes,
                updatedAt: new Date().toISOString().slice(0, 10),
              }
            : a
        )
      );
    } else {
      const newAsset: AssetItem = {
        id: "ast_" + Date.now(),
        name: assetForm.name,
        category: assetForm.category,
        amount: parseFloat(assetForm.amount) || 0,
        institutionOrLocation: assetForm.institutionOrLocation,
        notes: assetForm.notes,
        updatedAt: new Date().toISOString().slice(0, 10),
      };
      setAssets((prev) => [newAsset, ...prev]);
    }

    setEditingAsset(null);
    setAssetForm({ name: "", category: "Cash", amount: "", institutionOrLocation: "", notes: "" });
    setIsAssetModalOpen(false);
  };

  // Handle Add / Edit Liability
  const handleSaveLiability = (e: React.FormEvent) => {
    e.preventDefault();
    if (!liabilityForm.name || !liabilityForm.amount) return;

    if (editingLiability) {
      setLiabilities((prev) =>
        prev.map((l) =>
          l.id === editingLiability.id
            ? {
                ...l,
                name: liabilityForm.name,
                category: liabilityForm.category,
                amount: parseFloat(liabilityForm.amount) || 0,
                interestRate: parseFloat(liabilityForm.interestRate) || 0,
                monthlyPayment: parseFloat(liabilityForm.monthlyPayment) || 0,
                lender: liabilityForm.lender,
                notes: liabilityForm.notes,
                updatedAt: new Date().toISOString().slice(0, 10),
              }
            : l
        )
      );
    } else {
      const newLiab: LiabilityItem = {
        id: "liab_" + Date.now(),
        name: liabilityForm.name,
        category: liabilityForm.category,
        amount: parseFloat(liabilityForm.amount) || 0,
        interestRate: parseFloat(liabilityForm.interestRate) || 0,
        monthlyPayment: parseFloat(liabilityForm.monthlyPayment) || 0,
        lender: liabilityForm.lender,
        notes: liabilityForm.notes,
        updatedAt: new Date().toISOString().slice(0, 10),
      };
      setLiabilities((prev) => [newLiab, ...prev]);
    }

    setEditingLiability(null);
    setLiabilityForm({ name: "", category: "Loans", amount: "", interestRate: "", monthlyPayment: "", lender: "", notes: "" });
    setIsLiabilityModalOpen(false);
  };

  // Handle Capture Snapshot
  const handleCaptureSnapshot = (e: React.FormEvent) => {
    e.preventDefault();
    const snap = MelaNetWorthService.createSnapshot(assets, liabilities, snapshotNote || "Manual Checkpoint");
    setSnapshots((prev) => [...prev, snap]);
    setSnapshotNote("");
    setIsSnapshotModalOpen(false);
  };

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
    <div className="mx-auto max-w-6xl space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Net Worth & Balance Sheet
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Formula: Net Worth = Total Assets - Total Liabilities. Real-time valuation and snapshot analysis.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Currency Switcher */}
          <div className="flex items-center rounded-xl bg-neutral-100 p-1 dark:bg-neutral-800">
            {(["ETB", "USD", "EUR", "GBP", "AED"] as CurrencyCode[]).map((c) => (
              <button
                key={c}
                onClick={() => setCurrency(c)}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                  currency === c
                    ? "bg-white text-neutral-900 shadow-xs dark:bg-neutral-900 dark:text-white"
                    : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsSnapshotModalOpen(true)}
            className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-indigo-700"
          >
            <Camera className="h-4 w-4" />
            <span>Take Snapshot</span>
          </button>
        </div>
      </div>

      {/* Main Net Worth Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-neutral-200/80 bg-gradient-to-br from-neutral-950 via-neutral-900 to-indigo-950 p-8 text-white shadow-xl dark:border-neutral-800">
        <div className="relative z-10 flex flex-col justify-between gap-8 lg:flex-row lg:items-center">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-400">
              <ShieldCheck className="h-3.5 w-3.5" />
              Total Net Worth (ጠቅላላ የተጣራ ሀብት)
            </span>
            <p className="mt-3 text-4xl font-extrabold tracking-tight sm:text-5xl">
              {formatCurrency(summary.currentNetWorth, currency)}
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5 text-emerald-400">
                <ArrowUpRight className="h-4 w-4" />
                <span>Monthly: +{formatCurrency(Math.abs(summary.monthlyChangeAmount), currency)} ({summary.monthlyChangePercent.toFixed(1)}%)</span>
              </div>
              <span className="text-neutral-500">•</span>
              <div className="flex items-center gap-1.5 text-indigo-300">
                <span>Annual: +{formatCurrency(Math.abs(summary.annualChangeAmount), currency)} ({summary.annualChangePercent.toFixed(1)}%)</span>
              </div>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 gap-4 border-t border-neutral-800 pt-6 sm:grid-cols-3 sm:border-t-0 sm:border-l sm:pl-8 sm:pt-0">
            <div>
              <span className="text-[11px] font-medium text-neutral-400">Total Assets</span>
              <p className="mt-1 text-xl font-bold text-emerald-400">
                {formatCurrency(summary.totalAssets, currency)}
              </p>
              <span className="text-[10px] text-neutral-500">{assets.length} items</span>
            </div>

            <div>
              <span className="text-[11px] font-medium text-neutral-400">Total Liabilities</span>
              <p className="mt-1 text-xl font-bold text-red-400">
                {formatCurrency(summary.totalLiabilities, currency)}
              </p>
              <span className="text-[10px] text-neutral-500">{liabilities.length} items</span>
            </div>

            <div>
              <span className="text-[11px] font-medium text-neutral-400">Debt Ratio</span>
              <p className="mt-1 text-xl font-bold text-amber-300">
                {summary.debtToAssetRatio.toFixed(1)}%
              </p>
              <span className="text-[10px] text-emerald-400">Under 25% (Safe)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-neutral-200 dark:border-neutral-800">
        {[
          { id: "overview", label: "Overview & Allocations" },
          { id: "assets", label: `Assets (${assets.length})` },
          { id: "liabilities", label: `Liabilities (${liabilities.length})` },
          { id: "snapshots", label: `Snapshots (${snapshots.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`border-b-2 px-4 py-2.5 text-xs font-bold transition ${
              activeTab === tab.id
                ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
                : "border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Overview */}
      {activeTab === "overview" && (
        <div className="space-y-8">
          {/* Historical Net Worth Trend Visualizer */}
          <div className="rounded-3xl border border-neutral-200/80 bg-white p-6 shadow-xs dark:border-neutral-800/80 dark:bg-neutral-900">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-neutral-900 dark:text-white">Historical Net Worth Trend</h3>
                <p className="text-xs text-neutral-500">Tracked over historical snapshot checkpoints</p>
              </div>
              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                +{summary.annualChangePercent.toFixed(1)}% YoY Growth
              </span>
            </div>

            {/* SVG Trend Graph */}
            <div className="mt-6">
              <div className="flex h-48 items-end gap-6 pt-6">
                {snapshots.map((s, idx) => {
                  const maxNet = Math.max(...snapshots.map((x) => x.netWorth), summary.currentNetWorth) * 1.1;
                  const heightPct = (s.netWorth / maxNet) * 100;
                  return (
                    <div key={s.id} className="group relative flex flex-1 flex-col items-center">
                      <div className="absolute -top-8 hidden rounded-lg bg-neutral-900 px-2 py-1 text-[10px] font-bold text-white shadow-md group-hover:block dark:bg-white dark:text-neutral-900">
                        {formatCurrency(s.netWorth, currency)}
                      </div>
                      <div
                        style={{ height: `${Math.max(15, heightPct)}%` }}
                        className="w-full rounded-t-xl bg-gradient-to-t from-indigo-600 to-indigo-400 transition-all hover:opacity-80"
                      />
                      <span className="mt-2 text-[11px] font-medium text-neutral-400">{s.date.slice(5)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Allocation Breakdowns */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Asset Allocation */}
            <div className="rounded-3xl border border-neutral-200/80 bg-white p-6 shadow-xs dark:border-neutral-800/80 dark:bg-neutral-900">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-emerald-600" />
                  <h3 className="text-sm font-bold text-neutral-900 dark:text-white">Asset Allocation</h3>
                </div>
                <button
                  onClick={() => {
                    setEditingAsset(null);
                    setAssetForm({ name: "", category: "Cash", amount: "", institutionOrLocation: "", notes: "" });
                    setIsAssetModalOpen(true);
                  }}
                  className="flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:underline"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Asset
                </button>
              </div>

              <div className="mt-5 space-y-4">
                {summary.assetAllocation.map((item) => (
                  <div key={item.category} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 font-semibold text-neutral-800 dark:text-neutral-200">
                        {getCategoryIcon(item.category)}
                        <span>{item.category}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-neutral-900 dark:text-white">
                          {formatCurrency(item.amount, currency)}
                        </span>
                        <span className="text-[11px] text-neutral-400">({item.percentage.toFixed(1)}%)</span>
                      </div>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
                      <div
                        style={{ width: `${item.percentage}%` }}
                        className="h-full rounded-full bg-emerald-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Liability Allocation */}
            <div className="rounded-3xl border border-neutral-200/80 bg-white p-6 shadow-xs dark:border-neutral-800/80 dark:bg-neutral-900">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="h-5 w-5 text-red-500" />
                  <h3 className="text-sm font-bold text-neutral-900 dark:text-white">Liability Breakdown</h3>
                </div>
                <button
                  onClick={() => {
                    setEditingLiability(null);
                    setLiabilityForm({ name: "", category: "Loans", amount: "", interestRate: "", monthlyPayment: "", lender: "", notes: "" });
                    setIsLiabilityModalOpen(true);
                  }}
                  className="flex items-center gap-1 text-xs font-semibold text-red-600 hover:underline"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Liability
                </button>
              </div>

              <div className="mt-5 space-y-4">
                {summary.liabilityAllocation.map((item) => (
                  <div key={item.category} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-neutral-800 dark:text-neutral-200">{item.category}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-neutral-900 dark:text-white">
                          {formatCurrency(item.amount, currency)}
                        </span>
                        <span className="text-[11px] text-neutral-400">({item.percentage.toFixed(1)}%)</span>
                      </div>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
                      <div
                        style={{ width: `${item.percentage}%` }}
                        className="h-full rounded-full bg-red-500"
                      />
                    </div>
                  </div>
                ))}

                <div className="mt-6 rounded-2xl bg-neutral-50 p-4 dark:bg-neutral-800/50">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-neutral-600 dark:text-neutral-300">Debt-to-Asset Ratio</span>
                    <span className="text-emerald-600 dark:text-emerald-400">{summary.debtToAssetRatio.toFixed(1)}%</span>
                  </div>
                  <p className="mt-1 text-[11px] text-neutral-400 leading-relaxed">
                    Total liabilities represent {summary.debtToAssetRatio.toFixed(1)}% of your gross assets. Financial health threshold is safe (&lt; 30%).
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Assets List */}
      {activeTab === "assets" && (
        <div className="rounded-3xl border border-neutral-200/80 bg-white p-6 shadow-xs dark:border-neutral-800/80 dark:bg-neutral-900">
          <div className="flex items-center justify-between pb-4">
            <div>
              <h3 className="text-base font-bold text-neutral-900 dark:text-white">All Assets</h3>
              <p className="text-xs text-neutral-500">Real estate, cash, bank accounts, investments, crypto & gold</p>
            </div>
            <button
              onClick={() => {
                setEditingAsset(null);
                setAssetForm({ name: "", category: "Cash", amount: "", institutionOrLocation: "", notes: "" });
                setIsAssetModalOpen(true);
              }}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-emerald-700"
            >
              <Plus className="h-4 w-4" /> Add Asset
            </button>
          </div>

          <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {assets.map((asset) => (
              <div key={asset.id} className="flex items-center justify-between py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-neutral-100 dark:bg-neutral-800">
                    {getCategoryIcon(asset.category)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-neutral-900 dark:text-white">{asset.name}</h4>
                    <div className="flex items-center gap-2 text-xs text-neutral-400">
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">{asset.category}</span>
                      {asset.institutionOrLocation && <span>• {asset.institutionOrLocation}</span>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-sm font-extrabold text-neutral-900 dark:text-white">
                    {formatCurrency(asset.amount, currency)}
                  </span>
                  <button
                    onClick={() => {
                      setEditingAsset(asset);
                      setAssetForm({
                        name: asset.name,
                        category: asset.category,
                        amount: String(asset.amount),
                        institutionOrLocation: asset.institutionOrLocation || "",
                        notes: asset.notes || "",
                      });
                      setIsAssetModalOpen(true);
                    }}
                    className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-white"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
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
      )}

      {/* Tab 3: Liabilities List */}
      {activeTab === "liabilities" && (
        <div className="rounded-3xl border border-neutral-200/80 bg-white p-6 shadow-xs dark:border-neutral-800/80 dark:bg-neutral-900">
          <div className="flex items-center justify-between pb-4">
            <div>
              <h3 className="text-base font-bold text-neutral-900 dark:text-white">All Liabilities & Debt</h3>
              <p className="text-xs text-neutral-500">Loans, credit cards, mortgages and personal debt</p>
            </div>
            <button
              onClick={() => {
                setEditingLiability(null);
                setLiabilityForm({ name: "", category: "Loans", amount: "", interestRate: "", monthlyPayment: "", lender: "", notes: "" });
                setIsLiabilityModalOpen(true);
              }}
              className="flex items-center gap-1.5 rounded-xl bg-red-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-red-700"
            >
              <Plus className="h-4 w-4" /> Add Liability
            </button>
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
                    <div className="flex items-center gap-2 text-xs text-neutral-400">
                      <span className="font-semibold text-red-500">{liab.category}</span>
                      {liab.interestRate ? <span>• {liab.interestRate}% APR</span> : null}
                      {liab.lender && <span>• {liab.lender}</span>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-sm font-extrabold text-red-600 dark:text-red-400">
                    {formatCurrency(liab.amount, currency)}
                  </span>
                  <button
                    onClick={() => {
                      setEditingLiability(liab);
                      setLiabilityForm({
                        name: liab.name,
                        category: liab.category,
                        amount: String(liab.amount),
                        interestRate: String(liab.interestRate || ""),
                        monthlyPayment: String(liab.monthlyPayment || ""),
                        lender: liab.lender || "",
                        notes: liab.notes || "",
                      });
                      setIsLiabilityModalOpen(true);
                    }}
                    className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-white"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
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
      )}

      {/* Tab 4: Historical Snapshots */}
      {activeTab === "snapshots" && (
        <div className="rounded-3xl border border-neutral-200/80 bg-white p-6 shadow-xs dark:border-neutral-800/80 dark:bg-neutral-900">
          <div className="flex items-center justify-between pb-4">
            <div>
              <h3 className="text-base font-bold text-neutral-900 dark:text-white">Historical Snapshots</h3>
              <p className="text-xs text-neutral-500">Checkpoints captured across months and years</p>
            </div>
            <button
              onClick={() => setIsSnapshotModalOpen(true)}
              className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-indigo-700"
            >
              <Camera className="h-4 w-4" /> Capture New Snapshot
            </button>
          </div>

          <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {snapshots.map((snap) => (
              <div key={snap.id} className="flex items-center justify-between py-4">
                <div>
                  <h4 className="text-sm font-bold text-neutral-900 dark:text-white">{snap.note || "Snapshot"}</h4>
                  <p className="text-xs text-neutral-400">Date: {snap.date}</p>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-xs text-neutral-400">Assets: {formatCurrency(snap.totalAssets, currency)}</p>
                    <p className="text-xs text-red-400">Debt: {formatCurrency(snap.totalLiabilities, currency)}</p>
                  </div>
                  <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(snap.netWorth, currency)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Asset Modal */}
      {isAssetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-neutral-900">
            <h3 className="text-base font-bold text-neutral-900 dark:text-white">
              {editingAsset ? "Edit Asset" : "Add New Asset"}
            </h3>

            <form onSubmit={handleSaveAsset} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">Asset Name</label>
                <input
                  type="text"
                  required
                  value={assetForm.name}
                  onChange={(e) => setAssetForm({ ...assetForm, name: e.target.value })}
                  placeholder="e.g. CBE Savings Account"
                  className="mt-1 w-full rounded-xl border border-neutral-200 px-3 py-2 text-xs dark:border-neutral-700 dark:bg-neutral-800"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">Category</label>
                <select
                  value={assetForm.category}
                  onChange={(e) => setAssetForm({ ...assetForm, category: e.target.value as AssetCategory })}
                  className="mt-1 w-full rounded-xl border border-neutral-200 px-3 py-2 text-xs dark:border-neutral-700 dark:bg-neutral-800"
                >
                  {ASSET_CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">Current Valuation Amount</label>
                <input
                  type="number"
                  step="any"
                  required
                  value={assetForm.amount}
                  onChange={(e) => setAssetForm({ ...assetForm, amount: e.target.value })}
                  placeholder="e.g. 150000"
                  className="mt-1 w-full rounded-xl border border-neutral-200 px-3 py-2 text-xs dark:border-neutral-700 dark:bg-neutral-800"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">Institution / Location (Optional)</label>
                <input
                  type="text"
                  value={assetForm.institutionOrLocation}
                  onChange={(e) => setAssetForm({ ...assetForm, institutionOrLocation: e.target.value })}
                  placeholder="e.g. Commercial Bank of Ethiopia"
                  className="mt-1 w-full rounded-xl border border-neutral-200 px-3 py-2 text-xs dark:border-neutral-700 dark:bg-neutral-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAssetModalOpen(false)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700"
                >
                  Save Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Liability Modal */}
      {isLiabilityModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-neutral-900">
            <h3 className="text-base font-bold text-neutral-900 dark:text-white">
              {editingLiability ? "Edit Liability" : "Add New Liability"}
            </h3>

            <form onSubmit={handleSaveLiability} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">Liability / Loan Name</label>
                <input
                  type="text"
                  required
                  value={liabilityForm.name}
                  onChange={(e) => setLiabilityForm({ ...liabilityForm, name: e.target.value })}
                  placeholder="e.g. Vehicle Bank Loan"
                  className="mt-1 w-full rounded-xl border border-neutral-200 px-3 py-2 text-xs dark:border-neutral-700 dark:bg-neutral-800"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">Category</label>
                <select
                  value={liabilityForm.category}
                  onChange={(e) => setLiabilityForm({ ...liabilityForm, category: e.target.value as LiabilityCategory })}
                  className="mt-1 w-full rounded-xl border border-neutral-200 px-3 py-2 text-xs dark:border-neutral-700 dark:bg-neutral-800"
                >
                  {LIABILITY_CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">Outstanding Balance</label>
                <input
                  type="number"
                  step="any"
                  required
                  value={liabilityForm.amount}
                  onChange={(e) => setLiabilityForm({ ...liabilityForm, amount: e.target.value })}
                  placeholder="e.g. 50000"
                  className="mt-1 w-full rounded-xl border border-neutral-200 px-3 py-2 text-xs dark:border-neutral-700 dark:bg-neutral-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">Interest Rate (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={liabilityForm.interestRate}
                    onChange={(e) => setLiabilityForm({ ...liabilityForm, interestRate: e.target.value })}
                    placeholder="e.g. 14.5"
                    className="mt-1 w-full rounded-xl border border-neutral-200 px-3 py-2 text-xs dark:border-neutral-700 dark:bg-neutral-800"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">Monthly Payment</label>
                  <input
                    type="number"
                    step="any"
                    value={liabilityForm.monthlyPayment}
                    onChange={(e) => setLiabilityForm({ ...liabilityForm, monthlyPayment: e.target.value })}
                    placeholder="e.g. 4500"
                    className="mt-1 w-full rounded-xl border border-neutral-200 px-3 py-2 text-xs dark:border-neutral-700 dark:bg-neutral-800"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsLiabilityModalOpen(false)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-red-700"
                >
                  Save Liability
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Snapshot Modal */}
      {isSnapshotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-neutral-900">
            <h3 className="text-base font-bold text-neutral-900 dark:text-white">Capture Net Worth Snapshot</h3>
            <p className="mt-1 text-xs text-neutral-500">
              Freezes current assets ({formatCurrency(summary.totalAssets, currency)}) and liabilities ({formatCurrency(summary.totalLiabilities, currency)}) into a historical checkpoint.
            </p>

            <form onSubmit={handleCaptureSnapshot} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">Snapshot Note / Label</label>
                <input
                  type="text"
                  required
                  value={snapshotNote}
                  onChange={(e) => setSnapshotNote(e.target.value)}
                  placeholder="e.g. September 2026 Close"
                  className="mt-1 w-full rounded-xl border border-neutral-200 px-3 py-2 text-xs dark:border-neutral-700 dark:bg-neutral-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSnapshotModalOpen(false)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700"
                >
                  Capture Now
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
