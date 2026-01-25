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

    const ctx = gsap.context(() => {
      // Hero Entrance
      gsap.fromTo(
        ".hero-content",
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "power2.out", stagger: 0.2 }
      );

      // Section Animations
      const sections = gsap.utils.toArray(".awareness-section");
      sections.forEach((section: any) => {
        const benefitsRow = section.querySelector(".benefits-row");
        const internalGrid = section.querySelector(".section-grid");

        // Fade in grid
        gsap.from(internalGrid, {
          y: 30,
          opacity: 0,
          scrollTrigger: {
            trigger: internalGrid,
            start: "top 85%",
          }
        });

        // Horizontal scroll for benefits cards
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
              anticipatePin: 1,
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
        <section className="h-screen flex flex-col items-center justify-center relative overflow-hidden">
          <img
            src="/image/icebathhero.png"
            alt=""
            className="absolute h-32 md:h-48 -z-10 opacity-20 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          />
          <div className="text-center">
            <h1 className="hero-content text-7xl md:text-9xl font-thin tracking-tighter">
              Cold <span className="text-[#289BD0]">Awareness</span>
            </h1>
            <p className="hero-content mt-6 text-lg md:text-xl font-light text-gray-400 max-w-lg mx-auto px-6">
              Master the science and protocols of deliberate cold exposure.
            </p>
          </div>
          
          <div className="hero-content absolute bottom-12 flex flex-col items-center gap-2">
            <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-[#289BD0]">Scroll to master</span>
            <div className="w-[1px] h-12 bg-gray-100" />
          </div>
        </section>

        {/* ---------- CONTENT SECTIONS ---------- */}
        {content.map((section, idx) => (
          <section
            key={section.id}
            className="awareness-section min-h-screen flex flex-col justify-center relative bg-white border-t border-gray-50"
          >
            <div className="section-grid max-w-[1080px] mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center py-32">
              
              {/* Media - Square & Static */}
              <div className={`relative ${idx % 2 !== 0 ? 'lg:order-2' : ''}`}>
                <div className="w-full aspect-square rounded-[40px] overflow-hidden bg-[#F9F9F9]">
                  <img
                    src={section.media_url || "/image/blankimage.png"}
                    alt={section.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Text Content */}
              <div className="space-y-8">
                <div className="space-y-2">
                  <span className="text-[#289BD0] font-black text-[10px] uppercase tracking-[0.4em]">
                    Chapter 0{idx + 1}
                  </span>
                  <h2 className="text-5xl md:text-6xl font-semibold tracking-tight text-black">
                    {section.title}
                  </h2>
                </div>

                <p className="text-lg text-gray-500 leading-relaxed font-light">
                  {section.description}
                </p>

                {/* Benefits List - Standardized UI Pattern */}
                <div className="pt-4 space-y-3">
                   <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400 mb-4">Core Principles</p>
                   <ul className="grid grid-cols-1 gap-3">
                    {section.benefits?.map((benefit, bIdx) => (
                      <li key={bIdx} className="flex items-start text-sm text-black">
                        <span className="mr-3 text-[#289BD0]">•</span>
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Horizontal Detail Cards - Matching "Why Chill Thrive" Horizontal Flow */}
 
          </section>
        ))}

        <div className="bg-white">
            <CallToAction />
        </div>

        {/* ---------- FOOTER / DISCLAIMER ---------- */}
        <footer className="py-24 px-6 bg-white border-t border-gray-100">
          <div className="max-w-[1080px] mx-auto">
            <div className="flex flex-col md:flex-row gap-8 items-start text-gray-400 text-sm leading-relaxed border-l border-gray-200 pl-8">
              <div className="max-w-2xl">
                <strong className="text-black uppercase tracking-[0.2em] text-[10px] block mb-4 font-bold">Scientific & Medical Disclaimer</strong>
                <p className="font-light italic">
                  The content provided within the Awareness portal is for informational and educational purposes only. 
                  Deliberate cold exposure involves physiological stress; please consult with your physician to ensure 
                  you do not have underlying cardiovascular or respiratory conditions that contraindicate cold therapy. 
                  Mastery comes through consistency and safety.
                </p>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}