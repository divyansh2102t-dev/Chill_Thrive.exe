import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { paymentResponse, ...bookingData } = body;

    // 1. Generate the expected signature
    // Formula: SHA256(order_id + "|" + payment_id, secret)
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(`${paymentResponse.razorpay_order_id}|${paymentResponse.razorpay_payment_id}`)
      .digest("hex");

    // 2. Compare signatures
    if (expectedSignature !== paymentResponse.razorpay_signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    // 3. If valid, save to Supabase
    // (Insert your supabase.from('bookings').insert(...) logic here)

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}