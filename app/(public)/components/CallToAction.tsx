"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function CallToAction() {
  const router = useRouter();

  return (
    <section className="min-h-[80vh] md:h-screen flex items-center justify-center px-6 py-20">
      <div className="w-full max-w-[1080px] rounded-[40px] md:rounded-[60px] bg-[#F9F9F9] px-8 py-20 md:px-32 md:py-40 text-center space-y-8 h-fit transition-all duration-500 hover:bg-[#F0F9FF]">
        
        <h2 className="text-4xl md:text-7xl font-bold tracking-tighter leading-none text-black">
          Start Your <span className="text-[#289BD0]">Recovery</span> <br className="hidden md:block" /> Journey Today
        </h2>

        <p className="text-gray-400 font-light text-lg md:text-xl max-w-md mx-auto leading-relaxed">
          Book your session and experience structured, <br className="hidden md:block" /> science-backed recovery.
        </p>

        <div className="pt-4">
          <Button
            size="lg"
            onClick={() => router.push("/services")}
            className="bg-black hover:bg-[#289BD0] text-white px-10 py-8 rounded-2xl text-xl font-bold transition-all duration-300"
          >
            Book a Session
          </Button>
        </div>
        
      </div>
    </section>
  );
}