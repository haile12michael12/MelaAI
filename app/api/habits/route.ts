import { NextRequest, NextResponse } from "next/server";
import {
  MelaHabitsIntelligence,
  DEFAULT_HABITS,
  generateSeedLogs,
  HabitItem,
  HabitLog,
} from "@/lib/habits/intelligence";

let habitsStore: HabitItem[] = [...DEFAULT_HABITS];
let logsStore: HabitLog[] = generateSeedLogs();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const refDate = searchParams.get("date") || "2026-09-07";

    const habitsWithStats = habitsStore.map((h) => ({
      ...h,
      stats: MelaHabitsIntelligence.calculateStats(h, logsStore, refDate),
      completedToday: logsStore.some((l) => l.habitId === h.id && l.date === refDate && l.completed),
    }));

    const heatmap = MelaHabitsIntelligence.generateHeatmap(habitsStore, logsStore, refDate);
    const summary = MelaHabitsIntelligence.generateSummaryReport(habitsStore, logsStore, refDate);

    return NextResponse.json({
      habits: habitsWithStats,
      heatmap,
      summary,
    });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, habit, habitId, date, completed, query } = body;
    const refDate = date || "2026-09-07";

    if (action === "create_habit") {
      const newHabit: HabitItem = {
        id: "h_" + Date.now(),
        title: habit.title,
        description: habit.description || "",
        category: habit.category || "Health & Fitness",
        frequency: habit.frequency || "daily",
        targetPerWeek: Number(habit.targetPerWeek) || 7,
        color: habit.color || "#6366f1",
        createdAt: new Date().toISOString().slice(0, 10),
      };
      habitsStore.push(newHabit);
    } else if (action === "toggle_log") {
      const existingIdx = logsStore.findIndex((l) => l.habitId === habitId && l.date === refDate);
      if (existingIdx >= 0) {
        logsStore[existingIdx].completed = !logsStore[existingIdx].completed;
      } else {
        logsStore.push({
          id: `log_${habitId}_${refDate}_${Date.now()}`,
          habitId,
          date: refDate,
          completed: true,
        });
      }
    } else if (action === "ask_mela") {
      const qResult = MelaHabitsIntelligence.answerQuestion(query || "", habitsStore, logsStore, refDate);
      return NextResponse.json({ answer: qResult.answer, matchedIntent: qResult.matchedIntent });
    } else if (action === "delete_habit") {
      habitsStore = habitsStore.filter((h) => h.id !== habitId);
      logsStore = logsStore.filter((l) => l.habitId !== habitId);
    }

    const habitsWithStats = habitsStore.map((h) => ({
      ...h,
      stats: MelaHabitsIntelligence.calculateStats(h, logsStore, refDate),
      completedToday: logsStore.some((l) => l.habitId === h.id && l.date === refDate && l.completed),
    }));

    const heatmap = MelaHabitsIntelligence.generateHeatmap(habitsStore, logsStore, refDate);
    const summary = MelaHabitsIntelligence.generateSummaryReport(habitsStore, logsStore, refDate);

    return NextResponse.json({ success: true, habits: habitsWithStats, heatmap, summary });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
