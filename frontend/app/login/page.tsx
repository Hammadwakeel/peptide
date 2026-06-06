import dynamic from "next/dynamic";
import { LoginPageSkeleton } from "@/components/skeletons/LoginPageSkeleton";

const LoginForm = dynamic(
  () =>
    import("@/components/login/LoginForm").then((mod) => mod.LoginForm),
  {
    loading: () => <LoginPageSkeleton />,
  },
);

export const metadata = {
  title: "Sign in — Frontier Biomed",
  description:
    "Partner Portal access for affiliates, admins, patients, and doctors.",
};

export default function LoginPage() {
  return <LoginForm />;
}
