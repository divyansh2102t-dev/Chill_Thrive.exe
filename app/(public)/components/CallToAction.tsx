"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function CallToAction() {
  const router = useRouter();

  return (
    <section className="md:w-[760px] mx-auto py-20">
      <div className="border rounded-xl bg-white shadow-sm px-6 py-12 text-center space-y-6">
        <h2 className="text-3xl font-bold">
          Start Your Recovery Journey Today
        </h2>

        <p className="text-gray-500 max-w-md mx-auto">
          Book your session and experience structured, science-backed recovery.
        </p>

        <Button
          size="lg"
          onClick={() => router.push("/services")}
        >
          Book a Session
        </Button>
      </div>
    </section>
  );
}
