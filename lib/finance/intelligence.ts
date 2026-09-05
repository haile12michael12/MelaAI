import type { ExpenseRecord } from "@/lib/firebase";

export type CurrencyCode = "ETB" | "USD" | "EUR" | "GBP" | "AED";

export const CURRENCY_SYMBOLS: Record<CurrencyCode, { symbol: string; name: string; prefix: boolean }> = {
  ETB: { symbol: "Br", name: "Ethiopian Birr", prefix: false },
  USD: { symbol: "$", name: "US Dollar", prefix: true },
  EUR: { symbol: "€", name: "Euro", prefix: true },
  GBP: { symbol: "£", name: "British Pound", prefix: true },
  AED: { symbol: "AED", name: "UAE Dirham", prefix: false },
};

export const ETHIOPIAN_CATEGORIES = [
  "Equb (እቁብ)",
  "Edir (እድር)",
  "Food & Teff (ምግብ / ጤፍ)",
  "Transport & Ride (ትራንስፖርት / ራይድ)",
  "House Rent (ቤት ኪራይ)",
  "Family Support / Remittance (የቤተሰብ ድጋፍ)",
  "Utilities & Tele (መብራት / ውሃ / ቴሌ)",
  "Education (ትምህርት)",
  "Healthcare (ጤና)",
  "General",
];

export function formatCurrency(amount: number, currency: CurrencyCode = "ETB"): string {
  const meta = CURRENCY_SYMBOLS[currency] || CURRENCY_SYMBOLS.ETB;
  const formattedNum = Math.abs(amount).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const sign = amount < 0 ? "-" : "";
  return meta.prefix ? `${sign}${meta.symbol}${formattedNum}` : `${sign}${formattedNum} ${meta.symbol}`;
}

export interface SpendingAnalysis {
  totalOutflow: number;
  transactionCount: number;
  dailyAverage: number;
  largestExpense: { title: string; amount: number; date: string } | null;
  medianExpense: number;
}

export interface IncomeAnalysis {
  totalInflow: number;
  recordedIncomeCount: number;
  salaryBase: number;
  netCashflow: number;
}

export interface SavingsAnalysis {
  savingsAmount: number;
  savingsRate: number;
  emergencyRunwayMonths: number;
  rating: "Excellent" | "Good" | "Needs Improvement" | "Critical";
}

export interface CategoryStat {
  category: string;
  total: number;
  percentage: number;
  count: number;
}

export interface MerchantStat {
  merchant: string;
  total: number;
  count: number;
}

export interface RecurringExpense {
  title: string;
  amount: number;
  frequency: "monthly" | "weekly" | "periodic";
  occurrences: number;
}

export interface AnomalyItem {
  id: string;
  title: string;
  amount: number;
  date: string;
  category: string;
  expectedMean: number;
  deviationMultiplier: number;
}

export interface FinancialHealthScore {
  score: number; // 0 - 100
  grade: "A+" | "A" | "B" | "C" | "D";
  savingsScore: number;
  cashflowScore: number;
  stabilityScore: number;
  diversificationScore: number;
  keyInsights: string[];
}

export class MelaFinanceIntelligence {
  /**
   * 1. Spending Analysis
   */
  static analyzeSpending(expenses: ExpenseRecord[], daysInPeriod = 30): SpendingAnalysis {
    const positiveExpenses = expenses.filter((e) => (e.amount || 0) > 0);
    const totalOutflow = positiveExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);

    const sortedAmounts = positiveExpenses.map((e) => e.amount || 0).sort((a, b) => a - b);
    const medianExpense =
      sortedAmounts.length > 0
        ? sortedAmounts[Math.floor(sortedAmounts.length / 2)]
        : 0;

    let largestExpense: { title: string; amount: number; date: string } | null = null;
    if (positiveExpenses.length > 0) {
      const top = [...positiveExpenses].sort((a, b) => (b.amount || 0) - (a.amount || 0))[0];
      largestExpense = {
        title: top.title,
        amount: top.amount || 0,
        date: top.date || "Unknown",
      };
    }

    return {
      totalOutflow,
      transactionCount: positiveExpenses.length,
      dailyAverage: daysInPeriod > 0 ? totalOutflow / daysInPeriod : 0,
      largestExpense,
      medianExpense,
    };
  }

  /**
   * 2. Income Analysis
   */
  static analyzeIncome(expenses: ExpenseRecord[], monthlySalary = 0): IncomeAnalysis {
    const incomeRecords = expenses.filter((e) => (e.amount || 0) < 0);
    const totalLoggedIncome = incomeRecords.reduce((sum, e) => sum + Math.abs(e.amount || 0), 0);
    const totalInflow = monthlySalary > 0 ? monthlySalary : totalLoggedIncome;

    const totalOutflow = expenses.filter((e) => (e.amount || 0) > 0).reduce((sum, e) => sum + (e.amount || 0), 0);

    return {
      totalInflow,
      recordedIncomeCount: incomeRecords.length,
      salaryBase: monthlySalary,
      netCashflow: totalInflow - totalOutflow,
    };
  }

  /**
   * 3. Savings Analysis
   */
  static analyzeSavings(inflow: number, outflow: number, totalLiquidAssets = 0): SavingsAnalysis {
    const savingsAmount = inflow - outflow;
    const savingsRate = inflow > 0 ? Math.max(0, (savingsAmount / inflow) * 100) : 0;
    const monthlyBurn = outflow > 0 ? outflow : 1;
    const emergencyRunwayMonths = totalLiquidAssets > 0 ? totalLiquidAssets / monthlyBurn : 0;

    let rating: SavingsAnalysis["rating"] = "Critical";
    if (savingsRate >= 30) rating = "Excellent";
    else if (savingsRate >= 20) rating = "Good";
    else if (savingsRate >= 10) rating = "Needs Improvement";

    return {
      savingsAmount,
      savingsRate,
      emergencyRunwayMonths,
      rating,
    };
  }

  /**
   * 4. Category Breakdown Analysis
   */
  static analyzeCategories(expenses: ExpenseRecord[]): CategoryStat[] {
    const map: Record<string, { total: number; count: number }> = {};
    let totalSpent = 0;

    for (const exp of expenses) {
      const amt = exp.amount || 0;
      if (amt > 0) {
        const cat = exp.category?.trim() || "General";
        if (!map[cat]) map[cat] = { total: 0, count: 0 };
        map[cat].total += amt;
        map[cat].count += 1;
        totalSpent += amt;
      }
    }

    return Object.entries(map)
      .map(([category, val]) => ({
        category,
        total: val.total,
        count: val.count,
        percentage: totalSpent > 0 ? (val.total / totalSpent) * 100 : 0,
      }))
      .sort((a, b) => b.total - a.total);
  }

  /**
   * 5. Merchant Analysis
   */
  static analyzeMerchants(expenses: ExpenseRecord[]): MerchantStat[] {
    const map: Record<string, { total: number; count: number }> = {};

    for (const exp of expenses) {
      const amt = exp.amount || 0;
      if (amt > 0 && exp.title) {
        // Normalize merchant name
        const raw = exp.title.split(/[-–—,:;()0-9]/)[0].trim();
        const merchant = raw.length >= 2 ? raw : exp.title;
        if (!map[merchant]) map[merchant] = { total: 0, count: 0 };
        map[merchant].total += amt;
        map[merchant].count += 1;
      }
    }

    return Object.entries(map)
      .map(([merchant, val]) => ({
        merchant,
        total: val.total,
        count: val.count,
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);
  }

  /**
   * 6. Monthly Comparison
   */
  static compareMonths(expenses: ExpenseRecord[], monthA: string, monthB: string) {
    const filterByMonth = (m: string) => expenses.filter((e) => e.date && e.date.startsWith(m) && (e.amount || 0) > 0);

    const listA = filterByMonth(monthA);
    const listB = filterByMonth(monthB);

    const totalA = listA.reduce((sum, e) => sum + (e.amount || 0), 0);
    const totalB = listB.reduce((sum, e) => sum + (e.amount || 0), 0);

    const diff = totalA - totalB;
    const percentageChange = totalB > 0 ? (diff / totalB) * 100 : 0;

    return {
      monthA: { month: monthA, total: totalA, count: listA.length },
      monthB: { month: monthB, total: totalB, count: listB.length },
      diff,
      percentageChange,
      isHigher: diff > 0,
    };
  }

  /**
   * 7. Recurring Expense Detection
   */
  static detectRecurringExpenses(expenses: ExpenseRecord[]): RecurringExpense[] {
    const candidates: Record<string, { amounts: number[]; occurrences: number }> = {};

    for (const exp of expenses) {
      const amt = exp.amount || 0;
      if (amt > 0 && exp.title) {
        const key = exp.title.toLowerCase().trim();
        if (!candidates[key]) candidates[key] = { amounts: [], occurrences: 0 };
        candidates[key].amounts.push(amt);
        candidates[key].occurrences += 1;
      }
    }

    const recurring: RecurringExpense[] = [];
    for (const [title, data] of Object.entries(candidates)) {
      if (data.occurrences >= 2) {
        const avg = data.amounts.reduce((a, b) => a + b, 0) / data.amounts.length;
        recurring.push({
          title,
          amount: avg,
          frequency: data.occurrences >= 4 ? "weekly" : "monthly",
          occurrences: data.occurrences,
        });
      }
    }

    return recurring.sort((a, b) => b.occurrences - a.occurrences);
  }

  /**
   * 8. Spending Anomaly Detection
   */
  static detectAnomalies(expenses: ExpenseRecord[]): AnomalyItem[] {
    const positive = expenses.filter((e) => (e.amount || 0) > 0);
    if (positive.length < 4) return [];

    const amounts = positive.map((e) => e.amount || 0);
    const mean = amounts.reduce((a, b) => a + b, 0) / amounts.length;
    const variance = amounts.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / amounts.length;
    const stdDev = Math.sqrt(variance);

    const threshold = mean + 1.8 * stdDev;

    return positive
      .filter((e) => (e.amount || 0) > threshold)
      .map((e) => ({
        id: e.id,
        title: e.title,
        amount: e.amount || 0,
        date: e.date || "Unknown",
        category: e.category || "General",
        expectedMean: mean,
        deviationMultiplier: ((e.amount || 0) / (mean || 1)),
      }))
      .sort((a, b) => b.amount - a.amount);
  }

  /**
   * 9. Financial Health Score (0-100)
   */
  static calculateHealthScore(
    inflow: number,
    outflow: number,
    anomaliesCount: number,
    categoriesCount: number
  ): FinancialHealthScore {
    // 1. Savings score (max 40 pts)
    const savingsRate = inflow > 0 ? ((inflow - outflow) / inflow) * 100 : 0;
    const savingsScore = Math.min(40, Math.max(0, (savingsRate / 30) * 40));

    // 2. Cashflow positivity (max 25 pts)
    const cashflowScore = inflow >= outflow ? 25 : Math.max(0, 25 - ((outflow - inflow) / (inflow || 1)) * 25);

    // 3. Stability score (penalize excessive anomalies) (max 20 pts)
    const stabilityScore = Math.max(0, 20 - anomaliesCount * 5);

    // 4. Diversification score (max 15 pts)
    const diversificationScore = Math.min(15, categoriesCount * 3);

    const totalScore = Math.round(savingsScore + cashflowScore + stabilityScore + diversificationScore);

    let grade: FinancialHealthScore["grade"] = "F" as any;
    if (totalScore >= 90) grade = "A+";
    else if (totalScore >= 75) grade = "A";
    else if (totalScore >= 60) grade = "B";
    else if (totalScore >= 45) grade = "C";
    else grade = "D";

    const keyInsights: string[] = [];
    if (savingsRate >= 20) {
      keyInsights.push("Strong savings rate above the recommended 20% benchmark.");
    } else {
      keyInsights.push("Savings rate is below 20%. Reducing top discretionary categories can boost net cashflow.");
    }

    if (anomaliesCount > 0) {
      keyInsights.push(`Detected ${anomaliesCount} significant transaction spikes requiring attention.`);
    } else {
      keyInsights.push("Spending volatility is low and consistent across cycles.");
    }

    return {
      score: totalScore,
      grade,
      savingsScore: Math.round(savingsScore),
      cashflowScore: Math.round(cashflowScore),
      stabilityScore: Math.round(stabilityScore),
      diversificationScore: Math.round(diversificationScore),
      keyInsights,
    };
  }

  /**
   * 10. Natural Language Financial Q&A Evaluator
   */
  static answerQuestion(
    query: string,
    expenses: ExpenseRecord[],
    monthlySalary = 0,
    currency: CurrencyCode = "ETB"
  ): { answer: string; structuredData?: Record<string, any> } {
    const q = query.toLowerCase();

    // 1. Category question (e.g. "How much did I spend on food / transport / equb?")
    for (const cat of ETHIOPIAN_CATEGORIES) {
      const simpleCat = cat.split(" ")[0].toLowerCase();
      if (q.includes(simpleCat) || (cat.includes("(") && q.includes(cat.split("(")[1].replace(")", "").toLowerCase()))) {
        const matches = expenses.filter(
          (e) => (e.amount || 0) > 0 && e.category && e.category.toLowerCase().includes(simpleCat)
        );
        const total = matches.reduce((sum, e) => sum + (e.amount || 0), 0);
        return {
          answer: `You have spent **${formatCurrency(total, currency)}** across ${matches.length} transactions categorized under **${cat}**.`,
          structuredData: { category: cat, total, count: matches.length, matches: matches.slice(0, 5) },
        };
      }
    }

    // 2. Month comparison question (e.g. "Compare August and July")
    const monthNames = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
    const foundMonths: string[] = [];
    for (let i = 0; i < monthNames.length; i++) {
      if (q.includes(monthNames[i])) {
        const num = String(i + 1).padStart(2, "0");
        foundMonths.push(`2026-${num}`);
      }
    }

    if (foundMonths.length >= 2) {
      const comp = this.compareMonths(expenses, foundMonths[0], foundMonths[1]);
      return {
        answer: `In **${foundMonths[0]}**, your total spending was **${formatCurrency(comp.monthA.total, currency)}** (${comp.monthA.count} items) vs **${formatCurrency(comp.monthB.total, currency)}** (${comp.monthB.count} items) in **${foundMonths[1]}** (${comp.percentageChange >= 0 ? "+" : ""}${comp.percentageChange.toFixed(1)}%).`,
        structuredData: comp,
      };
    }

    // 3. Overspending question ("Where am I overspending?")
    if (q.includes("overspend") || q.includes("biggest") || q.includes("highest")) {
      const categories = this.analyzeCategories(expenses);
      const top3 = categories.slice(0, 3);
      return {
        answer: `Your largest spending outflows are:\n\n` +
          top3.map((c, i) => `${i + 1}. **${c.category}**: ${formatCurrency(c.total, currency)} (${c.percentage.toFixed(1)}% of total)`).join("\n") +
          "\n\nFocusing on these top 3 areas will yield the greatest potential savings.",
        structuredData: { topCategories: top3 },
      };
    }

    // 4. Affordability question ("Can I afford this purchase of X?")
    const numberMatch = q.match(/\d+(\.\d+)?/);
    if ((q.includes("afford") || q.includes("buy") || q.includes("purchase")) && numberMatch) {
      const cost = parseFloat(numberMatch[0]);
      const spending = this.analyzeSpending(expenses);
      const income = this.analyzeIncome(expenses, monthlySalary);
      const net = income.totalInflow - spending.totalOutflow;

      const canAfford = net >= cost;
      return {
        answer: canAfford
          ? `✅ **Yes, you can comfortably afford this.**\n\nAfter this purchase of **${formatCurrency(cost, currency)}**, your estimated remaining monthly surplus will be **${formatCurrency(net - cost, currency)}**.`
          : `⚠️ **Caution is advised.**\n\nYour available monthly liquid surplus is **${formatCurrency(net, currency)}**, which is lower than the planned purchase of **${formatCurrency(cost, currency)}**.`,
        structuredData: { cost, netSurplus: net, canAfford },
      };
    }

    // 5. Monthly Savings Potential ("How much can I save monthly?")
    if (q.includes("save") || q.includes("savings")) {
      const spending = this.analyzeSpending(expenses);
      const income = this.analyzeIncome(expenses, monthlySalary);
      const savings = this.analyzeSavings(income.totalInflow, spending.totalOutflow);

      return {
        answer: `Based on your current monthly inflow of **${formatCurrency(income.totalInflow, currency)}** and outflow of **${formatCurrency(spending.totalOutflow, currency)}**, you currently retain **${formatCurrency(savings.savingsAmount, currency)}/month** (Savings Rate: **${savings.savingsRate.toFixed(1)}%**).`,
        structuredData: savings,
      };
    }

    // Fallback overview
    const spending = this.analyzeSpending(expenses);
    const income = this.analyzeIncome(expenses, monthlySalary);
    return {
      answer: `Your current financial overview: Total Inflow **${formatCurrency(income.totalInflow, currency)}**, Total Spending **${formatCurrency(spending.totalOutflow, currency)}**, Net Balance **${formatCurrency(income.netCashflow, currency)}**.`,
      structuredData: { income, spending },
    };
  }
}
