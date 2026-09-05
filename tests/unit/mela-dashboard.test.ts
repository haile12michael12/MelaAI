import { describe, it, expect } from "vitest";
import { calculateNetWorth } from "@/lib/finance/calculations";

describe("MELA Dashboard Computations", () => {
  it("calculates net worth accurately", () => {
    const assets = 50000;
    const liabilities = 15000;
    expect(calculateNetWorth(assets, liabilities)).toBe(35000);
  });

  it("calculates savings rate accurately", () => {
    const income = 5000;
    const expenses = 3500;
    const savingsRate = ((income - expenses) / income) * 100;
    expect(savingsRate).toBe(30);
  });

  it("handles zero income gracefully for savings rate", () => {
    const income = 0;
    const expenses = 500;
    const savingsRate = income > 0 ? ((income - expenses) / income) * 100 : 0;
    expect(savingsRate).toBe(0);
  });
});
