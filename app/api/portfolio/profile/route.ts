import { auth } from "@/auth";
import { createAdminSupabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { headline, portfolio_about, custom_logo_url } = await request.json();
    const supabase = createAdminSupabase();

    const { data, error } = await supabase
      .from("users")
      .update({
        headline,
        portfolio_about,
        custom_logo_url,
        updated_at: new Date().toISOString(),
      })
      .eq("id", session.user.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
