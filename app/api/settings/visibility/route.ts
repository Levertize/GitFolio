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
    const { is_public } = await request.json();
    const supabase = createAdminSupabase();

    const { data, error } = await supabase
      .from("users")
      .update({
        is_public,
        updated_at: new Date().toISOString(),
      })
      .eq("id", session.user.id)
      .select("is_public, username, custom_slug")
      .single();

    if (error) throw error;

    // Invalidate Redis cache if setting to private
    if (is_public === false) {
      try {
        await redis.del(`github:stats:${session.user.id}`);
        // If there were any portfolio specific caches, we'd delete them here too.
        // For example: await redis.del(`portfolio:${data.username}`);
      } catch (redisError) {
        console.warn("Redis invalidation failed:", redisError);
      }
    }

    return NextResponse.json({ success: true, is_public: data.is_public });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
