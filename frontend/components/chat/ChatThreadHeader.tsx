"use client";

import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";

type ChatThreadHeaderProps = {
  avatarLabel: string;
  name: string;
  subtitle?: ReactNode;
  online?: boolean;
  onBack?: () => void;
  onProfileClick?: () => void;
};

export function ChatThreadHeader({
  avatarLabel,
  name,
  subtitle,
  online,
  onBack,
  onProfileClick,
}: ChatThreadHeaderProps) {
  const profileInteractive = Boolean(onProfileClick);

  return (
    <div className="flex items-center gap-3 border-b border-deep-teal/10 bg-surface-muted/30 px-3 py-2.5 sm:px-4">
      {onBack ? (
        <button
          type="button"
          onClick={onBack}
          className="flex size-9 shrink-0 items-center justify-center rounded-full text-deep-teal hover:bg-deep-teal/8 lg:hidden"
          aria-label="Back to chats"
        >
          <ArrowLeft className="size-5" />
        </button>
      ) : null}

      <button
        type="button"
        onClick={onProfileClick}
        disabled={!profileInteractive}
        className={`flex min-w-0 flex-1 items-center gap-3 text-left ${
          profileInteractive ? "cursor-pointer rounded-xl hover:bg-deep-teal/[0.04] sm:-mx-1 sm:px-1 sm:py-0.5" : "cursor-default"
        }`}
        aria-label={profileInteractive ? `View ${name} profile and shared media` : undefined}
      >
        <span className="relative flex size-10 shrink-0 items-center justify-center rounded-full bg-pacific-teal/15 text-sm font-light text-deep-teal">
          {avatarLabel}
          {online !== undefined ? (
            <span
              className={`absolute bottom-0 right-0 size-3 rounded-full border-2 border-pure-white ${
                online ? "bg-pacific-teal" : "bg-deep-teal/25"
              }`}
              aria-hidden="true"
            />
          ) : null}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-light text-deep-teal">{name}</p>
          {subtitle ? <div className="text-xs text-deep-teal/50">{subtitle}</div> : null}
        </div>
      </button>
    </div>
  );
}
