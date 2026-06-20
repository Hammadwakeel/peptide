import { brandSpritePath, sidebarIconPath } from "@/lib/icons/brand-sprite-map";

export type FrontierAssetPaths = {
  default: string;
  active: string;
};

/** Sidebar icon PNG assets from brand sprite sheet */
export const frontierAssetIcons = {
  layoutDashboard: {
    default: sidebarIconPath("layoutDashboard"),
    active: sidebarIconPath("layoutDashboard", true),
  },
  layoutGrid: {
    default: sidebarIconPath("layoutGrid"),
    active: sidebarIconPath("layoutGrid", true),
  },
  clipboardCheck: {
    default: sidebarIconPath("clipboardCheck"),
    active: sidebarIconPath("clipboardCheck", true),
  },
  users: {
    default: sidebarIconPath("users"),
    active: sidebarIconPath("users", true),
  },
  usersRound: {
    default: sidebarIconPath("usersRound"),
    active: sidebarIconPath("usersRound", true),
  },
  user: {
    default: sidebarIconPath("user"),
    active: sidebarIconPath("user", true),
  },
  userPlus: {
    default: sidebarIconPath("userPlus"),
    active: sidebarIconPath("userPlus", true),
  },
  package: {
    default: sidebarIconPath("package"),
    active: sidebarIconPath("package", true),
  },
  shoppingBag: {
    default: sidebarIconPath("shoppingBag"),
    active: sidebarIconPath("shoppingBag", true),
  },
  wallet: {
    default: sidebarIconPath("wallet"),
    active: sidebarIconPath("wallet", true),
  },
  handshake: {
    default: sidebarIconPath("handshake"),
    active: sidebarIconPath("handshake", true),
  },
  warehouse: {
    default: sidebarIconPath("warehouse"),
    active: sidebarIconPath("warehouse", true),
  },
  barChart: {
    default: sidebarIconPath("barChart"),
    active: sidebarIconPath("barChart", true),
  },
  shield: {
    default: sidebarIconPath("shield"),
    active: sidebarIconPath("shield", true),
  },
  settings: {
    default: sidebarIconPath("settings"),
    active: sidebarIconPath("settings", true),
  },
  store: {
    default: sidebarIconPath("store"),
    active: sidebarIconPath("store", true),
  },
  calculator: {
    default: sidebarIconPath("calculator"),
    active: sidebarIconPath("calculator", true),
  },
  messageSquare: {
    default: sidebarIconPath("messageSquare"),
    active: sidebarIconPath("messageSquare", true),
  },
  helpCircle: {
    default: sidebarIconPath("helpCircle"),
    active: sidebarIconPath("helpCircle", true),
  },
  logOut: {
    default: sidebarIconPath("logOut"),
    active: sidebarIconPath("logOut", true),
  },
  menu: {
    default: sidebarIconPath("menu"),
    active: sidebarIconPath("menu", true),
  },
} as const satisfies Record<string, FrontierAssetPaths>;

export type FrontierAssetIconKey = keyof typeof frontierAssetIcons;

/** Dashboard / section brand sprites (single PNG, default = active) */
export const frontierBrandAssetIcons = {
  mail: { default: brandSpritePath("mail"), active: brandSpritePath("mail") },
  search: { default: brandSpritePath("search"), active: brandSpritePath("search") },
  calendar: { default: brandSpritePath("calendar"), active: brandSpritePath("calendar") },
  clock: { default: brandSpritePath("clock"), active: brandSpritePath("clock") },
  location: { default: brandSpritePath("location"), active: brandSpritePath("location") },
  edit: { default: brandSpritePath("edit"), active: brandSpritePath("edit") },
  fingerprint: { default: brandSpritePath("fingerprint"), active: brandSpritePath("fingerprint") },
  cloud: { default: brandSpritePath("cloud"), active: brandSpritePath("cloud") },
  chevron: { default: brandSpritePath("chevron"), active: brandSpritePath("chevron") },
  forward: { default: brandSpritePath("forward"), active: brandSpritePath("forward") },
  cards: { default: brandSpritePath("cards"), active: brandSpritePath("cards") },
  priceTag: { default: brandSpritePath("price-tag"), active: brandSpritePath("price-tag") },
  pieChart: { default: brandSpritePath("pie-chart"), active: brandSpritePath("pie-chart") },
  wallet: { default: brandSpritePath("wallet"), active: brandSpritePath("wallet") },
  home: { default: brandSpritePath("home"), active: brandSpritePath("home") },
  folder: { default: brandSpritePath("folder"), active: brandSpritePath("folder") },
  add: { default: brandSpritePath("add"), active: brandSpritePath("add") },
  headset: { default: brandSpritePath("headset"), active: brandSpritePath("headset") },
  notification: { default: brandSpritePath("notification"), active: brandSpritePath("notification") },
  user: { default: brandSpritePath("user"), active: brandSpritePath("user") },
  grid: { default: brandSpritePath("grid"), active: brandSpritePath("grid") },
  lock: { default: brandSpritePath("lock"), active: brandSpritePath("lock") },
  analytics: { default: brandSpritePath("analytics"), active: brandSpritePath("analytics") },
} as const satisfies Record<string, FrontierAssetPaths>;

export type FrontierBrandAssetIconKey = keyof typeof frontierBrandAssetIcons;

export type FrontierAnyAssetIconKey = FrontierAssetIconKey | FrontierBrandAssetIconKey;
