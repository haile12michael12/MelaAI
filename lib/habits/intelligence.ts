export type HabitFrequency = "daily" | "weekdays" | "weekends" | "weekly_target";
export type HabitCategory =
  | "Health & Fitness"
  | "Learning & Reading"
  | "Finance & Ledger"
  | "Mindfulness"
  | "Productivity"
  | "Language & Writing";

export interface HabitLog {
  id: string;
  habitId: string;
  date: string; // YYYY-MM-DD
  completed: boolean;
  notes?: string;
}

export interface HabitItem {
  id: string;
  title: string;
  description?: string;
  category: HabitCategory;
  frequency: HabitFrequency;
  targetPerWeek: number; // 1 to 7
  color?: string;
  icon?: string;
  createdAt: string;
  archived?: boolean;
}

export interface HabitStats {
  habitId: string;
  currentStreak: number;
  bestStreak: number;
  last7DaysCount: number;
  last7DaysRate: number; // 0 - 100%
  last30DaysCount: number;
  last30DaysRate: number; // 0 - 100%
  totalCompletions: number;
  weeklyTargetMet: boolean;
  status: "Strong Streak" | "Consistent" | "At Risk" | "Needs Focus";
}

export interface HeatmapDay {
  date: string;
  count: number;
  intensity: number; // 0 (none) to 4 (max)
}

export interface HabitSummaryReport {
  totalHabits: number;
  overallConsistencyRate: number;
  bestActiveStreak: { title: string; streak: number };
  bestAllTimeStreak: { title: string; streak: number };
  failingHabits: { id: string; title: string; rate: number; currentStreak: number }[];
  focusHabit: { id: string; title: string; reason: string };
  monthlyCompletions: number;
}

export const HABIT_CATEGORIES: HabitCategory[] = [
  "Health & Fitness",
  "Learning & Reading",
  "Finance & Ledger",
  "Mindfulness",
  "Productivity",
  "Language & Writing",
];

export const DEFAULT_HABITS: HabitItem[] = [
  {
    id: "h1",
    title: "Daily Expense Ledger Check",
    description: "Reconcile Telebirr, CBE, and cash transactions in MELA",
    category: "Finance & Ledger",
    frequency: "daily",
    targetPerWeek: 7,
    color: "#10b981",
    createdAt: "2026-07-01",
  },
  {
    id: "h2",
    title: "Read 20 Pages of a Book",
    description: "Deep non-fiction / tech architectural reading",
    category: "Learning & Reading",
    frequency: "daily",
    targetPerWeek: 7,
    color: "#6366f1",
    createdAt: "2026-07-15",
  },
  {
    id: "h3",
    title: "Morning 30-Min Workout / Run",
    description: "Cardio, stretching, and physical conditioning",
    category: "Health & Fitness",
    frequency: "weekdays",
    targetPerWeek: 5,
    color: "#f59e0b",
    createdAt: "2026-06-01",
  },
  {
    id: "h4",
    title: "Amharic / English Technical Writing",
    description: "Draft engineering insights or vocabulary practice",
    category: "Language & Writing",
    frequency: "daily",
    targetPerWeek: 7,
    color: "#ec4899",
    createdAt: "2026-08-01",
  },
];

export function generateSeedLogs(): HabitLog[] {
  const logs: HabitLog[] = [];
  const ref = new Date("2026-09-07");

  // Generate 60 days of historical logs
  for (let i = 0; i < 60; i++) {
    const d = new Date(ref);
    d.setDate(ref.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);

    // h1: Strong high streak (completed ~90% of days, unbroken last 14 days)
    if (i < 14 || (i % 8 !== 0)) {
      logs.push({ id: `log_h1_${dateStr}`, habitId: "h1", date: dateStr, completed: true });
    }

    // h2: Moderate streak (completed 5 of last 7 days, broke 2 days ago)
    if (i !== 2 && i !== 5 && (i % 3 !== 0)) {
      logs.push({ id: `log_h2_${dateStr}`, habitId: "h2", date: dateStr, completed: true });
    }

    // h3: Workout (weekday pattern - best all-time streak of 24 days earlier)
    const dayOfWeek = d.getDay();
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      if (i < 10 || (i >= 20 && i <= 44)) {
        logs.push({ id: `log_h3_${dateStr}`, habitId: "h3", date: dateStr, completed: true });
      }
    }

    // h4: Failing habit (only completed 2 of last 14 days)
    if (i === 3 || i === 9 || (i > 30 && i % 2 === 0)) {
      logs.push({ id: `log_h4_${dateStr}`, habitId: "h4", date: dateStr, completed: true });
    }
  }

  return logs;
}

export class MelaHabitsIntelligence {
  /**
   * Deterministic calculation of current streak and all-time best streak for a habit.
   */
  static calculateStreaks(
    habit: HabitItem,
    logs: HabitLog[],
    refDateStr: string = "2026-09-07"
  ): { currentStreak: number; bestStreak: number } {
    const habitLogs = logs
      .filter((l) => l.habitId === habit.id && l.completed)
      .map((l) => l.date);

    const completedDates = new Set(habitLogs);
    const ref = new Date(refDateStr);

    // 1. Current Streak Calculation
    let currentStreak = 0;
    let checkDate = new Date(ref);

    const todayStr = refDateStr;
    const yesterday = new Date(ref);
    yesterday.setDate(ref.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().slice(0, 10);

    let startFrom = completedDates.has(todayStr) ? checkDate : completedDates.has(yesterdayStr) ? yesterday : null;

    if (startFrom) {
      const cur = new Date(startFrom);
      while (true) {
        const curStr = cur.toISOString().slice(0, 10);
        const dayOfWeek = cur.getDay();

        let isApplicable = true;
        if (habit.frequency === "weekdays" && (dayOfWeek === 0 || dayOfWeek === 6)) isApplicable = false;
        if (habit.frequency === "weekends" && (dayOfWeek >= 1 && dayOfWeek <= 5)) isApplicable = false;

        if (isApplicable) {
          if (completedDates.has(curStr)) {
            currentStreak++;
          } else {
            break;
          }
        }

        cur.setDate(cur.getDate() - 1);
        if ((ref.getTime() - cur.getTime()) / (1000 * 60 * 60 * 24) > 365) break;
      }
    }

    // 2. All-Time Best Streak Calculation
    const sortedDates = Array.from(completedDates).sort();
    let bestStreak = 0;
    let runningStreak = 0;
    let prevDate: Date | null = null;

    for (const dStr of sortedDates) {
      const cur = new Date(dStr);
      if (!prevDate) {
        runningStreak = 1;
      } else {
        const diffDays = Math.round((cur.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          runningStreak++;
        } else if (diffDays > 1) {
          if (habit.frequency === "weekdays") {
            const prevDay = prevDate.getDay();
            const curDay = cur.getDay();
            if (prevDay === 5 && curDay === 1 && diffDays === 3) {
              runningStreak++;
            } else {
              runningStreak = 1;
            }
          } else {
            runningStreak = 1;
          }
        }
      }

      if (runningStreak > bestStreak) bestStreak = runningStreak;
      prevDate = cur;
    }

    bestStreak = Math.max(bestStreak, currentStreak);
    return { currentStreak, bestStreak };
  }

  /**
   * Deterministic calculation of 7-day and 30-day completion rates.
   */
  static calculateStats(
    habit: HabitItem,
    logs: HabitLog[],
    refDateStr: string = "2026-09-07"
  ): HabitStats {
    const { currentStreak, bestStreak } = this.calculateStreaks(habit, logs, refDateStr);
    const ref = new Date(refDateStr);

    const completedDates = new Set(
      logs.filter((l) => l.habitId === habit.id && l.completed).map((l) => l.date)
    );

    // Last 7 days
    let last7DaysCount = 0;
    for (let i = 0; i < 7; i++) {
      const d = new Date(ref);
      d.setDate(ref.getDate() - i);
      if (completedDates.has(d.toISOString().slice(0, 10))) last7DaysCount++;
    }
    const last7DaysRate = Math.round((last7DaysCount / 7) * 100);

    // Last 30 days
    let last30DaysCount = 0;
    for (let i = 0; i < 30; i++) {
      const d = new Date(ref);
      d.setDate(ref.getDate() - i);
      if (completedDates.has(d.toISOString().slice(0, 10))) last30DaysCount++;
    }
    const last30DaysRate = Math.round((last30DaysCount / 30) * 100);

    let status: HabitStats["status"] = "Consistent";
    if (currentStreak >= 10) status = "Strong Streak";
    else if (last7DaysRate < 50) status = "Needs Focus";
    else if (currentStreak < 2 && last30DaysRate < 60) status = "At Risk";

    return {
      habitId: habit.id,
      currentStreak,
      bestStreak,
      last7DaysCount,
      last7DaysRate,
      last30DaysCount,
      last30DaysRate,
      totalCompletions: completedDates.size,
      weeklyTargetMet: last7DaysCount >= habit.targetPerWeek,
      status,
    };
  }

  /**
   * Generate activity heatmap matrix (last 12 weeks / 84 days).
   */
  static generateHeatmap(
    habits: HabitItem[],
    logs: HabitLog[],
    refDateStr: string = "2026-09-07"
  ): HeatmapDay[] {
    const dateCounts: Record<string, number> = {};
    for (const l of logs) {
      if (l.completed) {
        dateCounts[l.date] = (dateCounts[l.date] || 0) + 1;
      }
    }

    const ref = new Date(refDateStr);
    const heatmap: HeatmapDay[] = [];
    const totalDays = 84; // 12 weeks

    for (let i = totalDays - 1; i >= 0; i--) {
      const d = new Date(ref);
      d.setDate(ref.getDate() - i);
      const dStr = d.toISOString().slice(0, 10);
      const count = dateCounts[dStr] || 0;

      let intensity = 0;
      if (count >= 4) intensity = 4;
      else if (count === 3) intensity = 3;
      else if (count === 2) intensity = 2;
      else if (count === 1) intensity = 1;

      heatmap.push({ date: dStr, count, intensity });
    }

    return heatmap;
  }

  /**
   * Generates complete summary report based strictly on stored logs.
   */
  static generateSummaryReport(
    habits: HabitItem[],
    logs: HabitLog[],
    refDateStr: string = "2026-09-07"
  ): HabitSummaryReport {
    const statsList = habits.map((h) => ({
      habit: h,
      stats: this.calculateStats(h, logs, refDateStr),
    }));

    const totalRate = statsList.reduce((sum, s) => sum + s.stats.last30DaysRate, 0);
    const overallConsistencyRate = statsList.length > 0 ? Math.round(totalRate / statsList.length) : 0;

    let bestActive = { title: "None", streak: 0 };
    let bestAllTime = { title: "None", streak: 0 };

    for (const s of statsList) {
      if (s.stats.currentStreak > bestActive.streak) {
        bestActive = { title: s.habit.title, streak: s.stats.currentStreak };
      }
      if (s.stats.bestStreak > bestAllTime.streak) {
        bestAllTime = { title: s.habit.title, streak: s.stats.bestStreak };
      }
    }

    const failingHabits = statsList
      .filter((s) => s.stats.last7DaysRate < 50 || s.stats.last30DaysRate < 50)
      .map((s) => ({
        id: s.habit.id,
        title: s.habit.title,
        rate: s.stats.last7DaysRate,
        currentStreak: s.stats.currentStreak,
      }));

    const lowest = [...statsList].sort((a, b) => a.stats.last7DaysRate - b.stats.last7DaysRate)[0];
    const focusHabit = lowest
      ? {
          id: lowest.habit.id,
          title: lowest.habit.title,
          reason: `Lowest 7-day consistency at ${lowest.stats.last7DaysRate}% (${lowest.stats.last7DaysCount}/${lowest.habit.targetPerWeek} target days met).`,
        }
      : { id: "", title: "None", reason: "All habits performing strongly." };

    const currentMonthPrefix = refDateStr.slice(0, 7);
    const monthlyCompletions = logs.filter((l) => l.date.startsWith(currentMonthPrefix) && l.completed).length;

    return {
      totalHabits: habits.length,
      overallConsistencyRate,
      bestActiveStreak: bestActive,
      bestAllTimeStreak: bestAllTime,
      failingHabits,
      focusHabit,
      monthlyCompletions,
    };
  }

  /**
   * Deterministic Natural Language Q&A Evaluator
   * Answering user questions strictly from stored logs.
   */
  static answerQuestion(
    query: string,
    habits: HabitItem[],
    logs: HabitLog[],
    refDateStr: string = "2026-09-07"
  ): { answer: string; matchedIntent: string } {
    const q = query.toLowerCase();
    const report = this.generateSummaryReport(habits, logs, refDateStr);
    const statsList = habits.map((h) => ({
      habit: h,
      stats: this.calculateStats(h, logs, refDateStr),
    }));

    // 1. "What habits am I failing to maintain?"
    if (q.includes("failing") || q.includes("struggling") || q.includes("behind") || q.includes("drop")) {
      if (report.failingHabits.length === 0) {
        return {
          answer: "🎉 **Great consistency!** You are currently meeting all your habit targets without any failing routines.",
          matchedIntent: "failing_habits",
        };
      }
      const list = report.failingHabits
        .map((f) => `- **${f.title}**: ${f.rate}% 7-day completion (Current streak: ${f.currentStreak} days)`)
        .join("\n");
      return {
        answer: `You are currently struggling to maintain ${report.failingHabits.length} habit(s):\n\n${list}\n\nSetting a reminder or reducing daily friction will help rebuild momentum.`,
        matchedIntent: "failing_habits",
      };
    }

    // 2. "What is my best streak?"
    if (q.includes("best streak") || q.includes("highest streak") || q.includes("longest streak")) {
      return {
        answer: `🔥 Your **all-time best streak** is **${report.bestAllTimeStreak.streak} consecutive days** on **${report.bestAllTimeStreak.title}**.\n\nYour highest **current active streak** is **${report.bestActiveStreak.streak} days** on **${report.bestActiveStreak.title}**.`,
        matchedIntent: "best_streak",
      };
    }

    // 3. "Which habit should I focus on?"
    if (q.includes("focus") || q.includes("prioritize") || q.includes("recommend")) {
      return {
        answer: `🎯 **Recommended Focus**: **${report.focusHabit.title}**\n\n**Reason**: ${report.focusHabit.reason}\n\nDedicate your next daily session to checking off this routine first to get back on track.`,
        matchedIntent: "focus_habit",
      };
    }

    // 4. "Summarize my habits this month."
    if (q.includes("summarize") || q.includes("month") || q.includes("overview")) {
      const summaryList = statsList
        .map((s) => `- **${s.habit.title}**: ${s.stats.last30DaysRate}% (30-day rate) • Streak: ${s.stats.currentStreak} days (Best: ${s.stats.bestStreak})`)
        .join("\n");
      return {
        answer: `📊 **Monthly Habit Summary (September 2026)**:\n\n- **Overall Consistency**: **${report.overallConsistencyRate}%**\n- **Total Check-ins Logged**: **${report.monthlyCompletions}**\n- **Best Active Streak**: **${report.bestActiveStreak.title}** (${report.bestActiveStreak.streak} days)\n\n**Individual Performance**:\n${summaryList}`,
        matchedIntent: "monthly_summary",
      };
    }

    return {
      answer: `You have ${habits.length} habits tracked with an average consistency of ${report.overallConsistencyRate}%. Best streak is ${report.bestAllTimeStreak.streak} days on ${report.bestAllTimeStreak.title}.`,
      matchedIntent: "general_overview",
    };
  }
}
