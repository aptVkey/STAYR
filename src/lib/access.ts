/**
 * Case study access gate.
 *
 * IMPORTANT: this is a marketing gate, not authentication. After a
 * successful opt-in the server sets a cookie; `src/proxy.ts` checks for its
 * presence before serving /case-study and sends visitors without it back to
 * the opt-in. Anyone determined can bypass it, and the video URL itself is
 * public. Do not put confidential material behind this mechanism.
 */
export const ACCESS_COOKIE = "stayr_case_study";
export const ACCESS_COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

/** Client-side hint so returning leads skip the form. Not a security check. */
export const ACCESS_HINT_KEY = "stayr_case_study_unlocked";

/** Query flag the proxy adds when it bounces an un-gated visit. */
export const UNLOCK_PARAM = "unlock";
export const UNLOCK_VALUE = "case-study";
