import { auth } from "@/auth";
import { createAdminSupabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { sync_frequency, excluded_repos } = await request.json();
    const supabase = createAdminSupabase();

    const { error } = await supabase
      .from("users")
      .update({
        sync_frequency,
        excluded_repos,
        updated_at: new Date().toISOString(),
      })
      .eq("id", session.user.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
