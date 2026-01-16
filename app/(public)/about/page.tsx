import { supabase } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = {
  title: "Founder | Chill Thrive",
  description: "The story, vision, and mission behind Chill Thrive",
};

export default async function FounderPage() {
  const { data: founder } = await supabase
    .from("founder_content")
    .select("*")
    .eq("is_active", true)
    .single();

  if (!founder) return null;

  return (
    <div className="md:w-[760px] mx-auto py-16 space-y-16">
      {/* ---------- HEADER ---------- */}
      <header className="text-center space-y-4">
        <img
          src={founder.photo_url}
          alt={founder.founder_name}
          className="mx-auto w-40 h-40 rounded-full object-cover"
        />
        <h1 className="text-3xl font-bold">
          {founder.founder_name}
        </h1>
      </header>

      {/* ---------- FOUNDER STORY ---------- */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Founder Story</h2>

        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle>Journey</CardTitle>
          </CardHeader>
          <CardContent className="text-gray-600">
            {founder.story_journey}
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle>Vision</CardTitle>
          </CardHeader>
          <CardContent className="text-gray-600">
            {founder.story_vision}
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle>Why Chill Thrive</CardTitle>
          </CardHeader>
          <CardContent className="text-gray-600">
            {founder.story_why}
          </CardContent>
        </Card>
      </section>

      {/* ---------- MISSION & VALUES ---------- */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle>Mission</CardTitle>
          </CardHeader>
          <CardContent className="text-gray-600">
            {founder.mission}
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle>Values</CardTitle>
          </CardHeader>
          <CardContent className="text-gray-600">
            {founder.values}
          </CardContent>
        </Card>
      </section>

      {/* ---------- QUOTE ---------- */}
      <section>
        <Card className="bg-white shadow-sm border-l-4 border-black">
          <CardContent className="italic text-lg text-gray-700 py-8">
            “{founder.quote}”
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
