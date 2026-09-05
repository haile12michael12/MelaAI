import { describe, it, expect } from "vitest";
import { toolRegistry, getAllToolDeclarations } from "@/lib/mela/tool-registry";

describe("MELA Centralized Tool Registry", () => {
  it("registers all required domain tools", () => {
    const requiredTools = [
      "get_expenses",
      "create_expense",
      "update_expense",
      "delete_expense",
      "get_budget",
      "get_financial_summary",
      "get_portfolio",
      "get_investment_summary",
      "get_goals",
      "create_goal",
      "update_goal",
      "get_tasks",
      "create_task",
      "complete_task",
      "search_books",
      "add_book",
      "get_reading_progress",
      "search_media",
      "add_media",
      "update_watch_progress",
      "search_notes",
      "create_note",
      "get_subscriptions",
      "get_upcoming_renewals",
    ];

    for (const toolName of requiredTools) {
      expect(toolRegistry[toolName], `Expected tool ${toolName} to be registered`).toBeDefined();
    }
  });

  it("marks delete_expense as sensitive requiring confirmation", () => {
    expect(toolRegistry.delete_expense.isSensitive).toBe(true);
    expect(toolRegistry.create_expense.isSensitive).toBeFalsy();
  });

  it("exports valid Gemini function declarations for all tools", () => {
    const declarations = getAllToolDeclarations();
    expect(declarations.length).toBeGreaterThanOrEqual(24);
    for (const dec of declarations) {
      expect(dec.name).toBeDefined();
      expect(dec.description).toBeDefined();
    }
  });

  it("validates input schema strictly with Zod", () => {
    const validExpense = toolRegistry.create_expense.schema.safeParse({
      title: "Groceries",
      amount: 45.5,
      category: "Food",
    });
    expect(validExpense.success).toBe(true);

    const invalidExpense = toolRegistry.create_expense.schema.safeParse({
      amount: "invalid-string",
    });
    expect(invalidExpense.success).toBe(false);
  });
});
