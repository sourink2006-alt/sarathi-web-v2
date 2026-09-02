"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/*
 * Mobile event carousel — reuses the exact same ".ev-card-grid" container and
 * the same EventCard children so desktop (grid) and all card content/styling
 * are untouched. On small screens the grid turns into a horizontal snap
 * carousel (one card per swipe) with pagination dots below. Dots are hidden on
 * desktop via CSS.
 */
export function EventCarousel({
  labels,
  children,
}: {
  labels: string[];
  children: ReactNode;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let raf = 0;
    const pick = () => {
      const cards = Array.from(
        track.querySelectorAll<HTMLElement>(":scope > .ev-card"),
      );
      if (cards.length === 0) return;
      const center = track.getBoundingClientRect().left + track.clientWidth / 2;
      let best = 0;
      let bestDist = Infinity;
      cards.forEach((card, i) => {
        const r = card.getBoundingClientRect();
        const d = Math.abs(r.left + r.width / 2 - center);
        if (d < bestDist) {
          bestDist = d;
          best = i;
        }
      });
      setActive(best);
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(pick);
    };
    track.addEventListener("scroll", onScroll, { passive: true });
    pick();
    return () => {
      track.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="ev-carousel">
      <div
        ref={trackRef}
        className="ev-card-grid"
        tabIndex={0}
        role="region"
        aria-roledescription="carousel"
        aria-label="Event schedule"
      >
        {children}
      </div>

      {labels.length > 1 && (
        <div className="ev-carousel-dots" role="tablist" aria-label="Choose an event">
          {labels.map((label, i) => (
            <button
              key={label + i}
              type="button"
              role="tab"
              aria-selected={i === active}
              aria-label={`Go to ${label}`}
              className={`ev-dot ${i === active ? "ev-dot--active" : ""}`}
              onClick={() => {
                const card = trackRef.current?.querySelector<HTMLElement>(
                  `:scope > .ev-card:nth-child(${i + 1})`,
                );
                card?.scrollIntoView({
                  behavior: "smooth",
                  block: "nearest",
                  inline: "center",
                });
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
