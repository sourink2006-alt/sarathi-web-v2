"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/*
 * Global site footer — absolute end of the continuous root document.
 *
 * Previously the `<footer class="bk-footer">` tail of BookingPage; relocated
 * to the root composition (2026-09-13) so the document ends BOOKING →
 * WHERE WE GATHER → FOOTER. The `.bk-footer` class (booking.css) is kept
 * verbatim so the visual, including the bottom-dock clearance padding, is
 * unchanged. Must always render AFTER components/venue/venue-section.tsx.
 */
export function SiteFooter() {
  const rootRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const root = rootRef.current;
    if (!root) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let ctx: gsap.Context | undefined;
    if (!reduced) {
      ctx = gsap.context(
        () => {
          root.querySelectorAll<HTMLElement>("[data-reveal]").forEach((el) => {
            gsap.fromTo(
              el,
              { y: 26, opacity: 0 },
              {
                y: 0,
                opacity: 1,
                duration: 0.8,
                ease: "power2.out",
                scrollTrigger: { trigger: el, start: "top 90%", once: true },
              },
            );
          });
        },
        root,
      );
    }
    return () => {
      ctx?.revert();
    };
  }, []);

  return (
    <footer ref={rootRef} className="bk-footer" data-reveal>
      © {new Date().getFullYear()} Sarathi Cultural Association — Durga Puja 2026
    </footer>
  );
}