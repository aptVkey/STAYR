import type { Metadata } from "next";
import { LegalPage } from "@/components/layout/legal-page";
import { terms } from "@/content/legal.en";

export const metadata: Metadata = {
  title: "Terms",
  description: terms.intro,
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return <LegalPage doc={terms} />;
}
