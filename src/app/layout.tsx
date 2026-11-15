import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import { FunnelProvider } from "@/components/providers/funnel-provider";
import { site } from "@/config/site";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — ${site.descriptor}`,
    template: `%s — ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  keywords: [
    "hotel advertising agency",
    "hospitality paid advertising",
    "hotel direct bookings",
    "Google Ads for hotels",
    "Meta Ads for hotels",
    "TikTok Ads for hotels",
    "reduce OTA dependency",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: site.name,
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
    url: "/",
    locale: "en_GB",
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0c111b",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: site.name,
  description: site.description,
  url: site.url,
  slogan: site.tagline,
  areaServed: ["Portugal", "Spain", "United Kingdom", "Europe"],
  knowsAbout: [
    "Hotel advertising",
    "Google Ads",
    "Meta Ads",
    "TikTok Ads",
    "Direct booking acquisition",
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang={site.locale}
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} antialiased`}
    >
      <body className="min-h-dvh overflow-x-clip">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-full focus:bg-lime focus:px-5 focus:py-3 focus:text-sm focus:font-medium focus:text-ink"
        >
          Skip to content
        </a>
        <FunnelProvider>{children}</FunnelProvider>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd).replace(/</g, "\\u003c"),
          }}
        />
      </body>
    </html>
  );
}
