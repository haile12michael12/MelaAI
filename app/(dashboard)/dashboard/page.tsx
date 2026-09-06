"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import type { ExpenseRecord } from "@/lib/firebase";
import type { InvestmentAsset, Subscription, WatchlistItem } from "@/types";
import type { GoalItem } from "@/types/goals";
import type { TaskItem } from "@/types/tasks";
import type { BookItem } from "@/types/books";
import { MetricsOverview } from "@/components/dashboard/metrics-overview";
import { MetricsOverviewSkeleton, WidgetCardSkeleton, AIInsightSkeleton } from "@/components/dashboard/dashboard-skeleton";
import { AIInsightSection } from "@/components/mela/ai-insight-section";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { CustomizableDashboard } from "@/components/dashboard/customizable-dashboard";
import { SpendingBreakdownWidget } from "@/components/dashboard/spending-breakdown-widget";
import { InvestmentsWidget } from "@/components/dashboard/investments-widget";
import { RecentTransactionsWidget } from "@/components/dashboard/recent-transactions-widget";
import { UpcomingSubscriptionsWidget } from "@/components/dashboard/upcoming-subscriptions-widget";
import { GoalsWidget } from "@/components/dashboard/goals-widget";
import { TasksWidget } from "@/components/dashboard/tasks-widget";
import { ReadingActivityWidget } from "@/components/dashboard/reading-activity-widget";
import { MediaActivityWidget } from "@/components/dashboard/media-activity-widget";
import { QuickNotesWidget } from "@/components/dashboard/quick-notes-widget";
import { MelaQuickChatModal } from "@/components/mela/mela-quick-chat-modal";
import { DashboardErrorBoundary } from "@/components/dashboard/error-boundary";
import Link from "next/link";
import { Sparkles, LayoutDashboard, Compass, LogIn, ArrowRight } from "lucide-react";

export default function MelaDashboardPage() {
  const { user, loading: authLoading, loginWithGoogle } = useAuth();

  // Data states
  const [currency, setCurrency] = useState("Br");
  const [monthlySalary, setMonthlySalary] = useState(0);
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);
  const [portfolio, setPortfolio] = useState<InvestmentAsset[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [goals, setGoals] = useState<GoalItem[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [books, setBooks] = useState<BookItem[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  // Mela Modal
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatPrompt, setChatPrompt] = useState<string | undefined>(undefined);

  const getHeaders = useCallback(() => {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${user?.idToken || ""}`,
    };
  }, [user]);

  // Load user data
  useEffect(() => {
    if (!user) {
      if (!authLoading) setDataLoading(false);
      return;
    }

    async function fetchData() {
      setDataLoading(true);
      try {
        const headers = getHeaders();

        // 1. Settings
        const settingsRes = await fetch("/api/settings", { headers }).catch(() => null);
        if (settingsRes?.ok) {
          const s = await settingsRes.json();
          if (s.currency) setCurrency(s.currency);
          if (s.monthlySalary) setMonthlySalary(Number(s.monthlySalary));
        }

        // 2. Expenses
        const expRes = await fetch("/api/expenses", { headers }).catch(() => null);
        if (expRes?.ok) {
          const expData = await expRes.json();
          setExpenses(Array.isArray(expData) ? expData : []);
        }

        // 3. Portfolio
        const portRes = await fetch("/api/portfolio", { headers }).catch(() => null);
        if (portRes?.ok) {
          const portData = await portRes.json();
          setPortfolio(Array.isArray(portData?.assets) ? portData.assets : []);
        }

        // 4. Subscriptions
        const subRes = await fetch("/api/subscriptions", { headers }).catch(() => null);
        if (subRes?.ok) {
          const subData = await subRes.json();
          setSubscriptions(Array.isArray(subData) ? subData : []);
        }

        // 5. Watchlist
        const watchRes = await fetch("/api/watchlist", { headers }).catch(() => null);
        if (watchRes?.ok) {
          const watchData = await watchRes.json();
          setWatchlist(Array.isArray(watchData) ? watchData : []);
        }

        // 6. Local state for goals, tasks, books
        if (typeof window !== "undefined") {
          const savedGoals = localStorage.getItem("mela_goals");
          if (savedGoals) setGoals(JSON.parse(savedGoals));

          const savedTasks = localStorage.getItem("mela_tasks");
          if (savedTasks) setTasks(JSON.parse(savedTasks));

          const savedBooks = localStorage.getItem("mela_books");
          if (savedBooks) setBooks(JSON.parse(savedBooks));
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setDataLoading(false);
      }
    }

    fetchData();
  }, [user, authLoading, getHeaders]);

  // Derived Financial Computations
  const computedMetrics = useMemo(() => {
    // Current month expenses
    const now = new Date();
    const currentMonthPrefix = now.toISOString().slice(0, 7); // YYYY-MM

    let monthlyExp = 0;
    let totalAllExpenses = 0;
    let totalIncomeLogged = 0;

    for (const e of expenses) {
      const amt = e.amount || 0;
      if (amt < 0) {
        totalIncomeLogged += Math.abs(amt);
      } else {
        totalAllExpenses += amt;
        if (!e.date || e.date.startsWith(currentMonthPrefix)) {
          monthlyExp += amt;
        }
      }
    }

    const effectiveMonthlyIncome = monthlySalary > 0 ? monthlySalary : totalIncomeLogged;

    // Investment value
    const investmentVal = portfolio
      .filter((a) => !a.isSold)
      .reduce((sum, a) => sum + (a.amount || 0), 0);

    // Liquid balance = Income - Expenses
    const currentBal = effectiveMonthlyIncome - monthlyExp;

    // Net worth = Investments + Current Balance
    const netWorth = investmentVal + currentBal;

    // Savings rate
    const savingsRate =
      effectiveMonthlyIncome > 0 ? Math.max(0, ((effectiveMonthlyIncome - monthlyExp) / effectiveMonthlyIncome) * 100) : 0;

    return {
      netWorth,
      currentBalance: currentBal,
      monthlyIncome: effectiveMonthlyIncome,
      monthlyExpenses: monthlyExp,
      savingsRate,
      investmentValue: investmentVal,
    };
  }, [expenses, portfolio, monthlySalary]);

  // Quick Action Handlers
  const handleAddExpense = async (data: { title: string; amount: number; category: string; date: string; notes?: string }) => {
    const res = await fetch("/api/expenses", {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const created = await res.json();
      const newRecord: ExpenseRecord = {
        id: created.id || String(Date.now()),
        title: data.title,
        amount: data.amount,
        category: data.category,
        date: data.date,
        notes: data.notes || null,
        createdAt: Date.now(),
      };
      setExpenses((prev) => [newRecord, ...prev]);
    }
  };

  const handleAddIncome = async (data: { title: string; amount: number; date: string }) => {
    const res = await fetch("/api/expenses", {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        title: data.title,
        amount: -Math.abs(data.amount), // negative denotes income
        category: "Income",
        date: data.date,
      }),
    });
    if (res.ok) {
      const created = await res.json();
      const newRecord: ExpenseRecord = {
        id: created.id || String(Date.now()),
        title: data.title,
        amount: -Math.abs(data.amount),
        category: "Income",
        date: data.date,
        notes: null,
        createdAt: Date.now(),
      };
      setExpenses((prev) => [newRecord, ...prev]);
    }
  };

  const handleAddGoal = (data: { title: string; targetAmount: number; currentAmount: number }) => {
    const newGoal: GoalItem = {
      id: String(Date.now()),
      title: data.title,
      targetAmount: data.targetAmount,
      currentAmount: data.currentAmount,
    };
    const updated = [newGoal, ...goals];
    setGoals(updated);
    if (typeof window !== "undefined") localStorage.setItem("mela_goals", JSON.stringify(updated));
  };

  const handleAddTask = (data: { title: string; dueDate?: string }) => {
    const newTask: TaskItem = {
      id: String(Date.now()),
      title: data.title,
      completed: false,
      dueDate: data.dueDate,
    };
    const updated = [newTask, ...tasks];
    setTasks(updated);
    if (typeof window !== "undefined") localStorage.setItem("mela_tasks", JSON.stringify(updated));
  };

  const handleToggleTask = (id: string) => {
    const updated = tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t));
    setTasks(updated);
    if (typeof window !== "undefined") localStorage.setItem("mela_tasks", JSON.stringify(updated));
  };

  const handleAskMela = (prompt?: string) => {
    setChatPrompt(prompt);
    setIsChatOpen(true);
  };

  if (authLoading) {
    return (
      <div className="mx-auto max-w-7xl space-y-6 p-6">
        <MetricsOverviewSkeleton />
        <AIInsightSkeleton />
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          <WidgetCardSkeleton />
          <WidgetCardSkeleton />
          <WidgetCardSkeleton />
        </div>
      </div>
    );
  }

  return (
    <DashboardErrorBoundary fallbackTitle="MELA Dashboard Error">
      <div className="mx-auto max-w-7xl space-y-6">
          {/* Quick Actions Bar */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-neutral-950 dark:text-white">
                Welcome back{user?.displayName ? `, ${user.displayName.split(" ")[0]}` : ""}
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Here is your unified financial, productivity, and lifestyle status.
              </p>
            </div>

            <QuickActions
              onAddExpense={handleAddExpense}
              onAddIncome={handleAddIncome}
              onAddGoal={handleAddGoal}
              onAddTask={handleAddTask}
              onAskMela={handleAskMela}
              currency={currency}
            />
          </div>

          {/* 1. Metrics Overview Cards */}
          {dataLoading ? (
            <MetricsOverviewSkeleton />
          ) : (
            <MetricsOverview
              currency={currency}
              netWorth={computedMetrics.netWorth}
              currentBalance={computedMetrics.currentBalance}
              monthlyIncome={computedMetrics.monthlyIncome}
              monthlyExpenses={computedMetrics.monthlyExpenses}
              savingsRate={computedMetrics.savingsRate}
              investmentValue={computedMetrics.investmentValue}
            />
          )}

          {/* 2. MELA AI Insight Section */}
          {dataLoading ? (
            <AIInsightSkeleton />
          ) : (
            <AIInsightSection
              monthlyIncome={computedMetrics.monthlyIncome}
              monthlyExpenses={computedMetrics.monthlyExpenses}
              savingsRate={computedMetrics.savingsRate}
              subscriptionCount={subscriptions.length}
              portfolioCount={portfolio.filter((a) => !a.isSold).length}
              taskCount={tasks.filter((t) => !t.completed).length}
              currency={currency}
              onAskMela={handleAskMela}
            />
          )}

          {/* 3. Customizable Dashboard Widget Grid */}
          <CustomizableDashboard
            childrenMap={{
              spending: (
                <SpendingBreakdownWidget
                  expenses={expenses}
                  currency={currency}
                  onAddExpense={() => handleAskMela("Help me log a new expense")}
                />
              ),
              investments: (
                <InvestmentsWidget
                  assets={portfolio}
                  currency={currency}
                  onAddAsset={() => handleAskMela("Add a new investment to my portfolio")}
                />
              ),
              transactions: (
                <RecentTransactionsWidget
                  expenses={expenses}
                  currency={currency}
                  onAddExpense={() => handleAskMela("Log a transaction")}
                />
              ),
              subscriptions: (
                <UpcomingSubscriptionsWidget
                  subscriptions={subscriptions}
                  currency={currency}
                  onAddSubscription={() => handleAskMela("Add a subscription")}
                />
              ),
              goals: (
                <GoalsWidget
                  goals={goals}
                  currency={currency}
                  onAddGoal={() => handleAddGoal({ title: "New Goal", targetAmount: 1000, currentAmount: 0 })}
                />
              ),
              tasks: (
                <TasksWidget
                  tasks={tasks}
                  onToggleTask={handleToggleTask}
                  onAddTask={() => handleAddTask({ title: "New Priority Task" })}
                />
              ),
              reading: (
                <ReadingActivityWidget
                  books={books}
                  onAddBook={() => handleAskMela("Recommend a book for me to read")}
                />
              ),
              media: (
                <MediaActivityWidget
                  watchlist={watchlist}
                  onAddMedia={() => handleAskMela("Search for movies or anime to watch")}
                />
              ),
              notes: <QuickNotesWidget />,
            }}
          />

        {/* Quick Mela AI Chat Modal */}
        <MelaQuickChatModal
          isOpen={isChatOpen}
          onClose={() => {
            setIsChatOpen(false);
            setChatPrompt(undefined);
          }}
          initialPrompt={chatPrompt}
        />
      </div>
    </DashboardErrorBoundary>
  );
}
