import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ message: "Books API v1 endpoint" });
}
