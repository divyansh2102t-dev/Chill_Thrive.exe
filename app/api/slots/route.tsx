// app/api/slots/route.ts
import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");

  // Basic validation
  if (!date) {
    return NextResponse.json({ error: "Date required" }, { status: 400 });
  }

  const supabase = await createSupabaseServer();

  /**
   * We call the 'get_available_slots' RPC function.
   * This function internally:
   * 1. Checks the 'blocked_dates' table.
   * 2. Joins 'slot_timings' with 'bookings'.
   * 3. Calculates: Remaining = Total Capacity - Count(Bookings).
   */
  const { data, error } = await supabase.rpc("get_available_slots", {
    target_date: date,
  });

  if (error) {
    console.error("Booking Automation Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // If the date is blocked, the RPC returns null or empty. 
  // We return an empty array to disable slots in Step 02.
  return NextResponse.json({ slots: data || [] });
}