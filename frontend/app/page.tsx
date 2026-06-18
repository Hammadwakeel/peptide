import { LandingPageGate } from "@/components/landing/LandingPageGate";
import { LandingPageContent } from "@/components/landing/LandingPageContent";

export default function LandingPage() {
  return (
    <LandingPageGate>
      <LandingPageContent />
    </LandingPageGate>
  );
}
