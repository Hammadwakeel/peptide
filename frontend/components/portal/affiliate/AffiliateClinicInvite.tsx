"use client";

import { useCallback, useEffect, useState } from "react";
import { Copy, Link2, Mail, RefreshCw, Send } from "lucide-react";
import {
  authInputClassName,
  authLabelClassName,
} from "@/components/auth/AuthShell";
import { getClinicInviteLink, inviteClinic } from "@/lib/affiliate/api";
import { showError, toast } from "@/lib/toast";

export function AffiliateClinicInvite() {
  const [referralCode, setReferralCode] = useState("");
  const [referralLink, setReferralLink] = useState("");
  const [clinicEmail, setClinicEmail] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  const loadInviteLink = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getClinicInviteLink();
      setReferralCode(response.referral_code);
      setReferralLink(response.referral_link);
    } catch (error) {
      showError(error, "Unable to load clinic invite link.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadInviteLink();
  }, [loadInviteLink]);

  async function handleCopyLink() {
    if (!referralLink) return;
    try {
      await navigator.clipboard.writeText(referralLink);
      toast.success("Referral link copied.");
    } catch {
      toast.error("Unable to copy link.");
    }
  }

  async function handleInvite(event: React.FormEvent) {
    event.preventDefault();
    setIsSending(true);
    try {
      const result = await inviteClinic({
        clinic_email: clinicEmail.trim() || undefined,
      });
      setReferralCode(result.referral_code);
      setReferralLink(result.referral_link);
      toast.success(result.message);
      setClinicEmail("");
    } catch (error) {
      showError(error, "Unable to create clinic invitation.");
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-4 rounded-2xl border border-deep-teal/20 bg-pure-white px-4 py-3 shadow-[0_2px_12px_rgba(1,26,36,0.08)] sm:px-5">
        <h1 className="shrink-0 font-serif text-xl font-light text-deep-teal sm:text-2xl">Invite Clinic</h1>
        <div className="min-w-4 flex-1" aria-hidden="true" />
        <div className="flex flex-wrap items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => void handleCopyLink()}
            disabled={!referralLink || isLoading}
            className="inline-flex items-center gap-2 rounded-full border border-deep-teal/25 px-4 py-2 text-sm font-medium text-deep-teal transition-colors hover:bg-deep-teal/5 disabled:opacity-50"
          >
            <Copy className="size-4" aria-hidden="true" />
            <span className="hidden sm:inline">Copy link</span>
          </button>
          <button
            type="button"
            onClick={() => void loadInviteLink()}
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-full bg-deep-teal px-4 py-2 text-sm font-medium text-pure-white transition-opacity hover:opacity-90 disabled:opacity-50"
            aria-label="Refresh invite link"
          >
            <RefreshCw className={`size-4 ${isLoading ? "animate-spin" : ""}`} aria-hidden="true" />
          </button>
        </div>
      </div>

      <section className="overflow-hidden rounded-2xl border border-deep-teal/25 bg-pure-white shadow-[0_4px_24px_rgba(1,26,36,0.12)]">
        <div className="bg-deep-teal px-5 py-4 text-pure-white">
          <div className="flex items-center gap-3">
            <div
              className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-pure-white/15"
              aria-hidden="true"
            >
              <Link2 className="size-4" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-light">Your clinic invite link</h2>
              <p className="text-xs text-pure-white/75">Share this link with prospective clinics</p>
            </div>
          </div>
        </div>

        <div className="p-5">
          {isLoading ? (
            <p className="py-8 text-center text-sm text-deep-teal/50">Loading invite link…</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-deep-teal/10 bg-surface-muted/40 px-3 py-2.5">
                <p className="text-[10px] font-medium uppercase tracking-wide text-deep-teal/45">Referral code</p>
                <p className="mt-1 font-mono text-sm font-medium text-deep-teal">{referralCode}</p>
              </div>
              <div className="rounded-xl border border-deep-teal/10 bg-surface-muted/40 px-3 py-2.5 sm:col-span-2">
                <p className="text-[10px] font-medium uppercase tracking-wide text-deep-teal/45">Referral link</p>
                <p className="mt-1 break-all font-mono text-xs text-deep-teal/80">{referralLink}</p>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-deep-teal/25 bg-pure-white shadow-[0_4px_24px_rgba(1,26,36,0.12)]">
        <div className="bg-deep-teal px-5 py-4 text-pure-white">
          <div className="flex items-center gap-3">
            <div
              className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-pure-white/15"
              aria-hidden="true"
            >
              <Mail className="size-4" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-light">Email invitation</h2>
              <p className="text-xs text-pure-white/75">Send the application link to a clinic inbox</p>
            </div>
          </div>
        </div>

        <form onSubmit={(event) => void handleInvite(event)} className="space-y-4 p-5">
          <div className="max-w-md">
            <label htmlFor="clinic-email" className={authLabelClassName}>
              Clinic email (optional)
            </label>
            <input
              id="clinic-email"
              type="email"
              value={clinicEmail}
              onChange={(e) => setClinicEmail(e.target.value)}
              placeholder="clinic@example.com"
              className={authInputClassName}
            />
          </div>
          <button
            type="submit"
            disabled={isSending}
            className="inline-flex items-center gap-2 rounded-full bg-deep-teal px-5 py-2.5 text-sm font-medium text-pure-white hover:opacity-90 disabled:opacity-60"
          >
            <Send className="size-4" aria-hidden="true" />
            {isSending ? "Sending…" : clinicEmail.trim() ? "Send invitation" : "Generate link"}
          </button>
        </form>
      </section>
    </div>
  );
}
