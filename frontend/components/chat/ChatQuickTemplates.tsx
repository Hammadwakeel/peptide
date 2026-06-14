"use client";

import type { ApiTemplate } from "@/lib/chat/types";

type ChatQuickTemplatesProps = {
  templates: ApiTemplate[];
  loading?: boolean;
  onSelect: (content: string) => void;
};

export function ChatQuickTemplates({ templates, loading, onSelect }: ChatQuickTemplatesProps) {
  if (loading) {
    return (
      <div className="flex flex-wrap gap-2 border-b border-deep-teal/8 bg-pure-white px-3 py-2">
        {Array.from({ length: 3 }).map((_, index) => (
          <span
            key={index}
            className="h-7 w-28 animate-pulse rounded-full bg-deep-teal/8"
            aria-hidden="true"
          />
        ))}
      </div>
    );
  }

  if (templates.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 border-b border-deep-teal/8 bg-pure-white px-3 py-2">
      {templates.map((template) => (
        <button
          key={template.id}
          type="button"
          title={template.content}
          onClick={() => onSelect(template.content)}
          className="rounded-full border border-deep-teal/15 px-3 py-1 text-xs text-deep-teal/70 transition-colors hover:border-pacific-teal hover:text-deep-teal"
        >
          {template.label}
        </button>
      ))}
    </div>
  );
}
