import { auth } from "@/auth";
import { getUserRepos } from "@/lib/github";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();

  if (!session || !session.accessToken || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const repos = await getUserRepos(session.accessToken);
    return NextResponse.json(repos);
  } catch (error: any) {
    console.error("Fetch Repos API Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch GitHub repositories" },
      { status: 500 }
    );
  }
}
