"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  AuthCard,
  AuthShell,
  authLinkClassName,
} from "@/components/auth/AuthShell";
import { StepBanking } from "@/components/apply/wizard/StepBanking";
import { StepDocuments } from "@/components/apply/wizard/StepDocuments";
import { StepPracticeInfo } from "@/components/apply/wizard/StepPracticeInfo";
import { WizardStepper } from "@/components/apply/wizard/WizardStepper";
import { submitClinicApplication, uploadClinicDocuments } from "@/lib/apply/api";
import { storeApplicationSummary } from "@/lib/apply/storage";
import {
  INITIAL_BANKING,
  INITIAL_DOCUMENTS,
  INITIAL_PRACTICE,
  type ApplicationWizardState,
} from "@/lib/apply/types";
import {
  validateApplicationState,
  validateBankingStep,
  validateDocumentsStep,
  validatePracticeStep,
} from "@/lib/apply/validation";
import { showError, toast } from "@/lib/toast";

const FINAL_STEP = 3;

export function ClinicApplicationWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [state, setState] = useState<ApplicationWizardState>({
    practice: {
      ...INITIAL_PRACTICE,
      affiliateCode: searchParams.get("ref") ?? searchParams.get("affiliate") ?? "",
    },
    documents: INITIAL_DOCUMENTS,
    banking: INITIAL_BANKING,
  });

  useEffect(() => {
    const affiliateCode = searchParams.get("ref") ?? searchParams.get("affiliate");
    if (!affiliateCode) return;
    setState((current) => ({
      ...current,
      practice: { ...current.practice, affiliateCode },
    }));
  }, [searchParams]);

  function goNext() {
    if (step === 1) {
      const error = validatePracticeStep(state.practice);
      if (error) return showError(new Error(error));
    }
    if (step === 2) {
      const error = validateDocumentsStep(state.documents);
      if (error) return showError(new Error(error));
    }
    setStep((current) => Math.min(current + 1, FINAL_STEP));
  }

  function goBack() {
    setStep((current) => Math.max(current - 1, 1));
  }

  async function handleSubmit() {
    const validationError = validateApplicationState(state);
    if (validationError) {
      showError(new Error(validationError));
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading("Submitting application…");

    try {
      const applyResult = await submitClinicApplication(state);
      storeApplicationSummary(applyResult.application);

      toast.dismiss(toastId);
      const uploadToastId = toast.loading("Uploading documents…");
      const uploadResult = await uploadClinicDocuments(
        applyResult.application.id,
        state.documents,
      );

      storeApplicationSummary({
        ...applyResult.application,
        application_status: uploadResult.application.application_status,
      });

      toast.dismiss(uploadToastId);
      toast.success(uploadResult.message);
      router.push(`/apply/submitted?ref=${applyResult.application.id}`);
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

          {step < FINAL_STEP ? (
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
              disabled={isSubmitting}
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
