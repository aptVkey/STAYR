/**
 * English content dictionary.
 *
 * All customer-facing copy lives here so that Portuguese and Spanish
 * versions can be added as sibling files (pt.ts, es.ts) implementing the
 * same `Content` type. Components never hard-code marketing copy.
 *
 * House rules for this file:
 *  - No invented clients, results, testimonials, awards or guarantees.
 *  - Anything that needs real-world evidence is an explicit placeholder.
 */

export const en = {
  nav: {
    links: [
      { label: "The Problem", href: "/#problem" },
      { label: "System", href: "/#system" },
      { label: "Approach", href: "/#approach" },
      { label: "Partnership", href: "/#partnership" },
      { label: "FAQ", href: "/#faq" },
    ],
    apply: "Apply",
    caseStudy: "Case Study",
    menu: "Menu",
    close: "Close",
  },

  cta: {
    unlock: "Unlock the Case Study",
    unlockFree: "Unlock the Free Case Study",
    explore: "Explore Our System",
    methodology: "See the Full Methodology",
    ourMethodology: "See Our Methodology",
    apply: "Apply to Work With Us",
    applyGrowth: "Apply for a Growth Partnership",
    bookCall: "Book Your Growth Strategy Call",
    watchNow: "Watch the Case Study",
  },

  hero: {
    eyebrow: "AI-Powered Advertising for Hospitality",
    headline: ["More Direct Bookings.", "Less Dependency."],
    body: "Google Ads. Meta Ads. TikTok Ads. One integrated acquisition system built for hospitality.",
    credibility: ["Built by operators.", "Powered by AI.", "Focused on performance."],
    channels: ["Google Ads", "Meta Ads", "TikTok Ads"],
    markets: "Portugal · Spain · United Kingdom · Europe",
    scroll: "Scroll",
  },

  problem: {
    eyebrow: "The problem",
    headline: [
      "Your Hotel Doesn't Need Another Marketing Agency.",
      "It Needs a Better Acquisition Strategy.",
    ],
    intro:
      "Most hotels are not short of marketing. They are short of a clear, measurable way to turn advertising spend into direct bookings at an acceptable cost. That is an acquisition problem — and it is solved with a system, not with more activity.",
    challengesLabel: "Where advertising value gets lost",
    challenges: [
      {
        title: "High reliance on third-party distribution",
        body: "Commission-based channels fill rooms, but they own the guest relationship and take a share of every stay.",
      },
      {
        title: "Inefficient advertising investment",
        body: "Budget is spread across campaigns without a clear view of which ones produce bookings worth having.",
      },
      {
        title: "Weak conversion experiences",
        body: "Paid traffic lands on pages that were never designed to turn a click into a reservation.",
      },
      {
        title: "Generic advertising creatives",
        body: "The same visuals and the same message for every market, audience and season.",
      },
      {
        title: "Disconnected marketing and revenue strategies",
        body: "Campaigns follow a media calendar. Pricing and availability follow another.",
      },
      {
        title: "Poor visibility into acquisition economics",
        body: "Reports show clicks and ROAS — not what each confirmed booking actually cost.",
      },
    ],
    contrast: {
      fromLabel: "Traditional agency thinking",
      toLabel: "Hospitality performance thinking",
      pairs: [
        { from: "Clicks", to: "Bookings" },
        { from: "Impressions", to: "Acquisition costs" },
        { from: "Engagement", to: "Conversion" },
        { from: "Generic campaigns", to: "Commercial return" },
      ],
    },
  },

  revenue: {
    eyebrow: "The revenue opportunity",
    headline: ["Every Booking Has", "an Acquisition Cost."],
    body: "The question isn't simply how many bookings you generate. It's how efficiently you acquire them.",
    hint: "Select a stage. Move the lever. Watch the economics change.",
    disclaimer:
      "Illustrative model. The inputs are yours to adjust — this is not a forecast and does not represent STAYR client results.",
    stages: [
      {
        id: "investment",
        label: "Ad Investment",
        control: "Monthly ad investment",
        insight:
          "Budget is the input, not the strategy. The same investment produces very different outcomes depending on what happens in the five stages after it.",
      },
      {
        id: "click",
        label: "Ad Click",
        control: "Average cost per click",
        insight:
          "Creative quality, targeting and account structure decide what a visit costs. Cheaper clicks only matter if they are the right guests.",
      },
      {
        id: "landing",
        label: "Landing Page",
        control: "Visitors who continue to the booking engine",
        insight:
          "This is where most paid traffic is lost. A page built for the campaign — the right offer, dates and proof — sends more visitors forward.",
      },
      {
        id: "engine",
        label: "Booking Engine",
        control: "Booking engine conversion rate",
        insight:
          "Rate parity, availability, mobile usability and payment friction decide whether intent becomes a reservation.",
      },
      {
        id: "confirmed",
        label: "Confirmed Booking",
        control: "Cancellation rate",
        insight:
          "A booking is not revenue until the guest stays. Cancellations quietly raise the true cost of every acquired customer.",
      },
      {
        id: "revenue",
        label: "Net Revenue",
        control: "Average booking value",
        insight:
          "Length of stay, room type and rate strategy set what each booking is worth — and how much it can afford to cost.",
      },
    ],
    metrics: {
      conversionRate: {
        label: "Booking conversion rate",
        note: "Ad click → booking",
      },
      costPerBooking: {
        label: "Cost per acquired booking",
        note: "Before cancellations",
      },
      revenue: {
        label: "Direct booking revenue",
        note: "After cancellations",
      },
      cancellation: {
        label: "Booking cancellation rate",
        note: "Bookings that never stay",
      },
      cac: {
        label: "Customer acquisition cost",
        note: "Per guest who actually stays",
      },
      contribution: {
        label: "Net contribution",
        note: "Revenue after cancellations, minus ad investment",
      },
    },
    units: {
      clicks: "clicks",
      visits: "engine visits",
      bookings: "bookings",
      confirmed: "confirmed",
    },
    roas: {
      title: "Reported ROAS is not incremental revenue.",
      body: "Advertising platforms attribute revenue to themselves — including guests who would have booked anyway and bookings that later cancel. A healthy-looking ROAS can hide weak acquisition economics. We read it as one signal among several, never as the result.",
      reported: "Platform-reported ROAS",
      net: "After cancellations",
      incremental: "Truly incremental",
      incrementalValue: "Needs measurement",
    },
  },

  system: {
    eyebrow: "Our operating system",
    headline: ["One Focus.", "Three Engines."],
    body: "We do one thing: paid acquisition for hospitality. It runs on three engines that are planned, built and optimised together — because none of them performs alone.",
    engines: {
      creative: {
        id: "creative",
        index: "01",
        name: "Creative",
        title: "Ads Built to Capture Attention.",
        body: "We produce advertising creatives designed for specific audiences, markets and commercial objectives — then keep testing them.",
        capabilities: [
          "Static ads",
          "Short-form video",
          "Ad copy",
          "Creative variations",
          "Multilingual creative adaptation",
          "AI-assisted creative production",
          "Continuous creative testing",
        ],
        visual: {
          master: "Master concept",
          hotel: "Your Hotel",
          cta: "Book direct",
          formats: [
            { ratio: "9:16", place: "Stories · Reels · TikTok", lang: "EN", line: "Wake up to the Atlantic." },
            { ratio: "1:1", place: "Feed", lang: "PT", line: "Acorde com o Atlântico." },
            { ratio: "4:5", place: "Feed · Portrait", lang: "ES", line: "Despierta frente al Atlántico." },
            { ratio: "16:9", place: "Video · Display", lang: "DE", line: "Aufwachen am Atlantik." },
          ],
        },
      },
      conversion: {
        id: "conversion",
        index: "02",
        name: "Conversion",
        title: "Clicks Are Only the Beginning.",
        body: "We build landing pages and optimise booking journeys so advertising traffic has a better opportunity to convert.",
        capabilities: [
          "Landing page design",
          "Mobile optimisation",
          "Conversion tracking",
          "User journey analysis",
          "A/B testing",
          "Booking flow optimisation",
        ],
        visual: {
          url: "yourhotel.com/atlantic-escape",
          hotel: "Your Hotel",
          headline: "Three nights above the Atlantic.",
          sub: "Best available rate, only when you book direct.",
          checkIn: "Check-in",
          checkOut: "Check-out",
          guests: "Guests",
          button: "Check availability",
          desktop: "Desktop",
          mobile: "Mobile",
          path: ["Ad", "Landing page", "Booking engine"],
          points: ["Breakfast included", "Free cancellation", "Sea-view rooms"],
        },
      },
      media: {
        id: "media",
        index: "03",
        name: "Paid Media",
        title: "Strategy Meets Daily Execution.",
        body: "We plan, launch, manage and optimise campaigns across Google, Meta and TikTok — every day, not once a month.",
        capabilities: [
          "Campaign strategy",
          "Account structuring",
          "Audience targeting",
          "Market localisation",
          "Budget allocation",
          "Remarketing",
          "Performance monitoring",
          "Testing and optimisation",
        ],
        visual: {
          center: "One acquisition system",
          centerSub: "Shared audiences · shared learnings · one budget logic",
          channels: [
            { name: "Google Ads", role: "Captures demand that already exists" },
            { name: "Meta Ads", role: "Creates demand and brings guests back" },
            { name: "TikTok Ads", role: "Opens discovery with new audiences" },
          ],
        },
      },
    },
    capabilitiesLabel: "Capabilities",
    closing: ["Creative. Conversion. Distribution.", "One Connected System."],
    closingBody:
      "See how the three engines work together in a full video walkthrough of our methodology.",
  },

  operators: {
    eyebrow: "Why we are different",
    headline: ["We're Not Just Advertisers.", "We're Hospitality Operators."],
    body: "An ad account can't see your pickup report. We can read one. Paid advertising for hotels only works when the people running it understand how a property actually makes money — and plan campaigns around it.",
    listLabel: "The operating concepts behind every campaign decision",
    formula: "RevPAR = ADR × Occupancy",
    formulaNote: "The equation every campaign has to respect.",
    terms: [
      {
        term: "ADR",
        full: "Average daily rate",
        body: "Rate sets how much each booking can afford to cost. Bids and budgets are planned against what a room night is worth, not against what a click costs.",
      },
      {
        term: "RevPAR",
        full: "Revenue per available room",
        body: "Advertising that fills rooms at the wrong rate can lift occupancy and still hurt RevPAR. We plan campaigns for both sides of the equation.",
      },
      {
        term: "Occupancy",
        full: "Rooms sold vs. rooms available",
        body: "When you're on track to fill, paid demand should chase rate and shoulder nights — not volume. Campaign pressure follows your pickup.",
      },
      {
        term: "Revenue management",
        full: "Pricing and restrictions",
        body: "Minimum stays, closed dates and rate fences change what should be advertised. Campaigns have to reflect the decisions your revenue team makes.",
      },
      {
        term: "Seasonality",
        full: "High, shoulder and low periods",
        body: "High season and low season are different businesses. Budgets, messages and source markets shift well before the dates they target.",
      },
      {
        term: "Booking windows",
        full: "Lead time by market and segment",
        body: "A summer family holiday and a last-minute city break are bought on different clocks. Timing and measurement follow each market's lead time.",
      },
      {
        term: "Room availability",
        full: "Inventory and stop-sells",
        body: "Advertising rooms you can't sell wastes budget and frustrates guests. Campaigns adapt to inventory instead of ignoring it.",
      },
      {
        term: "OTA commissions",
        full: "The cost of third-party distribution",
        body: "Commission is an acquisition cost too. It's the benchmark your paid direct channel has to beat on a net basis.",
      },
      {
        term: "Direct booking economics",
        full: "What a direct guest is really worth",
        body: "A direct booking carries media cost — and guest data, upsell potential and repeat-stay value. We measure it on net revenue, not on clicks.",
      },
    ],
  },

  ai: {
    eyebrow: "The AI advantage",
    headline: ["AI Accelerates Execution.", "Experience Drives Decisions."],
    body: "AI lets us produce, adapt and test advertising at a pace a traditional production process can't match. What gets tested, what gets scaled and what gets switched off is still decided by people who understand your property.",
    ideaLabel: "One advertising idea",
    idea: "Wake up to the Atlantic.",
    ideaMeta: "Concept · Sea-view rooms · Direct offer",
    becomes: "becomes",
    disclaimer:
      "Example outputs for illustration. AI speeds up production and experimentation — it does not, by itself, guarantee better advertising results.",
    tabs: [
      {
        id: "variations",
        label: "Ad variations",
        count: "Multiple angles",
        items: [
          { tag: "Angle · The view", text: "Wake up to the Atlantic." },
          { tag: "Angle · The ritual", text: "Breakfast with nothing between you and the sea." },
          { tag: "Angle · The offer", text: "Our best rate lives on our own website." },
          { tag: "Angle · The stay", text: "Three nights. One horizon." },
        ],
      },
      {
        id: "languages",
        label: "Languages",
        count: "Multiple markets",
        items: [
          { tag: "EN · United Kingdom", text: "Wake up to the Atlantic." },
          { tag: "PT · Portugal", text: "Acorde com o Atlântico." },
          { tag: "ES · Spain", text: "Despierta frente al Atlántico." },
          { tag: "DE · Germany", text: "Aufwachen am Atlantik." },
        ],
      },
      {
        id: "placements",
        label: "Placements",
        count: "Multiple formats",
        items: [
          { tag: "Google · Search", text: "Responsive text ad matched to booking intent" },
          { tag: "Meta · Feed", text: "4:5 static with direct-rate message" },
          { tag: "Meta · Stories & Reels", text: "9:16 short-form video" },
          { tag: "TikTok · In-feed", text: "9:16 native-style video" },
        ],
      },
      {
        id: "audiences",
        label: "Audience messages",
        count: "Multiple guests",
        items: [
          { tag: "Couples · Weekend escape", text: "Two nights, one view, zero plans." },
          { tag: "Families · School holidays", text: "Room for everyone. Sea for everyone." },
          { tag: "Long stays · Remote work", text: "Your desk, with an ocean behind the screen." },
          { tag: "Past guests · Return offer", text: "The Atlantic kept your room." },
        ],
      },
    ],
    workflowLabel: "How a concept reaches the market",
    workflow: [
      { step: "Commercial brief", by: "Operator" },
      { step: "AI-assisted production", by: "AI + Operator" },
      { step: "Brand and rate review", by: "Operator" },
      { step: "Live testing", by: "Platforms" },
      { step: "Scale or stop", by: "Operator" },
    ],
  },

  who: {
    eyebrow: "Who we help",
    headline: ["Built for Hotels", "That Think Bigger."],
    idealLabel: "The ideal partner",
    ideal:
      "An established hospitality business with a meaningful advertising budget, a functional booking journey and a genuine ambition to improve paid acquisition.",
    segments: [
      { id: "independent", name: "Independent Hotels", note: "Single properties competing with distribution giants for their own guests." },
      { id: "boutique", name: "Boutique Hotels", note: "Distinct products that deserve advertising as considered as the stay." },
      { id: "groups", name: "Hotel Groups", note: "Multi-property portfolios that need one acquisition logic across markets." },
      { id: "resorts", name: "Resorts", note: "Long booking windows, high-value stays and seasonality to plan around." },
      { id: "apartments", name: "Serviced Apartments", note: "Aparthotels and operators balancing short stays with extended ones." },
      { id: "travel", name: "Travel & Tourism Operators", note: "Experiences and travel brands selling direct to international guests." },
    ],
  },

  caseStudy: {
    eyebrow: "Exclusive hospitality performance case study",
    headline: ["See the System Behind", "Smarter Hotel Advertising."],
    body: "Discover how creative production, paid advertising and conversion optimisation work together to build a more effective hospitality acquisition system.",
    learnLabel: "What you'll learn",
    learn: [
      "How we structure hospitality advertising campaigns.",
      "How we approach creative testing and conversion.",
      "How we measure acquisition efficiency.",
      "How we identify opportunities to improve direct booking performance.",
    ],
    microcopy: "Exclusive video walkthrough. Access with your work email.",
    thumb: {
      kicker: "STAYR — Methodology walkthrough",
      title: "The System Behind Smarter Hotel Advertising",
      meta: "Video case study",
      locked: "Unlocks with your work email",
      play: "Play the case study",
    },
  },

  process: {
    eyebrow: "How we work",
    headline: ["Performance Requires", "More Than 30 Days."],
    body: "We only work through 12-month partnerships. Not to lock anyone in — but because an acquisition system has to be built, tested across high, shoulder and low season, and refined with real data before it can be trusted.",
    note: "Indicative pacing. Every partnership moves at the speed of its data — no outcome is promised by a particular month.",
    monthLabel: "Month",
    focusLabel: "Focus",
    phases: [
      {
        index: "01",
        name: "Foundation",
        span: [1, 2],
        body: "Audit, tracking, commercial objectives and campaign architecture.",
        focus: [
          "Account, tracking and booking-journey audit",
          "Commercial objectives agreed with your revenue team",
          "Measurement plan and campaign architecture",
        ],
      },
      {
        index: "02",
        name: "Launch & Learn",
        span: [3, 5],
        body: "Creative testing, initial campaigns and conversion analysis.",
        focus: [
          "First creative concepts in market",
          "Initial campaigns across the agreed channels",
          "Early read on conversion and acquisition cost",
        ],
      },
      {
        index: "03",
        name: "Optimize",
        span: [6, 9],
        body: "Refinement of audiences, creatives, landing pages and budget allocation.",
        focus: [
          "Audience and market refinement",
          "Landing page and creative iteration",
          "Budget reallocated towards what the data supports",
        ],
      },
      {
        index: "04",
        name: "Scale & Evolve",
        span: [10, 12],
        body: "Expansion of effective acquisition strategies and continued performance improvement.",
        focus: [
          "Expansion of strategies that have proven efficient",
          "New markets, formats and seasonal plans",
          "Annual review and next-year acquisition plan",
        ],
      },
    ],
  },

  partnership: {
    eyebrow: "The partnership",
    headline: ["One Partnership.", "Everything You Need to Run Better Ads."],
    body: "One premium service. No tiers, no add-on menus. A single team responsible for your paid acquisition from the first concept to the confirmed booking.",
    includedLabel: "What's included",
    included: [
      "Advertising strategy",
      "AI-assisted creative production",
      "Landing page development within an agreed scope",
      "Google Ads management",
      "Meta Ads management",
      "TikTok Ads management",
      "Conversion measurement",
      "Campaign optimisation",
      "Monthly performance reviews",
    ],
    scope:
      "The specific channels and deliverables are agreed during onboarding, based on your markets and objectives. Creative and landing page production is scoped, not unlimited.",
    plans: {
      annual: {
        name: "Annual Partnership",
        unit: "/ year",
        terms: "Paid upfront.",
        detail: "One payment for the full 12-month partnership.",
      },
      monthly: {
        name: "Monthly Partnership",
        unit: "/ month",
        terms: "12-month agreement.",
        detail: "Twelve monthly payments over the same partnership.",
      },
    },
    exclusions: "Both options exclude advertising spend and applicable taxes.",
    selective:
      "We onboard a limited number of partners so the same senior team runs every account. Applications are reviewed for commercial fit.",
  },

  faq: {
    eyebrow: "Questions, answered",
    headline: ["Before You", "Apply."],
    body: "The commercial questions we hear most from owners, commercial directors and revenue teams.",
    items: [
      {
        q: "Why do you only work with 12-month contracts?",
        a: "Because paid acquisition compounds. The first months build the foundation — tracking, account structure, creative baselines and enough data to make decisions that aren't guesses. Hospitality adds seasonality: a system has to be tested across high, shoulder and low periods before it can be trusted. Twelve months lets us optimise for the year's commercial outcome instead of next month's report.",
      },
      {
        q: "Is advertising spend included in your fees?",
        a: "No. Our fee covers strategy, creative production, landing pages within an agreed scope and campaign management. Advertising spend is paid by you directly to Google, Meta and TikTok, through accounts you own. Applicable taxes are also excluded.",
      },
      {
        q: "Do you work with independent hotels?",
        a: "Yes. Size isn't the filter — commercial fit is. We work best with established properties that have a functional booking journey, a meaningful advertising budget and a genuine ambition to grow direct revenue. A single well-run independent hotel can be an excellent fit.",
      },
      {
        q: "Can you work with our existing booking engine?",
        a: "In most cases, yes. We build campaigns and landing pages around the booking engine you already use and work within its tracking capabilities. During onboarding we audit what can be measured and flag any limitations before campaigns launch.",
      },
      {
        q: "How do you measure advertising performance?",
        a: "Against commercial outcomes, not platform vanity metrics. We look at confirmed bookings, cost per acquired booking, revenue after cancellations and the conversion rate at each step of the journey. We treat platform-reported ROAS with caution: it shows attributed revenue, which is not necessarily incremental revenue.",
      },
      {
        q: "Do you guarantee results?",
        a: "No — and you should be careful with anyone who does. Results depend on your rates, availability, product, market demand and budget. What we commit to is the work: disciplined daily execution, transparent reporting and decisions grounded in your acquisition economics.",
      },
      {
        q: "What if we already have a marketing agency?",
        a: "That's common. We don't replace your brand, PR, SEO or social partners — we take responsibility for paid acquisition only. If another agency currently runs your ads, we review the transition together during the application process.",
      },
      {
        q: "Do you provide SEO or social media management?",
        a: "No. We do paid advertising: creatives, landing pages and campaigns on Google, Meta and TikTok. Staying narrow is what allows us to go deep. We're happy to work alongside the partners who handle your other channels.",
      },
      {
        q: "What advertising budget should we have?",
        a: "There is no fixed minimum, but the system needs enough spend to generate reliable learnings. As a guideline, your media budget should be large enough that our fee is a sensible proportion of your total investment. We ask for your approximate budget in the application and give you an honest view of fit.",
      },
      {
        q: "Do we need to advertise on all three platforms?",
        a: "No. The channel mix is agreed during onboarding and follows your markets, guests and objectives. Some properties start with one or two platforms and expand when the data supports it. The system is integrated — the channel list is not a checklist.",
      },
    ],
  },

  finalCta: {
    eyebrow: "The next step",
    headline: ["Ready to Rethink How", "Your Hotel Acquires", "Bookings?"],
    body: "Discover the strategy behind a more connected approach to advertising, creativity and conversion.",
  },

  footer: {
    description:
      "STAYR is a paid advertising partner for hospitality. Creatives, landing pages and campaigns on Google, Meta and TikTok — built as one acquisition system.",
    statement: "We Don't Do Everything. We Do Ads.",
    columns: {
      explore: "Explore",
      company: "Company",
      contact: "Contact",
      legal: "Legal",
    },
    placeholders: {
      legalName: "Legal entity name — to be added",
      address: "Registered address — to be added",
      registration: "Company registration / VAT — to be added",
      email: "Contact email — to be added",
      linkedin: "LinkedIn — profile to be added",
    },
    privacy: "Privacy Policy",
    terms: "Terms",
    rights: "All rights reserved.",
  },

  optin: {
    eyebrow: "Free video case study",
    headline: "Your Case Study Is One Step Away.",
    body: "Get exclusive access to our hospitality advertising methodology and see how we approach direct booking acquisition.",
    fields: {
      firstName: { label: "First name", placeholder: "Your first name" },
      email: { label: "Work email", placeholder: "you@yourhotel.com" },
      company: { label: "Hotel / company name", placeholder: "Property or group name" },
      website: { label: "Company website", placeholder: "yourhotel.com", optional: "Optional" },
    },
    consent:
      "Also send me occasional STAYR insights on hospitality advertising. Optional — you can unsubscribe at any time.",
    privacy: {
      before: "We use your details to give you access to the case study and to follow up about it. See our",
      link: "Privacy Policy",
      after: ".",
    },
    submit: "Watch the Case Study",
    submitting: "Unlocking…",
    success: {
      title: "Access unlocked.",
      body: "Taking you to your case study…",
    },
    errors: {
      generic: "Something went wrong and your details were not saved. Please try again.",
      network: "We couldn't reach the server. Check your connection and try again.",
      notConfigured:
        "Lead capture isn't configured on this deployment yet, so we couldn't save your details.",
      rateLimited: "Too many attempts. Please wait a minute and try again.",
    },
    devNotice:
      "Development mode: no CRM is configured. This lead was written to a local file only.",
    points: ["Full methodology walkthrough", "The three-engine system", "How we measure efficiency"],
  },

  validation: {
    required: "This field is required.",
    email: "Enter a valid email address.",
    url: "Enter a valid website address.",
    tooLong: "This is longer than expected.",
    select: "Please choose an option.",
  },

  vsl: {
    headerNote: "Private presentation",
    eyebrow: "Your exclusive case study",
    headline: ["How We Build Paid Advertising", "Systems for Hospitality."],
    subtitle:
      "A closer look at the strategy, creative process and acquisition economics behind performance-focused hotel advertising.",
    player: {
      play: "Play",
      pause: "Pause",
      mute: "Mute",
      unmute: "Unmute",
      captionsOn: "Turn captions on",
      captionsOff: "Turn captions off",
      fullscreen: "Enter fullscreen",
      exitFullscreen: "Exit fullscreen",
      seek: "Seek",
      volume: "Volume",
      posterTitle: "The System Behind Smarter Hotel Advertising",
      posterKicker: "STAYR — Methodology walkthrough",
      notConfiguredTitle: "Video source not configured",
      notConfiguredBody:
        "Setup placeholder — set NEXT_PUBLIC_VSL_VIDEO_URL (and optionally NEXT_PUBLIC_VSL_CAPTIONS_URL) to publish the case study video here.",
      error: "The video could not be loaded. Please refresh the page or try again later.",
    },
    chaptersLabel: "In this walkthrough",
    chapters: [
      { title: "The Hook", body: "Why most hospitality advertising fails to connect advertising metrics with commercial outcomes." },
      { title: "The Real Problem", body: "OTA dependency, acquisition costs, conversion issues and disconnected systems." },
      { title: "The Opportunity", body: "How a connected acquisition approach improves decisions and paid media efficiency." },
      { title: "Our Methodology", body: "The three engines: Creative, Conversion and Paid Media." },
      { title: "Case Study", body: "Client context, challenge, strategy, execution, verified performance and limitations." },
      { title: "Our Approach", body: "Why specialisation, daily execution and AI-assisted workflows matter." },
      { title: "The Partnership", body: "How STAYR's 12-month model works." },
      { title: "The Next Step", body: "Who should book a growth strategy call — and what happens on it." },
    ],
    takeaways: {
      eyebrow: "Key takeaways",
      headline: ["What to Take", "From This Walkthrough."],
      items: [
        {
          title: "Advertising metrics are not commercial metrics.",
          body: "Clicks, impressions and platform ROAS describe the ad account. Confirmed bookings, acquisition cost and net revenue describe the business.",
        },
        {
          title: "The journey converts — not the ad.",
          body: "Every stage between the click and the confirmed stay changes what a booking costs. Improving one stage in isolation rarely fixes the economics.",
        },
        {
          title: "Creative is the largest lever you control.",
          body: "Targeting is increasingly automated by the platforms. The message, the format and the market adaptation are where advertisers still differentiate.",
        },
        {
          title: "Channels should be planned as one system.",
          body: "Search captures demand, social creates it and remarketing recovers it. Budget logic has to account for how they influence each other.",
        },
        {
          title: "Efficiency is measured after cancellations.",
          body: "A booking is only revenue once the guest stays. Acquisition cost should be read on confirmed, net bookings.",
        },
      ],
    },
    evidence: {
      eyebrow: "Performance evidence",
      headline: ["Verified Results", "Go Here."],
      body: "This section is reserved for verified client evidence. Until real, approved case study data is supplied, nothing below represents an actual result.",
      badge: "Placeholder — awaiting verified client data",
      items: [
        { label: "Client context", hint: "Property type, market, size and starting position. Requires client approval." },
        { label: "The challenge", hint: "The commercial problem in the client's own numbers." },
        { label: "Campaign strategy", hint: "Channels, markets, structure and creative approach." },
        { label: "Execution", hint: "What was built and launched, and over what period." },
        { label: "Verified performance", hint: "Source-verified metrics with measurement method and date range." },
        { label: "Limitations", hint: "What the data does not show; attribution caveats." },
      ],
    },
    engines: {
      eyebrow: "The three-engine system",
      headline: ["Creative. Conversion.", "Paid Media."],
      body: "Three engines planned and optimised together, so every stage of the booking journey is the responsibility of one team.",
    },
    partnership: {
      eyebrow: "The partnership",
      headline: ["One Premium Service.", "Twelve Months."],
      body: "Strategy, AI-assisted creative production, scoped landing pages and daily campaign management across Google, Meta and TikTok.",
    },
    faqHeadline: ["Common", "Questions."],
    /** Indexes into faq.items shown on the case study page. */
    faqPick: [0, 1, 4, 5, 8],
    booking: {
      eyebrow: "Growth strategy call",
      headline: ["Let's Look at Your", "Acquisition Economics."],
      body: "A focused conversation about your property, your markets and where paid acquisition can be made more efficient. No obligation, and an honest view on fit.",
      expect: [
        "A review of your current acquisition setup",
        "Where the largest efficiency opportunities are likely to be",
        "Whether a STAYR partnership makes commercial sense",
      ],
      expectLabel: "What to expect",
      placeholderTitle: "Scheduling not configured",
      placeholderBody:
        "Setup placeholder — switch on the built-in scheduler in the admin (Agenda → Disponibilidade), or set NEXT_PUBLIC_BOOKING_URL to an external scheduling link.",
      native: {
        loading: "Loading available times…",
        unavailable: "The calendar could not be loaded. Please refresh the page or try again shortly.",
        none: "There are no open times at the moment. Submit a partnership application and we will come back to you directly.",
        pickDay: "Choose a day",
        pickTime: "Choose a time",
        duration: "min video call",
        timezone: "Times shown in",
        continue: "Continue",
        back: "Change time",
        detailsTitle: "Your details",
        name: "Full name",
        email: "Work email",
        company: "Hotel / company",
        notes: "Anything we should know beforehand?",
        optional: "Optional",
        confirm: "Confirm the Call",
        confirming: "Booking…",
        slotTaken: "That time has just been taken. Please choose another.",
        error: "We couldn't book the call. Please try again.",
        privacy: "We use these details to schedule and prepare the call. See our",
        doneEyebrow: "Call booked",
        doneTitle: "You're in the calendar.",
        doneBody: "Save the invitation so the time is held in your own calendar.",
        addToCalendar: "Add to calendar (.ics)",
        joinLink: "Meeting link",
        calendarTitle: "STAYR — Growth strategy call",
      },
      external: "Open the booking calendar",
      alt: "Prefer to tell us about your property first?",
      altLink: "Submit a partnership application",
      confirmed: "Your call is booked. A confirmation is on its way to your inbox.",
    },
    sticky: "Ready to talk about your property?",
  },

  apply: {
    eyebrow: "Partnership application",
    headline: ["Let's See If We're the", "Right Growth Partner."],
    body: "Tell us about your property and your objectives. Every application is read by the team and assessed on commercial fit — not on size alone.",
    stepsLabel: "What happens next",
    steps: [
      "We review your application and your current digital presence.",
      "If there's a potential fit, we invite you to a growth strategy call.",
      "You receive a clear view of scope, channels and next steps.",
    ],
    fields: {
      fullName: { label: "Full name", placeholder: "Your name" },
      email: { label: "Work email", placeholder: "you@yourhotel.com" },
      company: { label: "Company name", placeholder: "Property or group name" },
      website: { label: "Website URL", placeholder: "yourhotel.com" },
      country: { label: "Country", placeholder: "Where is the business based?" },
      businessType: { label: "Business type" },
      properties: { label: "Number of properties" },
      budget: { label: "Monthly ad budget (approx.)" },
      objective: { label: "Primary business objective" },
      message: {
        label: "Anything else we should know?",
        placeholder: "Markets, seasonality, current challenges…",
        optional: "Optional",
      },
    },
    selectPlaceholder: "Select…",
    options: {
      businessType: [
        "Independent hotel",
        "Boutique hotel",
        "Hotel group or chain",
        "Resort",
        "Aparthotel / serviced apartments",
        "Tourism operator",
        "Travel brand",
        "Other",
      ],
      properties: ["1", "2–5", "6–15", "16–50", "More than 50"],
      budget: [
        "Under €2,500",
        "€2,500–€5,000",
        "€5,000–€10,000",
        "€10,000–€25,000",
        "Over €25,000",
      ],
      objective: [
        "Increase direct bookings",
        "Reduce OTA dependency",
        "Improve paid advertising efficiency",
        "Enter new source markets",
        "Launch or reposition a property",
        "Other",
      ],
      countries: [
        "Portugal",
        "Spain",
        "United Kingdom",
        "France",
        "Italy",
        "Greece",
        "Germany",
        "Netherlands",
        "Ireland",
        "Switzerland",
        "Austria",
        "Croatia",
      ],
    },
    consent:
      "Also send me occasional STAYR insights on hospitality advertising. Optional.",
    privacy: {
      before: "We use these details to assess your application and contact you about it. See our",
      link: "Privacy Policy",
      after: ".",
    },
    submit: "Submit Application",
    submitting: "Sending…",
    budgetNote:
      "There is no automatic cut-off. Budget helps us prepare a relevant conversation.",
    success: {
      eyebrow: "Application received",
      headline: ["Thank You.", "Here's the Next Step."],
      body: "Your application is with the team. If you'd like to move faster, choose a time for a growth strategy call now.",
      caseStudy: "Watch the case study while you wait",
    },
  },

  consent: {
    title: "Your privacy",
    body: "We'd like to use analytics and advertising cookies to understand how this site is used and to measure our own campaigns. Nothing is set unless you accept.",
    accept: "Accept",
    decline: "Decline",
    link: "Privacy Policy",
  },

  notFound: {
    eyebrow: "404",
    headline: ["This Page Is", "Fully Booked."],
    body: "The page you're looking for doesn't exist or has moved.",
    cta: "Back to the homepage",
  },
};

export type Content = typeof en;
