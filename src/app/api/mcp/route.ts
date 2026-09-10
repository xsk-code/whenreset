import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json(
    { error: "MCP protocol endpoint has been discontinued." },
    { status: 404 }
  );
}

export async function POST() {
  return NextResponse.json(
    { error: "MCP protocol endpoint has been discontinued." },
    { status: 404 }
  );
}
