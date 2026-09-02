"use client";

import { Calendar, Home, Users, Ticket } from "lucide-react";
import { useRouter } from "next/navigation";
import { BottomDock, type DockLink } from "@/components/layout/bottom-dock";
import { scrollToLenis } from "@/lib/lenis";
import { useScrollSection } from "@/lib/use-scroll-section";

export function EventsNav() {
  const router = useRouter();
  const section = useScrollSection(["events", "booking"]);

  const go = (selector: string, href: string) => {
    if (!scrollToLenis(selector)) router.push(href);
  };

  const LINKS: DockLink[] = [
    {
      label: "Home",
      icon: <Home size={20} strokeWidth={1.75} />,
      onClick: () => router.push("/"),
    },
    {
      label: "About",
      icon: <Users size={20} strokeWidth={1.75} />,
      onClick: () => router.push("/about"),
    },
    {
      label: "Events",
      icon: <Calendar size={20} strokeWidth={1.75} />,
      onClick: () => go('[data-section="events"]', "/events"),
      active: section === "events",
    },
    {
      label: "Booking",
      icon: <Ticket size={20} strokeWidth={1.75} />,
      onClick: () => go('[data-section="booking"]', "/booking"),
      active: section === "booking",
    },
  ];

  return <BottomDock items={LINKS} />;
}
