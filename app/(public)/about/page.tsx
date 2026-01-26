import { supabase } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = {
  title: "Founder | Chill Thrive",
  description: "The story, vision, and mission behind Chill Thrive",
};

export default async function FounderPage() {
  // Fetching from Supabase - matching the schema provided
  const { data: founder } = await supabase
    .from("founder_content")
    .select("*")
    .limit(1)
    .single();

  if (!founder) {
    return (
      <div className="h-screen flex items-center justify-center text-gray-400">
        Content coming soon...
      </div>
    );
  }

  return (
    <div className="bg-[#FFFFFF] min-h-screen font-sans text-black">
      {/* ---------- HERO SECTION ---------- */}
      <section className="pt-24 pb-25 px-6">
        <div className="flex justify-center mb-10">
            <h1 className="text-6xl font-bold tracking-tight">
              <span className="text-[#289BD0]">Our</span> Founder
            </h1>
        </div>

        <div className="max-w-[1080px] mx-auto text-center space-y-8 flex flex-col justify-center gap-0">
          <div className="relative inline-block">
            <div className=""></div>
            <img
              src={founder.photo_url}
              alt={founder.founder_name}
              className="relative mx-auto w-100 h-150 object-cover"
            />
          </div>
          <div className="space-y-2">
            {/* <h1 className="text-6xl font-bold tracking-tight">
              <span className="text-[#289BD0]">The</span> Founder
            </h1> */}
            <p className="text-5xl font-light ">{founder.founder_name}</p>
          </div>
        </div>
      </section>

      <div className="max-w-[800px] mx-auto px-6 space-y-20 pb-24">
        {/* ---------- MISSION & VALUES (GRID) ---------- */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="bg-[#F9F9F9] border-none shadow-none rounded-3xl p-4">
            <CardHeader>
              <CardTitle className="text-[#289BD0] text-3xl">Mission</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-700 leading-relaxed">
              {founder.mission}
            </CardContent>
          </Card>

          <Card className="bg-[#F9F9F9] border-none shadow-none rounded-3xl p-4">
            <CardHeader>
              <CardTitle className="text-[#5DB4DB] text-3xl">Values</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-700 leading-relaxed">
              {founder.values}
            </CardContent>
          </Card>
        </section>

        {/* ---------- FOUNDER STORY (STAGGERED) ---------- */}
        <section className="space-y-12">
          <div className="space-y-4">
            <h2 className="text-4xl font-semibold border-l-4 border-[#289BD0] pl-6">
              Our Journey
            </h2>
            <p className="text-lg text-gray-600 leading-loose italic">
              {founder.story_journey}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-8">
            <div className="space-y-4">
              <h3 className="text-xl font-bold uppercase tracking-widest text-gray-400">The Vision</h3>
              <p className="text-gray-700 leading-relaxed">{founder.story_vision}</p>
            </div>
            <div className="space-y-4">
              <h3 className="text-xl font-bold uppercase tracking-widest text-gray-400">Why We Exist</h3>
              <p className="text-gray-700 leading-relaxed">{founder.story_why}</p>
            </div>
          </div>
        </section>

        {/* ---------- SIGNATURE QUOTE ---------- */}
        <section className="pt-10">
          <div className="relative p-12 text-center bg-black rounded-[40px] overflow-hidden">
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#289BD0] opacity-20 blur-3xl"></div>
            
            <span className="text-6xl text-[#289BD0] font-serif absolute top-6 left-10 opacity-50">“</span>
            <blockquote className="relative z-10 text-2xl md:text-3xl text-white font-light leading-snug">
              {founder.quote}
            </blockquote>
            <span className="text-6xl text-[#289BD0] font-serif absolute bottom-0 right-10 opacity-50">”</span>
            
            <p className="mt-8 text-[#5DB4DB] font-medium tracking-widest uppercase text-sm">
              — {founder.founder_name}
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}