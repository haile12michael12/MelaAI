"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  CurrencyCode,
  formatCurrency,
} from "@/lib/finance/intelligence";
import {
  GoalItem,
  GoalCategory,
  GoalPriority,
  GOAL_CATEGORIES,
  DEFAULT_GOALS,
  MelaGoalsIntelligence,
} from "@/lib/goals/intelligence";
import {
  Target,
  Plus,
  TrendingUp,
  Calendar,
  Trash2,
  Edit2,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Filter,
  Layers,
  ChevronRight,
} from "lucide-react";

export default function GoalsDashboardPage() {
  const [currency, setCurrency] = useState<CurrencyCode>("ETB");
  const [goals, setGoals] = useState<GoalItem[]>(DEFAULT_GOALS);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedPriority, setSelectedPriority] = useState<string>("all");

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isContributeModalOpen, setIsContributeModalOpen] = useState(false);
  const [activeGoalForContribution, setActiveGoalForContribution] = useState<GoalItem | null>(null);

  // Form states
  const [goalForm, setGoalForm] = useState({
    title: "",
    category: "Tech & Equipment" as GoalCategory,
    targetAmount: "",
    currentAmount: "",
    deadline: "2026-12-31",
    priority: "high" as GoalPriority,
    notes: "",
  });
  const [contributionForm, setContributionForm] = useState({
    amount: "",
    note: "",
    date: new Date().toISOString().slice(0, 10),
  });

  const goalsWithIntelligence = useMemo(() => {
    return goals.map((g) => ({
      ...g,
      intelligence: MelaGoalsIntelligence.analyzeGoal(g),
    }));
  }, [goals]);

  const filteredGoals = useMemo(() => {
    return goalsWithIntelligence.filter((g) => {
      const matchCat = selectedCategory === "all" || g.category === selectedCategory;
      const matchPri = selectedPriority === "all" || g.priority === selectedPriority;
      return matchCat && matchPri;
    });
  }, [goalsWithIntelligence, selectedCategory, selectedPriority]);

  // Overall metrics
  const totalTarget = useMemo(() => goals.reduce((sum, g) => sum + (g.targetAmount || 0), 0), [goals]);
  const totalCurrent = useMemo(() => goals.reduce((sum, g) => sum + (g.currentAmount || 0), 0), [goals]);
  const overallProgress = useMemo(() => (totalTarget > 0 ? Math.round((totalCurrent / totalTarget) * 100) : 0), [totalTarget, totalCurrent]);
  const totalMonthlyDemand = useMemo(() => {
    return goalsWithIntelligence.reduce((sum, g) => sum + g.intelligence.requiredMonthlyContribution, 0);
  }, [goalsWithIntelligence]);

  // Create Goal
  const handleSaveGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalForm.title || !goalForm.targetAmount) return;

    const target = parseFloat(goalForm.targetAmount) || 1000;
    const current = parseFloat(goalForm.currentAmount) || 0;

    const newGoal: GoalItem = {
      id: "goal_" + Date.now(),
      title: goalForm.title,
      category: goalForm.category,
      targetAmount: target,
      currentAmount: current,
      deadline: goalForm.deadline || undefined,
      priority: goalForm.priority,
      currency,
      notes: goalForm.notes,
      createdAt: new Date().toISOString().slice(0, 10),
      updatedAt: new Date().toISOString().slice(0, 10),
      status: current >= target ? "completed" : "in_progress",
      contributions: current > 0 ? [{ id: "c_" + Date.now(), amount: current, date: new Date().toISOString().slice(0, 10), note: "Initial deposit" }] : [],
      milestones: MelaGoalsIntelligence.generateDefaultMilestones(target),
    };
    newGoal.milestones = MelaGoalsIntelligence.syncMilestones(newGoal.milestones, current);

    setGoals((prev) => [newGoal, ...prev]);
    setGoalForm({ title: "", category: "Tech & Equipment", targetAmount: "", currentAmount: "", deadline: "2026-12-31", priority: "high", notes: "" });
    setIsAddModalOpen(false);
  };

  // Add Contribution
  const handleSaveContribution = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeGoalForContribution || !contributionForm.amount) return;

    const amt = parseFloat(contributionForm.amount) || 0;
    setGoals((prev) =>
      prev.map((g) => {
        if (g.id === activeGoalForContribution.id) {
          const newCurrent = g.currentAmount + amt;
          const updatedMilestones = MelaGoalsIntelligence.syncMilestones(g.milestones, newCurrent);
          return {
            ...g,
            currentAmount: newCurrent,
            updatedAt: new Date().toISOString().slice(0, 10),
            status: newCurrent >= g.targetAmount ? "completed" : g.status,
            contributions: [
              { id: "c_" + Date.now(), amount: amt, date: contributionForm.date, note: contributionForm.note || "Contribution" },
              ...g.contributions,
            ],
            milestones: updatedMilestones,
          };
        }
        return g;
      })
    );

    setActiveGoalForContribution(null);
    setContributionForm({ amount: "", note: "", date: new Date().toISOString().slice(0, 10) });
    setIsContributeModalOpen(false);
  };

  const getPaceBadgeClass = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300";
      case "On Track":
        return "bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300";
      case "Moderate Pace":
        return "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300";
      default:
        return "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300";
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
            MELA Goals & Target Savings
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Intelligent timeline projection, monthly contribution calculation & milestone tracking.
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
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" />
            <span>New Goal</span>
          </button>
        </div>
      </div>

      {/* KPI Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-neutral-200/80 bg-gradient-to-br from-neutral-950 via-neutral-900 to-indigo-950 p-8 text-white shadow-xl dark:border-neutral-800">
        <div className="relative z-10 flex flex-col justify-between gap-8 lg:flex-row lg:items-center">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-bold text-indigo-300">
              <Target className="h-3.5 w-3.5" />
              Total Savings Progress
            </span>
            <p className="mt-3 text-4xl font-extrabold tracking-tight sm:text-5xl">
              {formatCurrency(totalCurrent, currency)}
            </p>
            <p className="mt-1 text-xs text-neutral-400">
              of {formatCurrency(totalTarget, currency)} total goal commitments ({overallProgress}% achieved)
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5 text-emerald-400">
                <Sparkles className="h-4 w-4" />
                <span>Total Monthly Savings Demand: {formatCurrency(totalMonthlyDemand, currency)}/mo</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-neutral-800 pt-6 sm:grid-cols-3 sm:border-t-0 sm:border-l sm:pl-8 sm:pt-0">
            <div>
              <span className="text-[11px] font-medium text-neutral-400">Active Goals</span>
              <p className="mt-1 text-xl font-bold text-white">{goals.length}</p>
              <span className="text-[10px] text-emerald-400">All Tracked</span>
            </div>
            <div>
              <span className="text-[11px] font-medium text-neutral-400">Total Target</span>
              <p className="mt-1 text-xl font-bold text-indigo-300">{formatCurrency(totalTarget, currency)}</p>
              <span className="text-[10px] text-neutral-400">Across targets</span>
            </div>
            <div>
              <span className="text-[11px] font-medium text-neutral-400">Avg Completion</span>
              <p className="mt-1 text-xl font-bold text-emerald-400">{overallProgress}%</p>
              <span className="text-[10px] text-emerald-400">On Track</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
              selectedCategory === "all"
                ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                : "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"
            }`}
          >
            All Categories ({goals.length})
          </button>
          {GOAL_CATEGORIES.map((cat) => (
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
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredGoals.map((g) => {
          const intel = g.intelligence;
          return (
            <div
              key={g.id}
              className="flex flex-col justify-between rounded-3xl border border-neutral-200/80 bg-white p-6 shadow-xs transition hover:shadow-md dark:border-neutral-800/80 dark:bg-neutral-900"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                      {g.category}
                    </span>
                    <h3 className="mt-1 text-base font-bold text-neutral-900 dark:text-white">
                      {g.title}
                    </h3>
                  </div>

                  <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold ${getPaceBadgeClass(intel.paceStatus)}`}>
                    {intel.paceStatus} ({intel.probabilityScore}%)
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="mt-5 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-extrabold text-neutral-900 dark:text-white">
                      {formatCurrency(g.currentAmount, currency)}
                    </span>
                    <span className="font-semibold text-neutral-400">
                      of {formatCurrency(g.targetAmount, currency)} ({intel.progressPercent}%)
                    </span>
                  </div>

                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
                    <div
                      style={{ width: `${intel.progressPercent}%` }}
                      className="h-full rounded-full bg-indigo-600 transition-all duration-500"
                    />
                  </div>
                </div>

                {/* MELA Intelligence Insight Box */}
                <div className="mt-5 rounded-2xl bg-indigo-50/70 p-3.5 text-xs dark:bg-indigo-950/30">
                  <div className="flex items-center gap-1.5 font-bold text-indigo-900 dark:text-indigo-300">
                    <Sparkles className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                    <span>MELA Intelligence Projection</span>
                  </div>
                  <p className="mt-1.5 text-[11px] leading-relaxed text-indigo-950/80 dark:text-indigo-200/80">
                    {intel.aiExplanation}
                  </p>
                  <div className="mt-2 flex items-center justify-between border-t border-indigo-100/60 pt-2 text-[10px] text-indigo-700 dark:border-indigo-900/40 dark:text-indigo-300">
                    <span>Deadline: {g.deadline || "Open"}</span>
                    <span>Projected: {intel.projectedCompletionDate}</span>
                  </div>
                </div>

                {/* Milestones Preview */}
                <div className="mt-4 space-y-1.5">
                  <span className="text-[10px] font-bold text-neutral-400">Milestones ({g.milestones.filter(m => m.isCompleted).length}/{g.milestones.length})</span>
                  <div className="flex gap-1.5">
                    {g.milestones.map((m) => (
                      <div
                        key={m.id}
                        title={`${m.title}: ${formatCurrency(m.targetAmount, currency)} (${m.isCompleted ? "Done" : "Pending"})`}
                        className={`h-1.5 flex-1 rounded-full ${m.isCompleted ? "bg-emerald-500" : "bg-neutral-200 dark:bg-neutral-800"}`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="mt-6 flex items-center justify-between border-t border-neutral-100 pt-3 dark:border-neutral-800">
                <button
                  onClick={() => {
                    setActiveGoalForContribution(g);
                    setIsContributeModalOpen(true);
                  }}
                  className="flex items-center gap-1 text-xs font-bold text-indigo-600 transition hover:text-indigo-700 dark:text-indigo-400"
                >
                  <Plus className="h-3.5 w-3.5" /> + Contribute
                </button>

                <div className="flex items-center gap-3">
                  <Link
                    href={`/goals/${g.id}`}
                    className="flex items-center gap-1 text-xs font-semibold text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                  >
                    Details <ChevronRight className="h-3.5 w-3.5" />
                  </Link>

                  <button
                    onClick={() => setGoals((prev) => prev.filter((item) => item.id !== g.id))}
                    className="text-neutral-400 hover:text-red-500"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Goal Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-neutral-900">
            <h3 className="text-base font-bold text-neutral-900 dark:text-white">Create New Goal</h3>
            <p className="mt-1 text-xs text-neutral-500">MELA will automatically calculate required monthly/weekly contribution rates.</p>

            <form onSubmit={handleSaveGoal} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">Goal Title</label>
                <input
                  type="text"
                  required
                  value={goalForm.title}
                  onChange={(e) => setGoalForm({ ...goalForm, title: e.target.value })}
                  placeholder="e.g. Laptop / Tech Setup"
                  className="mt-1 w-full rounded-xl border border-neutral-200 px-3 py-2 text-xs dark:border-neutral-700 dark:bg-neutral-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">Category</label>
                  <select
                    value={goalForm.category}
                    onChange={(e) => setGoalForm({ ...goalForm, category: e.target.value as GoalCategory })}
                    className="mt-1 w-full rounded-xl border border-neutral-200 px-3 py-2 text-xs dark:border-neutral-700 dark:bg-neutral-800"
                  >
                    {GOAL_CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">Priority</label>
                  <select
                    value={goalForm.priority}
                    onChange={(e) => setGoalForm({ ...goalForm, priority: e.target.value as GoalPriority })}
                    className="mt-1 w-full rounded-xl border border-neutral-200 px-3 py-2 text-xs dark:border-neutral-700 dark:bg-neutral-800"
                  >
                    <option value="high">High Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="low">Low Priority</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">Target Amount ({currency})</label>
                  <input
                    type="number"
                    required
                    step="any"
                    value={goalForm.targetAmount}
                    onChange={(e) => setGoalForm({ ...goalForm, targetAmount: e.target.value })}
                    placeholder="e.g. 80000"
                    className="mt-1 w-full rounded-xl border border-neutral-200 px-3 py-2 text-xs dark:border-neutral-700 dark:bg-neutral-800"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">Current Saved ({currency})</label>
                  <input
                    type="number"
                    step="any"
                    value={goalForm.currentAmount}
                    onChange={(e) => setGoalForm({ ...goalForm, currentAmount: e.target.value })}
                    placeholder="e.g. 45000"
                    className="mt-1 w-full rounded-xl border border-neutral-200 px-3 py-2 text-xs dark:border-neutral-700 dark:bg-neutral-800"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">Target Deadline Date</label>
                <input
                  type="date"
                  required
                  value={goalForm.deadline}
                  onChange={(e) => setGoalForm({ ...goalForm, deadline: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-neutral-200 px-3 py-2 text-xs dark:border-neutral-700 dark:bg-neutral-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700"
                >
                  Create Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Contribute Modal */}
      {isContributeModalOpen && activeGoalForContribution && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-neutral-900">
            <h3 className="text-base font-bold text-neutral-900 dark:text-white">
              Add Contribution to {activeGoalForContribution.title}
            </h3>
            <p className="mt-1 text-xs text-neutral-500">
              Current: {formatCurrency(activeGoalForContribution.currentAmount, currency)} / Target: {formatCurrency(activeGoalForContribution.targetAmount, currency)}
            </p>

            <form onSubmit={handleSaveContribution} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">Contribution Amount ({currency})</label>
                <input
                  type="number"
                  required
                  step="any"
                  value={contributionForm.amount}
                  onChange={(e) => setContributionForm({ ...contributionForm, amount: e.target.value })}
                  placeholder="e.g. 10000"
                  className="mt-1 w-full rounded-xl border border-neutral-200 px-3 py-2 text-xs dark:border-neutral-700 dark:bg-neutral-800"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">Date</label>
                <input
                  type="date"
                  required
                  value={contributionForm.date}
                  onChange={(e) => setContributionForm({ ...contributionForm, date: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-neutral-200 px-3 py-2 text-xs dark:border-neutral-700 dark:bg-neutral-800"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">Note / Source (Optional)</label>
                <input
                  type="text"
                  value={contributionForm.note}
                  onChange={(e) => setContributionForm({ ...contributionForm, note: e.target.value })}
                  placeholder="e.g. Monthly salary savings allocation"
                  className="mt-1 w-full rounded-xl border border-neutral-200 px-3 py-2 text-xs dark:border-neutral-700 dark:bg-neutral-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsContributeModalOpen(false)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700"
                >
                  Record Contribution
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
