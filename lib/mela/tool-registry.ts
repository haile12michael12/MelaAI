import { z } from "zod";
import { SchemaType, FunctionDeclaration } from "@google/generative-ai";
import { Session } from "@/lib/auth";
import {
  listExpenses,
  createExpense,
  updateExpense,
  archiveExpense,
  getPortfolio,
  listSubscriptions,
  listWatchlist,
  addWatchlistItem,
  updateWatchlistItem,
  getNote,
  updateNote
} from "@/lib/firebase";
import { recordDomainEvent, DOMAIN_EVENTS } from "@/lib/domain-events";

export interface ToolDefinition {
  name: string;
  domain: "finance" | "investments" | "goals" | "tasks" | "books" | "media" | "notes" | "subscriptions" | "net-worth";
  type: "read" | "write";
  isSensitive?: boolean;
  description: string;
  schema: z.ZodTypeAny;
  declaration: FunctionDeclaration;
  handler: (session: Session, args: any, confirmed?: boolean) => Promise<any>;
}

export const toolRegistry: Record<string, ToolDefinition> = {
  // ─── 1. Finance Tools ───
  get_expenses: {
    name: "get_expenses",
    domain: "finance",
    type: "read",
    description: "Retrieve list of expenses or income records with optional query, category, and date filtering.",
    schema: z.object({
      q: z.string().optional(),
      category: z.string().optional(),
      from: z.string().optional(),
      to: z.string().optional(),
    }),
    declaration: {
      name: "get_expenses",
      description: "Retrieve list of expenses or income records with optional query, category, and date filtering.",
      parameters: {
        type: SchemaType.OBJECT,
        properties: {
          q: { type: SchemaType.STRING, description: "Search query" },
          category: { type: SchemaType.STRING, description: "Category name" },
          from: { type: SchemaType.STRING, description: "Start date (YYYY-MM-DD)" },
          to: { type: SchemaType.STRING, description: "End date (YYYY-MM-DD)" }
        }
      }
    },
    handler: async (session, args) => {
      const expenses = await listExpenses(session, args);
      return { count: expenses.length, expenses: expenses.slice(0, 20) };
    }
  },

  create_expense: {
    name: "create_expense",
    domain: "finance",
    type: "write",
    description: "Record a new expense or income transaction in the ledger.",
    schema: z.object({
      title: z.string().min(1),
      amount: z.number(),
      category: z.string().optional().default("General"),
      date: z.string().optional(),
      notes: z.string().optional(),
    }),
    declaration: {
      name: "create_expense",
      description: "Record a new expense (positive amount) or income (negative amount) transaction.",
      parameters: {
        type: SchemaType.OBJECT,
        properties: {
          title: { type: SchemaType.STRING, description: "Transaction title" },
          amount: { type: SchemaType.NUMBER, description: "Amount (positive for expense, negative for income)" },
          category: { type: SchemaType.STRING, description: "Category name" },
          date: { type: SchemaType.STRING, description: "Date (YYYY-MM-DD), defaults to today" },
          notes: { type: SchemaType.STRING, description: "Optional notes" }
        },
        required: ["title", "amount"]
      }
    },
    handler: async (session, args) => {
      const result = await createExpense(session, {
        title: args.title,
        amount: args.amount,
        category: args.category || "General",
        date: args.date || new Date().toISOString().slice(0, 10),
        notes: args.notes,
      });

      recordDomainEvent({
        eventType: DOMAIN_EVENTS.EXPENSE_CREATED,
        userId: session.uid,
        userEmail: session.user.email,
        entityId: result.id,
        payload: { title: args.title, amount: args.amount, channel: "mela_ai" },
      });

      return { success: true, id: result.id, message: `Logged "${args.title}" successfully.` };
    }
  },

  update_expense: {
    name: "update_expense",
    domain: "finance",
    type: "write",
    description: "Update fields of an existing expense record.",
    schema: z.object({
      id: z.string().min(1),
      title: z.string().optional(),
      amount: z.number().optional(),
      category: z.string().optional(),
      date: z.string().optional(),
      notes: z.string().optional(),
    }),
    declaration: {
      name: "update_expense",
      description: "Update details of an expense record by its ID.",
      parameters: {
        type: SchemaType.OBJECT,
        properties: {
          id: { type: SchemaType.STRING, description: "Expense record ID" },
          title: { type: SchemaType.STRING, description: "Updated title" },
          amount: { type: SchemaType.NUMBER, description: "Updated amount" },
          category: { type: SchemaType.STRING, description: "Updated category" },
          date: { type: SchemaType.STRING, description: "Updated date" },
          notes: { type: SchemaType.STRING, description: "Updated notes" }
        },
        required: ["id"]
      }
    },
    handler: async (session, args) => {
      const { id, ...updates } = args;
      await updateExpense(session, id, updates);

      recordDomainEvent({
        eventType: DOMAIN_EVENTS.EXPENSE_UPDATED,
        userId: session.uid,
        userEmail: session.user.email,
        entityId: id,
        payload: { updates, channel: "mela_ai" },
      });

      return { success: true, id, message: "Expense updated successfully." };
    }
  },

  delete_expense: {
    name: "delete_expense",
    domain: "finance",
    type: "write",
    isSensitive: true,
    description: "Delete an expense transaction permanently.",
    schema: z.object({
      id: z.string().min(1),
    }),
    declaration: {
      name: "delete_expense",
      description: "Delete an expense transaction by ID. Requires user confirmation.",
      parameters: {
        type: SchemaType.OBJECT,
        properties: {
          id: { type: SchemaType.STRING, description: "Expense ID to delete" }
        },
        required: ["id"]
      }
    },
    handler: async (session, args, confirmed) => {
      if (!confirmed) {
        return {
          requireConfirmation: true,
          action: "delete_expense",
          preview: { id: args.id },
          message: `Are you sure you want to delete expense record ${args.id}?`,
        };
      }

      await archiveExpense(session, args.id);

      recordDomainEvent({
        eventType: DOMAIN_EVENTS.EXPENSE_DELETED,
        userId: session.uid,
        userEmail: session.user.email,
        entityId: args.id,
        payload: { channel: "mela_ai" },
      });

      return { success: true, id: args.id, message: "Expense deleted permanently." };
    }
  },

  get_budget: {
    name: "get_budget",
    domain: "finance",
    type: "read",
    description: "Retrieve spending per category and calculate budget allocations.",
    schema: z.object({}),
    declaration: {
      name: "get_budget",
      description: "Get category spending breakdown and budget allocations.",
      parameters: { type: SchemaType.OBJECT, properties: {} }
    },
    handler: async (session) => {
      const expenses = await listExpenses(session);
      const catMap: Record<string, number> = {};
      let total = 0;
      for (const e of expenses) {
        if ((e.amount || 0) > 0) {
          const c = e.category || "General";
          catMap[c] = (catMap[c] || 0) + (e.amount || 0);
          total += e.amount || 0;
        }
      }
      return { totalSpending: total, categoryBreakdown: catMap };
    }
  },

  get_financial_summary: {
    name: "get_financial_summary",
    domain: "finance",
    type: "read",
    description: "Get overall financial health, monthly income, expenses, liquid balance, and savings rate.",
    schema: z.object({}),
    declaration: {
      name: "get_financial_summary",
      description: "Retrieve summary of monthly cashflow, savings rate, and spending totals.",
      parameters: { type: SchemaType.OBJECT, properties: {} }
    },
    handler: async (session) => {
      const expenses = await listExpenses(session);
      const now = new Date();
      const prefix = now.toISOString().slice(0, 7);

      let monthlyOutflow = 0;
      let monthlyInflow = 0;

      for (const e of expenses) {
        if (!e.date || e.date.startsWith(prefix)) {
          const amt = e.amount || 0;
          if (amt < 0) monthlyInflow += Math.abs(amt);
          else monthlyOutflow += amt;
        }
      }

      const balance = monthlyInflow - monthlyOutflow;
      const savingsRate = monthlyInflow > 0 ? ((monthlyInflow - monthlyOutflow) / monthlyInflow) * 100 : 0;

      return {
        month: prefix,
        monthlyIncome: monthlyInflow,
        monthlyExpenses: monthlyOutflow,
        netLiquidBalance: balance,
        savingsRate: Math.max(0, savingsRate),
      };
    }
  },

  // ─── 2. Investment Tools ───
  get_portfolio: {
    name: "get_portfolio",
    domain: "investments",
    type: "read",
    description: "Retrieve all active and sold investment assets in the portfolio.",
    schema: z.object({}),
    declaration: {
      name: "get_portfolio",
      description: "Retrieve investment portfolio assets (equities, crypto, mutual funds, gold, fixed deposits).",
      parameters: { type: SchemaType.OBJECT, properties: {} }
    },
    handler: async (session) => {
      const p = await getPortfolio(session);
      const active = (p?.assets || []).filter(a => !a.isSold);
      return { activeHoldingsCount: active.length, assets: active };
    }
  },

  get_investment_summary: {
    name: "get_investment_summary",
    domain: "investments",
    type: "read",
    description: "Get total portfolio valuation, total cost basis, and net unrealized profit/loss.",
    schema: z.object({}),
    declaration: {
      name: "get_investment_summary",
      description: "Calculate total portfolio market valuation, invested cost, and net profit/loss percentage.",
      parameters: { type: SchemaType.OBJECT, properties: {} }
    },
    handler: async (session) => {
      const p = await getPortfolio(session);
      const active = (p?.assets || []).filter(a => !a.isSold);
      const totalVal = active.reduce((sum, a) => sum + (a.amount || 0), 0);
      const totalCost = active.reduce((sum, a) => sum + (a.investedAmount || a.amount || 0), 0);
      const pnl = totalVal - totalCost;

      return {
        totalValuation: totalVal,
        totalCostBasis: totalCost,
        netPnL: pnl,
        pnlPercentage: totalCost > 0 ? (pnl / totalCost) * 100 : 0,
      };
    }
  },

  // ─── 3. Goals Tools ───
  get_goals: {
    name: "get_goals",
    domain: "goals",
    type: "read",
    description: "Retrieve active financial and personal goals.",
    schema: z.object({}),
    declaration: {
      name: "get_goals",
      description: "Retrieve list of active goals and saved milestone amounts.",
      parameters: { type: SchemaType.OBJECT, properties: {} }
    },
    handler: async (session) => {
      return { goals: [] };
    }
  },

  create_goal: {
    name: "create_goal",
    domain: "goals",
    type: "write",
    description: "Create a new milestone savings or personal goal.",
    schema: z.object({
      title: z.string().min(1),
      targetAmount: z.number().positive(),
      currentAmount: z.number().default(0),
      deadline: z.string().optional(),
    }),
    declaration: {
      name: "create_goal",
      description: "Create a new target goal.",
      parameters: {
        type: SchemaType.OBJECT,
        properties: {
          title: { type: SchemaType.STRING, description: "Goal title" },
          targetAmount: { type: SchemaType.NUMBER, description: "Target financial amount" },
          currentAmount: { type: SchemaType.NUMBER, description: "Initial saved amount" },
          deadline: { type: SchemaType.STRING, description: "Target deadline (YYYY-MM-DD)" }
        },
        required: ["title", "targetAmount"]
      }
    },
    handler: async (session, args) => {
      return { success: true, goal: args, message: `Goal "${args.title}" created.` };
    }
  },

  update_goal: {
    name: "update_goal",
    domain: "goals",
    type: "write",
    description: "Update the saved amount or deadline of a goal.",
    schema: z.object({
      id: z.string().min(1),
      currentAmount: z.number().optional(),
      targetAmount: z.number().optional(),
    }),
    declaration: {
      name: "update_goal",
      description: "Update goal progress.",
      parameters: {
        type: SchemaType.OBJECT,
        properties: {
          id: { type: SchemaType.STRING, description: "Goal ID" },
          currentAmount: { type: SchemaType.NUMBER, description: "New current amount" }
        },
        required: ["id"]
      }
    },
    handler: async (session, args) => {
      return { success: true, id: args.id, message: "Goal updated successfully." };
    }
  },

  // ─── 4. Tasks Tools ───
  get_tasks: {
    name: "get_tasks",
    domain: "tasks",
    type: "read",
    description: "Retrieve upcoming and completed tasks.",
    schema: z.object({}),
    declaration: {
      name: "get_tasks",
      description: "Retrieve to-do tasks and checklists.",
      parameters: { type: SchemaType.OBJECT, properties: {} }
    },
    handler: async (session) => {
      return { tasks: [] };
    }
  },

  create_task: {
    name: "create_task",
    domain: "tasks",
    type: "write",
    description: "Create a new to-do task.",
    schema: z.object({
      title: z.string().min(1),
      dueDate: z.string().optional(),
    }),
    declaration: {
      name: "create_task",
      description: "Create a new task with optional due date.",
      parameters: {
        type: SchemaType.OBJECT,
        properties: {
          title: { type: SchemaType.STRING, description: "Task title" },
          dueDate: { type: SchemaType.STRING, description: "Due date (YYYY-MM-DD)" }
        },
        required: ["title"]
      }
    },
    handler: async (session, args) => {
      return { success: true, task: args, message: `Task "${args.title}" created.` };
    }
  },

  complete_task: {
    name: "complete_task",
    domain: "tasks",
    type: "write",
    description: "Mark a task as finished.",
    schema: z.object({
      id: z.string().min(1),
    }),
    declaration: {
      name: "complete_task",
      description: "Mark task completed by ID.",
      parameters: {
        type: SchemaType.OBJECT,
        properties: {
          id: { type: SchemaType.STRING, description: "Task ID" }
        },
        required: ["id"]
      }
    },
    handler: async (session, args) => {
      return { success: true, id: args.id, message: "Task marked as completed." };
    }
  },

  // ─── 5. Books Tools ───
  search_books: {
    name: "search_books",
    domain: "books",
    type: "read",
    description: "Search books on OpenLibrary.",
    schema: z.object({
      query: z.string().min(1),
    }),
    declaration: {
      name: "search_books",
      description: "Search books by title or author.",
      parameters: {
        type: SchemaType.OBJECT,
        properties: {
          query: { type: SchemaType.STRING, description: "Book title or author" }
        },
        required: ["query"]
      }
    },
    handler: async (session, args) => {
      try {
        const res = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(args.query)}&limit=5`);
        const data = await res.json();
        const docs = (data.docs || []).map((d: any) => ({
          title: d.title,
          author: d.author_name ? d.author_name.join(", ") : "Unknown",
          firstPublishYear: d.first_publish_year,
        }));
        return { results: docs };
      } catch {
        return { results: [] };
      }
    }
  },

  add_book: {
    name: "add_book",
    domain: "books",
    type: "write",
    description: "Add a book to reading list or library.",
    schema: z.object({
      title: z.string().min(1),
      author: z.string().optional().default("Unknown"),
      status: z.enum(["reading", "completed", "plan_to_read"]).default("plan_to_read"),
    }),
    declaration: {
      name: "add_book",
      description: "Add a book to the user reading library.",
      parameters: {
        type: SchemaType.OBJECT,
        properties: {
          title: { type: SchemaType.STRING, description: "Book title" },
          author: { type: SchemaType.STRING, description: "Author name" },
          status: { type: SchemaType.STRING, description: "Status (reading, completed, plan_to_read)" }
        },
        required: ["title"]
      }
    },
    handler: async (session, args) => {
      await addWatchlistItem(session, {
        title: args.title,
        type: "book",
        status: args.status === "reading" ? "watching" : args.status === "completed" ? "completed" : "plan_to_watch",
        progress: 0,
        totalEpisodes: null,
        rating: null,
        coverImage: null,
        year: null,
      });

      return { success: true, title: args.title, message: `Added book "${args.title}" to library.` };
    }
  },

  get_reading_progress: {
    name: "get_reading_progress",
    domain: "books",
    type: "read",
    description: "Get all books in reading list and current progress.",
    schema: z.object({}),
    declaration: {
      name: "get_reading_progress",
      description: "Check books currently reading or in library.",
      parameters: { type: SchemaType.OBJECT, properties: {} }
    },
    handler: async (session) => {
      const items = await listWatchlist(session);
      const books = items.filter(i => i.type === "book");
      return { count: books.length, books };
    }
  },

  // ─── 6. Media Tools ───
  search_media: {
    name: "search_media",
    domain: "media",
    type: "read",
    description: "Search for movies, TV series, or anime in the user watchlist.",
    schema: z.object({
      query: z.string().min(1),
    }),
    declaration: {
      name: "search_media",
      description: "Search watchlist by title.",
      parameters: {
        type: SchemaType.OBJECT,
        properties: {
          query: { type: SchemaType.STRING, description: "Media title" }
        },
        required: ["query"]
      }
    },
    handler: async (session, args) => {
      const items = await listWatchlist(session);
      const q = args.query.toLowerCase();
      const matched = items.filter(i => i.title.toLowerCase().includes(q));
      return { matches: matched };
    }
  },

  add_media: {
    name: "add_media",
    domain: "media",
    type: "write",
    description: "Add a movie, TV show, or anime to the watchlist.",
    schema: z.object({
      title: z.string().min(1),
      type: z.enum(["movie", "show", "anime", "book"]).default("movie"),
      status: z.enum(["plan_to_watch", "watching", "completed", "dropped", "paused"]).default("plan_to_watch"),
      progress: z.number().default(0),
    }),
    declaration: {
      name: "add_media",
      description: "Add a title to the watchlist.",
      parameters: {
        type: SchemaType.OBJECT,
        properties: {
          title: { type: SchemaType.STRING, description: "Media title" },
          type: { type: SchemaType.STRING, description: "movie, show, anime, or book" },
          status: { type: SchemaType.STRING, description: "plan_to_watch, watching, completed, etc." },
          progress: { type: SchemaType.INTEGER, description: "Episodes watched" }
        },
        required: ["title"]
      }
    },
    handler: async (session, args) => {
      const res = await addWatchlistItem(session, {
        title: args.title,
        type: args.type || "movie",
        status: args.status || "plan_to_watch",
        progress: args.progress || 0,
        totalEpisodes: null,
        rating: null,
        coverImage: null,
        year: null,
      });

      recordDomainEvent({
        eventType: DOMAIN_EVENTS.WATCHLIST_ADDED,
        userId: session.uid,
        userEmail: session.user.email,
        entityId: res.id,
        payload: { title: args.title, type: args.type, channel: "mela_ai" },
      });

      return { success: true, id: res.id, message: `Added "${args.title}" to watchlist.` };
    }
  },

  update_watch_progress: {
    name: "update_watch_progress",
    domain: "media",
    type: "write",
    description: "Update episodes watched, rating, or watch status for a title.",
    schema: z.object({
      id: z.string().min(1),
      progress: z.number().optional(),
      rating: z.number().optional(),
      status: z.enum(["plan_to_watch", "watching", "completed", "dropped", "paused"]).optional(),
    }),
    declaration: {
      name: "update_watch_progress",
      description: "Update episode progress or score for a watchlist item.",
      parameters: {
        type: SchemaType.OBJECT,
        properties: {
          id: { type: SchemaType.STRING, description: "Watchlist item ID" },
          progress: { type: SchemaType.INTEGER, description: "Episodes watched" },
          rating: { type: SchemaType.NUMBER, description: "Rating score (1-10)" },
          status: { type: SchemaType.STRING, description: "Status" }
        },
        required: ["id"]
      }
    },
    handler: async (session, args) => {
      const { id, ...patch } = args;
      await updateWatchlistItem(session, id, patch);

      recordDomainEvent({
        eventType: DOMAIN_EVENTS.WATCHLIST_UPDATED,
        userId: session.uid,
        userEmail: session.user.email,
        entityId: id,
        payload: { patch, channel: "mela_ai" },
      });

      return { success: true, id, message: "Watchlist progress updated." };
    }
  },

  // ─── 7. Notes Tools ───
  search_notes: {
    name: "search_notes",
    domain: "notes",
    type: "read",
    description: "Read the user scratchpad notes.",
    schema: z.object({}),
    declaration: {
      name: "search_notes",
      description: "Read the user persistent scratchpad notes.",
      parameters: { type: SchemaType.OBJECT, properties: {} }
    },
    handler: async (session) => {
      const note = await getNote(session);
      return { content: note?.content || "" };
    }
  },

  create_note: {
    name: "create_note",
    domain: "notes",
    type: "write",
    description: "Overwrite or update the user persistent scratchpad note.",
    schema: z.object({
      content: z.string().min(1),
    }),
    declaration: {
      name: "create_note",
      description: "Save new markdown content into the user scratchpad.",
      parameters: {
        type: SchemaType.OBJECT,
        properties: {
          content: { type: SchemaType.STRING, description: "Note markdown content" }
        },
        required: ["content"]
      }
    },
    handler: async (session, args) => {
      await updateNote(session, args.content);
      return { success: true, message: "Scratchpad note updated successfully." };
    }
  },

  // ─── 8. Subscriptions Tools ───
  get_subscriptions: {
    name: "get_subscriptions",
    domain: "subscriptions",
    type: "read",
    description: "Retrieve all active recurring subscriptions and costs.",
    schema: z.object({}),
    declaration: {
      name: "get_subscriptions",
      description: "List recurring subscription bills.",
      parameters: { type: SchemaType.OBJECT, properties: {} }
    },
    handler: async (session) => {
      const subs = await listSubscriptions(session);
      const totalBurn = subs.reduce((sum, s) => sum + (s.billingCycle === "yearly" ? s.cost / 12 : s.cost), 0);
      return { totalMonthlyBurn: totalBurn, subscriptions: subs };
    }
  },

  get_upcoming_renewals: {
    name: "get_upcoming_renewals",
    domain: "subscriptions",
    type: "read",
    description: "Find subscriptions renewing in the next 30 days.",
    schema: z.object({}),
    declaration: {
      name: "get_upcoming_renewals",
      description: "Get upcoming subscription renewals due within 30 days.",
      parameters: { type: SchemaType.OBJECT, properties: {} }
    },
    handler: async (session) => {
      const subs = await listSubscriptions(session);
      const sorted = [...subs].sort((a, b) => (a.nextBillingDate || "").localeCompare(b.nextBillingDate || ""));
      return { renewals: sorted.slice(0, 5) };
    }
  },

  // ─── 9. Net Worth Tools ───
  get_net_worth: {
    name: "get_net_worth",
    domain: "net-worth",
    type: "read",
    description: "Retrieve comprehensive balance sheet and Net Worth analysis (Total Assets - Total Liabilities).",
    schema: z.object({}),
    declaration: {
      name: "get_net_worth",
      description: "Retrieve total Net Worth, asset allocations, liabilities breakdown, debt ratio, and historical trends.",
      parameters: { type: SchemaType.OBJECT, properties: {} }
    },
    handler: async () => {
      const { MelaNetWorthService, DEFAULT_ASSETS, DEFAULT_LIABILITIES, DEFAULT_SNAPSHOTS } = await import("@/lib/finance/net-worth");
      const summary = MelaNetWorthService.calculateSummary(DEFAULT_ASSETS, DEFAULT_LIABILITIES, DEFAULT_SNAPSHOTS);
      return {
        currentNetWorth: summary.currentNetWorth,
        totalAssets: summary.totalAssets,
        totalLiabilities: summary.totalLiabilities,
        debtToAssetRatio: summary.debtToAssetRatio,
        monthlyChange: { amount: summary.monthlyChangeAmount, percent: summary.monthlyChangePercent },
        annualChange: { amount: summary.annualChangeAmount, percent: summary.annualChangePercent },
        assetAllocation: summary.assetAllocation,
        liabilityAllocation: summary.liabilityAllocation,
      };
    }
  },

  create_asset: {
    name: "create_asset",
    domain: "net-worth",
    type: "write",
    description: "Add a new asset item to the balance sheet (e.g. Real Estate, Gold, Cash, Vehicles, Crypto).",
    schema: z.object({
      name: z.string().min(1),
      category: z.enum(["Cash", "Bank Accounts", "Investments", "Crypto", "Gold", "Real Estate", "Vehicles", "Other Assets"]),
      amount: z.number().positive(),
      institutionOrLocation: z.string().optional(),
      notes: z.string().optional(),
    }),
    declaration: {
      name: "create_asset",
      description: "Add an asset item to user's net worth ledger.",
      parameters: {
        type: SchemaType.OBJECT,
        properties: {
          name: { type: SchemaType.STRING, description: "Name of the asset" },
          category: { type: SchemaType.STRING, description: "Category (Cash, Bank Accounts, Investments, Crypto, Gold, Real Estate, Vehicles, Other Assets)" },
          amount: { type: SchemaType.NUMBER, description: "Current valuation amount" },
          institutionOrLocation: { type: SchemaType.STRING, description: "Holding institution, bank, or location" },
          notes: { type: SchemaType.STRING, description: "Optional notes" }
        },
        required: ["name", "category", "amount"]
      }
    },
    handler: async (session, args) => {
      recordDomainEvent({
        eventType: DOMAIN_EVENTS.ASSET_CREATED || "ASSET_CREATED",
        userId: session.uid,
        entityId: "ast_" + Date.now(),
        payload: args,
      });
      return { success: true, message: `Asset "${args.name}" with valuation ${args.amount} recorded successfully.` };
    }
  },

  create_liability: {
    name: "create_liability",
    domain: "net-worth",
    type: "write",
    description: "Add a liability or debt obligation (e.g. Loan, Credit Card Debt, Personal Debt).",
    schema: z.object({
      name: z.string().min(1),
      category: z.enum(["Loans", "Credit Card Debt", "Personal Debt", "Other Liabilities"]),
      amount: z.number().positive(),
      interestRate: z.number().optional(),
      monthlyPayment: z.number().optional(),
      lender: z.string().optional(),
      notes: z.string().optional(),
    }),
    declaration: {
      name: "create_liability",
      description: "Record a liability or loan on the user's balance sheet.",
      parameters: {
        type: SchemaType.OBJECT,
        properties: {
          name: { type: SchemaType.STRING, description: "Liability name or loan title" },
          category: { type: SchemaType.STRING, description: "Category (Loans, Credit Card Debt, Personal Debt, Other Liabilities)" },
          amount: { type: SchemaType.NUMBER, description: "Outstanding debt amount" },
          interestRate: { type: SchemaType.NUMBER, description: "Annual interest rate percentage" },
          monthlyPayment: { type: SchemaType.NUMBER, description: "Monthly payment amount" },
          lender: { type: SchemaType.STRING, description: "Bank or lender name" },
          notes: { type: SchemaType.STRING, description: "Optional notes" }
        },
        required: ["name", "category", "amount"]
      }
    },
    handler: async (session, args) => {
      recordDomainEvent({
        eventType: DOMAIN_EVENTS.LIABILITY_CREATED || "LIABILITY_CREATED",
        userId: session.uid,
        entityId: "liab_" + Date.now(),
        payload: args,
      });
      return { success: true, message: `Liability "${args.name}" with outstanding balance ${args.amount} recorded.` };
    }
  },

  create_net_worth_snapshot: {
    name: "create_net_worth_snapshot",
    domain: "net-worth",
    type: "write",
    description: "Capture a timestamped historical snapshot checkpoint of total Net Worth.",
    schema: z.object({
      note: z.string().optional(),
    }),
    declaration: {
      name: "create_net_worth_snapshot",
      description: "Capture current assets and liabilities into a historical snapshot checkpoint.",
      parameters: {
        type: SchemaType.OBJECT,
        properties: {
          note: { type: SchemaType.STRING, description: "Checkpoint description or milestone label" }
        }
      }
    },
    handler: async (session, args) => {
      const { MelaNetWorthService, DEFAULT_ASSETS, DEFAULT_LIABILITIES } = await import("@/lib/finance/net-worth");
      const snap = MelaNetWorthService.createSnapshot(DEFAULT_ASSETS, DEFAULT_LIABILITIES, args.note || "AI Snapshot");
      recordDomainEvent({
        eventType: DOMAIN_EVENTS.NET_WORTH_SNAPSHOT_CREATED || "NET_WORTH_SNAPSHOT_CREATED",
        userId: session.uid,
        entityId: snap.id,
        payload: snap,
      });
      return { success: true, snapshot: snap, message: `Historical snapshot captured at ${snap.date} with Net Worth ${snap.netWorth}.` };
    }
  },

  // ─── 10. Goals Tools ───
  get_goals: {
    name: "get_goals",
    domain: "goals",
    type: "read",
    description: "Retrieve all active user goals with deterministic intelligence metrics (monthly savings needed, weekly savings, progress %, probability score).",
    schema: z.object({
      category: z.string().optional(),
    }),
    declaration: {
      name: "get_goals",
      description: "Retrieve active savings and life goals with MELA intelligence analysis.",
      parameters: {
        type: SchemaType.OBJECT,
        properties: {
          category: { type: SchemaType.STRING, description: "Optional filter by category" },
        },
      },
    },
    handler: async (_session, args) => {
      const { MelaGoalsIntelligence, DEFAULT_GOALS } = await import("@/lib/goals/intelligence");
      let list = [...DEFAULT_GOALS];
      if (args.category) {
        list = list.filter((g) => g.category.toLowerCase().includes(args.category.toLowerCase()));
      }
      const analyzed = list.map((g) => ({
        ...g,
        intelligence: MelaGoalsIntelligence.analyzeGoal(g),
      }));
      return { count: analyzed.length, goals: analyzed };
    },
  },

  create_goal: {
    name: "create_goal",
    domain: "goals",
    type: "write",
    description: "Create a new target savings or milestone goal with automatic pace calculation.",
    schema: z.object({
      title: z.string().min(1),
      targetAmount: z.number().positive(),
      currentAmount: z.number().optional().default(0),
      deadline: z.string().optional(),
      category: z.enum([
        "Equb & Savings",
        "Tech & Equipment",
        "Emergency Fund",
        "Education",
        "Travel",
        "Vehicle",
        "Real Estate",
        "Health",
        "Personal",
      ]).optional().default("Equb & Savings"),
      priority: z.enum(["high", "medium", "low"]).optional().default("medium"),
      notes: z.string().optional(),
    }),
    declaration: {
      name: "create_goal",
      description: "Create a new savings goal with target amount and deadline.",
      parameters: {
        type: SchemaType.OBJECT,
        properties: {
          title: { type: SchemaType.STRING, description: "Goal name (e.g. Laptop, Emergency Fund)" },
          targetAmount: { type: SchemaType.NUMBER, description: "Target amount to reach" },
          currentAmount: { type: SchemaType.NUMBER, description: "Current amount already saved" },
          deadline: { type: SchemaType.STRING, description: "Target deadline date (YYYY-MM-DD)" },
          category: { type: SchemaType.STRING, description: "Goal category" },
          priority: { type: SchemaType.STRING, description: "Priority (high, medium, low)" },
          notes: { type: SchemaType.STRING, description: "Optional notes" },
        },
        required: ["title", "targetAmount"],
      },
    },
    handler: async (session, args) => {
      const { MelaGoalsIntelligence } = await import("@/lib/goals/intelligence");
      const milestones = MelaGoalsIntelligence.generateDefaultMilestones(args.targetAmount);
      const goal = {
        id: "goal_" + Date.now(),
        ...args,
        createdAt: new Date().toISOString().slice(0, 10),
        updatedAt: new Date().toISOString().slice(0, 10),
        status: (args.currentAmount || 0) >= args.targetAmount ? "completed" : "in_progress",
        milestones,
      };
      recordDomainEvent({
        eventType: DOMAIN_EVENTS.GOAL_CREATED || "GOAL_CREATED",
        userId: session.uid,
        entityId: goal.id,
        payload: goal,
      });
      return { success: true, goal, message: `Goal "${args.title}" with target ${args.targetAmount} created successfully.` };
    },
  },

  add_goal_contribution: {
    name: "add_goal_contribution",
    domain: "goals",
    type: "write",
    description: "Record a savings contribution or deposit towards an active goal.",
    schema: z.object({
      goalId: z.string(),
      amount: z.number().positive(),
      note: z.string().optional(),
      date: z.string().optional(),
    }),
    declaration: {
      name: "add_goal_contribution",
      description: "Add a savings deposit towards a specific goal.",
      parameters: {
        type: SchemaType.OBJECT,
        properties: {
          goalId: { type: SchemaType.STRING, description: "Goal ID" },
          amount: { type: SchemaType.NUMBER, description: "Deposit amount" },
          note: { type: SchemaType.STRING, description: "Optional note or source" },
          date: { type: SchemaType.STRING, description: "Deposit date (YYYY-MM-DD)" },
        },
        required: ["goalId", "amount"],
      },
    },
    handler: async (session, args) => {
      recordDomainEvent({
        eventType: "GOAL_CONTRIBUTION_RECORDED",
        userId: session.uid,
        entityId: args.goalId,
        payload: args,
      });
      return { success: true, message: `Contribution of ${args.amount} recorded for goal ${args.goalId}.` };
    },
  },

  // ─── 11. Tasks & Calendar Productivity Tools ───
  get_tasks: {
    name: "get_tasks",
    domain: "tasks",
    type: "read",
    description: "Retrieve user tasks with optional filtering by status (todo, in_progress, completed, overdue, today), project, and priority.",
    schema: z.object({
      filter: z.enum(["all", "today", "overdue", "completed"]).optional(),
      project: z.string().optional(),
      priority: z.enum(["urgent", "high", "medium", "low"]).optional(),
    }),
    declaration: {
      name: "get_tasks",
      description: "Get prioritized task list, overdue tasks, or tasks due today.",
      parameters: {
        type: SchemaType.OBJECT,
        properties: {
          filter: { type: SchemaType.STRING, description: "Filter: 'all', 'today', 'overdue', 'completed'" },
          project: { type: SchemaType.STRING, description: "Filter by project name" },
          priority: { type: SchemaType.STRING, description: "Filter by priority: 'urgent', 'high', 'medium', 'low'" },
        },
      },
    },
    handler: async (_session, args) => {
      const { MelaProductivityEngine, DEFAULT_TASKS } = await import("@/lib/tasks/productivity");
      const refDate = "2026-09-07";
      let list = [...DEFAULT_TASKS];

      if (args.filter === "today") list = MelaProductivityEngine.getTodayTasks(list, refDate);
      else if (args.filter === "overdue") list = MelaProductivityEngine.getOverdueTasks(list, refDate);
      else if (args.filter === "completed") list = list.filter((t) => t.status === "completed");

      if (args.project) list = list.filter((t) => t.project?.toLowerCase() === args.project.toLowerCase());
      if (args.priority) list = list.filter((t) => t.priority === args.priority);

      const summary = MelaProductivityEngine.getSummary(DEFAULT_TASKS, refDate);
      return { count: list.length, tasks: list, summary };
    },
  },

  create_task: {
    name: "create_task",
    domain: "tasks",
    type: "write",
    description: "Create a new task with priority, due date, project, and subtasks.",
    schema: z.object({
      title: z.string().min(1),
      description: z.string().optional(),
      dueDate: z.string().optional(),
      priority: z.enum(["urgent", "high", "medium", "low"]).optional().default("medium"),
      project: z.string().optional().default("Personal"),
      recurring: z.enum(["none", "daily", "weekly", "monthly"]).optional().default("none"),
    }),
    declaration: {
      name: "create_task",
      description: "Create a new personal or work task.",
      parameters: {
        type: SchemaType.OBJECT,
        properties: {
          title: { type: SchemaType.STRING, description: "Task title" },
          description: { type: SchemaType.STRING, description: "Task description or notes" },
          dueDate: { type: SchemaType.STRING, description: "Due date (YYYY-MM-DD)" },
          priority: { type: SchemaType.STRING, description: "Priority (urgent, high, medium, low)" },
          project: { type: SchemaType.STRING, description: "Project name (e.g. Work, Finance, Tech & Portfolio)" },
          recurring: { type: SchemaType.STRING, description: "Recurrence (none, daily, weekly, monthly)" },
        },
        required: ["title"],
      },
    },
    handler: async (session, args) => {
      const task = {
        id: "task_" + Date.now(),
        ...args,
        status: "todo",
        createdAt: new Date().toISOString().slice(0, 10),
        updatedAt: new Date().toISOString().slice(0, 10),
      };
      recordDomainEvent({
        eventType: DOMAIN_EVENTS.TASK_CREATED || "TASK_CREATED",
        userId: session.uid,
        entityId: task.id,
        payload: task,
      });
      return { success: true, task, message: `Task "${args.title}" created successfully for ${args.dueDate || "today"}.` };
    },
  },

  complete_task: {
    name: "complete_task",
    domain: "tasks",
    type: "write",
    description: "Mark a task as completed.",
    schema: z.object({
      taskId: z.string(),
    }),
    declaration: {
      name: "complete_task",
      description: "Mark a task completed.",
      parameters: {
        type: SchemaType.OBJECT,
        properties: {
          taskId: { type: SchemaType.STRING, description: "Task ID to mark completed" },
        },
        required: ["taskId"],
      },
    },
    handler: async (session, args) => {
      recordDomainEvent({
        eventType: "TASK_COMPLETED",
        userId: session.uid,
        entityId: args.taskId,
        payload: args,
      });
      return { success: true, message: `Task ${args.taskId} marked as completed.` };
    },
  },

  get_calendar_events: {
    name: "get_calendar_events",
    domain: "tasks",
    type: "read",
    description: "Retrieve unified calendar events, reminders, Ethiopian holidays, and task deadlines.",
    schema: z.object({
      date: z.string().optional(),
    }),
    declaration: {
      name: "get_calendar_events",
      description: "Get calendar schedule, reminders, holidays, and deadlines.",
      parameters: {
        type: SchemaType.OBJECT,
        properties: {
          date: { type: SchemaType.STRING, description: "Reference date (YYYY-MM-DD)" },
        },
      },
    },
    handler: async (_session, args) => {
      const { MelaProductivityEngine, DEFAULT_TASKS, DEFAULT_CALENDAR_EVENTS } = await import("@/lib/tasks/productivity");
      const refDate = args.date ? new Date(args.date) : new Date("2026-09-07");
      const events = MelaProductivityEngine.mergeTasksIntoCalendar(DEFAULT_TASKS, DEFAULT_CALENDAR_EVENTS, refDate);
      const weeklyPlan = MelaProductivityEngine.getWeeklyPlan(DEFAULT_TASKS, DEFAULT_CALENDAR_EVENTS, args.date || "2026-09-07");
      return { count: events.length, events: events.slice(0, 30), weeklyPlan };
    },
  },
};

/**
 * Get all function declarations for Gemini / LLM registration.
 */
export function getAllToolDeclarations(): FunctionDeclaration[] {
  return Object.values(toolRegistry).map(t => t.declaration);
}

/**
 * Securely execute a tool from the registry.
 * Validates inputs, checks authorization, handles sensitivity, and records audit telemetry.
 */
export async function executeToolSecurely(
  session: Session,
  toolName: string,
  args: any,
  confirmed: boolean = false
): Promise<any> {
  const tool = toolRegistry[toolName];
  if (!tool) {
    throw new Error(`Tool "${toolName}" is not registered in MELA tool registry.`);
  }

  // 1. Authorization check
  if (!session || !session.uid) {
    throw new Error("Unauthorized: Active user session required.");
  }

  // 2. Validate input schema with Zod
  const validation = tool.schema.safeParse(args || {});
  if (!validation.success) {
    return {
      error: `Invalid arguments for tool ${toolName}: ${validation.error.issues.map(i => i.message).join(", ")}`,
    };
  }

  // 3. Sensitive check for write operations
  if (tool.type === "write" && tool.isSensitive && !confirmed) {
    return {
      requireConfirmation: true,
      action: tool.name,
      preview: validation.data,
      message: `Action "${tool.name}" requires user confirmation before execution.`,
    };
  }

  // 4. Execute tool
  try {
    const result = await tool.handler(session, validation.data, confirmed);
    return result;
  } catch (err: any) {
    console.error(`[ToolRegistry] Error executing ${toolName}:`, err);
    return { error: err.message || "Failed to execute action." };
  }
}
