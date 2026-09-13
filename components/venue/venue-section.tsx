"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { VENUE } from "@/components/events/events-data";

/*
 * Where We Gather — GLOBAL FINAL SECTION of the continuous root document.
 *
 * MOVED OUT of Events (2026-09-13). This is a root-level end piece, NOT an
 * Events section: it renders after the entire Booking experience and before
 * the site footer. New website sections (Gallery, Sponsors, Contact, etc.)
 * must be inserted BEFORE this section in app/page.tsx — this section stays
 * last. The markup/classes are the original Events venue block unchanged
 * (visual design preserved); only its position and reveal wiring moved.
 */
export function VenueSection() {
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
    };
  }, []);

  return (
    <section ref={rootRef} className="ev-venue" aria-labelledby="ev-venue-heading">
      <h2 id="ev-venue-heading" className="ev-kicker" data-reveal>
        Where We Gather
      </h2>

      <div className="ev-venue-address" data-reveal>
        <strong>{VENUE.association}</strong>
        <strong>{VENUE.ground}</strong>
        <span>{VENUE.block}</span>
        <span>{VENUE.area}</span>
        <span>{VENUE.city}</span>
      </div>

      <div className="ev-rule" style={{ marginInline: "auto" }} data-reveal aria-hidden />

      <p className="ev-venue-note" data-reveal>
        All Puja events are held at this site from October 16 to 21, 2026.
      </p>
    </section>
  );
}