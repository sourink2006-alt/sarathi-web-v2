"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { Home, Users, Calendar, Ticket } from "lucide-react";
import { BottomDock, type DockLink } from "@/components/layout/bottom-dock";
import { getSharedLenis } from "@/lib/lenis";

type NavItem = "Home" | "About" | "Events" | "Booking";

const SECTIONS: { id: string; item: NavItem }[] = [
  { id: "home", item: "Home" },
  { id: "about", item: "About" },
  { id: "events", item: "Events" },
  { id: "booking", item: "Booking" },
];

const SCROLL_EASING = (t: number) => 1 - Math.pow(1 - t, 4);

function scrollToSection(id: string) {
  const lenis = getSharedLenis();
  const duration = 1.2;
  if (lenis) {
    if (id === "home") {
      lenis.scrollTo(0, { duration, easing: SCROLL_EASING, force: true });
    } else {
      lenis.scrollTo(`#${id}`, { duration, easing: SCROLL_EASING, force: true });
    }
  } else if (id === "home") {
    window.scrollTo({ top: 0, behavior: "smooth" });
  } else {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  /* keep the URL on the root page, only reflecting the active section */
  try {
    window.history.replaceState(null, "", `#${id}`);
  } catch {
    /* ignore — cosmetic only */
  }
}

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
 * Scrollspy as pure offset math. Section tops are cached (re-measured only on
 * resize / font-load / window load) so the scroll handler performs zero layout
 * reads and no per-frame React updates — state changes only when the active
 * section actually changes. The About wrapper stays "in view" for its entire
 * pinned 5760px cinematic run, keeping the About icon lit throughout.
 */
function useActiveNavItem(): NavItem {
  const [active, setActive] = useState<NavItem>("Home");

  useEffect(() => {
    const tops = new Map<NavItem, number>();
    let measured = false;

    const measure = () => {
      tops.clear();
      for (const section of SECTIONS) {
        const el = document.getElementById(section.id);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        if (rect.height < 4) continue; /* unrendered section (About on mobile) */
        tops.set(section.item, rect.top + window.scrollY);
      }
      measured = true;
    };

    const probe = () => {
      if (!measured) return;
      const line = window.scrollY + window.innerHeight * 0.4;
      let current: NavItem = "Home";
      let currentTop = -Infinity;
      for (const section of SECTIONS) {
        const top = tops.get(section.item);
        if (top !== undefined && top <= line && top > currentTop) {
          currentTop = top;
          current = section.item;
        }
      }
      if (currentTop === -Infinity) {
        /* below every mapped section (very short content edge) */
        for (let i = SECTIONS.length - 1; i >= 0; i--) {
          if (tops.has(SECTIONS[i].item)) {
            current = SECTIONS[i].item;
            break;
          }
        }
      }
      setActive((prev) => (prev === current ? prev : current));
    };

    measure();
    probe();
    const fontSettle = window.setTimeout(measure, 1400);

    window.addEventListener("scroll", probe, { passive: true });
    window.addEventListener("resize", () => {
      measure();
      probe();
    });
    window.addEventListener("load", () => {
      measure();
      probe();
    });

    return () => {
      window.clearTimeout(fontSettle);
      window.removeEventListener("scroll", probe);
      window.removeEventListener("resize", () => {});
      window.removeEventListener("load", () => {});
    };
  }, []);

  return active;
}

export function Navbar() {
  const activeItem = useActiveNavItem();
  const isMobile = useSyncExternalStore(
    subscribeToMobile,
    getMobileSnapshot,
    getMobileServerSnapshot,
  );

  const desktopLinks: DockLink[] = [
    { label: "Home", icon: <Home size={20} strokeWidth={1.75} />, onClick: () => scrollToSection("home"), active: activeItem === "Home" },
    { label: "About", icon: <Users size={20} strokeWidth={1.75} />, onClick: () => scrollToSection("about"), active: activeItem === "About" },
    { label: "Events", icon: <Calendar size={20} strokeWidth={1.75} />, onClick: () => scrollToSection("events"), active: activeItem === "Events" },
    { label: "Booking", icon: <Ticket size={20} strokeWidth={1.75} />, onClick: () => scrollToSection("booking"), active: activeItem === "Booking" },
  ];

  const mobileLinks: DockLink[] = [
    { label: "Home", icon: <Home size={20} strokeWidth={1.75} />, onClick: () => scrollToSection("home"), active: activeItem === "Home" },
    { label: "Events", icon: <Calendar size={20} strokeWidth={1.75} />, onClick: () => scrollToSection("events"), active: activeItem === "Events" },
    { label: "Booking", icon: <Ticket size={20} strokeWidth={1.75} />, onClick: () => scrollToSection("booking"), active: activeItem === "Booking" },
  ];

  return <BottomDock items={isMobile ? mobileLinks : desktopLinks} />;
}