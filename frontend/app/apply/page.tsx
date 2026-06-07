import dynamic from "next/dynamic";
import { LoginPageSkeleton } from "@/components/skeletons/LoginPageSkeleton";

const ProviderApplicationForm = dynamic(
  () =>
    import("@/components/apply/ProviderApplicationForm").then(
      (mod) => mod.ProviderApplicationForm,
    ),
  { loading: () => <LoginPageSkeleton /> },
);

export const metadata = {
  title: "Clinic application — Frontier Biomed",
  description: "Apply for provider access to the Frontier Biomed partner portal.",
};

export default function ApplyPage() {
  return <ProviderApplicationForm />;
}
