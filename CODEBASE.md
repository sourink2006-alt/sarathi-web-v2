# CODEBASE.md — SCA Website (Frontend)

Living technical memory of the SCA frontend project. Read this file first in every new session. Update it whenever a feature is added, changed, removed, connected, or refactored.

---

## 1. Project Overview

- **What it is:** Frontend-only marketing site for **SCA — Sarathi Cultural Association**, a Bengali cultural association in Bengaluru (Durga Puja and community events). Tagline: "From Kolkata to Bengaluru — Every Bengali Carries Two Homes."
- **What it currently contains:**
  1. `/` — Single-page cinematic hero experience: fixed brand lockup (top-left), decorative emblem (top-right), full-screen parallax hero image with title + live Durga Puja countdown, icon divider strip, and bottom-center dock navigation.
  2. `/about` — Cinematic "Origin" storytelling experience: 7-chapter interactive story surface with pinned camera animations, spotlight, SVG route drawing, and HUD progress indicator.
  3. `/events` — Upcoming events rebuilt (2026-08-31) as: EVENTS hero → EVENT SCHEDULE (BookMyShow-style cards split into CULTURAL EVENTS 15–21 Oct and RELIGIOUS EVENTS 16–21 Oct, each opening an in-page detail modal) → BBMP GROUND / WHERE WE GATHER.
- **Current development state:** `/events` built and verified on 2026-08-30 (see §19). All three routes render clean static prerenders with 0 console/page errors across SPA navigation.

---

## 2. Current Status

**Audited:** framework, dependencies, all components, all animations, all assets, external connections.
**Routes present:** `/` (Home), `/about` (About), and `/events` (Events).
**Nav entries:** Home (`/`), About (`/about`), and Events (`/events`) — each route renders its own nav (`Navbar`/`AboutNav`/`EventsNav`) with the active item highlighted.

---

## 3. Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Framework | Next.js (App Router) | 16.2.10 |
| UI runtime | React / React DOM | 19.2.4 |
| Language | TypeScript | ^5 |
| Styling | Tailwind CSS v4 (CSS-first config via `@theme` in `app/globals.css`, PostCSS plugin `@tailwindcss/postcss`) | ^4 |
| Scroll animation | GSAP + ScrollTrigger | ^3.15.0 |
| Smooth scrolling | Lenis (`@studio-freight/lenis`) | ^1.0.42 |
| Component animation | Motion (`motion/react`, Framer Motion successor) | ^12.43.0 |
| Icons | lucide-react | ^1.23.0 |
| Fonts | Google Fonts via `next/font`: EB Garamond (display), DM Sans (body), Bebas Neue (accent), Archivo Variable (wdth axis), Tiro Bangla, Manrope Variable, Jakarta Variable | — |
| Package manager | npm (package-lock.json present) | — |

---

## 4. Project Architecture

```text
app/
  about/
    page.tsx           About page route: <SiteBrand/> + <AboutExperience/> + <AboutNav/>
  events/
    page.tsx           Events page route: <SiteBrand/> + <EventsPage/> + <EventsNav/>
  globals.css          Tailwind v4 @theme tokens (colors/fonts) + hero/parallax CSS
  layout.tsx           Root layout: fonts, metadata, favicon, dark body
  page.tsx             Home route "/": <Navbar/> + <ParallaxComponent/>
components/
  about/
    about-experience.tsx  About animation engine: Lenis + GSAP ScrollTrigger timeline (pin: true)
    about-nav.tsx         About bottom dock navigation
    about.css             Styles for story surface, cards, paper objects, spotlight
    story-data.ts         Chapter content & SVG route path generator
    story-surface.tsx      Presentational SVG route, cards, paper bits & spotlight elements
  events/
    events-data.ts        ALL event content: hero, Cultural Events (15–21 Oct),
                          festival highlight + amenities, Religious Events (16–21 Oct),
                          rituals, venue
    events.css            Full /events design (dark hero + BookMyShow-style card schedule + detail modal)
    events-page.tsx       Events orchestrator: scoped GSAP hero/reveal motion + shared Lenis
    events-hero.tsx       Hero: typographic opening, Bengali watermark, corner ornaments
    schedule-section.tsx  Event Schedule: 2 categories (Cultural/Religious) + rituals + highlight + amenities + modal state
    event-card.tsx        BookMyShow-style card — 4:5 poster placeholder + date/title/summary
    event-modal.tsx       In-page detail modal (motion/AnimatePresence), opens on card click
    venue-section.tsx     Venue — Where We Gather (BBMP Ground) at page bottom
    events-nav.tsx        Events bottom dock navigation (Events active)
  home/
    hero-content.tsx   Hero center content: kicker, title, blurb, live countdown
  layout/
    bottom-dock.tsx    Shared bottom dock wrapper with scroll opacity fading
    navbar.tsx         Brand lockup (top-left), emblem (top-right), bottom-center dock for Home
    site-brand.tsx     Fixed brand lockup top-left & emblem top-right
  ui/
    dock.tsx           Magnifying macOS-style dock (motion/react)
    dock.css           Dock panel/item/tooltip styling
    parallax-scrolling.tsx  THE HERO: Lenis + GSAP setup, parallax bg layers, osmo icon strip
public/
  logo.png             SCA logo — favicon + brand lockup top-left
  name.png             Decorative emblem — fixed top-right
  images/
    hero-bg-1920.jpg   USED — hero background layer
    hero-bg.jpg        UNREFERENCED (candidate for deletion)
    hero-durga-169.jpg UNREFERENCED (candidate for deletion)
    hero-durga-full.jpg UNREFERENCED (candidate for deletion)
```

---

## 5. Page / Route Map

| Route | File | Contains |
|---|---|---|
| `/` | `app/page.tsx` | `<Navbar/>` (brand lockup + emblem + dock) and `<ParallaxComponent/>` (hero + countdown + icon strip). |
| `/about` | `app/about/page.tsx` | `<SiteBrand/>`, `<AboutExperience/>` (7-chapter pinned story surface), `<AboutNav/>`. |
| `/events` | `app/events/page.tsx` | `EventsPage` (hero → Event Schedule → Cultural/Religious cards → modal → venue) + `EventsNav`. |

---

## 6. Resolved Runtime Issues

### Issue: NotFoundError during `/about` → `/` Navigation

- **Problem:** React `NotFoundError: Failed to execute 'removeChild' on 'Node': The node to be removed is not a child of this node.` observed during client-side navigation from `/about` to `/`.
- **Root Cause:** The React-owned `<section className="ab">` was pinned by GSAP ScrollTrigger using `pin: true`. Pinning reparents the element into a GSAP-generated `.pin-spacer` DOM node. When cleanup was deferred or improperly handled during React's unmount phase, React attempted `body.removeChild(section.ab)` while `section.ab` was still a child of `.pin-spacer`, breaking React's parent-child unmount invariant.
- **Fix:** `components/about/about-experience.tsx` uses `useLayoutEffect` combined with `gsap.context()` and `ctx.revert()`. Because `useLayoutEffect` cleanup runs synchronously during React's unmount phase before host node deletion, `ctx.revert()` synchronously unwraps `.pin-spacer` and restores `section.ab` to its original DOM parent (`body`), allowing React's `removeChild` call to target a direct child and succeed cleanly.
- **Verification:**
  - **Tooling:** ESLint 0 errors, TypeScript 0 errors, Next.js production build (`next build`) passed.
  - **4 Scroll-Depth Forensic Tests (Playwright/Chromium):** Tested navigation at 0px, 200px, 2000px, and 5000px scroll depths. At `2844.30ms`, DOM mutation logs confirmed `section.ab` parent restored from `.pin-spacer` to `body`, `.pin-spacer` removed, and `section.ab` deleted from `body` with 0 page errors and 0 console errors.
  - **Browser Regression Matrix:** Executed full suite covering initial load, scrolling, `/about` → `/`, `/` → `/about`, repeated navigation (5 rapid cycles), desktop viewport resize (1920x1080 → 1024x768), and mobile viewport (375x812).
  - **Metrics:** `removeChild` errors = 0, console errors = 0, page errors = 0, stale `.pin-spacer` elements = 0, stale About ScrollTriggers = 0.
- **Status:** **RESOLVED**

---

## 7. About Origin Experience Architecture

- **Narrative Structure:** 7 sequential chapters (`Kolkata`, `Memory`, `Journey`, `Bengaluru`, `Community`, `Durga Puja`, `Sarathi / Legacy`) configured in `components/about/story-data.ts`.
- **Spotlight System:** Performant radial gradient mask driven by CSS variables (`--sx`, `--sy`) updated via GSAP `quickSetter` calls on each scroll frame.
- **Camera & Parallax:** 3D spatial camera movement using `xPercent`, `yPercent`, `scale`, `rotationX`, `filter`, and `opacity` properties on `.ab-board`, creating continuous spatial navigation without layout thrashing.
- **Navigation Integration:** Bottom dock navigation (`BottomDock`) and site brand lockup (`SiteBrand`) remain fixed and accessible above the story stage with keyboard accessibility.
- **Responsive Adaptations:**
  - **Desktop / Laptop (1920x1080, 1440x900):** Full 200vw×220vh surface board, full 3D tilt (26deg), floating memory paperbits and full spotlight veil.
  - **Tablet & Mobile (1024x768, 390x844, 375x812):** Adjusted surface dimensions, hidden secondary paperbits (`.ab-obj--hide-mobile`), touch camera dampening (`0.55`), and optimized radial spotlight radius.
- **Accessibility & Reduced Motion:** When `prefers-reduced-motion: reduce` is detected, pinning and 3D camera transforms are bypassed. The story is rendered as a clean, static, readable composed archive document with zero pin-spacers and zero layout shifts.
- **Performance Verification:** Tested across 5 viewports with 0 console errors, 0 page errors, 0 stale pin-spacers, and deterministic unmount cleanup via `ctx.revert()`.

---

## 8. Resolved Scroll & Layout Lock Regression

### Issue: `/about` Document Scroll Lock (Height = 720px)

- **Problem:** The `/about` route experience was locked to `720px` document scroll height (`document.documentElement.scrollHeight = 720px`), rendering the page completely unscrollable via mouse wheel or touch input.
- **Root Cause:**
  1. `<AboutExperience />` was rendered directly in `app/about/page.tsx` as a direct flex child of `<body className="flex min-h-full flex-col">`.
  2. When GSAP ScrollTrigger pinned `<section className="ab">`, it wrapped it in a `<div className="pin-spacer">` flex child. Because `body` had `display: flex`, CSS flexbox layout constrained `.pin-spacer` and clamped GSAP's pin spacing calculation (`padding-bottom`) to `0px`.
  3. Consequently, `document.documentElement.scrollHeight` remained locked at `720px` (`100vh`), preventing any scroll progression from reaching Lenis or ScrollTrigger.
- **Fix:**
  1. **Layout Block Wrapper (`app/about/page.tsx`):** Wrapped `<AboutExperience />` inside `<main className="relative w-full">`, providing a standard block-level container for GSAP `.pin-spacer` so `padding-bottom: 5760px` correctly expands the document scroll height to `6480px`.
  2. **Clean Cleanup in Home (`components/ui/parallax-scrolling.tsx`):** Removed global `ScrollTrigger.getAll().forEach(st => st.kill())` from `ParallaxComponent` unmount handler to prevent cross-route ScrollTrigger destruction.
  3. **Active Dock State (`components/layout/navbar.tsx`):** Corrected active tab indicator on `Navbar` so `Home` displays active highlight on `/`.
- **Verification:**
  1. **Scroll Height & Wheel Scrolling:** Verified `document.documentElement.scrollHeight = 6480px` on `/about` and `1022px` on `/`. Verified mouse wheel scroll advances `scrollY` from `0` to `4790px` and progresses HUD state smoothly from `01 / 07 | Kolkata` to `06 / 07 | Durga Puja`.
  2. **Navigation Cycles:** Verified 3 consecutive `/` ↔ `/about` navigation cycles with 0 `removeChild` errors, 0 console errors, and 0 page errors.
  3. **Tooling & Build Suite:** Verified `npx tsc --noEmit` (0 errors), `npm run lint` (0 errors), and `npm run build` (clean static prerender for `/` and `/about`).
- **Status:** **RESOLVED**

---

## 9. Route-Ownership Architecture Rule

- **Core Rule:** **Animation cleanup must be component-scoped. No route component may globally kill all ScrollTriggers.**
- **Implementation:** Component unmount handlers must only revert or kill the animation timelines and ScrollTriggers that they explicitly instantiated (e.g. via `gsap.context()` + `ctx.revert()`). Global destruction calls such as `ScrollTrigger.getAll().forEach(st => st.kill())` are forbidden as they violate route component isolation and destroy active triggers owned by adjacent routes or persistent layout elements during client-side navigation.
- **Verification:** Verified via route-ownership regression testing across `/` and `/about` navigation matrix. Confirmed 0 stale triggers, 0 duplicate triggers, 0 stale pin spacers, 0 console errors, 0 page errors, and 0 `removeChild` errors.

---

## 10. Continuous Home → About Scroll Architecture

- **Problem:** The website previously ended scrolling at the bottom of the Home hero section (~1022px), requiring the user to manually click the "About" button in the bottom dock navigation to view the Origin experience.
- **Solution:**
  1. **Composed Document Flow (`app/page.tsx`):** Composed both `<ParallaxComponent />` and `<AboutExperience />` sequentially inside `<main className="relative w-full">` on `/`.
  2. **Shared Lenis Smooth Scroll Engine (`lib/lenis.ts`):** Implemented a singleton Lenis smooth scroll manager (`initSharedLenis()`, `destroySharedLenis()`) that guarantees exactly 1 active Lenis instance across any route composition without competing tickers or listeners.
  3. **Viewport-Triggered About Pinning:** GSAP `ScrollTrigger` in `<AboutExperience />` pins `<section className="ab">` when it enters the viewport (`start: "top top"` at `1022px`). Document height extends dynamically to `7502px`, enabling a seamless, continuous scroll progression from the Home Hero directly through the 7-chapter cinematic camera story (`01 → 07`).
  4. **Bidirectional Reverse Scroll:** Scrolling back UP unpins `<section className="ab">` when returning past `1022px`, smoothly returning the user to the Home Hero section.
  5. **Direct Entry & Dock Navigation:** Direct entry to `/about` (`app/about/page.tsx`) renders the standalone Origin experience (`6480px`), while the `BottomDock` provides instant jump points.
- **Verification:**
  1. Verified via automated browser testing (`verify-continuous-journey.mjs`): Initial scroll on `/` smoothly transitions from Home Hero into About Chapter 01 (`Kolkata`) at `1022px` and advances to Chapter 07 (`Sarathi`) at `5818px` without requiring any clicks.
  2. Verified reverse scrolling back UP into Home Hero (`scrollY = 0px`).
  3. Verified direct entry to `/about` (`document.documentElement.scrollHeight = 6480px`).
  4. Verified 0 console errors, 0 page errors, and 0 `removeChild` errors across all transitions.
## 11. Removal of Artificial Home → About Transition Layer

- **Problem:** An artificial intermediate transition section existed between the Home Hero and the Origin experience containing:
  - A `min-height: 42vh` dark empty block (`<section className="parallax__content">`).
  - An isolated centered gold SVG symbol (`.osmo-icon-svg`).
  - A horizontal maroon/red band (`.ab-band--top`).
  This created an unwanted 42vh gap and splash/loading screen feel when scrolling from Home into Origin.
- **Targeted Removal:**
  1. **Removed `<section className="parallax__content">` (`components/ui/parallax-scrolling.tsx`):** Completely removed the 42vh trailing section and `.osmo-icon-svg` from `ParallaxComponent`. `ParallaxComponent` now renders strictly the Home Hero (`<section className="parallax__header">`).
  2. **Removed Artificial Top Band (`components/about/story-surface.tsx`):** Removed `<span className="ab-band ab-band--top" />` from `StorySurface`.
  3. **Restored Direct Board Entrance (`components/about/about-experience.tsx`):** Configured initial GSAP `board` state to `opacity: 1`, `scale: 1`, `rotationX: 0`, `blur(0)`.
- **Verification:**
  1. Verified via automated browser testing (`verify-continuous-journey.mjs`): Scrolling past the 720px Home Hero (`100vh`) immediately enters Origin Chapter 01 (`Kolkata`) at `720px` without any black gap, logo spacer, or red border strip.
  2. Verified total document height on `/` is exactly `7200px` (`720px` Home Hero + `5760px` About pin distance + `720px` viewport).
  3. Verified Home Hero visual layout and animations remain 100% untouched.
  4. Verified direct entry to `/about` (`6480px`), 7 chapters, camera movement, spotlight mask, and 0 console/page/removeChild errors.
- **Status:** **RESOLVED**

---

## 12. About Camera Motion Redesign

- **Camera Model:** Redesigned the `/about` animation engine in `components/about/about-experience.tsx` so the **camera physically travels through the 2.5D spatial world** instead of cards translating over a static camera.
- **Approach → Arrival → Departure Sequence:**
  1. **Phase A — Approach:** As the camera travels toward chapter node `k`, the camera zooms in (+0.08 scale), pitch levels in, spotlight tightens (`18vmin`), and chapter `k` transforms into sharp foreground focus (`translateZ(95px)`).
  2. **Phase B — Arrival Beat:** On exact chapter node arrival (`beatPulse = 1.0`), camera movement subtly slows for emotional beat. Active card is 100% sharp and dominant with intense golden halo glow.
  3. **Phase C — Departure:** Camera pulls back (`beatPulse = 0.0`), spotlight opens wide (`32vmin`), revealing the Catmull-Rom SVG route as camera travels across the board toward chapter `k+1`.
  4. **Chapter 07 Settlement:** Final chapter (`Sarathi`) settles calmly in balanced legacy homecoming stance with wide dual-spotlight illumination.
- **Symmetric Reverse Motion:** Uses a continuous cosine beat pulse curve (`Math.cos(distFromBeat * Math.PI)`) guaranteeing 100% smooth, fluid reverse camera movement when scrolling upward (`07 → 01`).
- **Protected Lifecycle:** Preserved `useLayoutEffect` + `gsap.context()` + `ctx.revert()` lifecycle for zero `removeChild` errors. Home page remained 100% untouched.
- **Verification:**
  1. Verified via automated browser testing (`verify-continuous-journey.mjs`): Tested full 7-chapter forward scroll, reverse scroll, direct entry `/about` (`6480px`), and 5 responsive viewports.
  2. Confirmed 0 console errors, 0 page errors, 0 `removeChild` errors.
  3. Verified `npx tsc --noEmit` (0 errors), `npm run lint` (0 errors), `npm run build` (clean static prerender).
- **Status:** **RESOLVED**

---

## 13. Chapter Card Camera Orientation (Front-Facing Arrival)

- **Problem:** Active chapter cards previously appeared visibly pitched/tilted away from the viewer (`rotationX: 18deg–20deg`), creating off-center 3D perspective distortion and trapezoid skew on the card surface.
- **Root Cause & Fix:**
  1. **Empirical Root Cause:** Off-center 3D perspective projection (`perspective: 1200px` on `.ab-stage`) combined with initial board rotations (`rotationX: 12deg`) caused off-center active cards (e.g. Chapter 03 `Journey` at `x: 62%, y: 30%`) to be keystoned/skewed diagonally toward the vanishing point.
  2. **Camera Target & Initial Rotation Reset (`story-data.ts` & `about-experience.tsx`):** Reset active chapter camera rotation targets and initial board states to `rotationX: 0deg`, `rotationY: 0deg`, `rotationZ: 0deg`.
  3. **Front-Facing Plane Enforced (`about.css`):** Applied `transform-style: flat` and `rotateX(0deg) rotateY(0deg) rotateZ(0deg)` to `.ab-ch[data-state="active"]`. On arrival beat, the active chapter card renders **100% front-facing, square to the viewer, perfectly rectangular, and crisp**.
- **Verification:**
  1. Verified via Playwright browser inspection (`verify-card-orientation.mjs`) on `http://localhost:3001`:
     - **Chapter 01 (Kolkata) Arrival:** Rendered Bounding Rect = `353px × 276px` (100% perfectly rectangular, zero trapezoid skew).
     - **Chapter 03 (Journey) Arrival:** Rendered Bounding Rect = `353px × 276px` (100% perfectly rectangular, zero trapezoid skew).
  2. Verified 0 console errors, 0 page errors, 0 `removeChild` errors.
  3. Verified `npx tsc --noEmit` (0 errors) and `npm run lint` (0 errors).
- **Status:** **RESOLVED**

---

## 14. About 5-Phase Camera Journey Motion

- **Motion Model:** Enhanced the master GSAP ScrollTrigger timeline in `components/about/about-experience.tsx` to execute a 5-phase camera motion curve across every chapter cycle:
  1. **Phase 1 — Approach:** Camera accelerates toward chapter node position `(x, y)`. Chapter starts smaller, farther away, and dimmer.
  2. **Phase 2 — Zoom In:** Camera ZOOMS IN (+0.18 scale zoom) toward the active chapter card.
  3. **Phase 3 — Focus / Hold Beat:** At arrival (`focusPulse = 1.0`), camera holds at closest focal distance. Active card dominates viewport, **100% front-facing, crisp, readable, with tight spotlight focus (`17vmin`)**.
  4. **Phase 4 — Zoom Out:** Camera ZOOMS OUT (scale decreases), spotlight opens wide (`34vmin`), and surrounding route path and memory paperbits become visible.
  5. **Phase 5 — Spatial Travel:** Camera travels horizontally & depth-wise across the spatial board along the Catmull-Rom SVG path toward chapter `k+1`.
- **Symmetric Reverse Journey:** Raised cosine focus pulse (`focusPulse = Math.pow(Math.cos(distFromBeat * Math.PI), 2)`) guarantees 100% smooth, fluid reverse camera zoom and travel when scrolling upward (`07 → 01`).
- **Protected Rules:** Home page (`/`) remained 100% untouched. Active cards remain 100% front-facing. `useLayoutEffect` + `gsap.context()` + `ctx.revert()` lifecycle intact.
- **Verification:**
  1. Verified via automated browser testing (`verify-continuous-journey.mjs` and `verify-camera-phases.mjs`) on `http://localhost:3001`.
  2. Confirmed 0 console errors, 0 page errors, 0 `removeChild` errors.
  3. Verified `npx tsc --noEmit` (0 errors) and `npm run lint` (0 errors).
- **Status:** **RESOLVED**

---

## 15. Spotlight Z-Plane Alignment & Visual Inspection

- **Spotlight Z-Plane Alignment (`components/about/about.css`):**
  - Updated spotlight layers (`.ab-dim`, `.ab-glow-focal`, `.ab-glow-broad`) from `translateZ(125px)` to `translateZ(95px)` to match the exact 3D Z-plane of active chapter cards (`translateZ(95px)`).
  - Adjusted spotlight mask radius range to `28vmin` (at focus hold) and `42vmin` (during travel).
  - Ensures the warm golden light pool is centered 100% flush over the active chapter text during focus beats.
- **Visual Browser Verification:**
  - Captured & visually inspected Playwright browser screenshots (`ch01-focus.png`, `ch01-travel.png`, `ch02-focus.png`, `ch03-focus.png`, `ch07-final.png`) on `http://localhost:3001`.
  - Confirmed active cards are 100% front-facing, perfectly rectangular, and illuminated directly by the spotlight light pool.
- **Verification:**
  1. `npx tsc --noEmit`: **0 errors**.
  2. `npm run lint`: **0 errors**.
  3. `verify-continuous-journey.mjs`: **Console Errors = 0, Page Errors = 0, removeChild Errors = 0**.
- **Status:** **RESOLVED**

---

## 16. Multi-Layer Spatial Parallax World

- **5-Layer Spatial Depth Hierarchy (`components/about/about.css`):**
  1. **Layer 1 — Background Paper Plane:** `transform: translateZ(-80px)` (Deepest background layer, moves slowest `~0.15x`).
  2. **Layer 2 — Catmull-Rom SVG Route Path:** `transform: translateZ(25px)` (Medium path layer, moves `~0.35x`).
  3. **Layer 3 — Memory Artifact Objects (`.ab-obj`):** `transform: translateZ(65px)` (Intermediate depth layer, moves `~0.65x`).
  4. **Layer 4 — Chapter Cards (`.ab-ch[data-state="visited"]` / `future`):** `transform: translateZ(20px)` / `translateZ(-30px)` (Faster layer, moves `~0.85x`).
  5. **Layer 5 — Active Focal Chapter (`.ab-ch[data-state="active"]`):** `transform: translateZ(110px)` (Closest focal plane, moves `1.0x+` into 100% front-facing rectangular focus).
- **Dynamic Camera & World Interaction:**
  - As the camera travels across `(x, y)` from `Chapter 01` to `Chapter 07`, the 5 distinct Z-depth planes produce **true relative 3D perspective parallax** across the viewport.
  - Background elements move slowly, route lines shift at medium rate, memory paperbits drift past, and the active chapter card zooms into focal center.
- **Protected Locks:** Home page (`/`) remained 100% untouched. Active cards remain 100% front-facing (`353×276`). `useLayoutEffect` + `gsap.context()` + `ctx.revert()` lifecycle intact.
- **Verification:**
  1. Captured & visually verified browser screenshots (`ch01-focus.png`, `ch01-travel.png`, `ch02-focus.png`, `ch03-focus.png`, `ch07-final.png`) on `http://localhost:3001`.
  2. `npx tsc --noEmit`: **0 errors**.
  3. `npm run lint`: **0 errors**.
  4. `verify-continuous-journey.mjs`: **Console Errors = 0, Page Errors = 0, removeChild Errors = 0**.
- **Status:** **RESOLVED**

---

## 17. Unified Camera + Spotlight + World Spatial Travel

> **SUPERSEDED:** the tween/proxy-timeline engine described below was replaced
> on 2026-08-23 by the pure-function camera in **§18**. Chapter coordinates,
> spotlight travel behaviour and protected locks still apply; the z-depth
> parallax-layer and master-timeline descriptions do not.


- **Unified Travel Engine (`components/about/about-experience.tsx`):**
  - **Coordinated System:** Camera target `(x, y)`, camera scale `scale`, camera depth `z`, spotlight position `(--sx, --sy)`, spotlight pool radius `(--fr)`, and multi-layer 3D parallax are driven by the **exact same master ScrollTrigger timeline frame**.
  - **Continuous Travel Path (`story-data.ts`):** Optimized spatial chapter node coordinates (`Kolkata: 28,28`, `Memory: 48,42`, `Journey: 68,28`, `Bengaluru: 74,52`, `Community: 56,70`, `Durga Puja: 32,72`, `Sarathi: 50,50`). Moving between chapters translates the camera across `20%–40%` of the board (`400px–800px` viewport translation).
  - **Synchronized Spotlight Travel:** As the camera travels from Chapter `k` to Chapter `k+1`, the spotlight light pool physically glides across the board continuously from `(x_k, y_k)` to `(x_{k+1}, y_{k+1})`, expanding to `42vmin` during spatial travel and contracting/locking down to `28vmin` at focus hold.
  - **Visual Transition:** During scroll, Chapter `k` physically moves out of the viewport, Chapter `k+1` moves into view from the opposite edge, and background/route layers shift with relative 3D perspective depth.
- **Protected Locks:** Home page (`/`) remained 100% untouched. Active cards remain 100% front-facing (`353×276`). `useLayoutEffect` + `gsap.context()` + `ctx.revert()` lifecycle intact.
- **Verification:**
  1. Captured & visually verified browser screenshots (`ch01-focus.png`, `ch01-travel.png`, `ch02-focus.png`, `ch03-focus.png`, `ch07-final.png`) on `http://localhost:3001`.
  2. `npx tsc --noEmit`: **0 errors**.
  3. `npm run lint`: **0 errors**.
  4. `verify-continuous-journey.mjs`: **Console Errors = 0, Page Errors = 0, removeChild Errors = 0**.
- **Status:** **RESOLVED**












## 18. Cinematic Camera Redesign — Pure Function of Scroll Progress

- **Engine (`components/about/about-experience.tsx`, rewritten 2026-08-23):**
  - **Architecture:** `SCROLL → Lenis → ScrollTrigger (pinned, +=5760) → render(progress)`. `render()` is a pure function of progress — no proxy objects, no scrubbed tweens, no quickSetters. `ScrollTrigger.onUpdate`/`onRefresh` are the only drivers; an initial `render()` paints the entry pose.
  - **Three phases** (fractions of pinned scroll): ENTRY `0 → 0.07` tilt-settle push-in from drone pose `START = {scale: 0.62, rotX: 30°, rotY: -8°, rotZ: 3°}`; JOURNEY `0.07 → 0.89` documentary dolly between chapter nodes with per-chapter attitude drift + raised-cosine focus pulse (`+0.2` scale at hold beats); EXIT `0.89 → 1` submerge & blackout — camera flattens/recentres, board dissolves to opacity 0, only the closing line survives.
  - **Per-frame writes:** ONE inline transform string on `[data-board]` — `perspective(1200px) translate(panX−50%, panY−50%) rotate(rz) rotateY(ry) rotateX(rx) scale(s)` — plus `opacity`, `filter: blur()`, and spotlight vars `--sx/--sy/%` + `--fr/vmin` via direct `board.style` writes. The CSS `translate(-50%,-50%)` centering of `.ab-board` is folded into the string (inline fully replaces the stylesheet transform).
- **Data (`story-data.ts`):** dead `focalRadius` removed; each chapter gained real `cam: {rotX, rotY, rotZ}` attitude values (ch01 `{8,-3,0}` → ch07 `{0,0,0}` flat for exit).
- **Markup/styles:** closing line moved OUTSIDE the board into stage-level `[data-closing]` overlay (`.ab-closing`) so it survives the blackout; film-grain overlay added via `.ab-stage::after`; reduced-motion fallback renders static composed archive with visible closing line.
- **Why no quickSetter (do not reintroduce):** in this stack (React 19 + GSAP 3.15) `gsap.quickSetter` on transform props stalled after its init write — silently, while CSS-var quickSetters and `gsap.set()` kept working every frame. It also swallowed the stylesheet's `-50%/-50%` centering into its cache, mis-framing the board until the rewrite. Direct style writes have zero such failure modes.
- **Lifecycle:** `useLayoutEffect` + `gsap.context()` + `ctx.revert()` unchanged (required for pin-spacer unwrap before React removal). Reduced-motion path returns early — no pinning, no camera.
- **Verification (2026-08-23):** live DOM probe at three beats on `http://localhost:3000/about` — top: `rotateX(30°) scale(0.62) translate(-28%,-28%)`; 40%: tracking spotlight (`sx=70`), `rotX 7.5°` drift, pulse zoom `1.05`; end: flat, recentred, opacity 0. HUD advances 01→07, route draws, closing line reveals. `npm run lint`: 0 errors (3 pre-existing img warnings).
- **Status:** **RESOLVED**

---

## 19. Events Route — `/events` (Rebuilt 2026-08-31)

- **Route:** `app/events/page.tsx` renders `EventsPage` + `EventsNav` (Calendar icon active). `EventsPage` is **shared**: it is also embedded as the `[data-section="events"]` block of the continuous `/` journey (`app/page.tsx`), so the rebuilt page appears in both contexts automatically. Branding (logo + "SARATHI / CULTURAL ASSOCIATION" top-left, emblem top-right) is rendered globally by `BrandLockup` in `app/layout.tsx` — there is **no** top navigation bar (`SiteBrand` is dead code).
- **Page order (single scroll):** EVENTS HERO → EVENT SCHEDULE → BBMP GROUND / WHERE WE GATHER.
- **Content (`components/events/events-data.ts`):** single source of truth, no invented data.
  - `HERO` (Events · Durga Puja 2026 · 16–21 Oct · Puja/Culture/Music/Community · Koramangala) and `VENUE` (Sarathi Cultural Association, BBMP Ground, 5th Block, Koramangala, Bengaluru).
  - **CULTURAL EVENTS (15 → 21 Oct, 7 items):** 15 Food Festival (7:00–9:00 PM, explicitly noted as not a religious Puja day), 16 Inauguration (Sri Ramalinga Reddy, M Tirtho w/ 4 songs), 17 “Devi Arpana” (100+ dancers, 10+ academies) + Leading Live Band, 18 Dandiya with Dhol, 19 Asmita Kar concert, 20 Rupankar Bagchi, 21 Till Afternoon — Visarjan Day. Festival highlight `CULTURAL_HIGHLIGHT` (Garba & Dandiya 17–21 Oct) + `AMENITIES` (6).
  - **RELIGIOUS EVENTS (16 → 21 Oct, 6 days):** Shashti, Saptami (Pushpanjali 10:05, Patachitra demo, Bengal almanac ঘোটকে আগমন), Maha Ashtami (Kumari Puja, Bhog 2–4), Ashtami/Sandhi Puja (Bali Daan 7:50, 108 diyas highlight, Flea & Handicraft Expo), Maha Navami (Dhunuchi & Dandiya), Dashami (Sindur Khela, Bisarjan, Bijoya, almanac নৌকায় গমন). `RITUALS` (4) rendered as an Important Rituals block.
- **Design (`components/events/events.css`):** keeps the original dark-night cinematic hero (100svh, Bengali watermark, corner ornaments). New **BookMyShow-style schedule**: `.ev-card` with a large **empty poster placeholder at a 4:5 (1080:1350) ratio** (subtle maroon/gold gradient placeholder + grain + "Poster" label — no fake art, real posters land later), date/title/short summary below. Multi-column `auto-fill minmax(210px,1fr)` grid, `.ev-culture-note` highlight, 6-amenity grid, 4 ritual cards, and an in-page **detail modal** (.ev-modal / .ev-modal-card). Responsive: cards stack 1-up on mobile with 16px side gutters (`.ev-cat` padding `clamp(16px,4vw,32px)`), no horizontal overflow.
- **Detail view:** `components/events/event-modal.tsx` — in-page modal via `motion`/`AnimatePresence` (existing dep), triggered by `ScheduleSection` state; overlay + Escape + close button dismissal; keeps Events fully scrollable with no extra route.
- **Components:** `schedule-section.tsx` (orchestrator + 2 categories + rituals + highlight + amenities + modal state), `event-card.tsx` (poster placeholder + info → opens modal), `event-modal.tsx` (detail), alongside `events-hero.tsx` / `venue-section.tsx`.
- **Motion (`components/events/events-page.tsx`):** `useLayoutEffect` + `gsap.context()` + `ctx.revert()`; mount-time hero entrance + `once: true` scroll reveals. **No pinning.** Shared Lenis via `lib/lenis.ts` `initSharedLenis()`/`destroySharedLenis()`; reduced-motion skips tween creation but balances the Lenis refcount.
- **Verification (2026-08-31):** `npx tsc --noEmit` 0, `npm run lint` 0 (5 pre-existing `<img>` warnings in `brand-lockup`/`site-brand`/`parallax`, none in new Events files), `npm run build` clean (all 3 routes static). Headless Chrome (CDP) against `next start` on `/events`: order hero(0) → Event Schedule(804) → venue(3401); 7 cultural + 6 religious cards; poster aspect exactly 1.25 (5:4); modal opens Food Festival/Dandiya titles & closes via Escape; branding + wordmark + emblem present; `sc-nav`=0, dock 3 items; direct route + continuous `/` journey both render the section; **mobile 390px** — no horizontal overflow, cards stack 1-up with 16px gutters, fully scrollable to venue; **desktop 1440px** — 5-column grid.
- **Status:** **COMPLETE**

---

## 20. Editorial Design System + Compact Top Navigation (Redesigned 2026-08-30)

- **Design language:** translated the reference's modern editorial system into SCA's black + ivory + maroon + gold. Named the **"editor" system**; additive + namespaced so no existing selector was redefined.
- **Shared primitives (`components/ui/editor.css`, imported once in `app/layout.tsx`):** `.sc-container` reading width `min(1140px, 92vw)`, `.sc-section` rhythm `clamp(72px,10vw,128px)`, `.sc-label`/`.sc-headline`/`.sc-lede`/`.sc-rule` type scale, card system `.sc-card` + `--maroon`/`--cream`/`--charcoal`/`--gold` variants (18px radius, subtle borders, minimal shadows), `.sc-num` giant Bebas numerals, `.sc-meta`, CTAs `.sc-cta`/`.sc-cta--ghost`/disabled with animated `→` arrow and gold focus ring, reduced-motion block.
- **Compact top navigation (`components/layout/site-brand.tsx`, now a client component):** slim fixed `.sc-nav` bar — logo + "SARATHI / Cultural Association" wordmark left, inline HOME / ABOUT / EVENTS links right (gold + hairline underline when active, via `usePathname`), decorative emblem far right. Links hidden <768px where the **bottom magnify dock remains the primary nav** (dock untouched → previously verified behavior preserved). Real routes only.
- **Events aligned to the system:** cards rounded to match (`.ev-paper` 20px, `.ev-day-card`/`.ev-ritual`/`.ev-prg-card`/`.ev-garba` 16px, amenities/pills 10px/999px); Food Festival card gained a real `sc-cta` "View the Puja schedule →" anchor to the new `#puja-schedule` id on the schedule section (`scroll-margin-top: 96px` clears the fixed bar). No content invented — every CTA points to an existing destination.
- **Home / About:** engines untouched (`ParallaxComponent`, `AboutExperience`). They inherit the new chrome automatically because every route renders `SiteBrand`.
- **Verification (2026-08-30):** `tsc` 0, `lint` 0 (3 pre-existing `<img>` warnings), `build` clean. Headless Chrome (CDP): top bar renders on all 3 routes with correct active links and dock present, no horizontal overflow, CTA scrolls to `#puja-schedule`, mobile 390px hides inline links (dock navigates), **0 console/page errors** across navigation.
- **Status:** **RESOLVED**
- **NOTE (2026-08-31):** the `SiteBrand` fixed top-nav bar described above is **no longer rendered**. A later change replaced it with the pure-branding `BrandLockup` (`components/layout/brand-lockup.tsx`, rendered once in `app/layout.tsx`) — logo + "SARATHI / CULTURAL ASSOCIATION" wordmark top-left and emblem top-right, with **no bar, no inline HOME/ABOUT/EVENTS links, no active states**. The bottom magnify dock is the sole primary navigation on every route. `site-brand.tsx` and the `.sc-nav*` styles it used are now **dead code** (kept, unreferenced).
