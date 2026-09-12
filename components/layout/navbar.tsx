"use client";

import { useSyncExternalStore } from "react";
import { Home, Users, Calendar, Ticket } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { BottomDock, type DockLink } from "@/components/layout/bottom-dock";

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

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const isMobile = useSyncExternalStore(
    subscribeToMobile,
    getMobileSnapshot,
    getMobileServerSnapshot,
  );

  const isHome = pathname === "/";
  const isAbout = pathname === "/about" || pathname.startsWith("/about/");
  const isEvents = pathname === "/events" || pathname.startsWith("/events/");
  const isBooking = pathname === "/booking" || pathname.startsWith("/booking/");

  const desktopLinks: DockLink[] = [
    {
      label: "Home",
      icon: <Home size={20} strokeWidth={1.75} />,
      onClick: () => router.push("/"),
      active: isHome,
    },
    {
      label: "About",
      icon: <Users size={20} strokeWidth={1.75} />,
      onClick: () => router.push("/about"),
      active: isAbout,
    },
    {
      label: "Events",
      icon: <Calendar size={20} strokeWidth={1.75} />,
      onClick: () => router.push("/events"),
      active: isEvents,
    },
    {
      label: "Booking",
      icon: <Ticket size={20} strokeWidth={1.75} />,
      onClick: () => router.push("/booking"),
      active: isBooking,
    },
  ];

  const mobileLinks: DockLink[] = [
    {
      label: "Home",
      icon: <Home size={20} strokeWidth={1.75} />,
      onClick: () => router.push("/"),
      active: isHome,
    },
    {
      label: "Events",
      icon: <Calendar size={20} strokeWidth={1.75} />,
      onClick: () => router.push("/events"),
      active: isEvents,
    },
    {
      label: "Booking",
      icon: <Ticket size={20} strokeWidth={1.75} />,
      onClick: () => router.push("/booking"),
      active: isBooking,
    },
  ];

  return <BottomDock items={isMobile ? mobileLinks : desktopLinks} />;
}
