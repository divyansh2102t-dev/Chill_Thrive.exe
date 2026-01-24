"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import type { Service } from "@/lib/types/service";
import { supabase } from "@/lib/supabase/client";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle2, Clock, Calendar as CalIcon } from "lucide-react";
import FullPageLoader from "@/components/FullPageLoader"

/* ---------------- HELPERS ---------------- */

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

/* ---------------- STEP 1: SERVICE ---------------- */

function ServiceStep({ onSelect }: { onSelect: (data: { service: Service; duration: number }) => void }) {
  const [services, setServices] = useState<Service[]>([]);
  const [selectedDurations, setSelectedDurations] = useState<Record<string, number>>({});

  useEffect(() => {
    supabase.from("services").select("*").eq("is_active", true).then(({ data }) => {
      const normalized = data?.map((s: any) => ({ ...s, durationMinutes: s.duration_minutes ?? [] })) ?? [];
      setServices(normalized);
    });
  }, []);

  return (
    <div className="space-y-12">
      <h2 className="text-5xl font-bold tracking-tight text-center">Choose <span className="text-[#289BD0]">Recovery</span></h2>
      <div className="grid grid-cols-1 gap-6 max-w-4xl mx-auto">
        {services.map((s) => {
          const durations = s.durationMinutes;
          const selectedDuration = selectedDurations[s.id] ?? durations[0];

          return (
            <div key={s.id} className="bg-[#F9F9F9] rounded-[40px] p-8 md:p-10 flex flex-col md:flex-row justify-between items-center gap-8 group hover:bg-[#F0F9FF] transition-colors duration-500">
              <div className="flex-1 space-y-4 text-center md:text-left">
                <h3 className="text-3xl font-bold">{s.title}</h3>
                <div className="flex flex-wrap justify-center md:justify-start gap-3">
                  {durations.map((d) => (
                    <button
                      key={d}
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
                <p className="text-4xl font-light">₹{s.price}</p>
                <Button 
                  onClick={() => onSelect({ service: s, duration: selectedDuration })}
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

/* ---------------- STEP 2: DATE/TIME ---------------- */

function DateTimeStep({ date, time, onBack, onNext }: any) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(date ?? new Date());
  const [selectedTime, setSelectedTime] = useState(time);
  const [slots, setSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedDate) return;
    const fetchSlots = async () => {
      setLoading(true);
      const res = await fetch(`/api/slots?date=${selectedDate.toISOString().split("T")[0]}`);
      const data = await res.json();
      setSlots(data.slots ?? []);
      setLoading(false);
    };
    fetchSlots();
  }, [selectedDate]);

  return (
    <div className="space-y-12">
      <h2 className="text-5xl font-bold tracking-tight text-center">Pick a <span className="text-[#5DB4DB]">Slot</span></h2>
      <div className="flex flex-col lg:flex-row gap-12 items-start justify-center">
        <div className="bg-[#F9F9F9] p-8 rounded-[40px] shadow-sm">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
            className="rounded-md border-none"
          />
        </div>

        <div className="flex-1 w-full max-w-md space-y-6">
          <div className="grid grid-cols-1 gap-3">
            {loading ? (
               <div className="flex justify-center py-10"><Loader2 className="animate-spin text-[#289BD0]" /></div>
            ) : slots.length === 0 ? (
               <p className="text-center text-gray-400 py-10">No availability for this date.</p>
            ) : (
              slots.map((slot) => {
                const label = `${slot.start_time.slice(0, 5)} - ${slot.end_time.slice(0, 5)}`;
                const active = selectedTime?.slotId === slot.id;
                return (
                  <button
                    key={slot.id}
                    onClick={() => setSelectedTime({ slotId: slot.id, label })}
                    className={`p-6 rounded-[24px] text-left transition-all border-2 flex justify-between items-center ${
                      active ? "border-[#289BD0] bg-white shadow-lg scale-[1.02]" : "border-transparent bg-[#F9F9F9] hover:bg-gray-100"
                    }`}
                  >
                    <span className={`text-xl font-medium ${active ? 'text-[#289BD0]' : 'text-black'}`}>{label}</span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{slot.capacity} spots left</span>
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

/* ---------------- STEP 3: DETAILS ---------------- */

function DetailsStep({ service, date, time, duration, form, setForm, onBack, onSuccess, onPricingChange }: any) {
  const [submitting, setSubmitting] = useState(false);
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);

  async function applyCoupon() {
    const res = await fetch("/api/coupon", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: coupon, serviceId: service.id, duration }),
    });
    const data = await res.json();
    if (data.valid) {
      setDiscount(data.discountAmount);
      onPricingChange({ baseAmount: service.price, discountAmount: data.discountAmount, finalAmount: service.price - data.discountAmount, couponCode: coupon });
    }
  }

  async function confirmBooking() {
    setSubmitting(true);
    const res = await fetch("/api/booking", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ service, date: date.toISOString().split("T")[0], slotId: time.slotId, duration, couponCode: coupon, discountAmount: discount, finalAmount: service.price - discount, form }),
    });
    if (res.ok) onSuccess({ baseAmount: service.price, discountAmount: discount, finalAmount: service.price - discount, couponCode: coupon });
    setSubmitting(false);
  }

  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16">
      <div className="space-y-10">
        <h2 className="text-4xl font-bold tracking-tight">Final <span className="text-[#289BD0]">Details</span></h2>
        <div className="space-y-8">
          {['name', 'phone', 'email'].map((field) => (
            <div key={field} className="space-y-2">
              <Label className="text-[10px] font-black tracking-widest uppercase text-gray-400">{field}</Label>
              <Input
                placeholder={`Your ${field}`}
                value={form[field]}
                onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                className="border-0 border-b-2 border-[#F9F9F9] rounded-none px-0 focus-visible:ring-0 focus-visible:border-[#289BD0] transition-colors bg-transparent text-xl h-12"
              />
            </div>
          ))}
          
          <div className="space-y-4">
             <Label className="text-[10px] font-black tracking-widest uppercase text-gray-400">Payment Method</Label>
             <div className="flex gap-4">
               {['QR', 'CASH'].map(m => (
                 <button 
                  key={m}
                  onClick={() => setForm({...form, payment: m})}
                  className={`flex-1 py-4 rounded-2xl font-bold transition-all border-2 ${form.payment === m ? 'border-black bg-black text-white' : 'border-[#F9F9F9] text-gray-400'}`}
                 >
                   {m === 'QR' ? 'Scan QR' : 'Pay at Venue'}
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
          <Row label="Date" value={date.toISOString().split("T")[0]} />
          <Row label="Time" value={time.label} />
          <Row label="Amount" value={`₹${service.price}`} />
          {discount > 0 && <Row label="Coupon" value={`-₹${discount}`} valueClass="text-[#00FF48] font-bold" />}
        </div>
        
        <div className="flex gap-2">
          <Input 
            placeholder="COUPON" 
            value={coupon} 
            onChange={e => setCoupon(e.target.value.toUpperCase())}
            className="rounded-xl border-none bg-white h-12"
          />
          <Button onClick={applyCoupon} variant="outline" className="rounded-xl h-12 px-6">Apply</Button>
        </div>

        <div className="pt-6 border-t border-black/5">
          <div className="flex justify-between items-end mb-8">
            <span className="text-sm font-bold uppercase tracking-widest text-gray-400">Total Payable</span>
            <span className="text-4xl font-light">₹{service.price - discount}</span>
          </div>
          <Button 
            disabled={submitting || !form.name || !form.phone}
            onClick={confirmBooking}
            className="w-full bg-[#289BD0] hover:bg-black text-white h-16 rounded-2xl text-xl font-bold shadow-lg shadow-blue-200"
          >
            {submitting ? <Loader2 className="animate-spin" /> : "Confirm Booking"}
          </Button>
          <Button variant="ghost" onClick={onBack} className="w-full mt-4 text-gray-400">Modify Selection</Button>
        </div>
      </div>
    </div>
  );
}

/* ---------------- MAIN COMPONENT ---------------- */

export default function BookingClient() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selection, setSelection] = useState<any>(null);
  const [date, setDate] = useState<Date | null>(null);
  const [time, setTime] = useState<any>(null);
  const [pricing, setPricing] = useState<any>(null);
  const [form, setForm] = useState({ name: "", phone: "", email: "", payment: "QR" as "QR" | "CASH" });
  const [confirmed, setConfirmed] = useState<any>(null);

  useEffect(() => {
    // Mimic the homepage loader feel
    setTimeout(() => setLoading(false), 500);
  }, []);

  if (confirmed) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="max-w-2xl w-full bg-[#F9F9F9] rounded-[50px] p-12 text-center space-y-8">
          <div className="w-24 h-24 bg-[#00FF48]/10 text-[#00FF48] rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 size={48} />
          </div>
          <h2 className="text-5xl font-bold tracking-tight">You're all <span className="text-[#289BD0]">set.</span></h2>
          <p className="text-gray-500 text-lg font-light">Your session is confirmed. We've sent the details to {confirmed.email}.</p>
          
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

          {confirmed.payment === "QR" && (
            <div className="space-y-4">
              <p className="text-sm font-bold uppercase tracking-[0.2em]">Scan to Secure Spot</p>
              <img src="/qr.png" alt="QR" className="w-48 h-48 mx-auto rounded-3xl border-8 border-white shadow-sm" />
              <p className="text-2xl font-light">₹{confirmed.finalAmount}</p>
            </div>
          )}

          <Button onClick={() => window.location.href = "/"} className="w-full h-16 rounded-2xl bg-black text-white text-lg">Back to Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen font-sans pb-24">
      <FullPageLoader visible={loading} />
      <h1 className="text-[82px] leading-none font-bold text-center pt-24 pb-12 tracking-tighter">
        Book <span className="text-[#289BD0]">Now</span>
      </h1>
      
      <ProgressBar step={step} total={3} />

      <div className="max-w-[1200px] mx-auto px-6">
        {step === 1 && <ServiceStep onSelect={(d) => { setSelection(d); setPricing({ baseAmount: d.service.price, finalAmount: d.service.price }); setStep(2); }} />}
        {step === 2 && <DateTimeStep date={date} time={time} onBack={() => setStep(1)} onNext={(d: any, t: any) => { setDate(d); setTime(t); setStep(3); }} />}
        {step === 3 && selection && date && time && (
          <DetailsStep
            service={selection.service}
            duration={selection.duration}
            date={date}
            time={time}
            form={form}
            setForm={setForm}
            onBack={() => { setTime(null); setStep(2); }}
            onPricingChange={setPricing}
            onSuccess={(pricingResult: any) => {
              setConfirmed({
                service: selection.service, // Crucial: This adds the service back in
                duration: selection.duration,
                date: date.toISOString().split("T")[0],
                time: time,
                email: form.email,
                payment: form.payment,
                baseAmount: pricingResult.baseAmount,
                discountAmount: pricingResult.discountAmount,
                finalAmount: pricingResult.finalAmount,
                couponCode: pricingResult.couponCode,
              });
            }}
          />
        )}
      </div>

      {/* FLOATING SUMMARY (Mobile/Quick View) */}
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