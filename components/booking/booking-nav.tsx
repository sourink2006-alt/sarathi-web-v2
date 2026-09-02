"use client";

import { Calendar, Home, Users, Ticket } from "lucide-react";
import { useRouter } from "next/navigation";
import { BottomDock, type DockLink } from "@/components/layout/bottom-dock";

export function BookingNav() {
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
      active: true,
    },
  ];

  return <BottomDock items={LINKS} />;
}
