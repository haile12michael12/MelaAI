import { RoutePlaceholder } from "@/components/route-placeholder";
"use client";

export default function AutomationDetailsPage() { return <RoutePlaceholder title="Automation details" />; }
import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Sparkles,
  ArrowLeft,
  Clock,
  Zap,
  Power,
  Play,
  Trash2,
  CheckCircle2,
  Activity,
} from "lucide-react";
import { INITIAL_AUTOMATIONS, AutomationRule } from "../page";

export default function AutomationDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [rule, setRule] = useState<AutomationRule | null>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("mela_automations_data");
      if (saved) {
        try {
          const list: AutomationRule[] = JSON.parse(saved);
          return list.find((r) => r.id === id) || null;
        } catch {}
      }
    }
    return INITIAL_AUTOMATIONS.find((r) => r.id === id) || null;
  });

  const [isRunning, setIsRunning] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  if (!rule) {
    return (
      <div className="space-y-4">
        <Link
          href="/automations"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Automations</span>
        </Link>
        <div className="rounded-2xl border border-dashed border-neutral-300 p-12 text-center text-xs text-neutral-400 dark:border-neutral-800">
          Automation rule not found.
        </div>
      </div>
    );
  }

  const handleToggle = () => {
    const updated = { ...rule, isActive: !rule.isActive };
    setRule(updated);
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("mela_automations_data");
      if (saved) {
        const list: AutomationRule[] = JSON.parse(saved);
        localStorage.setItem(
          "mela_automations_data",
          JSON.stringify(list.map((r) => (r.id === rule.id ? updated : r)))
        );
      }
    }
  };

  const handleTestExecution = () => {
    setIsRunning(true);
    setTimeout(() => {
      const updated = {
        ...rule,
        executionCount: rule.executionCount + 1,
        lastRun: new Date().toISOString(),
      };
      setRule(updated);
      setIsRunning(false);
      setStatusMsg("Trigger simulated successfully!");
      setTimeout(() => setStatusMsg(null), 3000);
    }, 600);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link
        href="/automations"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Automations</span>
      </Link>

      {statusMsg && (
        <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-medium text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/20 dark:text-emerald-300">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <span>{statusMsg}</span>
        </div>
      )}

      <div className="rounded-3xl border border-neutral-200/80 bg-white p-6 shadow-xs dark:border-neutral-800/80 dark:bg-neutral-900">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between border-b border-neutral-100 pb-5 dark:border-neutral-800">
          <div>
            <span className="rounded-md bg-indigo-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300">
              {rule.category}
            </span>
            <h1 className="mt-2 text-xl font-bold text-neutral-900 dark:text-white">
              {rule.title}
            </h1>
            <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
              {rule.description}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleTestExecution}
              disabled={isRunning}
              className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800 disabled:opacity-50"
            >
              <Play className={`h-3.5 w-3.5 text-indigo-500 ${isRunning ? "animate-spin" : ""}`} />
              <span>{isRunning ? "Simulating..." : "Test Run"}</span>
            </button>

            <button
              onClick={handleToggle}
              className={`flex h-8 w-8 items-center justify-center rounded-xl transition ${
                rule.isActive
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                  : "bg-neutral-200 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400"
              }`}
              title={rule.isActive ? "Disable" : "Enable"}
            >
              <Power className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Configuration Summary */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-2xl bg-neutral-50 p-4 dark:bg-neutral-800/50">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              <Clock className="h-4 w-4 text-neutral-400" />
              <span>Trigger (WHEN)</span>
            </div>
            <p className="mt-2 font-mono text-xs text-neutral-900 dark:text-white">
              {rule.trigger}
            </p>
          </div>

          <div className="rounded-2xl bg-neutral-50 p-4 dark:bg-neutral-800/50">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              <Zap className="h-4 w-4 text-indigo-500" />
              <span>Action (THEN)</span>
            </div>
            <p className="mt-2 font-mono text-xs text-indigo-600 dark:text-indigo-400">
              {rule.action}
            </p>
          </div>
        </div>

        {/* Execution Log */}
        <div className="mt-6 rounded-2xl border border-neutral-100 p-4 dark:border-neutral-800">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-neutral-900 dark:text-white">
              Execution Statistics
            </h3>
            <span className="text-[11px] text-neutral-400 font-mono">
              Total Runs: {rule.executionCount}
            </span>
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-neutral-500">
            <span>Status:</span>
            <span className={rule.isActive ? "font-bold text-emerald-600 dark:text-emerald-400" : "text-neutral-400"}>
              {rule.isActive ? "Active (Listening for triggers)" : "Paused"}
            </span>
          </div>

          <div className="mt-2 flex items-center justify-between text-xs text-neutral-500">
            <span>Last Executed:</span>
            <span>{rule.lastRun ? new Date(rule.lastRun).toLocaleString() : "Never"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}