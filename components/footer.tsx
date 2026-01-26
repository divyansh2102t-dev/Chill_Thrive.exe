"use client";

import { useState } from "react";
import Link from "next/link";

type FooterItems = {
  social: string;
  icon: string;
};

export default function Footer() {
  const [isOpen, setIsOpen] = useState(false);

  const footerItems: FooterItems[] = [
    { icon: "https://www.iconpacks.net/icons/2/free-instagram-logo-icon-3497-thumb.png", social: "https://www.instagram.com/chill.thrive/" },
    { icon: "https://img.icons8.com/ios-filled/50/1A1A1A/linkedin.png", social: "https://www.linkedin.com/in/chill-thrive-8a911b320/" },
    { icon: "https://img.icons8.com/ios-filled/50/youtube-play.png", social: "https://www.youtube.com/@ChillThrive" },
  ];

  return (
    <section>
        <div className="flex flex-col items-center my-20">
            <img className="w-60" src="/image/chillthrive-logo.jpg" alt="" />
            <div className="flex mt-5 gap-3">
            {footerItems.map((el, i) => (
            <div className="rounded-full bg-[#e3e3e3] p-2" key={i}>
                <a target="blank" href={el.social}><img className="h-8 w-8" src={el.icon} alt="" /></a>
            </div>
            ))}
            </div>
            <div className="mt-10">
            <span className="block text-center">Chill Thrive, LLC | © 2026 All rights reserved. <br /> Terms & Condition Apply </span>
            </div>
        </div>
    </section>
  );
}
