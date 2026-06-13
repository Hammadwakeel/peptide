"use client";

import { FileText, ImageIcon, Music, Plus } from "lucide-react";
import { Tooltip } from "@/components/ui/Tippy";
import { useEffect, useRef } from "react";

type ChatAttachmentMenuProps = {
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
  onPickImage: () => void;
  onPickDocument: () => void;
  onPickAudio: () => void;
  disabled?: boolean;
};

const MENU_ITEMS = [
  { id: "document", label: "Report / document", icon: FileText, onPick: "onPickDocument" as const },
  { id: "image", label: "Photo / X-ray", icon: ImageIcon, onPick: "onPickImage" as const },
  { id: "audio", label: "Audio", icon: Music, onPick: "onPickAudio" as const },
] as const;

export function ChatAttachmentMenu({
  open,
  onToggle,
  onClose,
  onPickImage,
  onPickDocument,
  onPickAudio,
  disabled = false,
}: ChatAttachmentMenuProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        onClose();
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [open, onClose]);

  const handlers = {
    onPickImage,
    onPickDocument,
    onPickAudio,
  };

  return (
    <div ref={rootRef} className="relative shrink-0">
      <Tooltip content="Attach file" visible={open ? false : undefined}>
        <button
          type="button"
          onClick={onToggle}
          disabled={disabled}
          className={`flex size-10 items-center justify-center rounded-full text-deep-teal/70 transition-transform hover:bg-deep-teal/5 hover:text-deep-teal disabled:opacity-40 ${
            open ? "rotate-45 bg-deep-teal/5 text-deep-teal" : ""
          }`}
          aria-label="Attach file"
          aria-expanded={open}
        >
          <Plus className="size-5" />
        </button>
      </Tooltip>

      {open ? (
        <div className="absolute bottom-12 left-0 z-20 min-w-[180px] overflow-hidden rounded-2xl border border-deep-teal/10 bg-pure-white py-2 shadow-lg">
          {MENU_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  handlers[item.onPick]();
                  onClose();
                }}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-deep-teal hover:bg-deep-teal/[0.04]"
              >
                <span className="flex size-9 items-center justify-center rounded-full bg-deep-teal/8 text-pacific-teal">
                  <Icon className="size-4" />
                </span>
                {item.label}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
