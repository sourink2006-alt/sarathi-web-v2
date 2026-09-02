"use client";

import { Home, Users, Calendar, Ticket } from "lucide-react";
import { useRouter } from "next/navigation";
import { BottomDock, type DockLink } from "@/components/layout/bottom-dock";

export function AboutNav() {
  const router = useRouter();

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

  return <BottomDock items={LINKS} />;
}
