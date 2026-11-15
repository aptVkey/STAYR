/**
 * Brand + company configuration.
 *
 * Anything marked `null` is a real-world detail that has not been provided
 * yet. The UI renders those as clearly labelled placeholders — it never
 * invents an address, registration number or social profile.
 */
export const site = {
  name: "STAYR",
  descriptor: "AI-Powered Advertising for Hospitality",
  tagline: "More Direct Bookings. Less Dependency.",
  description:
    "STAYR builds paid advertising systems for hotels and hospitality brands. Google Ads, Meta Ads and TikTok Ads — one integrated acquisition system focused on direct bookings.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  locale: "en",
  /** Locales the content layer is prepared for (see src/content). */
  plannedLocales: ["en", "pt", "es"] as const,
  copyrightYear: 2026,

  company: {
    legalName: null as string | null,
    registeredAddress: null as string | null,
    registrationNumber: null as string | null,
    vatNumber: null as string | null,
  },

  contact: {
    email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || null,
    linkedin: process.env.NEXT_PUBLIC_LINKEDIN_URL || null,
  },

  pricing: {
    currency: "EUR",
    annual: 25000,
    monthly: 2500,
    termMonths: 12,
  },
} as const;

export type Site = typeof site;
