import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { listExpenses, getPortfolio, listSubscriptions } from "@/lib/firebase";
import { MelaFinanceIntelligence, CurrencyCode } from "@/lib/finance/intelligence";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await requireUser(req);
    const { searchParams } = new URL(req.url);
    const currency = (searchParams.get("currency") || "ETB") as CurrencyCode;

    const expenses = await listExpenses(session);
    const portfolio = await getPortfolio(session);
    const subs = await listSubscriptions(session);

    const spending = MelaFinanceIntelligence.analyzeSpending(expenses);
    const income = MelaFinanceIntelligence.analyzeIncome(expenses);
    const savings = MelaFinanceIntelligence.analyzeSavings(income.totalInflow, spending.totalOutflow);
    const categories = MelaFinanceIntelligence.analyzeCategories(expenses);
    const merchants = MelaFinanceIntelligence.analyzeMerchants(expenses);
    const recurring = MelaFinanceIntelligence.detectRecurringExpenses(expenses);
    const anomalies = MelaFinanceIntelligence.detectAnomalies(expenses);
    const health = MelaFinanceIntelligence.calculateHealthScore(
      income.totalInflow,
      spending.totalOutflow,
      anomalies.length,
      categories.length
    );

    return NextResponse.json({
      currency,
      spending,
      income,
      savings,
      categories,
      merchants,
      recurring,
      anomalies,
      health,
      subscriptionsCount: subs.length,
      portfolioAssetsCount: (portfolio?.assets || []).length,
    });
  } catch (error: any) {
    console.error("[Mela Finance API] GET Error:", error);
    return NextResponse.json({ error: error.message || "Failed to analyze finance data." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireUser(req);
    const body = await req.json();
    const { query, currency = "ETB", salary = 0 } = body;

    if (!query) {
      return NextResponse.json({ error: "Missing query text" }, { status: 400 });
    }

    const expenses = await listExpenses(session);
    const result = MelaFinanceIntelligence.answerQuestion(query, expenses, salary, currency);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("[Mela Finance API] POST Error:", error);
    return NextResponse.json({ error: error.message || "Failed to evaluate financial query." }, { status: 500 });
  }
}
