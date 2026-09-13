/*
 * Acceptance: continued gestures needed per route boundary (real CDP wheels).
 * TOL is read from the app; a boundary crossing is expected on the FIRST
 * strong continued gesture once the viewer is within one notch of a limit.
 */
import puppeteer from "puppeteer";
const BASE = "http://localhost:3000";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await puppeteer.launch({
  executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  headless: "new",
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
page.on("pageerror", (e) => console.log("[pageerror]", String(e).slice(0, 200)));

const path = () => page.evaluate(() => location.pathname);
const yPos = () => page.evaluate(() => window.scrollY | 0);
const maxPos = () =>
  page.evaluate(
    () =>
      Math.max(0, document.documentElement.scrollHeight - window.innerHeight) |
      0,
  );

async function burst(dY, n = 8, step = 14) {
  for (let i = 0; i < n; i++) {
    await page.mouse.wheel({ deltaX: 0, deltaY: dY });
    await sleep(step);
  }
}

async function settle() {
  await sleep(700);
}

/* Stop BELOW the TOL firing band (app crosses at y>=max-32), so drive()
 * positions the viewer "at visual bottom" without crossing — then the
 * dedicated continued gesture below is what must cross. */
/* Stop 400px before the limit (out of the app's BOUNDARY_TOL firing band)
 * using small 3-wheel bursts so even a short page like Home (max ~900)
 * cannot overshoot the band mid-drive. */
async function drive(dir) {
  const dY = dir === "down" ? 140 : -140;
  for (let g = 0; g < 400; g++) {
    const y = await yPos();
    const max = await maxPos();
    if (dir === "down" && y >= max - 400) return;
    if (dir === "up" && y <= 400) return;
    await burst(dY, 3, 14);
  }
}

async function crossCount(dir) {
  const from = await path();
  for (let g = 1; g <= 10; g++) {
    await burst(dir === "down" ? 220 : -220, 8, 12);
    await sleep(450);
    if ((await path()) !== from) return g;
  }
  return 99;
}

async function measure(label, route, dir, expect) {
  await page.goto(BASE + route, { waitUntil: "networkidle0" });
  await settle();
  await drive(dir);
  const c = await crossCount(dir);
  const landed = await path();
  console.log(
    `${label.padEnd(24)} continued gestures: ${c === 1 ? "1 (OK)" : c}  -> ${landed}`,
  );
  return c === 1 && landed === expect;
}

console.log("== continued gestures needed per boundary (want 1 each) ==\n");
const r1 = await measure("HOME -> ABOUT", "/", "down", "/about");
const r2 = await measure("ABOUT(Ch7 end) -> EVENTS", "/about", "down", "/events");
const r3 = await measure("EVENTS -> BOOKING", "/events", "down", "/booking");
const r4 = await measure("BOOKING -> EVENTS (reverse)", "/booking", "up", "/events");
const r5 = await measure("EVENTS -> ABOUT (reverse)", "/events", "up", "/about");
const r6 = await measure("ABOUT(top) -> HOME (reverse)", "/about", "up", "/");

console.log("\n== fast continuous / -> /about -> /events -> /booking (no skips) ==");
await page.goto(BASE + "/", { waitUntil: "networkidle0" });
await sleep(700);
const seen = [];
let lastPath = "/";
let finished = false;
for (let i = 0; i < 2000 && !finished; i++) {
  const p = await page.evaluate(() => location.pathname);
  if (p !== lastPath) {
    seen.push(p);
    lastPath = p;
    console.log("  visited:", p, `(event ${i})`);
  }
  if (p === "/booking") finished = true;
  await page.mouse.wheel({ deltaX: 0, deltaY: 160 });
  await sleep(10);
}
console.log("route order visited:", seen.join(" -> "));
const okSequence = seen.join(",") === "/about,/events,/booking";
console.log(okSequence ? "SEQUENCE OK (no route skipped)" : "SEQUENCE BAD");

const all = [r1, r2, r3, r4, r5, r6].every(Boolean) && okSequence;
console.log(
  "\nSUMMARY:",
  all
    ? "ALL BOUNDARIES CROSS IN 1 CONTINUED GESTURE"
    : "SEE FAILURES ABOVE",
);
await browser.close();