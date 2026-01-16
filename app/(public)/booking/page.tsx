// app/(public)/booking/page.tsx

export const dynamic = "force-dynamic";

import BookingClient from "./BookingClient";

export default function BookingPage() {
  return <BookingClient />;
}
