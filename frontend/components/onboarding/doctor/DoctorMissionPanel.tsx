"use client";

import { CheckCircle2, Circle, Play, Sparkles, X } from "lucide-react";
import { useDoctorOnboarding } from "@/context/DoctorOnboardingProvider";
import { DOCTOR_ONBOARDING_AUTO_PLAY } from "@/lib/onboarding/doctor/auto-play";
import { DOCTOR_ONBOARDING_SUBTITLE, DOCTOR_ONBOARDING_TITLE } from "@/lib/onboarding/doctor/config";
import type { DoctorMissionId } from "@/lib/onboarding/doctor/types";
import {
  btnGhostClass,
  btnPrimaryClass,
  shapeStandardsCards,
  typeGuideSubtitle,
  typeGuideTitle,
} from "@/lib/brand/design-system";

const CARD_CLASS = `overflow-hidden ${shapeStandardsCards} border border-deep-teal/15 bg-pure-white shadow-[0_4px_24px_rgba(1,26,36,0.08)]`;

function MissionStatusIcon({ complete, active }: { complete: boolean; active: boolean }) {
  if (complete) {
    return <CheckCircle2 className="size-4 shrink-0 text-pacific-teal" aria-hidden />;
  }
  if (active) {
    return <Sparkles className="size-4 shrink-0 text-pacific-teal" aria-hidden />;
  }
  return <Circle className="size-4 shrink-0 text-deep-teal/25" aria-hidden />;
}

export function DoctorMissionPanel() {
  const {
    missions,
    completedMissionIds,
    activeMissionId,
    isVisible,
    allComplete,
    completedCount,
    startMission,
    continueSetup,
    dismissOnboarding,
    restartTour,
    isAutoPlayActive,
  } = useDoctorOnboarding();

  if (!isVisible) return null;

  const progressPercent = missions.length > 0 ? Math.round((completedCount / missions.length) * 100) : 0;
  const nextMission = missions.find((m) => !completedMissionIds.includes(m.id));

  return (
    <section data-tour="onboarding-checklist" className={CARD_CLASS}>
      <div className="border-b border-deep-teal/8 bg-gradient-to-r from-pacific-teal/8 to-transparent px-5 py-4 sm:px-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className={typeGuideSubtitle}>Clinic launch guide</p>
            <h2 className={`mt-1 ${typeGuideTitle}`}>{DOCTOR_ONBOARDING_TITLE}</h2>
            <p className="mt-1 max-w-2xl text-sm font-light text-deep-teal/65">{DOCTOR_ONBOARDING_SUBTITLE}</p>
          </div>
          <div className="relative z-[10100] flex items-center gap-2">
            <button type="button" onClick={dismissOnboarding} className={btnGhostClass} aria-label="Dismiss setup guide">
              <X className="size-4" />
            </button>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-4">
          <div
            className="relative flex size-14 shrink-0 items-center justify-center rounded-full border-2 border-pacific-teal/30 bg-pure-white"
            aria-label={`${progressPercent}% complete`}
          >
            <svg className="absolute inset-0 size-full -rotate-90" viewBox="0 0 36 36" aria-hidden>
              <circle cx="18" cy="18" r="15.5" fill="none" className="stroke-deep-teal/10" strokeWidth="3" />
              <circle
                cx="18"
                cy="18"
                r="15.5"
                fill="none"
                className="stroke-pacific-teal transition-all duration-500"
                strokeWidth="3"
                strokeDasharray={`${progressPercent} 100`}
                strokeLinecap="round"
                pathLength={100}
              />
            </svg>
            <span className="font-sans text-sm font-light text-deep-teal">{progressPercent}%</span>
          </div>
          <div>
            <p className="text-sm font-light text-deep-teal">
              {allComplete ? "All missions complete" : `${completedCount} of ${missions.length} missions done`}
            </p>
            {!allComplete && nextMission ? (
              <p className="text-xs text-deep-teal/55">
                {isAutoPlayActive && DOCTOR_ONBOARDING_AUTO_PLAY
                  ? "Guided setup in progress…"
                  : `Up next: ${nextMission.title}`}
              </p>
            ) : null}
          </div>
        </div>
      </div>

      <div className="px-4 py-4 sm:px-5">
        <ol className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          {missions.map((mission) => {
            const complete = completedMissionIds.includes(mission.id);
            const active = activeMissionId === mission.id;
            return (
              <li key={mission.id} className="min-w-0">
                <button
                  type="button"
                  onClick={() => startMission(mission.id as DoctorMissionId)}
                  className={`flex h-full w-full flex-col gap-2 rounded-xl border px-3 py-3 text-left transition-colors ${
                    active
                      ? "border-pacific-teal/40 bg-pacific-teal/10"
                      : complete
                        ? "border-pacific-teal/20 bg-pacific-teal/5"
                        : "border-deep-teal/10 bg-surface-muted/30 hover:border-deep-teal/20"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <MissionStatusIcon complete={complete} active={active} />
                    <span className="text-[10px] font-light uppercase tracking-wide text-deep-teal/45">
                      {mission.stageLabel}
                    </span>
                  </div>
                  <span className="line-clamp-2 text-sm font-light leading-snug text-deep-teal">{mission.title}</span>
                  <span className="text-[10px] text-deep-teal/45">~{mission.estimatedMinutes} min</span>
                </button>
              </li>
            );
          })}
        </ol>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-deep-teal/8 px-5 py-3 sm:px-6">
        <p className="text-xs text-deep-teal/50">
          {allComplete
            ? "Your clinic portal is fully configured. Replay any mission anytime."
            : "Guided tours walk you through each area and verify your progress."}
        </p>
        <div className="flex items-center gap-2">
          {!allComplete ? (
            <button type="button" onClick={continueSetup} className={btnPrimaryClass}>
              <Play className="mr-1.5 inline size-3.5" aria-hidden />
              Continue setup
            </button>
          ) : (
            <button type="button" onClick={restartTour} className={btnPrimaryClass}>
              Restart guide
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
