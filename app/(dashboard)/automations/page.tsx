"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  Plus,
  Play,
  CheckCircle2,
  AlertCircle,
  Clock,
  Zap,
  Bell,
  Wallet,
  Calendar,
  Settings2,
  Trash2,
  Power,
  ChevronRight,
} from "lucide-react";

export interface AutomationRule {
  id: string;
  title: string;
  description: string;
  category: "Finance" | "Reminders" | "Holidays" | "Productivity";
  trigger: string;
  action: string;
  isActive: boolean;
  lastRun?: string;
  executionCount: number;
}

export const INITIAL_AUTOMATIONS: AutomationRule[] = [
  {
    id: "auto-1",
    title: "Abyssinia Equb Deposit Notification",
    description: "Sends a priority reminder 3 days before monthly Equb payment due date (5th of each month) to transfer 5,000 ETB via Telebirr or CBE Birr.",
    category: "Finance",
    trigger: "Scheduled: 3 days before 5th of every month",
    action: "Send push notification & add reminder task",
    isActive: true,
    lastRun: "2026-08-02T09:00:00Z",
    executionCount: 8,
  },
  {
    id: "auto-2",
    title: "Ethiopian Holiday Market & Remittance Alert",
    description: "Detects upcoming Ge'ez calendar holidays (Enkutatash, Meskel, Genna, Timkat, Fasika, Eid) and creates a special holiday budget category.",
    category: "Holidays",
    trigger: "Ge'ez Calendar: 5 days before recognized Ethiopian holiday",
    action: "Suggest holiday budget buffer & holiday shopping checklist",
    isActive: true,
    lastRun: "2026-08-15T10:30:00Z",
    executionCount: 12,
  },
  {
    id: "auto-3",
    title: "High Food & Teff Outflow Alert",
    description: "Triggers when any individual grocery or wholesale food expense exceeds 8,000 ETB to verify price per quintal and record merchant.",
    category: "Finance",
    trigger: "Expense Event: Food category transaction > 8,000 ETB",
    action: "Flag transaction and log merchant price baseline",
    isActive: true,
    lastRun: "2026-08-18T14:15:00Z",
    executionCount: 3,
  },
  {
    id: "auto-4",
    title: "Weekly Sunday Evening OS Digest",
    description: "Synthesizes past week's spending velocity, completed habits, reading pace, and upcoming agenda for the week ahead.",
    category: "Productivity",
    trigger: "Cron: Every Sunday at 8:00 PM EAT",
    action: "Generate Mela AI executive briefing card",
    isActive: true,
    lastRun: "2026-08-30T20:00:00Z",
    executionCount: 34,
  },
  {
    id: "auto-5",
    title: "Low Liquid Cash Buffer Alert",
    description: "Alerts when combined liquid funds in CBE Birr and Telebirr drop below 10,000 ETB.",
    category: "Finance",
    trigger: "Balance Check: Total liquid balance < 10,000 ETB",
    action: "Urgent banner in Header & pause non-essential subscription alerts",
    isActive: false,
    lastRun: "2026-07-14T11:00:00Z",
    executionCount: 1,
  },
];

export default function AutomationsPage() {
  const [automations, setAutomations] = useState<AutomationRule[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("mela_automations_data");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return INITIAL_AUTOMATIONS;
  });

  const [testingId, setTestingId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("mela_automations_data", JSON.stringify(automations));
    }
  }, [automations]);

  const handleToggle = (id: string) => {
    setAutomations((prev) =>
      prev.map((a) => (a.id === id ? { ...a, isActive: !a.isActive } : a))
    );
  };

  const handleTestRun = (id: string) => {
    setTestingId(id);
    setTimeout(() => {
      setAutomations((prev) =>
        prev.map((a) =>
          a.id === id
            ? {
                ...a,
                lastRun: new Date().toISOString(),
                executionCount: a.executionCount + 1,
              }
            : a
        )
      );
      setTestingId(null);
      setTestResult(`Rule successfully executed! Action simulated.`);
      setTimeout(() => setTestResult(null), 3000);
    }, 600);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (confirm("Delete this automation rule?")) {
      setAutomations((prev) => prev.filter((a) => a.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Sparkles className="h-5 w-5" />
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
              Automations & Intelligence Triggers
            </h1>
          </div>
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            Event-driven rules for Equb reminders, Ethiopian holiday alerts, budget triggers, and weekly digests
          </p>
        </div>

        <Link
          href="/automations/create"
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4" />
          <span>New Automation (አዲስ አውቶሜሽን)</span>
        </Link>
      </div>

      {/* Test Success Banner */}
      {testResult && (
        <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-medium text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/20 dark:text-emerald-300">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <span>{testResult}</span>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-xs dark:border-neutral-800/80 dark:bg-neutral-900">
          <span className="text-xs text-neutral-500 font-medium">Active Rules</span>
          <p className="mt-2 text-2xl font-bold text-neutral-900 dark:text-white">
            {automations.filter((a) => a.isActive).length}{" "}
            <span className="text-xs font-normal text-neutral-400">of {automations.length}</span>
          </p>
          <p className="mt-1 text-[11px] text-emerald-600 dark:text-emerald-400">Monitoring triggers 24/7</p>
        </div>

        <div className="rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-xs dark:border-neutral-800/80 dark:bg-neutral-900">
          <span className="text-xs text-neutral-500 font-medium">Total Executions</span>
          <p className="mt-2 text-2xl font-bold text-indigo-600 dark:text-indigo-400">
            {automations.reduce((sum, a) => sum + a.executionCount, 0)}
          </p>
          <p className="mt-1 text-[11px] text-neutral-400">Automated triggers fired</p>
        </div>

        <div className="rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-xs dark:border-neutral-800/80 dark:bg-neutral-900">
          <span className="text-xs text-neutral-500 font-medium">Next Scheduled Trigger</span>
          <p className="mt-2 text-sm font-bold text-neutral-900 dark:text-white">
            Equb Reminder (in 3 days)
          </p>
          <p className="mt-1 text-[11px] text-neutral-400">Monthly cycle evaluation</p>
        </div>
      </div>

      {/* Automations List */}
      <div className="space-y-3">
        {automations.map((rule) => {
          const isRunning = testingId === rule.id;

          return (
            <div
              key={rule.id}
              className={`group flex flex-col justify-between gap-4 rounded-2xl border p-5 transition sm:flex-row sm:items-center ${
                rule.isActive
                  ? "border-neutral-200/80 bg-white shadow-xs dark:border-neutral-800/80 dark:bg-neutral-900"
                  : "border-neutral-200/50 bg-neutral-50/50 opacity-60 dark:border-neutral-800/50 dark:bg-neutral-900/30"
              }`}
            >
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      rule.category === "Finance"
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                        : rule.category === "Holidays"
                        ? "bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300"
                        : "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300"
                    }`}
                  >
                    {rule.category}
                  </span>
                  <Link
                    href={`/automations/${rule.id}`}
                    className="text-sm font-bold text-neutral-900 hover:text-indigo-600 dark:text-white dark:hover:text-indigo-400"
                  >
                    {rule.title}
                  </Link>
                </div>

                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  {rule.description}
                </p>

                <div className="flex flex-wrap items-center gap-4 pt-1 text-[11px] text-neutral-400">
                  <div className="flex items-center gap-1.5 font-mono">
                    <Clock className="h-3 w-3 text-neutral-400" />
                    <span>IF: {rule.trigger}</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-mono text-indigo-600 dark:text-indigo-400">
                    <Zap className="h-3 w-3" />
                    <span>THEN: {rule.action}</span>
                  </div>
                  {rule.lastRun && (
                    <span>Last run: {new Date(rule.lastRun).toLocaleDateString()}</span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleTestRun(rule.id)}
                  disabled={isRunning}
                  className="inline-flex items-center gap-1 rounded-xl border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800 disabled:opacity-50"
                  title="Test trigger"
                >
                  <Play className={`h-3.5 w-3.5 text-indigo-500 ${isRunning ? "animate-spin" : ""}`} />
                  <span>{isRunning ? "Running..." : "Test Run"}</span>
                </button>

                <button
                  onClick={() => handleToggle(rule.id)}
                  className={`flex h-8 w-8 items-center justify-center rounded-xl transition ${
                    rule.isActive
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                      : "bg-neutral-200 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400"
                  }`}
                  title={rule.isActive ? "Disable automation" : "Enable automation"}
                >
                  <Power className="h-4 w-4" />
                </button>

                <Link
                  href={`/automations/${rule.id}`}
                  className="flex h-8 w-8 items-center justify-center rounded-xl border border-neutral-200 text-neutral-500 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800"
                  title="Configure rule"
                >
                  <ChevronRight className="h-4 w-4" />
                </Link>

                <button
                  onClick={(e) => handleDelete(rule.id, e)}
                  className="p-1.5 text-neutral-400 opacity-0 transition group-hover:opacity-100 hover:text-rose-500"
                  title="Delete rule"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}