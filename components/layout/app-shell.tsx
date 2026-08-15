"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getStoredAuthToken } from "@/lib/auth/authed-fetch";
import { OdinProvider } from "@/contexts/odin-context";
import { useOdin } from "@/hooks/use-odin";
import { usePendingEnquiryCount } from "@/hooks/use-pending-enquiry-count";
import { MainWorkspace } from "./main-workspace";
import { MobileScreenGuard } from "./mobile-screen-guard";
import { OdinPanel } from "./odin-panel";
import { SearchModal } from "./search-modal";
import { SidebarExpanded } from "./sidebar-expanded";
import { SidebarRail } from "./sidebar-rail";
import { TopBar } from "./top-bar";
// Developer console integration
import "../../developer-console/developer-console.css";
import { useDeveloperConsole } from "../../developer-console/hooks/useDeveloperConsole";
import { DeveloperReadinessDrawer } from "../../developer-console/components/DeveloperReadinessDrawer";
import {
  useShellResponsiveState,
} from "@/lib/layout/shell-responsive-contract";
import type { AppShellLayoutProfile } from "@/lib/layout/project-dashboard-responsive-contract";

interface AppShellProps {
  children?: React.ReactNode;
  layoutProfile?: AppShellLayoutProfile;
}

function AppShellContent({ children, layoutProfile = "default" }: AppShellProps) {
  const router = useRouter();
  const [userSidebarCollapsed, setUserSidebarCollapsed] = useState(false);

  // Client-side authentication gate
  useEffect(() => {
    const token = getStoredAuthToken();
    if (!token) {
      router.replace("/login");
    }
  }, [router]);
  const { assistantOpen, odinPinned, toggleAssistant, closeOdin } = useOdin();
  const responsiveState = useShellResponsiveState(userSidebarCollapsed, odinPinned);
  const { shellMode, sidebarMode, odinMode, canDockOdin } = responsiveState;

  const [mobileNavigationOpen, setMobileNavigationOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const pendingEnquiryCount = usePendingEnquiryCount();

  // Developer console state
  const [devConsoleOpen, setDevConsoleOpen] = useState(false);
  const consoleState = useDeveloperConsole();

  // Account Popover state
  const [accountOpen, setAccountOpen] = useState(false);
  const [accountInitialView, setAccountInitialView] = useState<"main" | "switcher">("main");

  const handleToggleAccountPopover = (view: "main" | "switcher" = "main") => {
    if (!accountOpen) {
      setAccountInitialView(view);
      setAccountOpen(true);
    } else if (accountInitialView !== view) {
      setAccountInitialView(view);
    } else {
      setAccountOpen(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Mobile navigation drawer visibility derived directly from shell mode
  const showMobileDrawer = shellMode === "mobile" && mobileNavigationOpen;

  // Sidebar state precedence: Wide mode uses user preference; Standard, Compact, and Mobile force rail
  const sidebarIsCollapsed = sidebarMode === "expanded-capable" ? userSidebarCollapsed : true;

  const handleSidebarToggle = () => {
    if (shellMode === "mobile") {
      closeOdin();
      setMobileNavigationOpen((prev) => !prev);
      return;
    }
    setUserSidebarCollapsed((current) => !current);
  };

  return (
    <div
      className={`app-shell${
        layoutProfile === "project-dashboard" ? " has-project-dashboard-profile" : ""
      }${sidebarIsCollapsed ? " is-sidebar-collapsed" : ""}${
        assistantOpen ? " is-assistant-open" : ""
      }`}
      data-shell-mode={shellMode}
      data-sidebar-mode={sidebarMode}
      data-sidebar-state={sidebarIsCollapsed ? "rail" : "expanded"}
      data-odin-mode={odinMode}
      data-odin-pinned={odinPinned ? "true" : "false"}
      data-odin-can-dock={canDockOdin ? "true" : "false"}
      data-odin-open={assistantOpen ? "true" : "false"}
    >
      <MobileScreenGuard />
      {sidebarIsCollapsed ? (
        <SidebarRail onToggleSidebar={handleSidebarToggle} pendingEnquiryCount={pendingEnquiryCount} />
      ) : (
        <SidebarExpanded
          pendingEnquiryCount={pendingEnquiryCount}
          onToggleAccountPopover={handleToggleAccountPopover}
          onToggleSidebar={handleSidebarToggle}
        />
      )}

      <div className="shell-center">
        <TopBar
          sidebarCollapsed={sidebarIsCollapsed}
          onToggleSidebar={handleSidebarToggle}
          assistantOpen={assistantOpen}
          onToggleAssistant={() => {
            setMobileNavigationOpen(false);
            toggleAssistant();
          }}
          onToggleNavigation={() => {
            closeOdin();
            setMobileNavigationOpen((current) => !current);
          }}
          onOpenSearch={() => setSearchOpen(true)}
          consoleState={consoleState}
          onOpenDevConsole={() => setDevConsoleOpen(true)}
          accountOpen={accountOpen}
          onToggleAccountPopover={handleToggleAccountPopover}
          onCloseAccountPopover={() => setAccountOpen(false)}
          accountInitialView={accountInitialView}
        />
        <MainWorkspace>{children}</MainWorkspace>
      </div>

      <SearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onToggleAssistant={toggleAssistant}
      />

      {showMobileDrawer && (
        <button
          className="mobile-nav-backdrop"
          type="button"
          aria-label="Close navigation"
          onClick={() => setMobileNavigationOpen(false)}
        />
      )}
      {showMobileDrawer && (
        <div className="mobile-nav-drawer">
          <SidebarExpanded
            pendingEnquiryCount={pendingEnquiryCount}
            onToggleAccountPopover={handleToggleAccountPopover}
          />
        </div>
      )}

      {assistantOpen && (
        <button
          className="odin-backdrop"
          type="button"
          aria-label="Close Odin"
          onClick={closeOdin}
        />
      )}
      {assistantOpen && <OdinPanel onClose={closeOdin} />}

      {/* Developer Console Drawer */}
      {!consoleState.isResolvingAuth && consoleState.isConsoleAllowed && devConsoleOpen && (
        <DeveloperReadinessDrawer
          onClose={() => setDevConsoleOpen(false)}
          consoleState={consoleState}
        />
      )}
    </div>
  );
}

export function AppShell({ children, layoutProfile = "default" }: AppShellProps) {
  return (
    <OdinProvider>
      <AppShellContent layoutProfile={layoutProfile}>{children}</AppShellContent>
    </OdinProvider>
  );
}
