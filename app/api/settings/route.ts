import { auth } from "@/auth";
import { createAdminSupabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = createAdminSupabase();
    const { data, error } = await supabase
      .from("users")
      .select(`
        id, name, username, avatar_url, bio, custom_slug, is_public, 
        sync_frequency, accent_color, hidden_sections, excluded_repos,
        github_stats (synced_at, top_repos)
      `)
      .eq("id", session.user.id)
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
