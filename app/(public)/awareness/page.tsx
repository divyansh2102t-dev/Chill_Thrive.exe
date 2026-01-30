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
      gsap.fromTo(
        ".hero-content",
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: "power4.out", stagger: 0.2 }
      );

      const sections = gsap.utils.toArray(".awareness-section");
      sections.forEach((section: any) => {
        const internalGrid = section.querySelector(".section-grid");
        gsap.from(internalGrid, {
          y: 60,
          opacity: 0,
          duration: 1.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: internalGrid,
            start: "top 90%",
          }
        });
      });
    }, containerRef);

    return () => ctx.revert();
  }, [loading, content]);

  return (
    <>
      <FullPageLoader visible={loading} />

      <main ref={containerRef} className="bg-white font-sans text-black selection:bg-[#289BD0] selection:text-white">
        
        {/* HERO SECTION */}
        <section id="hero" className="h-screen flex flex-col items-center justify-center relative overflow-hidden px-6">
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
            {/* <h1 className="text-[30vw] font-black tracking-tighter">COLD</h1> */}
          </div>
          
          {/* HEADER CONTENT LIMITED TO 960PX */}
          <div className="max-w-[960px] w-full text-center relative z-10 mx-auto">
            <h1 className="hero-content text-[12vw] md:text-[8rem] font-regular leading-[0.85] tracking-tighter uppercase">
              Cold <span className="text-[#289BD0]">Awareness</span>
            </h1>
            <p className="hero-content mt-8 text-xl md:text-2xl font-light text-gray-500 max-w-2xl mx-auto leading-relaxed">
              Master the science and protocols of deliberate cold exposure. 
              <span className="block font-bold text-black mt-2">Recovery meets resilience.</span>
            </p>
          </div>
          
          <div className="hero-content absolute bottom-12 flex flex-col items-center gap-4">
          </div>
        </section>

        {/* CONTENT SECTIONS LIMITED TO 960PX */}
        {content.map((section, idx) => (
          <section
            key={section.id}
            className="awareness-section min-h-screen flex items-center justify-center relative bg-white"
          >
            <div className="section-grid max-w-[960px] mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center py-24 md:py-32">
              
              {/* Media Card */}
              <div className={`relative ${idx % 2 !== 0 ? 'lg:order-2' : ''}`}>
                <div className="w-full aspect-[4/5] rounded-[48px] overflow-hidden bg-[#F9F9F9] group">
                  <img
                    src={section.media_url || "/image/blankimage.png"}
                    alt={section.title}
                    className="w-full h-full object-cover transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-[48px] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
                {/* Floating Index */}
                <div className="absolute -top-4 -right-4 w-16 h-16 md:w-20 md:h-20 bg-black rounded-2xl md:rounded-3xl flex items-center justify-center text-white text-2xl md:text-3xl font-black">
                  0{idx + 1}
                </div>
              </div>

              {/* Text Content */}
              <div className="space-y-8">
                <div className="space-y-3">
                  <div className="flex items-center gap-4">
                    <div className="h-[2px] w-8 bg-[#289BD0]" />
                    <span className="text-[#289BD0] font-black text-[10px] uppercase tracking-[0.4em]">
                      Chapter 0{idx + 1}
                    </span>
                  </div>
                  <h2 className="text-5xl md:text-7xl font-bold tracking-tighter text-black leading-none">
                    {section.title}
                  </h2>
                </div>

                <p className="text-lg md:text-xl text-gray-500 leading-relaxed font-light">
                  {section.description}
                </p>

                {/* Principles List */}
                <div className="pt-4 space-y-4">
                   <p className="text-[10px] uppercase tracking-[0.3em] font-black text-black">Core Principles</p>
                   <ul className="grid grid-cols-1 gap-3">
                    {section.benefits?.map((benefit, bIdx) => (
                      <li key={bIdx} className="flex items-center p-5 bg-[#F9F9F9] rounded-[20px] text-base font-medium transition-colors hover:bg-[#F0F9FF] border border-transparent hover:border-[#289BD0]/20">
                        <span className="mr-4 flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-black text-white text-[9px] font-black">
                          {bIdx + 1}
                        </span>
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </section>
        ))}

        {/* CTA SECTION LIMITED TO 960PX */}
        <div className="py-20 max-w-[960px] mx-auto px-6">
            <CallToAction />
        </div>

        {/* FOOTER LIMITED TO 960PX */}
        <footer className="py-32 px-6 bg-[#F9F9F9] rounded-t-[60px]">
          <div className="max-w-[960px] mx-auto">
            <div className="grid grid-cols-1 gap-12">
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                    <strong className="text-black uppercase tracking-[0.3em] text-[12px] font-black">Scientific & Medical Disclaimer</strong>
                </div>
                <p className="text-gray-500 font-light text-lg leading-relaxed italic">
                  The content provided within the Awareness portal is for informational and educational purposes only. 
                  Deliberate cold exposure involves physiological stress; please consult with your physician to ensure 
                  you do not have underlying cardiovascular or respiratory conditions that contraindicate cold therapy. 
                  Mastery comes through consistency and safety.
                </p>
              </div>
              <div className="pt-12 border-t border-gray-200 flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-gray-400">
                <span>© {new Date().getFullYear()} Chill Thrive</span>
                <span>Recovery Meets Resilience</span>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}