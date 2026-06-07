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
  title: "Sign in — Frontier Biomed",
  description:
    "Partner portal sign in for affiliates, admins, patients, and doctors.",
};

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginPageSkeleton />}>
      <LoginForm />
    </Suspense>
  );
}
