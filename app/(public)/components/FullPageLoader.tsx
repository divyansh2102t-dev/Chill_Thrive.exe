// components/FullPageLoader.tsx
"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

type Props = {
  visible: boolean;
};

export default function FullPageLoader({ visible }: Props) {
  const loaderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loaderRef.current) return;

    if (visible) {
      // ensure visible state (initial / re-entry safe)
      gsap.set(loaderRef.current, {
        opacity: 1,
        pointerEvents: "auto",
      });
    } else {
      // exit animation
      gsap.to(loaderRef.current, {
        opacity: 0,
        duration: 0.8,
        ease: "power2.out",
        onComplete: () => {
          gsap.set(loaderRef.current, { pointerEvents: "none" });
        },
      });
    }
  }, [visible]);

  return (
    <div
      ref={loaderRef}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-white"
    >
      <img
        src="/animation-elements/loadingScreen.svg"
        alt="Loading"
      />
    </div>
  );
}
