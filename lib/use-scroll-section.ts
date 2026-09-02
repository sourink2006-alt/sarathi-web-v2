"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/*
 * Scroll-driven nav section detection.
 *
 * Creates one ScrollTrigger marker per [data-section] element and reports
 * whichever section's scroll window currently contains the document scroll
 * position. Each marker uses `top center`/`bottom center`, so the active
 * section is the one straddling the viewport's vertical centre — the natural
 * reading of "the section currently on screen". Pinned sections (the About
 * experience's pin-spacer) resolve correctly because ScrollTrigger folds the
 * pin spacer's scroll range into each marker's start/end.
 */
export function useScrollSection(ids: string[]): string {
  const [active, setActive] = useState(ids[0] ?? "");
  const activeRef = useRef(active);
  const idsKey = ids.join(",");

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const els = ids
      .map((id) =>
        document.querySelector<HTMLElement>(`[data-section="${id}"]`),
      )
      .filter((el): el is HTMLElement => !!el);
    if (els.length !== ids.length) return;

    const markers = els.map((el) =>
      ScrollTrigger.create({
        trigger: el,
        start: "top center",
        end: "bottom center",
      }),
    );

    const pick = () => {
      const y = window.scrollY;
      let cur = ids[0];
      for (let i = 0; i < markers.length; i++) {
        const s = markers[i].start;
        const e = markers[i].end + 1;
        if (y >= s && y < e) {
          cur = ids[i];
          break;
        }
        if (y >= s) cur = ids[i];
      }
      if (activeRef.current !== cur) {
        activeRef.current = cur;
        setActive(cur);
      }
    };

    const master = ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: pick,
    });
    const onRefresh = () => pick();
    ScrollTrigger.addEventListener("refresh", onRefresh);

    pick();

    return () => {
      master.kill();
      markers.forEach((m) => m.kill());
      ScrollTrigger.removeEventListener("refresh", onRefresh);
    };
  }, [idsKey]); // eslint-disable-line react-hooks/exhaustive-deps

  return active;
}
