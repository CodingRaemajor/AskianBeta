import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  // Temporary stub
  return NextResponse.json(
    { error: "Ask endpoint not implemented on this copy." },
    { status: 501 }
  );
}
