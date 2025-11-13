import { NextResponse } from "next/server";

export async function GET() {
  // Temporary stub config
  return NextResponse.json({
    ok: true,
    message: "Config endpoint stub."
  });
}
