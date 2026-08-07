import {
  BarChart3,
  BookOpen,
  Calendar,
  CircleEllipsis,
  CreditCard,
  FolderKanban,
  Handshake,
  Home,
  Images,
  Inbox,
  Network,
  Sparkles,
  Users,
  type LucideIcon,
} from "lucide-react";

export type SidebarSection = "home" | "work" | "business" | "presence" | "connectors" | "utility";
export type SidebarBadge = "pending-enquiries";

export interface SidebarNavigationItem {
  icon: LucideIcon;
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
  { icon: Home, label: "Home", href: "/home", section: "home" },
  { icon: Inbox, label: "Enquiries", href: "/enquiries", section: "work", badge: "pending-enquiries" },
  { icon: FolderKanban, label: "Projects", href: "/projects", section: "work" },
  { icon: Sparkles, label: "Hive Studio", href: "/studio", section: "work" },
  { icon: Calendar, label: "Calendar", href: "/calendar", section: "work" },
  { icon: Users, label: "Team", href: "/team", section: "work" },
  { icon: CreditCard, label: "Payments", href: "/payments", section: "business" },
  { icon: BarChart3, label: "Analytics", href: "/analytics", section: "business" },
  { icon: Images, label: "Portfolio", href: "/portfolio", section: "presence" },
  { icon: Network, label: "Hub", href: "/hub", section: "connectors" },
  { icon: Handshake, label: "Hands", href: "/hands", section: "connectors" },
  { icon: BookOpen, label: "Basics", href: "/basics", section: "connectors" },
  { icon: CircleEllipsis, label: "More tools", href: "/tools", section: "utility" },
];

export function isSidebarItemActive(pathname: string, href: string): boolean {
  if (href === "/home") {
    return pathname === "/" || pathname === "/home" || pathname.startsWith("/home/");
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}
