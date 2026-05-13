import { auth } from "@/auth";
import { createServerSupabase, createAdminSupabase } from "@/lib/supabase";
import { NextResponse } from "next/server";
import dayjs from "dayjs";

export async function GET(
  request: Request,
  { params }: { params: { date: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { date } = params;
  const supabase = createServerSupabase();

  const { data, error } = await supabase
    .from("dev_notes")
    .select("*")
    .eq("user_id", session.user.id)
    .eq("date", date)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({
      date,
      content: "",
      linked_commits: [],
    });
  }

  return NextResponse.json(data);
}

export async function POST(
  request: Request,
  { params }: { params: { date: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { date } = params;
  const { content } = await request.json();

  // Admin client to ensure we can read all stats and write notes
  const supabase = createAdminSupabase();

  // 1. Fetch recent activity from github_stats to link commits
  const { data: statsData } = await supabase
    .from("github_stats")
    .select("recent_activity")
    .eq("user_id", session.user.id)
    .single();

  const recentActivity = statsData?.recent_activity || [];
  const linkedCommits = recentActivity.filter((item: any) => 
    dayjs(item.date).format("YYYY-MM-DD") === date
  );

  // 2. Upsert the note
  const { data, error } = await supabase
    .from("dev_notes")
    .upsert({
      user_id: session.user.id,
      date,
      content,
      linked_commits: linkedCommits,
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id,date" })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function DELETE(
  request: Request,
  { params }: { params: { date: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { date } = params;
  const supabase = createServerSupabase();

  const { error } = await supabase
    .from("dev_notes")
    .delete()
    .eq("user_id", session.user.id)
    .eq("date", date);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
