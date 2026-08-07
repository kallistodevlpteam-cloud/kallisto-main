"use client";

import {
  Globe2,
  PanelLeft,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { KallistoBrand } from "./kallisto-brand";
import { isSidebarItemActive, SIDEBAR_NAVIGATION } from "./sidebar-navigation";

interface SidebarRailProps {
  onToggleSidebar?: () => void;
  pendingEnquiryCount?: number | null;
}

export function SidebarRail({ onToggleSidebar, pendingEnquiryCount = null }: SidebarRailProps) {
  const pathname = usePathname();

  return (
    <aside className="sidebar sidebar--rail" aria-label="Compact navigation">
      <div className="rail-top">
        {onToggleSidebar && (
          <button
            className="rail-toggle-btn"
            type="button"
            onClick={onToggleSidebar}
            aria-label="Expand sidebar"
            title="Expand sidebar"
          >
            <PanelLeft size={17} strokeWidth={1.8} />
          </button>
        )}
        <div className="rail-brand">
          <KallistoBrand compact />
        </div>
      </div>

      <nav className="rail-nav" aria-label="Quick links">
        {SIDEBAR_NAVIGATION.map(({ icon: Icon, label, href, badge }) => {
          const isActive = isSidebarItemActive(pathname, href);
          const hasPendingEnquiries = badge === "pending-enquiries" && pendingEnquiryCount !== null && pendingEnquiryCount > 0;
          return (
            <Link
              key={label}
              href={href}
              className={`rail-button${isActive ? " is-active" : ""}`}
              aria-label={hasPendingEnquiries ? `${label}, ${pendingEnquiryCount} pending` : label}
              title={label}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon size={18} strokeWidth={1.75} aria-hidden="true" />
              {hasPendingEnquiries && <span className="rail-notice-dot" aria-hidden="true" />}
            </Link>
          );
        })}
      </nav>

      <div className="rail-spacer" />

      <div className="rail-bottom">
        <Link className="rail-button" href="/public-profile" aria-label="Kallisto Ecosystem" title="Kallisto Ecosystem">
          <Globe2 size={18} strokeWidth={1.75} />
        </Link>
        <button className="rail-button rail-upgrade-btn" type="button" aria-label="Upgrade" title="Upgrade">
          <Zap size={16} fill="currentColor" />
        </button>
      </div>
    </aside>
  );
}
