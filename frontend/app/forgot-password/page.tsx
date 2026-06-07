import dynamic from "next/dynamic";
import { Suspense } from "react";
import { LoginPageSkeleton } from "@/components/skeletons/LoginPageSkeleton";

const ForgotPasswordForm = dynamic(
  () =>
    import("@/components/forgot-password/ForgotPasswordForm").then(
      (mod) => mod.ForgotPasswordForm,
    ),
  { loading: () => <LoginPageSkeleton /> },
);

export const metadata = {
  title: "Forgot password — Frontier Biomed",
  description: "Request a password reset link for your Frontier Biomed account.",
};

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<LoginPageSkeleton />}>
      <ForgotPasswordForm />
    </Suspense>
  );
}
