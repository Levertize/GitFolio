import { auth } from "@/auth";
import { createAdminSupabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { contact_email, linkedin_url, instagram_url, twitter_url, custom_links } = body;
    
    const supabase = createAdminSupabase();

    const { data, error } = await supabase
      .from("users")
      .update({
        contact_email,
        linkedin_url,
        instagram_url,
        twitter_url,
        custom_links,
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
