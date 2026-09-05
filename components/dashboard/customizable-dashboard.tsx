"use client";

import React, { useState, useEffect, ReactNode } from "react";
import { SlidersHorizontal, Eye, EyeOff, ArrowUp, ArrowDown, RotateCcw, X, Check } from "lucide-react";
import { DashboardErrorBoundary } from "./error-boundary";

export interface WidgetConfig {
  id: string;
  label: string;
  category: "finance" | "productivity" | "lifestyle" | "notes";
  visible: boolean;
}

const DEFAULT_WIDGETS: WidgetConfig[] = [
  { id: "spending", label: "Spending Breakdown", category: "finance", visible: true },
  { id: "investments", label: "Investment Portfolio", category: "finance", visible: true },
  { id: "transactions", label: "Recent Transactions", category: "finance", visible: true },
  { id: "subscriptions", label: "Upcoming Subscriptions", category: "finance", visible: true },
  { id: "goals", label: "Active Goals", category: "productivity", visible: true },
  { id: "tasks", label: "Upcoming Tasks", category: "productivity", visible: true },
  { id: "reading", label: "Reading Activity", category: "lifestyle", visible: true },
  { id: "media", label: "Media Watchlist", category: "lifestyle", visible: true },
  { id: "notes", label: "Quick Scratchpad", category: "notes", visible: true },
];

const STORAGE_KEY = "mela_dashboard_widgets_v1";

interface CustomizableDashboardProps {
  childrenMap: Record<string, ReactNode>;
}

export function CustomizableDashboard({ childrenMap }: CustomizableDashboardProps) {
  const [widgets, setWidgets] = useState<WidgetConfig[]>(DEFAULT_WIDGETS);
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved) as WidgetConfig[];
          // ensure newly added default widgets are merged if any
          const merged = parsed.concat(
            DEFAULT_WIDGETS.filter((dw) => !parsed.some((pw) => pw.id === dw.id))
          );
          setWidgets(merged);
        }
      } catch (err) {
        console.error("Failed to load dashboard preferences:", err);
      }
    }
  }, []);

  const savePreferences = (newWidgets: WidgetConfig[]) => {
    setWidgets(newWidgets);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newWidgets));
    }
  };

  const toggleVisibility = (id: string) => {
    const updated = widgets.map((w) => (w.id === id ? { ...w, visible: !w.visible } : w));
    savePreferences(updated);
  };

  const moveWidget = (index: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= widgets.length) return;

    const copy = [...widgets];
    const item = copy[index];
    copy[index] = copy[targetIdx];
    copy[targetIdx] = item;
    savePreferences(copy);
  };

  const resetToDefault = () => {
    savePreferences(DEFAULT_WIDGETS);
  };

  const visibleWidgets = widgets.filter((w) => w.visible);

  return (
    <div className="space-y-6">
      {/* Control bar */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-neutral-400 dark:text-neutral-500">
          Showing {visibleWidgets.length} of {widgets.length} active widgets
        </span>
        <button
          onClick={() => setIsCustomizeOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200/80 bg-white/80 px-3 py-1.5 text-xs font-medium text-neutral-700 shadow-2xs backdrop-blur-md transition hover:bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-900/80 dark:text-neutral-300 dark:hover:bg-neutral-800"
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Customize Widgets
        </button>
      </div>

      {/* Widget Grid Layout */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {visibleWidgets.map((w) => {
          const component = childrenMap[w.id];
          if (!component) return null;

          return (
            <div key={w.id} className="h-full">
              <DashboardErrorBoundary fallbackTitle={`${w.label} Failed`}>
                {component}
              </DashboardErrorBoundary>
            </div>
          );
        })}
      </div>

      {/* Customization Modal */}
      {isCustomizeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl border border-neutral-200 bg-white p-6 shadow-2xl dark:border-neutral-800 dark:bg-neutral-900">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-base font-bold text-neutral-900 dark:text-white">Customize Dashboard Layout</h3>
              </div>
              <button
                onClick={() => setIsCustomizeOpen(false)}
                className="rounded-lg p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
              Toggle widget visibility and reorder them to fit your daily workflow. Changes are automatically saved.
            </p>

            <div className="mt-4 space-y-2 max-h-[360px] overflow-y-auto pr-1">
              {widgets.map((w, idx) => (
                <div
                  key={w.id}
                  className="flex items-center justify-between rounded-2xl border border-neutral-100 bg-neutral-50/70 p-3 transition dark:border-neutral-800 dark:bg-neutral-800/40"
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleVisibility(w.id)}
                      className={`flex h-7 w-7 items-center justify-center rounded-lg transition ${
                        w.visible
                          ? "bg-indigo-600 text-white"
                          : "bg-neutral-200 text-neutral-400 dark:bg-neutral-700"
                      }`}
                    >
                      {w.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </button>
                    <div>
                      <h4 className="text-xs font-semibold text-neutral-900 dark:text-white">{w.label}</h4>
                      <span className="text-[10px] uppercase tracking-wider text-neutral-400">{w.category}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      disabled={idx === 0}
                      onClick={() => moveWidget(idx, "up")}
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-neutral-500 hover:bg-neutral-200 disabled:opacity-30 dark:hover:bg-neutral-700"
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      disabled={idx === widgets.length - 1}
                      onClick={() => moveWidget(idx, "down")}
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-neutral-500 hover:bg-neutral-200 disabled:opacity-30 dark:hover:bg-neutral-700"
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-neutral-100 pt-3 dark:border-neutral-800">
              <button
                onClick={resetToDefault}
                className="inline-flex items-center gap-1 text-xs font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Reset Default
              </button>
              <button
                onClick={() => setIsCustomizeOpen(false)}
                className="inline-flex items-center gap-1 rounded-xl bg-neutral-900 px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-neutral-800 dark:bg-white dark:text-neutral-900"
              >
                <Check className="h-3.5 w-3.5" /> Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
