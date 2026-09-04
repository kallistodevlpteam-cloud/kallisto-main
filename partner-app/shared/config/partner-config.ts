import { PartnerType } from "../types/partner-domain";

export interface PartnerConfig {
  type: PartnerType;
  displayName: string;
  shortName: string;
  portalTitle: string;
  tagline: string;
  badgeLabel: string;
  accentColor: string;
  lightBgColor: string;
  borderColor: string;
  defaultRoute: string;
  odinRoleName: string;
  odinSamplePrompts: string[];
  description: string;
}

export const PARTNER_CONFIGS: Record<string, PartnerConfig> = {
  HANDS: {
    type: "HANDS",
    displayName: "Kallisto Hands",
    shortName: "Hands",
    portalTitle: "Hands Workforce Workspace",
    tagline: "Workforce, Trades & On-Site Labor Operations",
    badgeLabel: "Workforce Partner",
    accentColor: "#0284c7",
    lightBgColor: "#f0f9ff",
    borderColor: "#bae6fd",
    defaultRoute: "/partner/hands",
    odinRoleName: "Workforce Intelligence",
    odinSamplePrompts: [
      "Odin, show me today's available workers.",
      "Odin, which workforce requests are pending?",
      "Odin, show today's worker assignments.",
      "Odin, check trade attendance compliance.",
    ],
    description: "Manage trade crews, on-site personnel deployments, attendance verification, and partner contractor disbursements.",
  },
  HUB: {
    type: "HUB",
    displayName: "Kallisto Hub",
    shortName: "Hub",
    portalTitle: "Hub Material Logistics",
    tagline: "Materials, Supplies & Delivery Logistics",
    badgeLabel: "Material Partner",
    accentColor: "#7c3aed",
    lightBgColor: "#f5f3ff",
    borderColor: "#ddd6fe",
    defaultRoute: "/partner/hub",
    odinRoleName: "Supply Logistics Intelligence",
    odinSamplePrompts: [
      "Odin, show me pending material orders.",
      "Odin, which products are low in stock?",
      "Odin, show deliveries currently in transit.",
      "Odin, summarize open purchase orders.",
    ],
    description: "Manage product catalogs, warehouse inventory, contractor material orders, dispatch logistics, and delivery tracking.",
  },
  BASICS: {
    type: "BASICS",
    displayName: "Kallisto Basics",
    shortName: "Basics",
    portalTitle: "Basics Services Hub",
    tagline: "Specialist Services, Maintenance & Turnkey Teams",
    badgeLabel: "Services Partner",
    accentColor: "#059669",
    lightBgColor: "#ecfdf5",
    borderColor: "#a7f3d0",
    defaultRoute: "/partner/basics",
    odinRoleName: "Service Operations Intelligence",
    odinSamplePrompts: [
      "Odin, what service requests need attention today?",
      "Odin, show today's bookings.",
      "Odin, which assignments are overdue?",
      "Odin, view scheduled customer maintenance.",
    ],
    description: "Coordinate on-demand residential & commercial specialty services, routine maintenance, team assignments, and client satisfaction.",
  },
};

export const DEFAULT_PARTNER_TYPE: PartnerType = "HANDS";

export function getPartnerConfig(partnerType: PartnerType = DEFAULT_PARTNER_TYPE): PartnerConfig {
  const normalized = (partnerType || "").toUpperCase();
  return (
    PARTNER_CONFIGS[normalized] || {
      type: normalized,
      displayName: `Kallisto ${normalized.charAt(0) + normalized.slice(1).toLowerCase()}`,
      shortName: normalized,
      portalTitle: `${normalized} Partner Portal`,
      tagline: "Operational Business Workspace",
      badgeLabel: "Partner Workspace",
      accentColor: "#0f172a",
      lightBgColor: "#f8fafc",
      borderColor: "#e2e8f0",
      defaultRoute: `/partner/${normalized.toLowerCase()}`,
      odinRoleName: "Partner Intelligence",
      odinSamplePrompts: [
        "Odin, summarize today's operational status.",
        "Odin, show pending action items.",
      ],
      description: "Partner business operations portal within the Kallisto ecosystem.",
    }
  );
}

export const ALL_PARTNER_TYPES: PartnerType[] = ["HANDS", "HUB", "BASICS"];
