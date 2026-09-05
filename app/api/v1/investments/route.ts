import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ message: "Investments API v1 endpoint" });
}
