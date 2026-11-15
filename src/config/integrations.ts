/**
 * Client-safe integration configuration.
 *
 * Only NEXT_PUBLIC_* values are read here. The analytics IDs are build-time
 * defaults: values saved in the admin replace them at runtime
 * (see src/lib/runtime-config.ts). Server-only credentials
 * (lead webhook URL + secret) live in src/lib/leads and are never imported
 * into client components.
 */

const clean = (value: string | undefined) => {
  const v = value?.trim();
  return v ? v : null;
};

export const integrations = {
  video: {
    /** Direct MP4 / WebM URL or a path inside /public. */
    src: clean(process.env.NEXT_PUBLIC_VSL_VIDEO_URL),
    /** WebVTT captions file. */
    captions: clean(process.env.NEXT_PUBLIC_VSL_CAPTIONS_URL),
    captionsLang: "en",
    captionsLabel: "English",
  },

  booking: {
    url: clean(process.env.NEXT_PUBLIC_BOOKING_URL),
  },

  analytics: {
    gtmId: clean(process.env.NEXT_PUBLIC_GTM_ID),
    ga4Id: clean(process.env.NEXT_PUBLIC_GA4_ID),
    metaPixelId: clean(process.env.NEXT_PUBLIC_META_PIXEL_ID),
    googleAdsId: clean(process.env.NEXT_PUBLIC_GOOGLE_ADS_ID),
    googleAdsLabels: {
      optin_submit: clean(process.env.NEXT_PUBLIC_GOOGLE_ADS_LABEL_OPTIN),
      application_submit: clean(
        process.env.NEXT_PUBLIC_GOOGLE_ADS_LABEL_APPLICATION,
      ),
      strategy_call_confirmed: clean(
        process.env.NEXT_PUBLIC_GOOGLE_ADS_LABEL_CALL,
      ),
    } as Record<string, string | null>,
  },
} as const;

export const isCalendly = (url: string | null) =>
  Boolean(url && /^https:\/\/(www\.)?calendly\.com\//.test(url));
