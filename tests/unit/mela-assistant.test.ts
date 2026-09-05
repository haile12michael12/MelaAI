import { describe, it, expect } from "vitest";
import { MELA_SYSTEM_PROMPT } from "@/lib/mela/prompts";
import { melaFunctionDeclarations } from "@/lib/mela/tools";

describe("MELA AI Assistant Core", () => {
  it("includes system prompt with core domains", () => {
    expect(MELA_SYSTEM_PROMPT).toContain("MELA");
    expect(MELA_SYSTEM_PROMPT).toContain("Finance & Budgets");
    expect(MELA_SYSTEM_PROMPT).toContain("Investments");
    expect(MELA_SYSTEM_PROMPT).toContain("Subscriptions");
    expect(MELA_SYSTEM_PROMPT).toContain("Goals & Tasks");
  });

  it("declares function tools for all key operations", () => {
    const names = melaFunctionDeclarations.map((t) => t.name);
    expect(names).toContain("listExpenses");
    expect(names).toContain("createExpense");
    expect(names).toContain("getPortfolio");
    expect(names).toContain("listSubscriptions");
    expect(names).toContain("listWatchlist");
    expect(names).toContain("getScratchpadNote");
    expect(names).toContain("updateScratchpadNote");
  });
});
