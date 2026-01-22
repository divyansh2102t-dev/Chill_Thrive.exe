"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function CallToAction() {
  const router = useRouter();

  return (
    <section className="h-screen flex align-center justify-center py-20">
      <div className="border rounded-xl bg-white px-30 py-40 text-center space-y-6 h-fit">
        <h2 className="text-3xl font-light">
          Start Your Recovery Journey Today
        </h2>

        <p className="opacity-50 font-light max-w-md mx-auto">
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
