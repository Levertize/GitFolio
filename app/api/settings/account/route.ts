import { auth } from "@/auth";
import { createAdminSupabase } from "@/lib/supabase";
import { redis } from "@/lib/redis";
import { NextResponse } from "next/server";

export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { custom_slug } = await request.json();
    const slug = custom_slug?.toLowerCase();

    // 1. Reserved words validation
    const RESERVED_WORDS = ['admin', 'api', 'dashboard', 'settings', 'login', 'logout', 'notes', 'portfolio'];
    if (RESERVED_WORDS.includes(slug)) {
      return NextResponse.json({ error: "Slug is a reserved word" }, { status: 400 });
    }

    // 2. Format validation
    const slugRegex = /^[a-z0-9-]+$/;
    if (!slugRegex.test(slug)) {
      return NextResponse.json({ error: "Invalid slug format" }, { status: 400 });
    }

    // 3. Length validation
    if (slug.length < 3 || slug.length > 30) {
      return NextResponse.json({ error: "Slug must be between 3 and 30 characters" }, { status: 400 });
    }

    const supabase = createAdminSupabase();

    // 4. Check uniqueness
    const { data: existingUser, error: checkError } = await supabase
      .from("users")
      .select("id")
      .or(`custom_slug.eq.${slug},username.eq.${slug}`)
      .neq("id", session.user.id)
      .maybeSingle();

    if (checkError) throw checkError;
    if (existingUser) {
      return NextResponse.json({ error: "Slug is already taken" }, { status: 400 });
    }

    // 5. Update database
    const { data, error } = await supabase
      .from("users")
      .update({
        custom_slug: slug,
        updated_at: new Date().toISOString(),
      })
      .eq("id", session.user.id)
      .select("custom_slug")
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, slug: data.custom_slug });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = createAdminSupabase();

    // 1. Delete notes
    await supabase.from("dev_notes").delete().eq("user_id", session.user.id);
    
    // 2. Delete github_stats
    await supabase.from("github_stats").delete().eq("user_id", session.user.id);

    // 3. Delete repos (if exists)
    await supabase.from("repos").delete().eq("user_id", session.user.id);

    // 4. Delete from Storage (portfolio-assets)
    const { data: files } = await supabase.storage
      .from("portfolio-assets")
      .list(session.user.id);

    if (files && files.length > 0) {
      const paths = files.map(f => `${session.user.id}/${f.name}`);
      await supabase.storage.from("portfolio-assets").remove(paths);
    }

    // 5. Delete user
    const { error: deleteError } = await supabase
      .from("users")
      .delete()
      .eq("id", session.user.id);

    if (deleteError) throw deleteError;

    // 6. Invalidate Redis
    try {
      await redis.del(`github:stats:${session.user.id}`);
      await redis.del(`portfolio:${session.user.id}`); // Added portfolio cache invalidation if any
    } catch (redisError) {
      console.warn("Redis invalidation failed:", redisError);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
