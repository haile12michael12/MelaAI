import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { melaSearch } from "@/lib/mela/search";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? "";
  return NextResponse.json({ query: q, results: [] });
  const session = await requireUser(req).catch(() => null);
  const searchOutput = await melaSearch(q, session);
  return NextResponse.json(searchOutput);
}
