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
  Bot,
  HelpCircle,
  Code2,
} from "lucide-react";
import styles from "../../app/settings/settings.module.css";

interface SettingsNavigationProps {
  showDeveloperTab: boolean;
}

export interface NavCategory {
  id: string;
  label: string;
  items: Array<{
    href: string;
    label: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
  }>;
}

export const SETTINGS_CATEGORIES: NavCategory[] = [
  {
    id: "account",
    label: "ACCOUNT",
    items: [
      { href: "/settings/account", label: "Profile", icon: User },
      { href: "/settings/security", label: "Security & Login", icon: Shield },
    ],
  },
  {
    id: "projects",
    label: "PROJECTS",
    items: [
      { href: "/settings/workspace", label: "Project Preferences", icon: Sliders },
      { href: "/settings/team", label: "Project Access", icon: Users },
    ],
  },
  {
    id: "communication",
    label: "COMMUNICATION",
    items: [
      { href: "/settings/notifications", label: "Notifications", icon: Bell },
      { href: "/settings/business-profile", label: "Communication Preferences", icon: MessageSquare },
    ],
  },
  {
    id: "payments",
    label: "PAYMENTS",
    items: [
      { href: "/settings/services", label: "Payment Methods", icon: CreditCard },
      { href: "/settings/billing", label: "Billing & Invoices", icon: Receipt },
    ],
  },
  {
    id: "preferences",
    label: "PREFERENCES",
    items: [
      { href: "/settings/appearance", label: "Appearance", icon: Palette },
      { href: "/settings/odin-ai", label: "Odin AI Controls", icon: Bot },
      { href: "/settings/help", label: "Help & Support", icon: HelpCircle },
    ],
  },
];

export function SettingsNavigation({ showDeveloperTab }: SettingsNavigationProps) {
  const pathname = usePathname();

  const categories = [
    ...SETTINGS_CATEGORIES,
    ...(showDeveloperTab
      ? [
          {
            id: "developer",
            label: "DEVELOPER",
            items: [{ href: "/settings/developer", label: "Developer API", icon: Code2 }],
          },
        ]
      : []),
  ];

  return (
    <aside className={styles.navFixedAside}>
      <nav className={styles.navSidebar} aria-label="Settings Categories">
        {categories.map((category) => (
          <div key={category.id} className={styles.navGroup}>
            <div className={styles.navGroupLabel}>{category.label}</div>
            {category.items.map((item) => {
              const isActive =
                pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/settings/account");
              const IconComponent = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`${styles.navLink} ${isActive ? styles.navLinkActive : ""}`}
                  aria-current={isActive ? "page" : undefined}
                >
                  <IconComponent size={16} className={styles.navIcon} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
    </aside>
  );
}
