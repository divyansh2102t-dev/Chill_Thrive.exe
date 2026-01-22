"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type TestimonialPreview = {
  id: string;
  type: "text" | "video";
  name: string;
  feedback?: string | null;
  video_url?: string | null;
};

export default function TestimonialsPreview() {
  const router = useRouter();
  const [testimonials, setTestimonials] = useState<TestimonialPreview[]>([]);

  useEffect(() => {
    const fetchTestimonials = async () => {
      const { data, error } = await supabase
        .from("testimonials")
        .select("id,type,name,feedback,video_url")
        .eq("is_visible", true)
        .order("created_at", { ascending: false })
        .limit(4);

      if (!error && data) {
        setTestimonials(data);
      }
    };

    fetchTestimonials();
  }, []);

  if (testimonials.length === 0) return null;

  return (
    <section className="md:w-[960px] mx-auto py-16 space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <h2 className="text-6xl font-semibold">Testimonials</h2>

        <Button
          variant="ghost"
          onClick={() => router.push("/testimonials")}
          className="text-2xl text-gray-400 font-light"
        >
          View all →
        </Button>
      </div>

      {/* Preview Grid */}
      <div className="flex flex-wrap flex-row gap-6">
        {testimonials.map((t) => (
          // <Card key={t.id} className="bg-white shadow-sm">
          //   <CardContent className="p-4 space-y-3">
              // {t.type === "video" && t.video_url ? (
              //   <iframe
              //     src={t.video_url}
              //     className="w-full h-40 rounded-md"
              //     allowFullScreen
              //   />
              // ) : (
              //   <p className="text-sm text-gray-600 line-clamp-4">
              //     “{t.feedback}”
              //   </p>
              // )}

              // <p className="text-sm font-medium">
              //   — {t.name}
              // </p>
          //   </CardContent>
          // </Card>
          <div className="w-100 p-4 border-2">
                  {t.type === "video" && t.video_url ? (
                <iframe
                  src={t.video_url}
                  className="w-full h-60 rounded-md"
                  allowFullScreen
                />
              ) : (
                <p className="text-sm text-gray-600 line-clamp-4">
                  “{t.feedback}”
                </p>
              )}
              <p className="text-2xl font-medium mt-4">
                {t.name}
              </p>

          </div>
        ))}
      </div>
    </section>
  );
}
