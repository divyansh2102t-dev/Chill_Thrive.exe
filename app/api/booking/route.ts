import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      service,
      date,
      slotId,
      duration,
      couponCode,
      discountAmount,
      finalAmount,
      form: { name, phone, email, payment },
    } = body;

    /* ---------- VALIDATION ---------- */
    if (
      !service?.id ||
      !service?.title ||
      !date ||
      !slotId ||
      !duration ||
      !name ||
      !phone ||
      !email ||
      !payment ||
      finalAmount == null
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseServer();

    /* ---------- STORE BOOKING ---------- */
    const { error: dbError } = await supabase.from("bookings").insert({
      service_id: service.id,
      service_title: service.title, // denormalized snapshot
      slot_id: slotId,
      duration_minutes: duration,
      booking_date: date,
      customer_name: name,
      customer_phone: phone,
      customer_email: email,
      payment_method: payment,
      coupon_code: couponCode ?? null,
      discount_amount: discountAmount ?? 0,
      final_amount: finalAmount,
    });

    if (dbError) {
      console.error("DB ERROR:", dbError);
      throw dbError;
    }

    /* ---------- SEND CONFIRMATION EMAIL ---------- */
    const { error: emailError } = await resend.emails.send({
      from: "Bookings <onboarding@resend.dev>",
      to: email,
      subject: "Booking Confirmed",
      html: `
        <h2>Booking Confirmed</h2>

        <p><strong>Service:</strong> ${service.title}</p>
        <p><strong>Date:</strong> ${date}</p>
        <p><strong>Duration:</strong> ${duration} min</p>
        <p><strong>Payment Method:</strong> ${payment}</p>

        ${
          discountAmount
            ? `<p><strong>Discount:</strong> ₹${discountAmount}</p>`
            : ""
        }

        <p><strong>Amount to Pay (if cash):</strong> ₹${finalAmount}</p>

        <p>Thank you for booking with us.</p>
      `,
    });

    if (emailError) {
      console.error("EMAIL ERROR:", emailError);
      // booking is already stored — do not fail
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("BOOKING ERROR:", err);

    return NextResponse.json(
      { error: "Failed to create booking" },
      { status: 500 }
    );
  }
}
