"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ApplyJoyride } from "@/components/onboarding/JoyrideTour";
import { ApplyShell } from "@/components/apply/ApplyShell";
import { StepBanking } from "@/components/apply/wizard/StepBanking";
import { StepDocuments } from "@/components/apply/wizard/StepDocuments";
import { StepPracticeInfo } from "@/components/apply/wizard/StepPracticeInfo";
import { motion, transition } from "@/components/motion";
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

  function selectTab(nextStep: number) {
    if (nextStep === step) return;

    if (nextStep > step) {
      for (let current = step; current < nextStep; current += 1) {
        if (current === 1) {
          const error = validatePracticeStep(state.practice);
          if (error) return showError(new Error(error));
        }
        if (current === 2) {
          const error = validateDocumentsStep(state.documents);
          if (error) return showError(new Error(error));
        }
      }
    }

    setStep(nextStep);
  }

  async function handleSubmit() {
    const validationError = validateApplicationState(state);
    if (validationError) {
      showError(new Error(validationError));
      return;
    }

    const bankingError = validateBankingStep(state.banking);
    if (bankingError) {
      showError(new Error(bankingError));
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

  const footer = (
    <>
      <Link
        href="/login"
        className="text-sm font-medium text-deep-teal/55 transition-colors hover:text-deep-teal"
      >
        Already have an account? Sign in
      </Link>

      {step < FINAL_STEP ? (
        <button
          type="button"
          onClick={() => selectTab(step + 1)}
          className="ml-auto rounded-full bg-deep-teal px-7 py-3 text-sm font-medium text-pure-white shadow-lg shadow-deep-teal/15 transition-all hover:bg-pacific-teal"
        >
          Next: {step === 1 ? "Documents" : "Banking"}
        </button>
      ) : (
        <button
          type="button"
          onClick={() => void handleSubmit()}
          disabled={isSubmitting}
          className="ml-auto rounded-full bg-deep-teal px-7 py-3 text-sm font-medium text-pure-white shadow-lg shadow-deep-teal/15 transition-all hover:bg-pacific-teal disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Submitting…" : "Submit application"}
        </button>
      )}
    </>
  );

  return (
    <ApplyShell currentStep={step} onTabChange={selectTab} footer={footer}>
      <ApplyJoyride />
      <motion.div
        key={step}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={transition}
        className="flex h-full min-h-0 flex-col"
      >
        <div className="h-full min-h-0 flex-1">
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
        </div>
      </motion.div>
    </ApplyShell>
  );
}
