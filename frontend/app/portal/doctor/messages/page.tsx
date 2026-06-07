import { Suspense } from "react";
import { ProviderChatPage } from "@/components/portal/provider/messages/ProviderChatPage";

export const metadata = {
  title: "Messages — Provider portal",
  description: "Chat with patients.",
};

export default function DoctorMessagesPage() {
  return (
    <Suspense fallback={<p className="text-sm text-deep-teal/50">Loading messages…</p>}>
      <ProviderChatPage />
    </Suspense>
  );
}
