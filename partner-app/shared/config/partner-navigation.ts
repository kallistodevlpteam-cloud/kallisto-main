import React from "react";
import {
  HomeDuotoneIcon,
  ProjectsDuotoneIcon,
  CalendarDuotoneIcon,
  TeamDuotoneIcon,
  PaymentsDuotoneIcon,
  AnalyticsDuotoneIcon,
  HandsDuotoneIcon,
  HubDuotoneIcon,
  BasicsDuotoneIcon,
  DocumentsDuotoneIcon,
  SettingsDuotoneIcon,
  EnquiriesDuotoneIcon,
  MoreToolsDuotoneIcon,
  HelpDuotoneIcon,
} from "@/components/layout/sidebar-icons";
import { PartnerType } from "../types/partner-domain";

export interface PartnerNavItem {
  id: string;
  label: string;
  href: string;
  icon: React.ComponentType<{ size?: number | string; className?: string; [key: string]: unknown }>;
  section: "main" | "utility" | "odin";
  color?: string;
  badgeCount?: number;
  description?: string;
  isLocked?: boolean;
  dividerBefore?: boolean;
}

export interface PartnerNavSection {
  id: string;
  label?: string;
  items: PartnerNavItem[];
}

export const HANDS_NAVIGATION: PartnerNavItem[] = [
  { id: "overview", label: "Overview", href: "/partner/hands", icon: HandsDuotoneIcon, section: "main", color: "#f97316" },
  { id: "workers", label: "Workers", href: "/partner/hands/workers", icon: TeamDuotoneIcon, section: "main", color: "#0891b2", dividerBefore: true },
  { id: "requests", label: "Requests", href: "/partner/hands/requests", icon: EnquiriesDuotoneIcon, section: "main", badgeCount: 4, color: "#2563eb" },
  { id: "assignments", label: "Assignments", href: "/partner/hands/assignments", icon: ProjectsDuotoneIcon, section: "main", color: "#6366f1" },
  { id: "attendance", label: "Attendance", href: "/partner/hands/attendance", icon: CalendarDuotoneIcon, section: "main", color: "#ea580c" },
  { id: "projects", label: "Projects", href: "/partner/hands/projects", icon: ProjectsDuotoneIcon, section: "main", color: "#6366f1", dividerBefore: true },
  { id: "payments", label: "Payments", href: "/partner/hands/payments", icon: PaymentsDuotoneIcon, section: "main", color: "#10b981" },
  { id: "support", label: "Support", href: "/partner/help", icon: HelpDuotoneIcon, section: "utility", color: "#0284c7", dividerBefore: true },
  { id: "settings", label: "Settings", href: "/partner/settings", icon: SettingsDuotoneIcon, section: "utility", color: "#64748b" },
];

export const HUB_NAVIGATION: PartnerNavItem[] = [
  { id: "overview", label: "Home", href: "/partner/hub", icon: HubDuotoneIcon, section: "main", color: "#2563eb" },
  { id: "products", label: "Products", href: "/partner/hub/products", icon: MoreToolsDuotoneIcon, section: "main", color: "#8b5cf6" },
  { id: "inventory", label: "Inventory", href: "/partner/hub/inventory", icon: ProjectsDuotoneIcon, section: "main", color: "#f59e0b", isLocked: true },
  { id: "suppliers", label: "Suppliers", href: "/partner/hub/suppliers", icon: TeamDuotoneIcon, section: "main", color: "#0891b2", isLocked: true },
  { id: "orders", label: "Orders", href: "/partner/hub/orders", icon: EnquiriesDuotoneIcon, section: "main", badgeCount: 6, color: "#2563eb" },
  { id: "calendar", label: "Calendar", href: "/partner/hub/calendar", icon: CalendarDuotoneIcon, section: "main", color: "#ea580c" },
  { id: "payments", label: "Payments", href: "/partner/hub/payments", icon: PaymentsDuotoneIcon, section: "main", color: "#10b981" },
  { id: "support", label: "Support", href: "/partner/help", icon: HelpDuotoneIcon, section: "utility", color: "#0284c7" },
];

export const BASICS_NAVIGATION: PartnerNavItem[] = [
  { id: "overview", label: "Overview", href: "/partner/basics", icon: BasicsDuotoneIcon, section: "main", color: "#10b981" },
  { id: "services", label: "Services", href: "/partner/basics/services", icon: MoreToolsDuotoneIcon, section: "main", color: "#8b5cf6" },
  { id: "requests", label: "Requests", href: "/partner/basics/requests", icon: EnquiriesDuotoneIcon, section: "main", badgeCount: 3, color: "#2563eb" },
  { id: "customers", label: "Customers", href: "/partner/basics/customers", icon: TeamDuotoneIcon, section: "main", color: "#0891b2" },
  { id: "assignments", label: "Assignments", href: "/partner/basics/assignments", icon: ProjectsDuotoneIcon, section: "main", color: "#6366f1" },
  { id: "projects", label: "Projects", href: "/partner/basics/projects", icon: ProjectsDuotoneIcon, section: "main", color: "#6366f1" },
  { id: "schedule", label: "Schedule", href: "/partner/basics/schedule", icon: CalendarDuotoneIcon, section: "main", color: "#ea580c" },
  { id: "payments", label: "Payments", href: "/partner/basics/payments", icon: PaymentsDuotoneIcon, section: "main", color: "#10b981" },
  { id: "documents", label: "Documents", href: "/partner/basics/documents", icon: DocumentsDuotoneIcon, section: "main", color: "#0284c7" },
  { id: "performance", label: "Performance", href: "/partner/basics/performance", icon: AnalyticsDuotoneIcon, section: "main", color: "#ec4899" },
  { id: "settings", label: "Settings", href: "/partner/settings", icon: SettingsDuotoneIcon, section: "utility", color: "#64748b" },
];

export function getPartnerNavigation(partnerType: PartnerType): PartnerNavItem[] {
  const normalized = (partnerType || "").toUpperCase();
  switch (normalized) {
    case "HANDS":
      return HANDS_NAVIGATION;
    case "HUB":
      return HUB_NAVIGATION;
    case "BASICS":
      return BASICS_NAVIGATION;
    default:
      return [
        { id: "overview", label: "Overview", href: `/partner/${normalized.toLowerCase()}`, icon: HomeDuotoneIcon, section: "main" },
        { id: "projects", label: "Projects", href: `/partner/${normalized.toLowerCase()}/projects`, icon: ProjectsDuotoneIcon, section: "main" },
        { id: "documents", label: "Documents", href: `/partner/${normalized.toLowerCase()}/documents`, icon: DocumentsDuotoneIcon, section: "main" },
        { id: "settings", label: "Settings", href: "/partner/settings", icon: SettingsDuotoneIcon, section: "utility" },
      ];
  }
}

export function isPartnerItemActive(currentPath: string, href: string): boolean {
  if (currentPath === href) return true;
  // Handle root overview matches
  if (href === "/partner/hands" && (currentPath === "/partner/hands" || currentPath === "/partner/hands/")) return true;
  if (href === "/partner/hub" && (currentPath === "/partner/hub" || currentPath === "/partner/hub/")) return true;
  if (href === "/partner/basics" && (currentPath === "/partner/basics" || currentPath === "/partner/basics/")) return true;

  if (href !== "/partner/hands" && href !== "/partner/hub" && href !== "/partner/basics" && href !== "/partner/settings") {
    return currentPath.startsWith(href);
  }
  return false;
}
