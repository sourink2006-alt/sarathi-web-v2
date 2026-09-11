"use client";

import { useSyncExternalStore } from "react";
import { Home, Users, Calendar, Ticket } from "lucide-react";
import { useRouter } from "next/navigation";
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

export function AboutNav() {
  const router = useRouter();
  const isMobile = useSyncExternalStore(
    subscribeToMobile,
    getMobileSnapshot,
    getMobileServerSnapshot,
  );

  const desktopLinks: DockLink[] = [
    {
      label: "Home",
      icon: <Home size={20} strokeWidth={1.75} />,
      onClick: () => router.push("/"),
    },
    {
      label: "About",
      icon: <Users size={20} strokeWidth={1.75} />,
      onClick: () => router.push("/about"),
      active: true,
    },
    {
      label: "Events",
      icon: <Calendar size={20} strokeWidth={1.75} />,
      onClick: () => router.push("/events"),
    },
    {
      label: "Booking",
      icon: <Ticket size={20} strokeWidth={1.75} />,
      onClick: () => router.push("/booking"),
    },
  ];

  const mobileLinks: DockLink[] = [
    {
      label: "Home",
      icon: <Home size={20} strokeWidth={1.75} />,
      onClick: () => router.push("/"),
    },
    {
      label: "Events",
      icon: <Calendar size={20} strokeWidth={1.75} />,
      onClick: () => router.push("/events"),
    },
    {
      label: "Booking",
      icon: <Ticket size={20} strokeWidth={1.75} />,
      onClick: () => router.push("/booking"),
    },
  ];

  return <BottomDock items={isMobile ? mobileLinks : desktopLinks} />;
}
