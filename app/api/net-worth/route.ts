import { NextRequest, NextResponse } from "next/server";
import {
  MelaNetWorthService,
  DEFAULT_ASSETS,
  DEFAULT_LIABILITIES,
  DEFAULT_SNAPSHOTS,
  AssetItem,
  LiabilityItem,
  NetWorthSnapshot,
} from "@/lib/finance/net-worth";

// In-memory / session store fallback
let assetsStore: AssetItem[] = [...DEFAULT_ASSETS];
let liabilitiesStore: LiabilityItem[] = [...DEFAULT_LIABILITIES];
let snapshotsStore: NetWorthSnapshot[] = [...DEFAULT_SNAPSHOTS];

export async function GET(req: NextRequest) {
  try {
    const summary = MelaNetWorthService.calculateSummary(assetsStore, liabilitiesStore, snapshotsStore);
    return NextResponse.json({
      summary,
      assets: assetsStore,
      liabilities: liabilitiesStore,
      snapshots: snapshotsStore,
    });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, item, id, note } = body;

    if (action === "add_asset") {
      const newAsset: AssetItem = {
        id: "ast_" + Date.now(),
        name: item.name,
        category: item.category,
        amount: Number(item.amount) || 0,
        institutionOrLocation: item.institutionOrLocation,
        notes: item.notes,
        updatedAt: new Date().toISOString().slice(0, 10),
      };
      assetsStore.unshift(newAsset);
    } else if (action === "update_asset") {
      assetsStore = assetsStore.map((a) => (a.id === id ? { ...a, ...item, updatedAt: new Date().toISOString().slice(0, 10) } : a));
    } else if (action === "delete_asset") {
      assetsStore = assetsStore.filter((a) => a.id !== id);
    } else if (action === "add_liability") {
      const newLiability: LiabilityItem = {
        id: "liab_" + Date.now(),
        name: item.name,
        category: item.category,
        amount: Number(item.amount) || 0,
        interestRate: Number(item.interestRate) || 0,
        monthlyPayment: Number(item.monthlyPayment) || 0,
        lender: item.lender,
        notes: item.notes,
        updatedAt: new Date().toISOString().slice(0, 10),
      };
      liabilitiesStore.unshift(newLiability);
    } else if (action === "update_liability") {
      liabilitiesStore = liabilitiesStore.map((l) => (l.id === id ? { ...l, ...item, updatedAt: new Date().toISOString().slice(0, 10) } : l));
    } else if (action === "delete_liability") {
      liabilitiesStore = liabilitiesStore.filter((l) => l.id !== id);
    } else if (action === "create_snapshot") {
      const snap = MelaNetWorthService.createSnapshot(assetsStore, liabilitiesStore, note);
      snapshotsStore.push(snap);
    }

    const summary = MelaNetWorthService.calculateSummary(assetsStore, liabilitiesStore, snapshotsStore);
    return NextResponse.json({
      success: true,
      summary,
      assets: assetsStore,
      liabilities: liabilitiesStore,
      snapshots: snapshotsStore,
    });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
