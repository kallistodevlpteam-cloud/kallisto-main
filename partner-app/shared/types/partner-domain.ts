export type PartnerType = "HANDS" | "HUB" | "BASICS" | string;

export interface PartnerUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  role: "partner_admin" | "partner_manager" | "partner_operator" | "partner_finance";
  partnerType: PartnerType;
  partnerBusinessName: string;
  location: string;
  verified: boolean;
}

export interface PartnerSession {
  user: PartnerUser;
  partnerType: PartnerType;
  token: string;
  permissions: string[];
  expiresAt: number;
}

export interface PartnerMetric {
  id: string;
  label: string;
  value: string | number;
  change?: string;
  trend?: "up" | "down" | "neutral";
  caption: string;
  colorTheme?: string;
}

export interface PartnerActivityItem {
  id: string;
  title: string;
  subtitle: string;
  timeAgo: string;
  type: "request" | "deployment" | "inventory" | "delivery" | "payment" | "alert" | "system";
  status?: "pending" | "approved" | "completed" | "in_transit" | "urgent";
}

export interface PartnerQuickAction {
  id: string;
  label: string;
  description: string;
  href: string;
  iconName?: string;
  primary?: boolean;
}
