/*
 * Events route content — single source of truth for the rebuilt Events page.
 *
 * Page order: HERO (Events · Durga Puja 2026) → EVENT SCHEDULE (Cultural +
 * Religious) → VENUE (Where We Gather).
 *
 * No content is invented. Every value below comes from the supplied 2026
 * programme: the SCA festival poster (performers, dance festival, amenities),
 * the typed Puja schedule (six-day ritual times) and the requested schedule
 * breakdown (Cultural 15–21 Oct, Religious 16–21 Oct; 15 Oct is cultural only).
 */

export const VENUE = {
  association: "Sarathi Cultural Association",
  ground: "BBMP Ground",
  block: "5th Block",
  area: "Koramangala",
  city: "Bengaluru",
} as const;

export const HERO = {
  kicker: "Sarathi Cultural Association",
  title: "Events",
  sub: "Durga Puja 2026",
  dates: "16 — 21 October 2026",
  tags: ["Puja", "Culture", "Music", "Community"],
  location: "Koramangala, Bengaluru",
  bn: "দুর্গা পূজা",
} as const;

/* ------------------------------------------------------------------ */

export type DetailBlock = {
  heading?: string;
  lines: string[];
};

export type EventItem = {
  key: string;
  category: "cultural" | "religious";
  categoryLabel: "Cultural Event" | "Religious Event";
  date: string; // full single-line date label for the card
  weekday?: string;
  title: string;
  summary: string; // one short line on the card
  posters: { alt: string }; // empty 4:5 poster placeholder — real posters come later
  details: DetailBlock[];
};

/* ---- CULTURAL EVENTS — 15 → 21 October 2026 ---- */

export const CULTURAL_EVENTS: EventItem[] = [
  {
    key: "food-festival",
    category: "cultural",
    categoryLabel: "Cultural Event",
    date: "15 October 2026",
    title: "Food Festival",
    summary: "An evening of food before the Puja begins",
    posters: { alt: "Food Festival poster" },
    details: [
      { heading: "Time", lines: ["7:00 PM – 9:00 PM"] },
      {
        heading: "About",
        lines: [
          "This is a cultural event — it is not one of the main religious Puja days.",
        ],
      },
    ],
  },
  {
    key: "inauguration",
    category: "cultural",
    categoryLabel: "Cultural Event",
    date: "16 October 2026",
    title: "Inauguration",
    summary: "The festival is formally inaugurated",
    posters: { alt: "Inauguration poster" },
    details: [
      { heading: "Inauguration by", lines: ["Sri Ramalinga Reddy"] },
      { heading: "Performance by", lines: ["M Tirtho"] },
      {
        heading: "Songs",
        lines: [
          "Do Pankh De Do",
          "Guitar Er Gaan",
          "Thehro Zara Thehro",
          "Jiboner Ei Saigohorete",
        ],
      },
    ],
  },
  {
    key: "devi-arpana",
    category: "cultural",
    categoryLabel: "Cultural Event",
    date: "17 October 2026",
    title: "“Devi Arpana”",
    summary: "A prestigious classical dance festival",
    posters: { alt: "Devi Arpana — classical dance festival poster" },
    details: [
      {
        lines: [
          "100+ trained dancers from over 10 dance academies",
          "Bharatanatyam · Kathak · Odissi · Kuchipudi & more",
        ],
      },
      {
        heading: "Also",
        lines: ["Leading Live Band — Folk · Retro · Bollywood · Kannada · Hip Hop & more"],
      },
    ],
  },
  {
    key: "dandiya",
    category: "cultural",
    categoryLabel: "Cultural Event",
    date: "18 October 2026",
    title: "Dandiya with Dhol",
    summary: "An evening of rhythm and colour",
    posters: { alt: "Dandiya with Dhol poster" },
    details: [{ lines: ["An evening of rhythm and colour"] }],
  },
  {
    key: "asmita-kar",
    category: "cultural",
    categoryLabel: "Cultural Event",
    date: "19 October 2026",
    title: "Live Concert by Asmita Kar",
    summary: "National award-winning Bengali & Hindustani classical singer",
    posters: { alt: "Asmita Kar — live concert poster" },
    details: [
      {
        lines: [
          "National award-winning Bengali & Hindustani classical singer",
        ],
      },
    ],
  },
  {
    key: "rupankar-bagchi",
    category: "cultural",
    categoryLabel: "Cultural Event",
    date: "20 October 2026",
    title: "Live Performance by Rupankar Bagchi",
    summary: "A live performance on the festival stage",
    posters: { alt: "Rupankar Bagchi — live performance poster" },
    details: [{ lines: ["Live performance by Rupankar Bagchi"] }],
  },
  {
    key: "visarjan-day",
    category: "cultural",
    categoryLabel: "Cultural Event",
    date: "21 October 2026",
    title: "Till Afternoon — Visarjan Day",
    summary: "The day of immersion, till afternoon",
    posters: { alt: "Visarjan Day poster" },
    details: [{ lines: ["Till afternoon — the day of immersion"] }],
  },
];

/* ---- Festival-wide cultural highlight (shown within Cultural Events) ---- */

export const CULTURAL_HIGHLIGHT = {
  text: "Garba & Dandiya Nights Every Evening",
  range: "17 – 21 October 2026",
  tagline: "Vibrant, Colourful & Unforgettable",
} as const;

export const AMENITIES = [
  "Live Stage Performances",
  "Food Courts",
  "Shopping Stalls",
  "Fun & Festivities",
  "Safe & Secure Environment",
  "Kids Zone",
] as const;

/* ---- RELIGIOUS EVENTS — 16 → 21 October 2026 ---- */

export const RELIGIOUS_EVENTS: EventItem[] = [
  {
    key: "shashti",
    category: "religious",
    categoryLabel: "Religious Event",
    date: "Friday, October 16, 2026",
    title: "Day 1 — Shashti",
    summary: "Bodhon, Amantran & Adhibas",
    posters: { alt: "Shashti — Day 1 poster" },
    details: [
      {
        lines: [
          "Bodhon, Amantran & Adhibas",
          "Evening: 5:57 PM – 6:30 PM",
        ],
      },
    ],
  },
  {
    key: "saptami",
    category: "religious",
    categoryLabel: "Religious Event",
    date: "Saturday, October 17, 2026",
    title: "Day 2 — Saptami",
    summary: "Nabapatrika Prabesh, Sthapan & Saptami Puja",
    posters: { alt: "Saptami — Day 2 poster" },
    details: [
      {
        heading: "Puja",
        lines: [
          "Nabapatrika Prabesh, Sthapan & Saptami Puja",
          "Timing: 7:41 AM – 10:03 AM",
          "Pushpanjali: 10:05 AM",
        ],
      },
      { heading: "Evening", lines: ["Patachitra Live Demo"] },
      {
        heading: "Bengali Almanac",
        lines: [
          "দেবীর ঘোটকে আগমন — ফল: ছত্রভঙ্গ",
          "Arrival on Horse — Instability",
        ],
      },
    ],
  },
  {
    key: "ashtami",
    category: "religious",
    categoryLabel: "Religious Event",
    date: "Sunday, October 18, 2026",
    title: "Day 3 — Ashtami",
    summary: "Maha Ashtami Puja",
    posters: { alt: "Maha Ashtami — Day 3 poster" },
    details: [
      {
        heading: "Maha Ashtami Puja",
        lines: ["Timing: 6:14 AM – 10:03 AM", "Pushpanjali: 10:05 AM"],
      },
      { heading: "Rituals", lines: ["Kumari Puja"] },
      { heading: "Special Bhog", lines: ["2:00 PM – 4:00 PM"] },
    ],
  },
  {
    key: "sandhi",
    category: "religious",
    categoryLabel: "Religious Event",
    date: "Monday, October 19, 2026",
    title: "Day 4 — Ashtami / Sandhi Puja",
    summary: "Sandhi Puja Begins: 7:26 AM",
    posters: { alt: "Sandhi Puja — Day 4 poster" },
    details: [
      {
        heading: "Sandhi Puja",
        lines: [
          "Sandhi Puja Begins: 7:26 AM",
          "Bali Daan (Sacred Offering): 7:50 AM",
          "Sandhi Puja Ends: 8:14 AM",
          "Pushpanjali: 8:15 AM",
        ],
      },
      { heading: "Evening", lines: ["Cultural Flea & Handicraft Expo"] },
      {
        heading: "Additional Maha Ashtami Puja",
        lines: ["8:14 AM – 10:02 AM", "Pushpanjali: 10:05 AM"],
      },
      {
        heading: "Highlight",
        lines: [
          "108 diyas are lit during Sandhi Puja — the most auspicious moment.",
        ],
      },
    ],
  },
  {
    key: "navami",
    category: "religious",
    categoryLabel: "Religious Event",
    date: "Tuesday, October 20, 2026",
    title: "Day 5 — Navami",
    summary: "Maha Navami Puja",
    posters: { alt: "Maha Navami — Day 5 poster" },
    details: [
      {
        heading: "Maha Navami Puja",
        lines: ["Timing: 9:06 AM – 9:31 AM", "Pushpanjali: 9:35 AM"],
      },
      { heading: "Rituals", lines: ["Kumari Puja"] },
      { heading: "Special Bhog", lines: ["2:00 PM – 4:00 PM"] },
      { heading: "Evening", lines: ["Dhunuchi Naach & Dandiya Night"] },
    ],
  },
  {
    key: "dashami",
    category: "religious",
    categoryLabel: "Religious Event",
    date: "Wednesday, October 21, 2026",
    title: "Day 6 — Dashami",
    summary: "Dashami Puja & Visarjan",
    posters: { alt: "Dashami — Day 6 poster" },
    details: [
      {
        heading: "Dashami Puja & Visarjan",
        lines: ["Timing: 6:14 AM – 9:06 AM", "Pushpanjali: 9:05 AM"],
      },
      {
        heading: "Celebrations",
        lines: [
          "Sindur Khela",
          "Bisarjan (Immersion)",
          "Community Greetings, Sweets Distribution, Bijoya Sammilani",
        ],
      },
      {
        heading: "Bengali Almanac",
        lines: [
          "দেবীর নৌকায় গমন — ফল: শস্যবৃদ্ধি ও জলবৃদ্ধি",
          "Departure by Boat — Prosperity in Crops & Water",
        ],
      },
    ],
  },
];

/* ---- Important rituals (shared religious detail block) ---- */

export type Ritual = {
  key: string;
  title: string;
  body: string;
  meta?: string;
  emphasis?: boolean;
};

export const RITUALS: Ritual[] = [
  {
    key: "sandhi",
    title: "Sandhi Puja",
    body: "Performed at the junction of Ashtami and Navami. 108 diyas are lit, marking when Maa Durga transformed into Chamunda.",
    meta: "7:26 AM – 8:14 AM · October 19, 2026",
    emphasis: true,
  },
  {
    key: "kumari",
    title: "Kumari Puja",
    body: "A young girl is worshipped as the living form of Maa Durga, symbolizing divine feminine power.",
  },
  {
    key: "dhunuchi",
    title: "Dhunuchi Naach",
    body: "Traditional dance with earthen pots of burning coconut husk to the rhythmic beats of dhak.",
  },
  {
    key: "sindur",
    title: "Sindur Khela",
    body: "Married women apply sindur to Maa Durga and each other, celebrating marital bliss.",
  },
];
