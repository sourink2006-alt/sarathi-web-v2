/*
 * Booking route content — single source of truth for the Booking page.
 * Four sections: Prasad Booking, Membership Plans, Stall Application,
 * Dandiya Night Tickets.
 * No content is invented. Every value comes from the supplied specification.
 */

/* ---- Prasad ---- */

export type PrasadItem = {
  key: string;
  name: string;
  price: number;
  description: string;
};

export const PRASAD_ITEMS: PrasadItem[] = [
  {
    key: "bhog-thali",
    name: "Bhog Thali (Vegetarian)",
    price: 251,
    description:
      "Traditional Durga Puja bhog — rice, dal, mixed vegetables, chutney, payesh, and papad.",
  },
  {
    key: "khichuri-bhog",
    name: "Khichuri Bhog",
    price: 151,
    description:
      "Classic Bengali moong dal khichuri with labra, begun bhaja, and tomato chutney.",
  },
  {
    key: "premium-bhog",
    name: "Premium Bhog Thali",
    price: 501,
    description:
      "Deluxe thali with luchi, cholar dal, paneer curry, kheer, sandesh, and mishti doi.",
  },
];

/* ---- Membership ---- */

export type MembershipPlan = {
  key: string;
  name: string;
  price: number;
  benefits: string[];
  detail: {
    forWho: string;
    duration: string;
    whatYouGet: string[];
    pujaAccess: string[];
    eventBenefits: string[];
    limitations: string[];
  };
};

export const MEMBERSHIP_PLANS: MembershipPlan[] = [
  {
    key: "student",
    name: "Student Membership",
    price: 700,
    benefits: ["Anjali, Bhog, only durgapuja access"],
    detail: {
      forWho: "Students",
      duration: "2026–27 / one festival year",
      whatYouGet: ["Anjali", "Bhog"],
      pujaAccess: ["Durga Puja access"],
      eventBenefits: [],
      limitations: ["Durga Puja access only"],
    },
  },
  {
    key: "student-premium",
    name: "Student Membership (Premium)",
    price: 1000,
    benefits: [
      "Anjali, Bhog, get access for two other pujas except durga puja",
      "Reserved Seating for Evening Events",
    ],
    detail: {
      forWho: "Students",
      duration: "2026–27 / one festival year",
      whatYouGet: ["Anjali", "Bhog"],
      pujaAccess: [
        "Durga Puja access",
        "Access to 2 other Pujas except Durga Puja",
      ],
      eventBenefits: ["Reserved seating for evening events"],
      limitations: [],
    },
  },
  {
    key: "working-single",
    name: "Working Professional (Single)",
    price: 1500,
    benefits: [
      "Anjali, Bhog Coupon, Reserved Seating for Evening Events",
      "only durgapuja access",
    ],
    detail: {
      forWho: "Working professionals (single)",
      duration: "2026–27 / one festival year",
      whatYouGet: ["Anjali", "Bhog Coupon"],
      pujaAccess: ["Durga Puja access"],
      eventBenefits: ["Reserved seating for evening events"],
      limitations: ["Durga Puja access only"],
    },
  },
  {
    key: "working-single-premium",
    name: "Working Professional (Single Premium)",
    price: 2000,
    benefits: [
      "Anjali, Bhog Coupon, Reserved Seating for Evening Events",
      "access for 3 other pujas except durga puja",
    ],
    detail: {
      forWho: "Working professionals (single)",
      duration: "2026–27 / one festival year",
      whatYouGet: ["Anjali", "Bhog Coupon"],
      pujaAccess: [
        "Durga Puja access",
        "Access to 3 other Pujas except Durga Puja",
      ],
      eventBenefits: ["Reserved seating for evening events"],
      limitations: [],
    },
  },
  {
    key: "couple",
    name: "Couple Membership",
    price: 3000,
    benefits: [
      "Anjali, Bhog Coupon, Reserved Seating for Evening Events",
      "only durgapuja access",
    ],
    detail: {
      forWho: "Couples",
      duration: "2026–27 / one festival year",
      whatYouGet: ["Anjali", "Bhog Coupon"],
      pujaAccess: ["Durga Puja access"],
      eventBenefits: ["Reserved seating for evening events"],
      limitations: ["Durga Puja access only"],
    },
  },
  {
    key: "couple-premium",
    name: "Couple Membership (Premium)",
    price: 4000,
    benefits: [
      "Anjali, Bhog Coupon, Reserved Seating for Evening Events",
      "Events access for 3 other pujas except durga puja",
    ],
    detail: {
      forWho: "Couples",
      duration: "2026–27 / one festival year",
      whatYouGet: ["Anjali", "Bhog Coupon"],
      pujaAccess: [
        "Durga Puja access",
        "Access to 3 other Pujas except Durga Puja",
      ],
      eventBenefits: ["Reserved seating for evening events"],
      limitations: [],
    },
  },
  {
    key: "family",
    name: "Family Membership (2+2)",
    price: 6000,
    benefits: ["Anjali, Bhog Coupon, only durgapuja access"],
    detail: {
      forWho: "Families (2 adults + 2 children)",
      duration: "2026–27 / one festival year",
      whatYouGet: ["Anjali", "Bhog Coupon"],
      pujaAccess: ["Durga Puja access"],
      eventBenefits: [],
      limitations: ["Durga Puja access only"],
    },
  },
  {
    key: "family-plan1",
    name: "Family Membership (2+2) Plan 1",
    price: 7500,
    benefits: [
      "Anjali, Bhog Coupon, Reserved Seating for Evening Events",
      "only durgapuja access",
    ],
    detail: {
      forWho: "Families (2 adults + 2 children)",
      duration: "2026–27 / one festival year",
      whatYouGet: ["Anjali", "Bhog Coupon"],
      pujaAccess: ["Durga Puja access"],
      eventBenefits: ["Reserved seating for evening events"],
      limitations: ["Durga Puja access only"],
    },
  },
  {
    key: "family-plan2",
    name: "Family Membership (2+2) Plan 2",
    price: 9000,
    benefits: [
      "Anjali, Bhog Coupon, Reserved Seating for Evening Events",
      "Events access for 3 other pujas except durga puja",
    ],
    detail: {
      forWho: "Families (2 adults + 2 children)",
      duration: "2026–27 / one festival year",
      whatYouGet: ["Anjali", "Bhog Coupon"],
      pujaAccess: [
        "Durga Puja access",
        "Access to 3 other Pujas except Durga Puja",
      ],
      eventBenefits: ["Reserved seating for evening events"],
      limitations: [],
    },
  },
];

/* ---- Membership application form ---- */

export const MEMBERSHIP_FORM = {
  introTitle: "SARATHI CULTURAL ASSOCIATION (SCA)",
  title: "Membership Request Form 2026–27",
  intro:
    "Welcome to Sarathi Cultural Association (SCA)! We are a Bengali cultural community based in Koramangala, Bengaluru, dedicated to preserving and celebrating Bengali traditions through Durga Puja, Kali Puja, Saraswati Puja, cultural programs, family events, and community service. Please complete this membership request form carefully. Submission of this form does not guarantee membership. Every application will be reviewed by the SCA Management Committee.",
  process: [
    "Submit your application.",
    "Your application will be reviewed by the Management Committee.",
    "Shortlisted applicants will be contacted.",
    "Membership fee payment details will be shared.",
    "After payment verification, membership will be activated.",
    "You will be added to official SCA communication groups.",
    "Membership must be renewed every year.",
  ],
  note:
    "Submitting this form does not guarantee membership. The decision of the Management Committee will be final.",
} as const;

export const GENDERS = ["Male", "Female", "Prefer not to say", "Other"] as const;
export const MEMBERSHIP_TYPES = ["General Member", "Executive Member"] as const;

/* ---- Stall ---- */

export const STALL_TYPES = [
  "Food & Beverages",
  "Handicrafts & Art",
  "Clothing & Textiles",
  "Jewellery & Accessories",
  "Books & Stationery",
  "Other",
] as const;

export const STALL_INFO = [
  {
    heading: "Location",
    text: "Koramangala, Bengaluru",
  },
  {
    heading: "Dates",
    text: "Oct 1 – Oct 4, 2026",
  },
  {
    heading: "No Fees",
    text: "Free to apply — pricing discussed after approval",
  },
] as const;

/* ---- Dandiya Night Tickets (fourth booking option) ---- */

export type DandiyaConfig = {
  eventName: string;
  date: string;
  tagline: string;
  ticketPrice: number | null; // set when official price announced
  currency: string;
  maxTicketsPerBooking: number;
  payment: {
    status: "pending" | "configured";
    method: string;
    url: string | null;
    instructions: string;
  };
};

export const DANDIYA_NIGHT: DandiyaConfig = {
  eventName: "Dandiya Night",
  date: "18 October 2026",
  tagline: "Tickets for SCA's Dandiya Night.",
  ticketPrice: null,
  currency: "₹",
  maxTicketsPerBooking: 6,
  payment: {
    status: "pending",
    method: "UPI",
    url: null,
    instructions: "Online payment opens once the official link is live.",
  },
};
