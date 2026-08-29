import {
  Globe2,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { KallistoBrand } from "./kallisto-brand";
import { LockDuotoneIcon } from "./sidebar-icons";
import {
  isSidebarItemActive,
  getSidebarNavigationForPath,
  isClientPath,
  isPartnerPath,
  type SidebarNavigationItem,
} from "./sidebar-navigation";

interface SidebarRailProps {
  onToggleSidebar?: () => void;
  pendingEnquiryCount?: number | null;
  onLockedItemClick?: (item: SidebarNavigationItem) => void;
}

export function SidebarRail({
  onToggleSidebar,
  pendingEnquiryCount = null,
  onLockedItemClick,
}: SidebarRailProps) {
  const pathname = usePathname();
  const navigation = getSidebarNavigationForPath(pathname);
  const isClient = isClientPath(pathname);
  const isPartner = isPartnerPath(pathname);
  const isUtilityPinned = isClient || isPartner;

  const mainNavigation = isUtilityPinned
    ? navigation.filter((item) => item.section !== "client-utility" && item.section !== "partner-utility")
    : navigation;
  const bottomUtilityNavigation = isUtilityPinned
    ? navigation.filter((item) => item.section === "client-utility" || item.section === "partner-utility")
    : [];

  return (
    <aside className="sidebar sidebar--rail" aria-label="Compact navigation">
      <div className="rail-top">
        {onToggleSidebar ? (
          <button
            className="rail-brand-btn"
            type="button"
            onClick={onToggleSidebar}
            aria-label="Expand sidebar"
          >
            <KallistoBrand compact />
            <span className="rail-tooltip" role="tooltip">
              <span>Expand sidebar</span>
            </span>
          </button>
        ) : (
          <div className="rail-brand">
            <KallistoBrand compact />
          </div>
        )}
      </div>

      <nav className="rail-nav" aria-label="Quick links">
        {mainNavigation.map((item) => {
          const { icon: Icon, label, href, badge, isLocked, color } = item;
          const isActive = isSidebarItemActive(pathname, href);
          const hasPendingEnquiries = badge === "pending-enquiries" && pendingEnquiryCount !== null && pendingEnquiryCount > 0;
          const itemColor = color || "#64748b";

          if (isLocked) {
            return (
              <button
                key={label}
                type="button"
                className="rail-button rail-button--locked"
                onClick={() => onLockedItemClick?.(item)}
                aria-label={`${label} (Locked feature)`}
              >
                <Icon size={18} strokeWidth={1.75} style={{ color: itemColor }} aria-hidden="true" />
                <span className="rail-lock-dot" title="Locked feature">
                  <LockDuotoneIcon size={10} aria-hidden="true" />
                </span>
                <span className="rail-tooltip" role="tooltip">
                  <span>{label}</span>
                  <span className="rail-tooltip-locked-badge">
                    <LockDuotoneIcon size={9} aria-hidden="true" />
                    <span>Locked</span>
                  </span>
                </span>
              </button>
            );
          }

          return (
            <Link
              key={label}
              href={href}
              className={`rail-button${isActive ? " is-active" : ""}`}
              aria-label={hasPendingEnquiries ? `${label}, ${pendingEnquiryCount} pending` : label}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon size={18} strokeWidth={1.75} style={{ color: itemColor }} aria-hidden="true" />
              {hasPendingEnquiries && <span className="rail-notice-dot" aria-hidden="true" />}
              <span className="rail-tooltip" role="tooltip">
                <span>{label}</span>
                {hasPendingEnquiries && (
                  <span className="rail-tooltip-badge">{pendingEnquiryCount} pending</span>
                )}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="rail-spacer" />

      <div className="rail-bottom">
        {isUtilityPinned ? (
          bottomUtilityNavigation.map((item) => {
            const { icon: Icon, label, href, color } = item;
            const isActive = isSidebarItemActive(pathname, href);
            const itemColor = color || "#64748b";
            return (
              <Link
                key={label}
                href={href}
                className={`rail-button${isActive ? " is-active" : ""}`}
                aria-label={label}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon size={18} strokeWidth={1.75} style={{ color: itemColor }} aria-hidden="true" />
                <span className="rail-tooltip" role="tooltip">
                  <span>{label}</span>
                </span>
              </Link>
            );
          })
        ) : (
          <>
            <Link
              className="rail-button"
              href="/public-profile"
              aria-label="Kallisto Ecosystem"
            >
              <Globe2 size={18} strokeWidth={1.75} />
              <span className="rail-tooltip" role="tooltip">
                <span>Kallisto Ecosystem</span>
              </span>
            </Link>
            <button className="rail-button rail-upgrade-btn" type="button" aria-label="Upgrade">
              <Zap size={16} fill="currentColor" />
              <span className="rail-tooltip" role="tooltip">
                <span>Upgrade Plan</span>
              </span>
            </button>
          </>
        )}
      </div>
    </aside>
  );
}
