"use client";

import { useLayoutEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import type Lenis from "@studio-freight/lenis";
import { getSharedLenis } from "@/lib/lenis";
import {
  acquireTransitionLock,
  isTransitionLocked,
  nextRoute,
  planEntry,
  prevRoute,
  releaseTransitionLock,
  takePlannedEntry,
  type EntryPosition,
} from "@/lib/route-journey";

/*
 * The route-boundary scanner. Mounted once in the root layout.
 *
 * It watches the CURRENT route's document for the two explicit boundaries
 * (top / bottom) and, on a boundary-crossing gesture, navigates to the next
 * (DOWN) or previous (UP) route with a real router.push — one transition per
 * gesture, gated by the module lock.
 *
 * Arrival: when this route mounts after a scroll transition, it places the
 * viewport at the planned continuation point — top for DOWN arrivals, bottom
 * for UP arrivals (About lands on its Chapter-7 exit, Home on its bottom).
 *
 * Mobile is deliberately untouched: wheel input never fires on touch screens,
 * the desktop-only guard below keeps it inert anyway, and proxy.ts still
 * redirects phone traffic off /about.
 */

/*
 * Boundary tolerance, not a trigger threshold.
 *
 * The boundary is the document limit (max = scrollHeight - innerHeight).
 * Lenis converges on that limit asynchronously (lerp 0.1), so it is NORMAL
 * for a wheel gesture's tail to be spent getting from max-32 to max — you
 * cannot see it, cannot scroll past it, and every bit of it is "the bottom".
 * A 4px threshold put those silent tail gestures in a dead zone (users had
 * to scroll several times before the route switched). This tolerance absorbs
 * the lerp tail, so the FIRST outward gesture that puts the viewport within
 * ~1 wheel notch of the limit crosses the boundary immediately. It still
 * cannot fire mid-content: max-32 is the literal bottom of the document.
 */
const BOUNDARY_TOL = 32;
const MODAL_SELECTOR = ".ev-modal, .bk-modal, [data-lenis-prevent]";

/* Lenis tracks velocity/targetScroll internally but does not expose them. */
type LenisRuntime = Lenis & { velocity: number };

function topOfModalPath(e: WheelEvent): boolean {
  return e.composedPath().some(
    (node) =>
      node instanceof Element && node.closest(MODAL_SELECTOR) !== null,
  );
}

export function RouteJourney() {
  const pathname = usePathname();
  const router = useRouter();
  const pathnameRef = useRef(pathname);

  useLayoutEffect(() => {
    if (typeof window === "undefined") return;

    pathnameRef.current = pathname;
    const route = pathnameRef.current;

    /* ---- arrival: honor a planned entry from a scroll transition ---- */
    const planned = takePlannedEntry();
    if (planned && planned.route === route) {
      applyEntryPosition(planned.position);
    } else {
      releaseTransitionLock();
    }

    const attemptBoundary = (goingDown: boolean) => {
      if (window.matchMedia("(max-width: 767px)").matches) return;
      if (isTransitionLocked()) return;

      const from = pathnameRef.current;
      const to = goingDown ? nextRoute(from) : prevRoute(from);
      if (!to || !acquireTransitionLock()) return;

      planEntry(to, goingDown ? "start" : "end");
      router.push(to);
    };

    const onWheel = (e: WheelEvent) => {
      if (e.deltaY === 0) return;
      if (topOfModalPath(e)) return;
      const y = window.scrollY;
      const max = Math.max(
        0,
        document.documentElement.scrollHeight - window.innerHeight,
      );
      if (e.deltaY > 0 && y >= max - BOUNDARY_TOL) {
        attemptBoundary(true);
      } else if (e.deltaY < 0 && y <= BOUNDARY_TOL) {
        attemptBoundary(false);
      }
    };
    window.addEventListener("wheel", onWheel, { passive: true });

    /* Lenis inertia path: a big trackpad flick keeps moving after the last
     * wheel event, so also watch Lenis's raf-driven scroll + velocity. */
    const onLenisScroll = (payload: unknown) => {
      const lenis = getSharedLenis();
      if (!lenis) return;
      if ((payload as { deltaY?: unknown } | null)?.deltaY !== undefined) return;
const runtime = lenis as LenisRuntime;
      if (Math.abs(runtime.velocity) < 0.5) return;
      const goingDown = runtime.velocity > 0;
      const y = runtime.scroll;
      const max = runtime.limit;
      if (goingDown && y >= max - BOUNDARY_TOL) {
        attemptBoundary(true);
      } else if (!goingDown && y <= BOUNDARY_TOL) {
        attemptBoundary(false);
      }
    };
    let lenis = getSharedLenis();
    let wireTimer: number | null = null;
    if (lenis) {
      lenis.on("scroll", onLenisScroll);
    } else {
      /* Home wires Lenis in a passive effect, after this layout effect. */
      wireTimer = window.setTimeout(() => {
        const late = getSharedLenis();
        if (late) {
          late.on("scroll", onLenisScroll);
          lenis = late;
        }
      }, 120);
    }

    return () => {
      window.removeEventListener("wheel", onWheel);
      if (wireTimer !== null) window.clearTimeout(wireTimer);
      lenis?.off("scroll", onLenisScroll);
    };
  }, [pathname, router]);

  return null;
}

function applyEntryPosition(position: EntryPosition) {
  let tries = 0;

  const tick = () => {
    const lenis = getSharedLenis();
    const max = Math.max(
      0,
      document.documentElement.scrollHeight - window.innerHeight,
    );
    const target = position === "end" ? max : 0;

    if (lenis && lenis.scrollTo) {
      lenis.scrollTo(target, { immediate: true, force: true });
    } else {
      window.scrollTo(0, target);
    }

    tries++;
    const settled = Math.abs(window.scrollY - target) <= 2;
    if (tries >= 30 || (settled && tries >= 3)) {
      releaseTransitionLock();
      return;
    }
    window.setTimeout(tick, 60);
  };

  tick();

  /* A route's limit can still be growing right after it mounts (fonts,
   * deferred images). The lock must NOT be held waiting for that — holding
   * it blocks a continued reverse gesture for the whole settle. Instead,
   * re-anchor once, late, guarded: only move the viewport back to the
   * bottom if the viewer hasn't already continued past it. */
  if (position === "end") {
    window.setTimeout(() => {
      const lenis = getSharedLenis();
      if (!lenis?.scrollTo) return;
      const max = Math.max(
        0,
        document.documentElement.scrollHeight - window.innerHeight,
      );
      if (window.scrollY >= max - BOUNDARY_TOL * 2) {
        lenis.scrollTo(max, { immediate: true, force: true });
      }
    }, 1200);
  }
}