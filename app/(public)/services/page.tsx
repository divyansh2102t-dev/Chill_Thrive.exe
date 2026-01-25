"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Service } from "../../../lib/types/service";
import { supabase } from "../../../lib/supabase/client";
import { Button } from "@/components/ui/button";
import FullPageLoader from "../../../components/FullPageLoader";
import { X, Play } from "lucide-react";

export default function Services() {
  const router = useRouter();

  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeVideo, setActiveVideo] = useState<string | null>(null);

  const [selectedDurations, setSelectedDurations] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("services")
          .select("*")
          .eq("is_active", true)
          .order("sort_order", { ascending: true });

        if (error) throw error;

        const normalized: Service[] = (data ?? []).map((s) => ({
          ...s,
          mediaUrl: s.media_url,
          mediaType: s.media_type,
          ytUrl: s.yt_url,
          durationMinutes: s.duration_minutes ?? [],
          benefits: s.benefits ?? [],
          // Normalize the prices array from the database
          prices: s.prices ?? [],
        }));

        setServices(normalized);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load services");
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  const renderServiceCard = (s: Service) => {
    const durations = s.durationMinutes ?? [];
    const selectedDuration = selectedDurations[s.id] ?? durations[0];
    
    // Logic to find the price corresponding to the selected duration's index
    const durationIndex = durations.indexOf(selectedDuration);
    const displayPrice = s.prices?.[durationIndex] ?? s.prices?.[0] ?? 0;

    return (
      <div
        className="bg-[#F9F9F9] p-6 w-full flex flex-col md:flex-row gap-8 relative"
        key={s.id}
      >
        {/* LEFT: Square Image (No Zoom) */}
        <div 
          className="relative w-full md:w-[400px] aspect-square shrink-0 cursor-pointer overflow-hidden rounded-3xl bg-gray-200"
          onClick={() => s.ytUrl && setActiveVideo(s.ytUrl)}
        >
          <img
            className="w-full h-full object-cover"
            src={s.mediaUrl || "/placeholder.jpg"}
            alt={s.title}
          />
          {s.ytUrl && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/10">
               <div className="bg-white p-4 rounded-full">
                 <Play className="fill-[#289BD0] text-[#289BD0] w-6 h-6" />
               </div>
            </div>
          )}
          
          {/* Tag: Black background, White text */}
          {s.type === "combo" && (
            <div className="absolute top-4 left-4 px-4 py-1.5 bg-black text-white text-[10px] font-bold uppercase tracking-widest rounded-full">
              Combo
            </div>
          )}
        </div>

        {/* RIGHT: Content */}
        <div className="flex flex-col flex-grow justify-between py-2">
          <div className="space-y-6">
            <div>
              <h3 className="text-4xl font-semibold text-black">{s.title}</h3>
              <p className="text-gray-400 text-sm mt-1">{s.slug}</p>
            </div>

            <p className="text-gray-600 leading-relaxed text-base">
              {s.description}
            </p>

            {/* Benefits: Simple list, no extra colors */}
            <div className="space-y-2">
              <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400 mb-3">Included Benefits</p>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {s.benefits?.map((benefit, idx) => (
                  <li key={idx} className="flex items-start text-sm text-black">
                    <span className="mr-2">•</span>
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-10 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6">
            {/* Duration Selector */}
            <div className="space-y-3">
              <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400">Duration</p>
              <div className="flex gap-2">
                {durations.map((d) => (
                  <button
                    key={d}
                    onClick={() => setSelectedDurations(prev => ({ ...prev, [s.id]: d }))}
                    className={`px-5 py-2.5 rounded-xl text-sm transition-colors ${
                      selectedDuration === d 
                        ? "bg-[#289BD0] text-white" 
                        : "bg-white text-black border border-gray-200"
                    }`}
                  >
                    {d} min
                  </button>
                ))}
              </div>
            </div>

            {/* Price & Book */}
            <div className="flex items-center gap-8">
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400">Investment</p>
                {/* Dynamically updated price based on duration selection */}
                <p className="text-3xl font-light">₹{displayPrice}</p>
              </div>
              <Button
                className="bg-black hover:bg-[#289BD0] text-white px-10 h-14 rounded-xl transition-colors shadow-none"
                onClick={() => router.push(`/booking?serviceId=${s.id}&duration=${selectedDuration}`)}
              >
                Book Now
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (error) return <div className="p-10 text-center text-red-500">{error}</div>;

  return (
    <div className="max-w-[1080px] mx-auto px-4 pb-24">
      <div className="h-[40vh] flex flex-col items-center justify-center">
        <h1 className="text-7xl font-thin tracking-tighter text-center">
          Our Services
        </h1>
      </div>

      <FullPageLoader visible={loading} />

      {!loading && (
        <div className="flex flex-col gap-12">
          {services.map(renderServiceCard)}
        </div>
      )}

      {/* VIDEO POPUP */}
      {activeVideo && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/90 p-4">
          <button 
            onClick={() => setActiveVideo(null)}
            className="absolute top-6 right-6 text-white hover:text-gray-300 transition-colors"
          >
            <X size={32} />
          </button>
          <div className="w-full max-w-4xl aspect-video bg-black rounded-xl overflow-hidden">
            <iframe
              src={activeVideo.includes('v=') ? activeVideo.replace("watch?v=", "embed/") : activeVideo}
              className="w-full h-full"
              allow="autoplay; encrypted-media"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </div>
  );
}