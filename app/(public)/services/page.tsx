"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Service } from "../../../lib/types/service";
import { supabase } from "../../../lib/supabase/client";
import { Button } from "@/components/ui/button";
import { ServiceCardSkeleton } from "./components/ServiceCardSkeleton";

export default function Services() {
  const router = useRouter();

  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // local UI-only duration selection (per service)
  const [selectedDurations, setSelectedDurations] = useState<
    Record<string, number>
  >({});

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error } = await supabase
          .from("services")
          .select("*")
          .eq("is_active", true)
          .order("created_at", { ascending: false });

        if (error) throw error;

        const normalized: Service[] = (data ?? []).map((s) => ({
          id: s.id,
          slug: s.slug,
          title: s.title,
          type: s.type,

          mediaUrl: s.media_url, // ✅ FIX
          mediaType: s.media_type, // ✅ FIX
          ytUrl: s.yt_url ?? undefined, // ✅ FIX

          description: s.description,

          durationMinutes: s.duration_minutes ?? [],
          benefits: s.benefits ?? [],

          price: Number(s.price),
          originalPrice: s.original_price ?? undefined,

          currency: s.currency,

          badge: s.badge ?? undefined,
          includedServices: s.included_services ?? undefined,

          isActive: s.is_active,
          createdAt: s.created_at,
        }));

        setServices(normalized as Service[]);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load services"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  const singleServices = services.filter((s) => s.type === "single");
  const comboServices = services.filter((s) => s.type === "combo");

  const renderServiceCard = (s: Service) => {
    const durations = s.durationMinutes ?? [];
    const selectedDuration = selectedDurations[s.id] ?? durations[0];

    return (
      <article
        key={s.id}
        className="border rounded-lg bg-white shadow hover:shadow-lg transition overflow-hidden"
      >
        <img
          src={s.mediaUrl || "/placeholder.jpg"}
          alt={s.title}
          className="w-full h-40 object-cover"
        />

        <div className="p-4 space-y-4">
          <div>
            <h2 className="text-xl font-semibold">{s.title}</h2>
            <p className="text-sm text-gray-500">{s.slug}</p>
          </div>

          {/* Duration */}
          <div>
            <p className="text-sm font-medium mb-2">Duration</p>
            <div className="flex gap-2 flex-wrap">
              {durations.map((d) => (
                <Button
                  key={d}
                  size="sm"
                  variant={selectedDuration === d ? "default" : "outline"}
                  onClick={() =>
                    setSelectedDurations((prev) => ({
                      ...prev,
                      [s.id]: d,
                    }))
                  }
                >
                  {d} min
                </Button>
              ))}
            </div>
          </div>

          {/* Price + Book */}
          <div className="flex items-center justify-between">
            <p className="text-lg font-bold">₹{s.price}</p>

            <Button
              onClick={() =>
                router.push(
                  `/booking?serviceId=${s.id}&duration=${selectedDuration}`
                )
              }
            >
              Book
            </Button>
          </div>
        </div>
      </article>
    );
  };

  if (error) {
    return <div className="p-4 text-red-600">Error: {error}</div>;
  }

  return (
    <div className="md:w-[760px] mx-auto">
      <h1 className="text-3xl font-bold mb-8">Services</h1>

      {/* ---------- LOADING STATE ---------- */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <ServiceCardSkeleton key={i} />
          ))}
        </div>
      )}

      {!loading && (
        <>
          {/* ---------- INDIVIDUAL SERVICES ---------- */}
          {singleServices.length > 0 && (
            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-6">
                Individual Services
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                {singleServices.map(renderServiceCard)}
              </div>
            </section>
          )}

          {/* ---------- COMBO PACKAGES ---------- */}
          {comboServices.length > 0 && (
            <section>
              <h2 className="text-2xl font-semibold mb-6">Combo Packages</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-32gap-6">
                {comboServices.map(renderServiceCard)}
              </div>
            </section>
          )}

          {services.length === 0 && (
            <div className="text-center text-gray-500 mt-6">
              No services found.
            </div>
          )}
        </>
      )}
    </div>
  );
}
