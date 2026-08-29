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
  | "client-utility"
  | "partner-main"
  | "partner-utility"
  | "hub-overview"
  | "hub-catalog"
  | "hub-orders";

export type SidebarBadge = "pending-enquiries";

export interface SidebarNavigationItem {
  icon: React.ComponentType<{ size?: number | string; className?: string; [key: string]: unknown }>;
  label: string;
  href: string;
  section: SidebarSection;
  color?: string;
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
  { icon: StudioDuotoneIcon, label: "Hive Studio", href: "/studio", section: "home", color: "#8b5cf6" },
  { icon: EnquiriesDuotoneIcon, label: "Enquiries", href: "/enquiries", section: "work", badge: "pending-enquiries", color: "#2563eb" },
  { icon: ProjectsDuotoneIcon, label: "Projects", href: "/projects", section: "work", color: "#6366f1" },
  { icon: CalendarDuotoneIcon, label: "Calendar", href: "/calendar", section: "work", color: "#ea580c" },
  {
    icon: TeamDuotoneIcon,
    label: "Team",
    href: "/team",
    section: "work",
    color: "#0891b2",
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
    color: "#10b981",
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
    color: "#ec4899",
    isLocked: true,
    lockedTitle: "Performance Analytics Locked",
    lockedMessage: "Studio conversion funnels, margin forecasting, delivery velocity benchmarks, and business intelligence are locked.",
    lockedPerks: [
      "Enquiry conversion & win-rate metrics",
      "Project profitability & cost margin analysis",
      "Studio operational efficiency benchmarks",
    ],
  },
  { icon: PortfolioDuotoneIcon, label: "Portfolio", href: "/portfolio", section: "presence", color: "#8b5cf6" },
  { icon: HubDuotoneIcon, label: "Hub", href: "/hub", section: "connectors", color: "#2563eb" },
  { icon: HandsDuotoneIcon, label: "Hands", href: "/hands", section: "connectors", color: "#f97316" },
  { icon: BasicsDuotoneIcon, label: "Basics", href: "/basics", section: "connectors", color: "#10b981" },
  { icon: DeveloperDuotoneIcon, label: "Developer", href: "/developer", section: "utility", color: "#64748b" },
  { icon: MoreToolsDuotoneIcon, label: "More tools", href: "/tools", section: "utility", color: "#8b5cf6" },
];

export const PROVIDER_SIDEBAR_NAVIGATION = SIDEBAR_NAVIGATION;

export const CLIENT_SIDEBAR_SECTIONS: ReadonlyArray<SidebarSectionDef> = [
  { id: "client-main" },
  { id: "client-utility" },
];

export const CLIENT_SIDEBAR_NAVIGATION: ReadonlyArray<SidebarNavigationItem> = [
  { icon: HomeDuotoneIcon, label: "Ask Odin", href: "/client/overview", section: "client-main", color: "#8b5cf6" },
  { icon: ProjectsDuotoneIcon, label: "Projects", href: "/client/projects", section: "client-main", color: "#6366f1" },
  { icon: EnquiriesDuotoneIcon, label: "Enquiries", href: "/client/enquiries", section: "client-main", color: "#2563eb" },
  { icon: PaymentsDuotoneIcon, label: "Payments", href: "/client/payments", section: "client-main", color: "#10b981" },
  { icon: TeamDuotoneIcon, label: "Providers", href: "/client/providers", section: "client-main", color: "#0891b2" },
  { icon: SettingsDuotoneIcon, label: "Settings", href: "/client/settings", section: "client-utility", color: "#64748b" },
  { icon: HelpDuotoneIcon, label: "Help & Support", href: "/client/help", section: "client-utility", color: "#0284c7" },
];

export const PARTNER_SIDEBAR_SECTIONS: ReadonlyArray<SidebarSectionDef> = [
  { id: "partner-main" },
  { id: "partner-utility" },
];

export const PARTNER_HUB_SECTIONS: ReadonlyArray<SidebarSectionDef> = [
  { id: "hub-overview" },
  { id: "hub-catalog" },
  { id: "hub-orders" },
  { id: "partner-utility" },
];

export const PARTNER_HANDS_NAVIGATION: ReadonlyArray<SidebarNavigationItem> = [
  { icon: HandsDuotoneIcon, label: "Overview", href: "/partner/hands", section: "partner-main", color: "#f97316" },
  { icon: TeamDuotoneIcon, label: "Workforce", href: "/partner/hands/workforce", section: "partner-main", color: "#0891b2" },
  { icon: TeamDuotoneIcon, label: "Workers", href: "/partner/hands/workers", section: "partner-main", color: "#0891b2" },
  { icon: EnquiriesDuotoneIcon, label: "Requests", href: "/partner/hands/requests", section: "partner-main", badge: "pending-enquiries", color: "#2563eb" },
  { icon: ProjectsDuotoneIcon, label: "Assignments", href: "/partner/hands/assignments", section: "partner-main", color: "#6366f1" },
  { icon: CalendarDuotoneIcon, label: "Attendance", href: "/partner/hands/attendance", section: "partner-main", color: "#ea580c" },
  { icon: ProjectsDuotoneIcon, label: "Projects", href: "/partner/hands/projects", section: "partner-main", color: "#6366f1" },
  { icon: PaymentsDuotoneIcon, label: "Payments", href: "/partner/hands/payments", section: "partner-main", color: "#10b981" },
  { icon: DocumentsDuotoneIcon, label: "Documents", href: "/partner/hands/documents", section: "partner-main", color: "#0284c7" },
  { icon: AnalyticsDuotoneIcon, label: "Performance", href: "/partner/hands/performance", section: "partner-main", color: "#ec4899" },
  { icon: SettingsDuotoneIcon, label: "Settings", href: "/partner/settings", section: "partner-utility", color: "#64748b" },
  { icon: HelpDuotoneIcon, label: "Help & Support", href: "/partner/help", section: "partner-utility", color: "#0284c7" },
];

export const PARTNER_HUB_NAVIGATION: ReadonlyArray<SidebarNavigationItem> = [
  { icon: HubDuotoneIcon, label: "Home", href: "/partner/hub", section: "hub-overview", color: "#2563eb" },
  { icon: MoreToolsDuotoneIcon, label: "Products", href: "/partner/hub/products", section: "hub-catalog", color: "#8b5cf6" },
  {
    icon: ProjectsDuotoneIcon,
    label: "Inventory",
    href: "/partner/hub/inventory",
    section: "hub-catalog",
    color: "#f59e0b",
    isLocked: true,
    lockedTitle: "Depot Inventory Tracking Locked",
    lockedMessage: "Inventory stock levels and bay locations are managed contextually inside the Products workspace during Beta trials.",
    lockedPerks: [
      "Manage real-time stock levels directly within material SKUs",
      "Assign and update warehouse depot bay locations per SKU",
      "Focus on the core operational loop: Manage Products → Fulfil Orders",
    ],
  },
  {
    icon: TeamDuotoneIcon,
    label: "Suppliers",
    href: "/partner/hub/suppliers",
    section: "hub-catalog",
    color: "#0891b2",
    isLocked: true,
    lockedTitle: "Supplier Directory Locked",
    lockedMessage: "Authorized suppliers and manufacturers are linked directly to material SKUs during Beta trials.",
    lockedPerks: [
      "Track brand and distributor data within each product spec",
      "Automated manufacturer spec generation via Odin AI",
      "Dedicated multi-vendor procurement unlocks in subsequent releases",
    ],
  },
  { icon: EnquiriesDuotoneIcon, label: "Orders", href: "/partner/hub/orders", section: "hub-orders", badge: "pending-enquiries", color: "#2563eb" },
  { icon: CalendarDuotoneIcon, label: "Calendar", href: "/partner/hub/calendar", section: "hub-orders", color: "#ea580c" },
  { icon: PaymentsDuotoneIcon, label: "Payments", href: "/partner/hub/payments", section: "hub-orders", color: "#10b981" },
  { icon: HelpDuotoneIcon, label: "Support", href: "/partner/help", section: "partner-utility", color: "#0284c7" },
];

export const PARTNER_BASICS_NAVIGATION: ReadonlyArray<SidebarNavigationItem> = [
  { icon: BasicsDuotoneIcon, label: "Overview", href: "/partner/basics", section: "partner-main", color: "#10b981" },
  { icon: MoreToolsDuotoneIcon, label: "Services", href: "/partner/basics/services", section: "partner-main", color: "#8b5cf6" },
  { icon: EnquiriesDuotoneIcon, label: "Requests", href: "/partner/basics/requests", section: "partner-main", badge: "pending-enquiries", color: "#2563eb" },
  { icon: TeamDuotoneIcon, label: "Customers", href: "/partner/basics/customers", section: "partner-main", color: "#0891b2" },
  { icon: ProjectsDuotoneIcon, label: "Assignments", href: "/partner/basics/assignments", section: "partner-main", color: "#6366f1" },
  { icon: ProjectsDuotoneIcon, label: "Projects", href: "/partner/basics/projects", section: "partner-main", color: "#6366f1" },
  { icon: CalendarDuotoneIcon, label: "Schedule", href: "/partner/basics/schedule", section: "partner-main", color: "#ea580c" },
  { icon: PaymentsDuotoneIcon, label: "Payments", href: "/partner/basics/payments", section: "partner-main", color: "#10b981" },
  { icon: DocumentsDuotoneIcon, label: "Documents", href: "/partner/basics/documents", section: "partner-main", color: "#0284c7" },
  { icon: AnalyticsDuotoneIcon, label: "Performance", href: "/partner/basics/performance", section: "partner-main", color: "#ec4899" },
  { icon: SettingsDuotoneIcon, label: "Settings", href: "/partner/settings", section: "partner-utility", color: "#64748b" },
  { icon: HelpDuotoneIcon, label: "Help & Support", href: "/partner/help", section: "partner-utility", color: "#0284c7" },
];

export function isClientPath(pathname: string): boolean {
  return pathname.startsWith("/client");
}

export function isPartnerPath(pathname: string): boolean {
  return pathname.startsWith("/partner");
}

export function getPartnerTypeFromPath(pathname: string): "HANDS" | "HUB" | "BASICS" {
  if (pathname.startsWith("/partner/hub")) return "HUB";
  if (pathname.startsWith("/partner/basics")) return "BASICS";
  if (pathname.startsWith("/partner/hands")) return "HANDS";

  if (typeof document !== "undefined") {
    const cookies = document.cookie.split(";").map((c) => c.trim());
    const typeCookie = cookies.find((c) => c.startsWith("kallisto_partner_type="));
    if (typeCookie) {
      const val = decodeURIComponent(typeCookie.split("=")[1]).toUpperCase();
      if (val === "HUB") return "HUB";
      if (val === "BASICS") return "BASICS";
    }
  }

  return "HANDS";
}

export function getSidebarSectionsForPath(pathname: string): ReadonlyArray<SidebarSectionDef> {
  if (isPartnerPath(pathname)) {
    const partnerType = getPartnerTypeFromPath(pathname);
    if (partnerType === "HUB") {
      return PARTNER_HUB_SECTIONS;
    }
    return PARTNER_SIDEBAR_SECTIONS;
  }
  return isClientPath(pathname) ? CLIENT_SIDEBAR_SECTIONS : PROVIDER_SIDEBAR_SECTIONS;
}

export function getSidebarNavigationForPath(pathname: string): ReadonlyArray<SidebarNavigationItem> {
  if (isPartnerPath(pathname)) {
    const partnerType = getPartnerTypeFromPath(pathname);
    switch (partnerType) {
      case "HUB":
        return PARTNER_HUB_NAVIGATION;
      case "BASICS":
        return PARTNER_BASICS_NAVIGATION;
      case "HANDS":
      default:
        return PARTNER_HANDS_NAVIGATION;
    }
  }
  return isClientPath(pathname) ? CLIENT_SIDEBAR_NAVIGATION : PROVIDER_SIDEBAR_NAVIGATION;
}

export function isSidebarItemActive(pathname: string, href: string): boolean {
  if (href === "/studio") {
    return pathname === "/" || pathname === "/studio" || pathname.startsWith("/studio/");
  }

  if (href === "/client/overview") {
    return pathname === "/client" || pathname === "/client/overview" || pathname.startsWith("/client/overview/");
  }

  if (href === "/partner/hands" || href === "/partner/hub" || href === "/partner/basics") {
    return pathname === href || pathname === `${href}/` || pathname === "/partner" || pathname === "/partner/overview";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

