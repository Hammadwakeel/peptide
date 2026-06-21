"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { GuidedTourEngine } from "@/components/onboarding/GuidedTourEngine";
import { useAuth } from "@/context/AuthProvider";
import { useOrders } from "@/context/OrdersProvider";
import { usePatients } from "@/context/PatientsProvider";
import { useProviderPortal } from "@/context/ProviderPortalProvider";
import { listClinicMembers } from "@/lib/doctor/api";
import type { ClinicPermission, ClinicProfileResponse } from "@/lib/doctor/clinic-types";
import { DOCTOR_MISSIONS } from "@/lib/onboarding/doctor/config";
import {
  evaluateDoctorMissionCompletion,
  getApplicableDoctorMissions,
} from "@/lib/onboarding/doctor/predicates";
import { getDoctorMissionTourSteps } from "@/lib/onboarding/doctor/tour-steps";
import { DOCTOR_ONBOARDING_EVENTS } from "@/lib/onboarding/doctor/events";
import {
  DOCTOR_ONBOARDING_AUTO_PLAY,
  DOCTOR_ONBOARDING_MISSION_CHAIN_DELAY_MS,
  DOCTOR_ONBOARDING_STEP_DELAY_MS,
} from "@/lib/onboarding/doctor/auto-play";
import { runDoctorOnboardingDemoAction } from "@/lib/onboarding/doctor/demo-simulator";
import { getNextIncompleteMission } from "@/lib/onboarding/doctor/mission-utils";
import type { DoctorMission, DoctorMissionId, GuidedTourStep } from "@/lib/onboarding/doctor/types";
import { useShallow } from "@/lib/hooks/zustand";
import { toast } from "@/lib/toast";
import {
  NORMALIZED_EMPTY_DOCTOR_PROGRESS,
  normalizeDoctorProgress,
  useOnboardingStore,
} from "@/stores/onboarding-store";
import { useProviderPortalStore } from "@/stores/provider-portal-store";

type DoctorOnboardingContextValue = {
  missions: DoctorMission[];
  completedMissionIds: DoctorMissionId[];
  activeMissionId: DoctorMissionId | null;
  activeStepIndex: number;
  isVisible: boolean;
  allComplete: boolean;
  completedCount: number;
  profile: ClinicProfileResponse | null;
  permissions: ClinicPermission[];
  tourRunToken: number;
  startMission: (missionId: DoctorMissionId) => void;
  continueSetup: () => void;
  dismissOnboarding: () => void;
  restartTour: () => void;
  syncFromSnapshot: () => Promise<void>;
  isAutoPlayActive: boolean;
};

const DoctorOnboardingContext = createContext<DoctorOnboardingContextValue | null>(null);

const DOCTOR_DASHBOARD_PATH = "/portal/doctor";
const DASHBOARD_READY_FALLBACK_MS = 4_000;
const WORKSPACE_KICKOFF_DELAY_MS = 1_200;
const EMPTY_PERMISSIONS: ClinicPermission[] = [];

export function DoctorOnboardingProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { orders } = useOrders();
  const { patients } = usePatients();
  const { myStore } = useProviderPortal();
  const clinicProfile = useProviderPortalStore((state) => state.clinicProfile);
  const [memberCount, setMemberCount] = useState(1);
  const [pendingInviteCount, setPendingInviteCount] = useState(0);
  const membersLoadedRef = useRef(false);
  const [tourRunToken, setTourRunToken] = useState(0);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [storeHydrated, setStoreHydrated] = useState(
    () => useOnboardingStore.persist.hasHydrated(),
  );
  const [dashboardReady, setDashboardReady] = useState(false);
  const autoKickoffRef = useRef(false);

  const userId = session?.userId;
  const progressKey = userId ? `${userId}:doctor` : "";
  const storedProgress = useOnboardingStore((state) =>
    progressKey ? state.progressByKey[progressKey] : undefined,
  );
  const progress = useMemo(() => {
    if (!userId) return null;
    if (!storedProgress) return NORMALIZED_EMPTY_DOCTOR_PROGRESS;
    return normalizeDoctorProgress(storedProgress);
  }, [userId, storedProgress]);

  const storeActions = useOnboardingStore(
    useShallow((state) => ({
      completeDoctorMission: state.completeDoctorMission,
      setActiveDoctorMission: state.setActiveDoctorMission,
      markDoctorRouteVisited: state.markDoctorRouteVisited,
      syncDoctorMissions: state.syncDoctorMissions,
      dismiss: state.dismiss,
      triggerJoyride: state.triggerJoyride,
      setDoctorProgress: state.setDoctorProgress,
      completeJoyride: state.completeJoyride,
      restartDoctorGuide: state.restartDoctorGuide,
    })),
  );
  const profile = clinicProfile;
  const permissions = profile?.membership.permissions ?? EMPTY_PERMISSIONS;
  const permissionsKey = permissions.join(",");
  const missions = useMemo(
    () => getApplicableDoctorMissions(permissions),
    [permissionsKey],
  );

  const completedMissionIds = progress?.completedMissionIds ?? NORMALIZED_EMPTY_DOCTOR_PROGRESS.completedMissionIds!;
  const activeMissionId = progress?.activeMissionId ?? null;
  const visitedRoutes = progress?.visitedRoutes ?? NORMALIZED_EMPTY_DOCTOR_PROGRESS.visitedRoutes!;
  const visitedRoutesKey = visitedRoutes.join("\0");
  const isDismissed = progress?.dismissed ?? false;
  const setupGuideKickoff = progress?.setupGuideKickoff ?? false;
  const isVisible = Boolean(session) && !isDismissed;
  const completedCount = missions.filter((m) => completedMissionIds.includes(m.id)).length;
  const allComplete = missions.length > 0 && completedCount === missions.length;
  const guidedOnboardingActive =
    DOCTOR_ONBOARDING_AUTO_PLAY && setupGuideKickoff && !allComplete && !isDismissed;

  useEffect(() => {
    if (storeHydrated) return;
    const unsub = useOnboardingStore.persist.onFinishHydration(() => setStoreHydrated(true));
    return unsub;
  }, [storeHydrated]);

  useEffect(() => {
    if (pathname !== DOCTOR_DASHBOARD_PATH) {
      setDashboardReady(false);
      return;
    }

    setDashboardReady(false);

    function handleDashboardReady() {
      setDashboardReady(true);
    }

    window.addEventListener(DOCTOR_ONBOARDING_EVENTS.dashboardReady, handleDashboardReady);
    const fallbackTimer = window.setTimeout(() => {
      setDashboardReady(true);
    }, DASHBOARD_READY_FALLBACK_MS);

    return () => {
      window.removeEventListener(DOCTOR_ONBOARDING_EVENTS.dashboardReady, handleDashboardReady);
      window.clearTimeout(fallbackTimer);
    };
  }, [pathname]);

  const visibleStoreCount = useMemo(
    () => myStore.filter((p) => p.is_visible).length,
    [myStore],
  );

  const pendingReviewCount = useMemo(
    () => orders.filter((o) => o.reviewStatus === "pending_review").length,
    [orders],
  );

  const snapshot = useMemo(
    () => ({
      profile,
      storeCount: myStore.length,
      visibleStoreCount,
      patientCount: patients.length,
      memberCount,
      pendingInviteCount,
      pendingReviewCount,
      visitedRoutes,
    }),
    [
      profile,
      myStore.length,
      visibleStoreCount,
      patients.length,
      memberCount,
      pendingInviteCount,
      pendingReviewCount,
      visitedRoutesKey,
    ],
  );

  const syncFromSnapshot = useCallback(async () => {
    if (!session) return;
    try {
      await useProviderPortalStore.getState().refreshClinicProfile();
      const profileData = useProviderPortalStore.getState().clinicProfile;
      if (!profileData) return;

      const snap = {
        profile: profileData,
        storeCount: myStore.length,
        visibleStoreCount,
        patientCount: patients.length,
        memberCount,
        pendingInviteCount,
        pendingReviewCount,
        visitedRoutes,
      };

      if (!guidedOnboardingActive) {
        const autoCompleted = missions
          .filter((m) => evaluateDoctorMissionCompletion(m.id, snap))
          .map((m) => m.id)
          .filter((id) => !completedMissionIds.includes(id));
        storeActions.syncDoctorMissions(session.userId, autoCompleted);
      }
    } catch {
      // optional sync
    }
  }, [
    session,
    myStore.length,
    visibleStoreCount,
    patients.length,
    memberCount,
    pendingInviteCount,
    pendingReviewCount,
    visitedRoutesKey,
    missions,
    storeActions,
    guidedOnboardingActive,
    completedMissionIds,
  ]);

  const loadMembersIfNeeded = useCallback(async () => {
    if (membersLoadedRef.current) return;
    try {
      const membersData = await listClinicMembers();
      membersLoadedRef.current = true;
      setMemberCount(membersData.members.length);
      setPendingInviteCount(membersData.pending_invitations.length);
    } catch {
      // optional
    }
  }, []);

  useEffect(() => {
    const needsMembers =
      pathname.startsWith("/portal/doctor/users") || activeMissionId === "team";
    if (needsMembers) void loadMembersIfNeeded();
  }, [pathname, activeMissionId, loadMembersIfNeeded]);

  useEffect(() => {
    void syncFromSnapshot();
  }, [syncFromSnapshot]);

  useEffect(() => {
    if (!session || !pathname.startsWith("/portal/doctor")) return;
    const route = pathname.split("?")[0]!;
    storeActions.markDoctorRouteVisited(session.userId, route);
  }, [session, pathname, storeActions]);

  useEffect(() => {
    if (!session || guidedOnboardingActive) return;
    const autoCompleted = missions
      .filter((m) => evaluateDoctorMissionCompletion(m.id, snapshot))
      .map((m) => m.id)
      .filter((id) => !completedMissionIds.includes(id));
    if (autoCompleted.length > 0) {
      storeActions.syncDoctorMissions(session.userId, autoCompleted);
    }
  }, [session, missions, snapshot, storeActions, guidedOnboardingActive, completedMissionIds]);

  const tourSteps = useMemo(() => {
    if (!activeMissionId) return [];
    return getDoctorMissionTourSteps(activeMissionId, {
      hasPendingOrders: pendingReviewCount > 0,
      canEditBanking: permissions.includes("edit_banking"),
      canInvitePatients: permissions.includes("invite_patients"),
      canManageMembers: permissions.includes("manage_members"),
    });
  }, [activeMissionId, pendingReviewCount, permissions]);

  const startMission = useCallback(
    (missionId: DoctorMissionId) => {
      if (!session) return;
      const mission = DOCTOR_MISSIONS.find((m) => m.id === missionId);
      if (!mission) return;
      storeActions.setDoctorProgress(session.userId, { setupGuideKickoff: true });
      storeActions.setActiveDoctorMission(session.userId, missionId, 0);
      setActiveStepIndex(0);
      setTourRunToken((t) => t + 1);
      storeActions.triggerJoyride();
      if (pathname !== mission.route) {
        router.push(mission.route);
      }
    },
    [session, storeActions, pathname, router],
  );

  const continueSetup = useCallback(() => {
    const next = getNextIncompleteMission(missions, completedMissionIds);
    if (next) startMission(next.id);
  }, [missions, completedMissionIds, startMission]);

  const handleDemoAction = useCallback(
    (step: GuidedTourStep) => {
      if (step.advanceEvent === DOCTOR_ONBOARDING_EVENTS.memberInvited) {
        setPendingInviteCount((count) => count + 1);
      }
      runDoctorOnboardingDemoAction(step);
    },
    [],
  );

  const dismissOnboarding = useCallback(() => {
    if (!session) return;
    autoKickoffRef.current = true;
    storeActions.setActiveDoctorMission(session.userId, null, 0);
    storeActions.dismiss(session.userId, "doctor");
    setActiveStepIndex(0);
  }, [session, storeActions]);

  const restartTour = useCallback(() => {
    if (!session) return;
    storeActions.restartDoctorGuide(session.userId);
    autoKickoffRef.current = false;
    setActiveStepIndex(0);
    const first = missions[0];
    if (first) startMission(first.id);
  }, [session, storeActions, missions, startMission]);

  const handleStepChange = useCallback(
    (index: number) => {
      setActiveStepIndex(index);
      if (session && activeMissionId) {
        storeActions.setActiveDoctorMission(session.userId, activeMissionId, index);
      }
    },
    [session, activeMissionId, storeActions],
  );

  useEffect(() => {
    if (!session || !storeHydrated) return;
    if (pathname !== DOCTOR_DASHBOARD_PATH) return;
    if (isDismissed || allComplete) return;
    if (activeMissionId) return;
    if (autoKickoffRef.current) return;
    if (!dashboardReady) return;

    const nextMission = getNextIncompleteMission(missions, completedMissionIds);
    if (!nextMission) return;

    const timer = window.setTimeout(() => {
      if (autoKickoffRef.current) return;
      autoKickoffRef.current = true;
      startMission(nextMission.id);
    }, WORKSPACE_KICKOFF_DELAY_MS);

    return () => window.clearTimeout(timer);
  }, [
    session,
    storeHydrated,
    pathname,
    isDismissed,
    allComplete,
    activeMissionId,
    dashboardReady,
    missions,
    completedMissionIds,
    startMission,
  ]);

  const handleTourComplete = useCallback(() => {
    if (!session || !activeMissionId) return;
    storeActions.completeDoctorMission(session.userId, activeMissionId);
    const mission = DOCTOR_MISSIONS.find((m) => m.id === activeMissionId);
    toast.success(`${mission?.title ?? "Mission"} complete.`);

    const updatedCompleted = Array.from(
      new Set([...completedMissionIds, activeMissionId]),
    );
    const remaining = missions.filter((m) => !updatedCompleted.includes(m.id));

    setActiveStepIndex(0);
    storeActions.setDoctorProgress(session.userId, { activeMissionId: null, activeStepIndex: 0 });

    if (remaining.length === 0) {
      storeActions.completeJoyride(session.userId, "doctor");
      return;
    }

    if (DOCTOR_ONBOARDING_AUTO_PLAY) {
      const next = remaining[0];
      if (next) {
        window.setTimeout(() => startMission(next.id), DOCTOR_ONBOARDING_MISSION_CHAIN_DELAY_MS);
      }
    }
  }, [
    session,
    activeMissionId,
    storeActions,
    completedMissionIds,
    missions,
    startMission,
  ]);

  const value: DoctorOnboardingContextValue = {
    missions,
    completedMissionIds,
    activeMissionId,
    activeStepIndex,
    isVisible,
    allComplete,
    completedCount,
    profile,
    permissions,
    tourRunToken,
    startMission,
    continueSetup,
    dismissOnboarding,
    restartTour,
    syncFromSnapshot,
    isAutoPlayActive: guidedOnboardingActive && Boolean(activeMissionId),
  };

  return (
    <DoctorOnboardingContext.Provider value={value}>
      {children}
      {activeMissionId && tourSteps.length > 0 && !isDismissed ? (
        <GuidedTourEngine
          steps={tourSteps}
          runToken={tourRunToken}
          autoStart
          autoAdvanceMs={DOCTOR_ONBOARDING_AUTO_PLAY ? DOCTOR_ONBOARDING_STEP_DELAY_MS : undefined}
          stepIndex={activeStepIndex}
          onStepChange={handleStepChange}
          onDemoAction={DOCTOR_ONBOARDING_AUTO_PLAY ? handleDemoAction : undefined}
          onComplete={handleTourComplete}
        />
      ) : null}
    </DoctorOnboardingContext.Provider>
  );
}

export function useDoctorOnboarding() {
  const ctx = useContext(DoctorOnboardingContext);
  if (!ctx) {
    throw new Error("useDoctorOnboarding must be used within DoctorOnboardingProvider");
  }
  return ctx;
}
