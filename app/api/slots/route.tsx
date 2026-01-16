// app/api/slots/route.ts
import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");

  if (!date) {
    return NextResponse.json({ error: "Date required" }, { status: 400 });
  }

  const supabase = await createSupabaseServer();

  // 1. check blocked date
  const { data: blocked } = await supabase
    .from("blocked_dates")
    .select("id")
    .eq("blocked_date", date)
    .single();

  if (blocked) {
    return NextResponse.json({ slots: [] });
  }

  // 2. fetch enabled slots
  const { data: slots, error } = await supabase
    .from("slot_timings")
    .select("id,start_time,end_time,capacity")
    .eq("is_enabled", true)
    .order("start_time");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ slots });
}
