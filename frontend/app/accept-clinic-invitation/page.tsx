import dynamic from "next/dynamic";
import { Suspense } from "react";
import { LoginPageSkeleton } from "@/components/skeletons/LoginPageSkeleton";

const AcceptClinicInvitationForm = dynamic(
  () =>
    import("@/components/onboarding/AcceptClinicInvitationForm").then(
      (mod) => mod.AcceptClinicInvitationForm,
    ),
  { loading: () => <LoginPageSkeleton /> },
);

export const metadata = {
  title: "Accept clinic invitation — Frontier Biomed",
  description: "Join your clinic team on Frontier Biomed.",
};

export default function AcceptClinicInvitationPage() {
  return (
    <Suspense fallback={<LoginPageSkeleton />}>
      <AcceptClinicInvitationForm />
    </Suspense>
  );
}
