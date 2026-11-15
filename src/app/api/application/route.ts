import { after, NextResponse } from "next/server";
import { parseAdContext, requestMeta, sendConversion } from "@/lib/conversions";
import {
  clientKey,
  deliverLead,
  PRIVACY_NOTICE_VERSION,
  rateLimited,
  sanitizeAttribution,
} from "@/lib/leads";
import {
  clean,
  hasErrors,
  normalizeUrl,
  validateApplication,
  type ApplicationInput,
} from "@/lib/validation";

/**
 * POST /api/application — partnership application.
 * Every valid application is delivered for human review; nothing is
 * auto-rejected on budget or size.
 */
export async function POST(request: Request) {
  if (rateLimited(`application:${clientKey(request)}`)) {
    return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  if (clean(body.hp)) {
    return NextResponse.json({ ok: true, mode: "ignored" });
  }

  const input: ApplicationInput = {
    fullName: clean(body.fullName, 120),
    email: clean(body.email, 254).toLowerCase(),
    company: clean(body.company, 120),
    website: clean(body.website, 300),
    country: clean(body.country, 80),
    businessType: clean(body.businessType, 80),
    properties: clean(body.properties, 80),
    budget: clean(body.budget, 80),
    objective: clean(body.objective, 80),
    message: clean(body.message, 2000),
    marketingConsent: body.marketingConsent === true,
  };

  const errors = validateApplication(input);
  if (hasErrors(errors)) {
    return NextResponse.json(
      { ok: false, error: "validation", fields: errors },
      { status: 422 },
    );
  }

  const ad = parseAdContext(body.ad);

  try {
    const { mode } = await deliverLead({
      type: "partnership_application",
      fields: {
        fullName: input.fullName,
        email: input.email,
        company: input.company,
        website: normalizeUrl(input.website) ?? "",
        country: input.country,
        businessType: input.businessType,
        properties: input.properties,
        budget: input.budget,
        objective: input.objective,
        message: input.message,
      },
      consent: {
        marketing: input.marketingConsent,
        advertising: ad.consent,
        privacyNoticeVersion: PRIVACY_NOTICE_VERSION,
      },
      attribution: sanitizeAttribution(body.attribution),
      source: {
        placement: clean(body.placement, 60) || "apply_page",
        locale: clean(body.locale, 5) || "en",
      },
    });
    if (ad.consent) {
      const meta = requestMeta(request);
      after(() =>
        sendConversion("application", {
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
    return NextResponse.json({ ok: true, mode });
  } catch (error) {
    console.error("[leads] Application delivery failed:", error);
    return NextResponse.json({ ok: false, error: "delivery" }, { status: 502 });
  }
}
