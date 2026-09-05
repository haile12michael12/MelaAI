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

  // Investment / Portfolio detection
  if (
    q.includes("invest") ||
    q.includes("portfolio") ||
    q.includes("stock") ||
    q.includes("crypto") ||
    q.includes("mutual fund") ||
    q.includes("sip") ||
    q.includes("asset") ||
    q.includes("net worth") ||
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
