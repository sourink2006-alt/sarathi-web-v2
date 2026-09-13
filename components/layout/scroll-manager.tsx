"use client";

import { useEffect } from "react";
import { initSharedLenis, destroySharedLenis, getSharedLenis } from "@/lib/lenis";

/*
 * Single owner of the shared Lenis instance for the continuous document.
 * Previously each section page called initSharedLenis()/destroySharedLenis()
 * on mount/unmount; in the one-page architecture there is exactly one mount,
 * so ownership moves here. Native scrolling on mobile stays untouched.
 *
 * Also honours deep links (/... /#about /#events /#booking): after hydration
 * we snap to the anchored section so a hard reload of a section URL still
 * lands in the right place instead of the very top.
 */
export function ScrollManager() {
  useEffect(() => {
    if (window.matchMedia("(max-width: 767px)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    initSharedLenis();
    const hash = window.location.hash;

    const settle = () => {
      if (!hash) return;
      const el = document.getElementById(hash.slice(1));
      const lenis = getSharedLenis();
      if (el && lenis) {
        lenis.scrollTo(el, { immediate: true, force: true, offset: 0 });
      }
    };
    requestAnimationFrame(settle);

    return () => destroySharedLenis();
  }, []);

  return null;
}