"use client"

import { supabase } from "@/lib/supabase/client";
import { Service } from "@/lib/types/service";
import { useEffect, useRef, useState } from "react";

// import WhyChillThrive from "./components/WhyChillThrive";
import CallToAction from "./components/CallToAction";
// import TestimonialsPreview from "./components/TestimonialsPreview";
import FullPageLoader from "../../components/FullPageLoader";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger"


gsap.registerPlugin(ScrollTrigger);


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
          end: "+=175%",      // scroll distance controls timing
          pin: true,          // 🔒 pinned screen
          // pinSpacing: false,
          scrub: true,
        },
      });
  
      tl
        // Element 1
        .fromTo(
          el1WhyRef.current,
          { opacity: 0 },
          {
            opacity: 1,
            duration: 0.8,
            ease: "power2.out",
          }
        )
  
        // Element 2
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
    <section ref={containerWhyRef} className=" mx-auto relative h-screen overflow-hidden">
      {/* <div ref={containerWhyRef} className="h-[1px]" /> */}
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
        .limit(3); // Limited to 3 for a cleaner grid row

      if (!error && data) {
        setTestimonials(data);
      }
    };

    fetchTestimonials();
  }, []);

  if (testimonials.length === 0) return null;

  return (
    <section className="max-w-[1080px] mx-auto py-24 px-6 space-y-12">
      {/* ---------- HEADER ---------- */}
      <div className="flex items-end justify-between border-b border-gray-100 pb-8">
        <div className="space-y-2">
          <h2 className="text-6xl font-bold tracking-tighter">
            Community <span className="text-[#289BD0]">Stories</span>
          </h2>
          <p className="text-gray-400 font-light text-xl">Real people. Real recovery.</p>
        </div>

        <Button
          variant="ghost"
          onClick={() => router.push("/testimonials")}
          className="text-sm font-bold uppercase tracking-[0.2em] text-[#289BD0] hover:bg-transparent hover:text-black transition-colors"
        >
          View All Stories →
        </Button>
      </div>

      {/* ---------- PREVIEW GRID ---------- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {testimonials.map((t) => (
          <div 
            key={t.id} 
            className="bg-[#F9F9F9] p-8 rounded-[40px] flex flex-col justify-between space-y-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-500 group"
          >
            <div className="space-y-4">
              {/* Star Rating */}
              <div className="flex text-[#289BD0] text-sm">
                {"★".repeat(t.rating ?? 5)}
              </div>

              {t.type === "video" && t.video_url ? (
                <div className="relative aspect-video rounded-[24px] overflow-hidden bg-black shadow-inner">
                  <iframe
                    src={t.video_url}
                    className="w-full h-full"
                    allowFullScreen
                  />
                </div>
              ) : (
                <p className="text-gray-700 leading-relaxed italic line-clamp-4">
                  “{t.feedback}”
                </p>
              )}
            </div>

            {/* Profile Footer */}
            <div className="flex items-center gap-4 pt-4 border-t border-gray-200/50">
              <div className="relative">
                <img 
                  src={t.thumbnail_url || "/image/default-avatar.png"} 
                  alt={t.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-white group-hover:border-[#289BD0] transition-colors"
                />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#00FF48] border-2 border-white rounded-full" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg leading-none">{t.name}</span>
                <span className="text-[10px] uppercase tracking-widest text-gray-400 font-black mt-1">Verified Member</span>
              </div>
            </div>
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

      // shuffle client-side
      const shuffled = [...data].sort(() => 0.5 - Math.random());

      const normalized: Service[] = shuffled.slice(0, 3).map((s) => ({
        id: s.id,
        slug: "", // not needed here, keep empty or remove from interface if unused
        title: s.title,
        type: "single", // or infer if needed

        mediaUrl: s.media_url,        // ✅ FIX
        mediaType: s.media_type,      // ✅ FIX
        ytUrl: s.yt_url ?? undefined, // ✅ FIX

        description: s.description,

        durationMinutes: [],
        benefits: [],

        price: 0,
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
        end: "+=175%",      // scroll distance controls timing
        pin: true,          // 🔒 pinned screen
        scrub: true,        // 🔗 scroll linked
        anticipatePin: 1,
      },
    });

    tl
      // Element 1
      .fromTo(
        el1Ref.current,
        { y: 20 },
        {
          y: 0,
          duration: 0.05,
          ease: "power2.out",
        }
      )
      // .to(el1Ref.current, {
      //   y: -60,             // moves up → creates space
      //   duration: 0.6,
      //   ease: "power2.out",
      // })

      // Element 2
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
      // .to(el2Ref.current, {
      //   y: -60,
      //   duration: 0.6,
      //   ease: "power2.out",
      // });

      .fromTo(
        el3Ref.current,
        { opacity: 0},
        {
          opacity: 1,
          duration: 0.2,
          ease: "power2.in",
        }
      )
      // .fromTo(
      //   "#book",
      //   {scale: 1, color:"#000000", padding:"0px"},
      //   {
      //     color: "#289BD0", border:"1px solid black", padding:"5px",
      //     duration: 0.2,
      //     ease: "linear",
      //   }
      // )
      // .to(
      //   "#book",
      //   {scale: 1, color:"#000000", border:"0px"},
      // )
      // .

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
        end: "+=225%",      // scroll distance controls timing
        pin: true,          // 🔒 pinned screen
        scrub: true,        // 🔗 scroll linked
        anticipatePin: 1,
      },
    });

    tl
      // Element 1
      .fromTo(
        el1C2Ref.current,
        { opacity: 1 },
        {
          opacity: 0,
          duration: 0.5,
          ease: "sine",
        }
      )
      // .to(el1Ref.current, {
      //   y: -60,             // moves up → creates space
      //   duration: 0.6,
      //   ease: "power2.out",
      // })

      // Element 2
      .fromTo(
        el2C2Ref.current,
        { opacity: 0 },
        {
          opacity: 1,
          duration: 0.1,
          ease: "power2.out",
        }
      )
      // .to(el2Ref.current, {
      //   y: -60,
      //   duration: 0.6,
      //   ease: "power2.out",
      // });

      .fromTo(
        el3Ref.current,
        { opacity: 0},
        {
          opacity: 1,
          duration: 0.05,
          ease: "power2.out",
        }
      )
      // .fromTo(
      //   "#book",
      //   {scale: 1, color:"#000000", padding:"0px"},
      //   {
      //     color: "#289BD0", border:"1px solid black", padding:"5px",
      //     duration: 0.2,
      //     ease: "linear",
      //   }
      // )
      // .to(
      //   "#book",
      //   {scale: 1, color:"#000000", border:"0px"},
      // )
      // .

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
          end: "+=300%",      // scroll distance controls timing
          pin: true,          // 🔒 pinned screen
          // pinSpacing: false,
          scrub: true,
        },
      });
  
      tl
        // Element 1
        .fromTo(
          el1WhyRef.current,
          { opacity: 0 },
          {
            opacity: 1,
            duration: 0.4,
            ease: "power2.out",
          }
        )
  
        // Element 2
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
            <div className="flex items-center justify-center mx-auto">
              <img src="/image/icebathhero.png" alt="" className="absolute h-40 -z-10 opacity-50 top-18" />
              <div className="flex flex-col ml-5 items-center">
                {/* <span className="text-[84px] leading-[80px]">Welcome to</span> */}
                <div ref={el1Ref} className="flex flex-row">
                  <span className="text-[115px] leading-[100px] text-[#289BD0]">Chill&nbsp;</span>
                  <span className="text-[115px] leading-[100px] text-[#5DB4DB]">Thrive</span>
                </div>
                <span ref={el2Ref} className="text-[28px] mt-3 font-[400]">Here <a href="" className="underline text-[#00FF48]">Recovery</a> Meets Resilience</span>
                <span ref={el3Ref} className="absolute top-[calc(64vh)] text-center text-[22px] mt-9 font-[400]">Rejuvenate your body <br />
                      Reset your mind</span>
              </div>
            </div>

            {/* <div className="my-12 flex justify-center text-[32px]">
              <a className="rounded-2xl underline hover:no-underline" href="/booking">Book</a>&nbsp;a session right now
            </div> */}
          </section>
          
          <section ref={container2Ref} className="min-h-screen mx-auto relative">
            <br />
              <div ref={el1C2Ref} className="text-black my-12 flex text-[92px] font-[500] justify-center mb-10 absolute left-[calc(50vw-290px)] top-[calc(48vh-110px)]">
                <a className="rounded-2xl" href="/services">Our Services</a>
              </div>

              <div ref={el2C2Ref} className="flex items-center justify-center flex-wrap gap-15 w-[1080px] mx-auto h-screen">
                {services.map((s, i) => (
                  <div className="bg-[#F9F9F9] p-4 w-[312px] h-fit flex flex-col items-start" key={s.id ?? i}>
                    <img
                      className="w-full  rounded-3xl object-cover"
                      src={s.mediaUrl || "/image/blankimage.png"}
                      alt={s.title}
                    />

                      <div className="flex flex-rol w-full justify-between items-end mt-4 mb-2">
                        <span className="text-2xl font-semibold">
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
          {/* <WhyChillThrive /> */}
              <section ref={containerWhyRef} className=" mx-auto relative h-screen overflow-hidden">
                  {/* <div ref={containerWhyRef} className="h-[1px]" /> */}
                  <h2 ref={el1WhyRef} className="text-9xl font-light mb-8 text-center absolute top-[calc(50vh-60px)] w-full">
                    Why Chill Thrive
                  </h2>

                  <div ref={el2WhyRef} className="absolute z-50 top-[calc(50vh-100px)] left-[calc(100vw)] flex flex-row flex-nowrap gap-70">
                    {reasons.map((item, index) => (
                      // <Card
                      //   key={index}
                      //   className="bg-white"
                      // >
                      //   <CardHeader className="space-y-2 w-120">
                      //     <CardTitle className="text-5xl font-regular">
                      //       {item.title}
                      //     </CardTitle>
                      //     <CardDescription className="text-xl font-light">
                      //       {item.description}
                      //     </CardDescription>
                      //   </CardHeader>
                      // </Card>
                      <div
                        key={index}
                        className={`bg-white w-[40vw] p-5 border-2`}
                      >
                        <h1 className="text-7xl">{item.title}</h1>
                        <p className="mt-5">{item.description}</p>
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
