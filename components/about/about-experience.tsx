"use client";

import { useLayoutEffect, useRef, useSyncExternalStore } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { initSharedLenis, destroySharedLenis } from "@/lib/lenis";
import { StorySurface } from "./story-surface";
import { CHAPTERS } from "./story-data";
import { AboutMobileExperience } from "./about-mobile";

/*
 * The Sarathi Archive — animation engine.
 *
 * SCROLL → LENIS → ScrollTrigger (pinned) → render(progress)
 *
 * The camera is a PURE FUNCTION of ScrollTrigger progress — no proxy
 * objects, no scrubbed tweens, nothing that can desync. Progress maps to:
 *
 *   PHASE 1 · ENTRY      tilt-settle push-in: board enters seen from above
 *                        (rotateX 30°, scale 0.62) and settles flat while
 *                        pushing in — drone descending toward a desk.
 *   PHASE 2 · JOURNEY    documentary tracking shot: camera dollies between
 *                        chapters following the spotlight, with per-chapter
 *                        attitude drift (cam.rotX/Y/Z) and focus-pulse zoom.
 *   PHASE 3 · EXIT       submerge & blackout: camera flattens and recentres
 *                        while the board dissolves into the void — only the
 *                        closing line survives (it lives outside the board).
 *
 * Every frame writes plain inline styles (one transform string, opacity,
 * filter, three CSS vars). No quickSetter/tween layer in between — those
 * proved unreliable here (wrote once, then silently stalled).
 */

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const smooth = (t: number) => t * t * (3 - 2 * t);
const easeOutPower2 = (t: number) => 1 - (1 - t) * (1 - t);

/* phase boundaries as fractions of total pinned scroll */
const ENTRY_END = 0.07;
const JOURNEY_END = 0.89;

function AboutDesktopExperience() {
  const rootRef = useRef<HTMLElement>(null);

  /*
   * useLayoutEffect is REQUIRED here, not useEffect.
   * ScrollTrigger pinning re-parents <section.ab> into a GSAP-owned
   * .pin-spacer div. Layout-effect destroys run synchronously during
   * React's deletion walk (before the host node is removed), so
   * ctx.revert() can unwrap the pin-spacer and restore DOM parentage
   * in time. A useEffect cleanup runs AFTER React already tried
   * removeChildFromContainer and threw NotFoundError.
   */
  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    if (typeof window !== "undefined") {
      (window as unknown as Record<string, unknown>).ScrollTrigger = ScrollTrigger;
    }
    const root = rootRef.current;
    if (!root) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // CSS renders a static composed archive; no pinning, no camera.
      return;
    }

    if (window.matchMedia("(max-width: 767px)").matches) {
      return;
    }

    /* ---- shared scroll architecture ---- */
    initSharedLenis();

    const mobile = window.matchMedia("(max-width: 767px)").matches;
    /* Push the pan past the chapter's board-centre on mobile so edge-placed
     * cards (left chapters hang left, right chapters hang right under the
     * tilted board) are pulled back into view. rotDamp keeps the tilt gentle
     * on the small screen; both leave desktop untouched (damp = 1). */
    const panDamp = mobile ? 1.25 : 1;
    const rotDamp = mobile ? 0.38 : 1;

    /* ---- everything GSAP-owned lives in this context ---- */
    const ctx = gsap.context(() => {
      const board = root.querySelector<HTMLElement>("[data-board]")!;
      const cue = root.querySelector<HTMLElement>("[data-cue]")!;
      const count = root.querySelector<HTMLElement>("[data-count]")!;
      const label = root.querySelector<HTMLElement>("[data-label]")!;
      const fill = root.querySelector<HTMLElement>("[data-fill]")!;
      const closing = root.querySelector<HTMLElement>("[data-closing]")!;
      const chapters = Array.from(root.querySelectorAll<HTMLElement>("[data-chapter]"));
      const objects = Array.from(root.querySelectorAll<HTMLElement>("[data-object]"));
      const nodes = Array.from(root.querySelectorAll<SVGCircleElement>("[data-node]"));
      const route = root.querySelector<SVGPathElement>("[data-route]")!;

      /* camera + spotlight: direct inline-style writes every frame.
       * The CSS `translate(-50%, -50%)` centering is folded in here —
       * the inline transform fully replaces the stylesheet one. */

      const N = CHAPTERS.length - 1;
      let lastActive = -1;

      /* ---- proximity lens / HUD ---- */
      const applyLens = (activeIdx: number) => {
        if (activeIdx === lastActive) return;
        lastActive = activeIdx;
        chapters.forEach((el, i) => {
          el.dataset.state =
            i < activeIdx ? "visited" : i === activeIdx ? "active" : "future";
        });
        objects.forEach((el) => {
          const ci = CHAPTERS.findIndex((c) => c.id === el.dataset.object);
          el.dataset.state =
            ci < activeIdx ? "visited" : ci === activeIdx ? "active" : "future";
        });
        nodes.forEach((n, i) => {
          n.classList.toggle("ab-node--lit", i === activeIdx);
          n.classList.toggle("ab-node--visited", i < activeIdx);
        });
        count.textContent = `${String(activeIdx + 1).padStart(2, "0")} / 07`;
        label.textContent = CHAPTERS[activeIdx].eyebrow.split("·").pop()!.trim();
      };

      /* PHASE 1 starting pose — seen from above a table, pulled far back */
      const START = { scale: 0.62, rotX: 30, rotY: -8, rotZ: 3 };

      let prog = 0;

      /* ---- THE CAMERA: pure function of scroll progress ---- */
      const render = () => {
        /* phase decomposition */
        const e = easeOutPower2(clamp01(prog / ENTRY_END));
        const j = clamp01((prog - ENTRY_END) / (JOURNEY_END - ENTRY_END));
        const exRaw = clamp01((prog - JOURNEY_END) / (1 - JOURNEY_END));
        const ex = exRaw * exRaw; // accelerating submerge

        const p = j * N;
        const i = Math.min(Math.floor(p), N - 1);
        const travelT = smooth(p - i);
        const a = CHAPTERS[i];
        const b = CHAPTERS[i + 1];

        /* camera focal point on the spatial board */
        const cx = a.pos.x + (b.pos.x - a.pos.x) * travelT;
        const cy = a.pos.y + (b.pos.y - a.pos.y) * travelT;

        /* raised-cosine focus pulse: 1 at a FOCUS HOLD beat, 0 mid-travel */
        const pulse = Math.pow(Math.cos(Math.abs(p - Math.round(p)) * Math.PI), 2);
        const holdScale =
          a.cam.scale + (b.cam.scale - a.cam.scale) * travelT + 0.2 * pulse;

        /* per-chapter attitude drift — the documentary tilt */
        const rx = a.cam.rotX + (b.cam.rotX - a.cam.rotX) * travelT;
        const ry = a.cam.rotY + (b.cam.rotY - a.cam.rotY) * travelT;
        const rz = a.cam.rotZ + (b.cam.rotZ - a.cam.rotZ) * travelT;

        /* PHASE 1: blend the tilted far-back pose into the journey pose */
        let scale = START.scale + (holdScale - START.scale) * e;
        let rotX = (START.rotX + (rx - START.rotX) * e) * rotDamp;
        let rotY = (START.rotY + (ry - START.rotY) * e) * rotDamp;
        let rotZ = (START.rotZ + (rz - START.rotZ) * e) * rotDamp;
        let panX = -(cx - 50) * panDamp;
        let panY = -(cy - 50) * panDamp;

        /* PHASE 3: flatten, recentre and dissolve into the void */
        if (ex > 0) {
          scale += (1.04 - scale) * ex;
          rotX *= 1 - ex;
          rotY *= 1 - ex;
          rotZ *= 1 - ex;
          panX *= 1 - ex;
          panY *= 1 - ex;
        }

        board.style.transform =
          `perspective(1200px) translate(${panX - 50}%, ${panY - 50}%) ` +
          `rotate(${rotZ}deg) rotateY(${rotY}deg) rotateX(${rotX}deg) scale(${scale})`;
        board.style.opacity = String((0.15 + 0.85 * e) * (1 - ex));
        board.style.filter = `blur(${6 * (1 - e) + 3 * ex}px)`;

        /* spotlight: tight on hold, wide mid-travel, pinhole collapse in exit */
        const focalRadius = (28 + 14 * (1 - pulse)) * (1 - ex) + 2 * ex;
        board.style.setProperty("--sx", `${cx}%`);
        board.style.setProperty("--sy", `${cy}%`);
        board.style.setProperty("--fr", `${focalRadius}vmin`);

        route.style.strokeDashoffset = String(100 * (1 - j));
        fill.style.transform = `scaleX(${j})`;

        /* the closing line survives the blackout — it lives outside the board */
        closing.style.opacity = String(clamp01((j - 0.94) / 0.06));

        cue.style.opacity = String((e > 0.3 ? 1 : e / 0.3) * (1 - ex));

        applyLens(Math.round(p));
      };

      /* ---- pinned scroll trigger — the ONLY animation driver ---- */
      ScrollTrigger.create({
        trigger: root,
        start: "top top",
        end: "+=5760",
        pin: true,
        pinSpacing: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          prog = self.progress;
          render();
        },
        onRefresh: (self) => {
          prog = self.progress;
          render();
        },
      });

      render();
    }, root);

    return () => {
      /*
       * ctx.revert() kills the ScrollTrigger AND unwraps the .pin-spacer
       * (restoring <section.ab> to its original parent) synchronously —
       * before React's mutation phase removes the node. Never replace
       * this with bare .kill(): kill() leaves the spacer in place and
       * React's removeChild then targets the wrong parent.
       */
      ctx.revert();
      destroySharedLenis();
    };
  }, []);

  return (
    <section ref={rootRef} className="ab" aria-label="The story of Sarathi Cultural Association">
      <StorySurface />
    </section>
  );
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
  return true;
}

export function AboutExperience() {
  const isMobile = useSyncExternalStore(
    subscribeToMobile,
    getMobileSnapshot,
    getMobileServerSnapshot,
  );

  // On mobile screens (< 768px) and during SSR: render the lightweight mobile About experience.
  // AboutDesktopExperience is NEVER rendered or mounted on mobile, preventing GSAP ScrollTrigger
  // 3D pinning, camera loops, and heavy board layout.
  if (isMobile) {
    return <AboutMobileExperience />;
  }

  return <AboutDesktopExperience />;
}
