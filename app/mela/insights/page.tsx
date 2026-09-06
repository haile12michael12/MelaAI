"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Lightbulb,
  Sparkles,
  RefreshCw,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Filter,
  Wallet,
  Target,
  Zap,
} from "lucide-react";
import { MelaInsight } from "@/lib/mela/insights";

export default function MelaInsightsPage() {
  const [insights, setInsights] = useState<MelaInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const fetchInsights = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/mela/insights");
      if (res.ok) {
        const data = await res.json();
        setInsights(data.insights || []);
      }
    } catch (err) {
      console.error("Failed to load insights:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  const categories = [
    { key: "All", label: "All Insights" },
    { key: "finance", label: "Finance & Equb (ፋይናንስ)" },
    { key: "calendar", label: "Calendar & Holidays (በዓላት)" },
    { key: "productivity", label: "Productivity & Tasks (ተግባራት)" },
    { key: "lifestyle", label: "Habits & Reading (ልምዶች)" },
  ];

  const filteredInsights = insights.filter((item) => {
    if (selectedCategory === "All") return true;
    return item.category === selectedCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Lightbulb className="h-5 w-5" />
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
              AI Insights & Recommendations
            </h1>
          </div>
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            Proactive financial optimizations, Ethiopian calendar foresight, and habit momentum recommendations
          </p>
        </div>

        <button
          onClick={fetchInsights}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-xs font-semibold text-neutral-700 shadow-xs transition hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>{loading ? "Analyzing OS..." : "Refresh Insights"}</span>
        </button>
      </div>

      {/* Intelligence Score Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-700 p-6 text-white shadow-md">
        <div className="relative z-10 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <span className="rounded-full bg-white/20 px-3 py-1 text-[11px] font-bold tracking-wider uppercase backdrop-blur-xs">
              MELA Financial & Operational Health: 92/100 (Grade A)
            </span>
            <h2 className="mt-3 text-xl font-bold">
              3 High-Yield Opportunities Identified
            </h2>
            <p className="mt-1 text-xs text-emerald-100 max-w-xl">
              By implementing bulk Teff purchasing and synchronizing Telebirr savings before your monthly Equb draw, you can retain an estimated <strong>+2,250 ETB</strong> in liquid surplus this cycle.
            </p>
          </div>

          <Link
            href="/mela/assistant"
            className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-xs font-bold text-neutral-900 shadow-sm transition hover:bg-neutral-100 shrink-0"
          >
            <Sparkles className="h-4 w-4 text-indigo-600" />
            <span>Consult MELA Assistant</span>
          </Link>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setSelectedCategory(cat.key)}
            className={`rounded-xl px-3 py-2 text-xs font-semibold transition ${
              selectedCategory === cat.key
                ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                : "bg-white text-neutral-600 hover:bg-neutral-100 dark:bg-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Insights Stream */}
      <div className="space-y-4">
        {loading && insights.length === 0 ? (
          <div className="flex items-center justify-center p-12 text-xs text-neutral-400">
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            Evaluating cross-domain records and Ge'ez calendar...
          </div>
        ) : filteredInsights.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-neutral-300 p-12 text-center text-xs text-neutral-400 dark:border-neutral-800">
            No insights found under this category.
          </div>
        ) : (
          filteredInsights.map((item) => (
            <div
              key={item.id}
              className="group rounded-3xl border border-neutral-200/80 bg-white p-6 shadow-xs transition hover:border-neutral-300 dark:border-neutral-800/80 dark:bg-neutral-900 dark:hover:border-neutral-700"
            >
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        item.priority === "high"
                          ? "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300"
                          : item.priority === "medium"
                          ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                          : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                      }`}
                    >
                      {item.priority} priority
                    </span>

                    {item.geezContext && (
                      <span className="rounded-md bg-neutral-100 px-2 py-0.5 text-[10px] font-semibold text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                        {item.geezContext}
                      </span>
                    )}

                    {item.impact && (
                      <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300">
                        Impact: {item.impact}
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                    {item.title}
                  </h3>

                  <p className="text-xs leading-relaxed text-neutral-600 dark:text-neutral-300">
                    {item.description}
                  </p>
                </div>

                {item.actionHref && (
                  <Link
                    href={item.actionHref}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-neutral-900 px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 shrink-0 self-start sm:self-center"
                  >
                    <span>{item.actionLabel || "Take Action"}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}