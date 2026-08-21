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
} from "./sidebar-icons";

export type SidebarSection = "home" | "work" | "business" | "presence" | "connectors" | "utility";
export type SidebarBadge = "pending-enquiries";

export interface SidebarNavigationItem {
  icon: React.ComponentType<{ size?: number | string; className?: string; [key: string]: any }>;
  label: string;
  href: string;
  section: SidebarSection;
  badge?: SidebarBadge;
}

export const SIDEBAR_SECTIONS: ReadonlyArray<{
  id: SidebarSection;
  label?: "Work" | "Business" | "Presence" | "Connectors";
}> = [
  { id: "home" },
  { id: "work", label: "Work" },
  { id: "business", label: "Business" },
  { id: "presence", label: "Presence" },
  { id: "connectors", label: "Connectors" },
  { id: "utility" },
];

export const SIDEBAR_NAVIGATION: ReadonlyArray<SidebarNavigationItem> = [
  { icon: HomeDuotoneIcon, label: "Home", href: "/home", section: "home" },
  { icon: EnquiriesDuotoneIcon, label: "Enquiries", href: "/enquiries", section: "work", badge: "pending-enquiries" },
  { icon: ProjectsDuotoneIcon, label: "Projects", href: "/projects", section: "work" },
  { icon: StudioDuotoneIcon, label: "Hive Studio", href: "/studio", section: "work" },
  { icon: CalendarDuotoneIcon, label: "Calendar", href: "/calendar", section: "work" },
  { icon: TeamDuotoneIcon, label: "Team", href: "/team", section: "work" },
  { icon: PaymentsDuotoneIcon, label: "Payments", href: "/payments", section: "business" },
  { icon: AnalyticsDuotoneIcon, label: "Analytics", href: "/analytics", section: "business" },
  { icon: PortfolioDuotoneIcon, label: "Portfolio", href: "/portfolio", section: "presence" },
  { icon: HubDuotoneIcon, label: "Hub", href: "/hub", section: "connectors" },
  { icon: HandsDuotoneIcon, label: "Hands", href: "/hands", section: "connectors" },
  { icon: BasicsDuotoneIcon, label: "Basics", href: "/basics", section: "connectors" },
  { icon: DeveloperDuotoneIcon, label: "Developer", href: "/developer", section: "utility" },
  { icon: MoreToolsDuotoneIcon, label: "More tools", href: "/tools", section: "utility" },
];

export function isSidebarItemActive(pathname: string, href: string): boolean {
  if (href === "/home") {
    return pathname === "/" || pathname === "/home" || pathname.startsWith("/home/");
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}
