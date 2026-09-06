import { describe, it, expect } from "vitest";
import { melaSearch } from "@/lib/mela/search";

describe("MELA Universal Search", () => {
  it("returns empty results for empty or whitespace query", async () => {
    const res1 = await melaSearch("");
    expect(res1.results).toHaveLength(0);

    const res2 = await melaSearch("   ");
    expect(res2.results).toHaveLength(0);
  });

  it("finds navigation routes by direct title match", async () => {
    const res = await melaSearch("finance");
    expect(res.results.length).toBeGreaterThan(0);
    const financeNav = res.results.find((r) => r.href === "/finance");
    expect(financeNav).toBeDefined();
    expect(financeNav?.domain).toBe("navigation");
  });

  it("finds routes by Ethiopian-specific keywords", async () => {
    // 'equb' keyword is attached to /finance and /goals
    const resEqub = await melaSearch("equb");
    expect(resEqub.results.some((r) => r.href === "/finance" || r.href === "/goals")).toBe(true);

    // 'enkutatash' keyword is attached to /calendar
    const resHoliday = await melaSearch("enkutatash");
    expect(resHoliday.results.some((r) => r.href === "/calendar")).toBe(true);

    // 'telebirr' keyword is attached to /finance
    const resTelebirr = await melaSearch("telebirr");
    expect(resTelebirr.results.some((r) => r.href === "/finance")).toBe(true);
  });

  it("finds productivity and knowledge routes", async () => {
    const resNotes = await melaSearch("markdown");
    expect(resNotes.results.some((r) => r.href === "/notes")).toBe(true);

    const resDocs = await melaSearch("vault");
    expect(resDocs.results.some((r) => r.href === "/documents")).toBe(true);

    const resAssistant = await melaSearch("assistant");
    expect(resAssistant.results.some((r) => r.href === "/mela/assistant")).toBe(true);
  });
});

