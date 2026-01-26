"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client"; // Ensure this path is correct for your project
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Phone, Mail, MapPin, Loader2 } from "lucide-react"; // Logos for the details

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);

/* ---------- HANDLESUBMIT VALIDATION ---------- */
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  // Basic empty field check
  if (!formData.name || !formData.phone || !formData.message) {
    alert("Please fill in all fields.");
    return;
  }

  // 1. EXACT 10 DIGIT CHECK
  if (formData.phone.length !== 10) {
    alert("Please enter a valid 10-digit mobile number.");
    return;
  }

  setLoading(true);
  try {
    const { error } = await supabase.from("inquiries").insert([
      {
        full_name: formData.name,
        phone_number: formData.phone,
        message: formData.message,
      },
    ]);

    if (error) throw error;

    alert("Message sent successfully!");
    setFormData({ name: "", phone: "", message: "" });
  } catch (error: any) {
    alert(error.message || "Failed to send message.");
  } finally {
    setLoading(false);
  }
};



  return (
    <div className="bg-white min-h-screen font-sans text-black pb-24">
      {/* ---------- HERO SECTION ---------- */}
      <section className="pt-24 pb-16 px-6 text-center">
        <div className="max-w-[1080px] mx-auto space-y-4">
          <h1 className="text-[72px] md:text-[82px] leading-tight font-bold tracking-tight">
            Get in <span className="text-[#289BD0]">Touch</span>
          </h1>
          <p className="text-xl md:text-2xl font-light text-gray-500 max-w-2xl mx-auto pt-4">
            Have questions about protocols or bookings? We're here to help you thrive.
          </p>
        </div>
      </section>

      <div className="max-w-[1100px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        {/* ---------- LEFT COLUMN: DETAILS & MAP ---------- */}
        <div className="space-y-8">
          <div className="bg-[#F9F9F9] p-10 rounded-[40px] space-y-8">
            <h2 className="text-3xl font-semibold mb-6">Studio Details</h2>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="bg-[#289BD0] p-3 rounded-2xl">
                   <Phone className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold uppercase tracking-widest text-gray-400">Phone</p>
                  <p className="text-xl font-medium">+91 92270 25160</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-[#5DB4DB] p-3 rounded-2xl">
                   <Mail className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold uppercase tracking-widest text-gray-400">Email</p>
                  <p className="text-xl font-medium">chillthrivegwoc@gmail.com</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-black p-3 rounded-2xl">
                   <MapPin className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold uppercase tracking-widest text-gray-400">Location</p>
                  <p className="text-xl font-medium leading-relaxed">
                    At Samavesh, Auqa Therapy Centre,
                    Plot no - 3, SD jain school lane, opp. livestream cafe,
                    indianbank, Piplod, Surat, Gujarat 395007
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* MAP */}
          <div className="overflow-hidden rounded-[40px] border-8 border-[#F9F9F9] grayscale hover:grayscale-0 transition-all duration-500 shadow-sm">
            <iframe
              title="Google Maps"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3536.8551033884314!2d72.76935127503504!3d21.153772080527002!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be04d71f6a8ac3b%3A0xb610c6ffed190bbe!2sChill%20thrive%20Ice%20bath!5e1!3m2!1sen!2sin!4v1769363734449!5m2!1sen!2sin"
              className="w-full h-[350px] border-0"
              loading="lazy"
            />
          </div>
        </div>



        {/* ---------- RIGHT COLUMN: CONTACT FORM ---------- */}
        <div className="bg-white border-2 border-[#F9F9F9] p-10 rounded-[40px] shadow-sm">
          <h2 className="text-3xl font-semibold mb-8">Send a Message</h2>
          <form className="space-y-8" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-8">
              <div className="space-y-3">
                <Label htmlFor="name" className="text-xs uppercase tracking-widest font-bold text-gray-400">Full Name</Label>
                <Input
                  id="name"
                  placeholder="Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="border-0 border-b-2 border-[#F9F9F9] rounded-none px-0 focus-visible:ring-0 focus-visible:border-[#289BD0] transition-colors bg-transparent text-lg"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="phone" className="text-xs uppercase tracking-widest font-bold text-gray-400">
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Number"
                  value={formData.phone}
                  onChange={(e) => {
                    // 2. ONLY ALLOW NUMBERS & LIMIT TO 10
                    const val = e.target.value.replace(/\D/g, ""); // Removes any non-digit chars
                    if (val.length <= 10) {
                      setFormData({ ...formData, phone: val });
                    }
                  }}
                  className="border-0 border-b-2 border-[#F9F9F9] rounded-none px-0 focus-visible:ring-0 focus-visible:border-[#289BD0] transition-colors bg-transparent text-lg"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="message" className="text-xs uppercase tracking-widest font-bold text-gray-400">Your Inquiry</Label>
                <Textarea
                  id="message"
                  placeholder="Tell us what's on your mind..."
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="border-0 border-b-2 border-[#F9F9F9] rounded-none px-0 focus-visible:ring-0 focus-visible:border-[#289BD0] transition-colors bg-transparent text-lg resize-none"
                />
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={loading}
              className="w-full bg-[#289BD0] hover:bg-black text-white h-16 rounded-2xl text-xl font-semibold transition-all duration-300"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Message"
              )}
            </Button>
          </form>
          
          <div className="mt-8 flex justify-center opacity-10">
              <img src="/image/icebathhero.png" className="h-16 grayscale" alt="" />
          </div>
        </div>

      </div>
    </div>
  );
}