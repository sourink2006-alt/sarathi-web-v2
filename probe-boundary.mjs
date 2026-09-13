import puppeteer from "puppeteer";

const browser = await puppeteer.launch({
  executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  headless: "new",
  args: ["--no-sandbox", "--disable-dev-shm-usage", "--force-color-profile=srgb"],
});
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
await page.goto("http://localhost:3000/", { waitUntil: "networkidle0" });
await new Promise((r) => setTimeout(r, 2500));

async function scan(yTarget, label) {
  await page.evaluate((y) => window.scrollTo(0, y), yTarget);
  await new Promise((r) => setTimeout(r, 600));
  const out = await page.evaluate(() => {
    const vh = innerHeight;
    const rows = [];
    for (const fy of [150, 450, 750]) {
      const pts = [];
      for (const fx of [180, 720, 1260]) {
        const els = document.elementsFromPoint(fx, fy).slice(0, 6).map((e) => ({
          tag: e.tagName,
          cls: String(e.className).slice(0, 40),
          pos: getComputedStyle(e).position,
          z: getComputedStyle(e).zIndex,
          filter: getComputedStyle(e).filter !== "none" ? getComputedStyle(e).filter : "",
          back: getComputedStyle(e).backdropFilter,
          bg: getComputedStyle(e).backgroundColor,
          blend: getComputedStyle(e).mixBlendMode !== "normal" ? getComputedStyle(e).mixBlendMode : "",
        }));
        pts.push({ fx, fy, els });
      }
      rows.push(pts);
    }
    return {
      y: window.scrollY | 0,
      docH: document.documentElement.scrollHeight,
      rows,
      fixedAbout: (() => {
        const s = document.querySelector(".ab");
        return s ? { pos: getComputedStyle(s).position, top: s.getBoundingClientRect().top } : null;
      })(),
      fixedOverlays: Array.from(document.querySelectorAll("*")).filter((e) => {
        const cs = getComputedStyle(e);
        return cs.position === "fixed" && e.getBoundingClientRect().height > 100 && cs.opacity !== "0";
      }).slice(0, 12).map((e) => ({
        tag: e.tagName,
        cls: String(e.className).slice(0, 50),
        z: getComputedStyle(e).zIndex,
        bg: getComputedStyle(e).backgroundColor,
        back: getComputedStyle(e).backdropFilter,
        filter: getComputedStyle(e).filter,
      })),
    };
  });
  console.log(`\n===== ${label} (scrollY=${out.y}/${out.docH}) =====`);
  for (const row of out.rows)
    for (const pt of row)
      console.log(
        `${pt.fy}y ${pt.fx}x: ` +
          pt.els.map((e) => `${e.tag}.${e.cls} [${e.pos} z${e.z}${e.filter ? " filt=" + e.filter : ""}${e.back !== "none" ? " back=" + e.back : ""}${e.blend ? " blend=" + e.blend : ""}]`).join(" | "),
      );
  if (out.fixedAbout) console.log(".ab fixed:", JSON.stringify(out.fixedAbout));
  console.log("fixed overlays:", JSON.stringify(out.fixedOverlays));
}

await scan(0, "TOP / HOME");
await scan(1550, "BOUNDARY EMPTY REGION (inside 200vh home)");
await scan(1850, "ABOUT PIN START (prog=0, entry pose)");
await scan(3000, "ABOUT PIN (prog~0.2)");
await browser.close();