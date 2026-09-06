"use client";

import React, { useState } from "react";
import {
  UserDuotoneIcon,
  ShieldDuotoneIcon,
  BuildingDuotoneIcon,
  MapPinDuotoneIcon,
  BoxesDuotoneIcon,
  BellDuotoneIcon,
  PaletteDuotoneIcon,
} from "@/components/layout/sidebar-icons";
import { usePartnerAuth } from "../auth/context/partner-auth-context";
import { getPartnerConfig } from "../shared/config/partner-config";
import { PartnerProfileSettings } from "./components/partner-profile-settings";
import { PartnerSecuritySettings } from "./components/partner-security-settings";
import { PartnerBusinessSettings } from "./components/partner-business-settings";
import { PartnerFulfilmentSettings } from "./components/partner-fulfilment-settings";
import { PartnerCatalogueSettings } from "./components/partner-catalogue-settings";
import { PartnerNotificationsSettings } from "./components/partner-notifications-settings";
import { PartnerPreferencesSettings } from "./components/partner-preferences-settings";
import styles from "./styles/partner-settings.module.css";

export type PartnerSettingsSectionId =
  | "profile"
  | "security"
  | "business"
  | "fulfilment"
  | "catalogue"
  | "notifications"
  | "preferences";

export interface SettingsNavCategory {
  id: string;
  label: string;
  items: Array<{
    id: PartnerSettingsSectionId;
    label: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
    description: string;
  }>;
}

export const PARTNER_SETTINGS_CATEGORIES: SettingsNavCategory[] = [
  {
    id: "account",
    label: "Account",
    items: [
      {
        id: "profile",
        label: "Profile",
        icon: UserDuotoneIcon,
        description: "Personal identity and contact details",
      },
      {
        id: "security",
        label: "Security & Login",
        icon: ShieldDuotoneIcon,
        description: "Password, two-factor authentication and active sessions",
      },
    ],
  },
  {
    id: "operations",
    label: "Business & Logistics",
    items: [
      {
        id: "business",
        label: "Business Profile",
        icon: BuildingDuotoneIcon,
        description: "GSTIN, trade licensing and bank settlement details",
      },
      {
        id: "fulfilment",
        label: "Fulfilment & Delivery Zones",
        icon: MapPinDuotoneIcon,
        description: "Depot coverage radius, warehouse location and fleet dispatch",
      },
    ],
  },
  {
    id: "catalogue",
    label: "Catalogue & Orders",
    items: [
      {
        id: "catalogue",
        label: "Catalogue Preferences",
        icon: BoxesDuotoneIcon,
        description: "Default markup, stock telemetry alerts and instant quotes",
      },
      {
        id: "notifications",
        label: "Dispatch Notifications",
        icon: BellDuotoneIcon,
        description: "Order alerts, WhatsApp driver telemetry and escrow receipts",
      },
    ],
  },
  {
    id: "preferences",
    label: "Preferences",
    items: [
      {
        id: "preferences",
        label: "Appearance & Region",
        icon: PaletteDuotoneIcon,
        description: "Theme selection, density, currency and date formats",
      },
    ],
  },
];

export function PartnerSettingsHub() {
  const { partnerType } = usePartnerAuth();
  const config = getPartnerConfig(partnerType);
  const [activeSection, setActiveSection] = useState<PartnerSettingsSectionId>("profile");

  return (
    <div className={styles.settingsPageLayout}>
      <header className={styles.settingsFixedHeader}>
        <p className={styles.eyebrow}>{config.displayName}</p>
        <h1 className={styles.settingsTitle}>Settings</h1>
        <p className={styles.settingsDescription}>
          Configure your operational partner profile, business licensing, catalogue preferences, notifications, security, and account access.
        </p>
      </header>

      <div className={styles.twoPaneContainer}>
        {/* Left Navigation Sidebar */}
        <aside className={styles.navFixedAside}>
          <nav className={styles.navSidebar} aria-label="Partner settings navigation">
            {PARTNER_SETTINGS_CATEGORIES.map((category) => (
              <div key={category.id} className={styles.navGroup}>
                <div className={styles.navGroupLabel}>{category.label}</div>
                {category.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setActiveSection(item.id)}
                      className={`${styles.navLink} ${isActive ? styles.navLinkActive : ""}`}
                      aria-current={isActive ? "page" : undefined}
                    >
                      <Icon size={16} className={styles.navIcon} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            ))}
          </nav>
        </aside>

        {/* Right Scrollable Content Outlet */}
        <main className={styles.contentScrollableOutlet}>
          <div className={styles.contentScrollArea}>
            {activeSection === "profile" && <PartnerProfileSettings />}
            {activeSection === "security" && <PartnerSecuritySettings />}
            {activeSection === "business" && <PartnerBusinessSettings />}
            {activeSection === "fulfilment" && <PartnerFulfilmentSettings />}
            {activeSection === "catalogue" && <PartnerCatalogueSettings />}
            {activeSection === "notifications" && <PartnerNotificationsSettings />}
            {activeSection === "preferences" && <PartnerPreferencesSettings />}
          </div>
        </main>
      </div>
    </div>
  );
}
