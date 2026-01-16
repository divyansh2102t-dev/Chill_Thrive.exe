import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const { code, serviceId, duration } = await req.json();

  if (!code) {
    return NextResponse.json({ valid: false });
  }

  const supabase = await createSupabaseServer();

  const { data, error } = await supabase
    .from("coupons")
    .select("code, discount_amount, is_active")
    .eq("code", code)
    .eq("is_active", true)
    .single();

  if (error || !data) {
    return NextResponse.json({ valid: false });
  }

  return NextResponse.json({
    valid: true,
    discountAmount: data.discount_amount,
  });
}
