import { auth } from "@/auth";
import { createAdminSupabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function PUT(
  request: Request,
  { params }: { params: { repoId: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { repoId } = params;
    const { custom_description, live_url, screenshot_url, is_featured } = await request.json();
    
    console.log(`🛠️ UPDATING REPO: ${repoId} for User: ${session.user.id}`);
    
    const supabase = createAdminSupabase();

    // The error 500 likely happens because the 'repos' table doesn't exist yet
    // or the 'github_stats' structure is different.
    const { data, error } = await supabase
      .from("repos")
      .update({
        custom_description,
        live_url,
        screenshot_url,
        is_featured,
      })
      .eq("id", repoId)
      .eq("user_id", session.user.id)
      .select();

    if (error) {
      console.error("❌ SUPABASE REPO UPDATE ERROR:", error.message, error.code);
      throw error;
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("🔥 REPO API FATAL ERROR:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
