import { NextRequest, NextResponse } from "next/server";
import {
  MelaGoalsIntelligence,
  DEFAULT_GOALS,
  GoalItem,
  GoalContribution,
} from "@/lib/goals/intelligence";

// In-memory store fallback
let goalsStore: GoalItem[] = [...DEFAULT_GOALS];

export async function GET() {
  try {
    const goalsWithAnalysis = goalsStore.map((g) => ({
      ...g,
      intelligence: MelaGoalsIntelligence.analyzeGoal(g),
    }));

    const totalTarget = goalsStore.reduce((sum, g) => sum + (g.targetAmount || 0), 0);
    const totalCurrent = goalsStore.reduce((sum, g) => sum + (g.currentAmount || 0), 0);
    const totalRequiredMonthly = goalsWithAnalysis.reduce((sum, g) => sum + g.intelligence.requiredMonthlyContribution, 0);

    return NextResponse.json({
      goals: goalsWithAnalysis,
      metrics: {
        totalGoals: goalsStore.length,
        totalTarget,
        totalCurrent,
        overallProgress: totalTarget > 0 ? Math.round((totalCurrent / totalTarget) * 100) : 0,
        totalRequiredMonthly,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, goal, contribution, goalId, milestone } = body;

    if (action === "create_goal") {
      const target = Number(goal.targetAmount) || 1000;
      const current = Number(goal.currentAmount) || 0;
      const newGoal: GoalItem = {
        id: "goal_" + Date.now(),
        title: goal.title,
        category: goal.category || "Equb & Savings",
        targetAmount: target,
        currentAmount: current,
        deadline: goal.deadline || undefined,
        priority: goal.priority || "medium",
        currency: goal.currency || "ETB",
        notes: goal.notes || "",
        createdAt: new Date().toISOString().slice(0, 10),
        updatedAt: new Date().toISOString().slice(0, 10),
        status: current >= target ? "completed" : "in_progress",
        contributions: current > 0 ? [{ id: "c_" + Date.now(), amount: current, date: new Date().toISOString().slice(0, 10), note: "Initial balance" }] : [],
        milestones: MelaGoalsIntelligence.generateDefaultMilestones(target),
      };
      newGoal.milestones = MelaGoalsIntelligence.syncMilestones(newGoal.milestones, current);
      goalsStore.unshift(newGoal);
    } else if (action === "add_contribution") {
      const g = goalsStore.find((item) => item.id === goalId);
      if (g) {
        const amt = Number(contribution.amount) || 0;
        const newContrib: GoalContribution = {
          id: "c_" + Date.now(),
          amount: amt,
          date: contribution.date || new Date().toISOString().slice(0, 10),
          note: contribution.note || "Contribution",
        };
        g.contributions.unshift(newContrib);
        g.currentAmount += amt;
        g.updatedAt = new Date().toISOString().slice(0, 10);
        g.milestones = MelaGoalsIntelligence.syncMilestones(g.milestones, g.currentAmount);
        if (g.currentAmount >= g.targetAmount) g.status = "completed";
      }
    } else if (action === "update_goal") {
      goalsStore = goalsStore.map((item) => {
        if (item.id === goalId) {
          const updated = { ...item, ...goal, updatedAt: new Date().toISOString().slice(0, 10) };
          updated.milestones = MelaGoalsIntelligence.syncMilestones(updated.milestones, updated.currentAmount);
          if (updated.currentAmount >= updated.targetAmount) updated.status = "completed";
          return updated;
        }
        return item;
      });
    } else if (action === "delete_goal") {
      goalsStore = goalsStore.filter((item) => item.id !== goalId);
    }

    const goalsWithAnalysis = goalsStore.map((g) => ({
      ...g,
      intelligence: MelaGoalsIntelligence.analyzeGoal(g),
    }));

    return NextResponse.json({
      success: true,
      goals: goalsWithAnalysis,
    });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
