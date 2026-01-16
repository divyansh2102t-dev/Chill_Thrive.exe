"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import type { Service } from "@/lib/types/service";
import { Button } from "@/components/ui/button";

type SelectedService = {
  service: Service;
  duration: number;
};

export default function ServiceStep({
  onSelect,
}: {
  onSelect: (data: SelectedService) => void;
}) {
  const [services, setServices] = useState<Service[]>([]);
  const [selectedDurations, setSelectedDurations] = useState<
    Record<string, number>
  >({});

  useEffect(() => {
    supabase
      .from("services")
      .select(
        "id,title,price,duration_minutes,media_url,media_type,type"
      )
      .eq("is_active", true)
      .then(({ data }) => {
        const normalized =
          data?.map((s: any) => ({
            ...s,
            durationMinutes: s.duration_minutes ?? [],
          })) ?? [];

        setServices(normalized);
      });
  }, []);

  return (
    <>
      <h2 className="text-2xl font-semibold mb-6">Select a Service</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {services.map((s) => {
          const durations = s.durationMinutes;
          const selectedDuration =
            selectedDurations[s.id] ?? durations[0];

          return (
            <div
              key={s.id}
              className="border rounded-lg p-4 space-y-3"
            >
              <p className="font-medium">{s.title}</p>

              <p className="text-sm text-gray-600">
                ₹{s.price}
              </p>

              {/* Duration selector */}
              <div className="flex flex-wrap gap-2">
                {durations.map((d) => (
                  <Button
                    key={d}
                    size="sm"
                    variant={
                      selectedDuration === d
                        ? "default"
                        : "outline"
                    }
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

              <Button
                className="w-full"
                onClick={() =>
                  onSelect({
                    service: s,
                    duration: selectedDuration,
                  })
                }
              >
                Select
              </Button>
            </div>
          );
        })}
      </div>
    </>
  );
}
