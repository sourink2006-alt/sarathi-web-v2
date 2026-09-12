import type { Metadata } from "next";
import { EventsPage } from "@/components/events/events-page";
import { EventsNav } from "@/components/events/events-nav";

export const metadata: Metadata = {
  title: "Events | Sarathi Cultural Association",
  description:
    "Durga Puja 2026 and the Food Festival — October 15–21, 2026 at BBMP Ground, 5th Block, Koramangala, Bengaluru.",
};

export default function EventsPageRoute() {
  return (
    <>
      <main className="relative w-full">
        <EventsPage />
      </main>
      <EventsNav />
    </>
  );
}