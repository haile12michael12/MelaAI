"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  ArrowLeft,
  Clock,
  Zap,
  Save,
  Bell,
  Wallet,
  Calendar,
} from "lucide-react";
import { INITIAL_AUTOMATIONS, AutomationRule } from "../page";

export default function CreateAutomationPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<AutomationRule["category"]>("Finance");
  const [trigger, setTrigger] = useState("Equb Payment Schedule");
  const [action, setAction] = useState("Push Notification");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newRule: AutomationRule = {
      id: `auto-${Date.now()}`,
      title: title.trim(),
      description: description.trim() || `Automated trigger for ${title}`,
      category,
      trigger,
      action,
      isActive: true,
      executionCount: 0,
    };

    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("mela_automations_data");
      const list = saved ? JSON.parse(saved) : INITIAL_AUTOMATIONS;
      localStorage.setItem("mela_automations_data", JSON.stringify([newRule, ...list]));
    }

    router.push("/automations");
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link
        href="/automations"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Automations</span>
      </Link>

      <div className="rounded-3xl border border-neutral-200/80 bg-white p-6 shadow-xs dark:border-neutral-800/80 dark:bg-neutral-900">
        <div className="flex items-center gap-2.5 border-b border-neutral-100 pb-4 dark:border-neutral-800">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-neutral-900 dark:text-white">
              Create New Automation Rule
            </h1>
            <p className="text-xs text-neutral-400">
              Configure event triggers and actions across your personal operating system
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              Rule Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. End of Month Teff & Rent Reminder"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full rounded-xl border border-neutral-200 bg-white p-2.5 text-xs text-neutral-900 focus:border-indigo-500 focus:outline-none dark:border-neutral-800 dark:bg-neutral-950 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              Description
            </label>
            <textarea
              rows={2}
              placeholder="Explain what this automation does..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 w-full rounded-xl border border-neutral-200 bg-white p-2.5 text-xs text-neutral-900 focus:border-indigo-500 focus:outline-none dark:border-neutral-800 dark:bg-neutral-950 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="mt-1 w-full rounded-xl border border-neutral-200 bg-white p-2.5 text-xs text-neutral-900 focus:border-indigo-500 focus:outline-none dark:border-neutral-800 dark:bg-neutral-950 dark:text-white"
              >
                <option value="Finance">Finance & Banking</option>
                <option value="Holidays">Ethiopian Holidays</option>
                <option value="Reminders">Reminders & Equb</option>
                <option value="Productivity">Productivity</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Trigger Event (WHEN)
              </label>
              <select
                value={trigger}
                onChange={(e) => setTrigger(e.target.value)}
                className="mt-1 w-full rounded-xl border border-neutral-200 bg-white p-2.5 text-xs text-neutral-900 focus:border-indigo-500 focus:outline-none dark:border-neutral-800 dark:bg-neutral-950 dark:text-white"
              >
                <option value="Equb Payment Schedule (5th of month)">Equb Payment Schedule (5th of month)</option>
                <option value="Ge'ez Holiday within 3 days">Ge'ez Holiday within 3 days</option>
                <option value="Expense exceeds 5,000 ETB">Expense exceeds 5,000 ETB</option>
                <option value="Liquid Balance < 10,000 ETB">Liquid Balance &lt; 10,000 ETB</option>
                <option value="Weekly Sunday Review (8 PM)">Weekly Sunday Review (8 PM)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              Automated Action (THEN)
            </label>
            <select
              value={action}
              onChange={(e) => setAction(e.target.value)}
              className="mt-1 w-full rounded-xl border border-neutral-200 bg-white p-2.5 text-xs text-neutral-900 focus:border-indigo-500 focus:outline-none dark:border-neutral-800 dark:bg-neutral-950 dark:text-white"
            >
              <option value="Send Push Notification & Alert Badge">Send Push Notification & Alert Badge</option>
              <option value="Create High-Priority Todo Task">Create High-Priority Todo Task</option>
              <option value="Generate Mela AI Executive Insight">Generate Mela AI Executive Insight</option>
              <option value="Log Transaction in Finance Ledger">Log Transaction in Finance Ledger</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-neutral-100 dark:border-neutral-800">
            <Link
              href="/automations"
              className="rounded-xl border border-neutral-200 px-4 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-indigo-700"
            >
              Save Automation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}