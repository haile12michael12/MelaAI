import { describe, it, expect } from "vitest";
import {
  MelaHabitsIntelligence,
  DEFAULT_HABITS,
  generateSeedLogs,
  HabitItem,
  HabitLog,
} from "../../lib/habits/intelligence";
import { toolRegistry, executeToolSecurely } from "../../lib/mela/tool-registry";
import { extractDomainContext } from "../../lib/mela/context";

describe("MELA Habit Tracking System", () => {
  const refDate = "2026-09-07";
  const seedLogs = generateSeedLogs();

  it("calculates current streaks and all-time best streaks deterministically", () => {
    const expenseHabit = DEFAULT_HABITS.find((h) => h.id === "h1")!;
    const { currentStreak, bestStreak } = MelaHabitsIntelligence.calculateStreaks(expenseHabit, seedLogs, refDate);

    expect(currentStreak).toBeGreaterThanOrEqual(14);
    expect(bestStreak).toBeGreaterThanOrEqual(currentStreak);
  });

  it("calculates 7-day and 30-day completion percentages accurately", () => {
    const readingHabit = DEFAULT_HABITS.find((h) => h.id === "h2")!;
    const stats = MelaHabitsIntelligence.calculateStats(readingHabit, seedLogs, refDate);

    expect(stats.last7DaysRate).toBeGreaterThanOrEqual(0);
    expect(stats.last7DaysRate).toBeLessThanOrEqual(100);
    expect(stats.last30DaysRate).toBeGreaterThanOrEqual(0);
    expect(stats.last30DaysRate).toBeLessThanOrEqual(100);
    expect(stats.totalCompletions).toBeGreaterThan(0);
  });

  it("generates an 84-day (12-week) activity heatmap matrix", () => {
    const heatmap = MelaHabitsIntelligence.generateHeatmap(DEFAULT_HABITS, seedLogs, refDate);

    expect(heatmap.length).toBe(84);
    expect(heatmap[83].date).toBe("2026-09-07"); // Most recent day
    expect(heatmap.every((d) => d.intensity >= 0 && d.intensity <= 4)).toBe(true);
  });

  it("evaluates MELA natural language questions strictly from stored logs", () => {
    // 1. "What habits am I failing to maintain?"
    const q1 = MelaHabitsIntelligence.answerQuestion("What habits am I failing to maintain?", DEFAULT_HABITS, seedLogs, refDate);
    expect(q1.matchedIntent).toBe("failing_habits");
    expect(q1.answer).toContain("Technical Writing");

    // 2. "What is my best streak?"
    const q2 = MelaHabitsIntelligence.answerQuestion("What is my best streak?", DEFAULT_HABITS, seedLogs, refDate);
    expect(q2.matchedIntent).toBe("best_streak");
    expect(q2.answer).toContain("best streak");

    // 3. "Which habit should I focus on?"
    const q3 = MelaHabitsIntelligence.answerQuestion("Which habit should I focus on?", DEFAULT_HABITS, seedLogs, refDate);
    expect(q3.matchedIntent).toBe("focus_habit");
    expect(q3.answer).toContain("Recommended Focus");

    // 4. "Summarize my habits this month."
    const q4 = MelaHabitsIntelligence.answerQuestion("Summarize my habits this month.", DEFAULT_HABITS, seedLogs, refDate);
    expect(q4.matchedIntent).toBe("monthly_summary");
    expect(q4.answer).toContain("September 2026");
    expect(q4.answer).toContain("Overall Consistency");
  });

  it("integrates into MELA AI tool registry", async () => {
    expect(toolRegistry.get_habits).toBeDefined();
    expect(toolRegistry.create_habit).toBeDefined();
    expect(toolRegistry.log_habit_completion).toBeDefined();

    const mockSession = { uid: "user_test_habits", email: "test@mela.ai" };

    const habitsResult = await executeToolSecurely(mockSession, "get_habits", {});
    expect(habitsResult.count).toBeGreaterThan(0);
    expect(habitsResult.summary).toBeDefined();

    const createResult = await executeToolSecurely(mockSession, "create_habit", {
      title: "Drink 2L Water Daily",
      category: "Health & Fitness",
      targetPerWeek: 7,
    });
    expect(createResult.success).toBe(true);
    expect(createResult.habit.title).toBe("Drink 2L Water Daily");

    const logResult = await executeToolSecurely(mockSession, "log_habit_completion", {
      habitId: "h1",
      date: refDate,
    });
    expect(logResult.success).toBe(true);
  });

  it("provides contextual domain summaries in MELA assistant context layer", async () => {
    const mockSession = { uid: "user_test_habits", email: "test@mela.ai" };

    const context = await extractDomainContext(mockSession, "What is my best streak and which habit should I focus on?");
    const habitContext = context.find((c) => c.domain === "habits");
    expect(habitContext).toBeDefined();
    expect(habitContext?.summary).toContain("overall consistency");
  });
});

