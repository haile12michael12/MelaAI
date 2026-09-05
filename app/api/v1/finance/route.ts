import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ message: "Finance API v1 endpoint" });
}
