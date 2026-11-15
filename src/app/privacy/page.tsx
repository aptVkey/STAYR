import type { Metadata } from "next";
import { LegalPage } from "@/components/layout/legal-page";
import { privacy } from "@/content/legal.en";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: privacy.intro,
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return <LegalPage doc={privacy} />;
}
