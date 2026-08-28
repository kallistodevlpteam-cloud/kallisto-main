import React from "react";
import {
  HomeDuotoneIcon,
  EnquiriesDuotoneIcon,
  ProjectsDuotoneIcon,
  StudioDuotoneIcon,
  CalendarDuotoneIcon,
  TeamDuotoneIcon,
  PaymentsDuotoneIcon,
  AnalyticsDuotoneIcon,
  PortfolioDuotoneIcon,
  HubDuotoneIcon,
  HandsDuotoneIcon,
  BasicsDuotoneIcon,
  DeveloperDuotoneIcon,
  MoreToolsDuotoneIcon,
  DocumentsDuotoneIcon,
  SettingsDuotoneIcon,
  HelpDuotoneIcon,
} from "./sidebar-icons";

export type SidebarSection =
  | "home"
  | "work"
  | "business"
  | "presence"
  | "connectors"
  | "utility"
  | "client-main"
  | "client-utility";

export type SidebarBadge = "pending-enquiries";

export interface SidebarNavigationItem {
  icon: React.ComponentType<{ size?: number | string; className?: string; [key: string]: unknown }>;
  label: string;
  href: string;
  section: SidebarSection;
  badge?: SidebarBadge;
  isLocked?: boolean;
  lockedTitle?: string;
  lockedMessage?: string;
  lockedPerks?: string[];
}

export interface SidebarSectionDef {
  id: SidebarSection;
  label?: string;
}

export const SIDEBAR_SECTIONS: ReadonlyArray<SidebarSectionDef> = [
  { id: "home" },
  { id: "work", label: "Work" },
  { id: "business", label: "Business" },
  { id: "presence", label: "Presence" },
  { id: "connectors", label: "Connectors" },
  { id: "utility" },
];

export const PROVIDER_SIDEBAR_SECTIONS = SIDEBAR_SECTIONS;

export const SIDEBAR_NAVIGATION: ReadonlyArray<SidebarNavigationItem> = [
  { icon: StudioDuotoneIcon, label: "Hive Studio", href: "/studio", section: "home" },
  { icon: EnquiriesDuotoneIcon, label: "Enquiries", href: "/enquiries", section: "work", badge: "pending-enquiries" },
  { icon: ProjectsDuotoneIcon, label: "Projects", href: "/projects", section: "work" },
  { icon: CalendarDuotoneIcon, label: "Calendar", href: "/calendar", section: "work" },
  {
    icon: TeamDuotoneIcon,
    label: "Team",
    href: "/team",
    section: "work",
    isLocked: true,
    lockedTitle: "Team Management Locked",
    lockedMessage: "Collaborative member provisioning, role access delegation, and contractor permissions are locked on your current tier.",
    lockedPerks: [
      "Multi-seat studio member provisioning",
      "Granular role & project access permissions",
      "Real-time team activity & workload tracking",
    ],
  },
  {
    icon: PaymentsDuotoneIcon,
    label: "Payments",
    href: "/payments",
    section: "business",
    isLocked: true,
    lockedTitle: "Financial & Payments Portal Locked",
    lockedMessage: "Milestone payment settlements, client invoice reconciliation, payout records, and escrow visibility are locked.",
    lockedPerks: [
      "Automated milestone release & escrow tracking",
      "Client invoice generation & payment receipts",
      "Direct bank settlement & payout auditing",
    ],
  },
  {
    icon: AnalyticsDuotoneIcon,
    label: "Analytics",
    href: "/analytics",
    section: "business",
    isLocked: true,
    lockedTitle: "Performance Analytics Locked",
    lockedMessage: "Studio conversion funnels, margin forecasting, delivery velocity benchmarks, and business intelligence are locked.",
    lockedPerks: [
      "Enquiry conversion & win-rate metrics",
      "Project profitability & cost margin analysis",
      "Studio operational efficiency benchmarks",
    ],
  },
  { icon: PortfolioDuotoneIcon, label: "Portfolio", href: "/portfolio", section: "presence" },
  { icon: HubDuotoneIcon, label: "Hub", href: "/hub", section: "connectors" },
  { icon: HandsDuotoneIcon, label: "Hands", href: "/hands", section: "connectors" },
  { icon: BasicsDuotoneIcon, label: "Basics", href: "/basics", section: "connectors" },
  { icon: DeveloperDuotoneIcon, label: "Developer", href: "/developer", section: "utility" },
  { icon: MoreToolsDuotoneIcon, label: "More tools", href: "/tools", section: "utility" },
];

export const PROVIDER_SIDEBAR_NAVIGATION = SIDEBAR_NAVIGATION;

export const CLIENT_SIDEBAR_SECTIONS: ReadonlyArray<SidebarSectionDef> = [
  { id: "client-main" },
  { id: "client-utility" },
];

export const CLIENT_SIDEBAR_NAVIGATION: ReadonlyArray<SidebarNavigationItem> = [
  { icon: HomeDuotoneIcon, label: "Ask Odin", href: "/client/overview", section: "client-main" },
  { icon: ProjectsDuotoneIcon, label: "Projects", href: "/client/projects", section: "client-main" },
  { icon: EnquiriesDuotoneIcon, label: "Enquiries", href: "/client/enquiries", section: "client-main" },
  { icon: PaymentsDuotoneIcon, label: "Payments", href: "/client/payments", section: "client-main" },
  { icon: TeamDuotoneIcon, label: "Providers", href: "/client/providers", section: "client-main" },
  { icon: SettingsDuotoneIcon, label: "Settings", href: "/client/settings", section: "client-utility" },
  { icon: HelpDuotoneIcon, label: "Help & Support", href: "/client/help", section: "client-utility" },
];

export function isClientPath(pathname: string): boolean {
  return pathname.startsWith("/client");
}

export function getSidebarSectionsForPath(pathname: string): ReadonlyArray<SidebarSectionDef> {
  return isClientPath(pathname) ? CLIENT_SIDEBAR_SECTIONS : PROVIDER_SIDEBAR_SECTIONS;
}

export function getSidebarNavigationForPath(pathname: string): ReadonlyArray<SidebarNavigationItem> {
  return isClientPath(pathname) ? CLIENT_SIDEBAR_NAVIGATION : PROVIDER_SIDEBAR_NAVIGATION;
}

export function isSidebarItemActive(pathname: string, href: string): boolean {
  if (href === "/studio") {
    return pathname === "/" || pathname === "/studio" || pathname.startsWith("/studio/");
  }

  if (href === "/client/overview") {
    return pathname === "/client" || pathname === "/client/overview" || pathname.startsWith("/client/overview/");
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

