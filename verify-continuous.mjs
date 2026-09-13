/*
 * Continuous-document verification for the SCA one-page architecture.
 * Real CDP wheel + clicks against `next start`, desktop (1440×900) and
 * mobile (390×844).
 */
import puppeteer from "puppeteer";

const BASE = "http://localhost:3000";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let failures = 0;
const pageErrors = [];
const consoleErrors = [];

const check = (name, cond, extra = "") => {
  const ok = Boolean(cond);
  if (!ok) failures++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${extra ? " — " + extra : ""}`);
};

const browser = await puppeteer.launch({
  executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  headless: "new",
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
page.on("console", (m) => { if (m.type() === "error") consoleErrors.push(m.text()); });
page.on("pageerror", (e) => pageErrors.push(String(e)));

const state = () =>
  page.evaluate(() => ({
    path: location.pathname,
    hash: location.hash,
    y: window.scrollY | 0,
    max: Math.max(0, document.documentElement.scrollHeight - window.innerHeight) | 0,
    counter: document.querySelector("[data-count]")?.textContent ?? "",
    active: Array.from(document.querySelectorAll(".dock-item")).find((e) =>
      e.classList.contains("dock-item-active"),
    )?.getAttribute("aria-label") ?? "(none)",
  }));

const wheelDown = async (n, step = 160, gap = 10) => {
  for (let i = 0; i < n; i++) {
    await page.mouse.wheel({ deltaX: 0, deltaY: step });
    await sleep(gap);
  }
};
const wheelUp = async (n, step = 160, gap = 10) => {
  for (let i = 0; i < n; i++) {
    await page.mouse.wheel({ deltaX: 0, deltaY: -step });
    await sleep(gap);
  }
};

async function driveToBottom(tries = 400) {
  let last = -1, stalls = 0;
  for (let i = 0; i < tries; i++) {
    await wheelDown(4, 400, 8);
    const s = await state();
    if (s.y <= last) {
      if (++stalls > 6) break;
    } else { stalls = 0; last = s.y; }
    if (s.y >= s.max - 4) return s;
  }
  return state();
}
async function driveToTop(tries = 400) {
  let last = 1e9, stalls = 0;
  for (let i = 0; i < tries; i++) {
    await wheelUp(4, 400, 8);
    const s = await state();
    if (s.y >= last) {
      if (++stalls > 6) break;
    } else { stalls = 0; last = s.y; }
    if (s.y <= 2) return s;
  }
  return state();
}

async function sectionTop(id) {
  return page.evaluate((sec) => {
    const el = document.getElementById(sec);
    if (!el) return -1;
    return Math.round(el.getBoundingClientRect().top + window.scrollY);
  }, id);
}
async function clickDock(label) {
  const ok = await page.evaluate((lbl) => {
    const el = Array.from(document.querySelectorAll(".dock-item")).find(
      (e) => e.getAttribute("aria-label") === lbl,
    );
    if (!el) { return false; }
    el.click();
    return true;
  }, label);
  if (!ok) throw new Error(`dock item "${label}" not found`);
}
async function activeItem() {
  return page.evaluate(() => {
    const a = Array.from(document.querySelectorAll(".dock-item")).find((e) =>
      e.classList.contains("dock-item-active"),
    );
    return a ? a.getAttribute("aria-label") : "(none)";
  });
}

console.log("== 1. single document, one vertical scrollbar, sections exist ==\n");
await page.goto(BASE + "/", { waitUntil: "networkidle0" });
await sleep(800);
const sections = await page.evaluate(() =>
  Array.from(document.querySelectorAll("[data-section]")).map((el) => el.id),
);
check("sections present (#home #about #events #booking #gather)",
  JSON.stringify(sections) === JSON.stringify(["home", "about", "events", "booking", "gather"]),
  sections.join(","));
const doc = await state();
check("document has ONE tall scroll (scrollHeight > viewport)", doc.max > 900, `max=${doc.max}`);
const scrollers = await page.evaluate(() => {
  const offenders = [];
  for (const el of document.querySelectorAll("*")) {
    const cs = getComputedStyle(el);
    if (["auto", "scroll"].includes(cs.overflowY) &&
        el.scrollHeight > el.clientHeight + 1) {
      offenders.push(`${el.className.toString().slice(0, 40)} y=${cs.overflowY}`);
    }
  }
  return {
    htmlOverflowY: getComputedStyle(document.documentElement).overflowY,
    bodyOverflowY: getComputedStyle(document.body).overflowY,
    offenders,
  };
});
check("html/body give the document the vertical scrollbar (no overflow:hidden)",
  !["hidden", "clip"].includes(scrollers.htmlOverflowY) &&
  !["hidden", "clip"].includes(scrollers.bodyOverflowY),
  `html=${scrollers.htmlOverflowY} body=${scrollers.bodyOverflowY}`);
check("no nested vertical scroller exists (modals/carousel closed or x-only)",
  scrollers.offenders.length === 0,
  scrollers.offenders.slice(0, 3).join(" | "));
const lenisOn = await page.evaluate(() =>
  document.documentElement.classList.contains("lenis"));
check("Lenis smooth scroll active on desktop", lenisOn === true);

console.log("\n== 1b. 'Where We Gather' is the GLOBAL FINAL section (outside Events) ==\n");
const gather = await page.evaluate(() => {
  const text = (sel) => document.querySelector(sel)?.textContent.trim() ?? "";
  const gatherEl = document.querySelector('[data-section="gather"]');
  const eventsEl = document.getElementById("events");
  const bookingEl = document.getElementById("booking");
  const footerEl = document.querySelector(".bk-footer");
  const top = (el) => (el ? Math.round(el.getBoundingClientRect().top + window.scrollY) : -1);
  const secs = Array.from(document.querySelectorAll("[data-section]"));
  return {
    gatherCount: document.querySelectorAll('[data-section="gather"]').length,
    gatherHeading: text("[data-section=gather] .ev-kicker").replace(/\s+/g, " "),
    gatherAddress: text("[data-section=gather] .ev-venue-address").replace(/\s+/g, " "),
    eventsContainsGather: (eventsEl?.textContent ?? "").includes("Where We Gather"),
    gatherInsideEvents: !!(gatherEl && eventsEl && eventsEl.contains(gatherEl)),
    gatherInsideBooking: !!(gatherEl && bookingEl && bookingEl.contains(gatherEl)),
    gatherIsLastSection: secs.length > 0 && secs[secs.length - 1] === gatherEl,
    tops: { booking: top(bookingEl), gather: top(gatherEl), footer: top(footerEl) },
    venueRendererCount: document.querySelectorAll(".ev-venue").length,
  };
});
check("exactly one gather section", gather.gatherCount === 1, `count=${gather.gatherCount}`);
check("gather renders exactly one venue block", gather.venueRendererCount === 1,
  `count=${gather.venueRendererCount}`);
check("gather heading is 'Where We Gather'", gather.gatherHeading === "Where We Gather", gather.gatherHeading);
check("gather address is the original SCA text",
  /Sarathi Cultural Association/.test(gather.gatherAddress) &&
  /BBMP Ground/.test(gather.gatherAddress) &&
  /Bengaluru/.test(gather.gatherAddress),
  gather.gatherAddress);
check("Events no longer contains 'Where We Gather'", !gather.eventsContainsGather);
check("gather is OUTSIDE the Events section", !gather.gatherInsideEvents);
check("gather is OUTSIDE the Booking section", !gather.gatherInsideBooking);
check("gather is the LAST [data-section] block", gather.gatherIsLastSection);
check("document order booking < gather < footer",
  gather.tops.booking > 0 && gather.tops.gather > gather.tops.booking && gather.tops.footer > gather.tops.gather,
  JSON.stringify(gather.tops));

console.log("\n== 2. continuous wheel: Home → About → Events → Booking, no route change ==\n");
const countersSeen = new Set();
const during = [];
const poll = async () => {
  const s = await state();
  if (s.counter) countersSeen.add(s.counter);
  during.push(s.path);
};
let final;
{
  await wheelDown(0); // ensure start
  const guard = setInterval(poll, 120);
  final = await driveToBottom();
  clearInterval(guard);
  await sleep(300);
}
check("reached the very bottom by wheel only", final.y >= final.max - 4, `y=${final.y}/${final.max}`);
check("path stayed / the whole ride", during.every((p) => p === "/"), during.slice(0, 5).join(","));
check("About cinematic ran 01/07 → 07/07", countersSeen.has("01 / 07") && countersSeen.has("07 / 07"),
  [...countersSeen].join(", "));
const pinSpacer = await page.evaluate(() => !!document.querySelector(".pin-spacer .ab"));
check("About is GSAP-pinned inside the global document (pin-spacer present)", pinSpacer === true);

console.log("\n== 3. reverse wheel: Booking → Events → About → Home ==\n");
countersSeen.clear();
{
  const guard = setInterval(poll, 120);
  await driveToTop();
  clearInterval(guard);
}
const top = await state();
check("back at top by wheel only", top.y <= 2, `y=${top.y}`);
check("path stayed / on the way up", during.every((p) => p === "/"));
check("About counter ran backwards down to 01/07", countersSeen.has("01 / 07"), [...countersSeen].slice(-3).join(","));

console.log("\n== 4. dock navigation = smooth scroll (no router.push) ==\n");
const hist0 = await page.evaluate(() => history.length);
const aboutTop = await sectionTop("about");
const eventsTop = await sectionTop("events");
const bookingTop = await sectionTop("booking");

async function dockTrial(label, expectedTop, tol = 200) {
  await clickDock(label);
  let s, ok = false;
  for (let i = 0; i < 60; i++) {
    await sleep(80);
    s = await state();
    if (s.y >= expectedTop - tol && s.y <= expectedTop + tol) { ok = true; break; }
  }
  check(`dock ${label} scrolls to #${label.toLowerCase()} (y≈${expectedTop})`, ok,
    `y=${s.y}, hash=${s.hash}, active=${s.active}`);
  check(`dock ${label} active highlight`, s?.active === label, `active=${s?.active}`);
  check(`dock ${label} URL stays root page`, s?.path === "/" && s?.hash === `#${label.toLowerCase()}`,
    `${s?.path}${s?.hash}`);
}

await dockTrial("About", aboutTop);
await dockTrial("Events", eventsTop);
await dockTrial("Booking", bookingTop);
await dockTrial("Home", 0, 40);

const hist1 = await page.evaluate(() => history.length);
check("dock clicks never add history entries (replaceState)", hist0 === hist1, `${hist0} vs ${hist1}`);

// About stays active throughout its pinned run
await dockTrial("About", aboutTop, 300);
let aboutActiveThroughout = true;
const probes = [[600, "p0.6k"], [2500, "p2.5k"], [2500, "p2.5k"]];
for (const [dy, tag] of probes) {
  await wheelDown(Math.floor(dy / 320), 320, 8);
  await sleep(120);
  const act = await activeItem();
  if (act !== "About") { aboutActiveThroughout = false; }
}
check("About icon stays active across the whole cinematic run", aboutActiveThroughout,
  `final active=${await activeItem()}`);

console.log("\n== 5. legacy routes redirect to sections ==\n");
for (const [route, hash] of [["/about", "#about"], ["/events", "#events"], ["/booking", "#booking"]]) {
  const resp = await page.goto(BASE + route, { waitUntil: "networkidle0" });
  await sleep(700);
  const s = await state();
  check(`${route} → /${hash} (redirect)`, s.path === "/" && s.hash === hash,
    `${resp && resp.status()} -> /${s.path}${s.hash}, y=${s.y}`);
}
// direct deep links land at the section, not the top
{
  await page.goto(BASE + "/#booking", { waitUntil: "networkidle0" });
  await sleep(900);
  const s = await state();
  check("hard reload of /#booking lands near booking section", s.y > bookingTop - 400, `y=${s.y}/${bookingTop}`);
  await page.goto(BASE + "/#about", { waitUntil: "networkidle0" });
  await sleep(900);
  const s2 = await state();
  check("hard reload of /#about lands at the cinematic start", s2.y >= aboutTop - 300 && s2.y < aboutTop + 200,
    `y=${s2.y}/${aboutTop}`);
}

console.log("\n== 6. mobile 390×844 ==\n");
await page.setViewport({ width: 390, height: 844 });
await page.goto(BASE + "/", { waitUntil: "networkidle0" });
await sleep(800);
const mob = await page.evaluate(() => ({
  sw: document.documentElement.scrollWidth,
  cw: document.documentElement.clientWidth,
  lenis: document.documentElement.classList.contains("lenis"),
  dockItems: Array.from(document.querySelectorAll(".dock-item")).length,
  aboutSection: document.getElementById("about") ? document.getElementById("about").offsetHeight : -1,
}));
check("no horizontal overflow on mobile", mob.sw <= mob.cw, `scrollW=${mob.sw} clientW=${mob.cw}`);
check("native touch scrolling (no Lenis) on mobile", mob.lenis === false);
check("mobile dock = 3 items (no About)", mob.dockItems === 3, `items=${mob.dockItems}`);
check("About cinematic not mounted on mobile", mob.aboutSection < 4, `h=${mob.aboutSection}`);
{
  const mFinal = await driveToBottom(300);
  check("mobile wheels from top to the true bottom (gather+footer reachable)",
    mFinal.y >= mFinal.max - 4, `y=${mFinal.y}/${mFinal.max}`);
  const mVenue = await page.evaluate(() => ({
    venue: !!document.querySelector(".ev-venue"),
    footer: !!document.querySelector(".bk-footer"),
  }));
  check("mobile renders the gather section + footer", mVenue.venue && mVenue.footer);
  await clickDock("Booking");
  await sleep(1500);
  const afterDock = await state();
  check("mobile dock Booking scrolls into the booking section", afterDock.y > 2000, `y=${afterDock.y}`);
  const mFinal2 = await driveToBottom(300);
  check("mobile wheels on past booking to the final gather/footer end",
    mFinal2.y >= mFinal2.max - 4, `y=${mFinal2.y}/${mFinal2.max}`);
}
await page.setViewport({ width: 1440, height: 900 });

console.log("\n== health ==\n");
await page.goto(BASE + "/", { waitUntil: "networkidle0" });
await sleep(800);
check("0 console errors", consoleErrors.length === 0, consoleErrors.slice(0, 4).join(" | "));
check("0 page errors", pageErrors.length === 0, pageErrors.slice(0, 4).join(" | "));

console.log("");
console.log(failures === 0 ? "ALL CHECKS PASSED" : `${failures} CHECKS FAILED`);
await browser.close();
process.exit(failures === 0 ? 0 : 1);