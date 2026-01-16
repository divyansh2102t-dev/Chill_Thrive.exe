"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Service } from "@/lib/types/service";

export type PricingResult = {
  baseAmount: number;
  discountAmount: number;
  finalAmount: number;
  couponCode?: string;
};

export default function DetailsStep({
  service,
  date,
  time,
  duration,
  form,
  setForm,
  onBack,
  onSuccess,
  onPricingChange
}: {
  service: Service;
  date: Date;
  time: { slotId: string; label: string };
  duration: number;
  form: {
    name: string;
    phone: string;
    email: string;
    payment: "QR" | "CASH";
  };
  setForm: (v: any) => void;
  onBack: () => void;
  onSuccess: (pricing: PricingResult) => void;
  onPricingChange: (pricing: {
  baseAmount: number;
  discountAmount: number;
  finalAmount: number;
  couponCode?: string;
}) => void;
}) {
  const baseAmount = service.price;

  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const [coupon, setCoupon] = useState("");
  const [checkingCoupon, setCheckingCoupon] = useState(false);
  const [couponValid, setCouponValid] = useState<boolean | null>(null);
  const [discount, setDiscount] = useState(0);

  /* ---------- COUPON VALIDATION ---------- */
  async function applyCoupon() {
    if (!coupon) return;

    setCheckingCoupon(true);
    setCouponValid(null);

    const res = await fetch("/api/coupon", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: coupon,
        serviceId: service.id,
        duration,
      }),
    });

    const data = await res.json();
    setCheckingCoupon(false);

    if (!data.valid) {
      setCouponValid(false);
      setDiscount(0);

      onPricingChange({
        baseAmount,
        discountAmount: 0,
        finalAmount: baseAmount,
      });
      return;
    }

    setCouponValid(true);
    setDiscount(data.discountAmount);

    onPricingChange({
      baseAmount,
      discountAmount: data.discountAmount,
      finalAmount: Math.max(baseAmount - data.discountAmount, 0),
      couponCode: coupon,
    });
  }

  /* ---------- CONFIRM BOOKING ---------- */
  async function confirmBooking() {
    setSubmitting(true);

    const finalAmount = Math.max(baseAmount - discount, 0);

    const res = await fetch("/api/booking", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        service,
        date: date.toISOString().split("T")[0],
        slotId: time.slotId,
        duration,
        couponCode: couponValid ? coupon : null,
        discountAmount: discount,
        finalAmount,
        form,
      }),
    });

    setSubmitting(false);
    if (!res.ok) return;

    setDone(true);

    setTimeout(() => {
      onSuccess({
        baseAmount,
        discountAmount: discount,
        finalAmount,
        couponCode: couponValid ? coupon : undefined,
      });
    }, 600);
  }

  return (
    <>
      <h2 className="text-2xl font-semibold mb-6">Your Details</h2>

      {/* USER INFO */}
      <div className="space-y-4">
        <Input
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <Input
          placeholder="Phone"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />
        <Input
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
      </div>

      {/* PAYMENT METHOD */}
      <div className="mt-6">
        <p className="text-sm font-medium mb-2">Payment Method</p>
        <div className="flex gap-3">
          {["QR", "CASH"].map((m) => (
            <Button
              key={m}
              variant={form.payment === m ? "default" : "outline"}
              onClick={() => setForm({ ...form, payment: m as "QR" | "CASH" })}
            >
              {m}
            </Button>
          ))}
        </div>
      </div>

      {/* COUPON */}
      <div className="mt-6">
        <p className="text-sm font-medium mb-2">Coupon (optional)</p>

        <div className="flex gap-2">
          <Input
            placeholder="Enter coupon code"
            value={coupon}
            onChange={(e) => setCoupon(e.target.value)}
            className={
              couponValid === true
                ? "border-green-500"
                : couponValid === false
                ? "border-red-500"
                : ""
            }
          />
          <Button
            variant="outline"
            onClick={applyCoupon}
            disabled={!coupon || checkingCoupon}
          >
            {checkingCoupon ? "Checking…" : "Apply"}
          </Button>
        </div>

        {couponValid === false && (
          <p className="text-xs text-red-600 mt-1">
            Invalid coupon
          </p>
        )}

        {couponValid === true && (
          <p className="text-xs text-green-600 mt-1">
            Coupon applied — ₹{discount} off
          </p>
        )}
      </div>

      {/* ACTIONS */}
      <div className="mt-8 flex gap-4">
        <Button variant="ghost" onClick={onBack}>
          Back
        </Button>

        <Button onClick={confirmBooking} disabled={submitting || done}>
          {submitting && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          {done ? "Confirmed" : "Confirm Booking"}
        </Button>
      </div>
    </>
  );
}
