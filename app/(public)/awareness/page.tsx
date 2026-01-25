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

    // 1. Hero Entrance
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".hero-content",
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: "power3.out", delay: 0.3, stagger: 0.2 }
      );

      // 2. Section Animations & Horizontal Scroll
      const sections = gsap.utils.toArray(".awareness-section");
      sections.forEach((section: any) => {
        const benefitsRow = section.querySelector(".benefits-row");
        const internalGrid = section.querySelector(".section-grid");

        // Fade in text/image grid
        gsap.from(internalGrid, {
          y: 50,
          opacity: 0,
          scrollTrigger: {
            trigger: internalGrid,
            start: "top 80%",
          }
        });

        // Horizontal scroll for benefits
        if (benefitsRow) {
          const scrollWidth = benefitsRow.scrollWidth;
          const amountToScroll = scrollWidth - window.innerWidth;

          gsap.to(benefitsRow, {
            x: -amountToScroll,
            ease: "none",
            scrollTrigger: {
              trigger: section,
              start: "top top",
              end: () => `+=${scrollWidth}`,
              pin: true,
              scrub: 1,
              invalidateOnRefresh: true,
            },
          });
        }
      });
    }, containerRef);

    return () => ctx.revert();
  }, [loading, content]);

  return (
    <>
      <FullPageLoader visible={loading} />

      <main ref={containerRef} className="bg-white font-sans text-black">
        {/* ---------- HERO SECTION ---------- */}
        <section ref={heroRef} className="min-h-[90vh] flex flex-col items-center justify-center relative px-6 py-20">
          <img
            src="/image/icebathhero.png"
            alt=""
            className="absolute h-48 md:h-64 -z-10 opacity-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          />
          <div className="text-center space-y-6">
            <h1 ref={titleRef} className="hero-content text-6xl md:text-8xl lg:text-[110px] leading-none font-bold tracking-tighter">
              <span className="text-[#289BD0]">Cold</span> <br />
              <span className="text-[#5DB4DB]">Awareness</span>
            </h1>
            <p className="hero-content mt-6 text-lg md:text-2xl font-light text-gray-500 max-w-xl mx-auto">
              Evidence-based education to help you master the art of recovery.
            </p>
          </div>
          <div className="absolute bottom-10 animate-bounce text-[#289BD0] hidden md:block">
            <span className="text-[10px] uppercase tracking-[0.5em] font-bold">Scroll to Learn</span>
          </div>
        </section>

        {/* ---------- CONTENT SECTIONS ---------- */}
        {content.map((section, idx) => (
          <section
            key={section.id}
            className="awareness-section min-h-screen flex flex-col justify-center relative overflow-hidden bg-white"
          >
            <div className="section-grid max-w-7xl mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center py-20">
              
              {/* Text Content - Alternates order on Desktop */}
              <div className={`space-y-6 md:space-y-8 ${idx % 2 !== 0 ? 'lg:order-2' : ''}`}>
                <div className="flex items-center gap-4">
                  <span className="h-[1px] w-12 bg-[#289BD0] hidden md:block" />
                  <span className="text-[#289BD0] font-bold text-xs uppercase tracking-[0.3em]">
                    Phase 0{idx + 1}
                  </span>
                </div>
                <h2 className="text-4xl md:text-6xl font-bold leading-tight tracking-tight">
                  {section.title}
                </h2>
                <p className="text-base md:text-xl text-gray-600 leading-relaxed font-light max-w-lg">
                  {section.description}
                </p>
              </div>

              {/* Media Section - Reduced Size */}
              <div className={`relative flex justify-center ${idx % 2 !== 0 ? 'lg:order-1' : ''}`}>
                <div className="w-full max-w-[320px] md:max-w-md aspect-[4/5] rounded-[32px] overflow-hidden bg-[#F9F9F9] shadow-xl">
                  <img
                    src={section.media_url || "/image/blankimage.png"}
                    alt={section.title}
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                  />
                </div>
                <div className={`absolute -bottom-6 -right-6 w-32 h-32 -z-10 rounded-full blur-3xl opacity-30 ${idx % 2 === 0 ? 'bg-[#289BD0]' : 'bg-[#5DB4DB]'}`} />
              </div>
            </div>

            {/* Horizontal Benefits Slider */}
            {section.benefits && section.benefits.length > 0 && (
              <div className="pb-24 overflow-hidden">
                <div className="benefits-row flex flex-row flex-nowrap gap-8 md:gap-12 px-6 md:px-20">
                  {section.benefits.map((benefit, bIdx) => (
                    <div
                      key={bIdx}
                      className="bg-[#F9F9F9] flex-shrink-0 w-[280px] md:w-[450px] p-8 md:p-14 rounded-[32px] border border-gray-100 flex flex-col justify-between"
                    >
                      <span className="text-[#289BD0] text-xs font-black uppercase tracking-widest mb-6 block">
                        Detail 0{bIdx + 1}
                      </span>
                      <p className="text-2xl md:text-4xl font-light text-black leading-tight">
                        {benefit}
                      </p>
                    </div>
                  ))}
                  {/* Buffer for scroll ending */}
                  <div className="flex-shrink-0 w-20 md:w-40 h-1" />
                </div>
              </div>
            )}
          </section>
        ))}

        <div className="bg-white py-10 md:py-20">
            <CallToAction />
        </div>

        {/* ---------- MEDICAL DISCLAIMER ---------- */}
        <footer className="py-20 px-6 bg-white border-t border-gray-100">
          <div className="max-w-3xl mx-auto">
            <div className="flex flex-col md:flex-row gap-6 items-start text-gray-400 italic text-sm leading-relaxed border-l-2 border-gray-200 pl-6">
              <p>
                <strong className="text-gray-900 not-italic uppercase tracking-widest text-[10px] block mb-2">Medical Disclaimer</strong>
                The information provided here is for educational purposes only 
                and is not intended as medical advice. Always consult with a qualified healthcare 
                professional before starting cold therapy protocols.
              </p>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}