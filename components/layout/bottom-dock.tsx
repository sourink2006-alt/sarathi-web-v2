"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import Dock from "@/components/ui/dock";

export type DockLink = {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  active?: boolean;
};

export function BottomDock({ items }: { items: DockLink[] }) {
  const [scrolling, setScrolling] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const onScroll = () => {
      setScrolling(true);
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => setScrolling(false), 300);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (timer) clearTimeout(timer);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-5 z-50 flex justify-center">
      <motion.div
        animate={{ opacity: scrolling ? 0.4 : 1 }}
        transition={{ duration: scrolling ? 0.25 : 0.3, ease: "easeOut" }}
      >
        <Dock
          items={items.map((item) => ({
            label: item.label,
            icon: item.icon,
            onClick: item.onClick,
            className: item.active ? "dock-item-active" : undefined,
          }))}
          panelHeight={60}
          baseItemSize={46}
          magnification={68}
          dockHeight={210}
        />
      </motion.div>
    </div>
  );
}
