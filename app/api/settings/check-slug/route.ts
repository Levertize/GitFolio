import { auth } from "@/auth";
import { createAdminSupabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug")?.toLowerCase();

  if (!slug) {
    return NextResponse.json({ error: "Slug is required" }, { status: 400 });
  }

  // 1. Reserved words validation
  const RESERVED_WORDS = ['admin', 'api', 'dashboard', 'settings', 'login', 'logout', 'notes', 'portfolio'];
  if (RESERVED_WORDS.includes(slug)) {
    return NextResponse.json({ available: false, message: "Reserved word" });
  }

  // 2. Format validation
  const slugRegex = /^[a-z0-9-]+$/;
  if (!slugRegex.test(slug)) {
    return NextResponse.json({ available: false, message: "Invalid format" });
  }

  // 3. Length validation
  if (slug.length < 3 || slug.length > 30) {
    return NextResponse.json({ available: false, message: "Length must be 3-30" });
  }

  try {
    const supabase = createAdminSupabase();

    // Check if any user (except the current one) has this slug OR this username
    // We check both custom_slug and username to prevent clashing with others' default profiles
    const { data: existingUser, error } = await supabase
      .from("users")
      .select("id")
      .or(`custom_slug.eq.${slug},username.eq.${slug}`)
      .neq("id", session.user.id)
      .maybeSingle();

    if (error) throw error;

    return NextResponse.json({ 
      available: !existingUser,
      message: existingUser ? "Already taken" : "Available"
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
