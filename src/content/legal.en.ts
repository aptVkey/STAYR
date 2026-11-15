/**
 * Legal copy — DRAFT TEMPLATES.
 *
 * These describe what the website actually does today (the forms, the access
 * cookie, consent-gated analytics). They are not legal advice and must be
 * reviewed by qualified counsel, and every [bracketed] item replaced with
 * real company details, before the site is published.
 */

export type LegalSection = {
  title: string;
  paragraphs?: string[];
  list?: string[];
};

export type LegalDocument = {
  title: string;
  updated: string;
  draftNotice: string;
  intro: string;
  sections: LegalSection[];
};

export const privacy: LegalDocument = {
  title: "Privacy Policy",
  updated: "Draft — not yet in force",
  draftNotice:
    "Draft template. Items in [brackets] are placeholders for company details that have not been provided. This text requires legal review before publication.",
  intro:
    "This policy explains what personal data STAYR collects through this website, why we collect it and the choices you have.",
  sections: [
    {
      title: "1. Who is responsible for your data",
      paragraphs: [
        "The data controller is [legal entity name], [registered address], [company registration / VAT number].",
        "You can contact us about privacy at [privacy contact email].",
      ],
    },
    {
      title: "2. What we collect",
      paragraphs: ["We only collect what you choose to give us, plus limited technical information:"],
      list: [
        "Case study access form: first name, work email, hotel or company name and, optionally, company website.",
        "Partnership application: full name, work email, company name, website, country, business type, number of properties, approximate monthly advertising budget, primary objective and any message you add.",
        "Campaign attribution: the campaign parameters and advertising click identifiers present in the link you arrived from, the first page you viewed and the referring website.",
        "Strategy call booking: full name, work email, hotel or company name, the time you chose, your time zone and any note you add.",
        "Aggregate usage statistics: pages viewed and interactions such as starting the case study video, with the traffic source, device type and country. We measure this ourselves, without cookies and without storing your IP address; visits are counted with an anonymous identifier that changes every day. These records do not contain your name, email or company.",
        "Advertising measurement: only if you accept advertising cookies — the same interactions are also sent to the advertising platforms listed below, from your browser and from our server (with your IP address, browser type and the platform's own click identifiers) [if advanced matching is switched on: and a hashed version of your email address].",
      ],
    },
    {
      title: "3. Why we use it and our legal basis",
      list: [
        "To give you access to the case study you requested and to follow up about it — [legal basis to be confirmed by counsel, e.g. legitimate interests].",
        "To assess and respond to a partnership application — steps taken at your request before entering into a contract.",
        "To send occasional insights by email — only if you tick the separate, optional box. Access to the case study never depends on it, and you can unsubscribe at any time.",
        "To schedule and prepare a strategy call you book — steps taken at your request.",
        "To understand how the website is used, in aggregate — [legal basis to be confirmed by counsel, e.g. legitimate interests].",
        "To measure how our own advertising performs with advertising platforms — only with your consent, given through the cookie banner.",
      ],
    },
    {
      title: "4. Cookies and similar technologies",
      paragraphs: ["Strictly necessary:"],
      list: [
        "A cookie that records that you have unlocked the case study, kept for 30 days.",
        "Your cookie choice, stored in your browser so we do not ask again.",
        "Campaign attribution for your current visit, held in your browser's session storage and sent to us only when you submit a form.",
        "Optional, only after you accept: analytics and advertising tags and the matching server-side conversion events — [list the tools in use once configured, e.g. Google Analytics, Google Ads, Meta Pixel and Conversions API, TikTok Pixel and Events API].",
      ],
    },
    {
      title: "5. Who we share it with",
      paragraphs: [
        "We do not sell personal data. We use service providers that process data on our behalf: [CRM provider], [email provider], [scheduling provider], [hosting provider] and, where you have consented, [analytics and advertising providers].",
      ],
    },
    {
      title: "6. International transfers",
      paragraphs: [
        "[Describe whether data is transferred outside the EEA / UK and the safeguards relied on.]",
      ],
    },
    {
      title: "7. How long we keep it",
      paragraphs: [
        "[State retention periods for leads, applications and marketing contacts.]",
      ],
    },
    {
      title: "8. Your rights",
      paragraphs: [
        "Depending on where you live, you may have the right to access, correct, delete or restrict the use of your data, to object to processing, to data portability and to withdraw consent at any time. You may also lodge a complaint with your data protection authority — [name of lead supervisory authority].",
        "To exercise any of these rights, contact [privacy contact email].",
      ],
    },
    {
      title: "9. Changes to this policy",
      paragraphs: [
        "We will update this page when our practices change and revise the date shown above.",
      ],
    },
  ],
};

export const terms: LegalDocument = {
  title: "Terms",
  updated: "Draft — not yet in force",
  draftNotice:
    "Draft template. Items in [brackets] are placeholders for company details that have not been provided. This text requires legal review before publication.",
  intro:
    "These terms cover the use of this website. A STAYR partnership is governed by a separate written agreement signed by both parties.",
  sections: [
    {
      title: "1. About this website",
      paragraphs: [
        "This website is operated by [legal entity name], [registered address]. It provides general information about STAYR's paid advertising services for hospitality businesses.",
      ],
    },
    {
      title: "2. Information, not advice or guarantees",
      paragraphs: [
        "Content on this site, including the interactive acquisition model, is illustrative and for general information. It is not a forecast and does not guarantee any advertising or commercial result.",
      ],
    },
    {
      title: "3. Pricing",
      paragraphs: [
        "Prices shown are exclusive of advertising spend and applicable taxes. The services, channels and deliverables included in a partnership are those set out in the written agreement between STAYR and the client.",
      ],
    },
    {
      title: "4. Intellectual property",
      paragraphs: [
        "The STAYR name, the site design and its content belong to [legal entity name] or its licensors and may not be reused without permission.",
      ],
    },
    {
      title: "5. Governing law",
      paragraphs: ["[Governing law and jurisdiction to be confirmed.]"],
    },
  ],
};
