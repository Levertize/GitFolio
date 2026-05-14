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
    const { accent_color, hidden_sections } = await request.json();
    const supabase = createAdminSupabase();

    const { error } = await supabase
      .from("users")
      .update({
        accent_color,
        hidden_sections,
        updated_at: new Date().toISOString(),
      })
      .eq("id", session.user.id);

    if (error) throw error;

    // Invalidate Redis cache
    try {
      await redis.del(`github:stats:${session.user.id}`);
    } catch (redisError) {
      console.warn("Redis invalidation failed:", redisError);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
