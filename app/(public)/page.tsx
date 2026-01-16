"use client"

import { supabase } from "@/lib/supabase/client";
import { Service } from "@/lib/types/service";
import { useEffect, useState } from "react";

import WhyChillThrive from "./components/WhyChillThrive";
import CallToAction from "./components/CallToAction";
import TestimonialsPreview from "./components/TestimonialsPreview";

export default function Home() {
  const [services, setServices] = useState<Service[]>([]);

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
  };

  fetchRandomServices();
}, []);


  return (
    <section className="font-sans">
      <section>
        <div className="mt-15 flex items-center justify-center mx-auto">
          <img src="/image/icebathhero.png" alt="" className="h-80" />
          <div className="flex flex-col ml-5">
            <span className="text-[84px] leading-[80px]">Welcome to</span>
            <div className="flex flex-row">
              <span className="text-[115px] leading-[100px] text-[#289BD0]">Chill&nbsp;</span>
              <span className="text-[115px] leading-[100px] text-[#5DB4DB]">Thrive</span>
            </div>
            <span className="text-[28px] mt-3 font-[400]">Where <a href="" className="underline text-[#00FF48]">Recovery</a> Meets Resilience.</span>
            <span className="text-[22px] mt-9 font-[400]">Rejuvenate your body. <br />
                  Reset your mind.</span>
          </div>
        </div>

        <div className="my-12 flex justify-center text-[32px]">
          <a className="rounded-2xl underline hover:no-underline" href="/booking">Book</a>&nbsp;a session right now
        </div>
      </section>
      <section className="w-[1080px] mx-auto">
        <br />
        <div>
          <div className="my-12 flex text-[84px] mb-10">
            <a className="underline hover:no-underline rounded-2xl" href="/services">Explore Services</a>
          </div>

          <div className="flex justify-center flex-wrap gap-20">
            {services.map((s, i) => (
              <div className="bg-[#F9F9F9] p-8 w-[372px]" key={s.id ?? i}>
                <img
                  className="w-80 h-80 rounded-3xl object-cover"
                  src={s.mediaUrl || "/image/blankimage.png"}
                  alt={s.title}
                />

                <div>
                  <div className="flex flex-rol w-full justify-between mt-8 mb-2">
                    <span className="text-3xl font-semibold">
                      {s.title}
                    </span>

                    <a href="/services">
                      <img
                        className="bg-[#289BD0] h-10 w-10 p-2.25 rounded-2xl"
                        src="/image/arrow01.svg"
                        alt="View service"
                      />
                    </a>
                  </div>

                  <span className="line-clamp-3">
                    {s.description}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <WhyChillThrive />
      <TestimonialsPreview />
      <CallToAction />
    </section>
  );
}
