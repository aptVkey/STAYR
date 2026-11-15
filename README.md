# STAYR — website and sales funnel

Paid advertising for hospitality. This repository is the marketing site and lead funnel:

```
/                homepage (13 sections)
   └─ "Unlock the Case Study" → opt-in modal → POST /api/lead
/case-study      gated video sales letter → strategy call
/apply           partnership application → POST /api/application
/privacy /terms  legal (draft templates)
```

Built with Next.js 16 (App Router), TypeScript, Tailwind CSS 4, Motion and Lucide.

## Run it

```bash
npm install
npm run dev
```

Nothing needs configuring to run the public site locally. Copy `.env.example` to `.env.local` when you are ready to connect real services.

The admin lives at `/admin` and needs `ADMIN_PASSWORD` (8+ characters) and `ADMIN_SESSION_SECRET` in `.env.local`.

To preview the admin with sample numbers: `npm run demo:seed` (every row is flagged and the admin shows a banner), then `npm run demo:clear` to remove them.

## What is real and what is a placeholder

| Area | State without configuration | To make it live |
| --- | --- | --- |
| Lead capture + CRM | Works: leads, applications and bookings are stored in a local SQLite file (`.data/stayr.db`). | On a serverless host set `DATABASE_URL` / `DATABASE_AUTH_TOKEN` (libSQL / Turso); a local file does not persist there. Optional copy to `LEAD_WEBHOOK_URL`. |
| Admin | Switched off until a password is set. | Set `ADMIN_PASSWORD` and `ADMIN_SESSION_SECRET`. |
| Case study video | Labelled "Video source not configured" poster, no controls. | Set `NEXT_PUBLIC_VSL_VIDEO_URL`; captions via `NEXT_PUBLIC_VSL_CAPTIONS_URL`. |
| Scheduling | Works: built-in scheduler with default weekday hours (Europe/Lisbon). No email is sent — the visitor gets an `.ics` invitation to download. | Set hours and meeting link in Admin → Agenda. `NEXT_PUBLIC_BOOKING_URL` switches to an external tool instead. |
| Built-in analytics | Works: cookieless page views, visitors and channels, shown in the admin. | — |
| Ad pixels + conversion APIs | No tags, no consent banner. | Admin → Tracking: Meta Pixel + Conversions API, Google (GA4, Ads, GTM), TikTok Pixel + Events API. |
| Case study evidence | Dashed "Placeholder — awaiting verified client data" blocks. | Replace `vsl.evidence` in `src/content/en.ts` with approved data. |
| Company details | Dashed placeholders in the footer and `[bracketed]` items in the legal pages. | Fill `src/config/site.ts` and `src/content/legal.en.ts`. |
| Photography | Unsplash placeholders, loaded remotely. | Replace sources in `src/config/images.ts`; remove the remote pattern in `next.config.ts`. |
| Legal pages | Draft templates. | Legal review before publishing. |

## Where things live

```
src/
  app/                 routes, API handlers, metadata, sitemap, robots
  proxy.ts             case study gate (redirects to the opt-in)
  config/              site details, images, integrations (env-driven)
  content/             all copy — en.ts, legal.en.ts; add pt.ts / es.ts here
  lib/
    analytics.ts       consent-gated event layer
    attribution.ts     UTM + click-ID capture
    validation.ts      shared client/server validation
    leads/             lead delivery: webhook or local-dev fallback
    access.ts          gate cookie names
  components/
    ui/                buttons, reveal animations, form fields, logo
    layout/            headers, footer, consent banner, mobile CTA
    funnel/            opt-in modal, video player, booking embed, forms
    home/              one file per homepage section
docs/vsl-script.md     10–15 minute VSL script framework
```

## Admin, data and tracking

- **Data** (`src/lib/db.ts`): one libSQL / SQLite database holds contacts, timeline, bookings, analytics events and admin settings.
- **Auth** (`src/lib/admin/auth.ts`): one password, a signed httpOnly session cookie, checked by every `/api/admin/*` route. `src/proxy.ts` only redirects to the login. There are no user accounts or roles.
- **CRM** (`src/lib/crm.ts`): an opt-in or application creates an MQL; a stored booking makes it an SQL; you mark customers and lost deals in the admin. Contacts are matched by email.
- **Built-in analytics** (`/api/collect`): no cookie, no stored IP. Visitors are counted with a hash of IP + user agent salted per day, so "unique visitors" means unique per day.
- **Ad platforms** (`src/lib/analytics.ts`, `src/lib/conversions.ts`): pixels load only after the visitor accepts the banner. Lead, application and booking are mirrored server-side to Meta and TikTok with the same event ID, only for visitors who accepted. Marking a customer sends a `Purchase`. The hashed email is included only if "advanced matching" is on.
- **Tokens** are stored in the database and never returned to the browser.

Names and emails are never placed in URLs and never sent to analytics. With `LEAD_WEBHOOK_URL` set, a JSON copy of each lead, application and booking is also POSTed there (signed with HMAC-SHA256 in `x-stayr-signature` when `LEAD_WEBHOOK_SECRET` is set).

## The case study gate

After a successful opt-in the server sets an `httpOnly` cookie; `src/proxy.ts` redirects visits to `/case-study` without it back to the homepage, where the modal opens. This is a funnel step, **not authentication** — the video URL is public. Do not put confidential material behind it.

## Funnel events

`homepage_view`, `hero_cta_click`, `optin_modal_open`, `optin_submit`, `case_study_view`, `vsl_play`, `vsl_25_percent`, `vsl_50_percent`, `vsl_75_percent`, `vsl_complete`, `application_start`, `application_submit`, `strategy_call_click`, `strategy_call_confirmed`.

- Nothing is sent until the visitor accepts the consent banner; declining is one click.
- When GTM is configured, events go to the `dataLayer` only and GA4 / Meta / Google Ads should be set up inside GTM. Otherwise the direct IDs are used. This avoids double-counting.
- `strategy_call_confirmed` fires only when Calendly reports a completed booking. With any other scheduler it never fires.

## Localisation

Copy is centralised in `src/content/en.ts`. To add Portuguese or Spanish, create `pt.ts` / `es.ts` with the same shape, register it in `src/content/index.ts` and resolve the locale per request (for example an `app/[locale]` segment).

## Before launch

- [ ] Owned or licensed photography
- [ ] Real company details, contact email and LinkedIn
- [ ] Legal review of privacy policy and terms
- [ ] A persistent database (`DATABASE_URL`) and a strong `ADMIN_PASSWORD`
- [ ] Tracking IDs and tokens saved in the admin, each checked with the platform's test-events view
- [ ] Demo data removed (`npm run demo:clear`)
- [ ] Video and captions configured; availability and meeting link set in Admin → Agenda
- [ ] Verified case study evidence, or removal of that section
- [ ] A production rate limiter in front of the API routes (the built-in one is in-memory and best-effort)
