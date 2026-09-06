export async function generateMelaInsights() {
  return [];
export interface MelaInsight {
  id: string;
  title: string;
  description: string;
  category: "finance" | "productivity" | "lifestyle" | "calendar";
  priority: "high" | "medium" | "low";
  actionLabel?: string;
  actionHref?: string;
  timestamp: string;
  impact?: string;
  geezContext?: string;
}

export async function generateMelaInsights(context?: {
  monthlyIncome?: number;
  monthlyOutflow?: number;
  liquidReserves?: number;
  expensesCount?: number;
}): Promise<MelaInsight[]> {
  const insights: MelaInsight[] = [
    {
      id: "insight-1",
      title: "Optimize Telebirr Yield & Equb Remittances",
      description:
        "You currently allocate 15,000 ETB monthly into Equb. Shifting short-term float into Sandook or high-yield CBE Birr interest accounts before the 5th can generate passive yield while maintaining zero default risk.",
      category: "finance",
      priority: "high",
      actionLabel: "Review Accounts",
      actionHref: "/finance/accounts",
      timestamp: new Date().toISOString(),
      impact: "+450 ETB / month",
      geezContext: "የእቁብ እና የቴሌብር ቁጠባ እቅድ",
    },
    {
      id: "insight-2",
      title: "Upcoming Meskel & Enkutatash Holiday Budget Reserve",
      description:
        "The Ge'ez New Year (Enkutatash - መስከረም 1) and Finding of the True Cross (Meskel - መስከረም 17) will cause retail food and holiday poultry/sheep prices to surge by ~30%. Pre-authorizing your holiday buffer now will keep monthly cashflow stable.",
      category: "calendar",
      priority: "medium",
      actionLabel: "View Calendar Agenda",
      actionHref: "/calendar",
      timestamp: new Date().toISOString(),
      impact: "Preserves ~6,000 ETB budget buffer",
      geezContext: "የመስከረም በዓላት ዝግጅት",
    },
    {
      id: "insight-3",
      title: "Merkato Bulk Grain (Teff) Purchasing Efficiency",
      description:
        "Your transactions indicate multiple smaller 25kg purchases of Magna Teff across August. Transitioning to a single direct 100kg quintal purchase from wholesaler warehouses saves approximately 1,800 ETB per cycle.",
      category: "finance",
      priority: "medium",
      actionLabel: "View Expenses Breakdown",
      actionHref: "/finance/expenses",
      timestamp: new Date().toISOString(),
      impact: "+1,800 ETB per quarter",
      geezContext: "የጤፍ ግዢ ቁጠባ",
    },
    {
      id: "insight-4",
      title: "Morning Routine Streak at All-Time High",
      description:
        "You have maintained your morning routine and evening reading habit for 14 consecutive days. Continuing this pace will cement neural automaticity and put you 2 weeks ahead of your annual 12-book goal.",
      category: "lifestyle",
      priority: "low",
      actionLabel: "Track Habits",
      actionHref: "/habits",
      timestamp: new Date().toISOString(),
      impact: "14-day streak active",
      geezContext: "የንባብ እና የልምድ ወጥነት",
    },
    {
      id: "insight-5",
      title: "Clear 3 High-Priority Task Bottlenecks",
      description:
        "Three critical tasks have remained in the backlog for over 5 days: FAYDA biometrics verification, rental lease registration, and quarterly tax TIN declaration. Completing these today will unblock automated compliance.",
      category: "productivity",
      priority: "high",
      actionLabel: "Open Tasks",
      actionHref: "/tasks",
      timestamp: new Date().toISOString(),
      impact: "Unblocks 3 legal milestones",
      geezContext: "አስቸኳይ የተግባር ዝርዝር",
    },
  ];

  return insights;
}
