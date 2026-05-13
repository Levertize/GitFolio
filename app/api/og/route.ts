import { NextResponse } from "next/server";

export async function GET(request: Request) {
  // Logic to generate OG image using Satori
  return new NextResponse("OG Image placeholder", { status: 200 });
}
