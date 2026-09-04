"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  User,
  Shield,
  Sliders,
  Users,
  Bell,
  MessageSquare,
  CreditCard,
  Receipt,
  Palette,
  Globe,
  Lock,
} from "lucide-react";
import styles from "../styles/client-settings.module.css";

export interface SettingsNavCategory {
  id: string;
  label: string;
  items: Array<{
    href: string;
    label: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
    description: string;
  }>;
}

export const CLIENT_SETTINGS_CATEGORIES: SettingsNavCategory[] = [
  {
    id: "account",
    label: "Account",
    items: [
      {
        href: "/client/settings/profile",
        label: "Profile",
        icon: User,
        description: "Personal identity and contact preferences",
      },
      {
        href: "/client/settings/security",
        label: "Security & Login",
        icon: Shield,
        description: "Password, two-factor authentication and active sessions",
      },
    ],
  },
  {
    id: "projects",
    label: "Projects",
    items: [
      {
        href: "/client/settings/project-preferences",
        label: "Project Preferences",
        icon: Sliders,
        description: "Default project, units and delivery view options",
      },
      {
        href: "/client/settings/project-access",
        label: "Project Access",
        icon: Users,
        description: "Manage collaborator permissions across your projects",
      },
    ],
  },
  {
    id: "communication",
    label: "Communication",
    items: [
      {
        href: "/client/settings/notifications",
        label: "Notifications",
        icon: Bell,
        description: "Project alerts, payments, and delivery channels",
      },
      {
        href: "/client/settings/communication",
        label: "Communication Preferences",
        icon: MessageSquare,
        description: "Preferred contact method and provider channels",
      },
    ],
  },
  {
    id: "payments",
    label: "Payments",
    items: [
      {
        href: "/client/settings/payment-methods",
        label: "Payment Methods",
        icon: CreditCard,
        description: "UPI IDs, saved cards and linked bank accounts",
      },
      {
        href: "/client/settings/billing",
        label: "Billing & Invoices",
        icon: Receipt,
        description: "Transaction history, milestone receipts and statements",
      },
    ],
  },
  {
    id: "preferences",
    label: "Preferences",
    items: [
      {
        href: "/client/settings/appearance",
        label: "Appearance",
        icon: Palette,
        description: "Theme selection and layout density",
      },
      {
        href: "/client/settings/language-region",
        label: "Language & Region",
        icon: Globe,
        description: "Locale, currency, and date formats",
      },
      {
        href: "/client/settings/privacy",
        label: "Privacy & Data",
        icon: Lock,
        description: "Project data access, Odin AI context and data archive",
      },
    ],
  },
];

export function ClientSettingsNavigation() {
  const pathname = usePathname();

  return (
    <nav className={styles.navSidebar} aria-label="Client settings navigation">
      {CLIENT_SETTINGS_CATEGORIES.map((category) => (
        <div key={category.id} className={styles.navGroup}>
          <div className={styles.navGroupLabel}>{category.label}</div>
          {category.items.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.navLink} ${isActive ? styles.navLinkActive : ""}`}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon size={16} className={styles.navIcon} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}
