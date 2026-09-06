import { FunctionDeclaration, SchemaType } from "@google/generative-ai";
import { getAllToolDeclarations, toolRegistry } from "./tool-registry";

export * from "./tool-registry";

export const melaFunctionDeclarations: FunctionDeclaration[] = [
  ...getAllToolDeclarations(),
  {
    name: "listExpenses",
    description: "List recent user expenses with optional filters",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        category: { type: SchemaType.STRING, description: "Category filter" },
        from: { type: SchemaType.STRING, description: "Start date (YYYY-MM-DD)" },
        to: { type: SchemaType.STRING, description: "End date (YYYY-MM-DD)" },
      },
    },
  },
  {
    name: "createExpense",
    description: "Log a new expense in the user ledger",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        title: { type: SchemaType.STRING, description: "Expense title" },
        amount: { type: SchemaType.NUMBER, description: "Amount in ETB or account currency" },
        category: { type: SchemaType.STRING, description: "Category name" },
        date: { type: SchemaType.STRING, description: "Date (YYYY-MM-DD)" },
      },
      required: ["title", "amount"],
    },
  },
  {
    name: "getPortfolio",
    description: "Get current user investment portfolio holdings and valuation",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {},
    },
  },
  {
    name: "listSubscriptions",
    description: "List all active recurring subscriptions and monthly burn",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {},
    },
  },
  {
    name: "listWatchlist",
    description: "List media watchlist items, anime, movies, and TV series",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        type: { type: SchemaType.STRING, description: "Filter by movie, show, or anime" },
      },
    },
  },
  {
    name: "getScratchpadNote",
    description: "Read the user persistent scratchpad note",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {},
    },
  },
  {
    name: "updateScratchpadNote",
    description: "Update the user persistent scratchpad note",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        content: { type: SchemaType.STRING, description: "New note markdown content" },
      },
      required: ["content"],
    },
  },
];
