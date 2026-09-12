/*
 * Route-journey end-to-end verification — REAL CDP wheel input.
 *
 * Runs against `next start` (production) and drives the game with
 * Input.dispatchMouseEvent(mouseWheel), not window.scrollTo.
 *
 * Cases:
 *   A. FULL DOWN JOURNEY  / -> /about (top) -> /events (top) -> /booking (top)
 *   B. FULL UP JOURNEY    /booking -> /events (bottom) -> /about (end, Ch7) -> / (bottom)
 *   C. STAY CASES         / top+up stays, /booking bottom+down stays
 *   D. CHAPTER 2 REGRESSION: mid-about pin, URL stays /about, dock stays About
 *   E. NAV CLICKS         About/Events/Booking/Home
 *   F. CYCLE TWICE + LEAK CHECKS (removeChild, pin-spacers, triggers, lenis)
 */

import puppeteer from "puppeteer";

const BASE = "http://localhost:3000";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let failures = 0;
let consoleErrors = [];
let pageErrors = [];

function check(name, cond, extra = "") {
  const ok = Boolean(cond);
  if (!ok) failures++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${extra ? " — " + extra : ""}`);
}

async function getMax(page) {
  return page.evaluate(
    () =>
      Math.max(0, document.documentElement.scrollHeight - window.innerHeight) |
      0,
  );
}

async function getScroll(page) {
  return page.evaluate(() => window.scrollY | 0);
}

async function getPath(page) {
  return page.evaluate(() => location.pathname);
}

async function getDockState(page) {
  return page.evaluate(() =>
    Array.from(document.querySelectorAll(".dock-item")).map((el) => ({
      label: el.getAttribute("aria-label") || "",
      active: el.classList.contains("dock-item-active"),
    })),
  );
}

/* Wheel toward a boundary using real CDP wheel events; stop when reached. */
async function wheelUntil(page, direction, amountGuard = 600) {
  const dir = direction.toLowerCase();
  for (let i = 0; i < amountGuard; i++) {
    const atBoundary = await page.evaluate((d) => {
      const y = window.scrollY;
      const max = Math.max(
        0, document.documentElement.scrollHeight - window.innerHeight);
      return d === "down" ? y >= max - 4 : y <= 4;
    }, dir);
    if (atBoundary) return true;
    const settled = await page.evaluate(() => {
      const l = window;
      /* give Lenis a beat to absorb the wheel before the next one */
      return new Promise((resolve) => {
        let last = -1;
        const check2 = () => {
          if (Math.abs(window.scrollY - last) < 0.4) return resolve();
          last = window.scrollY;
          setTimeout(check2, 16);
        };
        check2();
      });
    });
    await settled;
    await page.mouse.wheel({
      deltaX: 0,
      deltaY: dir === "down" ? 240 : -240,
    });
    await sleep(24);
  }
  return false;
}

/* One extra wheel that pushes PAST the boundary in the given direction. */
async function nudgePast(page, direction) {
  await page.mouse.wheel({
    deltaX: 0,
    deltaY: direction === "down" ? 240 : -240,
  });
  await sleep(350);
  return page.evaluate(() => location.pathname);
}

async function waitPath(page, path, tries = 40) {
  for (let i = 0; i < tries; i++) {
    const p = await getPath(page);
    if (p === path) return true;
    await sleep(100);
  }
  return false;
}

async function waitSettle(page) {
  await sleep(300);
  /* wait for scroll to stop moving */
  await page.evaluate(
    () =>
      new Promise((resolve) => {
        let last = -1;
        const t = () => {
          if (Math.abs(window.scrollY - last) < 0.4) return resolve();
          last = window.scrollY;
          setTimeout(t, 30);
        };
        t();
      }),
  );
  await sleep(150);
}

async function activeLabel(page) {
  const dock = await getDockState(page);
  const a = dock.find((d) => d.active);
  return a ? a.label : "(none)";
}

async function countText(page) {
  return (await page.evaluate(() => {
    const el = document.querySelector("[data-count]");
    return el ? el.textContent.trim() : null;
  })) ?? "";
}

async function leakState(page) {
  return page.evaluate(() => ({
    pinSpacers: document.querySelectorAll(".pin-spacer").length,
    triggers: window.ScrollTrigger ? window.ScrollTrigger.getAll().length : -1,
    pinnedTriggers: window.ScrollTrigger
      ? window.ScrollTrigger.getAll().filter((t) => t.pin).length
      : -1,
    lenisClass: document.documentElement.classList.contains("lenis"),
  }));
}

async function clickDock(page, label) {
  const clicked = await page.evaluate((lbl) => {
    const el = Array.from(document.querySelectorAll(".dock-item")).find(
      (e) => e.getAttribute("aria-label") === lbl,
    );
    if (!el) return false;
    el.click();
    return true;
  }, label);
  if (!clicked) throw new Error(`dock item ${label} not found`);
}

function freshCounters() {
  consoleErrors = [];
  pageErrors = [];
}

function bindErrorCapture(page) {
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });
  page.on("pageerror", (err) => pageErrors.push(String(err)));
}

/* ---------------------------------------------------------------- */

const browser = await puppeteer.launch({
  executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  headless: "new",
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
await page.emulateMediaFeatures([
  { name: "prefers-reduced-motion", value: "no-preference" },
]);
bindErrorCapture(page);

console.log("=== A. DOWN JOURNEY / -> /about -> /events -> /booking ===");

await page.goto(BASE + "/", { waitUntil: "networkidle0", timeout: 30000 });
await sleep(600);
check("A0 initial path = /", (await getPath(page)) === "/");
check("A0 initial dock = Home", (await activeLabel(page)) === "Home");

/* scroll to home bottom */
const homeMax = await getMax(page);
await wheelUntil(page, "down");
check("A1 reached home bottom", (await getScroll(page)) >= homeMax - 4,
  `y=${await getScroll(page)} max=${homeMax}`);
await nudgePast(page, "down");
check("A2 path -> /about", (await getPath(page)) === "/about");
await waitSettle(page);
check("A3 entered /about at TOP", (await getScroll(page)) <= 600,
  `y=${await getScroll(page)}`);

/* About: drive gently to Chapter 2, assert the regression points */
const aboutMax = await getMax(page);
/* Chapter 2 lands ~ (0.07 + 1/7*0.82) of the pin — walk gently (60px wheel,
 * settled samples) so the HUD update is actually observed; abort if we ever
 * leave /about so this loop can never chain-route like the previous run. */
let guard = 0;
let saw2 = false;
while (guard++ < 300 && !saw2) {
  if ((await getPath(page)) !== "/about") break;
  await page.mouse.wheel({ deltaX: 0, deltaY: 60 });
  await sleep(26);
  const c = await countText(page);
  if (c.startsWith("02")) saw2 = true;
}
check("A4 reached About Chapter 2 (HUD 02/07)", saw2, `count=${await countText(page)}`);
check("A5 [REGRESSION] Chapter 2: path stays /about", (await getPath(page)) === "/about");
check("A6 [REGRESSION] Chapter 2: dock active = About", (await activeLabel(page)) === "About");
check("A7 [REGRESSION] Chapter 2: no pin-spacer corruption",
  (await countText(page)) !== "07" && (await getPath(page)) === "/about");

/* continue through all 7 chapters to the end -> events */
await wheelUntil(page, "down");
check("A8 reached about end", (await getScroll(page)) >= aboutMax - 4);
await nudgePast(page, "down");
check("A9 path -> /events", (await getPath(page)) === "/events");
await waitSettle(page);
check("A10 entered /events at TOP", (await getScroll(page)) <= 600,
  `y=${await getScroll(page)}`);
check("A11 dock active = Events", (await activeLabel(page)) === "Events");

/* events -> booking */
await wheelUntil(page, "down");
await nudgePast(page, "down");
check("A12 path -> /booking", (await getPath(page)) === "/booking");
await waitSettle(page);
check("A13 entered /booking at TOP", (await getScroll(page)) <= 600,
  `y=${await getScroll(page)}`);
check("A14 dock active = Booking", (await activeLabel(page)) === "Booking");

console.log("=== C. STAY CASES ===");

/* booking bottom + down stays */
await wheelUntil(page, "down");
const beforeStay = await getPath(page);
await nudgePast(page, "down");
check("C1 booking bottom + wheel down stays /booking",
  (await getPath(page)) === "/booking" && beforeStay === "/booking");
check("C2 booking dock still Booking", (await activeLabel(page)) === "Booking");

/* / top + up stays */
await page.goto(BASE + "/", { waitUntil: "networkidle0", timeout: 30000 });
await sleep(600);
await nudgePast(page, "up");
check("C3 / top + wheel up stays /", (await getPath(page)) === "/");
check("C4 / dock still Home", (await activeLabel(page)) === "Home");

console.log("=== B. UP JOURNEY /booking -> /events -> /about(Ch7 end) -> /(bottom) ===");

await page.goto(BASE + "/booking", { waitUntil: "networkidle0", timeout: 30000 });
await sleep(600);
/* start at booking top, wheel UP */
await nudgePast(page, "up");
check("B1 path -> /events (up)", (await getPath(page)) === "/events");
await waitSettle(page);
check("B2 entered /events at BOTTOM", (await getScroll(page)) >= (await getMax(page)) - 40,
  `y=${await getScroll(page)} max=${await getMax(page)}`);

/* events up to top -> about */
await wheelUntil(page, "up");
await nudgePast(page, "up");
check("B3 path -> /about (up)", (await getPath(page)) === "/about");
await waitSettle(page);
check("B4 entered /about at END (Ch7)", (await countText(page)) === "07" || (await getScroll(page)) >= (await getMax(page)) - 40,
  `count=${await countText(page)} y=${await getScroll(page)}`);

/* walk UP back through chapters — verify stays /about mid-journey */
let upGuard = 0;
let walkedBack = false;
while (upGuard++ < 500 && !walkedBack) {
  if ((await getPath(page)) !== "/about") break;
  await page.mouse.wheel({ deltaX: 0, deltaY: -120 });
  await sleep(26);
  const c = await countText(page);
  if (c.startsWith("04")) walkedBack = true;
}
check("B5 walked UP to About Chapter 4 (HUD 04/07)", walkedBack, `count=${await countText(page)}`);
check("B6 mid-reverse path stays /about", (await getPath(page)) === "/about");

/* continue up to about top -> home bottom */
await wheelUntil(page, "up");
await nudgePast(page, "up");
check("B7 path -> / (up)", (await getPath(page)) === "/");
await waitSettle(page);
check("B8 entered / at BOTTOM", (await getScroll(page)) >= (await getMax(page)) - 40,
  `y=${await getScroll(page)} max=${await getMax(page)}`);

/* home up to top stays / */
await wheelUntil(page, "up");
check("B9 home top reached", (await getScroll(page)) <= 4);
await nudgePast(page, "up");
check("B10 / top + up stays /", (await getPath(page)) === "/");

console.log("=== E. NAVBAR CLICK NAVIGATION ===");

await page.goto(BASE + "/", { waitUntil: "networkidle0", timeout: 30000 });
await sleep(600);
await clickDock(page, "About");
check("E1 click About -> /about", await waitPath(page, "/about"));
await sleep(400);
check("E1b dock = About", (await activeLabel(page)) === "About");
await clickDock(page, "Events");
check("E2 click Events -> /events", await waitPath(page, "/events"));
await sleep(400);
check("E2b dock = Events", (await activeLabel(page)) === "Events");
await clickDock(page, "Booking");
check("E3 click Booking -> /booking", await waitPath(page, "/booking"));
await sleep(400);
check("E3b dock = Booking", (await activeLabel(page)) === "Booking");
await clickDock(page, "Home");
check("E4 click Home -> /", await waitPath(page, "/"));
await sleep(400);
check("E4b dock = Home", (await activeLabel(page)) === "Home");

console.log("=== F. ROUTE CYCLE x2 + LEAK CHECKS ===");

freshCounters();
for (let cycle = 1; cycle <= 2; cycle++) {
  if ((await getPath(page)) !== "/") await page.goto(BASE + "/", { waitUntil: "networkidle0" });
  await sleep(500);
  await wheelUntil(page, "down");
  await nudgePast(page, "down");       /* /      -> /about */
  await waitSettle(page);
  await wheelUntil(page, "down");
  await nudgePast(page, "down");       /* /about -> /events */
  await waitSettle(page);
  await wheelUntil(page, "down");
  await nudgePast(page, "down");       /* /events-> /booking */
  await waitSettle(page);
  await wheelUntil(page, "up");
  await nudgePast(page, "up");         /* /booking-> /events (bottom) */
  await waitSettle(page);
  await wheelUntil(page, "up");
  await nudgePast(page, "up");         /* /events -> /about (end) */
  await waitSettle(page);
  await wheelUntil(page, "up");
  await nudgePast(page, "up");         /* /about  -> / (bottom) */
  await waitSettle(page);
  check(`F${cycle}a full down+up cycle complete`, (await getPath(page)) === "/");
  /* wait for React's unmount of the About page to settle *before* leak checks */
  await sleep(1400);
  const leaks = await leakState(page);
  /* home's hero-parallax legitimately owns 2 triggers — assert EXACTLY that */
  check(`F${cycle}b pin-spacers = 0 on /`, leaks.pinSpacers === 0,
    `pinSpacers=${leaks.pinSpacers}`);
  check(`F${cycle}c ScrollTrigger = home's 2 parallax (no About leak)`,
    leaks.triggers === 2 && leaks.pinnedTriggers === 0,
    `triggers=${leaks.triggers} pinned=${leaks.pinnedTriggers}`);
  /* scroll must be live: from mid-page, wheel down then up moves */
  await page.evaluate(() => window.scrollTo(0, 300));
  await sleep(300);
  const y0 = await getScroll(page);
  await page.mouse.wheel({ deltaX: 0, deltaY: 240 });
  await sleep(200);
  const y1 = await getScroll(page);
  await page.mouse.wheel({ deltaX: 0, deltaY: -240 });
  await sleep(200);
  check(`F${cycle}d scroll responsive (not stuck)`, y1 > y0, `y0=${y0} y1=${y1}`);
}
check("F2 console errors = 0", consoleErrors.length === 0,
  consoleErrors.slice(0, 5).join(" | "));
check("F3 page errors = 0", pageErrors.length === 0,
  pageErrors.slice(0, 5).join(" | "));

/* Lenis single-instance sanity + full-document cleanliness *after settling* */
await sleep(1200);
const cleanDoc = await page.evaluate(() => ({
  htmlLenis: document.documentElement.classList.contains("lenis") ? 1 : 0,
  pinSpacersInDoc: document.querySelectorAll(".pin-spacer").length,
  abSections: document.querySelectorAll(".ab").length,
}));
check("F4 single lenis class on <html>", cleanDoc.htmlLenis === 1);
check("F5 no stale pin-spacers document-wide", cleanDoc.pinSpacersInDoc === 0,
  `pinSpacers=${cleanDoc.pinSpacersInDoc}`);
check("F6 no stale <section.ab> anywhere", cleanDoc.abSections === 0,
  `ab=${cleanDoc.abSections}`);

console.log("");
console.log(failures === 0 ? "ALL CHECKS PASSED" : `${failures} CHECKS FAILED`);
await browser.close();
process.exit(failures === 0 ? 0 : 1);