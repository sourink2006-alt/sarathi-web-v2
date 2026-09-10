"use client";

import { useSyncExternalStore } from "react";
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

function subscribeToMobile(callback: () => void) {
  const mql = window.matchMedia("(max-width: 767px)");
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}

function getMobileSnapshot() {
  return window.matchMedia("(max-width: 767px)").matches;
}

function getMobileServerSnapshot() {
  return false;
}

/*
 * Home / continuous-journey nav.
 *
 * `/` composes Home hero + Events + Booking on mobile (HOME -> EVENTS -> BOOKING),
 * and Home hero + About + Events + Booking on desktop.
 */
export function Navbar() {
  const router = useRouter();
  const isMobile = useSyncExternalStore(
    subscribeToMobile,
    getMobileSnapshot,
    getMobileServerSnapshot,
  );

  const sections = isMobile
    ? ["home", "events", "booking"]
    : ["home", "about", "events", "booking"];
  const section = useScrollSection(sections);

  const go = (selector: string, href: string) => {
    if (!scrollToLenis(selector)) router.push(href);
  };

  const desktopLinks: DockLink[] = [
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

  const mobileLinks: DockLink[] = [
    {
      label: "Home",
      icon: <Home size={20} strokeWidth={1.75} />,
      onClick: () => go('[data-section="home"]', "/"),
      active: ACTIVE_MAP[section] === "Home",
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

  return <BottomDock items={isMobile ? mobileLinks : desktopLinks} />;
}
