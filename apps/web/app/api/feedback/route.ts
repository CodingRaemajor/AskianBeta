import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  console.log("Feedback (stub):", body);
  return NextResponse.json({ ok: true, message: "Feedback received (stub)." });
}