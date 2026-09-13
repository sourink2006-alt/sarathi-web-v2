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

// full-page capture of current state
await page.screenshot({ path: "shot-home-full.png", fullPage: true });
// top viewport
await page.evaluate(() => window.scrollTo(0, 0));
await new Promise((r) => setTimeout(r, 400));
await page.screenshot({ path: "shot-home-top.png" });
// the boundary at 1550
await page.evaluate(() => window.scrollTo(0, 1550));
await new Promise((r) => setTimeout(r, 600));
await page.screenshot({ path: "shot-boundary.png" });
// about entry at 1850
await page.evaluate(() => window.scrollTo(0, 1850));
await new Promise((r) => setTimeout(r, 600));
await page.screenshot({ path: "shot-about-entry.png" });

console.log("saved");
await browser.close();