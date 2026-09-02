"use client";

import { Home, Users, Calendar, Ticket } from "lucide-react";
import { useRouter } from "next/navigation";
import { BottomDock, type DockLink } from "@/components/layout/bottom-dock";
import { scrollToLenis } from "@/lib/lenis";
import { useScrollSection } from "@/lib/use-scroll-section";

const ACTIVE_MAP: Record<string, string> = {
  home: "Home",
  about: "About",
  events: "Events",
  booking: "Booking",
};

/*
 * Home / continuous-journey nav.
 *
 * `/` now composes Home hero + About + Events + Booking into one scrolling
 * page, so the active dock item is driven by the section currently in view
 * (not hardcoded) and clicks smooth-scroll to the target section via Lenis.
 * The standalone `/about`, `/events` and `/booking` routes keep their own navs.
 */
export function Navbar() {
  const router = useRouter();
  const section = useScrollSection(["home", "about", "events", "booking"]);

  const go = (selector: string, href: string) => {
    if (!scrollToLenis(selector)) router.push(href);
  };

  const LINKS: DockLink[] = [
    {
      label: "Home",
      icon: <Home size={20} strokeWidth={1.75} />,
      onClick: () => go('[data-section="home"]', "/"),
      active: ACTIVE_MAP[section] === "Home",
    },
    {
      label: "About",
      icon: <Users size={20} strokeWidth={1.75} />,
      onClick: () => go('[data-section="about"]', "/about"),
      active: ACTIVE_MAP[section] === "About",
    },
    {
      label: "Events",
      icon: <Calendar size={20} strokeWidth={1.75} />,
      onClick: () => go('[data-section="events"]', "/events"),
      active: ACTIVE_MAP[section] === "Events",
    },
    {
      label: "Booking",
      icon: <Ticket size={20} strokeWidth={1.75} />,
      onClick: () => go('[data-section="booking"]', "/booking"),
      active: ACTIVE_MAP[section] === "Booking",
    },
  ];

  return <BottomDock items={LINKS} />;
}
