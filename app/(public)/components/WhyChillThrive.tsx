"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useEffect, useRef } from "react";

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

export default function WhyChillThrive() {

  
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
