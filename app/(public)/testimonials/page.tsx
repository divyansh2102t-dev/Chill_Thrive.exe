"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import FullPageLoader from "../../../components/FullPageLoader";
import { User, ExternalLink, Play } from "lucide-react";

type Testimonial = {
  id: string;
  type: "text" | "video";
  name: string;
  feedback: string | null;
  rating: number | null;
  video_url: string | null;
  thumbnail_url: string | null;
};

export default function TestimonialsPage() {
  const [data, setData] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTestimonials = async () => {
      const { data, error } = await supabase
        .from("testimonials")
        .select("*")
        .eq("is_visible", true)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setData(data);
      }
      setTimeout(() => setLoading(false), 400);
    };

    fetchTestimonials();
  }, []);

  // Helper to check if URL is embeddable
  const getEmbedUrl = (url: string | null) => {
    if (!url) return null;
  
    // 1. If it's already an embed link (YouTube or Vimeo), return it as is
    if (url.includes("youtube.com/embed/") || url.includes("player.vimeo.com/video/")) {
      return url;
    }
  
    // 2. Standard YouTube links (handle watch?v=)
    if (url.includes("youtube.com/watch?v=")) {
      // We split to ensure we only get the ID and exclude extra params like &t= or &feature=
      const videoId = url.split("v=")[1]?.split("&")[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
  
    // 3. YouTube Shorts links
    if (url.includes("youtube.com/shorts/")) {
      return url.replace("shorts/", "embed/");
    }
  
    // 4. Shortened YouTube links (youtu.be/)
    if (url.includes("youtu.be/")) {
      const videoId = url.split("youtu.be/")[1]?.split("?")[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
  
    // 5. Vimeo links
    if (url.includes("vimeo.com/")) {
      const vimeoId = url.split("vimeo.com/")[1]?.split("?")[0];
      return `https://player.vimeo.com/video/${vimeoId}`;
    }
  
    return null;
  };

  return (
    <>
      <FullPageLoader visible={loading} />
      
      <div className="bg-white min-h-screen font-sans text-black pb-24">
        {/* ---------- HERO ---------- */}
        <section className="pt-24 pb-16 px-6 text-center">
          <div className="max-w-[1080px] mx-auto space-y-4">
            <h1 className="text-[72px] md:text-[82px] leading-tight font-bold tracking-tight">
              Real <span className="text-[#289BD0]">Results.</span><br />
              Real <span className="text-[#5DB4DB]">Stories.</span>
            </h1>
            <p className="text-xl md:text-2xl font-light text-gray-500 max-w-2xl mx-auto pt-6">
              Hear from the community rewriting their recovery protocols at Chill Thrive.
            </p>
          </div>
        </section>

        <div className="max-w-[1100px] mx-auto px-6 space-y-24">
          
          {/* ---------- VIDEO TESTIMONIALS ---------- */}
          <section className="space-y-10">
            <div className="flex items-center gap-4">
              <h2 className="text-3xl md:text-4xl font-semibold">Video Stories</h2>
              <div className="h-[1px] flex-grow bg-gray-100" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {data.filter(t => t.type === "video").map((t) => {
                const embedUrl = getEmbedUrl(t.video_url);
                return (
                  <div key={t.id} className="group">
                    <div className="overflow-hidden rounded-[32px] bg-black aspect-video relative transition-transform duration-300 ">
                      {embedUrl ? (
                        <iframe
                          src={embedUrl}
                          className="w-full h-full"
                          allowFullScreen
                        />
                      ) : (
                        <a 
                          href={t.video_url || "#"} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="w-full h-full flex flex-col items-center justify-center bg-gray-900 group-hover:bg-gray-800 transition-colors"
                        >
                          <div className="bg-white/10 p-5 rounded-full mb-3">
                            <Play className="text-[#289BD0] fill-[#289BD0]" size={32} />
                          </div>
                          <span className="text-white text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                            Watch External Video <ExternalLink size={14} />
                          </span>
                        </a>
                      )}
                    </div>
                    
                    <div className="mt-6 px-2 flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        {t.thumbnail_url ? (
                          <img 
                            src={t.thumbnail_url} 
                            alt={t.name}
                            className="w-14 h-14 rounded-full object-cover "
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-full bg-[#F9F9F9] border-2 border-gray-100 flex items-center justify-center text-gray-400">
                            <User size={24} />
                          </div>
                        )}
                        <div className="flex flex-col">
                          <span className="text-xl font-bold leading-tight">{t.name}</span>
                          <span className="text-[10px] uppercase tracking-widest text-[#289BD0] font-black mt-1">Verified Member</span>
                        </div>
                      </div>
                      <div className="text-[#289BD0] font-bold text-sm">
                        {"★".repeat(t.rating ?? 5)}
                      </div>
                    </div>

                    {t.feedback && (
                       <p className="mt-4 px-2 text-gray-600 italic text-sm leading-relaxed">
                        "{t.feedback}"
                       </p>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* ---------- TEXT TESTIMONIALS ---------- */}
          <section className="space-y-10">
            <div className="flex items-center gap-4">
              <h2 className="text-3xl md:text-4xl font-semibold">Community Feedback</h2>
              <div className="h-[1px] flex-grow bg-gray-100" />
            </div>

            <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
              {data.filter(t => t.type === "text").map((t) => (
                <div 
                  key={t.id} 
                  className="break-inside-avoid bg-[#F9F9F9] p-8 rounded-[32px] flex flex-col space-y-6 transition-all hover:bg-[#F0F9FF]"
                >
                  <div className="flex items-center gap-4">
                    {t.thumbnail_url ? (
                      <img 
                        src={t.thumbnail_url} 
                        alt={t.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-300">
                        <User size={20} />
                      </div>
                    )}
                    <div>
                      <p className="font-bold leading-none text-lg">{t.name}</p>
                      <div className="flex text-[#289BD0] text-xs mt-1.5">
                        {"★".repeat(t.rating ?? 5)}
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 leading-relaxed italic text-sm">
                    “{t.feedback}”
                  </p>

                  <div className="flex justify-end opacity-10">
                    <img src="/image/icebathhero.png" className="h-6 w-auto grayscale" alt="" />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}