import { NextResponse } from "next/server";

export async function GET(request: Request) {
  // Callback logic for OAuth
  return NextResponse.json({ message: "OAuth Callback" });
}
