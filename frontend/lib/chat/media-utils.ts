/** Detect clinical imaging / lab report attachments for tailored UI labels. */
export function getClinicalMediaLabel(
  messageType: "image" | "document",
  content?: string | null,
  mime?: string | null,
): string | null {
  const haystack = `${content ?? ""} ${mime ?? ""}`.toLowerCase();
  if (/x-?ray|radiograph|dicom|\.dcm|scan|mri|ct\b|ultrasound/.test(haystack)) {
    return "Clinical image";
  }
  if (/report|lab|pathology|result|requisition|\.pdf/.test(haystack)) {
    return messageType === "document" ? "Medical report" : null;
  }
  return null;
}

export function mediaDownloadFilename(
  messageType: string,
  content?: string | null,
  mime?: string | null,
): string {
  const base = (content || "attachment").replace(/[^\w.-]+/g, "_").slice(0, 80);
  if (base.includes(".")) return base;
  if (mime?.includes("pdf")) return `${base}.pdf`;
  if (mime?.includes("png")) return `${base}.png`;
  if (mime?.includes("jpeg") || mime?.includes("jpg")) return `${base}.jpg`;
  if (mime?.includes("webp")) return `${base}.webp`;
  if (messageType === "image") return `${base}.jpg`;
  if (messageType === "document") return `${base}.pdf`;
  return base;
}

export function triggerMediaDownload(url: string, filename: string) {
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = "noopener noreferrer";
  anchor.target = "_blank";
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
}

export function replyPreviewText(message: {
  messageType: string;
  content: string;
}): string {
  if (message.messageType === "image") return message.content && message.content !== "Image" ? message.content : "Photo";
  if (message.messageType === "voice") return "Voice message";
  if (message.messageType === "document") return message.content || "Document";
  return message.content;
}

export type SharedMediaTab = "media" | "audio" | "docs";

export function groupSharedMediaMessages<T extends { messageType: string; mediaUrl?: string | null; pending?: boolean }>(
  messages: T[],
) {
  const shared = messages.filter((message) => message.mediaUrl && !message.pending);
  return {
    media: shared.filter((message) => message.messageType === "image"),
    audio: shared.filter((message) => message.messageType === "voice"),
    docs: shared.filter((message) => message.messageType === "document"),
  };
}
