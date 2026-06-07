"use client";

import { PatientPortalLayout } from "@/components/portal/patient/PatientPortalLayout";
import { ChatProvider } from "@/context/ChatProvider";
import { PatientPortalProvider } from "@/context/PatientPortalProvider";

export default function PatientPortalRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PatientPortalProvider>
      <ChatProvider>
        <PatientPortalLayout>{children}</PatientPortalLayout>
      </ChatProvider>
    </PatientPortalProvider>
  );
}
