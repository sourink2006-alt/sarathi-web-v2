"use client";

import { useSyncExternalStore } from "react";
import { Home, Users, Calendar, Ticket } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
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

type NavItem = "Home" | "About" | "Events" | "Booking";

/**
 * Route-based active navigation.
 *
 * Each route is its own page experience (no continuous document).
 * Active state is determined purely by pathname:
 *   /        → Home
 *   /about   → About
 *   /events  → Events
 *   /booking → Booking
 */
function useActiveNavItem(): NavItem {
  const pathname = usePathname();
  if (pathname.startsWith("/about")) return "About";
  if (pathname.startsWith("/events")) return "Events";
  if (pathname.startsWith("/booking")) return "Booking";
  return "Home";
}

export function Navbar() {
  const router = useRouter();
  const activeItem = useActiveNavItem();
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
      active: activeItem === "Home",
    },
    {
      label: "About",
      icon: <Users size={20} strokeWidth={1.75} />,
      onClick: () => router.push("/about"),
      active: activeItem === "About",
    },
    {
      label: "Events",
      icon: <Calendar size={20} strokeWidth={1.75} />,
      onClick: () => router.push("/events"),
      active: activeItem === "Events",
    },
    {
      label: "Booking",
      icon: <Ticket size={20} strokeWidth={1.75} />,
      onClick: () => router.push("/booking"),
      active: activeItem === "Booking",
    },
  ];

  const mobileLinks: DockLink[] = [
    {
      label: "Home",
      icon: <Home size={20} strokeWidth={1.75} />,
      onClick: () => router.push("/"),
      active: activeItem === "Home",
    },
    {
      label: "Events",
      icon: <Calendar size={20} strokeWidth={1.75} />,
      onClick: () => router.push("/events"),
      active: activeItem === "Events",
    },
    {
      label: "Booking",
      icon: <Ticket size={20} strokeWidth={1.75} />,
      onClick: () => router.push("/booking"),
      active: activeItem === "Booking",
    },
  ];

  return <BottomDock items={isMobile ? mobileLinks : desktopLinks} />;
}
