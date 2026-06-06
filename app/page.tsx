import { Hero } from "@/components/landing/hero";
import { Navbar } from "@/components/Navbar";
import { VerificationProcess } from "@/components/landing/VerificationProcess";
import { StandardsOfTrust } from "@/components/landing/StandardsOfTrust";
import { SeamlessIntegration } from "@/components/landing/SeamlessIntegration";
import { ClinicalCommitment } from "@/components/landing/ClinicalCommitment";
import { FinalCTA } from "@/components/landing/FinalCTA";

export default function LandingPage() {
  return (
    <main className="bg-pure-white font-sans text-deep-teal">
      <Navbar />
      <Hero />
      <VerificationProcess />
      <StandardsOfTrust />
      <SeamlessIntegration />
      <ClinicalCommitment />
      <FinalCTA />
    </main>
  );
}
