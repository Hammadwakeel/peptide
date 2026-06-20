/** Brand sprite slugs extracted from public/Icons/1.png */
export const brandSpriteSlugs = [
  "cloud",
  "wallet",
  "user",
  "calculator",
  "layers",
  "calendar",
  "price-tag",
  "cards",
  "lock",
  "location",
  "folder",
  "home",
  "notification",
  "toggle",
  "edit",
  "mail",
  "fingerprint",
  "analytics",
  "headset",
  "clock",
  "chevron",
  "grid",
  "search",
  "add",
  "key",
  "pie-chart",
  "forward",
] as const;

export type BrandSpriteSlug = (typeof brandSpriteSlugs)[number];

export const brandSpriteBasePath = "/icons/frontier-brand";

export function brandSpritePath(slug: BrandSpriteSlug): string {
  return `${brandSpriteBasePath}/${slug}.png`;
}

/** Portal sidebar slug -> brand sprite slug */
export const sidebarBrandSpriteMap = {
  layoutDashboard: "grid",
  layoutGrid: "layers",
  clipboardCheck: "edit",
  users: "notification",
  usersRound: "user",
  user: "user",
  userPlus: "add",
  package: "cards",
  shoppingBag: "price-tag",
  wallet: "wallet",
  handshake: "analytics",
  warehouse: "folder",
  barChart: "pie-chart",
  shield: "lock",
  settings: "toggle",
  store: "home",
  calculator: "calculator",
  messageSquare: "notification",
  helpCircle: "headset",
  logOut: "key",
  menu: "grid",
} as const satisfies Record<string, BrandSpriteSlug>;

/** Portal file slug (kebab-case) for public/icons/frontier/ */
export const sidebarPortalSlugMap: Record<keyof typeof sidebarBrandSpriteMap, string> = {
  layoutDashboard: "layout-dashboard",
  layoutGrid: "layout-grid",
  clipboardCheck: "clipboard-check",
  users: "users",
  usersRound: "users-round",
  user: "user",
  userPlus: "user-plus",
  package: "package",
  shoppingBag: "shopping-bag",
  wallet: "wallet",
  handshake: "handshake",
  warehouse: "warehouse",
  barChart: "bar-chart",
  shield: "shield",
  settings: "settings",
  store: "store",
  calculator: "calculator",
  messageSquare: "message-square",
  helpCircle: "help-circle",
  logOut: "log-out",
  menu: "menu",
};

export function sidebarIconPath(key: keyof typeof sidebarBrandSpriteMap, active = false): string {
  const slug = sidebarPortalSlugMap[key];
  return active ? `/icons/frontier/${slug}-active.png` : `/icons/frontier/${slug}.png`;
}
