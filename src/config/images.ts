/**
 * Placeholder photography.
 *
 * Every image on the site is referenced from here so that owned / licensed
 * hospitality photography can be swapped in from one file. The current
 * sources are Unsplash placeholders — replace before launch.
 */
// Ask Unsplash for a sensibly sized source; next/image resizes from there.
const u = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=2880&q=85`;

export type SiteImage = { src: string; alt: string; position?: string };

export const images = {
  hero: {
    src: u("1571896349842-33c89424de2d"),
    alt: "Resort villas reflected in a still pool at dusk",
    position: "50% 60%",
  },
  operators: {
    src: u("1551882547-ff40c63fe5fa"),
    alt: "Hotel terrace and pool beneath palm trees at sunset",
    position: "50% 50%",
  },
  caseStudy: {
    src: u("1561501900-3701fa6a0864"),
    alt: "Infinity pool overlooking a coastline at dusk",
    position: "50% 55%",
  },
  finalCta: {
    src: u("1542314831-068cd1dbfeeb"),
    alt: "Symmetrical resort entrance and pool at blue hour",
    position: "50% 50%",
  },
  apply: {
    src: u("1596394516093-501ba68a0ba6"),
    alt: "Daybed on a terrace overlooking a mountain lake",
    position: "50% 50%",
  },
  // Used inside the product-style mock visuals (ad creative, landing page)
  creative: {
    src: u("1520250497591-112f2f40a3f4"),
    alt: "Tropical resort pool surrounded by palms",
    position: "50% 50%",
  },
  creativeAlt: {
    src: u("1584132967334-10e028bd69f7"),
    alt: "Wooden deck and sea pool in morning light",
    position: "50% 50%",
  },
  landing: {
    src: u("1582719478250-c89cae4dc85b"),
    alt: "Hotel suite opening onto a private pool",
    position: "50% 50%",
  },
  segments: {
    independent: {
      src: u("1517840901100-8179e982acb7"),
      alt: "Illuminated hotel sign against a night sky",
      position: "50% 50%",
    },
    boutique: {
      src: u("1611892440504-42a792e24d32"),
      alt: "Warmly lit boutique hotel bedroom",
      position: "50% 50%",
    },
    groups: {
      src: u("1455587734955-081b22074882"),
      alt: "White hotel facade with balconies and palm trees",
      position: "50% 50%",
    },
    resorts: {
      src: u("1540541338287-41700207dee6"),
      alt: "Aerial view of a coastal resort and its pools",
      position: "50% 50%",
    },
    apartments: {
      src: u("1502672260266-1c1ef2d93688"),
      alt: "Bright serviced apartment living room",
      position: "50% 50%",
    },
    travel: {
      src: u("1476514525535-07fb3b4ae5f1"),
      alt: "Wooden boat on an alpine lake",
      position: "50% 50%",
    },
  },
} as const;
