import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { executeToolSecurely } from "@/lib/mela/tool-registry";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const session = await requireUser(req);
    const body = await req.json();
    const { action, params = {}, confirmed = false } = body;

    if (!action) {
      return NextResponse.json({ error: "Missing action name" }, { status: 400 });
    }

    const result = await executeToolSecurely(session, action, params, Boolean(confirmed));
    return NextResponse.json({ success: !result.error, ...result });
  } catch (error: any) {
    console.error("[Mela Actions API] Error:", error);
    return NextResponse.json({ error: error.message || "Action execution failed" }, { status: 500 });
  }
}
