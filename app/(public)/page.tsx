"use client"

import { supabase } from "@/lib/supabase/client";
import { Service } from "@/lib/types/service";
import { useEffect, useRef, useState } from "react";

import CallToAction from "./components/CallToAction";
import FullPageLoader from "../../components/FullPageLoader";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const reasons = [
  {
    title: "Science-backed recovery",
    description:
      "Protocols designed using proven recovery science for real physiological benefits.",
  },
  {
    title: "Trained professionals",
    description:
      "Sessions guided by certified staff ensuring safety, comfort, and correct usage.",
  },
  {
    title: "Hygienic & premium setup",
    description:
      "Clean, sanitized, and premium-grade equipment maintained to high standards.",
  },
  {
    title: "Community-driven wellness",
    description:
      "A space built around consistency, accountability, and shared wellness goals.",
  },
];

function WhyChillThrive() {
  const containerWhyRef = useRef<HTMLDivElement>(null);
  const el1WhyRef = useRef<HTMLDivElement>(null);
  const el2WhyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerWhyRef.current || !el1WhyRef.current || !el2WhyRef.current) return;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerWhyRef.current,
        start: "top top",
        end: "+=175%",
        pin: true,
        scrub: true,
      },
    });

    tl
      .fromTo(
        el1WhyRef.current,
        { opacity: 0 },
        {
          opacity: 1,
          duration: 0.8,
          ease: "power2.out",
        }
      )
      .fromTo(
        el2WhyRef.current,
        { x:"50vw" },
        {
          x:"-100vw",
          duration: 0.2,
          ease: "power2.out",
        }
      )

    return () => {
      tl.scrollTrigger?.kill();
      tl.kill();
    };
  }, []);

  return (
    <section ref={containerWhyRef} className="mx-auto relative h-screen overflow-hidden">
      <h2 ref={el1WhyRef} className="text-9xl font-light mb-8 text-center absolute top-[calc(50vh-15px)] w-full">
        Why Chill Thrive
      </h2>

      <div ref={el2WhyRef} className="absolute top-[calc(50vh-60px)] left-[calc(50vw-200px)] flex flex-row flex-nowrap gap-70">
        {reasons.map((item, index) => (
          <Card
            key={index}
            className="bg-white z-50"
          >
            <CardHeader className="space-y-2 w-120">
              <CardTitle className="text-5xl font-regular">
                {item.title}
              </CardTitle>
              <CardDescription className="text-xl font-light">
                {item.description}
              </CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </section>
  );
}

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

type TestimonialPreview = {
  id: string;
  type: "text" | "video";
  name: string;
  feedback?: string | null;
  video_url?: string | null;
  thumbnail_url?: string | null;
  rating?: number | null;
};
function TestimonialsPreview() {
  const router = useRouter();
  const [testimonials, setTestimonials] = useState<TestimonialPreview[]>([]);

  useEffect(() => {
    const fetchTestimonials = async () => {
      const { data, error } = await supabase
        .from("testimonials")
        .select("id,type,name,feedback,video_url,thumbnail_url,rating")
        .eq("is_visible", true)
        .order("created_at", { ascending: false })
        .limit(3);

      if (!error && data) {
        setTestimonials(data);
      }
    };

    fetchTestimonials();
  }, []);

  if (testimonials.length === 0) return null;

  return (
    <section className="max-w-[1080px] mx-auto py-24 px-4 sm:px-6 space-y-12">
      {/* Header aligned with "Our Services" style */}
      <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between border-b border-gray-100 pb-8 gap-4">
        <div className="space-y-2 text-center sm:text-left">
          <h2 className="text-5xl md:text-6xl font-semibold tracking-tighter">
            Community Stories
          </h2>
          <p className="text-gray-400 font-light text-lg">Real people. Real recovery.</p>
        </div>

        <Button
          variant="ghost"
          onClick={() => router.push("/testimonials")}
          className="text-xs font-bold uppercase tracking-[0.2em] text-[#289BD0] hover:bg-transparent transition-colors"
        >
          View All Stories →
        </Button>
      </div>

      {/* Grid using the Service Card layout logic */}
      <div className="flex flex-wrap justify-center gap-6 sm:gap-10 md:gap-12">
        {testimonials.map((t) => (
          <div 
            key={t.id} 
            className="bg-[#F9F9F9] p-4 w-full sm:w-[calc(50%-12px)] md:w-[312px] h-fit flex flex-col items-start"
          >
            {/* Square Thumbnail - Matching Service Card Media */}
            <div className="w-full h-[85vw] sm:h-[calc(50%-12px)] md:h-[312px] overflow-hidden rounded-3xl bg-gray-200">
              {t.type === "video" && t.video_url ? (
                <iframe
                  src={t.video_url.replace("watch?v=", "embed/")}
                  className="w-full h-full object-cover"
                  allowFullScreen
                />
              ) : (
                <img 
                  src={t.thumbnail_url || "/image/blankimage.png"} 
                  alt={t.name}
                  className="w-full h-full object-cover"
                />
              )}
            </div>

            <div className="flex flex-row w-full justify-between items-start mt-4 mb-2">
              <div className="flex flex-col">
                <span className="text-xl font-semibold leading-tight">{t.name}</span>
                <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mt-1">Verified Member</span>
              </div>
              
              <div className="text-[#289BD0] text-sm">
                {"★".repeat(t.rating ?? 5)}
              </div>
            </div>

            <p className="text-sm text-gray-600 line-clamp-4 leading-relaxed italic">
              {t.feedback ? `"${t.feedback}"` : "Experience shared via video."}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function Home() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRandomServices = async () => {
      const { data, error } = await supabase
        .from("services")
        .select("id,title,description,media_url,media_type,yt_url")
        .eq("is_active", true);

      if (error || !data) return;

      const shuffled = [...data].sort(() => 0.5 - Math.random());

      const normalized: Service[] = shuffled.slice(0, 3).map((s) => ({
        id: s.id,
        slug: "",
        title: s.title,
        type: "single",
        mediaUrl: s.media_url,
        mediaType: s.media_type,
        ytUrl: s.yt_url ?? undefined,
        description: s.description,
        durationMinutes: [],
        benefits: [],
        prices: [],
        currency: "INR",
        isActive: true,
        createdAt: "",
      }));

      setServices(normalized);
      setTimeout(() => setLoading(false), 300);
    };

    fetchRandomServices();
  }, []);

  const containerRef = useRef<HTMLDivElement>(null);
  const el1Ref = useRef<HTMLDivElement>(null);
  const el2Ref = useRef<HTMLDivElement>(null);
  const el3Ref = useRef<HTMLDivElement>(null);

  const container2Ref = useRef<HTMLDivElement>(null);
  const el1C2Ref = useRef<HTMLDivElement>(null);
  const el2C2Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !el1Ref.current || !el2Ref.current) return;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top top",
        end: "+=175%",
        pin: true,
        scrub: true,
        anticipatePin: 1,
      },
    });

    tl
      .fromTo(
        el1Ref.current,
        { y: 20 },
        {
          y: 0,
          duration: 0.05,
          ease: "power2.out",
        }
      )
      .fromTo(
        el2Ref.current,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.2,
          ease: "power2.in",
        }
      )
      .fromTo(
        el3Ref.current,
        { opacity: 0},
        {
          opacity: 1,
          duration: 0.2,
          ease: "power2.in",
        }
      )

    return () => {
      tl.scrollTrigger?.kill();
      tl.kill();
    };
  }, []);

  useEffect(() => {
    if (!container2Ref.current || !el1C2Ref.current || !el2C2Ref.current) return;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: container2Ref.current,
        start: "top top",
        end: "+=200%",
        pin: true,
        scrub: true,
        anticipatePin: 1,
      },
    });

    tl
      .fromTo(
        el1C2Ref.current,
        { opacity: 1 },
        {
          opacity: 0,
          duration: 0.2,
          ease: "sine",
        }
      )
      .fromTo(
        el2C2Ref.current,
        { opacity: 0 },
        {
          opacity: 1,
          duration: 0.1,
          ease: "power2.out",
        }
      )
      .fromTo(
        el3Ref.current,
        { opacity: 0},
        {
          opacity: 1,
          duration: 0.05,
          ease: "power2.out",
        }
      )

    return () => {
      tl.scrollTrigger?.kill();
      tl.kill();
    };
  }, []);

  const containerWhyRef = useRef<HTMLDivElement>(null);
  const el1WhyRef = useRef<HTMLDivElement>(null);
  const el2WhyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerWhyRef.current || !el1WhyRef.current || !el2WhyRef.current) return;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerWhyRef.current,
        start: "top top",
        end: "+=300%",
        pin: true,
        scrub: true,
      },
    });

    tl
      .fromTo(
        el1WhyRef.current,
        { opacity: 0 },
        {
          opacity: 1,
          duration: 0.4,
          ease: "power2.out",
        }
      )
      .fromTo(
        el2WhyRef.current,
        { x:"0vw" },
        {
          x:"-230vw",
          duration: 1.5,
          ease: "power2.out",
        }
      )

    return () => {
      tl.scrollTrigger?.kill();
      tl.kill();
    };
  }, []);

  return (
    <>
      <FullPageLoader visible={loading} />
      <section id="hero" className="font-sans">
        <section ref={containerRef} className="h-screen flex justify-center">
          <div className="flex items-center justify-center mx-auto px-4">
            <img src="/image/icebathhero.png" alt="" className="absolute h-24 sm:h-32 md:h-40 -z-10 opacity-50 top-30 sm:top-16 md:top-18" />
            <div className="flex flex-col ml-0 sm:ml-5 items-center">
              <div ref={el1Ref} className="flex flex-col items-center sm:flex-row">
                <span className="text-[80px] sm:text-[80px] md:text-[100px] lg:text-[115px] leading-[76px] sm:leading-[76px] md:leading-[96px] lg:leading-[100px] text-[#289BD0]">Chill&nbsp;</span>
                <span className="text-[80px] sm:text-[80px] md:text-[100px] lg:text-[115px] leading-[76px] sm:leading-[76px] md:leading-[96px] lg:leading-[100px] text-[#5DB4DB]">Thrive</span>
              </div>
              <span ref={el2Ref} className="text-[32px] sm:text-[22px] md:text-[26px] lg:text-[28px] mt-3 font-[400] text-center px-4">
                Here <a href="/awareness" className="underline text-[#00FF48]">Recovery</a> Meets Resilience
              </span>
              <span ref={el3Ref} className="absolute top-[70vh] md:top-[calc(64vh)] text-center text-[25px] sm:text-[18px] md:text-[20px] lg:text-[22px] mt-9 font-[400] px-4">
                Rejuvenate your body <br />
                Reset your mind
              </span>
            </div>
          </div>
        </section>
        
        <section ref={container2Ref} className="min-h-screen mx-auto relative">
          <br />
          <div ref={el1C2Ref} className="text-black flex w-[100%] md:w-fit text-[50px] sm:text-[64px] md:text-[80px] lg:text-[92px] font-[500] justify-center absolute left-[50%] -translate-x-1/2 md:left-[calc(50vw-290px)] md:translate-x-0 leading-[100vh] top-0">
            <a href="/services">Our Services</a>
          </div>

          <div ref={el2C2Ref} className="flex  items-center mt-20 md:mt-0 justify-center flex-wrap gap-6 sm:gap-10 md:gap-12 w-full max-w-[1080px] mx-auto h-screen px-4">
            {services.map((s, i) => (
              <div className="bg-[#F9F9F9] z-10 relative  p-4 w-full sm:w-[calc(50%-12px)] md:w-[312px] h-fit flex flex-col items-start" key={s.id ?? i}>
                <img
                  className="w-full h-[85vw] sm:h-[calc(50%-12px)] md:h-[312px] rounded-3xl object-cover"
                  src={s.mediaUrl || "/image/blankimage.png"}
                  alt={s.title}
                />

                <div className="flex flex-row w-full justify-between items-end mt-4 mb-2">
                  <span className="text-xl sm:text-2xl font-semibold">
                    {s.title}
                  </span>

                  <a href="/services">
                    <img
                      className="bg-[#289BD0] h-7 w-7 p-2.25 rounded-lg"
                      src="/image/arrow01.svg"
                      alt="View service"
                    />
                  </a>
                </div>

                <span className="line-clamp-3 text-sm">
                  {s.description}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section ref={containerWhyRef} className="mx-auto relative h-screen overflow-hidden">
          <h2 ref={el1WhyRef} className="text-5xl z-0 sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-light mb-8 text-center absolute top-[calc(50vh-60px)] w-full px-4">
            Why Chill Thrive
          </h2>

          <div ref={el2WhyRef} className="absolute z-50 top-[calc(50vh-100px)] left-[calc(100vw)] flex flex-row flex-nowrap gap-10 sm:gap-20 md:gap-40 lg:gap-70">
            {reasons.map((item, index) => (
              <div
                key={index}
                className="bg-white w-[80vw] sm:w-[60vw] md:w-[50vw] lg:w-[40vw] p-4 sm:p-5 border-2"
              >
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl">{item.title}</h1>
                <p className="mt-3 sm:mt-4 md:mt-5 text-sm sm:text-base md:text-lg">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        <TestimonialsPreview />
        <CallToAction />
      </section>
    </>
  );
}