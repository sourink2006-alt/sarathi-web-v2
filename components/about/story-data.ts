/*
 * The Sarathi Archive — story configuration.
 * All narrative content + spatial layout lives here; the animation engine
 * (about-experience.tsx) consumes it. Change the story without touching motion code.
 *
 * Positions are percentages of the archive surface (0-100 on both axes).
 * Keep x within 28-72 and y within 26-74 so the camera never reveals the void
 * beyond the board's edges.
 */

export type StoryChapter = {
  id: string;
  index: string;
  eyebrow: string;
  titleEn: string;
  titleBn: string;
  body: string;
  /** position of this chapter's node on the archive surface, in % */
  pos: { x: number; y: number };
  /**
   * 3D spatial camera targets for this chapter.
   * rotX/rotY/rotZ are small documentary tilts (degrees) — the camera leans
   * as it travels, like a handheld pass over paper. Chapter 01 must match
   * the entry settle pose and 07 must be flat so the exit blackout
   * recentres without a jump.
   */
  cam: {
    scale: number;
    rotX: number;
    rotY: number;
    rotZ: number;
  };
};

export const CHAPTERS: StoryChapter[] = [
  {
    id: "kolkata",
    index: "01",
    eyebrow: "Chapter 01 · Kolkata",
    titleEn: "Where Every Story Begins",
    titleBn: "কলকাতা",
    body: "Every journey begins at home — in the lanes of Kolkata, where the Ganges carries the evening arati, where adda stretches past midnight, and culture is not an event. It is the air you breathe.",
    pos: { x: 28, y: 28 },
    cam: { scale: 1.0, rotX: 8, rotY: -3, rotZ: 0 },
  },
  {
    id: "memory",
    index: "02",
    eyebrow: "Chapter 02 · Memory",
    titleEn: "What We Carry",
    titleBn: "স্মৃতি",
    body: "You can leave Kolkata. Kolkata does not leave you. It travels folded inside a suitcase — in language and maacher jhol, in Rabindranath on long rides, in shiuli on the morning air, in photographs that refuse to fade.",
    pos: { x: 48, y: 42 },
    cam: { scale: 1.08, rotX: 11, rotY: 2, rotZ: 1.5 },
  },
  {
    id: "journey",
    index: "03",
    eyebrow: "Chapter 03 · Journey",
    titleEn: "The Moving Away",
    titleBn: "যাত্রা",
    body: "Then life calls. Trains, flights, one-way tickets. A new city of lakes and traffic and opportunity — carrying everything we are, looking for a place to set it all down.",
    pos: { x: 68, y: 28 },
    cam: { scale: 1.02, rotX: 6, rotY: 5, rotZ: -1 },
  },
  {
    id: "bengaluru",
    index: "04",
    eyebrow: "Chapter 04 · Bengaluru",
    titleEn: "A Second City",
    titleBn: "বেঙ্গালুরু",
    body: "Bengaluru welcomed us with its gardens and its gentleness. Not a replacement for home — another address for the heart. Slowly, the Garden City began to sound like home too.",
    pos: { x: 74, y: 52 },
    cam: { scale: 1.06, rotX: 10, rotY: -4, rotZ: 1 },
  },
  {
    id: "community",
    index: "05",
    eyebrow: "Chapter 05 · Community",
    titleEn: "Finding Each Other",
    titleBn: "সমাজ",
    body: "In a city of millions, familiar accents find each other. Strangers became neighbours, neighbours became family — drawn together by the same longing, the same laughter, the same language.",
    pos: { x: 56, y: 70 },
    cam: { scale: 1.12, rotX: 12, rotY: 3, rotZ: -1.5 },
  },
  {
    id: "puja",
    index: "06",
    eyebrow: "Chapter 06 · Durga Puja",
    titleEn: "Five Days of Home",
    titleBn: "পূজা",
    body: "And once a year, autumn arrives. The dhak thunders, dhunuchi smoke curls into the sky, and the city glows crimson and gold. For five days we are not away from home. We are home.",
    pos: { x: 32, y: 72 },
    cam: { scale: 1.18, rotX: 7, rotY: -2, rotZ: 0.5 },
  },
  {
    id: "sca",
    index: "07",
    eyebrow: "Est. 2003 · Sarathi Cultural Association",
    titleEn: "Every Bengali Carries Two Homes",
    titleBn: "সারথি",
    body: "Sarathi — the charioteer, the one who guides. Since 2003 we have been the bridge between Kolkata and Bengaluru: a community, a celebration, a second home. You carry two homes. So do we.",
    pos: { x: 50, y: 50 },
    cam: { scale: 1.08, rotX: 0, rotY: 0, rotZ: 0 },
  },
];

export const CLOSING_LINE =
  "From Kolkata to Bengaluru — every Bengali carries two homes.";

/*
 * Catmull-Rom → cubic bezier through every chapter node.
 * Rendered in a 100×100 viewBox that matches surface % coordinates exactly,
 * with non-scaling strokes so line weight stays constant.
 */
export function journeyPathD(): string {
  const pts = CHAPTERS.map((c) => c.pos);
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(i - 1, 0)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(i + 2, pts.length - 1)];
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2.x} ${p2.y}`;
  }
  return d;
}
