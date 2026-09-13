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
await p.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
await new Promise((r) => setTimeout(r, 500));

const b64 = await p.screenshot({ encoding: "base64" });
const grid = await p.evaluate((dataUrl) => new Promise((resolve) => {
  const img = new Image();
  img.onload = () => {
    const c = document.createElement("canvas");
    c.width = img.naturalWidth; c.height = img.naturalHeight;
    const ctx = c.getContext("2d");
    ctx.drawImage(img, 0, 0);
    const rows = [];
    const rowsN = 12, colsN = 10;
    for (let ry = 0; ry < rowsN; ry++) {
      const y0 = Math.floor((c.height * ry) / rowsN);
      const y1 = Math.floor((c.height * (ry + 1)) / rowsN);
      const cells = [];
      for (let cx = 0; cx < colsN; cx++) {
        const x0 = Math.floor((c.width * cx) / colsN);
        const x1 = Math.floor((c.width * (cx + 1)) / colsN) - 1;
        let r = 0, g = 0, bl = 0, n = 0;
        for (let y = y0; y < y1; y += 3)
          for (let x = x0; x < x1; x += 3) {
            const d = ctx.getImageData(x, y, 1, 1).data;
            r += d[0]; g += d[1]; bl += d[2]; n++;
          }
        cells.push(`${Math.round(r / n)},${Math.round(g / n)},${Math.round(bl / n)}`);
      }
      rows.push(cells.join(" | "));
    }
    resolve(rows);
  };
  img.src = "data:image/png;base64," + dataUrl;
}), b64);

console.log("BOTTOM VIEWPORT rgb grid — rows top→bottom, ~10 columns:");
grid.forEach((row, i) => console.log(`  y${i}: ${row}`));
await b.close();