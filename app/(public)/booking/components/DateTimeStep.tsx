"use client";

import { useEffect, useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";

type Slot = {
  id: string;
  start_time: string;
  end_time: string;
  capacity: number;
};

export default function DateTimeStep({
  date,
  time,
  onBack,
  onNext,
}: {
  date: Date | null;
  time: {
		slotId: string;
		label: string;
	} | null;
  onBack: () => void;
  onNext: (
		d: Date,
		t: { slotId: string; label: string }
	) => void;

}) {
  const today = new Date();
	today.setHours(0, 0, 0, 0);

	const [selectedDate, setSelectedDate] = useState<Date | null>(
	date ?? today
	);

  const [selectedTime, setSelectedTime] = useState<{
		slotId: string;
		label: string;
	} | null>(time);

  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (!selectedDate) return;

		setSelectedTime(null); // 🔴 reset time on date change

		const fetchSlots = async () => {
			setLoading(true);
			const isoDate = selectedDate.toISOString().split("T")[0];

			const res = await fetch(`/api/slots?date=${isoDate}`);
			const data = await res.json();

			setSlots(data.slots ?? []);
			setLoading(false);
		};

		fetchSlots();
	}, [selectedDate]);


	const [autoAdvanced, setAutoAdvanced] = useState(false);

	useEffect(() => {
		if (selectedDate && selectedTime && !autoAdvanced) {
			setAutoAdvanced(true);
			onNext(selectedDate, selectedTime);
		}
	}, [selectedDate, selectedTime, autoAdvanced]);


  return (
    <>
      <h2 className="text-2xl font-semibold mb-6">Select Date & Time</h2>

      {/* DATE + TIME IN ROW */}
      <div className="flex flex-col md:flex-row gap-8">
        {/* DATE */}
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
        />

        {/* TIME */}
        <div className="flex-1">
          <p className="font-medium mb-3">Available Time Slots</p>

          {loading && <p className="text-sm text-gray-500">Loading slots…</p>}

          {!loading && slots.length === 0 && (
            <p className="text-sm text-gray-500">No slots available</p>
          )}

          <div className="grid grid-cols-2 gap-3">
            {slots.map((slot) => {
              const label = `${slot.start_time.slice(0,5)} – ${slot.end_time.slice(0,5)}`;

              const active = selectedTime === slot.id;

              return (
                <Button
										key={slot.id}
										variant={active ? "default" : "outline"}
										onClick={() =>
											setSelectedTime({
												slotId: slot.id,
												label: `${slot.start_time.slice(0,5)} – ${slot.end_time.slice(0,5)}`
											})
										}
									>
										{label}
									</Button>

              );
            })}
          </div>
        </div>
      </div>

	<Button
		variant="ghost"
		onClick={() => {
			setAutoAdvanced(false);
			onBack();
		}}
	>
		Back
	</Button>

    </>
  );
}
