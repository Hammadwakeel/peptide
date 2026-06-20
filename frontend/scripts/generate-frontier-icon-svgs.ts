/**
 * Generates brand-spec glassmorphism SVGs for sidebar icons.
 * Replace files in public/icons/frontier/ with Figma exports when available.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { sidebarIconPaths } from "../lib/icons/paths/sidebar";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, "../public/icons/frontier");

const ICON_BASE = "#1C6384";
const ICON_OVERLAY = "#0D717B";
const ICON_OVERLAY_OPACITY = "0.3";
const ICON_ACTIVE = "#FFFFFF";

const sidebarIcons = {
  "layout-dashboard": "layoutDashboard",
  "layout-grid": "layoutGrid",
  "clipboard-check": "clipboardCheck",
  users: "users",
  "users-round": "usersRound",
  user: "user",
  "user-plus": "userPlus",
  package: "package",
  "shopping-bag": "shoppingBag",
  wallet: "wallet",
  handshake: "handshake",
  warehouse: "warehouse",
  "bar-chart": "barChart3",
  shield: "shield",
  settings: "settings",
  store: "store",
  calculator: "calculator",
  "message-square": "messageSquare",
  "help-circle": "helpCircle",
  "log-out": "logOut",
  menu: "menu",
} as const satisfies Record<string, keyof typeof sidebarIconPaths>;

function defaultSvg(id: string, base: string, overlay: string) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none">
  <defs>
    <filter id="frost-${id}" x="-25%" y="-25%" width="150%" height="150%" color-interpolation-filters="sRGB">
      <feGaussianBlur in="BackgroundImage" stdDeviation="2.8" result="blurred"/>
      <feFlood flood-color="${ICON_OVERLAY}" flood-opacity="0.35" result="tint"/>
      <feComposite in="tint" in2="blurred" operator="in" result="tintedBlur"/>
      <feComposite in="SourceGraphic" in2="tintedBlur" operator="over"/>
    </filter>
  </defs>
  <path fill="${ICON_BASE}" d="${base}"/>
  <path fill="${ICON_OVERLAY}" fill-opacity="${ICON_OVERLAY_OPACITY}" d="${overlay}" filter="url(#frost-${id})"/>
</svg>`;
}

function activeSvg(base: string, overlay: string) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none">
  <path fill="${ICON_ACTIVE}" d="${base}"/>
  <path fill="${ICON_ACTIVE}" d="${overlay}"/>
</svg>`;
}

mkdirSync(outDir, { recursive: true });

for (const [slug, pathKey] of Object.entries(sidebarIcons)) {
  const paths = sidebarIconPaths[pathKey];
  const safeId = slug.replace(/[^a-z0-9-]/g, "");
  writeFileSync(join(outDir, `${slug}.svg`), defaultSvg(safeId, paths.base, paths.overlay));
  writeFileSync(join(outDir, `${slug}-active.svg`), activeSvg(paths.base, paths.overlay));
}

console.log(`Generated ${Object.keys(sidebarIcons).length * 2} glassmorphism SVGs in ${outDir}`);
