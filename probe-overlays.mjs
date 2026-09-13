import puppeteer from "puppeteer";

const b = await puppeteer.launch({
  executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  headless: "new",
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});
const p = await b.newPage();
await p.setViewport({ width: 1440, height: 900 });
await p.goto("http://localhost:3000/", { waitUntil: "networkidle0" });
await new Promise((r) => setTimeout(r, 2000));

const probe = (y) =>
  p.evaluate((y) => {
    window.scrollTo(0, y);
    return new Promise((resolve) =>
      setTimeout(() => {
        const max = document.documentElement.scrollHeight;
        const rows = [];
        const fyList = y === 0 ? [120, 450, 820] : [80, 430, 780];
        for (const fy of fyList) {
          const pts = [];
          for (const fx of [180, 720, 1260]) {
            const els = document.elementsFromPoint(fx, fy).map((e) => {
              const s = getComputedStyle(e);
              return `${e.tagName}.${String(e.className).slice(0, 34)}[${s.position} z${s.zIndex} bg=${s.backgroundColor} blend=${s.mixBlendMode !== "normal" ? s.mixBlendMode : "-"}]`;
            });
            pts.push({ fx, fy, els });
          }
          rows.push(pts);
        }
        const fixed = Array.from(document.querySelectorAll("*"))
          .filter((e) => {
            const s = getComputedStyle(e);
            const r = e.getBoundingClientRect();
            return s.position === "fixed" && r.height > 50;
          })
          .map((e) => {
            const s = getComputedStyle(e);
            const r = e.getBoundingClientRect();
            return {
              cls: String(e.className).slice(0, 40),
              z: s.zIndex,
              bg: s.backgroundColor,
              image: s.backgroundImage.slice(0, 60),
              top: Math.round(r.top),
              bottom: Math.round(r.bottom),
            };
          });
        const pseudos = {};
        for (const sel of ["body", "main", 'section[data-section="gather"]', ".ev-venue", ".bk-footer", "html"]) {
          const el = document.querySelector(sel);
          if (!el) continue;
          for (const kind of ["::before", "::after"]) {
            const cs = getComputedStyle(el, kind);
            if (cs.content !== "none") {
              pseudos[`${sel} ${kind}`] = {
                content: cs.content,
                bg: cs.backgroundColor,
                grad: cs.backgroundImage.slice(0, 70),
                pos: cs.position,
                z: cs.zIndex,
                op: cs.opacity,
              };
            }
          }
        }
        resolve({
          y: window.scrollY | 0,
          max,
          atBottom: y >= max - 900,
          rows,
          fixed,
          pseudos,
        });
      }, 500),
    );
  }, y);

const top = await probe(0);
console.log("\n===== TOP (scrollY=" + top.y + "/" + top.max + ") =====");
for (const r of top.rows) for (const pt of r) console.log(`  ${pt.fy}y ${pt.fx}x: ${pt.els.join(" | ")}`);
console.log("  fixed:", JSON.stringify(top.fixed));
console.log("  pseudos:", JSON.stringify(top.pseudos, null, 1));

const maxI = await p.evaluate(() => document.documentElement.scrollHeight - window.innerHeight);
const bot = await probe(maxI);
console.log("\n===== BOTTOM / END (scrollY=" + bot.y + "/" + bot.max + ") =====");
for (const r of bot.rows) for (const pt of r) console.log(`  ${pt.fy}y ${pt.fx}x: ${pt.els.join(" | ")}`);
console.log("  fixed:", JSON.stringify(bot.fixed));
console.log("  pseudos:", JSON.stringify(bot.pseudos, null, 1));

await b.close();