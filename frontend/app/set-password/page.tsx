import dynamic from "next/dynamic";
import { Suspense } from "react";
import { LoginPageSkeleton } from "@/components/skeletons/LoginPageSkeleton";

const SetPasswordForm = dynamic(
  () =>
    import("@/components/onboarding/SetPasswordForm").then((mod) => mod.SetPasswordForm),
  { loading: () => <LoginPageSkeleton /> },
);

export const metadata = {
  title: "Set password — Frontier Biomed",
  description: "Create your password to activate your Frontier Biomed account.",
};

export default function SetPasswordPage() {
  return (
    <Suspense fallback={<LoginPageSkeleton />}>
      <SetPasswordForm />
    </Suspense>
  );
}
