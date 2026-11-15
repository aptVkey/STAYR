/**
 * Shared validation — used by the client forms for instant feedback and by
 * the API routes as the source of truth. No dependencies.
 */

export type FieldError = "required" | "email" | "url" | "tooLong" | "select";
export type Errors<T extends string> = Partial<Record<T, FieldError>>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const DOMAIN = /^([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i;

export const clean = (value: unknown, max = 200): string =>
  typeof value === "string" ? value.trim().slice(0, max + 1) : "";

export function isEmail(value: string) {
  return value.length <= 254 && EMAIL.test(value);
}

/** Accepts "hotel.com", "www.hotel.com/path" and full URLs. */
export function normalizeUrl(value: string): string | null {
  const raw = value.trim();
  if (!raw) return null;
  try {
    const url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
    if (!/^https?:$/.test(url.protocol)) return null;
    if (!DOMAIN.test(url.hostname)) return null;
    return url.toString();
  } catch {
    return null;
  }
}

/* ── Case study opt-in ───────────────────────────────────────── */

export type OptinInput = {
  firstName: string;
  email: string;
  company: string;
  website: string;
  marketingConsent: boolean;
};
export type OptinField = "firstName" | "email" | "company" | "website";

export function validateOptin(input: OptinInput): Errors<OptinField> {
  const errors: Errors<OptinField> = {};
  if (!input.firstName) errors.firstName = "required";
  else if (input.firstName.length > 80) errors.firstName = "tooLong";

  if (!input.email) errors.email = "required";
  else if (!isEmail(input.email)) errors.email = "email";

  if (!input.company) errors.company = "required";
  else if (input.company.length > 120) errors.company = "tooLong";

  if (input.website && !normalizeUrl(input.website)) errors.website = "url";
  return errors;
}

/* ── Partnership application ─────────────────────────────────── */

export type ApplicationInput = {
  fullName: string;
  email: string;
  company: string;
  website: string;
  country: string;
  businessType: string;
  properties: string;
  budget: string;
  objective: string;
  message: string;
  marketingConsent: boolean;
};
export type ApplicationField = Exclude<
  keyof ApplicationInput,
  "marketingConsent"
>;

export function validateApplication(
  input: ApplicationInput,
): Errors<ApplicationField> {
  const errors: Errors<ApplicationField> = {};

  if (!input.fullName) errors.fullName = "required";
  else if (input.fullName.length > 120) errors.fullName = "tooLong";

  if (!input.email) errors.email = "required";
  else if (!isEmail(input.email)) errors.email = "email";

  if (!input.company) errors.company = "required";
  else if (input.company.length > 120) errors.company = "tooLong";

  if (!input.website) errors.website = "required";
  else if (!normalizeUrl(input.website)) errors.website = "url";

  if (!input.country) errors.country = "required";
  else if (input.country.length > 80) errors.country = "tooLong";

  for (const key of ["businessType", "properties", "budget", "objective"] as const) {
    if (!input[key]) errors[key] = "select";
    else if (input[key].length > 80) errors[key] = "tooLong";
  }

  if (input.message.length > 2000) errors.message = "tooLong";
  return errors;
}

export const hasErrors = (errors: object) => Object.keys(errors).length > 0;
