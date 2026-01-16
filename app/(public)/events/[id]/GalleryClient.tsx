"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export default function GalleryClient({
  event,
  images,
}: {
  event: any;
  images: any[];
}) {
  const [activeImage, setActiveImage] = useState<string | null>(null);

  return (
    <div className="md:w-[760px] mx-auto py-12 space-y-8">
      {/* Header */}
      <div className="space-y-3">
        <Button variant="ghost" onClick={() => history.back()}>
          ← Back
        </Button>

        <h1 className="text-3xl font-bold">{event.title}</h1>
        <p className="text-gray-500">{event.description}</p>
      </div>

      {/* Gallery */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {images.map((img) => (
          <img
            key={img.id}
            src={img.image_url}
            className="rounded-lg cursor-pointer object-cover h-40 w-full hover:opacity-90 transition"
            onClick={() => setActiveImage(img.image_url)}
          />
        ))}
      </div>

      {/* Image popup */}
      <Dialog open={!!activeImage} onOpenChange={() => setActiveImage(null)}>
        <DialogContent className="max-w-4xl p-0 bg-transparent border-none">
          <img
            src={activeImage ?? ""}
            className="rounded-lg w-full"
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
