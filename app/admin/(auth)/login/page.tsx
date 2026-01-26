"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { ShieldCheck, Mail, Loader2, ArrowRight, KeyRound, CheckCircle2, AlertCircle } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null, msg: string | null }>({ type: null, msg: null });

  // 1. Check Session (Prevent double login)
  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        router.replace("/admin/dashboard");
      }
    };
    checkUser();
  }, [router]);

  // 2. Step 1: Trigger the Email
  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: null, msg: null });

    try {
      // This triggers the "Magic Link" template we edited in the dashboard
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true, // Security: Only allow existing admins
        }
      });

      if (error) throw error;

      setStep('otp');
      setStatus({ type: 'success', msg: "Code sent! Check your inbox." });
    } catch (err: any) {
      // Helpful error messages
      const msg = err.message.includes("Signups not allowed") 
        ? "Access denied. Admin email not found." 
        : err.message;
      setStatus({ type: 'error', msg });
    } finally {
      setLoading(false);
    }
  }

  // 3. Step 2: Verify the Code
  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: null, msg: null });

    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'email', // This matches the code sent via Magic Link template
      });

      if (error) throw error;

      setStatus({ type: 'success', msg: "Verified! entering..." });
      router.refresh(); // Refresh to update middleware state
      router.replace("/admin/dashboard");
      
    } catch (err: any) {
      setStatus({ type: 'error', msg: "Invalid or expired code." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6 font-sans">
      {/* BACKGROUND DECORATION */}
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(#F0F9FF_1px,transparent_1px)] [background-size:40px_40px]" />
      <div className="fixed top-0 right-0 p-20 opacity-20">
         <div className="w-64 h-64 rounded-full bg-[#289BD0] blur-[100px]" />
      </div>

      <div className="w-full max-w-md animate-in fade-in zoom-in duration-500">
        <div className="bg-[#F9F9F9] rounded-[40px] shadow-2xl shadow-blue-100/50 overflow-hidden p-10">
          
          {/* HEADER */}
          <div className="text-center space-y-4 mb-10">
            <div className="inline-flex p-4 bg-white rounded-2xl text-[#289BD0] shadow-sm mb-2">
              <ShieldCheck size={32} />
            </div>
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-black">Admin <span className="text-[#289BD0]">Portal</span></h1>
                <p className="text-gray-400 text-sm font-bold uppercase tracking-widest mt-2">Secure Access Point</p>
            </div>
          </div>

          {/* EMAIL STEP */}
          {step === 'email' ? (
            <form onSubmit={handleSendOtp} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                  Email Address
                </label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-[#289BD0] transition-colors" size={20} />
                  <input
                    type="email"
                    required
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-white border-0 rounded-2xl outline-none ring-2 ring-transparent focus:ring-[#289BD0] transition-all font-medium text-lg placeholder:text-gray-300 shadow-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-black text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-[#289BD0] transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 className="animate-spin" /> : <>Send Access Code <ArrowRight size={18} /></>}
              </button>
            </form>
          ) : (
            /* OTP STEP */
            <form onSubmit={handleVerifyOtp} className="space-y-6 animate-in slide-in-from-right-8">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                    Enter OTP Code
                    </label>
                    <button 
                        type="button" 
                        onClick={() => { setStep('email'); setOtp(''); setStatus({ type: null, msg: null }); }}
                        className="text-[10px] font-bold text-[#289BD0] hover:underline cursor-pointer uppercase tracking-widest"
                    >
                        Change Email
                    </button>
                </div>
                <div className="relative group">
                  <KeyRound className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-[#289BD0] transition-colors" size={20} />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="123456"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    className="w-full pl-12 pr-4 py-4 bg-white border-0 rounded-2xl outline-none ring-2 ring-transparent focus:ring-[#289BD0] transition-all font-medium text-lg placeholder:text-gray-300 shadow-sm tracking-[0.5em]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#289BD0] text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-black transition-all active:scale-[0.98] disabled:opacity-70 shadow-lg shadow-blue-200"
              >
                {loading ? <Loader2 className="animate-spin" /> : <>Verify & Enter</>}
              </button>
            </form>
          )}

          {/* STATUS MESSAGES */}
          {status.msg && (
            <div className={`mt-6 p-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 ${
              status.type === 'success' ? 'bg-[#E8FAF0] text-[#00AA45]' : 'bg-[#FFF0F0] text-[#FF4545]'
            }`}>
              {status.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
              <p className="text-sm font-bold">{status.msg}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}