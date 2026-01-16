import { supabase } from "@/lib/supabase/client";
import GalleryClient from "./GalleryClient";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ id: string }>;
};

/* ---------- SEO METADATA ---------- */
export async function generateMetadata(
  { params }: Props
): Promise<Metadata> {
  const { id } = await params;

  const { data: event } = await supabase
    .from("gallery_events")
    .select("title, description")
    .eq("id", id)
    .single();

  if (!event) {
    return {
      title: "Event Not Found | Chill Thrive",
    };
  }

  return {
    title: `${event.title} | Chill Thrive`,
    description: event.description ?? "Chill Thrive gallery event",
    openGraph: {
      title: event.title,
      description: event.description ?? "",
      type: "website",
    },
  };
}

/* ---------- PAGE ---------- */
export default async function EventGalleryPage({ params }: Props) {
  const { id } = await params;

  const { data: event } = await supabase
    .from("gallery_events")
    .select("*")
    .eq("id", id)
    .single();

  const { data: images } = await supabase
    .from("gallery_images")
    .select("*")
    .eq("event_id", id)
    .order("sort_order");

  if (!event) return null;

  return (
    <GalleryClient
      event={event}
      images={images ?? []}
    />
  );
}
