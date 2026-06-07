import dynamic from "next/dynamic";
import { Suspense } from "react";
import { LoginPageSkeleton } from "@/components/skeletons/LoginPageSkeleton";

const SendOtpForm = dynamic(
  () => import("@/components/login/SendOtpForm").then((mod) => mod.SendOtpForm),
  {
    loading: () => <LoginPageSkeleton />,
  },
);

export const metadata = {
  title: "Send verification code — Frontier Biomed",
  description: "Request a one-time verification code for your Frontier Biomed account.",
};

export default function SendOtpPage() {
  return (
    <Suspense fallback={<LoginPageSkeleton />}>
      <SendOtpForm />
    </Suspense>
  );
}
