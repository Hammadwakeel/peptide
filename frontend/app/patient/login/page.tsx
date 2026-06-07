import { PatientLoginForm } from "@/components/patient-login/PatientLoginForm";

export const metadata = {
  title: "Patient sign in — Frontier Wellness",
  description: "Sign in to your clinic patient portal.",
};

export default function PatientLoginPage() {
  return <PatientLoginForm />;
}
