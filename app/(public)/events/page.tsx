"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";

type GalleryEvent = {
  id: string;
  category: "ice_bath" | "community_events" | "workshops" | "behind_the_scenes";
  title: string;
  description: string | null;
  cover_image?: string | null;
};

const CATEGORY_LABELS: Record<GalleryEvent["category"], string> = {
  ice_bath: "Ice Bath Sessions",
  community_events: "Community Events",
  workshops: "Workshops",
  behind_the_scenes: "Behind the Scenes",
};

export default function GalleryPage() {
  const router = useRouter();
  const [events, setEvents] = useState<GalleryEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      /**
       * Fetch events + first image as cover
       * Supabase will return an array for gallery_images
       */
      const { data, error } = await supabase
        .from("gallery_events")
        .select(
          `
          id,
          category,
          title,
          description,
          gallery_images (
            image_url,
            sort_order
          )
        `
        )
        .eq("is_visible", true)
        .order("created_at", { ascending: false });

      if (!error && data) {
        const normalized = data.map((e: any) => ({
          id: e.id,
          category: e.category,
          title: e.title,
          description: e.description,
          cover_image:
            e.gallery_images?.sort(
              (a: any, b: any) => a.sort_order - b.sort_order
            )[0]?.image_url ?? null,
        }));

        setEvents(normalized);
      }

      setLoading(false);
    };

    fetchEvents();
  }, []);

  if (loading) {
    return (
      <div className="md:w-[760px] mx-auto py-16 text-center text-gray-500">
        Loading gallery…
      </div>
    );
  }

  return (
    <div className="md:w-[760px] mx-auto py-16 space-y-16">
      {/* ---------- HEADER ---------- */}
      <header className="text-center space-y-3">
        <h1 className="text-3xl font-bold">Gallery</h1>
        <p className="text-gray-500">
          Moments from sessions, events, and workshops at Chill Thrive
        </p>
      </header>

      {/* ---------- CATEGORY SECTIONS ---------- */}
      {Object.entries(CATEGORY_LABELS).map(([category, label]) => {
        const categoryEvents = events.filter(
          (e) => e.category === category
        );

        if (categoryEvents.length === 0) return null;

        return (
          <section key={category} className="space-y-6">
            <h2 className="text-2xl font-semibold">{label}</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {categoryEvents.map((event) => (
                <Card
                  key={event.id}
                  className="bg-white shadow-sm hover:shadow-md transition cursor-pointer overflow-hidden"
                  onClick={() => router.push(`/events/${event.id}`)}
                >
                  {event.cover_image && (
                    <img
                      src={event.cover_image}
                      alt={event.title}
                      className="w-full h-40 object-cover"
                    />
                  )}

                  <CardHeader>
                    <CardTitle className="text-lg">
                      {event.title}
                    </CardTitle>
                  </CardHeader>

                  {event.description && (
                    <CardContent>
                      <p className="text-sm text-gray-500 line-clamp-2">
                        {event.description}
                      </p>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
