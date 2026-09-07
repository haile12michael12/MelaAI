import { CurrencyCode, formatCurrency } from "../finance/intelligence";

export type GoalCategory =
  | "Equb & Savings"
  | "Tech & Equipment"
  | "Emergency Fund"
  | "Education"
  | "Travel"
  | "Vehicle"
  | "Real Estate"
  | "Health"
  | "Personal";

export type GoalPriority = "high" | "medium" | "low";
export type GoalStatus = "in_progress" | "completed" | "paused" | "overdue";

export interface GoalContribution {
  id: string;
  amount: number;
  date: string; // YYYY-MM-DD
  note?: string;
  sourceAccount?: string;
}

export interface GoalMilestone {
  id: string;
  title: string;
  targetAmount: number;
  isCompleted: boolean;
  completedAt?: string;
}

export interface GoalItem {
  id: string;
  title: string;
  category: GoalCategory;
  targetAmount: number;
  currentAmount: number;
  deadline?: string; // YYYY-MM-DD
  priority: GoalPriority;
  currency?: CurrencyCode;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  status: GoalStatus;
  contributions: GoalContribution[];
  milestones: GoalMilestone[];
}

export interface GoalIntelligence {
  goalId: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  remainingAmount: number;
  progressPercent: number;
  daysRemaining: number;
  monthsRemaining: number;
  weeksRemaining: number;
  requiredMonthlyContribution: number;
  requiredWeeklyContribution: number;
  requiredDailyContribution: number;
  projectedCompletionDate: string;
  probabilityScore: number; // 0 - 100
  paceStatus: "Completed" | "On Track" | "Moderate Pace" | "Behind Schedule" | "Overdue";
  aiExplanation: string;
  aiRecommendations: string[];
}

export const GOAL_CATEGORIES: GoalCategory[] = [
  "Equb & Savings",
  "Tech & Equipment",
  "Emergency Fund",
  "Education",
  "Travel",
  "Vehicle",
  "Real Estate",
  "Health",
  "Personal",
];

export const DEFAULT_GOALS: GoalItem[] = [
  {
    id: "g1",
    title: "M1 Pro Laptop / Workstation Setup",
    category: "Tech & Equipment",
    targetAmount: 80000,
    currentAmount: 45000,
    deadline: "2026-12-31",
    priority: "high",
    currency: "ETB",
    notes: "High-spec workstation for engineering and MELA development",
    createdAt: "2026-06-01",
    updatedAt: "2026-09-01",
    status: "in_progress",
    contributions: [
      { id: "c1", amount: 20000, date: "2026-06-15", note: "Initial seed deposit" },
      { id: "c2", amount: 15000, date: "2026-07-20", note: "Freelance project bonus" },
      { id: "c3", amount: 10000, date: "2026-08-25", note: "August salary savings allocation" },
    ],
    milestones: [
      { id: "m1", title: "25% - Initial Downpayment", targetAmount: 20000, isCompleted: true, completedAt: "2026-06-15" },
      { id: "m2", title: "50% - Halfway Mark", targetAmount: 40000, isCompleted: true, completedAt: "2026-07-20" },
      { id: "m3", title: "75% - Core Spec Budget", targetAmount: 60000, isCompleted: false },
      { id: "m4", title: "100% - Purchase & Setup", targetAmount: 80000, isCompleted: false },
    ],
  },
  {
    id: "g2",
    title: "Equb Annual Payout Target (የእቁብ ድርሻ)",
    category: "Equb & Savings",
    targetAmount: 120000,
    currentAmount: 70000,
    deadline: "2027-01-31",
    priority: "high",
    currency: "ETB",
    notes: "Monthly Equb contribution cycle towards collective pool",
    createdAt: "2026-02-01",
    updatedAt: "2026-09-01",
    status: "in_progress",
    contributions: [
      { id: "c4", amount: 30000, date: "2026-04-01", note: "Cycle Q1 contribution" },
      { id: "c5", amount: 40000, date: "2026-07-01", note: "Cycle Q2 contribution" },
    ],
    milestones: [
      { id: "m5", title: "50,000 ETB Mid-cycle", targetAmount: 50000, isCompleted: true, completedAt: "2026-07-01" },
      { id: "m6", title: "100,000 ETB Near-term", targetAmount: 100000, isCompleted: false },
      { id: "m7", title: "120,000 ETB Payout Round", targetAmount: 120000, isCompleted: false },
    ],
  },
  {
    id: "g3",
    title: "6-Month Emergency Reserve Fund",
    category: "Emergency Fund",
    targetAmount: 150000,
    currentAmount: 95000,
    deadline: "2027-04-30",
    priority: "medium",
    currency: "ETB",
    notes: "Liquid bank reserve in CBE/Awash for 6 months living runway",
    createdAt: "2026-01-10",
    updatedAt: "2026-08-30",
    status: "in_progress",
    contributions: [
      { id: "c6", amount: 50000, date: "2026-03-01", note: "Reserve seed" },
      { id: "c7", amount: 45000, date: "2026-07-15", note: "Bonus allocation" },
    ],
    milestones: [
      { id: "m8", title: "3-Month Runway (75,000 ETB)", targetAmount: 75000, isCompleted: true, completedAt: "2026-07-15" },
      { id: "m9", title: "6-Month Full Runway (150,000 ETB)", targetAmount: 150000, isCompleted: false },
    ],
  },
];

export class MelaGoalsIntelligence {
  /**
   * Deterministic calculation of goal metrics, savings velocity, required rates, and AI recommendations.
   */
  static analyzeGoal(
    goal: GoalItem,
    currentDate: Date = new Date("2026-09-07"),
    monthlySavingsCapacity: number = 8500
  ): GoalIntelligence {
    const currency = goal.currency || "ETB";
    const target = goal.targetAmount || 1;
    const current = goal.currentAmount || 0;
    const remainingAmount = Math.max(0, target - current);
    const progressPercent = Math.min(100, Math.max(0, (current / target) * 100));

    if (progressPercent >= 100) {
      return {
        goalId: goal.id,
        title: goal.title,
        targetAmount: target,
        currentAmount: current,
        remainingAmount: 0,
        progressPercent: 100,
        daysRemaining: 0,
        monthsRemaining: 0,
        weeksRemaining: 0,
        requiredMonthlyContribution: 0,
        requiredWeeklyContribution: 0,
        requiredDailyContribution: 0,
        projectedCompletionDate: "Completed",
        probabilityScore: 100,
        paceStatus: "Completed",
        aiExplanation: `🎉 Goal **${goal.title}** has been fully achieved with ${formatCurrency(current, currency)} saved!`,
        aiRecommendations: ["Consider marking this goal as completed or allocating new surpluses to your next priority goal."],
      };
    }

    // Date calculations
    let daysRemaining = 90; // default 3 months if no deadline
    let deadlineDate: Date | null = null;
    if (goal.deadline) {
      deadlineDate = new Date(goal.deadline);
      const diffMs = deadlineDate.getTime() - currentDate.getTime();
      daysRemaining = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
    }

    const monthsRemaining = Math.max(0.2, daysRemaining / 30.4375);
    const weeksRemaining = Math.max(1, Math.ceil(daysRemaining / 7));

    // Required rates (deterministic)
    const requiredMonthlyContribution = Math.round(remainingAmount / monthsRemaining);
    const requiredWeeklyContribution = Math.round(remainingAmount / weeksRemaining);
    const requiredDailyContribution = Math.round(remainingAmount / daysRemaining);

    // Historical contribution velocity (last 90 days)
    const recentContributions = (goal.contributions || []).filter((c) => {
      const cDate = new Date(c.date);
      const diff = (currentDate.getTime() - cDate.getTime()) / (1000 * 60 * 60 * 24);
      return diff <= 90;
    });

    const totalRecent = recentContributions.reduce((sum, c) => sum + (c.amount || 0), 0);
    const historicalMonthlyVelocity = recentContributions.length > 0 ? (totalRecent / 3) : (current / (monthsRemaining || 1));
    const effectiveMonthlyPace = Math.max(historicalMonthlyVelocity, monthlySavingsCapacity * 0.4);

    // Projected completion date
    const monthsToFinish = effectiveMonthlyPace > 0 ? remainingAmount / effectiveMonthlyPace : 12;
    const projDate = new Date(currentDate);
    projDate.setMonth(projDate.getMonth() + Math.ceil(monthsToFinish));
    const projectedCompletionDate = projDate.toISOString().slice(0, 10);

    // Feasibility & Probability Scoring (0 - 100)
    let probabilityScore = 50;
    let paceStatus: GoalIntelligence["paceStatus"] = "Moderate Pace";

    if (daysRemaining <= 0) {
      paceStatus = "Overdue";
      probabilityScore = 10;
    } else {
      const paceRatio = effectiveMonthlyPace / (requiredMonthlyContribution || 1);
      if (paceRatio >= 1.1) {
        probabilityScore = Math.min(98, Math.round(85 + (paceRatio - 1) * 10));
        paceStatus = "On Track";
      } else if (paceRatio >= 0.75) {
        probabilityScore = Math.round(65 + (paceRatio - 0.75) * 60);
        paceStatus = "Moderate Pace";
      } else {
        probabilityScore = Math.max(20, Math.round(paceRatio * 60));
        paceStatus = "Behind Schedule";
      }
    }

    // AI Explanations & Recommendations
    const deadlineStr = goal.deadline
      ? new Date(goal.deadline).toLocaleDateString("en-US", { month: "long", year: "numeric" })
      : "your target date";

    const aiExplanation = `You need approximately **${formatCurrency(requiredMonthlyContribution, currency)}/month** (${formatCurrency(requiredWeeklyContribution, currency)}/week) to reach your **${goal.title}** goal by ${deadlineStr}.`;

    const aiRecommendations: string[] = [];
    if (paceStatus === "On Track") {
      aiRecommendations.push(`At your current pace of ~${formatCurrency(Math.round(effectiveMonthlyPace), currency)}/mo, you are on track to finish by ${projectedCompletionDate}.`);
      aiRecommendations.push("Maintain automated monthly transfers to lock in on-time delivery.");
    } else if (paceStatus === "Behind Schedule") {
      const deficit = requiredMonthlyContribution - effectiveMonthlyPace;
      aiRecommendations.push(`Increasing monthly contributions by ${formatCurrency(Math.round(deficit), currency)} will restore this goal to on-track status.`);
      aiRecommendations.push("Consider extending your deadline or redirecting discretionary spending from non-essential categories.");
    } else {
      aiRecommendations.push(`You are moderately on pace with a ${probabilityScore}% probability score.`);
      aiRecommendations.push(`Contributing an extra ${formatCurrency(Math.round(requiredWeeklyContribution * 0.2), currency)} per week will ensure safe completion.`);
    }

    return {
      goalId: goal.id,
      title: goal.title,
      targetAmount: target,
      currentAmount: current,
      remainingAmount,
      progressPercent: Math.round(progressPercent * 10) / 10,
      daysRemaining,
      monthsRemaining: Math.round(monthsRemaining * 10) / 10,
      weeksRemaining,
      requiredMonthlyContribution,
      requiredWeeklyContribution,
      requiredDailyContribution,
      projectedCompletionDate,
      probabilityScore,
      paceStatus,
      aiExplanation,
      aiRecommendations,
    };
  }

  /**
   * Helper to generate default standard milestones for a goal.
   */
  static generateDefaultMilestones(targetAmount: number): GoalMilestone[] {
    return [
      { id: "m_" + Date.now() + "_25", title: "25% - Momentum Milestone", targetAmount: Math.round(targetAmount * 0.25), isCompleted: false },
      { id: "m_" + Date.now() + "_50", title: "50% - Halfway Point", targetAmount: Math.round(targetAmount * 0.5), isCompleted: false },
      { id: "m_" + Date.now() + "_75", title: "75% - Final Stretch", targetAmount: Math.round(targetAmount * 0.75), isCompleted: false },
      { id: "m_" + Date.now() + "_100", title: "100% - Goal Achieved", targetAmount: targetAmount, isCompleted: false },
    ];
  }

  /**
   * Update milestone completion status based on current amount.
   */
  static syncMilestones(milestones: GoalMilestone[], currentAmount: number): GoalMilestone[] {
    return milestones.map((m) => {
      const isCompleted = currentAmount >= m.targetAmount;
      return {
        ...m,
        isCompleted,
        completedAt: isCompleted && !m.completedAt ? new Date().toISOString().slice(0, 10) : m.completedAt,
      };
    });
  }
}
