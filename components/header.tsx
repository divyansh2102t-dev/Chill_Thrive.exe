"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react"; // Standard icons

gsap.registerPlugin(ScrollTrigger);

type NavItem = {
  label: string;
  href: string;
};

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  const navItems: NavItem[] = [
    { label: "Services", href: "/services" },
    { label: "Awareness", href: "/awareness" },
    { label: "Events", href: "/events" },
    { label: "Founder", href: "/about" },
    { label: "Contact Us", href: "/contact" },
    { label: "Testimonials", href: "/testimonials" },
  ];

  const navRight: NavItem[] = navItems.slice(0, 3);
  const navLeft: NavItem[] = navItems.slice(3, 6);

  const leftNavRef = useRef<HTMLDivElement>(null);
  const rightNavRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const hero = document.querySelector("#hero");
    let heroActive = false;
    let activeSide: "left" | "right" | null = null;

    gsap.set([leftNavRef.current, rightNavRef.current], { opacity: 1 });

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
      if (!heroActive || window.innerWidth < 768) return; 
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

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      st.kill();
    };
  }, [pathname]);

  return (
    <header className="sticky top-0 left-0 w-full z-50">
      <div className="relative">
        
        {/* LOGO */}
        <Link href="/" className="absolute top-10 left-6 md:left-10 z-50">
          <img
            src="/image/chillthrive-logo.png"
            alt="Chill Thrive Logo"
            className="w-20 md:w-25"
          />
        </Link>

        {/* MOBILE ACTIONS (Book + Hamburger) */}
        <div className="md:hidden absolute top-10 right-6 z-50 flex items-center gap-6">
          <Link href="/booking">
            <span className="font-light text-lg underline text-gray-600">
              book
            </span>
          </Link>
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-gray-600 focus:outline-none"
          >
            {isMenuOpen ? <X size={28} strokeWidth={1.5} /> : <Menu size={28} strokeWidth={1.5} />}
          </button>
        </div>

        {/* MOBILE SIDEBAR OVERLAY */}
        <div className={`
          fixed inset-0 bg-white/95 backdrop-blur-sm z-40 flex flex-col items-center justify-center transition-transform duration-500 ease-in-out md:hidden
          ${isMenuOpen ? "translate-x-0" : "translate-x-full"}
        `}>
          <nav className="flex flex-col gap-6 text-center">
            {navItems.map((el, i) => (
              <Link
                key={i}
                href={el.href}
                className="text-2xl font-light text-gray-600 hover:text-[#289BD0]"
                onClick={() => setIsMenuOpen(false)}
              >
                {el.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* DESKTOP UI - LEFT NAV */}
        <div ref={leftNavRef} className="hidden md:flex flex-col absolute left-0 z-40 pointer-events-auto top-[calc(50vh-42px)]">
          {navRight.map((el) => (
            <Link
              key={el.href}
              href={el.href}
              className="ml-10 text-xl font-light transition-colors mb-2 text-gray-600 hover:text-[#289BD0]"
            >
              {el.label}
            </Link>
          ))}
        </div>

        {/* DESKTOP UI - RIGHT NAV */}
        <div ref={rightNavRef} className="hidden md:flex flex-col absolute z-40 right-0 top-[calc(50vh-42px)]">
          {navLeft.map((el) => (
            <Link
              key={el.href}
              href={el.href}
              className="mr-10 text-xl font-light transition-colors text-end mb-2 text-gray-600 hover:text-[#289BD0]"
            >
              {el.label}
            </Link>
          ))}
        </div>

        {/* DESKTOP UI - BOOKING LINK */}
        <Link id="book" className="hidden md:block absolute top-10 right-10 rounded-2xl" href="/booking">
          <span className="font-light text-xl underline hover:no-underline text-gray-600">
            book a service
          </span>
        </Link>
      </div>
    </header>
  );
}