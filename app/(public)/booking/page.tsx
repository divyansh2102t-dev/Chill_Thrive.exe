"use client";

import { useEffect, useState } from "react";
import type { Service } from "@/lib/types/service";

import ProgressBar from "./components/Progressbar";
import ServiceStep from "./components/ServiceStep";
import DateTimeStep from "./components/DateTimeStep";
import DetailsStep from "./components/DetailsStep";

import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";


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
  time: {
    slotId: string;
    label: string;
  };
  email: string;
  payment: "QR" | "CASH";
  baseAmount: number;
  discountAmount: number;
  finalAmount: number;
  couponCode?: string;
};

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

export default function BookingPage() {
  /* ---------------- STATE ---------------- */

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

  /* ---------------- RESET LOGIC ---------------- */

  function resetBooking() {
    setStep(1);
    setSelection(null);
    setDate(null);
    setTime(null);
    setForm({
      name: "",
      phone: "",
      email: "",
      payment: "QR",
    });
    setConfirmed(null);
  }

  /* ---------------- SAFETY NET ---------------- */
  // If service changes, invalidate downstream state
  useEffect(() => {
  if (!serviceIdFromUrl || selection) return;

  const preloadService = async () => {
    const { data, error } = await supabase
        .from("services")
        .select("*")
        .eq("id", serviceIdFromUrl)
        .single();

      if (error || !data) {
        console.error("Failed to preload service", error);
        return;
      }

      setSelection({
        service: {
          ...data,
          durationMinutes: data.duration_minutes ?? [],
        },
        duration: durationFromUrl
          ? Number(durationFromUrl)
          : data.duration_minutes?.[0],
      });

      setStep(2); // 🚀 skip service step
    };

    preloadService();
  }, [serviceIdFromUrl]);


  useEffect(() => {
    if (selection) {
      setDate(null);
      setTime(null);
    }
  }, [selection?.service.id]);

  useEffect(() => {
    if (selection) {
      setPricing({
        baseAmount: selection.service.price,
        discountAmount: 0,
        finalAmount: selection.service.price,
      });
    }
  }, [selection]);

  

  /* ---------------- CONFIRMATION (TERMINAL) ---------------- */

  if (confirmed) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4">
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
                label={`Discount${
                  confirmed.couponCode ? ` (${confirmed.couponCode})` : ""
                }`}
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

  /* ---------------- MAIN FLOW ---------------- */

  return (
    <div className="relative max-w-3xl mx-auto py-12 px-4">
      <ProgressBar step={step} total={3} />

      {/* STEP 1 — SERVICE */}
      {step === 1 && !serviceIdFromUrl && (
        <ServiceStep
          onSelect={(data) => {
            setSelection(data);
            setDate(null);
            setTime(null);
            setStep(2);
          }}
        />
      )}

      {/* STEP 2 — DATE & TIME */}
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

      {/* STEP 3 — DETAILS */}
      {step === 3 && selection && date && time && (
        <DetailsStep
          service={selection.service}
          duration={selection.duration}
          date={date}
          time={time}
          form={form}
          setForm={setForm}
          onBack={() => {
            setTime(null);
            setStep(2);
          }}
          onPricingChange={(p) => setPricing(p)}
          onSuccess={(pricing) => {
            setPricing(pricing);
            setConfirmed({
              service: selection.service,
              duration: selection.duration,
              date: date.toISOString().split("T")[0],
              time,
              email: form.email,
              payment: form.payment,

              // ✅ PRICING (CRITICAL)
              baseAmount: pricing.baseAmount,
              discountAmount: pricing.discountAmount,
              finalAmount: pricing.finalAmount,
              couponCode: pricing.couponCode,
            });
          }}
        />
      )}

      {/* ---------------- STICKY SUMMARY ---------------- */}
      {/* ---------------- STICKY SUMMARY ---------------- */}
      {selection && step > 1 && (
        <div className="fixed bottom-4 right-4 z-50 border bg-white rounded-lg p-4 shadow w-64 space-y-1">
          <p className="text-sm font-medium">{selection.service.title}</p>

          <p className="text-xs text-gray-600">
            Duration: {selection.duration} min
          </p>

          {date && (
            <p className="text-xs text-gray-600">
              Date: {date.toISOString().split("T")[0]}
            </p>
          )}

          {time && <p className="text-xs text-gray-600">Time: {time.label}</p>}

          <div className="border-t pt-2 mt-2 text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-500">Base</span>
              <span>₹{pricing?.baseAmount ?? selection.service.price}</span>
            </div>

            {pricing?.discountAmount ? (
              <div className="flex justify-between text-green-700">
                <span>
                  Discount{pricing.couponCode ? ` (${pricing.couponCode})` : ""}
                </span>
                <span>-₹{pricing.discountAmount}</span>
              </div>
            ) : null}

            <div className="flex justify-between font-semibold text-sm">
              <span>Payable</span>
              <span>₹{pricing?.finalAmount ?? selection.service.price}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
