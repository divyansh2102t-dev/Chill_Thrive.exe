"use client";

import { useState } from "react";
import Link from "next/link";

type NavItem = {
  label: string;
  href: string;
};

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  const navItems: NavItem[] = [
    { label: "services", href: "/services" },
    { label: "awareness", href: "/awareness" },
    { label: "about us", href: "/about" },
    { label: "contact us", href: "/contact" },
    { label: "events", href: "/events" },
    { label: "testimonials", href: "/testimonials" },
  ];

  return (
    <section id="header">
        <div className="flex items-center justify-center">
            <a  href="/">
                <img
                src="/image/chillthrive-logo.png"
                alt="Chill Thrive Logo"
                className="w-15 mr-10"
                />
            </a>

            {navItems.map((el, i) => (
                <span
                key={i}
                className="ml-10 text-xl font-light fill-background hover:text-[#289BD0] cursor-pointer text-gray-600"
                >
                <a href={`${el.href}`}>{el.label}</a>
                </span>
            ))}

            <a className="ml-20" href="/booking">
                <span className="font-light text-xl underline hover:no-underline">
                    book
                </span>
            </a>
        </div>
    </section>
  );
}
