"use client";

import { useEffect, useState } from "react";

type NavItem = {
  label: string;
  href: string;
};

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  const navItems: NavItem[] = [
    { label: "services", href: "/services" },
    { label: "awareness", href: "/awareness" },
    { label: "events", href: "/events" },
    { label: "about us", href: "/about" },
    { label: "contact us", href: "/contact" },
    { label: "testimonials", href: "/testimonials" },
  ];

  const navRight: NavItem[] = navItems.slice(0, 3);
  const navLeft: NavItem[] = navItems.slice(3, 6)

  useEffect(() => {
    const onScroll = () => {
      const currentY = window.scrollY;

      // style change
      setScrolled(currentY > 40);

      // direction detection
      if (currentY > lastScrollY && currentY > 80) {
        setHidden(true); // scrolling down
      } else {
        setHidden(false); // scrolling up
      }

      setLastScrollY(currentY);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [lastScrollY]);

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
        <a href="/" className="absolute top-10 left-10">
          <img
            src="/image/chillthrive-logo.png"
            alt="Chill Thrive Logo"
            className={`w-25`}
          />
        </a>
        
        <div className="md:hidden">
          {navItems.map((el, i) => (
            <a
              key={i}
              href={el.href}
              className={`
                ml-10 text-xl font-light transition-colors
                ${scrolled ? "text-gray-800" : "text-gray-600"}
                hover:text-[#289BD0]
              `}
            >
              {el.label}
            </a>
          ))}
        </div>

        <div className="flex flex-col absolute left-0 top-[44vh]">
          {
            navRight.map((el, i) => (
              <a
              key={i}
              href={el.href}
              className={`
                ml-10 text-xl font-light transition-colors
                ${scrolled ? "text-gray-800" : "text-gray-600"}
                hover:text-[#289BD0]
              `}
            >
              {el.label}
            </a>
            ))
          }
        </div>

        <div className="flex flex-col absolute right-0 top-[44vh]">
          {
            navLeft.map((el, i) => (
              <a
              key={i}
              href={el.href}
              className={`
                mr-10 text-xl font-light transition-colors text-end
                ${scrolled ? "text-gray-800" : "text-gray-600"}
                hover:text-[#289BD0]
              `}
            >
              {el.label}
            </a>
            ))
          }
        </div>

        <a className="absolute top-10 right-10" href="/booking">
          <span className="font-light text-xl underline hover:no-underline">
            book a service
          </span>
        </a>
      </div>
    </header>
  );
}
