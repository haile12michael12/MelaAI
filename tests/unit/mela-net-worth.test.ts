import { describe, it, expect } from "vitest";
import {
  MelaNetWorthService,
  DEFAULT_ASSETS,
  DEFAULT_LIABILITIES,
  DEFAULT_SNAPSHOTS,
  ASSET_CATEGORIES,
  LIABILITY_CATEGORIES,
  AssetItem,
  LiabilityItem,
} from "../../lib/finance/net-worth";
import { toolRegistry, executeToolSecurely } from "../../lib/mela/tool-registry";
import { extractDomainContext } from "../../lib/mela/context";

describe("MELA Net Worth Module", () => {
  const mockAssets: AssetItem[] = [
    { id: "a1", name: "Wallet Cash", category: "Cash", amount: 10000, updatedAt: "2026-09-01" },
    { id: "a2", name: "CBE Account", category: "Bank Accounts", amount: 90000, updatedAt: "2026-09-01" },
    { id: "a3", name: "Equb Shares", category: "Investments", amount: 50000, updatedAt: "2026-09-01" },
    { id: "a4", name: "Bitcoin & USDT", category: "Crypto", amount: 20000, updatedAt: "2026-09-01" },
    { id: "a5", name: "Gold Bullion", category: "Gold", amount: 40000, updatedAt: "2026-09-01" },
    { id: "a6", name: "Apartment Equity", category: "Real Estate", amount: 1000000, updatedAt: "2026-09-01" },
    { id: "a7", name: "Car", category: "Vehicles", amount: 300000, updatedAt: "2026-09-01" },
    { id: "a8", name: "Artwork", category: "Other Assets", amount: 15000, updatedAt: "2026-09-01" },
  ];

  const mockLiabilities: LiabilityItem[] = [
    { id: "l1", name: "Auto Loan", category: "Loans", amount: 100000, updatedAt: "2026-09-01" },
    { id: "l2", name: "Credit Card", category: "Credit Card Debt", amount: 10000, updatedAt: "2026-09-01" },
    { id: "l3", name: "Friend Loan", category: "Personal Debt", amount: 15000, updatedAt: "2026-09-01" },
  ];

  it("calculates Net Worth = Total Assets - Total Liabilities deterministically", () => {
    const summary = MelaNetWorthService.calculateSummary(mockAssets, mockLiabilities, []);
    
    expect(summary.totalAssets).toBe(1525000);
    expect(summary.totalLiabilities).toBe(125000);
    expect(summary.currentNetWorth).toBe(1400000);
    expect(summary.debtToAssetRatio).toBeCloseTo((125000 / 1525000) * 100, 2);
  });

  it("allocates assets accurately across all 8 asset categories", () => {
    const summary = MelaNetWorthService.calculateSummary(mockAssets, mockLiabilities, []);
    
    expect(summary.assetAllocation.length).toBe(8);
    const goldAllocation = summary.assetAllocation.find((a) => a.category === "Gold");
    expect(goldAllocation).toBeDefined();
    expect(goldAllocation?.amount).toBe(40000);

    const realEstateAllocation = summary.assetAllocation.find((a) => a.category === "Real Estate");
    expect(realEstateAllocation?.amount).toBe(1000000);
  });

  it("allocates liabilities accurately across requested categories", () => {
    const summary = MelaNetWorthService.calculateSummary(mockAssets, mockLiabilities, []);
    
    expect(summary.liabilityAllocation.length).toBe(3);
    const loan = summary.liabilityAllocation.find((l) => l.category === "Loans");
    expect(loan?.amount).toBe(100000);
  });

  it("captures snapshots and computes monthly and annual deltas", () => {
    const snapshots = [
      {
        id: "s1",
        date: "2025-09-01",
        totalAssets: 1200000,
        totalLiabilities: 100000,
        netWorth: 1100000,
        assetBreakdown: {} as any,
        liabilityBreakdown: {} as any,
      },
      {
        id: "s2",
        date: "2026-08-01",
        totalAssets: 1450000,
        totalLiabilities: 120000,
        netWorth: 1330000,
        assetBreakdown: {} as any,
        liabilityBreakdown: {} as any,
      },
    ];

    const summary = MelaNetWorthService.calculateSummary(mockAssets, mockLiabilities, snapshots);

    // MoM vs 2026-08-01 (1,400,000 - 1,330,000 = 70,000)
    expect(summary.monthlyChangeAmount).toBe(70000);
    expect(summary.monthlyChangePercent).toBeCloseTo((70000 / 1330000) * 100, 2);

    // YoY vs 2025-09-01 (1,400,000 - 1,100,000 = 300,000)
    expect(summary.annualChangeAmount).toBe(300000);
    expect(summary.annualChangePercent).toBeCloseTo((300000 / 1100000) * 100, 2);
  });

  it("creates a new valid snapshot via MelaNetWorthService.createSnapshot", () => {
    const snap = MelaNetWorthService.createSnapshot(mockAssets, mockLiabilities, "Test Checkpoint", "2026-09-06");
    
    expect(snap.id).toBeDefined();
    expect(snap.date).toBe("2026-09-06");
    expect(snap.netWorth).toBe(1400000);
    expect(snap.totalAssets).toBe(1525000);
    expect(snap.totalLiabilities).toBe(125000);
    expect(snap.note).toBe("Test Checkpoint");
  });

  it("integrates into MELA AI tool registry", async () => {
    expect(toolRegistry.get_net_worth).toBeDefined();
    expect(toolRegistry.create_asset).toBeDefined();
    expect(toolRegistry.create_liability).toBeDefined();
    expect(toolRegistry.create_net_worth_snapshot).toBeDefined();

    const mockSession = { uid: "user_test_1", email: "test@mela.ai" };
    const netWorthResult = await executeToolSecurely(mockSession, "get_net_worth", {});
    expect(netWorthResult.currentNetWorth).toBeGreaterThan(0);
    expect(netWorthResult.totalAssets).toBeGreaterThan(0);
    expect(netWorthResult.debtToAssetRatio).toBeDefined();

    const assetResult = await executeToolSecurely(mockSession, "create_asset", {
      name: "Gold Coins",
      category: "Gold",
      amount: 50000,
    });
    expect(assetResult.success).toBe(true);
  });

  it("provides contextual domain data when querying MELA AI Assistant", async () => {
    const mockSession = { uid: "user_test_1", email: "test@mela.ai" };
    const contexts = await extractDomainContext(mockSession, "What is my current net worth and balance sheet?");
    
    const netWorthContext = contexts.find((c) => c.domain === "net-worth");
    expect(netWorthContext).toBeDefined();
    expect(netWorthContext?.summary).toContain("Current Net Worth");
  });
});

