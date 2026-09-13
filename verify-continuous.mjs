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
check("sections present (#home #about #events #booking #location)",
  JSON.stringify(sections) === JSON.stringify(["home", "about", "events", "booking", "location"]),
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

console.log("\n== 1b. 'Location' is the GLOBAL FINAL section (outside Events) ==\n");
const location = await page.evaluate(() => {
  const text = (sel) => document.querySelector(sel)?.textContent.trim() ?? "";
  const locEl = document.querySelector('[data-section="location"]');
  const eventsEl = document.getElementById("events");
  const bookingEl = document.getElementById("booking");
  const footerEl = document.querySelector(".bk-footer");
  const top = (el) => (el ? Math.round(el.getBoundingClientRect().top + window.scrollY) : -1);
  const secs = Array.from(document.querySelectorAll("[data-section]"));
  const iframe = document.querySelector('[data-section="location"] iframe');
  const directions = document.querySelector('[data-section="location"] a.location-directions');
  const iframeFrame = iframe ? iframe.parentElement : null;
  const iframeCSS = iframe ? getComputedStyle(iframe) : null;
  const frameCSS = iframeFrame ? getComputedStyle(iframeFrame) : null;
  const size = (cs) => ({
    w: cs ? Math.round(cs.width.replace("px", "")) : -1,
    h: cs ? Math.round(cs.height.replace("px", "")) : -1,
  });
  const iSize = size(iframeCSS);
  const fSize = size(frameCSS);
  return {
    locCount: document.querySelectorAll('[data-section="location"]').length,
    label: text("[data-section=location] .ev-kicker").replace(/\s+/g, " "),
    heading: text("[data-section=location] .location-title").replace(/\s+/g, " "),
    place: text("[data-section=location] .location-place").replace(/\s+/g, " "),
    address: text("[data-section=location] .location-address").replace(/\s+/g, " "),
    wholePage: document.body.textContent,
    locInsideEvents: !!(locEl && eventsEl && eventsEl.contains(locEl)),
    locInsideBooking: !!(locEl && bookingEl && bookingEl.contains(locEl)),
    locIsLastSection: secs.length > 0 && secs[secs.length - 1] === locEl,
    tops: { booking: top(bookingEl), location: top(locEl), footer: top(footerEl) },
    mapCount: document.querySelectorAll('[data-section="location"] iframe').length,
    mapSrc: iframe ? iframe.getAttribute("src") : "",
    mapW: iSize.w,
    mapH: iSize.h,
    frameW: fSize.w,
    frameH: fSize.h,
    directionsHref: directions ? directions.getAttribute("href") : "",
    directionsTarget: directions ? directions.getAttribute("target") : "",
    directionsText: directions ? directions.textContent.trim() : "",
  };
});
check("exactly one location section", location.locCount === 1, `count=${location.locCount}`);
check("location label is 'Where We Are'", location.label === "Where We Are", location.label);
check("location heading is 'Sarathi Cultural Association'",
  location.heading === "Sarathi Cultural Association", location.heading);
check("location place lines are the SCA ground text",
  /BBMP Park Ground/.test(location.place) &&
  /5th Block, Koramangala/.test(location.place) &&
  /Bengaluru/.test(location.place),
  location.place);
check("location address is the full postal address",
  /No 23, KHB Colony/.test(location.address) &&
  /Koramangala, Bengaluru/.test(location.address) &&
  /Karnataka 560095/.test(location.address),
  location.address);
check("legacy 'Where We Gather' text is fully gone", !location.wholePage.includes("Where We Gather"));
check("location is OUTSIDE the Events section", !location.locInsideEvents);
check("location is OUTSIDE the Booking section", !location.locInsideBooking);
check("location is the LAST [data-section] block", location.locIsLastSection);
check("document order booking < location < footer",
  location.tops.booking > 0 && location.tops.location > location.tops.booking && location.tops.footer > location.tops.location,
  JSON.stringify(location.tops));
check("exactly one Google Maps embed in location",
  location.mapCount === 1 && /google\.com\/maps\/embed/.test(location.mapSrc), `count=${location.mapCount}`);
check("map iframe is responsive (fills its frame, not 600x450)",
  Math.abs(location.mapW - location.frameW) <= 2 &&
  Math.abs(location.mapH - location.frameH) <= 2 &&
  location.mapW > 500,
  `iframe=${location.mapW}x${location.mapH} frame=${location.frameW}x${location.frameH}`);
check("GET DIRECTIONS button links to the maps link in a new tab",
  location.directionsHref === "https://maps.app.goo.gl/RiskhyCjaqx3Grd29" &&
  location.directionsTarget === "_blank" &&
  location.directionsText === "Get Directions",
  `${location.directionsText} → ${location.directionsHref}`);

console.log("\n== 1c. Booking offers four booking options (Dandiya added) ==\n");
const bookingOpts = await page.evaluate(() => {
  const bookingEl = document.getElementById("booking");
  const text = bookingEl ? bookingEl.textContent : "";
  return {
    dandiya: !!document.querySelector(".bk-dandiya-feature"),
    name: document.querySelector(".bk-dandiya-feature .bk-dandiya-title")?.textContent.trim() ?? "",
    date: (document.querySelector(".bk-dandiya-feature .bk-dandiya-kicker")?.textContent.trim() ?? "").toUpperCase(),
    cta: document.querySelector(".bk-dandiya-feature .bk-dandiya-btn")?.textContent.trim() ?? "",
    hasPrasad: text.includes("Prasad Booking"),
    hasMembership: text.includes("Festival / Event Access Plans"),
    hasStall: text.includes("Stall Application"),
  };
});
check("Dandiya Night is the fourth booking option", bookingOpts.dandiya === true);
check("dandiya block title is 'Dandiya Night'", bookingOpts.name === "Dandiya Night", bookingOpts.name);
check("dandiya card shows '18 OCTOBER 2026'", bookingOpts.date === "18 OCTOBER 2026", bookingOpts.date);
check("dandiya block shows BOOK DANDIYA TICKETS CTA", bookingOpts.cta === "Book Dandiya Tickets", bookingOpts.cta);
check("dandiya block no longer shows COMING SOON", bookingOpts.cta !== "COMING SOON");
check("existing three booking options untouched",
  bookingOpts.hasPrasad && bookingOpts.hasMembership && bookingOpts.hasStall,
  `prasad=${bookingOpts.hasPrasad} membership=${bookingOpts.hasMembership} stall=${bookingOpts.hasStall}`);

console.log("\n== 1d. Booking quick access bar ==\n");
const quickItems = await page.evaluate(() =>
  Array.from(document.querySelectorAll(".bk-quick-item")).map((e) => e.textContent.trim()),
);
check("quick access bar shows all 4 options in order",
  JSON.stringify(quickItems) ===
    JSON.stringify(["Prasad Booking", "Stall Application", "Membership", "Dandiya Night"]),
  quickItems.join(" | "));
check("quick access bar is inside the Booking section",
  await page.evaluate(() => !!document.querySelector("#booking .bk-quick")));

async function quickTrial(label, anchorId, tol = 120) {
  const clicked = await page.evaluate((lbl) => {
    const el = Array.from(document.querySelectorAll(".bk-quick-item")).find((e) =>
      e.textContent.trim() === lbl,
    );
    if (!el) return false;
    el.click();
    return true;
  }, label);
  if (!clicked) throw new Error(`quick item "${label}" not found`);
  const hashBefore = (await state()).hash;
  const targetTop = await sectionTop(anchorId);
  let s, ok = false;
  for (let i = 0; i < 60; i++) {
    await sleep(90);
    s = await state();
    if (s.y >= targetTop - tol && s.y <= targetTop + tol) { ok = true; break; }
  }
  await sleep(500); /* let Lenis finish; avoid measuring mid-flight */
  check(`quick '${label}' scrolls to #${anchorId} (no route change, fixed header clear)`,
    ok && s.path === "/", `y=${s.y}/${targetTop}`);
  const notHidden = await page.evaluate((id) => {
    const el = document.getElementById(id);
    return el ? el.getBoundingClientRect().top >= 0 : false;
  }, anchorId);
  check(`target #${anchorId} is visible below the top edge`, notHidden);
  check("quick access click leaves the URL hash untouched", s.hash === hashBefore,
    `${s.path}${s.hash} vs ${hashBefore}`);
}

await clickDock("Booking");
await sleep(1800);

// all four buttons share the same neutral default visual state (no active/feature)
const btnVisual = await page.evaluate(() => {
  const btns = Array.from(document.querySelectorAll(".bk-quick-item"));
  const style = (b) => {
    const cs = getComputedStyle(b);
    return [
      b.className,
      cs.borderColor,
      cs.backgroundColor,
      cs.color,
      cs.boxShadow,
    ].join("|");
  };
  const first = style(btns[0]);
  return {
    identical: btns.every((b) => style(b) === first),
    anySpecial: btns.some((b) => b.className.includes("--active") || b.className.includes("--featured")),
    firstClass: btns[0].className,
  };
});
check("quick access buttons have no active/featured class",
  btnVisual.anySpecial === false, btnVisual.firstClass);
check("all 4 quick access buttons share the identical default style",
  btnVisual.identical === true);
await quickTrial("Prasad Booking", "bk-prasad");
await quickTrial("Stall Application", "bk-stall");
await quickTrial("Membership", "bk-membership");
await quickTrial("Dandiya Night", "bk-dandiya");

// the quick row scrolls horizontally only, never inside a nested vertical scroller
{
  const row = await page.evaluate(() => {
    const el = document.querySelector(".bk-quick-scroll");
    const wrap = document.querySelector(".bk-quick");
    const cs = getComputedStyle(el);
    const items = Array.from(el.children);
    const fits = items.every((i) => i.getBoundingClientRect().right <= el.getBoundingClientRect().right + 1);
    const elRect = el.getBoundingClientRect();
    const wrapRect = wrap.getBoundingClientRect();
    return {
      ox: cs.overflowX,
      oy: cs.overflowY,
      sbWidth: cs.scrollbarWidth,
      fits,
      rowW: Math.round(elRect.width),
      wrapW: Math.round(wrapRect.width),
      contentW: el.scrollWidth,
      centered: Math.abs((elRect.left + elRect.width / 2) - (wrapRect.left + wrapRect.width / 2)) <= 2,
      compact: elRect.width < wrapRect.width - 1,
    };
  });
  check("quick row is overflow-x only (no nested vertical scrollbar)",
    row.ox === "auto" && row.oy === "hidden", `x=${row.ox} y=${row.oy}`);
  check("quick row shrink-wraps its items (no full-width empty panel)",
    row.compact, `rowW=${row.rowW} wrapW=${row.wrapW}`);
  check("quick row is centered horizontally within the Booking content",
    row.centered, `centerOffset=${row.centered}`);
  check("desktop shows all 4 quick items in one row (no inner horizontal scroll)",
    row.fits, `rowW=${row.rowW} contentW=${row.contentW}`);
  check("quick row hides its scrollbar", row.sbWidth === "none");
}

await driveToTop();
await sleep(200);

console.log("\n== 1e. Dandiya ticket modal (4-step flow) ==\n");
// 1. Click the CTA to open the modal
const ctaBtn = await page.evaluate(() => {
  const btn = document.querySelector(".bk-dandiya-btn");
  if (!btn) return false;
  btn.click();
  return true;
});
await sleep(600);
const modalOpen = await page.evaluate(() => !!document.querySelector(".bk-modal"));
check("clicking Book Dandiya Tickets opens the modal", ctaBtn === true && modalOpen);
// Step 1 — tickets
const step1Info = await page.evaluate(() => {
  const label = document.querySelector(".bk-d-hero-label")?.textContent.trim() ?? "";
  const date = document.querySelector(".bk-d-hero-date")?.textContent.trim() ?? "";
  const qtyInput = document.querySelector(".bk-qty-input");
  const totalText = document.querySelector(".bk-d-total-row strong")?.textContent.trim() ?? "";
  return { label, date, qtyVal: qtyInput ? Number(qtyInput.value) : null, totalText };
});
check("step 1 hero shows event name", step1Info.label === "Dandiya Night", step1Info.label);
check("step 1 hero shows event date", step1Info.date === "18 October 2026", step1Info.date);
check("step 1 qty starts at 1", step1Info.qtyVal === 1, `val=${step1Info.qtyVal}`);
check("step 1 total is 'To be announced' (no price configured)", step1Info.totalText === "To be announced", step1Info.totalText);
// increment qty
await page.evaluate(() => {
  const inc = document.querySelectorAll(".bk-stepper button")[1];
  inc?.click();
});
await sleep(200);
const qtyAfterInc = await page.evaluate(() => {
  const qtyInput = document.querySelector(".bk-qty-input");
  return qtyInput ? Number(qtyInput.value) : null;
});
check("qty incremented to 2", qtyAfterInc === 2, `val=${qtyAfterInc}`);
// Click Continue → step 2
await page.evaluate(() => {
  const btns = Array.from(document.querySelectorAll(".bk-d-panel .sc-cta"));
  btns.find((b) => b.textContent.includes("Continue"))?.click();
});
await sleep(400);
const step2Visible = await page.evaluate(() => {
  return !!document.querySelector(".bk-d-modal .bk-form-title");
});
check("step 2 (details form) appears after Continue", step2Visible);
// Submit empty → validation errors
await page.evaluate(() => {
  const btn = document.querySelector(".bk-d-modal .bk-submit[type='submit']");
  btn?.click();
});
await sleep(300);
const hasErrors = await page.evaluate(() => {
  return document.querySelectorAll(".bk-field--invalid").length > 0;
});
check("step 2 shows validation errors when submitted empty", hasErrors);
// Fill details
await page.evaluate(() => {
  const inputs = document.querySelectorAll(".bk-d-modal .bk-input");
  inputs[0].focus();
  // Name
  const nativeSet = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set;
  nativeSet.call(inputs[0], "Test User");
  inputs[0].dispatchEvent(new Event("input", { bubbles: true }));
  inputs[0].dispatchEvent(new Event("change", { bubbles: true }));
  nativeSet.call(inputs[1], "9876543210");
  inputs[1].dispatchEvent(new Event("input", { bubbles: true }));
  inputs[1].dispatchEvent(new Event("change", { bubbles: true }));
  nativeSet.call(inputs[2], "test@example.com");
  inputs[2].dispatchEvent(new Event("input", { bubbles: true }));
  inputs[2].dispatchEvent(new Event("change", { bubbles: true }));
});
await sleep(200);
// Click Review Booking → step 3
await page.evaluate(() => {
  const btn = document.querySelector(".bk-d-modal .sc-cta[type='submit']");
  btn?.click();
});
await sleep(400);
const step3Info = await page.evaluate(() => {
  const rows = document.querySelectorAll(".bk-d-summary-row");
  const nameEl = document.querySelectorAll(".bk-d-summary-details div");
  return {
    event: rows[0]?.querySelector("strong")?.textContent.trim() ?? "",
    date: rows[1]?.querySelector("strong")?.textContent.trim() ?? "",
    tickets: rows[2]?.querySelector("strong")?.textContent.trim() ?? "",
    name: nameEl[0]?.querySelector("strong")?.textContent.trim() ?? "",
    mobile: nameEl[1]?.querySelector("strong")?.textContent.trim() ?? "",
    email: nameEl[2]?.querySelector("strong")?.textContent.trim() ?? "",
  };
});
check("step 3 summary shows event name", step3Info.event === "Dandiya Night", step3Info.event);
check("step 3 summary shows date", step3Info.date === "18 October 2026", step3Info.date);
check("step 3 summary shows tickets = 2", step3Info.tickets === "2", step3Info.tickets);
check("step 3 summary shows entered name", step3Info.name === "Test User", step3Info.name);
check("step 3 summary shows entered mobile", step3Info.mobile === "9876543210", step3Info.mobile);
check("step 3 summary shows entered email", step3Info.email === "test@example.com", step3Info.email);
// Click Confirm Booking → step 4
await page.evaluate(() => {
  const btns = Array.from(document.querySelectorAll(".bk-d-panel .sc-cta"));
  btns.find((b) => b.textContent.includes("Confirm Booking"))?.click();
});
await sleep(400);
const step4Info = await page.evaluate(() => {
  const pending = document.querySelector(".bk-d-pending p")?.textContent.trim() ?? "";
  const doneBtn = Array.from(document.querySelectorAll(".bk-d-panel .sc-cta")).find(
    (b) => b.textContent.includes("Done"),
  );
  return { pending, hasDone: !!doneBtn };
});
check("step 4 shows payment pending message", step4Info.pending === "Online payment opens once the official link is live.", step4Info.pending);
check("step 4 has Done button", step4Info.hasDone);
// Click Done → modal closes
await page.evaluate(() => {
  const btns = Array.from(document.querySelectorAll(".bk-d-panel .sc-cta"));
  btns.find((b) => b.textContent.includes("Done"))?.click();
});
await sleep(600);
const modalClosed = await page.evaluate(() => !document.querySelector(".bk-modal"));
check("modal closes after Done", modalClosed);

await driveToTop();
await sleep(200);

console.log("\n== 2. continuous wheel: Home → About → Events → Booking → Location, no route change ==\n");
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
const locationTop = await sectionTop("location");

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
await dockTrial("Location", locationTop);
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
const reloadActive = await page.evaluate(() =>
  Array.from(document.querySelectorAll(".bk-quick-item")).map((e) => e.className),
);
check("refresh at #booking leaves all 4 quick buttons in the same neutral state",
  reloadActive.every((c) => c === "bk-quick-item"), reloadActive.join(","));
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
check("mobile dock = 4 items (Home/Events/Booking/Location)", mob.dockItems === 4, `items=${mob.dockItems}`);
check("About cinematic not mounted on mobile", mob.aboutSection < 4, `h=${mob.aboutSection}`);
{
  const mFinal = await driveToBottom(300);
  check("mobile wheels from top to the true bottom (location+footer reachable)",
    mFinal.y >= mFinal.max - 4, `y=${mFinal.y}/${mFinal.max}`);
  const mLoc = await page.evaluate(() => {
    const iframe = document.querySelector('[data-section="location"] iframe');
    const cs = iframe ? getComputedStyle(iframe) : null;
    return {
      location: !!document.querySelector(".location-section"),
      footer: !!document.querySelector(".bk-footer"),
      iframeW: cs ? Math.round(cs.width.replace("px", "")) : -1,
      iframeH: cs ? Math.round(cs.height.replace("px", "")) : -1,
    };
  });
  check("mobile renders the location section (map) + footer",
    mLoc.location && mLoc.footer && mLoc.iframeW > 300,
    `w=${mLoc.iframeW} h=${mLoc.iframeH}`);
  await clickDock("Booking");
  await sleep(1500);
  const afterDock = await state();
  check("mobile dock Booking scrolls into the booking section", afterDock.y > 2000, `y=${afterDock.y}`);
  const mQuick = await page.evaluate(() => {
    const el = document.querySelector(".bk-quick-scroll");
    const cs = getComputedStyle(el);
    return {
      ox: cs.overflowX,
      oy: cs.overflowY,
      scrollable: el.scrollWidth > el.clientWidth,
      sbWidth: cs.scrollbarWidth,
    };
  });
  check("quick row is horizontally scrollable on mobile (only the row)",
    mQuick.ox === "auto" && mQuick.scrollable,
    `x=${mQuick.ox} scrollW=${mQuick.scrollable || "fits"}`);
  check("quick row hides its scrollbar on mobile", mQuick.sbWidth === "none");
  check("quick row introduces no vertical scrolling on mobile", mQuick.oy === "hidden", `y=${mQuick.oy}`);
  const mQuickTarget = await page.evaluate(() => {
    const el = Array.from(document.querySelectorAll(".bk-quick-item")).find((e) =>
      e.textContent.trim() === "Dandiya Night",
    );
    if (!el) return false;
    el.click();
    return true;
  });
  await sleep(1500);
  const mQuickScroll = await state();
  const mDandiyaTop = await sectionTop("bk-dandiya");
  check("mobile quick 'Dandiya Night' scrolls to the dandiya feature",
    mQuickTarget && mQuickScroll.y >= mDandiyaTop - 200 && mQuickScroll.y <= mDandiyaTop + 200,
    `y=${mQuickScroll.y}/${mDandiyaTop}`);
  const mLocTop = await sectionTop("location");
  await clickDock("Location");
  await sleep(1500);
  const afterLoc = await state();
  check("mobile dock Location scrolls to the location section",
    afterLoc.y >= mLocTop - 250, `y=${afterLoc.y} (location top=${mLocTop})`);
  check("mobile dock Location becomes active", afterLoc.active === "Location", `active=${afterLoc.active}`);
  const mFinal2 = await driveToBottom(300);
  check("mobile wheels on past location to the final footer end",
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