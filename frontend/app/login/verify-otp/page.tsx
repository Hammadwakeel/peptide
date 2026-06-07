import dynamic from "next/dynamic";
import { Suspense } from "react";
import { LoginPageSkeleton } from "@/components/skeletons/LoginPageSkeleton";

const VerifyOtpForm = dynamic(
  () => import("@/components/login/VerifyOtpForm").then((mod) => mod.VerifyOtpForm),
  {
    loading: () => <LoginPageSkeleton />,
  },
);

export const metadata = {
  title: "Verify email — Frontier Biomed",
  description: "Enter the verification code sent to your email.",
};

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={<LoginPageSkeleton />}>
      <VerifyOtpForm />
    </Suspense>
  );
}
