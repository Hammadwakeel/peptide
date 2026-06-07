import dynamic from "next/dynamic";
import { Suspense } from "react";
import { LoginPageSkeleton } from "@/components/skeletons/LoginPageSkeleton";

const ApplicationSubmitted = dynamic(
  () =>
    import("@/components/apply/ApplicationSubmitted").then(
      (mod) => mod.ApplicationSubmitted,
    ),
  { loading: () => <LoginPageSkeleton /> },
);

export const metadata = {
  title: "Application submitted — Frontier Biomed",
  description: "Your clinic application has been submitted for review.",
};

export default function ApplicationSubmittedPage() {
  return (
    <Suspense fallback={<LoginPageSkeleton />}>
      <ApplicationSubmitted />
    </Suspense>
  );
}
