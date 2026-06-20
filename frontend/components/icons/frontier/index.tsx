import { FrontierIconShell } from "@/components/icons/frontier/FrontierIconShell";
import { iconPaths } from "@/lib/icons/paths";
import type { FrontierIconComponent, FrontierIconProps } from "@/lib/icons/types";

export type { FrontierIconComponent, FrontierIconProps } from "@/lib/icons/types";

function createIcon(paths: (typeof iconPaths)[keyof typeof iconPaths], displayName: string): FrontierIconComponent {
  const Icon = (props: FrontierIconProps) => <FrontierIconShell {...props} paths={paths} />;
  Icon.displayName = displayName;
  return Icon;
}

export const FrontierLayoutDashboardIcon = createIcon(iconPaths.layoutDashboard, "FrontierLayoutDashboardIcon");
export const FrontierLayoutGridIcon = createIcon(iconPaths.layoutGrid, "FrontierLayoutGridIcon");
export const FrontierMenuIcon = createIcon(iconPaths.menu, "FrontierMenuIcon");
export const FrontierArrowLeftIcon = createIcon(iconPaths.arrowLeft, "FrontierArrowLeftIcon");
export const FrontierHelpCircleIcon = createIcon(iconPaths.helpCircle, "FrontierHelpCircleIcon");
export const FrontierUserIcon = createIcon(iconPaths.user, "FrontierUserIcon");
export const FrontierUsersIcon = createIcon(iconPaths.users, "FrontierUsersIcon");
export const FrontierUsersRoundIcon = createIcon(iconPaths.usersRound, "FrontierUsersRoundIcon");
export const FrontierUserPlusIcon = createIcon(iconPaths.userPlus, "FrontierUserPlusIcon");
export const FrontierUserRoundIcon = createIcon(iconPaths.userRound, "FrontierUserRoundIcon");
export const FrontierHandshakeIcon = createIcon(iconPaths.handshake, "FrontierHandshakeIcon");
export const FrontierPackageIcon = createIcon(iconPaths.package, "FrontierPackageIcon");
export const FrontierPackagePlusIcon = createIcon(iconPaths.packagePlus, "FrontierPackagePlusIcon");
export const FrontierShoppingBagIcon = createIcon(iconPaths.shoppingBag, "FrontierShoppingBagIcon");
export const FrontierStoreIcon = createIcon(iconPaths.store, "FrontierStoreIcon");
export const FrontierWalletIcon = createIcon(iconPaths.wallet, "FrontierWalletIcon");
export const FrontierCreditCardIcon = createIcon(iconPaths.creditCard, "FrontierCreditCardIcon");
export const FrontierDollarSignIcon = createIcon(iconPaths.dollarSign, "FrontierDollarSignIcon");
export const FrontierTruckIcon = createIcon(iconPaths.truck, "FrontierTruckIcon");
export const FrontierClipboardCheckIcon = createIcon(iconPaths.clipboardCheck, "FrontierClipboardCheckIcon");
export const FrontierShieldIcon = createIcon(iconPaths.shield, "FrontierShieldIcon");
export const FrontierBuilding2Icon = createIcon(iconPaths.building2, "FrontierBuilding2Icon");
export const FrontierLandmarkIcon = createIcon(iconPaths.landmark, "FrontierLandmarkIcon");
export const FrontierFileTextIcon = createIcon(iconPaths.fileText, "FrontierFileTextIcon");
export const FrontierFolderTreeIcon = createIcon(iconPaths.folderTree, "FrontierFolderTreeIcon");
export const FrontierWarehouseIcon = createIcon(iconPaths.warehouse, "FrontierWarehouseIcon");
export const FrontierMessageSquareIcon = createIcon(iconPaths.messageSquare, "FrontierMessageSquareIcon");
export const FrontierMailIcon = createIcon(iconPaths.mail, "FrontierMailIcon");
export const FrontierSendIcon = createIcon(iconPaths.send, "FrontierSendIcon");
export const FrontierHeadphonesIcon = createIcon(iconPaths.headphones, "FrontierHeadphonesIcon");
export const FrontierBookOpenIcon = createIcon(iconPaths.bookOpen, "FrontierBookOpenIcon");
export const FrontierLink2Icon = createIcon(iconPaths.link2, "FrontierLink2Icon");
export const FrontierBarChart3Icon = createIcon(iconPaths.barChart3, "FrontierBarChart3Icon");
export const FrontierCalculatorIcon = createIcon(iconPaths.calculator, "FrontierCalculatorIcon");
export const FrontierStethoscopeIcon = createIcon(iconPaths.stethoscope, "FrontierStethoscopeIcon");
export const FrontierSettingsIcon = createIcon(iconPaths.settings, "FrontierSettingsIcon");
export const FrontierSearchIcon = createIcon(iconPaths.search, "FrontierSearchIcon");
export const FrontierRefreshCwIcon = createIcon(iconPaths.refreshCw, "FrontierRefreshCwIcon");
export const FrontierDownloadIcon = createIcon(iconPaths.download, "FrontierDownloadIcon");
export const FrontierUploadIcon = createIcon(iconPaths.upload, "FrontierUploadIcon");
export const FrontierCopyIcon = createIcon(iconPaths.copy, "FrontierCopyIcon");
export const FrontierPlusIcon = createIcon(iconPaths.plus, "FrontierPlusIcon");
export const FrontierTrash2Icon = createIcon(iconPaths.trash2, "FrontierTrash2Icon");
export const FrontierMoreHorizontalIcon = createIcon(iconPaths.moreHorizontal, "FrontierMoreHorizontalIcon");
export const FrontierLogOutIcon = createIcon(iconPaths.logOut, "FrontierLogOutIcon");
export const FrontierMapPinIcon = createIcon(iconPaths.mapPin, "FrontierMapPinIcon");

export const frontierIcons = {
  layoutDashboard: FrontierLayoutDashboardIcon,
  layoutGrid: FrontierLayoutGridIcon,
  menu: FrontierMenuIcon,
  arrowLeft: FrontierArrowLeftIcon,
  helpCircle: FrontierHelpCircleIcon,
  user: FrontierUserIcon,
  users: FrontierUsersIcon,
  usersRound: FrontierUsersRoundIcon,
  userPlus: FrontierUserPlusIcon,
  userRound: FrontierUserRoundIcon,
  handshake: FrontierHandshakeIcon,
  package: FrontierPackageIcon,
  packagePlus: FrontierPackagePlusIcon,
  shoppingBag: FrontierShoppingBagIcon,
  store: FrontierStoreIcon,
  wallet: FrontierWalletIcon,
  creditCard: FrontierCreditCardIcon,
  dollarSign: FrontierDollarSignIcon,
  truck: FrontierTruckIcon,
  clipboardCheck: FrontierClipboardCheckIcon,
  shield: FrontierShieldIcon,
  building2: FrontierBuilding2Icon,
  landmark: FrontierLandmarkIcon,
  fileText: FrontierFileTextIcon,
  folderTree: FrontierFolderTreeIcon,
  warehouse: FrontierWarehouseIcon,
  messageSquare: FrontierMessageSquareIcon,
  mail: FrontierMailIcon,
  send: FrontierSendIcon,
  headphones: FrontierHeadphonesIcon,
  bookOpen: FrontierBookOpenIcon,
  link2: FrontierLink2Icon,
  barChart3: FrontierBarChart3Icon,
  calculator: FrontierCalculatorIcon,
  stethoscope: FrontierStethoscopeIcon,
  settings: FrontierSettingsIcon,
  search: FrontierSearchIcon,
  refreshCw: FrontierRefreshCwIcon,
  download: FrontierDownloadIcon,
  upload: FrontierUploadIcon,
  copy: FrontierCopyIcon,
  plus: FrontierPlusIcon,
  trash2: FrontierTrash2Icon,
  moreHorizontal: FrontierMoreHorizontalIcon,
  logOut: FrontierLogOutIcon,
  mapPin: FrontierMapPinIcon,
} as const;

export const ICON_SIZE_SM = 16;
export const ICON_SIZE_MD = 22;

export { frontierSidebarIcons } from "@/components/icons/frontier/frontier-sidebar-icons";
export { frontierBrandIcons } from "@/components/icons/frontier/frontier-brand-icons";
export { createFrontierAssetIcon, createFrontierBrandIcon, FrontierAssetIcon } from "@/components/icons/frontier/FrontierAssetIcon";
