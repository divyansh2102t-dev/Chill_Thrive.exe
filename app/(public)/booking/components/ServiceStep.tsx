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
      <h2 className="text-2xl font-light mb-20 text-center">Select a Service</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {services.map((s) => {
          const durations = s.durationMinutes;
          const selectedDuration =
            selectedDurations[s.id] ?? durations[0];

          return (
            <div
              key={s.id}
              className="border rounded-sm p-8 space-y-3 flex flex-row justify-between"
            >

              <div className="flex flex-col h-full">
                <p className="font-medium text-2xl">{s.title}</p>

                <p className="text-2xl ">
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
              </div>

              <Button
                className="h-full"
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
