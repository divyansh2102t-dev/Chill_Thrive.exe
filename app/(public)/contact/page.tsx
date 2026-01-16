"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export default function ContactPage() {
  return (
    <div className="md:w-[760px] mx-auto py-16 space-y-12">
      {/* ---------- HEADER ---------- */}
      <header className="text-center space-y-3">
        <h1 className="text-3xl font-bold">Contact Us</h1>
        <p className="text-gray-500">
          Get in touch for bookings, questions, or collaborations.
        </p>
      </header>

      {/* ---------- DETAILS ---------- */}
      <Card className="bg-white shadow-sm">
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4 text-sm">
          <div>
            <p className="font-medium">Phone</p>
            <p className="text-gray-500">+91 98765 43210</p>
          </div>

          <div>
            <p className="font-medium">Email</p>
            <p className="text-gray-500">hello@chillthrive.in</p>
          </div>

          <div>
            <p className="font-medium">Address</p>
            <p className="text-gray-500">
              Chill Thrive Wellness Studio,<br />
              Surat, Gujarat, India
            </p>
          </div>
        </CardContent>
      </Card>

      {/* ---------- MAP ---------- */}
      <Card className="overflow-hidden bg-white shadow-sm">
        <iframe
          title="Google Maps"
          src="https://www.google.com/maps?q=Surat%2C%20Gujarat&output=embed"
          className="w-full h-[300px] border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </Card>

      {/* ---------- CONTACT FORM ---------- */}
      <Card className="bg-white shadow-sm">
        <CardHeader>
          <CardTitle>Send a Message</CardTitle>
        </CardHeader>

        <CardContent>
          <form className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="Your full name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                placeholder="Your phone number"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                placeholder="Write your message here..."
                rows={4}
              />
            </div>

            <Button type="submit" className="w-full">
              Submit
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
