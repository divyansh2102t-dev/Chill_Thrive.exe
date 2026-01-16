"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";

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
      setLoading(false);
    };

    fetchTestimonials();
  }, []);

  if (loading) {
    return (
      <div className="md:w-[760px] mx-auto py-16 text-center text-gray-500">
        Loading testimonials…
      </div>
    );
  }

  return (
    <div className="md:w-[760px] mx-auto py-16 space-y-12">
      <header className="text-center space-y-3">
        <h1 className="text-3xl font-bold">Testimonials</h1>
        <p className="text-gray-500">
          What our community says about Chill Thrive
        </p>
      </header>

      {/* ---------- TEXT TESTIMONIALS ---------- */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Text Testimonials</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {data
            .filter((t) => t.type === "text")
            .map((t) => (
              <Card key={t.id} className="bg-white shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">{t.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-gray-600">
                    {t.feedback}
                  </p>

                  {t.rating && (
                    <div className="text-sm">
                      {"★".repeat(t.rating)}
                      {"☆".repeat(5 - t.rating)}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
        </div>
      </section>

      {/* ---------- VIDEO TESTIMONIALS ---------- */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Video Testimonials</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {data
            .filter((t) => t.type === "video")
            .map((t) => (
              <Card key={t.id} className="bg-white shadow-sm overflow-hidden">
                <iframe
                  src={t.video_url!}
                  className="w-full h-[220px]"
                  allowFullScreen
                />
                <CardContent className="pt-4">
                  <p className="font-medium">{t.name}</p>
                </CardContent>
              </Card>
            ))}
        </div>
      </section>
    </div>
  );
}
