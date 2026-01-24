"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import FullPageLoader from "@/components/FullPageLoader";
import CallToAction from "../components/CallToAction";

gsap.registerPlugin(ScrollTrigger);

type AwarenessSection = {
  id: string;
  section_key: string;
  title: string;
  description: string | null;
  benefits: string[] | null;
  media_url: string | null;
};

export default function AwarenessPage() {
  const [content, setContent] = useState<AwarenessSection[]>([]);
  const [loading, setLoading] = useState(true);

  // Refs for GSAP
  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const fetchAwareness = async () => {
      const { data, error } = await supabase
        .from("awareness")
        .select("*")
        .eq("is_active", true)
        .order("updated_at", { ascending: true });

      if (!error && data) {
        setContent(data);
      }
      setTimeout(() => setLoading(false), 500);
    };

    fetchAwareness();
  }, []);

  useEffect(() => {
    if (loading || !content.length) return;

    // 1. Hero Entrance Animation
    gsap.fromTo(
      titleRef.current,
      { y: 100, opacity: 0 },
      { y: 0, opacity: 1, duration: 1.2, ease: "power4.out", delay: 0.5 }
    );

    // 2. Horizontal Scroll for Benefits (Similar to "Why Chill Thrive")
    const sections = gsap.utils.toArray(".awareness-section");
    sections.forEach((section: any) => {
      const benefitsRow = section.querySelector(".benefits-row");
      if (benefitsRow) {
        gsap.to(benefitsRow, {
          xPercent: -100,
          x: "100vw",
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "+=200%",
            pin: true,
            scrub: 1,
            anticipatePin: 1,
          },
        });
      }
    });

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, [loading, content]);

  return (
    <>
      <FullPageLoader visible={loading} />
      
      <main ref={containerRef} className="bg-white font-sans text-black overflow-x-hidden">
        
        {/* ---------- HERO SECTION ---------- */}
        <section ref={heroRef} id="hero" className="h-screen flex flex-col items-center justify-center relative px-6">
          <img 
            src="/image/icebathhero.png" 
            alt="" 
            className="absolute h-64 -z-10 opacity-20 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" 
          />
          <h1 ref={titleRef} className="text-[115px] leading-[100px] font-bold text-center">
            <span className="text-[#289BD0]">Cold</span> <br />
            <span className="text-[#5DB4DB]">Awareness</span>
          </h1>
          <p className="mt-12 text-[24px] font-light text-gray-500 max-w-2xl text-center">
            Evidence-based education to help you master the art of recovery.
          </p>
          <div className="absolute bottom-10 animate-bounce text-[#289BD0]">
            <span className="text-xs uppercase tracking-[0.5em]">Scroll to Learn</span>
          </div>
        </section>

        {/* ---------- CONTENT SECTIONS ---------- */}
        {content.map((section, idx) => (
          <section 
            key={section.id} 
            className="awareness-section min-h-screen flex flex-col justify-center relative border-t border-gray-100"
          >
            <div className="max-w-[1200px] mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
              
              {/* Text Content */}
              <div className="space-y-8">
                <span className="text-[#289BD0] font-bold text-sm uppercase tracking-widest">
                  Phase 0{idx + 1}
                </span>
                <h2 className="text-7xl font-bold leading-tight">
                  {section.title}
                </h2>
                <p className="text-xl text-gray-600 leading-relaxed font-light">
                  {section.description}
                </p>
              </div>

              {/* Media Section */}
              <div className="relative">
                <div className="aspect-[4/5] rounded-[40px] overflow-hidden bg-[#F9F9F9] shadow-2xl transition-transform duration-500 hover:scale-[1.02]">
                  <img 
                    src={section.media_url || "/image/blankimage.png"} 
                    alt={section.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Decorative Accent */}
                <div className={`absolute -bottom-10 -right-10 w-40 h-40 -z-10 rounded-full blur-3xl opacity-20 ${idx % 2 === 0 ? 'bg-[#289BD0]' : 'bg-[#5DB4DB]'}`} />
              </div>
            </div>

            {/* Horizontal Benefits Slider (If array exists) */}
            {section.benefits && section.benefits.length > 0 && (
              <div className="mt-20 overflow-hidden">
                <div className="benefits-row flex flex-row flex-nowrap gap-20 whitespace-nowrap pl-[100vw]">
                  {section.benefits.map((benefit, bIdx) => (
                    <div 
                      key={bIdx} 
                      className="bg-[#F9F9F9] min-w-[400px] p-12 rounded-[32px] border border-gray-200/50"
                    >
                      <h4 className="text-[#289BD0] text-xl font-bold mb-4">Benefit 0{bIdx + 1}</h4>
                      <p className="text-4xl font-light text-black whitespace-normal leading-tight">
                        {benefit}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        ))}

        <CallToAction />

        {/* ---------- MEDICAL DISCLAIMER ---------- */}
        <footer className="py-20 px-6 bg-[#F9F9F9]">
          <div className="max-w-3xl mx-auto text-center border-l-4 border-black pl-8 text-gray-500 italic text-sm">
            Medical Disclaimer: The information provided here is for educational purposes only 
            and is not intended as medical advice. Always consult with a qualified healthcare 
            professional before starting cold therapy protocols.
          </div>
        </footer>
      </main>
    </>
  );
}