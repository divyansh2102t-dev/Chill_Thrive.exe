"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import Link from "next/link";

import { usePathname } from "next/navigation";

gsap.registerPlugin(ScrollTrigger);

type NavItem = {
  label: string;
  href: string;
};

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const pathname = usePathname(); // 2. Initialize it

  // const navItems: NavItem[] = [
  //   { label: "services", href: "/services" },
  //   { label: "awareness", href: "/awareness" },
  //   { label: "events", href: "/events" },
  //   { label: "founder", href: "/about" },
  //   { label: "contact us", href: "/contact" },
  //   { label: "testimonials", href: "/testimonials" },
  // ];
  const navItems: NavItem[] = [
    { label: "Services", href: "/services" },
    { label: "Awareness", href: "/awareness" },
    { label: "Events", href: "/events" },
    { label: "Founder", href: "/about" },
    { label: "Contact Us", href: "/contact" },
    { label: "Testimonials", href: "/testimonials" },
  ];

  const navRight: NavItem[] = navItems.slice(0, 3);
  const navLeft: NavItem[] = navItems.slice(3, 6)

  // useEffect(() => {
  //   const onScroll = () => {
  //     const currentY = window.scrollY;

  //     // style change
  //     setScrolled(currentY > 40);

  //     // direction detection
  //     if (currentY > lastScrollY && currentY > 80) {
  //       setHidden(true); // scrolling down
  //     } else {
  //       setHidden(false); // scrolling up
  //     }

  //     setLastScrollY(currentY);
  //   };

  //   window.addEventListener("scroll", onScroll, { passive: true });
  //   return () => window.removeEventListener("scroll", onScroll);
  // }, [lastScrollY]);

  const leftNavRef = useRef<HTMLDivElement>(null);
  const rightNavRef = useRef<HTMLDivElement>(null);
  const leftZoneRef = useRef<HTMLDivElement>(null);
  const rightZoneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 3. This block now runs every time the URL changes
    const hero = document.querySelector("#hero");
    let heroActive = false;
    let activeSide: "left" | "right" | null = null;

    // Reset styles immediately on page change
    gsap.set([leftNavRef.current, rightNavRef.current], {
      opacity: 1,
    });

    // Create your ScrollTrigger
    const st = ScrollTrigger.create({
      trigger: hero,
      start: "top top",
      end: "bottom top",
      onEnter: () => { heroActive = false; },
      onEnterBack: () => {
        heroActive = false;
        show(rightNavRef.current);
        show(leftNavRef.current);
      },
      onLeave: () => {
        heroActive = true;
        hideBoth();
      },
    });

    const onMouseMove = (e: MouseEvent) => {
      if (!heroActive) return;
      const vw = window.innerWidth;
      const x = e.clientX;
      const threshold = vw * 0.15;

      if (x < threshold && activeSide !== "left") {
        activeSide = "left";
        show(leftNavRef.current);
        hide(rightNavRef.current);
      } 
      else if (x > vw - threshold && activeSide !== "right") {
        activeSide = "right";
        show(rightNavRef.current);
        hide(leftNavRef.current);
      } 
      else if (x >= threshold && x <= vw - threshold && activeSide !== null) {
        activeSide = null;
        hideBoth();
      }
    };

    window.addEventListener("mousemove", onMouseMove);

    function show(el: HTMLElement | null) {
      if (!el) return;
      gsap.to(el, { opacity: 1, duration: 0.35, ease: "sine.out", overwrite: "auto" });
    }

    function hide(el: HTMLElement | null) {
      if (!el) return;
      gsap.to(el, { opacity: 0, duration: 0.25, ease: "sine.in", overwrite: "auto" });
    }

    function hideBoth() {
      hide(leftNavRef.current);
      hide(rightNavRef.current);
      activeSide = null;
    }

    // 4. CLEANUP: Crucial for page transitions
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      st.kill(); // Kill the specific trigger
      ScrollTrigger.getAll().forEach(t => t.kill()); // Kill all others to be safe
    };
  }, [pathname]); // 5. Pathname dependency triggers the reset

  return (
    <header
      className={` sticky
        top-0 left-0 w-full z-50
      `}
    >
      <div
        className={`
        `}
      >
        <Link href="/" className="absolute top-10 left-10">
          <img
            src="/image/chillthrive-logo.png"
            alt="Chill Thrive Logo"
            className={`w-25`}
          />
        </Link>
        
        <div className="md:hidden">
          {navItems.map((el, i) => (
            <Link
              key={i}
              href={el.href}
              className={`
                ml-10 text-xl font-light transition-colors
                ${scrolled ? "text-gray-800" : "text-gray-600"}
                hover:text-[#289BD0]
              `}
            >
              {el.label}
            </Link>
          ))}
        </div>

        <div  ref={leftNavRef} className="flex flex-col absolute left-0 z-40 pointer-events-auto top-[calc(50vh-42px)]">
          {
            navRight.map((el, i) => (
              <Link
              key={el.href}
              href={el.href}
              className={`
                ml-10 text-xl font-light transition-colors mb-2
                ${scrolled ? "text-gray-800" : "text-gray-600"}
                hover:text-[#289BD0]
              `}
            >
              {el.label}
            </Link>
            ))
          }
        </div>

        <div ref={rightNavRef} className="flex flex-col absolute z-40  right-0 top-[calc(50vh-42px)]">
          {
            navLeft.map((el, i) => (
              <Link
              key={el.href}
              href={el.href}
              className={`
                mr-10 text-xl font-light transition-colors text-end mb-2
                ${scrolled ? "text-gray-800" : "text-gray-600"}
                hover:text-[#289BD0]
              `}
            >
              {el.label}
            </Link>
            ))
          }
        </div>

        <Link id="book" className="absolute top-10 right-10 rounded-2xl" href="/booking">
          <span className="font-light text-xl underline hover:no-underline">
            book a service
          </span>
        </Link>
      </div>
    </header>
  );
}
