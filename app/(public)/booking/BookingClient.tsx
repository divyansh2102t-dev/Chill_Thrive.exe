"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import type { Service } from "@/lib/types/service";
import { supabase } from "@/lib/supabase/client";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle2, Clock, Calendar as CalIcon, X } from "lucide-react";
import FullPageLoader from "@/components/FullPageLoader";

function formatLocalDate(date: Date) {
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - (offset * 60 * 1000));
  return localDate.toISOString().split('T')[0];
}

function Row({ label, value, valueClass = "font-medium" }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-black/5 last:border-0">
      <span className="text-gray-500 text-sm uppercase tracking-widest font-bold">{label}</span>
      <span className={valueClass}>{value}</span>
    </div>
  );
}

function ProgressBar({ step, total }: { step: number; total: number }) {
  return (
    <div className="max-w-[1080px] mx-auto mb-16 px-6">
      <div className="h-[2px] bg-[#F9F9F9] w-full relative">
        <div
          className="h-[2px] bg-[#289BD0] transition-all duration-700 ease-in-out"
          style={{ width: `${(step / total) * 100}%` }}
        />
      </div>
      <div className="flex justify-between mt-4">
          {[1, 2, 3].map((s) => (
            <span key={s} className={`text-[10px] font-black tracking-[0.3em] uppercase ${step >= s ? 'text-[#289BD0]' : 'text-gray-300'}`}>
              Step 0{s}
            </span>
          ))}
      </div>
    </div>
  );
}

const loadRazorpay = () => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

/*STEP 1: SERVICE*/

function ServiceStep({ onSelect }: { onSelect: (data: { service: Service; duration: number; price: number }) => void }) {
  const [services, setServices] = useState<Service[]>([]);
  const [selectedDurations, setSelectedDurations] = useState<Record<string, number>>({});
  const searchParams = useSearchParams();

  useEffect(() => {
    supabase.from("services").select("*").eq("is_active", true).then(({ data }) => {
      const normalized = data?.map((s: any) => ({ 
        ...s, 
        durationMinutes: s.duration_minutes ?? [],
        prices: s.prices ?? [] 
      })) ?? [];
      
      setServices(normalized);

      // --- AUTO-SELECT LOGIC ---
      const urlServiceId = searchParams.get("serviceId");
      const urlDuration = searchParams.get("duration");

      if (urlServiceId && normalized.length > 0) {
        const targetService = normalized.find(s => s.id === urlServiceId);
        
        if (targetService) {
          // Convert URL duration to number, fallback to first available duration
          const durationToSet = urlDuration ? parseInt(urlDuration) : targetService.durationMinutes[0];
          const durationIndex = targetService.durationMinutes.indexOf(durationToSet);
          
          // Verify duration exists for this service
          if (durationIndex !== -1) {
            const currentPrice = targetService.prices[durationIndex] ?? targetService.prices[0] ?? 0;
            
            // Execute selection automatically
            onSelect({ 
              service: targetService, 
              duration: durationToSet, 
              price: currentPrice 
            });
          }
        }
      }
    });
  }, [searchParams, onSelect]);

  return (
    <div className="space-y-12">
      <h2 className="text-5xl font-bold tracking-tight text-center">Choose</h2>
      <div className="grid grid-cols-1 gap-6 max-w-4xl mx-auto">
        {services.map((s) => {
          const durations = s.durationMinutes;
          const selectedDuration = selectedDurations[s.id] ?? durations[0];
          const durationIndex = durations.indexOf(selectedDuration);
          const currentPrice = s.prices?.[durationIndex] ?? s.prices?.[0] ?? 0;

          return (
            <div key={s.id} className="bg-[#F9F9F9] rounded-[40px] p-8 md:p-10 flex flex-col md:flex-row justify-between items-center gap-8 group hover:bg-[#F0F9FF] transition-colors duration-500">
              <div className="flex-1 space-y-4 text-center md:text-left">
                <h3 className="text-3xl font-bold">{s.title}</h3>
                <div className="flex flex-wrap justify-center md:justify-start gap-3">
                  {durations.map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setSelectedDurations(prev => ({ ...prev, [s.id]: d }))}
                      className={`px-4 py-2 rounded-xl text-xs font-bold tracking-widest transition-all ${
                        selectedDuration === d ? "bg-black text-white" : "bg-white text-gray-400 hover:text-black"
                      }`}
                    >
                      {d} MIN
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex flex-col items-center md:items-end gap-4">
                <p className="text-4xl font-light">₹{currentPrice}</p>
                <Button 
                  onClick={() => onSelect({ service: s, duration: selectedDuration, price: currentPrice })}
                  className="bg-[#289BD0] hover:bg-black text-white px-10 py-6 rounded-2xl text-lg font-bold transition-all"
                >
                  Select
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/*STEP 2: DATE/TIME */
function DateTimeStep({ date, time, service, onBack, onNext }: any) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(date ?? new Date());
  const [selectedTime, setSelectedTime] = useState(time);
  const [slots, setSlots] = useState<any[]>([]);
  const [blockedDates, setBlockedDates] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchBlocked = async () => {
      const { data } = await supabase.from("blocked_dates").select("blocked_date");
      if (data) setBlockedDates(data.map(d => d.blocked_date));
    };
    fetchBlocked();
  }, []);

  useEffect(() => {
    if (!selectedDate || !service) return;

    const fetchSlots = async () => {
      setLoading(true);
      const dateStr = formatLocalDate(selectedDate);
      try {
        const { data, error } = await supabase.rpc('get_service_slots', {
          query_date: dateStr,
          query_service_id: service.id
        });
        if (error) throw error;
        setSlots(data || []);
      } catch (err) {
        console.error("Failed to fetch slots", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSlots();
  }, [selectedDate, service]);

  // Filter slots logic moved here so we can check length before rendering
  const filteredSlots = slots.filter((slot) => {
    if (!selectedDate) return false;
    const now = new Date();
    
    // Get current Kolkata Time (HH:mm:ss)
    const kolkataTime = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hour12: false,
    }).format(now);

    // Check if the user has selected "Today"
    const isToday = formatLocalDate(selectedDate) === formatLocalDate(now);
    
    // If it's today, only show slots that haven't started yet
    if (isToday) {
      return slot.start_time > kolkataTime;
    }
    
    // If it's a future date, show all slots
    return true;
  });

  return (
    <div className="space-y-12">
      <h2 className="text-5xl font-bold tracking-tight text-center">Select Reporting Time</h2>
      <div className="flex flex-col lg:flex-row gap-12 items-start justify-center">
        <div className="bg-[#F9F9F9] p-8 rounded-[40px] shadow-sm">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          disabled={(d) => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            // 1. Disable past dates
            const isPast = d < today;

            // 2. Disable dates beyond 3 months from today
            const maxDate = new Date();
            maxDate.setMonth(today.getMonth() + 3);
            const isBeyondRange = d > maxDate;

            // 3. Disable explicitly blocked dates from Supabase
            const isBlocked = blockedDates.includes(formatLocalDate(d));

            return isPast || isBeyondRange || isBlocked;
          }}
          className="rounded-md border-none"
        />
        </div>

        <div className="flex-1 w-full max-w-md space-y-6">
          <div className="grid grid-cols-1 gap-3">
            {loading ? (
               <div className="flex justify-center py-10"><Loader2 className="animate-spin text-[#289BD0]" /></div>
            ) : !selectedDate ? (
               <p className="text-center text-gray-400 py-10">Select a date to view available slots.</p>
            ) : filteredSlots.length === 0 ? (
               <p className="text-center text-gray-400 py-10">Slots not available for selected date.</p>
            ) : (
              filteredSlots.map((slot) => {
                const label = `${slot.start_time.slice(0, 5)} - ${slot.end_time.slice(0, 5)}`;
                const active = selectedTime?.slotId === slot.slot_id;
                const isFull = slot.remaining_capacity <= 0;

                return (
                  <button
                    key={slot.slot_id}
                    disabled={isFull}
                    onClick={() => setSelectedTime({ slotId: slot.slot_id, label })}
                    className={`p-6 rounded-[24px] text-left transition-all border-2 flex justify-between items-center ${
                      active ? "border-[#289BD0] bg-white shadow-lg scale-[1.02]" : 
                      isFull ? "opacity-50 grayscale cursor-not-allowed bg-gray-100 border-transparent" :
                      "border-transparent bg-[#F9F9F9] hover:bg-gray-100"
                    }`}
                  >
                    <span className={`text-xl font-medium ${active ? 'text-[#289BD0]' : 'text-black'}`}>{label}</span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        {isFull ? 'Fully Booked' : `${slot.remaining_capacity} spots left`}
                    </span>
                  </button>
                )
              })
            )}
          </div>
          <div className="flex gap-4 pt-6">
            <Button variant="ghost" onClick={onBack} className="flex-1 rounded-2xl h-14">Back</Button>
            <Button 
              disabled={!selectedDate || !selectedTime}
              onClick={() => onNext(selectedDate, selectedTime)}
              className="flex-[2] bg-black text-white rounded-2xl h-14 text-lg font-bold"
            >
              Next Step
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
/* STEP 3: DETAILS */
function DetailsStep({ selection, date, time, form, setForm, onBack, onSuccess, onPricingChange }: any) {
  const [submitting, setSubmitting] = useState(false);
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  
  // New state for field errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Refs for focusing
  const phoneRef = import("react").then(() => null); 
  const inputRefs = {
    phone: useRef<HTMLInputElement>(null),
    email: useRef<HTMLInputElement>(null),
    otp: useRef<HTMLInputElement>(null)
  };

  const searchParams = useSearchParams();
  const { service, duration, price } = selection;
  const finalAmount = price - discount;

  const applyCouponLogic = useCallback(async (codeToApply: string) => {
    if (!codeToApply || codeToApply.trim() === "") return 0;
    try {
      const res = await fetch("/api/coupon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: codeToApply.toUpperCase(), serviceId: service.id, duration }),
      });
      const data = await res.json();
      
      if (data.valid) {
        setDiscount(data.discountAmount);
        setCoupon(codeToApply.toUpperCase());
        onPricingChange({ 
          baseAmount: price, 
          discountAmount: data.discountAmount, 
          finalAmount: price - data.discountAmount, 
          couponCode: codeToApply.toUpperCase() 
        });
        return data.discountAmount;
      }
      return 0;
    } catch (e) {
      console.error("Coupon failed", e);
      return 0;
    }
  }, [service.id, duration, price, onPricingChange]);

  useEffect(() => {
    const runAutoApply = async () => {
      const urlCode = searchParams.get("promo");
      if (urlCode) {
        await applyCouponLogic(urlCode);
        return;
      }

      try {
        const now = new Date().toISOString();
        const { data: autoCoupons } = await supabase
          .from('coupons')
          .select('*')
          .eq('is_auto_apply', true)
          .eq('is_active', true)
          .lte('valid_from', now)
          .gte('valid_until', now);
        
        if (autoCoupons && autoCoupons.length > 0) {
          const validAutoCoupon = autoCoupons.find(c => 
            !c.applicable_services || 
            c.applicable_services.length === 0 || 
            c.applicable_services.includes(service.id)
          );
          if (validAutoCoupon) {
            await applyCouponLogic(validAutoCoupon.code);
          }
        }
      } catch (err) { console.error("Auto-apply check failed", err); }
    };
    runAutoApply();
  }, [service.id, applyCouponLogic]);

  const handleSendOTP = async () => {
    if (!form.email.includes("@")) return alert("Enter a valid email");
    setIsVerifying(true);
    const res = await fetch("/api/otp/send", {
      method: "POST",
      body: JSON.stringify({ email: form.email }),
    });
    if (res.ok) {
      setOtpSent(true);
      setTimeout(() => inputRefs.otp.current?.focus(), 100);
    }
    else alert("Failed to send OTP");
    setIsVerifying(false);
  };

  const handleVerifyOTP = async () => {
    setIsVerifying(true);
    const res = await fetch("/api/otp/verify", {
      method: "POST",
      body: JSON.stringify({ email: form.email, otp }),
    });
    if (res.ok) setIsEmailVerified(true);
    else alert("Invalid OTP");
    setIsVerifying(false);
  };

  async function confirmBooking() {
    // 1. Validate Fields visually first
    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) newErrors.name = "Name is required.";
    
    if (!form.phone.trim()) {
        newErrors.phone = "Phone number is required.";
    } else if (form.phone.length !== 10) {
        newErrors.phone = "Please enter a valid 10-digit number.";
    }

    if (!form.email.trim()) newErrors.email = "Email is required.";

    if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return; // Stop execution if there are validation errors
    }

    // 2. Logic Validation
    if (!isEmailVerified) return alert("Please verify your email first.");

    setSubmitting(true);
    let currentDiscount = discount;
    if (coupon && discount === 0) {
      const val = await applyCouponLogic(coupon);
      currentDiscount = val;
    }

    const calculatedFinal = price - currentDiscount;
    const bookingPayload = { service, date: formatLocalDate(date), slotId: time.slotId, time, duration, couponCode: coupon, discountAmount: currentDiscount, finalAmount: calculatedFinal, form };

    if (form.payment === "QR") {
      const loaded = await loadRazorpay();
      if (!loaded) { alert("Razorpay failed to load"); setSubmitting(false); return; }
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: Math.round(calculatedFinal * 100),
        currency: "INR",
        name: "Recovery Center",
        description: `Booking: ${service.title}`,
        handler: async (response: any) => {
          await finalize(bookingPayload, { razorpay_payment_id: response.razorpay_payment_id, razorpay_order_id: response.razorpay_order_id, razorpay_signature: response.razorpay_signature });
        },
        prefill: { name: form.name, email: form.email, contact: form.phone },
        theme: { color: "#289BD0" },
        modal: { ondismiss: () => setSubmitting(false) }
      };
      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } else {
      await finalize(bookingPayload);
    }
  }

  async function finalize(payload: any, paymentDetails?: any) {
    try {
      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, paymentDetails }),
      });
      if (res.ok) onSuccess({ finalAmount: payload.finalAmount });
      else { const err = await res.json(); alert(err.error || "Booking failed"); }
    } catch (e) { alert("Network error"); } finally { setSubmitting(false); }
  }

  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16">
      <div className="space-y-10">
        <h2 className="text-4xl font-bold tracking-tight">Details</h2>
        <div className="space-y-8">
          {['name', 'phone', 'email'].map((field) => (
            <div key={field} className="space-y-2">
              <Label className={`text-[10px] font-black tracking-widest uppercase ${errors[field] ? "text-red-500" : "text-gray-400"}`}>
                {field}
              </Label>
              <div className="relative">
                <Input
                  ref={field === 'phone' ? inputRefs.phone : field === 'email' ? inputRefs.email : null}
                  disabled={field === 'email' && isEmailVerified}
                  placeholder={`Your ${field}`}
                  value={(form as any)[field]}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      if (field === 'name') inputRefs.phone.current?.focus();
                      if (field === 'phone') inputRefs.email.current?.focus();
                      if (field === 'email' && !isEmailVerified) handleSendOTP();
                    }
                  }}
                  onChange={(e) => {
                    // Clear error when user types
                    if (errors[field]) setErrors(prev => ({...prev, [field]: ""}));

                    if (field === 'phone') {
                      const val = e.target.value.replace(/\D/g, "");
                      if (val.length <= 10) setForm({ ...form, phone: val });
                    } else setForm({ ...form, [field]: e.target.value });
                  }}
                  // Conditional styling for error state
                  className={`border-0 border-b-2 rounded-none px-0 focus-visible:ring-0 transition-colors bg-transparent text-xl h-12 w-full pr-20 
                    ${errors[field] 
                        ? "border-red-500 focus-visible:border-red-500" 
                        : "border-[#F9F9F9] focus-visible:border-[#289BD0]"
                    }`}
                />
                
                {/* Field specific visual error message */}
                {errors[field] && (
                    <p className="text-red-500 text-xs font-bold mt-1 animate-in slide-in-from-top-1">
                        {errors[field]}
                    </p>
                )}

                {field === 'email' && !isEmailVerified && !errors[field] && (
                  <button
                    onClick={handleSendOTP}
                    disabled={isVerifying || !form.email}
                    className="absolute right-0 bottom-2 text-xs font-bold text-[#289BD0] uppercase tracking-tighter hover:text-black disabled:opacity-50"
                  >
                    {otpSent ? "Resend" : "Verify"}
                  </button>
                )}
                {field === 'email' && isEmailVerified && (
                  <CheckCircle2 size={20} className="absolute right-0 bottom-2 text-[#00FF48]" />
                )}
              </div>
            </div>
          ))}

          {otpSent && !isEmailVerified && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
              <Label className="text-[10px] font-black tracking-widest uppercase text-[#289BD0]">Enter 6-Digit OTP</Label>
              <div className="flex gap-2">
                <Input
                  ref={inputRefs.otp}
                  placeholder="000000"
                  value={otp}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleVerifyOTP();
                    }
                  }}
                  onChange={e => setOtp(e.target.value.slice(0, 6))}
                  className="border-b-2 border-[#289BD0] bg-transparent text-2xl tracking-[0.5em] h-12"
                />
                <Button onClick={handleVerifyOTP} disabled={isVerifying} className="bg-black text-white px-8 rounded-xl">
                  {isVerifying ? <Loader2 className="animate-spin" /> : "Confirm"}
                </Button>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <Label className="text-[10px] font-black tracking-widest uppercase text-gray-400">Payment Method</Label>
            <div className="flex gap-4">
              {['CASH', 'QR'].map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setForm({ ...form, payment: m as any })}
                  className={`flex-1 py-4 rounded-2xl font-bold transition-all border-2 ${form.payment === m ? 'border-black bg-black text-white' : 'border-[#F9F9F9] text-gray-400'}`}
                >
                  {m === 'QR' ? 'Pay Online' : 'Pay at Venue'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#F9F9F9] p-10 rounded-[40px] h-fit sticky top-24 space-y-8">
        <h3 className="text-xl font-bold">Booking Summary</h3>
        <div className="space-y-3">
          <Row label="Service" value={service.title} />
          <Row label="Date" value={formatLocalDate(date)} />
          <Row label="Time" value={time.label} />
          <Row label="Amount" value={`₹${price}`} />
          {discount > 0 && <Row label="Coupon" value={`-₹${discount}`} valueClass="text-[#00FF48] font-bold" />}
        </div>
        <div className="flex gap-2">
          <Input placeholder="COUPON" value={coupon} onChange={e => setCoupon(e.target.value.toUpperCase())} className="rounded-xl border-none bg-white h-12" />
          <Button onClick={() => applyCouponLogic(coupon)} variant="outline" className="rounded-xl h-12 px-6">Apply</Button>
        </div>
        <div className="pt-6 border-t border-black/5">
          <div className="flex justify-between items-end mb-8">
            <span className="text-sm font-bold uppercase tracking-widest text-gray-400">Total Payable</span>
            <span className="text-4xl font-light">₹{finalAmount}</span>
          </div>
          <Button
            disabled={submitting} // Removed the generic !form check so visual validation runs
            onClick={confirmBooking}
            className="w-full bg-[#289BD0] hover:bg-black text-white h-16 rounded-2xl text-xl font-bold disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none"
          >
            {submitting ? <Loader2 className="animate-spin" /> :
              !isEmailVerified ? "Verify Email to Book" :
                (form.payment === "QR" ? "Pay & Book" : "Confirm Booking")}
          </Button>
          <Button variant="ghost" onClick={onBack} className="w-full mt-4 text-gray-400">Modify Selection</Button>
        </div>
      </div>
    </div>
  );
}
/* MAIN COMPONENT */

export default function BookingClient() {
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selection, setSelection] = useState<any>(null);
  const [date, setDate] = useState<Date | null>(null);
  const [time, setTime] = useState<any>(null);
  const [pricing, setPricing] = useState<any>(null);
  const [form, setForm] = useState({ name: "", phone: "", email: "", payment: "CASH" as "QR" | "CASH" });
  const [confirmed, setConfirmed] = useState<any>(null);

  useEffect(() => {
    setTimeout(() => setLoading(false), 500);
  }, []);

  if (confirmed) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="max-w-2xl w-full bg-[#F9F9F9] rounded-[50px] p-12 text-center space-y-8 animate-in zoom-in-95 duration-500">
          <div className="w-24 h-24 bg-[#00FF48]/10 text-[#00FF48] rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 size={48} />
          </div>
          <h2 className="text-5xl font-bold tracking-tight">You're all <span className="text-[#289BD0]">set.</span></h2>
          <p className="text-gray-500 text-lg font-light">Your session is confirmed. We've sent details to {confirmed.email}.</p>
          <div className="bg-white p-8 rounded-[32px] grid grid-cols-2 gap-6 text-left">
              <div>
                 <Label className="text-[10px] font-black tracking-widest text-gray-400 uppercase">Service</Label>
                 <p className="font-bold">{confirmed.service.title}</p>
              </div>
              <div>
                 <Label className="text-[10px] font-black tracking-widest text-gray-400 uppercase">Time</Label>
                 <p className="font-bold">{confirmed.time.label}</p>
              </div>
          </div>
          <Button onClick={() => window.location.href = "/"} className="w-full h-16 rounded-2xl bg-black text-white text-lg">Back to Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen font-sans pb-24">
      <FullPageLoader visible={loading} />
      <h1 className="text-[82px] leading-none font-regular text-center pt-32 pb-24 tracking-tighter">
        Booking <span className="text-[#5db4db]">In-progress</span>
      </h1>
      <ProgressBar step={step} total={3} />
      <div className="max-w-[1200px] mx-auto px-6">
        {step === 1 && (
          <ServiceStep onSelect={(data) => { setSelection(data); setPricing({ finalAmount: data.price }); setStep(2); }} />
        )}
        {step === 2 && (
          <DateTimeStep date={date} time={time} service={selection?.service} onBack={() => setStep(1)} onNext={(d: any, t: any) => { setDate(d); setTime(t); setStep(3); }} />
        )}
        {step === 3 && selection && date && time && (
          <DetailsStep
            selection={selection} date={date} time={time} form={form} setForm={setForm}
            onBack={() => { setTime(null); setStep(2); }}
            onPricingChange={setPricing}
            onSuccess={(pricingResult: any) => {
              setConfirmed({
                service: selection.service,
                time: time,
                email: form.email,
                finalAmount: pricingResult.finalAmount,
              });
            }}
          />
        )}
      </div>

      {selection && step > 1 && !confirmed && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 bg-black text-white px-8 py-4 rounded-full flex items-center gap-6 shadow-2xl animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-[#289BD0]" />
              <span className="text-xs font-bold uppercase">{selection.duration}m</span>
            </div>
            <div className="h-4 w-[1px] bg-white/20" />
            <span className="text-sm font-medium">{selection.service.title}</span>
            <div className="h-4 w-[1px] bg-white/20" />
            <span className="text-[#5DB4DB] font-bold">₹{pricing?.finalAmount}</span>
        </div>
      )}
    </div>
  );
}