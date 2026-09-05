import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    return NextResponse.json({ success: true, response: "Mela AI assistant response stub", body });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
