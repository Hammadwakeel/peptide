import dynamic from "next/dynamic";
import { Suspense } from "react";
import { LoginPageSkeleton } from "@/components/skeletons/LoginPageSkeleton";

const ForgotPasswordConfirmation = dynamic(
  () =>
    import("@/components/forgot-password/ForgotPasswordConfirmation").then(
      (mod) => mod.ForgotPasswordConfirmation,
    ),
  { loading: () => <LoginPageSkeleton /> },
);

export const metadata = {
  title: "Reset link sent — Frontier Biomed",
  description: "Password reset confirmation for Frontier Biomed accounts.",
};

export default function ForgotPasswordConfirmationPage() {
  return (
    <Suspense fallback={<LoginPageSkeleton />}>
      <ForgotPasswordConfirmation />
    </Suspense>
  );
}
