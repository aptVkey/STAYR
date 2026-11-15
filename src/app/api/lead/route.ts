import { after, NextResponse } from "next/server";
import { parseAdContext, requestMeta, sendConversion } from "@/lib/conversions";
import {
  clientKey,
  deliverLead,
  PRIVACY_NOTICE_VERSION,
  rateLimited,
  sanitizeAttribution,
} from "@/lib/leads";
import { ACCESS_COOKIE, ACCESS_COOKIE_MAX_AGE } from "@/lib/access";
import {
  clean,
  hasErrors,
  normalizeUrl,
  validateOptin,
  type OptinInput,
} from "@/lib/validation";

/**
 * POST /api/lead — case study opt-in.
 * Validates, delivers the lead to the configured destination and, only on
 * successful delivery, sets the case study access cookie.
 */
export async function POST(request: Request) {
  if (rateLimited(`lead:${clientKey(request)}`)) {
    return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  // Honeypot: real visitors never fill this. Respond as if accepted, but
  // store nothing and grant nothing.
  if (clean(body.hp)) {
    return NextResponse.json({ ok: true, mode: "ignored" });
  }

  const input: OptinInput = {
    firstName: clean(body.firstName, 80),
    email: clean(body.email, 254).toLowerCase(),
    company: clean(body.company, 120),
    website: clean(body.website, 300),
    marketingConsent: body.marketingConsent === true,
  };

  const errors = validateOptin(input);
  if (hasErrors(errors)) {
    return NextResponse.json(
      { ok: false, error: "validation", fields: errors },
      { status: 422 },
    );
  }

  const ad = parseAdContext(body.ad);

  try {
    const { mode } = await deliverLead({
      type: "case_study_optin",
      fields: {
        firstName: input.firstName,
        email: input.email,
        company: input.company,
        website: normalizeUrl(input.website) ?? "",
      },
      consent: {
        marketing: input.marketingConsent,
        advertising: ad.consent,
        privacyNoticeVersion: PRIVACY_NOTICE_VERSION,
      },
      attribution: sanitizeAttribution(body.attribution),
      source: {
        placement: clean(body.placement, 60) || "unknown",
        locale: clean(body.locale, 5) || "en",
      },
    });

    if (ad.consent) {
      const meta = requestMeta(request);
      after(() =>
        sendConversion("lead", {
          eventId: ad.eventId,
          email: input.email,
          ip: meta.ip,
          userAgent: meta.userAgent,
          url: ad.url,
          fbp: ad.fbp,
          fbc: ad.fbc,
          ttp: ad.ttp,
          ttclid: sanitizeAttribution(body.attribution).ttclid,
        }),
      );
    }

    const response = NextResponse.json({ ok: true, mode });
    response.cookies.set(ACCESS_COOKIE, "1", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: ACCESS_COOKIE_MAX_AGE,
      path: "/",
    });
    return response;
  } catch (error) {
    console.error("[leads] Opt-in delivery failed:", error);
    return NextResponse.json({ ok: false, error: "delivery" }, { status: 502 });
  }
}
