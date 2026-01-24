"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
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

export default function TestimonialsPreview() {
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