import { Session } from "@/lib/auth";
import {
  listExpenses,
  getPortfolio,
  listSubscriptions,
  listWatchlist,
  getNote
} from "@/lib/firebase";

export interface TargetedContext {
  domain: string;
  summary: string;
  data: Record<string, unknown>;
}

/**
 * Extracts domain-specific minimum context based on query keywords.
 * Never dumps the entire database to the LLM.
 */
export async function extractDomainContext(session: Session, query: string): Promise<TargetedContext[]> {
  const q = query.toLowerCase();
  const contexts: TargetedContext[] = [];

  // Finance / Expense detection
  if (
    q.includes("spend") ||
    q.includes("expense") ||
    q.includes("cost") ||
    q.includes("money") ||
    q.includes("budget") ||
    q.includes("salary") ||
    q.includes("income") ||
    q.includes("bought") ||
    q.includes("paid")
  ) {
    try {
      const allExpenses = await listExpenses(session);
      const recent = allExpenses.slice(0, 15);
      const now = new Date();
      const currentMonthPrefix = now.toISOString().slice(0, 7);

      let monthlyTotal = 0;
      const categoryMap: Record<string, number> = {};

      for (const e of allExpenses) {
        if (!e.date || e.date.startsWith(currentMonthPrefix)) {
          const amt = e.amount || 0;
          if (amt > 0) {
            monthlyTotal += amt;
            const cat = e.category || "General";
            categoryMap[cat] = (categoryMap[cat] || 0) + amt;
          }
        }
      }

      contexts.push({
        domain: "finance",
        summary: `Current month spending total is ${monthlyTotal}. Top categories: ${Object.entries(categoryMap).slice(0, 3).map(([k, v]) => `${k}: ${v}`).join(", ") || "None"}.`,
        data: {
          monthlyTotal,
          topCategories: categoryMap,
          recentTransactions: recent.map(r => ({ id: r.id, title: r.title, amount: r.amount, category: r.category, date: r.date })),
        }
      });
    } catch (err) {
      console.error("[ContextLayer] Finance context error:", err);
    }
  }

  // Net Worth / Balance Sheet detection
  if (
    q.includes("net worth") ||
    q.includes("balance sheet") ||
    q.includes("asset") ||
    q.includes("liability") ||
    q.includes("liabilities") ||
    q.includes("debt") ||
    q.includes("loan") ||
    q.includes("gold") ||
    q.includes("real estate") ||
    q.includes("vehicle")
  ) {
    try {
      const { MelaNetWorthService, DEFAULT_ASSETS, DEFAULT_LIABILITIES, DEFAULT_SNAPSHOTS } = await import("@/lib/finance/net-worth");
      const summary = MelaNetWorthService.calculateSummary(DEFAULT_ASSETS, DEFAULT_LIABILITIES, DEFAULT_SNAPSHOTS);

      contexts.push({
        domain: "net-worth",
        summary: `Current Net Worth is ${summary.currentNetWorth} ETB (Total Assets: ${summary.totalAssets} ETB across ${summary.assetAllocation.length} categories, Total Liabilities: ${summary.totalLiabilities} ETB, Debt-to-Asset Ratio: ${summary.debtToAssetRatio.toFixed(1)}%). MoM Change: +${summary.monthlyChangeAmount} (${summary.monthlyChangePercent.toFixed(1)}%), YoY Change: +${summary.annualChangeAmount} (${summary.annualChangePercent.toFixed(1)}%).`,
        data: {
          currentNetWorth: summary.currentNetWorth,
          totalAssets: summary.totalAssets,
          totalLiabilities: summary.totalLiabilities,
          debtToAssetRatio: summary.debtToAssetRatio,
          monthlyChange: { amount: summary.monthlyChangeAmount, percent: summary.monthlyChangePercent },
          annualChange: { amount: summary.annualChangeAmount, percent: summary.annualChangePercent },
          assetAllocation: summary.assetAllocation,
          liabilityAllocation: summary.liabilityAllocation,
        }
      });
    } catch (err) {
      console.error("[ContextLayer] Net Worth context error:", err);
    }
  }

  // Goals / Target Savings detection
  if (
    q.includes("goal") ||
    q.includes("target") ||
    q.includes("laptop") ||
    q.includes("milestone") ||
    q.includes("save for") ||
    q.includes("how much to save") ||
    q.includes("how much do i need") ||
    q.includes("emergency fund")
  ) {
    try {
      const { MelaGoalsIntelligence, DEFAULT_GOALS } = await import("@/lib/goals/intelligence");
      const analyzed = DEFAULT_GOALS.map((g) => ({
        ...g,
        intel: MelaGoalsIntelligence.analyzeGoal(g),
      }));

      const topGoalsSummary = analyzed
        .map(
          (g) =>
            `- ${g.title}: ${g.currentAmount}/${g.targetAmount} ETB (${g.intel.progressPercent}%). Needs ${g.intel.requiredMonthlyContribution} ETB/mo. Pace: ${g.intel.paceStatus} (${g.intel.probabilityScore}% prob).`
        )
        .join("\n");

      contexts.push({
        domain: "goals",
        summary: `User has ${analyzed.length} active savings goals:\n${topGoalsSummary}`,
        data: {
          goals: analyzed.map((g) => ({
            id: g.id,
            title: g.title,
            target: g.targetAmount,
            current: g.currentAmount,
            deadline: g.deadline,
            requiredMonthly: g.intel.requiredMonthlyContribution,
            requiredWeekly: g.intel.requiredWeeklyContribution,
            projectedDate: g.intel.projectedCompletionDate,
            probabilityScore: g.intel.probabilityScore,
            paceStatus: g.intel.paceStatus,
            explanation: g.intel.aiExplanation,
          })),
        },
      });
    } catch (err) {
      console.error("[ContextLayer] Goals context error:", err);
    }
  }

  // Tasks & Productivity detection
  if (
    q.includes("task") ||
    q.includes("todo") ||
    q.includes("what do i need to do today") ||
    q.includes("overdue") ||
    q.includes("plan my week") ||
    q.includes("agenda") ||
    q.includes("schedule") ||
    q.includes("reminder") ||
    q.includes("calendar") ||
    q.includes("priority")
  ) {
    try {
      const { MelaProductivityEngine, DEFAULT_TASKS, DEFAULT_CALENDAR_EVENTS } = await import("@/lib/tasks/productivity");
      const refDate = "2026-09-07";
      const summary = MelaProductivityEngine.getSummary(DEFAULT_TASKS, refDate);
      const todayTasks = MelaProductivityEngine.getTodayTasks(DEFAULT_TASKS, refDate);
      const overdueTasks = MelaProductivityEngine.getOverdueTasks(DEFAULT_TASKS, refDate);
      const weeklyPlan = MelaProductivityEngine.getWeeklyPlan(DEFAULT_TASKS, DEFAULT_CALENDAR_EVENTS, refDate);

      let contextSummary = `User has ${summary.totalTasks - summary.completed} active tasks (${summary.dueToday} due today, ${summary.overdue} overdue, ${summary.urgentCount + summary.highCount} urgent/high priority).`;

      if (q.includes("today") || q.includes("what do i need to do")) {
        contextSummary += ` Today's Tasks: ${todayTasks.map((t) => `${t.title} [${t.priority}]`).join(", ") || "None scheduled."}`;
      }
      if (q.includes("overdue")) {
        contextSummary += ` Overdue Tasks: ${overdueTasks.map((t) => `${t.title} (due ${t.dueDate})`).join(", ") || "None."}`;
      }
      if (q.includes("plan my week") || q.includes("week")) {
        contextSummary += ` Weekly Overview: ${weeklyPlan.map((d) => `${d.dayName}: ${d.totalItems} items`).join(" | ")}`;
      }

      contexts.push({
        domain: "tasks",
        summary: contextSummary,
        data: {
          summary,
          todayTasks: todayTasks.map((t) => ({ id: t.id, title: t.title, priority: t.priority, project: t.project, subtasks: t.subtasks })),
          overdueTasks: overdueTasks.map((t) => ({ id: t.id, title: t.title, dueDate: t.dueDate, priority: t.priority })),
          weeklyPlan: weeklyPlan.map((d) => ({ date: d.date, day: d.dayName, taskCount: d.tasks.length, eventCount: d.events.length })),
        },
      });
    } catch (err) {
      console.error("[ContextLayer] Tasks context error:", err);
    }
  }

  // Habits & Routines detection
  if (
    q.includes("habit") ||
    q.includes("routine") ||
    q.includes("streak") ||
    q.includes("failing to maintain") ||
    q.includes("best streak") ||
    q.includes("which habit should i focus on") ||
    q.includes("focus on") ||
    q.includes("consistency") ||
    q.includes("heatmap")
  ) {
    try {
      const { MelaHabitsIntelligence, DEFAULT_HABITS, generateSeedLogs } = await import("@/lib/habits/intelligence");
      const refDate = "2026-09-07";
      const logs = generateSeedLogs();
      const report = MelaHabitsIntelligence.generateSummaryReport(DEFAULT_HABITS, logs, refDate);
      const qAnswer = MelaHabitsIntelligence.answerQuestion(query, DEFAULT_HABITS, logs, refDate);

      contexts.push({
        domain: "habits",
        summary: `User tracks ${report.totalHabits} habits with overall consistency of ${report.overallConsistencyRate}%. Best active streak: ${report.bestActiveStreak.title} (${report.bestActiveStreak.streak} days). Best all-time: ${report.bestAllTimeStreak.title} (${report.bestAllTimeStreak.streak} days). Failing habits: ${report.failingHabits.map((f) => f.title).join(", ") || "None"}. Recommended focus: ${report.focusHabit.title}. Analysis: ${qAnswer.answer}`,
        data: {
          summary: report,
          answer: qAnswer.answer,
        },
      });
    } catch (err) {
      console.error("[ContextLayer] Habits context error:", err);
    }
  }

  // Investment / Portfolio detection
  if (
    q.includes("invest") ||
    q.includes("portfolio") ||
    q.includes("stock") ||
    q.includes("crypto") ||
    q.includes("mutual fund") ||
    q.includes("sip") ||
    q.includes("pnl") ||
    q.includes("gain") ||
    q.includes("loss")
  ) {
    try {
      const portfolio = await getPortfolio(session);
      const active = (portfolio?.assets || []).filter(a => !a.isSold);
      const totalVal = active.reduce((sum, a) => sum + (a.amount || 0), 0);
      const totalInvested = active.reduce((sum, a) => sum + (a.investedAmount || a.amount || 0), 0);

      contexts.push({
        domain: "investments",
        summary: `Portfolio has ${active.length} active assets with total valuation ${totalVal} (Invested: ${totalInvested}, Net PnL: ${totalVal - totalInvested}).`,
        data: {
          totalValuation: totalVal,
          totalInvested,
          netPnl: totalVal - totalInvested,
          holdings: active.slice(0, 10).map(a => ({ name: a.name, category: a.category, amount: a.amount, invested: a.investedAmount })),
        }
      });
    } catch (err) {
      console.error("[ContextLayer] Investments context error:", err);
    }
  }

  // Subscriptions detection
  if (
    q.includes("subscription") ||
    q.includes("recurring") ||
    q.includes("renew") ||
    q.includes("netflix") ||
    q.includes("spotify") ||
    q.includes("bill")
  ) {
    try {
      const subs = await listSubscriptions(session);
      const monthlyBurn = subs.reduce((sum, s) => sum + (s.billingCycle === "yearly" ? s.cost / 12 : s.cost), 0);

      contexts.push({
        domain: "subscriptions",
        summary: `User has ${subs.length} active recurring subscriptions totaling ${monthlyBurn.toFixed(2)}/mo effective cost.`,
        data: {
          monthlyBurn,
          subscriptions: subs.map(s => ({ name: s.name, cost: s.cost, cycle: s.billingCycle, nextDate: s.nextBillingDate })),
        }
      });
    } catch (err) {
      console.error("[ContextLayer] Subscriptions context error:", err);
    }
  }

  // Media & Books detection
  if (
    q.includes("watch") ||
    q.includes("movie") ||
    q.includes("show") ||
    q.includes("anime") ||
    q.includes("book") ||
    q.includes("read") ||
    q.includes("episode") ||
    q.includes("library")
  ) {
    try {
      const watchlist = await listWatchlist(session);
      const active = watchlist.filter(w => w.status === "watching" || w.status === "plan_to_watch").slice(0, 10);

      contexts.push({
        domain: "media",
        summary: `Currently watching/reading ${active.length} media items.`,
        data: {
          activeItems: active.map(w => ({ title: w.title, type: w.type, status: w.status, progress: w.progress, total: w.totalEpisodes, rating: w.rating })),
        }
      });
    } catch (err) {
      console.error("[ContextLayer] Media context error:", err);
    }
  }

  // Notes detection
  if (q.includes("note") || q.includes("scratchpad") || q.includes("memo") || q.includes("jot")) {
    try {
      const note = await getNote(session);
      if (note && note.content) {
        contexts.push({
          domain: "notes",
          summary: "Contents of user scratchpad note retrieved.",
          data: { content: note.content.slice(0, 500) }
        });
      }
    } catch (err) {
      console.error("[ContextLayer] Notes context error:", err);
    }
  }

  return contexts;
}
