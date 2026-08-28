"use client";

import {
  Globe2,
  Send,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { KallistoBrand } from "./kallisto-brand";
import { LockDuotoneIcon, SidebarToggleDuotoneIcon } from "./sidebar-icons";
import {
  isSidebarItemActive,
  getSidebarSectionsForPath,
  getSidebarNavigationForPath,
  isClientPath,
  type SidebarNavigationItem,
} from "./sidebar-navigation";

interface SidebarExpandedProps {
  pendingEnquiryCount?: number | null;
  onToggleAccountPopover?: (initialView?: "main" | "switcher") => void;
  onToggleSidebar?: () => void;
  onLockedItemClick?: (item: SidebarNavigationItem) => void;
}

export function SidebarExpanded({
  pendingEnquiryCount = null,
  onToggleAccountPopover: _onToggleAccountPopover,
  onToggleSidebar,
  onLockedItemClick,
}: SidebarExpandedProps) {
  const pathname = usePathname();
  const sections = getSidebarSectionsForPath(pathname);
  const navigation = getSidebarNavigationForPath(pathname);
  const isClient = isClientPath(pathname);

  // In Client mode, utility items (Settings, Help & Support) are pinned at the bottom footer
  const scrollableSections = isClient
    ? sections.filter((s) => s.id !== "client-utility")
    : sections;
  const clientUtilityItems = isClient
    ? navigation.filter((item) => item.section === "client-utility")
    : [];

  return (
    <aside className="sidebar sidebar--expanded" aria-label="Primary navigation">
      <div className="sidebar-brand-header">
        <KallistoBrand />
        {onToggleSidebar && (
          <button
            className="sidebar-collapse-btn"
            type="button"
            aria-label="Collapse sidebar"
            onClick={onToggleSidebar}
            title="Collapse sidebar"
          >
            <SidebarToggleDuotoneIcon size={18} />
          </button>
        )}
      </div>

      <div className="sidebar-scrollable">
        {scrollableSections.map((section) => {
          const items = navigation.filter((item) => item.section === section.id);
          if (items.length === 0) return null;

          return (
            <section
              className="nav-section"
              key={section.id}
              aria-label={`${section.label ?? section.id} navigation`}
            >
              {section.label && <div className="nav-section-header">{section.label}</div>}
              <nav className="nav-stack">
                {items.map((item) => {
                  const { icon: Icon, label, href, badge, isLocked } = item;
                  const isActive = isSidebarItemActive(pathname, href);
                  const badgeCount = badge === "pending-enquiries" ? pendingEnquiryCount : null;

                  if (isLocked) {
                    return (
                      <button
                        key={label}
                        type="button"
                        className="nav-row nav-row--locked"
                        onClick={() => onLockedItemClick?.(item)}
                        aria-label={`${label} (Locked feature)`}
                      >
                        <Icon size={16} strokeWidth={1.75} className="nav-icon" aria-hidden="true" />
                        <span className="nav-label" title={label}>{label}</span>
                        <span className="nav-lock-badge" title="Locked feature">
                          <LockDuotoneIcon size={13} aria-hidden="true" />
                        </span>
                      </button>
                    );
                  }

                  return (
                    <Link
                      key={label}
                      className={`nav-row${isActive ? " is-active" : ""}`}
                      href={href}
                      aria-current={isActive ? "page" : undefined}
                    >
                      <Icon size={16} strokeWidth={1.75} className="nav-icon" aria-hidden="true" />
                      <span className="nav-label" title={label}>{label}</span>
                      {badgeCount !== null && badgeCount > 0 && (
                        <span className="nav-badge" aria-label={`${badgeCount} pending enquiries`}>
                          {badgeCount}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </section>
          );
        })}
      </div>

      <div className={`sidebar-footer${isClient ? " sidebar-footer--client" : ""}`}>
        {isClient ? (
          <div className="client-sidebar-bottom-utility">
            <div
              className="client-bottom-divider"
              style={{
                margin: "0 0 8px 0",
                borderTop: "1px solid var(--border-subtle, rgba(226, 232, 240, 0.8))",
              }}
            />
            <nav className="nav-stack" aria-label="Utility navigation">
              {clientUtilityItems.map((item) => {
                const { icon: Icon, label, href } = item;
                const isActive = isSidebarItemActive(pathname, href);
                return (
                  <Link
                    key={label}
                    className={`nav-row${isActive ? " is-active" : ""}`}
                    href={href}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <Icon size={16} strokeWidth={1.75} className="nav-icon" aria-hidden="true" />
                    <span className="nav-label" title={label}>{label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        ) : (
          <>
            <button className="invite-banner-card" type="button" aria-label="Invite team members to this workspace">
              <span className="invite-banner-icon">
                <Send size={13} />
              </span>
              <span className="invite-banner-text">
                <strong>Invite team members</strong>
                <small>Bring your studio into one workspace.</small>
              </span>
            </button>

            <Link className="ecosystem-link-row" href="/public-profile">
              <Globe2 size={15} strokeWidth={1.75} />
              <span>Kallisto Ecosystem</span>
            </Link>

            <button className="upgrade-pill-btn" type="button">
              <Zap size={14} className="upgrade-sparkle" fill="currentColor" />
              <span>Upgrade</span>
            </button>
          </>
        )}
      </div>
    </aside>
  );
}
