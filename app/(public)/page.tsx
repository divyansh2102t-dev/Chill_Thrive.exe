"use client"

import { supabase } from "@/lib/supabase/client";
import { Service } from "@/lib/types/service";
import { useEffect, useRef, useState } from "react";

import WhyChillThrive from "./components/WhyChillThrive";
import CallToAction from "./components/CallToAction";
import TestimonialsPreview from "./components/TestimonialsPreview";
import FullPageLoader from "./components/FullPageLoader";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger"


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

      const normalized: Service[] = shuffled.slice(0, 4).map((s) => ({
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
        end: "+=175%",      // scroll distance controls timing
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
          duration: 0.8,
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
        el2C2Ref.current,
        { opacity: 0 },
        {
          opacity: 1,
          duration: 0.05,
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
          { x:"100vw" },
          {
            x:"-170vw",
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

                  <div ref={el2WhyRef} className="absolute top-[calc(50vh-100px)] left-[calc(100vw)] flex flex-row flex-nowrap gap-70">
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
          <TestimonialsPreview />
          <CallToAction />
        </section>
    </>
  );
}
