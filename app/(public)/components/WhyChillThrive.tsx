"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

const reasons = [
  {
    title: "Science-backed recovery",
    description:
      "Protocols designed using proven recovery science for real physiological benefits.",
  },
  {
    title: "Trained professionals",
    description:
      "Sessions guided by certified staff ensuring safety, comfort, and correct usage.",
  },
  {
    title: "Hygienic & premium setup",
    description:
      "Clean, sanitized, and premium-grade equipment maintained to high standards.",
  },
  {
    title: "Community-driven wellness",
    description:
      "A space built around consistency, accountability, and shared wellness goals.",
  },
];

export default function WhyChillThrive() {
  return (
    <section className="md:w-[760px] mx-auto py-16">
      <h2 className="text-3xl font-bold mb-8 text-center">
        Why Chill Thrive
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {reasons.map((item, index) => (
          <Card
            key={index}
            className="bg-white border shadow-sm hover:shadow-md transition"
          >
            <CardHeader className="space-y-2">
              <CardTitle className="text-lg font-semibold">
                {item.title}
              </CardTitle>
              <CardDescription className="text-sm text-gray-500">
                {item.description}
              </CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </section>
  );
}
