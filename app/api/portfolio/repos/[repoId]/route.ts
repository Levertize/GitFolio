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
    const supabase = createAdminSupabase();

    // In this app, repos might be stored in github_stats as JSONB or a separate table.
    // Based on the prompt, we are adding columns to a 'repos' table.
    // Let's assume a 'repos' table exists as per the schema requirements.

    const { data, error } = await supabase
      .from("repos")
      .update({
        custom_description,
        live_url,
        screenshot_url,
        is_featured,
      })
      .eq("id", repoId)
      .eq("user_id", session.user.id) // Security check
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
