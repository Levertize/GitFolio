import { auth } from "@/auth";
import { createServerSupabase } from "@/lib/supabase";
import { NextResponse } from "next/server";
import dayjs from "dayjs";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const month = searchParams.get("month") || dayjs().format("YYYY-MM");
  
  const startDate = dayjs(month).startOf("month").format("YYYY-MM-DD");
  const endDate = dayjs(month).endOf("month").format("YYYY-MM-DD");

  const supabase = createServerSupabase();

  const { data, error } = await supabase
    .from("dev_notes")
    .select("id, date, content")
    .eq("user_id", session.user.id)
    .gte("date", startDate)
    .lte("date", endDate);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const formattedNotes = data.map((note) => ({
    id: note.id,
    date: note.date,
    content_preview: note.content ? note.content.substring(0, 50) + (note.content.length > 50 ? "..." : "") : "",
    has_content: !!note.content,
  }));

  return NextResponse.json(formattedNotes);
}
