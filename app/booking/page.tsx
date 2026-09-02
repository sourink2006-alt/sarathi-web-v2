import type { Metadata } from "next";
import { BookingPage } from "@/components/booking/booking-page";
import { BookingNav } from "@/components/booking/booking-nav";

export const metadata: Metadata = {
  title: "Booking | Sarathi Cultural Association",
  description:
    "Book prasad, choose membership access plans, and apply for a stall — Durga Puja 2026 at BBMP Ground, Koramangala, Bengaluru.",
};

export default function BookingPageRoute() {
  return (
    <>
      <main className="relative w-full">
        <BookingPage />
      </main>
      <BookingNav />
    </>
  );
}
