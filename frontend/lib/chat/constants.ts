/** Initial + each "load older" page size (backend max 100). */
export const CHAT_MESSAGES_PAGE_SIZE = 20;

/** Distance from top of list (px) to trigger loading older messages. */
export const CHAT_LOAD_MORE_SCROLL_THRESHOLD = 120;

/** Shown inline on message hover — tap + for the full set. */
export const CHAT_QUICK_REACTION_EMOJIS = ["👍", "❤️", "😂", "😮", "🙏", "😊"] as const;

/** Reaction picker — backend accepts any emoji up to 16 chars. */
export const CHAT_REACTION_EMOJIS = [
  "👍",
  "👎",
  "❤️",
  "💙",
  "💚",
  "🧡",
  "😊",
  "😂",
  "🤣",
  "😮",
  "😢",
  "😭",
  "🥲",
  "😅",
  "🙏",
  "👏",
  "🙌",
  "🤝",
  "✅",
  "✔️",
  "🎉",
  "🔥",
  "💯",
  "⭐",
  "✨",
  "🤔",
  "👀",
  "😍",
  "🥳",
  "🤗",
  "😔",
  "😡",
  "🙂",
  "😎",
  "🤩",
  "😬",
  "💪",
  "🫶",
  "💊",
  "🏥",
  "⚕️",
  "🩺",
  "💉",
  "🧪",
  "📋",
  "📎",
  "☀️",
  "🌿",
  "🍀",
  "💤",
] as const;

/** Common emojis for message input (subset of reactions). */
export const CHAT_INPUT_EMOJIS = CHAT_REACTION_EMOJIS.slice(0, 24);
