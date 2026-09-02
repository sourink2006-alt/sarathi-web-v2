"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { initSharedLenis, destroySharedLenis } from "@/lib/lenis";
import { EventsHero } from "./events-hero";
import { ScheduleSection } from "./schedule-section";
import { VenueSection } from "./venue-section";
import "./events.css";

/*
 * Events route orchestrator.
 *
 * Motion is component-scoped and restrained: a mount-time hero entrance and
 * once-per-viewport section reveals. No pinning (nothing reparents DOM), no
 * global ScrollTrigger teardown. Cleanup mirrors the project rule:
 * useLayoutEffect + gsap.context() + ctx.revert(), and only the Lenis
 * ref this page acquired is released.
 */
export function EventsPage() {
  const rootRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const root = rootRef.current;
    if (!root) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    initSharedLenis();

    let ctx: gsap.Context | undefined;
    if (!reduced) {
      ctx = gsap.context(
        () => {
      const heroEls = root.querySelectorAll<HTMLElement>("[data-hero-el]");
      if (heroEls.length > 0) {
        gsap.fromTo(
          heroEls,
          { y: 36, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1,
            ease: "power3.out",
            stagger: 0.09,
            delay: 0.1,
            clearProps: "transform,opacity",
          },
        );
      }

      root.querySelectorAll<HTMLElement>("[data-reveal]").forEach((el) => {
        gsap.fromTo(
          el,
          { y: 28, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.85,
            ease: "power2.out",
            scrollTrigger: { trigger: el, start: "top 88%", once: true },
          },
        );
      });
    },
        root,
      );
    }

    return () => {
      ctx?.revert();
      destroySharedLenis();
    };
  }, []);

  return (
    <div ref={rootRef} className="ev">
      <EventsHero />
      <ScheduleSection />
      <VenueSection />
    </div>
  );
}