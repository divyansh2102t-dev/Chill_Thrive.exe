"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { Service } from "@/lib/types/service";
import { supabase } from "@/lib/supabase/client";

import ProgressBar from "./components/Progressbar";
import ServiceStep from "./components/ServiceStep";
import DateTimeStep from "./components/DateTimeStep";
import DetailsStep from "./components/DetailsStep";

/* ---------------- TYPES ---------------- */

type ServiceSelection = {
  service: Service;
  duration: number;
};

type TimeSlot = {
  slotId: string;
  label: string;
};

type ConfirmationData = {
  service: Service;
  duration: number;
  date: string;
  time: TimeSlot;
  email: string;
  payment: "QR" | "CASH";
  baseAmount: number;
  discountAmount: number;
  finalAmount: number;
  couponCode?: string;
};

/* ---------------- HELPERS ---------------- */

function Row({
  label,
  value,
  valueClass = "font-medium",
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-600">{label}</span>
      <span className={valueClass}>{value}</span>
    </div>
  );
}

/* ---------------- COMPONENT ---------------- */

export default function BookingClient() {
  const searchParams = useSearchParams();
  const serviceIdFromUrl = searchParams.get("serviceId");
  const durationFromUrl = searchParams.get("duration");

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selection, setSelection] = useState<ServiceSelection | null>(null);
  const [date, setDate] = useState<Date | null>(null);
  const [time, setTime] = useState<TimeSlot | null>(null);

  const [pricing, setPricing] = useState<{
    baseAmount: number;
    discountAmount: number;
    finalAmount: number;
    couponCode?: string;
  } | null>(null);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    payment: "QR" as "QR" | "CASH",
  });

  const [confirmed, setConfirmed] = useState<ConfirmationData | null>(null);

  /* ---------------- RESET ---------------- */

  function resetBooking() {
    setStep(1);
    setSelection(null);
    setDate(null);
    setTime(null);
    setPricing(null);
    setConfirmed(null);
    setForm({
      name: "",
      phone: "",
      email: "",
      payment: "QR",
    });
  }

  /* ---------------- PRELOAD SERVICE FROM URL ---------------- */

  useEffect(() => {
    if (!serviceIdFromUrl || selection) return;

    const preloadService = async () => {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .eq("id", serviceIdFromUrl)
        .single();

      if (error || !data) return;

      setSelection({
        service: {
          id: data.id,
          slug: data.slug,
          title: data.title,
          type: data.type,

          mediaUrl: data.media_url,
          mediaType: data.media_type,
          ytUrl: data.yt_url ?? undefined,

          description: data.description,
          durationMinutes: data.duration_minutes ?? [],
          benefits: data.benefits ?? [],

          price: Number(data.price),
          originalPrice: data.original_price ?? undefined,
          currency: "INR",

          badge: data.badge ?? undefined,
          includedServices: data.included_services ?? undefined,

          isActive: data.is_active,
          createdAt: data.created_at,
        },
        duration: durationFromUrl
          ? Number(durationFromUrl)
          : data.duration_minutes?.[0],
      });

      setStep(2);
    };

    preloadService();
  }, [serviceIdFromUrl]);

  /* ---------------- DOWNSTREAM INVALIDATION ---------------- */

  useEffect(() => {
    if (!selection) return;
    setDate(null);
    setTime(null);
  }, [selection?.service.id]);

  useEffect(() => {
    if (!selection) return;
    setPricing({
      baseAmount: selection.service.price,
      discountAmount: 0,
      finalAmount: selection.service.price,
    });
  }, [selection]);

  /* ---------------- CONFIRMATION (FULL RESTORED) ---------------- */
/* ---------------- CONFIRMATION (TERMINAL) ---------------- */
if (confirmed) {
  return (
    <div className="max-w-xl mx-auto py-16 px-4 min-h-screen">
      <div className="border rounded-lg p-6 bg-green-50 space-y-6">
        <h2 className="text-2xl font-semibold">Booking Confirmed</h2>
        <p className="text-sm text-gray-700">
          Your booking has been successfully confirmed.
        </p>

        {/* SERVICE DETAILS */}
        <div className="border-t pt-4 space-y-2 text-sm">
          <Row label="Service" value={confirmed.service.title} />
          <Row label="Duration" value={`${confirmed.duration} min`} />
          <Row label="Date" value={confirmed.date} />
          <Row label="Time" value={confirmed.time.label} />
          <Row label="Payment Method" value={confirmed.payment} />
          <Row label="Confirmation sent to" value={confirmed.email} />
        </div>

        {/* AMOUNT SUMMARY */}
        <div className="border-t pt-4 space-y-2 text-sm">
          <Row label="Base Amount" value={`₹${confirmed.baseAmount}`} />
          {confirmed.discountAmount > 0 && (
            <Row
              label={`Discount${confirmed.couponCode ? ` (${confirmed.couponCode})` : ""}`}
              value={`-₹${confirmed.discountAmount}`}
              valueClass="text-green-700"
            />
          )}
          <Row
            label="Amount to Pay"
            value={`₹${confirmed.finalAmount}`}
            valueClass="font-semibold text-black"
          />
        </div>

        {/* QR / CASH SECTION */}
        {confirmed.payment === "QR" && (
          <div className="border-t pt-4">
            <p className="text-sm font-medium mb-2">Pay using QR Code</p>
            <div className="flex justify-center">
              <img
                src="/qr.png"
                alt="QR Code"
                className="w-40 h-40 object-contain"
              />
            </div>
            <p className="text-xs text-gray-600 text-center mt-2">
              Scan the QR to pay ₹{confirmed.finalAmount}
            </p>
          </div>
        )}

        {confirmed.payment === "CASH" && (
          <p className="text-xs text-gray-600">
            Please pay ₹{confirmed.finalAmount} in cash at the venue.
          </p>
        )}

        <button
          onClick={resetBooking}
          className="mt-6 w-full rounded-md border px-4 py-2 text-sm hover:bg-gray-100"
        >
          Book Another Service
        </button>
      </div>
    </div>
  );
}
  

//   if (confirmed) {
//     return (
//       <div className="max-w-xl mx-auto py-16 px-4">
//         <div className="border rounded-lg p-6 bg-green-50 space-y-6">
//           <h2 className="text-2xl font-semibold">Booking Confirmed</h2>

//           <div className="space-y-2 text-sm">
//             <Row label="Service" value={confirmed.service.title} />
//             <Row label="Duration" value={`${confirmed.duration} min`} />
//             <Row label="Date" value={confirmed.date} />
//             <Row label="Time" value={confirmed.time.label} />
//             <Row label="Payment" value={confirmed.payment} />
//             <Row label="Email" value={confirmed.email} />
//           </div>

//           <div className="border-t pt-4 space-y-2 text-sm">
//             <Row label="Base Amount" value={`₹${confirmed.baseAmount}`} />

//             {confirmed.discountAmount > 0 && (
//               <Row
//                 label={`Discount${
//                   confirmed.couponCode ? ` (${confirmed.couponCode})` : ""
//                 }`}
//                 value={`-₹${confirmed.discountAmount}`}
//                 valueClass="text-green-700"
//               />
//             )}

//             <Row
//               label="Amount to Pay"
//               value={`₹${confirmed.finalAmount}`}
//               valueClass="font-semibold"
//             />
//           </div>

//           {confirmed.payment === "QR" && (
//             <div className="pt-4">
//               <img src="/qr.png" className="w-40 mx-auto" />
//             </div>
//           )}

//           <button
//             onClick={resetBooking}
//             className="w-full border rounded-md py-2 text-sm"
//           >
//             Book Another Service
//           </button>
//         </div>
//       </div>
//     );
//   }

  /* ---------------- MAIN FLOW ---------------- */

  return (
    <div>
      <h1 className="text-3xl text-center py-10">Booking</h1>
      <div className="relative max-w-3xl mx-auto py-12 px-4 min-h-screen">
        <ProgressBar step={step} total={3} />

        {/* STEP 1 */}
        {step === 1 && !serviceIdFromUrl && (
          <ServiceStep
            onSelect={(data) => {
              setSelection(data);
              setStep(2);
            }}
          />
        )}

        {/* STEP 2 */}
        {step === 2 && selection && (
          <DateTimeStep
            date={date}
            time={time}
            onBack={() => setStep(1)}
            onNext={(d, t) => {
              setDate(d);
              setTime(t);
              setStep(3);
            }}
          />
        )}

        {/* STEP 3 */}
        {step === 3 && selection && date && time && (
          <DetailsStep
            service={selection.service}
            duration={selection.duration}
            date={date}
            time={time}
            form={form}
            setForm={setForm}
            onBack={() => {
              setTime(null); // 🔑 FIXED BACK BUG
              setStep(2);
            }}
            onPricingChange={(p) => setPricing(p)}
            onSuccess={(p) => {
              setConfirmed({
                service: selection.service,
                duration: selection.duration,
                date: date.toISOString().split("T")[0],
                time,
                email: form.email,
                payment: form.payment,
                baseAmount: p.baseAmount,
                discountAmount: p.discountAmount,
                finalAmount: p.finalAmount,
                couponCode: p.couponCode,
              });
            }}
          />
        )}

        {/* ---------------- STICKY SUMMARY (RESTORED) ---------------- */}
        {selection && step > 1 && (
          <div className="fixed bottom-4 right-4 z-50 border bg-white rounded-lg p-4 shadow w-64 space-y-1">
            <p className="text-sm font-medium">{selection.service.title}</p>
            <p className="text-xs">Duration: {selection.duration} min</p>

            {date && (
              <p className="text-xs">
                Date: {date.toISOString().split("T")[0]}
              </p>
            )}

            {time && <p className="text-xs">Time: {time.label}</p>}

            <div className="border-t pt-2 mt-2 text-xs space-y-1">
              <div className="flex justify-between">
                <span>Base</span>
                <span>₹{pricing?.baseAmount}</span>
              </div>

              {pricing?.discountAmount ? (
                <div className="flex justify-between text-green-700">
                  <span>Discount</span>
                  <span>-₹{pricing.discountAmount}</span>
                </div>
              ) : null}

              <div className="flex justify-between font-semibold">
                <span>Payable</span>
                <span>₹{pricing?.finalAmount}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
