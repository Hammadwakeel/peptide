import dynamic from "next/dynamic";
import { LandingPageSkeleton } from "@/components/skeletons/LandingPageSkeleton";

const LandingPageContent = dynamic(
  () =>
    import("@/components/landing/LandingPageContent").then(
      (mod) => mod.LandingPageContent,
    ),
  {
    loading: () => <LandingPageSkeleton />,
  },
);

export default function LandingPage() {
  return <LandingPageContent />;
}
