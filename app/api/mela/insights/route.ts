import { NextResponse } from "next/server";
import { generateMelaInsights } from "@/lib/mela/insights";

export async function GET() {
  const insights = await generateMelaInsights();
  return NextResponse.json({ insights });
}
