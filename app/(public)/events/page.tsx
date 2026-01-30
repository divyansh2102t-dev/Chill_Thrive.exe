"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import FullPageLoader from "@/components/FullPageLoader";

type GalleryEvent = {
  id: string;
  category: string;
  title: string;
  description: string | null;
  cover_image?: string | null;
};

const CATEGORY_LABELS: Record<string, string> = {
  ice_bath: "Ice Bath Sessions",
  community_events: "Community Events",
  workshops: "Workshops",
  behind_the_scenes: "Behind the Scenes",
  general: "General",
};

export default function GalleryPage() {
  const router = useRouter();
  const [events, setEvents] = useState<GalleryEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      const { data, error } = await supabase
        .from("gallery_events")
        .select(`id, category, title, description, gallery_images (image_url, sort_order)`)
        .eq("is_visible", true)
        .order("created_at", { ascending: false });

      if (!error && data) {
        const normalized = data.map((e: any) => ({
          id: e.id,
          category: e.category,
          title: e.title,
          description: e.description,
          cover_image: e.gallery_images?.sort((a: any, b: any) => a.sort_order - b.sort_order)[0]?.image_url ?? null,
        }));
        setEvents(normalized);
      }
      setTimeout(() => setLoading(false), 400);
    };
    fetchEvents();
  }, []);

  return (
    <>
      <FullPageLoader visible={loading} />
      <div className="bg-white min-h-screen font-sans text-black pb-24">
        {/* HERO */}
        <section className="pt-24 pb-16 px-6 text-center">
          <div className="max-w-[1080px] mx-auto space-y-4">
            <h1 className="text-[72px] md:text-[82px] leading-tight font-regular tracking-tight">
              Captured <span className="text-[#289BD0]">Vibes</span>
            </h1>
            <p className="text-xl md:text-2xl font-light text-gray-500 max-w-2xl mx-auto pt-4">
              Explore the moments that define our community and recovery culture.
            </p>
          </div>
        </section>

        <div className="max-w-[1100px] mx-auto px-6 space-y-20">
          {Object.entries(CATEGORY_LABELS).map(([category, label]) => {
            const categoryEvents = events.filter((e) => e.category === category);
            if (categoryEvents.length === 0) return null;

            return (
              <section key={category} className="space-y-10">
                <div className="flex items-center gap-4">
                  <h2 className="text-3xl font-semibold">{label}</h2>
                  <div className="h-[1px] flex-grow bg-[#F9F9F9]" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  {categoryEvents.map((event) => (
                    <div 
                      key={event.id}
                      className="group cursor-pointer"
                      onClick={() => router.push(`/events/${event.id}`)}
                    >
                      <div className="overflow-hidden rounded-[40px] bg-[#F9F9F9] aspect-[16/10] relative">
                        {event.cover_image && (
                          <img
                            src={event.cover_image}
                            alt={event.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                        )}
                        <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-md p-3 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity">
                           <img src="/image/arrow01.svg" className="h-5 w-5" alt="View" />
                        </div>
                      </div>
                      <div className="mt-6 px-2 space-y-2">
                        <h3 className="text-2xl font-bold group-hover:text-[#289BD0] transition-colors">{event.title}</h3>
                        <p className="text-gray-500 font-light line-clamp-2">{event.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </>
  );
}