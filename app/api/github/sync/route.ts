import { auth } from "@/auth";
import { syncUserData } from "@/lib/github";
import { NextResponse } from "next/server";

export async function POST() {
  const session = await auth();

  if (!session || !session.accessToken || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await syncUserData(session.user.id, session.accessToken);
    return NextResponse.json({ 
      message: "Sync successful",
      data: {
        ...data,
        // Ensure UI gets activity even if DB fallback happened
        recent_activity: data.recent_activity || []
      }
    });
  } catch (error: any) {
    console.error("Sync API Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to sync GitHub data" },
      { status: 500 }
    );
  }
}
