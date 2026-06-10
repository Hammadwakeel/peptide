import dynamic from "next/dynamic";
import { Suspense } from "react";
import { LoginPageSkeleton } from "@/components/skeletons/LoginPageSkeleton";

const LoginForm = dynamic(
  () => import("@/components/login/LoginForm").then((mod) => mod.LoginForm),
  {
    loading: () => <LoginPageSkeleton />,
  },
);

export const metadata = {
  title: "Affiliate sign in — Frontier Biomed",
  description: "Sign in to the Frontier Biomed affiliate portal.",
};

export default function AffiliateLoginPage() {
  return (
    <Suspense fallback={<LoginPageSkeleton />}>
      <LoginForm fixedRole="affiliate" />
    </Suspense>
  );
}
