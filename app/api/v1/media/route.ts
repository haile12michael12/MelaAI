import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ message: "Media API v1 endpoint" });
}
