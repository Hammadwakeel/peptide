import { Hero } from "@/components/landing/hero";
import { PartnerNetwork } from "@/components/landing/PartnerNetwork";
import { PlatformOverview } from "@/components/landing/PlatformOverview";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { VerifiedSafety } from "@/components/landing/VerifiedSafety";
import { TheCatalog } from "@/components/landing/TheCatalog";
import { GetPaidForEveryOrder } from "@/components/landing/GetPaidForEveryOrder";
import { CtaBand } from "@/components/landing/CtaBand";
import { ComplianceFaq } from "@/components/landing/ComplianceFaq";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { Footer } from "@/components/landing/Footer";

export function LandingPageContent() {
  return (
    <main className="bg-pure-white font-sans text-deep-teal">
      <Hero />
      <PartnerNetwork />
      <PlatformOverview />
      <HowItWorks />
      <VerifiedSafety />
      <TheCatalog />
      <GetPaidForEveryOrder />
      <CtaBand />
      <ComplianceFaq />
      <FinalCTA />
      <Footer />
    </main>
  );
}
