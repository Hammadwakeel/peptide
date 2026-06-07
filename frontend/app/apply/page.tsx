import dynamic from "next/dynamic";
import { LoginPageSkeleton } from "@/components/skeletons/LoginPageSkeleton";

const ClinicApplicationWizard = dynamic(
  () =>
    import("@/components/apply/ClinicApplicationWizard").then(
      (mod) => mod.ClinicApplicationWizard,
    ),
  { loading: () => <LoginPageSkeleton /> },
);

export const metadata = {
  title: "Clinic application — Frontier Biomed",
  description: "Multi-step provider clinic application for the Frontier Biomed partner portal.",
};

export default function ApplyPage() {
  return <ClinicApplicationWizard />;
}
