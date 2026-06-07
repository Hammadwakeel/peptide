import dynamic from "next/dynamic";
import { Suspense } from "react";
import { LoginPageSkeleton } from "@/components/skeletons/LoginPageSkeleton";

const ResetPasswordForm = dynamic(
  () =>
    import("@/components/forgot-password/ResetPasswordForm").then(
      (mod) => mod.ResetPasswordForm,
    ),
  { loading: () => <LoginPageSkeleton /> },
);

export const metadata = {
  title: "Reset password — Frontier Biomed",
  description: "Choose a new password for your Frontier Biomed account.",
};

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<LoginPageSkeleton />}>
      <ResetPasswordForm />
    </Suspense>
  );
}
