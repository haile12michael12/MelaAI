import { Session } from "@/lib/auth";
import {
  listExpenses,
  getPortfolio,
  listSubscriptions,
  listWatchlist,
  getNote,
} from "@/lib/firebase";

export interface SearchResultItem {
  id: string;
  title: string;
  subtitle?: string;
  domain: "navigation" | "finance" | "investments" | "subscriptions" | "media" | "notes" | "goals" | "tasks";
  href: string;
}

const NAV_ITEMS: { title: string; subtitle: string; href: string; keywords: string[] }[] = [
  { title: "Dashboard", subtitle: "MELA Operating System Overview", href: "/dashboard", keywords: ["home", "overview", "metrics"] },
  { title: "Finance & Ledger", subtitle: "Expenses, budgets, Ethiopian accounts", href: "/finance", keywords: ["expense", "money", "budget", "equb", "edir", "teff", "cbe", "telebirr"] },
  { title: "Investments Portfolio", subtitle: "Equities, crypto, fixed deposits, gold", href: "/investments", keywords: ["stocks", "crypto", "fd", "compounding", "pnl"] },
  { title: "Net Worth Calculator", subtitle: "Assets vs liabilities & liquid cash", href: "/net-worth", keywords: ["wealth", "balance", "assets"] },
  { title: "Subscriptions", subtitle: "Recurring bills & monthly burn", href: "/subscriptions", keywords: ["recurring", "renewals", "netflix", "telecom"] },
  { title: "Goals", subtitle: "Target savings & milestones", href: "/goals", keywords: ["targets", "savings", "equb payout"] },
  { title: "Tasks", subtitle: "Prioritized daily task planner", href: "/tasks", keywords: ["todo", "agenda", "priorities"] },
  { title: "Calendar", subtitle: "Unified schedule & Ethiopian holidays", href: "/calendar", keywords: ["events", "holidays", "enkutatash", "timkat", "meskel"] },
  { title: "Habits", subtitle: "Daily routines & streak tracker", href: "/habits", keywords: ["streaks", "consistency", "routines"] },
  { title: "Books", subtitle: "Reading list & OpenLibrary sync", href: "/books", keywords: ["reading", "library", "covers"] },
  { title: "Media", subtitle: "Cine watchlist, AniList & Trakt sync", href: "/media", keywords: ["movies", "shows", "anime", "watchlist"] },
  { title: "Notes", subtitle: "Persistent scratchpad notes", href: "/notes", keywords: ["scratchpad", "markdown", "jot"] },
  { title: "Documents", subtitle: "Kebele ID, tax, receipts & contracts", href: "/documents", keywords: ["vault", "files", "tax", "id"] },
  { title: "Analytics", subtitle: "Multi-domain health & velocity charts", href: "/analytics", keywords: ["stats", "charts", "trends"] },
  { title: "Automations", subtitle: "Event rules, alerts & triggers", href: "/automations", keywords: ["workflows", "alerts", "rules"] },
  { title: "MELA AI Assistant", subtitle: "Chat with your AI Companion", href: "/mela/assistant", keywords: ["ai", "chat", "assistant", "mela"] },
  { title: "AI Insights", subtitle: "Proactive financial & lifestyle reviews", href: "/mela/insights", keywords: ["recommendations", "anomalies", "insights"] },
  { title: "Continuum Classic View", subtitle: "Single-page dashboard mode", href: "/", keywords: ["classic", "original"] },
  { title: "Settings", subtitle: "Profile, currency, and preferences", href: "/settings", keywords: ["preferences", "etb", "currency", "language"] },
];

export async function melaSearch(query: string, session?: Session | null): Promise<{ query: string; results: SearchResultItem[] }> {
  const cleanQ = query.trim().toLowerCase();
  if (!cleanQ) return { query, results: [] };

  const results: SearchResultItem[] = [];

  // 1. Navigation / domain pages match
  for (const nav of NAV_ITEMS) {
    if (
      nav.title.toLowerCase().includes(cleanQ) ||
      nav.subtitle.toLowerCase().includes(cleanQ) ||
      nav.keywords.some((k) => k.includes(cleanQ))
    ) {
      results.push({
        id: `nav-${nav.href}`,
        title: nav.title,
        subtitle: nav.subtitle,
        domain: "navigation",
        href: nav.href,
      });
    }
  }

  // 2. Query user data if session is active
  if (session && session.uid) {
    try {
      const [expenses, portfolio, subscriptions, watchlist, note] = await Promise.all([
        listExpenses(session).catch(() => []),
        getPortfolio(session).catch(() => null),
        listSubscriptions(session).catch(() => []),
        listWatchlist(session).catch(() => []),
        getNote(session).catch(() => null),
      ]);

      // Match expenses
      for (const exp of expenses.slice(0, 50)) {
        if (
          exp.title.toLowerCase().includes(cleanQ) ||
          (exp.category && exp.category.toLowerCase().includes(cleanQ)) ||
          (exp.notes && exp.notes.toLowerCase().includes(cleanQ))
        ) {
          results.push({
            id: `exp-${exp.id}`,
            title: exp.title,
            subtitle: `${exp.category || "Expense"} • ${exp.amount} Br • ${exp.date || "No date"}`,
            domain: "finance",
            href: "/finance/expenses",
          });
        }
      }

      // Match investments
      if (portfolio && portfolio.assets) {
        for (const asset of portfolio.assets) {
          if (asset.name.toLowerCase().includes(cleanQ) || asset.category.toLowerCase().includes(cleanQ)) {
            results.push({
              id: `inv-${asset.id || asset.name}`,
              title: asset.name,
              subtitle: `Investment (${asset.category}) • ${asset.amount} Br`,
              domain: "investments",
              href: "/investments",
            });
          }
        }
      }

      // Match subscriptions
      for (const sub of subscriptions) {
        if (sub.name.toLowerCase().includes(cleanQ)) {
          results.push({
            id: `sub-${sub.id || sub.name}`,
            title: sub.name,
            subtitle: `Subscription • ${sub.cost} Br / ${sub.billingCycle}`,
            domain: "subscriptions",
            href: "/subscriptions",
          });
        }
      }

      // Match watchlist
      for (const item of watchlist.slice(0, 50)) {
        if (item.title.toLowerCase().includes(cleanQ)) {
          results.push({
            id: `watch-${item.id || item.title}`,
            title: item.title,
            subtitle: `${item.type.toUpperCase()} • ${item.status.replace(/_/g, " ")}`,
            domain: "media",
            href: "/media",
          });
        }
      }

      // Match notes
      if (note && note.content && note.content.toLowerCase().includes(cleanQ)) {
        const previewIdx = note.content.toLowerCase().indexOf(cleanQ);
        const snippet = note.content.slice(Math.max(0, previewIdx - 20), previewIdx + 50);
        results.push({
          id: "note-scratchpad",
          title: "Scratchpad Note",
          subtitle: `...${snippet}...`,
          domain: "notes",
          href: "/notes",
        });
      }
    } catch (err) {
      console.error("[melaSearch] Error searching user data:", err);
    }
  }

  return {
    query,
    results: results.slice(0, 15),
  };
}
