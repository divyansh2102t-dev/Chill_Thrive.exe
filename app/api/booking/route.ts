import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";
import nodemailer from "nodemailer";

// Initialize Nodemailer Transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

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
      time, // Extract time object containing the label
      form: { name, phone, email, payment },
      paymentDetails,
    } = body;

    /* ---------- VALIDATION ---------- */
    if (
      !service?.id ||
      !date ||
      !slotId ||
      !time?.label ||
      !name ||
      !phone ||
      !email ||
      !payment ||
      finalAmount == null
    ) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Parse the label "HH:MM - HH:MM" into separate strings for the DB
    const [startTime, endTime] = time.label.split(" - ").map((t: string) => `${t}:00`);

    // Generate the current timestamp in ISO format with the Kolkata offset
    const now = new Date();
    const kolkataOffset = 5.5 * 60 * 60 * 1000;
    const created_at_ist = new Date(now.getTime() + kolkataOffset).toISOString();

    const supabase = await createSupabaseServer();

    /* ---------- SLOT ID LOGIC & EXCEPTION HANDLING ---------- */
    
    let validSlotId = slotId;

    // 1. Check if this is a standard slot (exists in slot_timings)
    const { data: timingExists } = await supabase
      .from('slot_timings')
      .select('id')
      .eq('id', slotId)
      .maybeSingle();

    if (!timingExists) {
      // It is NOT a standard slot. It is likely a Schedule Exception.
      // We must set the Foreign Key to null for the bookings table.
      validSlotId = null;

      // 2. Check if it exists in schedule_exceptions
      const { data: exceptionData } = await supabase
        .from('schedule_exceptions')
        .select('id, slots_booked')
        .eq('id', slotId)
        .maybeSingle();

      // 3. If it is an exception, increment the booking count
      if (exceptionData) {
        const currentCount = exceptionData.slots_booked || 0;
        
        await supabase
          .from('schedule_exceptions')
          .update({ slots_booked: currentCount + 1 })
          .eq('id', slotId);
      }
    }

    /* ---------- STORE BOOKING ---------- */
    const { data: booking, error: dbError } = await supabase
    .from("bookings")
    .insert({
      service_id: service.id,
      service_title: service.title,
      slot_id: validSlotId, // Use the validated ID (either a real timing ID or null)
      duration_minutes: duration,
      booking_date: date,
      customer_name: name,
      customer_phone: phone,
      customer_email: email,
      payment_method: payment,
      coupon_code: couponCode ?? null,
      discount_amount: discountAmount ?? 0,
      final_amount: finalAmount,
      amount: finalAmount, 
      slot_start_time: startTime,
      slot_end_time: endTime,
      status: payment === "QR" ? "confirmed" : "pending",
      created_at: created_at_ist 
    })
    .select()
    .single();

    if (dbError) throw dbError;

    /* ---------- STORE PAYMENT LOG ---------- */
    if (payment === "QR" && paymentDetails && booking) {
      await supabase.from("payments").insert({
        booking_id: booking.id,
        razorpay_payment_id: paymentDetails.razorpay_payment_id,
        razorpay_order_id: paymentDetails.razorpay_order_id ?? null,
        razorpay_signature: paymentDetails.razorpay_signature ?? null,
        amount: finalAmount,
        status: "captured",
      });
    }

    /* ---------- SEND CONFIRMATION EMAIL ---------- */
    try {
      // Force Kolkata Timezone for "Booked on"
      const bookedAtIST = new Intl.DateTimeFormat('en-IN', {
        timeZone: 'Asia/Kolkata',
        dateStyle: 'full',
        timeStyle: 'medium'
      }).format(new Date());

      await transporter.sendMail({
        from: `"Chill Thrive Bookings" <${process.env.GMAIL_USER}>`,
        to: email,
        subject: `Your Recovery Session: ${service.title}`,
        html: `
          <div style="background-color: #F9F9F9; padding: 5px 2.5px; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
            <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 32px; overflow: hidden; border: 1px solid #E5E7EB;">
              <div style="padding: 40px 40px 20px 40px; text-align: center;">
                <h1 style="margin: 0; font-size: 32px; font-weight: 600; color: #000000;">
                  <span style="color: #289BD0;">Chill</span> Thrive
                </h1>
                <p style="color: #9CA3AF; font-size: 16px; margin-top: 8px; font-weight: 300;">Recovery Meets Resilience</p>
              </div>

              <div style="padding: 0 40px 40px 40px;">
                <div style="text-align: center; margin-bottom: 32px;">
                   <h2 style="font-size: 24px; font-weight: 600; margin: 0; color: #111827;">Booking Confirmed</h2>
                   <p style="color: #4B5563; font-size: 15px; margin-top: 10px;">Hi ${name}, your session is all set.</p>
                </div>

                <div style="background-color: #F9F9F9; border-radius: 24px; padding: 24px;">
                  <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td style="padding: 8px 0; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em;">Customer</td>
                      <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 600; text-align: right;">${name}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em;">Phone</td>
                      <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 600; text-align: right;">${phone}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em;">Service</td>
                      <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 600; text-align: right;">${service.title}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em;">Date</td>
                      <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 600; text-align: right;">${date}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em;">Reporting Time</td>
                      <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 600; text-align: right;">${time.label} IST</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em;">Duration</td>
                      <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 600; text-align: right;">${duration} Minutes</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em;">Payment</td>
                      <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 600; text-align: right;">${payment === "QR" ? "Online Pre-paid" : "Pay at Venue"}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em;">Coupon</td>
                      <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 600; text-align: right;">${couponCode || 'None'}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em;">Discount</td>
                      <td style="padding: 8px 0; color: #ef4444; font-size: 14px; font-weight: 600; text-align: right;">- ₹${discountAmount}</td>
                    </tr>
                    <tr style="border-top: 1px solid #E5E7EB;">
                      <td style="padding: 20px 0 0 0; color: #111827; font-size: 16px; font-weight: 600;">Total Amount</td>
                      <td style="padding: 20px 0 0 0; color: #289BD0; font-size: 22px; font-weight: 700; text-align: right;">₹${finalAmount}</td>
                    </tr>
                  </table>
                </div>

                <div style="margin-top: 32px; text-align: center;">
                  <a href="https://maps.app.goo.gl/b5VbhqHDnyrceMeQ8" 
                     style="display: inline-block; background-color: #289BD0; color: #ffffff; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 14px; letter-spacing: 0.1em; text-transform: uppercase;">
                    Get Directions →
                  </a>
                </div>

                <p style="color: #9CA3AF; font-size: 13px; line-height: 1.6; text-align: center; margin-top: 40px;">
                  Booked on: ${bookedAtIST}<br>
                  If you need to reschedule, reply to this email or contact us at ${process.env.ADMIN_EMAIL}.
                </p>
              </div>

              <div style="background-color: #F9F9F9; padding: 24px; text-align: center; border-top: 1px solid #E5E7EB;">
                <p style="color: #9CA3AF; font-size: 11px; margin: 0; text-transform: uppercase; letter-spacing: 0.1em;">
                  © ${new Date().getFullYear()} Chill Thrive. Verified Member Recovery.
                </p>
              </div>
            </div>
          </div>
        `,
      });
    } catch (emailError) {
      console.error("EMAIL ERROR:", emailError);
    }

    return NextResponse.json({ success: true, bookingId: booking.id });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to create booking" }, { status: 500 });
  }
}