import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await requireUser(req);
    return NextResponse.json({ conversations: [] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}
