import dynamic from "next/dynamic";
import { Suspense } from "react";
import { LoginPageSkeleton } from "@/components/skeletons/LoginPageSkeleton";

const AcceptInvitationForm = dynamic(
  () =>
    import("@/components/accept-invitation/AcceptInvitationForm").then(
      (mod) => mod.AcceptInvitationForm,
    ),
  { loading: () => <LoginPageSkeleton /> },
);

export const metadata = {
  title: "Accept invitation — Frontier Biomed",
  description: "Accept your clinic invitation to activate your patient account.",
};

export default function AcceptInvitationPage() {
  return (
    <Suspense fallback={<LoginPageSkeleton />}>
      <AcceptInvitationForm />
    </Suspense>
  );
}
