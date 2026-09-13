"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./location.css";

const MAP_EMBED_SRC =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3888.5395071170924!2d77.61639137515641!3d12.937291587374888!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae150019321161%3A0x476c82f38a37fa0a!2sSarathi%20Cultural%20Association%20BBMP!5e0!3m2!1sen!2sin!4v1789294323328!5m2!1sen!2sin";

const DIRECTIONS_URL = "https://maps.app.goo.gl/RiskhyCjaqx3Grd29";

/*
 * Location — GLOBAL FINAL SECTION of the continuous root document.
 *
 * Replaces the former "Where We Gather" venue block (2026-09-13). Renders
 * after the entire Booking experience and before the site footer. New website
 * sections (Gallery, Sponsors, Contact, etc.) must be inserted BEFORE this
 * section in app/page.tsx — this section stays last. Desktop: info column +
 * large Google Maps embed side by side; mobile: info stacked above the map.
 */
export function LocationSection() {
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
    <section ref={rootRef} className="location-section" aria-labelledby="location-heading">
      <div className="location-grid">
        <div className="location-info">
          <p className="ev-kicker" data-reveal>
            Where We Are
          </p>
          <h2 id="location-heading" className="location-title" data-reveal>
            Sarathi Cultural Association
          </h2>

          <div className="location-place" data-reveal>
            <span>BBMP Park Ground</span>
            <span>5th Block, Koramangala</span>
            <span>Bengaluru</span>
          </div>

          <div className="location-rule" data-reveal aria-hidden />

          <address className="location-address" data-reveal>
            No 23, KHB Colony, 5th Block,
            <br />
            Koramangala, Bengaluru,
            <br />
            Karnataka 560095
          </address>

          <a
            className="sc-cta sc-cta--ghost location-directions"
            href={DIRECTIONS_URL}
            target="_blank"
            rel="noopener noreferrer"
            data-reveal
          >
            Get Directions
          </a>
        </div>

        <div className="location-map" data-reveal>
          <iframe
            src={MAP_EMBED_SRC}
            width="600"
            height="450"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
            title="Sarathi Cultural Association BBMP on Google Maps"
          />
        </div>
      </div>
    </section>
  );
}