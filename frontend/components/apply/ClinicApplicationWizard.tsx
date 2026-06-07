"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  AuthCard,
  AuthShell,
  authLinkClassName,
} from "@/components/auth/AuthShell";
import { StepBanking } from "@/components/apply/wizard/StepBanking";
import { StepDocuments } from "@/components/apply/wizard/StepDocuments";
import { StepESign } from "@/components/apply/wizard/StepESign";
import { StepPracticeInfo } from "@/components/apply/wizard/StepPracticeInfo";
import { WizardStepper } from "@/components/apply/wizard/WizardStepper";
import {
  INITIAL_BANKING,
  INITIAL_DOCUMENTS,
  INITIAL_PRACTICE,
  type ApplicationWizardState,
} from "@/lib/apply/types";
import { mockSubmitApplication } from "@/lib/apply/mock-submit";
import {
  validateBankingStep,
  validateDocumentsStep,
  validatePracticeStep,
} from "@/lib/apply/validation";
import { showError, toast } from "@/lib/toast";

export function ClinicApplicationWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [state, setState] = useState<ApplicationWizardState>({
    practice: INITIAL_PRACTICE,
    documents: INITIAL_DOCUMENTS,
    banking: INITIAL_BANKING,
    eSignCompleted: false,
  });

  function goNext() {
    if (step === 1) {
      const error = validatePracticeStep(state.practice);
      if (error) return showError(new Error(error));
    }
    if (step === 2) {
      const error = validateDocumentsStep(state.documents);
      if (error) return showError(new Error(error));
    }
    if (step === 3) {
      const error = validateBankingStep(state.banking);
      if (error) return showError(new Error(error));
    }
    setStep((current) => Math.min(current + 1, 4));
  }

  function goBack() {
    setStep((current) => Math.max(current - 1, 1));
  }

  async function handleSubmit() {
    if (!state.eSignCompleted) {
      showError(new Error("Complete the e-signature before submitting."));
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading("Submitting application…");
    try {
      await mockSubmitApplication(state);
      toast.dismiss(toastId);
      router.push("/apply/submitted");
    } catch (error) {
      toast.dismiss(toastId);
      showError(error, "Unable to submit application.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthShell background="merch-jacket" compact>
      <AuthCard compact>
        <div className="mb-4">
          <span className="font-mono text-[10px] uppercase tracking-[0.35em] text-pacific-teal">
            Provider onboarding
          </span>
          <h1 className="mt-2 font-serif text-xl font-light tracking-[-0.02em] text-deep-teal sm:text-2xl">
            Clinic application
          </h1>
        </div>

        <WizardStepper currentStep={step} />

        {step === 1 ? (
          <StepPracticeInfo
            value={state.practice}
            onChange={(practice) => setState((current) => ({ ...current, practice }))}
          />
        ) : null}
        {step === 2 ? (
          <StepDocuments
            value={state.documents}
            onChange={(documents) => setState((current) => ({ ...current, documents }))}
          />
        ) : null}
        {step === 3 ? (
          <StepBanking
            value={state.banking}
            onChange={(banking) => setState((current) => ({ ...current, banking }))}
          />
        ) : null}
        {step === 4 ? (
          <StepESign
            completed={state.eSignCompleted}
            onComplete={() => setState((current) => ({ ...current, eSignCompleted: true }))}
            clinicName={state.practice.clinicName}
            contactName={state.practice.contactName}
          />
        ) : null}

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          {step > 1 ? (
            <button
              type="button"
              onClick={goBack}
              className="rounded-full border border-deep-teal/15 px-5 py-2.5 text-sm font-medium text-deep-teal hover:border-pacific-teal"
            >
              Back
            </button>
          ) : (
            <Link href="/login" className={`text-sm ${authLinkClassName}`}>
              Back to sign in
            </Link>
          )}

          {step < 4 ? (
            <button
              type="button"
              onClick={goNext}
              className="ml-auto rounded-full bg-deep-teal px-5 py-2.5 text-sm font-medium text-pure-white hover:bg-pacific-teal"
            >
              Continue
            </button>
          ) : (
            <button
              type="button"
              onClick={() => void handleSubmit()}
              disabled={isSubmitting || !state.eSignCompleted}
              className="ml-auto rounded-full bg-deep-teal px-5 py-2.5 text-sm font-medium text-pure-white hover:bg-pacific-teal disabled:opacity-60"
            >
              {isSubmitting ? "Submitting…" : "Submit application"}
            </button>
          )}
        </div>
      </AuthCard>
    </AuthShell>
  );
}
