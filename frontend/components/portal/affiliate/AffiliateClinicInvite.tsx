"use client";

import { useCallback, useEffect, useState } from "react";
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
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-light text-deep-teal">Invite Clinic</h1>
        <p className="mt-1 text-sm text-deep-teal/55">
          Share your referral link or email a clinic invitation directly.
        </p>
      </div>

      <section className="rounded-2xl border border-deep-teal/10 bg-pure-white p-5 shadow-sm">
        <h2 className="text-sm font-medium text-deep-teal">Your clinic invite link</h2>
        {isLoading ? (
          <p className="mt-4 text-sm text-deep-teal/50">Loading invite link…</p>
        ) : (
          <div className="mt-4 space-y-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-deep-teal/45">Referral code</p>
              <p className="mt-1 font-mono text-sm text-deep-teal">{referralCode}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-deep-teal/45">Referral link</p>
              <p className="mt-1 break-all rounded-xl bg-deep-teal/[0.03] px-3 py-2 font-mono text-xs text-deep-teal">
                {referralLink}
              </p>
            </div>
            <button
              type="button"
              onClick={() => void handleCopyLink()}
              className="rounded-full border border-deep-teal/15 px-4 py-2 text-sm text-deep-teal hover:border-pacific-teal"
            >
              Copy link
            </button>
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-deep-teal/10 bg-pure-white p-5 shadow-sm">
        <h2 className="text-sm font-medium text-deep-teal">Email invitation</h2>
        <p className="mt-1 text-sm text-deep-teal/55">
          Optionally send the clinic application link to a clinic email address.
        </p>
        <form onSubmit={(event) => void handleInvite(event)} className="mt-4 space-y-4">
          <div>
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
            className="rounded-full bg-deep-teal px-5 py-2.5 text-sm font-medium text-pure-white hover:bg-pacific-teal disabled:opacity-60"
          >
            {isSending ? "Sending…" : clinicEmail.trim() ? "Send invitation" : "Generate link"}
          </button>
        </form>
      </section>
    </div>
  );
}
