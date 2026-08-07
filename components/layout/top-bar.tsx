"use client";

import { useState, useEffect, Suspense } from "react";
import {
  Bell,
  ChevronLeft,
  ChevronRight,
  Menu,
  MessageSquareText,
  Search,
  Sparkles,
} from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { FeedbackPopover } from "./feedback-popover";
import { NotificationPopover } from "./notification-popover";
import { AccountPopover } from "./account-popover";
import {
  ResponsiveBreadcrumbs,
  type BreadcrumbItem,
} from "./breadcrumb-overflow-menu";
import { DeveloperConsoleHook } from "../../developer-console/hooks/useDeveloperConsole";
import { WORKSPACE_CONFIG, ROUTE_BREADCRUMBS } from "@/lib/config/workspace-config";

interface TopBarProps {
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
  assistantOpen: boolean;
  onToggleAssistant: () => void;
  onToggleNavigation: () => void;
  onOpenSearch: () => void;
  consoleState: DeveloperConsoleHook;
  onOpenDevConsole: () => void;
  accountOpen: boolean;
  onToggleAccountPopover: (initialView?: "main" | "switcher") => void;
  onCloseAccountPopover: () => void;
  accountInitialView: "main" | "switcher";
}

const PROJECT_NAME_MAP: Record<string, string> = {
  "proj-001": "Nila Residence",
  "proj-002": "Azure Villa",
  "proj-003": "Greenfield Apartment",
  "proj-004": "Calicut Retail Interior",
  "proj-005": "Harbour View Office",
  "proj-006": "Palm Heights Penthouse",
  "proj-007": "Skyline Heights Phase II",
  "proj-008": "Marina Bay Suites",
  "proj-009": "Highland Villa",
  "proj-010": "Coastal Resort Pavilion",
  "proj-1": "Residence 24",
  "proj-2": "Greenfield Villa",
  "proj-3": "Oak House",
  "proj-4": "Palm Springs Suite",
  "proj-5": "Skyline Corporate HQ Suite",
};

const MODULE_LABEL_MAP: Record<string, string> = {
  tasks: "Tasks",
  task: "Tasks",
  documents: "Drive",
  docs: "Drive",
  boq: "BOQ",
  finance: "Finance",
  site: "Site",
  timeline: "Timeline",
  updates: "Updates",
  overview: "Overview",
};

function BreadcrumbNav({ currentPath }: { currentPath: string }) {
  const searchParams = useSearchParams();
  const [, setSessionTick] = useState(0);

  useEffect(() => {
    const handleUpdate = () => setSessionTick((t) => t + 1);
    if (typeof window !== "undefined") {
      window.addEventListener("kallisto_studio_session_updated", handleUpdate);
      window.addEventListener("storage", handleUpdate);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("kallisto_studio_session_updated", handleUpdate);
        window.removeEventListener("storage", handleUpdate);
      }
    };
  }, []);

  let items: BreadcrumbItem[];

  if (currentPath.startsWith("/projects/")) {
    const parts = currentPath.split("/").filter(Boolean);
    const projectId = parts[1];
    const projectName = PROJECT_NAME_MAP[projectId] || "Project Detail";
    const subModule = parts[2];
    const isGantt = currentPath.includes("/timeline/gantt");

    if (isGantt) {
      items = [
        { label: "Virtual Office" },
        { label: "Projects", href: "/projects" },
        { label: projectName, href: `/projects/${projectId}/overview` },
        { label: "Gantt Chart" },
      ];
    } else if (subModule && subModule !== "overview") {
      const moduleLabel =
        MODULE_LABEL_MAP[subModule] ||
        subModule.charAt(0).toUpperCase() + subModule.slice(1);
      items = [
        { label: "Virtual Office" },
        { label: "Projects", href: "/projects" },
        { label: projectName, href: `/projects/${projectId}/overview` },
        { label: moduleLabel },
      ];
    } else {
      items = [
        { label: "Virtual Office" },
        { label: "Projects", href: "/projects" },
        { label: projectName },
      ];
    }
  } else if (MODULE_LABEL_MAP[currentPath.slice(1)]) {
    const standaloneModule = currentPath.slice(1);
    const moduleLabel = MODULE_LABEL_MAP[standaloneModule];
    items = [
      { label: "Virtual Office" },
      { label: "Projects", href: "/projects" },
      { label: "Nila Residence", href: "/projects/proj-001/overview" },
      { label: moduleLabel },
    ];
  } else if (currentPath.startsWith("/enquiries/")) {
    items = [
      { label: "Virtual Office" },
      { label: "Enquiries", href: "/enquiries" },
      { label: "Enquiry Detail" },
    ];
  } else if (currentPath.startsWith("/clients/")) {
    items = [
      { label: "Virtual Office" },
      { label: "Clients", href: "/clients" },
      { label: "Client Detail" },
    ];
  } else if (currentPath.startsWith("/studio")) {
    items = [
      { label: "Virtual Office" },
      { label: "Hive Studio", href: "/studio" },
    ];
    const promptParam =
      searchParams.get("prompt") ||
      searchParams.get("q") ||
      (typeof window !== "undefined"
        ? window.localStorage.getItem("kallisto_active_studio_prompt")
        : null);
    const projectParam =
      searchParams.get("project") ||
      searchParams.get("projectName") ||
      (typeof window !== "undefined"
        ? window.localStorage.getItem("kallisto_active_studio_project")
        : null) ||
      "Kallisto Virtual Office";

    if (promptParam) {
      items.push({ label: projectParam });
      const words = promptParam.trim().split(/\s+/);
      const snippet = words.length <= 4 ? promptParam.trim() : words.slice(0, 4).join(" ") + "…";
      items.push({ label: snippet });
    } else {
      const parts = currentPath.split("/").filter(Boolean);
      if (parts.length > 1) {
        if (parts[1] === "boq") items.push({ label: "BOQ Engine" });
        else if (parts[1] === "ai-plans") items.push({ label: "AI Plans" });
        else if (parts[1] === "proposals") items.push({ label: "Proposals" });
        else if (parts[1] === "tasks" && parts[2]) items.push({ label: "Active Task" });
      }
    }
  } else {
    let meta = ROUTE_BREADCRUMBS[currentPath];
    if (!meta) {
      const matchedKey = Object.keys(ROUTE_BREADCRUMBS).find(
        (key) => key !== "/" && currentPath.startsWith(key),
      );
      meta = matchedKey
        ? ROUTE_BREADCRUMBS[matchedKey]
        : { parent: WORKSPACE_CONFIG.workspaceType, current: "Workspace" };
    }

    if (currentPath === "/settings") {
      const tab = searchParams.get("tab") || "profile";
      if (tab === "billing") {
        meta = {
          parent: "Subscription",
          current: WORKSPACE_CONFIG.currentWorkspaceName,
        };
      } else {
        const capitalizedTab = tab.charAt(0).toUpperCase() + tab.slice(1);
        meta = { parent: "Settings", current: capitalizedTab };
      }
    }

    items = [{ label: meta.parent }, { label: meta.current }];
  }

  return <ResponsiveBreadcrumbs items={items} />;
}

export function TopBar({
  assistantOpen,
  onToggleAssistant,
  onToggleNavigation,
  onOpenSearch,
  consoleState,
  onOpenDevConsole,
  accountOpen,
  onToggleAccountPopover,
  onCloseAccountPopover,
  accountInitialView,
}: TopBarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button
          className="mobile-menu-btn"
          type="button"
          aria-label="Open navigation"
          onClick={onToggleNavigation}
        >
          <Menu size={17} />
        </button>
        <div className="topbar-nav-buttons" aria-label="Navigation controls">
          <button
            className="nav-history-btn"
            type="button"
            aria-label="Go back"
            title="Go back"
            onClick={() => router.back()}
          >
            <ChevronLeft size={18} strokeWidth={1.8} />
          </button>
          <button
            className="nav-history-btn"
            type="button"
            aria-label="Go forward"
            title="Go forward"
            onClick={() => router.forward()}
          >
            <ChevronRight size={18} strokeWidth={1.8} />
          </button>
        </div>
        <nav className="topbar-breadcrumbs" aria-label="Breadcrumb">
          <Suspense fallback={<span className="breadcrumb-current">Loading...</span>}>
            <BreadcrumbNav currentPath={pathname} />
          </Suspense>
        </nav>
      </div>

      <button
        className="global-search-pill"
        type="button"
        aria-label="Search Kallisto"
        onClick={onOpenSearch}
      >
        <Search size={14} className="search-icon" aria-hidden="true" />
        <span className="search-placeholder">Search everything...</span>
      </button>

      <div className="topbar-actions" style={{ position: "relative" }}>
        <div style={{ position: "relative", display: "inline-flex" }}>
          <button
            className={`header-pill-btn feedback-pill${feedbackOpen ? " is-active" : ""}`}
            type="button"
            onClick={() => setFeedbackOpen((prev) => !prev)}
            aria-expanded={feedbackOpen}
          >
            <MessageSquareText size={14} />
            <span>Feedback</span>
          </button>
          <FeedbackPopover
            isOpen={feedbackOpen}
            onClose={() => setFeedbackOpen(false)}
          />
        </div>
        <button
          className={`header-pill-btn ask-pill glassy-button${assistantOpen ? " is-active" : ""}`}
          type="button"
          onClick={onToggleAssistant}
          aria-expanded={assistantOpen}
          aria-controls="odin-panel"
        >
          <Sparkles size={14} className="sparkle-icon" />
          <span>Ask Odin</span>
        </button>
        <button
          className={`topbar-icon-btn${notificationsOpen ? " is-active" : ""}`}
          type="button"
          aria-label="Notifications"
          title="Notifications"
          onClick={() => setNotificationsOpen((prev) => !prev)}
        >
          <Bell size={16} strokeWidth={1.8} />
          <span className="notification-indicator" />
        </button>
        <button
          className={`topbar-avatar-btn${accountOpen ? " is-active" : ""}`}
          type="button"
          aria-label="User profile"
          onClick={() => onToggleAccountPopover("main")}
          aria-expanded={accountOpen}
        >
          <span className="avatar-monogram">AA</span>
        </button>

        {/* ElevenLabs Style Notification Popover Flyout */}
        <NotificationPopover
          isOpen={notificationsOpen}
          onClose={() => setNotificationsOpen(false)}
        />

        {/* Workspace & Account Popover */}
        <AccountPopover
          isOpen={accountOpen}
          onClose={onCloseAccountPopover}
          consoleState={consoleState}
          onOpenDevConsole={onOpenDevConsole}
          initialView={accountInitialView}
        />
      </div>
    </header>
  );
}
