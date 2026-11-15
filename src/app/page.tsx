import { TrackView } from "@/components/funnel/track-view";
import { AiAdvantage } from "@/components/home/ai-advantage";
import { CaseStudyTeaser } from "@/components/home/case-study-teaser";
import { FaqSection } from "@/components/home/faq-section";
import { FinalCta } from "@/components/home/final-cta";
import { Hero } from "@/components/home/hero";
import { Operators } from "@/components/home/operators";
import { Partnership } from "@/components/home/partnership";
import { Problem } from "@/components/home/problem";
import { Process } from "@/components/home/process";
import { Revenue } from "@/components/home/revenue";
import { System } from "@/components/home/system";
import { Who } from "@/components/home/who";
import { MobileCta } from "@/components/layout/mobile-cta";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

/**
 * Homepage — a single conversion journey:
 * problem → economics → system → authority → proof of method → offer → action.
 */
export default function HomePage() {
  return (
    <>
      <TrackView event="homepage_view" />
      <SiteHeader />
      <main id="main">
        <Hero />
        <Problem />
        <Revenue />
        <System />
        <Operators />
        <AiAdvantage />
        <Who />
        <CaseStudyTeaser />
        <Process />
        <Partnership />
        <FaqSection />
        <FinalCta />
      </main>
      <SiteFooter />
      <MobileCta />
    </>
  );
}
