"use client";

import {
  ChevronDown,
  Globe2,
  PanelLeft,
  Send,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { KallistoBrand } from "./kallisto-brand";
import {
  isSidebarItemActive,
  SIDEBAR_NAVIGATION,
  SIDEBAR_SECTIONS,
} from "./sidebar-navigation";
import { WORKSPACE_CONFIG } from "@/lib/config/workspace-config";

interface SidebarExpandedProps {
  pendingEnquiryCount?: number | null;
  onToggleAccountPopover?: (initialView?: "main" | "switcher") => void;
  onToggleSidebar?: () => void;
}

function useHasOverflow(value: string) {
  const ref = useRef<HTMLElement>(null);
  const [hasOverflow, setHasOverflow] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const measure = () => {
      setHasOverflow(element.scrollWidth > element.clientWidth + 1);
    };

    measure();
    const resizeObserver =
      typeof ResizeObserver === "undefined" ? null : new ResizeObserver(measure);
    resizeObserver?.observe(element);
    const mutationObserver = new MutationObserver(measure);
    mutationObserver.observe(element, {
      childList: true,
      characterData: true,
      subtree: true,
    });

    window.addEventListener("resize", measure);
    return () => {
      resizeObserver?.disconnect();
      mutationObserver.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [value]);

  return { ref, hasOverflow };
}

export function SidebarExpanded({
  pendingEnquiryCount = null,
  onToggleAccountPopover,
  onToggleSidebar,
}: SidebarExpandedProps) {
  const pathname = usePathname();
  const workspaceName = WORKSPACE_CONFIG.currentWorkspaceName;
  const workspaceTooltipId = "workspace-name-tooltip";
  const { ref: workspaceNameRef, hasOverflow: workspaceNameOverflows } =
    useHasOverflow(workspaceName);

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
            <PanelLeft size={18} strokeWidth={1.8} />
          </button>
        )}
      </div>

      <button
        className="workspace-selector-card"
        type="button"
        aria-label={`Switch workspace, ${workspaceName}`}
        aria-describedby={workspaceNameOverflows ? workspaceTooltipId : undefined}
        onClick={() => onToggleAccountPopover?.("switcher")}
      >
        <span className="workspace-avatar">AA</span>
        <span className="workspace-meta">
          <strong ref={workspaceNameRef}>{workspaceName}</strong>
          <small>{WORKSPACE_CONFIG.workspaceType}</small>
        </span>
        <ChevronDown size={14} className="workspace-chevron" strokeWidth={2} />
        {workspaceNameOverflows ? (
          <span
            id={workspaceTooltipId}
            className="sidebar-overflow-tooltip"
            role="tooltip"
          >
            {workspaceName}
          </span>
        ) : null}
      </button>

      <div className="sidebar-scrollable">
        {SIDEBAR_SECTIONS.map((section) => {
          const items = SIDEBAR_NAVIGATION.filter((item) => item.section === section.id);

          return (
            <section className="nav-section" key={section.id} aria-label={`${section.label ?? section.id} navigation`}>
              {section.label && <div className="nav-section-header">{section.label}</div>}
              <nav className="nav-stack">
                {items.map(({ icon: Icon, label, href, badge }) => {
                  const isActive = isSidebarItemActive(pathname, href);
                  const badgeCount = badge === "pending-enquiries" ? pendingEnquiryCount : null;

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

      <div className="sidebar-footer">
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
      </div>
    </aside>
  );
}
