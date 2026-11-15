import { en, type Content } from "./en";

/**
 * Content registry.
 *
 * To add Portuguese or Spanish:
 *   1. Create pt.ts / es.ts exporting an object typed as `Content`.
 *   2. Register it below.
 *   3. Resolve the locale per request (e.g. an `app/[locale]` segment) and
 *      pass `getContent(locale)` to the page instead of the default export.
 */
export const locales = ["en", "pt", "es"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

const dictionaries: Partial<Record<Locale, Content>> = {
  en,
  // pt,
  // es,
};

export function getContent(locale: Locale = defaultLocale): Content {
  return dictionaries[locale] ?? en;
}

/** Default-locale content, used while the site is English-only. */
export const content = getContent();
export type { Content };
