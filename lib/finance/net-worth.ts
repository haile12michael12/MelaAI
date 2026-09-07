import { CurrencyCode, formatCurrency } from "./intelligence";

export type AssetCategory =
  | "Cash"
  | "Bank Accounts"
  | "Investments"
  | "Crypto"
  | "Gold"
  | "Real Estate"
  | "Vehicles"
  | "Other Assets";

export type LiabilityCategory =
  | "Loans"
  | "Credit Card Debt"
  | "Personal Debt"
  | "Other Liabilities";

export interface AssetItem {
  id: string;
  name: string;
  category: AssetCategory;
  amount: number;
  currency?: CurrencyCode;
  institutionOrLocation?: string;
  notes?: string;
  updatedAt: string;
}

export interface LiabilityItem {
  id: string;
  name: string;
  category: LiabilityCategory;
  amount: number;
  currency?: CurrencyCode;
  interestRate?: number;
  monthlyPayment?: number;
  lender?: string;
  notes?: string;
  updatedAt: string;
}

export interface NetWorthSnapshot {
  id: string;
  date: string; // YYYY-MM-DD
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  assetBreakdown: Record<AssetCategory, number>;
  liabilityBreakdown: Record<LiabilityCategory, number>;
  note?: string;
}

export interface NetWorthSummary {
  currentNetWorth: number;
  totalAssets: number;
  totalLiabilities: number;
  debtToAssetRatio: number;
  monthlyChangeAmount: number;
  monthlyChangePercent: number;
  annualChangeAmount: number;
  annualChangePercent: number;
  assetAllocation: { category: AssetCategory; amount: number; percentage: number }[];
  liabilityAllocation: { category: LiabilityCategory; amount: number; percentage: number }[];
  snapshots: NetWorthSnapshot[];
}

export const ASSET_CATEGORIES: AssetCategory[] = [
  "Cash",
  "Bank Accounts",
  "Investments",
  "Crypto",
  "Gold",
  "Real Estate",
  "Vehicles",
  "Other Assets",
];

export const LIABILITY_CATEGORIES: LiabilityCategory[] = [
  "Loans",
  "Credit Card Debt",
  "Personal Debt",
  "Other Liabilities",
];

export const DEFAULT_ASSETS: AssetItem[] = [
  {
    id: "a1",
    name: "Cash in Hand & Telebirr",
    category: "Cash",
    amount: 18500,
    institutionOrLocation: "Telebirr / Wallet",
    updatedAt: "2026-08-30",
  },
  {
    id: "a2",
    name: "Commercial Bank of Ethiopia (CBE) Savings",
    category: "Bank Accounts",
    amount: 145000,
    institutionOrLocation: "CBE Main Branch",
    updatedAt: "2026-08-30",
  },
  {
    id: "a3",
    name: "Awash Bank Fixed Deposit",
    category: "Bank Accounts",
    amount: 80000,
    institutionOrLocation: "Awash Bank",
    updatedAt: "2026-08-30",
  },
  {
    id: "a4",
    name: "Equb & Local Shares Portfolio",
    category: "Investments",
    amount: 120000,
    institutionOrLocation: "Addis Chamber / Local",
    updatedAt: "2026-08-30",
  },
  {
    id: "a5",
    name: "Crypto Assets (USDT/BTC)",
    category: "Crypto",
    amount: 45000,
    institutionOrLocation: "Self-Custody Cold Wallet",
    updatedAt: "2026-08-30",
  },
  {
    id: "a6",
    name: "Physical Gold Jewelry & Bullion",
    category: "Gold",
    amount: 95000,
    institutionOrLocation: "Safe Deposit",
    updatedAt: "2026-08-30",
  },
  {
    id: "a7",
    name: "Residential Property Equity (Addis Ababa)",
    category: "Real Estate",
    amount: 1650000,
    institutionOrLocation: "Bole Subcity",
    updatedAt: "2026-08-30",
  },
  {
    id: "a8",
    name: "Toyota Vitz / Utility Vehicle",
    category: "Vehicles",
    amount: 420000,
    institutionOrLocation: "Personal",
    updatedAt: "2026-08-30",
  },
];

export const DEFAULT_LIABILITIES: LiabilityItem[] = [
  {
    id: "l1",
    name: "Bank Vehicle Loan",
    category: "Loans",
    amount: 110000,
    interestRate: 14.5,
    monthlyPayment: 8500,
    lender: "CBE Bank",
    updatedAt: "2026-08-30",
  },
  {
    id: "l2",
    name: "Personal Family Loan (Edir / Friend)",
    category: "Personal Debt",
    amount: 25000,
    interestRate: 0,
    monthlyPayment: 5000,
    lender: "Family Member",
    updatedAt: "2026-08-30",
  },
  {
    id: "l3",
    name: "Commercial Credit Card",
    category: "Credit Card Debt",
    amount: 12000,
    interestRate: 18.0,
    monthlyPayment: 2500,
    lender: "Visa / Bank",
    updatedAt: "2026-08-30",
  },
];

export const DEFAULT_SNAPSHOTS: NetWorthSnapshot[] = [
  {
    id: "s1",
    date: "2025-09-01",
    totalAssets: 2150000,
    totalLiabilities: 210000,
    netWorth: 1940000,
    assetBreakdown: {
      Cash: 12000,
      "Bank Accounts": 160000,
      Investments: 80000,
      Crypto: 30000,
      Gold: 75000,
      "Real Estate": 1400000,
      Vehicles: 393000,
      "Other Assets": 0,
    },
    liabilityBreakdown: {
      Loans: 160000,
      "Credit Card Debt": 15000,
      "Personal Debt": 35000,
      "Other Liabilities": 0,
    },
    note: "Annual Benchmark 2025",
  },
  {
    id: "s2",
    date: "2026-07-31",
    totalAssets: 2490000,
    totalLiabilities: 160000,
    netWorth: 2330000,
    assetBreakdown: {
      Cash: 16000,
      "Bank Accounts": 210000,
      Investments: 110000,
      Crypto: 40000,
      Gold: 90000,
      "Real Estate": 1614000,
      Vehicles: 410000,
      "Other Assets": 0,
    },
    liabilityBreakdown: {
      Loans: 120000,
      "Credit Card Debt": 14000,
      "Personal Debt": 26000,
      "Other Liabilities": 0,
    },
    note: "End of July 2026",
  },
  {
    id: "s3",
    date: "2026-08-31",
    totalAssets: 2573500,
    totalLiabilities: 147000,
    netWorth: 2426500,
    assetBreakdown: {
      Cash: 18500,
      "Bank Accounts": 225000,
      Investments: 120000,
      Crypto: 45000,
      Gold: 95000,
      "Real Estate": 1650000,
      Vehicles: 420000,
      "Other Assets": 0,
    },
    liabilityBreakdown: {
      Loans: 110000,
      "Credit Card Debt": 12000,
      "Personal Debt": 25000,
      "Other Liabilities": 0,
    },
    note: "August 2026 Close",
  },
];

export class MelaNetWorthService {
  /**
   * Deterministic calculation of Net Worth, Asset Allocations, and Historical Deltas.
   */
  static calculateSummary(
    assets: AssetItem[],
    liabilities: LiabilityItem[],
    snapshots: NetWorthSnapshot[] = []
  ): NetWorthSummary {
    const totalAssets = assets.reduce((sum, a) => sum + (a.amount || 0), 0);
    const totalLiabilities = liabilities.reduce((sum, l) => sum + (l.amount || 0), 0);
    const currentNetWorth = totalAssets - totalLiabilities;
    const debtToAssetRatio = totalAssets > 0 ? (totalLiabilities / totalAssets) * 100 : 0;

    // Asset allocation
    const assetMap: Record<AssetCategory, number> = {
      Cash: 0,
      "Bank Accounts": 0,
      Investments: 0,
      Crypto: 0,
      Gold: 0,
      "Real Estate": 0,
      Vehicles: 0,
      "Other Assets": 0,
    };
    for (const a of assets) {
      if (assetMap[a.category] !== undefined) {
        assetMap[a.category] += a.amount || 0;
      } else {
        assetMap["Other Assets"] += a.amount || 0;
      }
    }

    const assetAllocation = ASSET_CATEGORIES.map((cat) => ({
      category: cat,
      amount: assetMap[cat],
      percentage: totalAssets > 0 ? (assetMap[cat] / totalAssets) * 100 : 0,
    })).filter((item) => item.amount > 0);

    // Liability allocation
    const liabilityMap: Record<LiabilityCategory, number> = {
      Loans: 0,
      "Credit Card Debt": 0,
      "Personal Debt": 0,
      "Other Liabilities": 0,
    };
    for (const l of liabilities) {
      if (liabilityMap[l.category] !== undefined) {
        liabilityMap[l.category] += l.amount || 0;
      } else {
        liabilityMap["Other Liabilities"] += l.amount || 0;
      }
    }

    const liabilityAllocation = LIABILITY_CATEGORIES.map((cat) => ({
      category: cat,
      amount: liabilityMap[cat],
      percentage: totalLiabilities > 0 ? (liabilityMap[cat] / totalLiabilities) * 100 : 0,
    })).filter((item) => item.amount > 0);

    // Historical Changes: Compare with previous month and previous year snapshots
    const sortedSnapshots = [...snapshots].sort((a, b) => a.date.localeCompare(b.date));

    let monthlyChangeAmount = 0;
    let monthlyChangePercent = 0;
    let annualChangeAmount = 0;
    let annualChangePercent = 0;

    if (sortedSnapshots.length >= 1) {
      const lastSnapshot = sortedSnapshots[sortedSnapshots.length - 1];
      monthlyChangeAmount = currentNetWorth - lastSnapshot.netWorth;
      monthlyChangePercent = lastSnapshot.netWorth > 0 ? (monthlyChangeAmount / lastSnapshot.netWorth) * 100 : 0;

      // Find snapshot from ~1 year ago (earliest snapshot or first)
      const oneYearAgo = sortedSnapshots[0];
      annualChangeAmount = currentNetWorth - oneYearAgo.netWorth;
      annualChangePercent = oneYearAgo.netWorth > 0 ? (annualChangeAmount / oneYearAgo.netWorth) * 100 : 0;
    }

    return {
      currentNetWorth,
      totalAssets,
      totalLiabilities,
      debtToAssetRatio,
      monthlyChangeAmount,
      monthlyChangePercent,
      annualChangeAmount,
      annualChangePercent,
      assetAllocation,
      liabilityAllocation,
      snapshots: sortedSnapshots,
    };
  }

  /**
   * Capture a new snapshot from current assets and liabilities.
   */
  static createSnapshot(
    assets: AssetItem[],
    liabilities: LiabilityItem[],
    note?: string,
    customDate?: string
  ): NetWorthSnapshot {
    const totalAssets = assets.reduce((sum, a) => sum + (a.amount || 0), 0);
    const totalLiabilities = liabilities.reduce((sum, l) => sum + (l.amount || 0), 0);
    const netWorth = totalAssets - totalLiabilities;

    const assetBreakdown: Record<AssetCategory, number> = {
      Cash: 0,
      "Bank Accounts": 0,
      Investments: 0,
      Crypto: 0,
      Gold: 0,
      "Real Estate": 0,
      Vehicles: 0,
      "Other Assets": 0,
    };
    assets.forEach((a) => {
      assetBreakdown[a.category] = (assetBreakdown[a.category] || 0) + (a.amount || 0);
    });

    const liabilityBreakdown: Record<LiabilityCategory, number> = {
      Loans: 0,
      "Credit Card Debt": 0,
      "Personal Debt": 0,
      "Other Liabilities": 0,
    };
    liabilities.forEach((l) => {
      liabilityBreakdown[l.category] = (liabilityBreakdown[l.category] || 0) + (l.amount || 0);
    });

    return {
      id: "snap_" + Date.now(),
      date: customDate || new Date().toISOString().slice(0, 10),
      totalAssets,
      totalLiabilities,
      netWorth,
      assetBreakdown,
      liabilityBreakdown,
      note: note || "Manual Checkpoint",
    };
  }
}
