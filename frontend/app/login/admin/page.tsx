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
  title: "Admin sign in — Frontier Biomed",
  description: "Sign in to the Frontier Biomed admin portal.",
};

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<LoginPageSkeleton />}>
      <LoginForm fixedRole="admin" />
    </Suspense>
  );
}
