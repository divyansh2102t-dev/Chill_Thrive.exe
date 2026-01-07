import Image from "next/image";

export default function Home() {
  return (
    <div className="font-sans">
      <section>
        <div className="flex items-center justify-center">
          <a href="/">
            <img
              src="/image/chillthrive.jpg"
              alt="Chill Thrive Logo"
              className="w-40 mr-15"
            />
          </a>

          {[
            "services",
            "awareness",
            "about us",
            "contact us",
            "events",
            "testimonials",
          ].map((el, i) => (
            <span key={i} className="ml-10 text-xl font-light fill-background hover:text-[#289BD0] cursor-pointer text-gray-600">
              <a href={`/${el}`}>{el}</a>
            </span>
          ))}
        </div>

        <div className="mt-5 flex items-center justify-center mx-auto">
          <img src="/image/icebathhero.png" alt="" className="h-100" />
          <div className="flex flex-col ml-5">
            <span className="text-[84px] leading-[80px]">Welcome to</span>
            <div className="flex flex-row">
              <span className="text-[115px] leading-[100px] text-[#289BD0]">Chill&nbsp;</span>
              <span className="text-[115px] leading-[100px] text-[#5DB4DB]">Thrive</span>
            </div>
            <span className="text-[28px] mt-3 font-[400]">Where <a href="" className="underline text-[#00FF48]">Recovery</a> Meets Resilience.</span>
            <span className="text-[22px] mt-9 font-[400]">Rejuvenate your body. <br />
                  Reset your mind.</span>
          </div>
        </div>

        <div className="my-12 flex justify-center text-[32px]">
          <a className="bg-[#289BD0] text-white rounded-2xl hover:scale-105" href="">&nbsp;Book&nbsp;</a>&nbsp;a session right now
        </div>
      </section>
      <section className="">
      <br />
        <div>
          <div className="my-12 flex justify-center text-[44px] mb-20">
            <a className="bg-[#289BD0] text-white rounded-2xl" href="">&nbsp;Explore Services&nbsp;</a>
        </div>

        <div className="flex justify-center flex-wrap gap-20">
          {[
            ["/image/blankimage.png", "Ice Bath", "about ice bath"],
            ["/image/blankimage.png", "Jacuzzi", "about Jacuzzi"],
            ["/image/blankimage.png", "Steam Bath", "about Steam Bath"],
            ["/image/blankimage.png", "Combo Therapy", "about Combo Therapy"],
          ].map((el, i) => (
            <div className="bg-[#F9F9F9] p-8">
              <img className="w-100 h-100 rounded-3xl" src={el[0]} alt="" />
              <div className="">
                <div className="flex flex-rol w-full justify-between mt-8 mb-2">
                  <span className="text-4xl font-semibold">{el[1]}</span>
                  <a href=""><img className="bg-[#289BD0] h-10 w-10 p-2.25 rounded-2xl" src="/image/arrow01.svg" alt="" />
                </a></div>
                <span className="">{el[2]}</span>
              </div>
            </div>
          ))}
          </div>
        </div>
      </section>
      <section>
        <div className="flex flex-col items-center my-20">
          <img className="w-60" src="/image/chillthrive.jpg" alt="" />
          <div className="flex mt-5 gap-3">
            {[
            ["https://www.iconpacks.net/icons/2/free-instagram-logo-icon-3497-thumb.png", "https://www.instagram.com/chill.thrive/"],
            ["https://img.icons8.com/ios-filled/50/1A1A1A/linkedin.png", "https://www.linkedin.com/in/chill-thrive-8a911b320/"],
          ].map((el, i) => (
            <div className="rounded-full bg-[#e3e3e3] p-2">
              <a target="blank" href={el[1]}><img className="h-8 w-8" src={el[0]} alt="" /></a>
            </div>
          ))}
          </div>
          <div className="mt-10">
            <span className="block text-center">Chill Thrive, LLC | © 2026 All rights reserved. <br /> Terms & Condition Apply </span>
          </div>
        </div>
      </section>
    </div>
  );
}
