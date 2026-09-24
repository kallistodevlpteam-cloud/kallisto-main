"use client";

import { useState, useEffect, Suspense, useSyncExternalStore } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Menu,
} from "lucide-react";
import {
  BellDuotoneIcon,
  FeedbackDuotoneIcon,
  FullscreenExpandDuotoneIcon,
  FullscreenExitDuotoneIcon,
  OdinDuotoneIcon,
  SearchDuotoneIcon,
} from "./sidebar-icons";
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
import { getTradeCrewById } from "@/features/hands/services/trade-crews.mock";
import { projectService } from "@/services/repositories/project-service";
import { SAMPLE_PROJECTS } from "@/features/projects/components/projects-cards-grid";
import { DUMMY_BACKEND_PROJECTS } from "@/lib/backend/dummy-projects";

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
  "proj-1": "Nila Residence",
  "prj-001": "Nila Residence",
  "prj-1": "Nila Residence",
  "1": "Nila Residence",
  "nila-residence": "Nila Residence",
  "proj-201": "Nila Residence",

  "proj-002": "Azure Villa",
  "proj-2": "Azure Villa",
  "prj-002": "Azure Villa",
  "prj-2": "Azure Villa",
  "2": "Azure Villa",
  "azure-villa": "Azure Villa",

  "proj-003": "Greenfield Apartment",
  "proj-3": "Greenfield Apartment",
  "prj-003": "Greenfield Apartment",
  "prj-3": "Greenfield Apartment",
  "3": "Greenfield Apartment",
  "greenfield-apartment": "Greenfield Apartment",
  "greenfield-villa": "Greenfield Villa",

  "proj-004": "Calicut Retail Interior",
  "proj-4": "Calicut Retail Interior",
  "prj-004": "Calicut Retail Interior",
  "prj-4": "Calicut Retail Interior",
  "4": "Calicut Retail Interior",
  "palm-springs-suite": "Palm Springs Suite",

  "proj-005": "Harbour View Office",
  "proj-5": "Harbour View Office",
  "prj-005": "Harbour View Office",
  "prj-5": "Harbour View Office",
  "5": "Harbour View Office",
  "skyline-corporate-hq-suite": "Skyline Corporate HQ Suite",

  "proj-006": "Palm Heights Penthouse",
  "proj-6": "Palm Heights Penthouse",
  "prj-006": "Palm Heights Penthouse",
  "prj-6": "Palm Heights Penthouse",
  "6": "Palm Heights Penthouse",

  "proj-007": "Skyline Heights Phase II",
  "proj-7": "Skyline Heights Phase II",
  "prj-007": "Skyline Heights Phase II",
  "prj-7": "Skyline Heights Phase II",
  "7": "Skyline Heights Phase II",

  "proj-008": "Marina Bay Suites",
  "proj-8": "Marina Bay Suites",
  "prj-008": "Marina Bay Suites",
  "prj-8": "Marina Bay Suites",
  "8": "Marina Bay Suites",

  "proj-009": "Highland Villa",
  "proj-9": "Highland Villa",
  "prj-009": "Highland Villa",
  "prj-9": "Highland Villa",
  "9": "Highland Villa",

  "proj-010": "Coastal Resort Pavilion",
  "proj-10": "Coastal Resort Pavilion",
  "prj-010": "Coastal Resort Pavilion",
  "prj-10": "Coastal Resort Pavilion",
  "10": "Coastal Resort Pavilion",

  "oak-house": "Oak House",
  "courtyard-house": "Courtyard House",
  "fern-office": "The Fern Office",
  "sera-villa-renovation": "Sera Villa Renovation",
  "terra-cafe": "Terra Café",
  "grove-apartments": "Grove Apartments",
  "lumen-showroom": "Lumen Showroom",
  "hillview-retreat": "Hillview Retreat",
  "residence-24": "Residence 24",
};

const TAB_LABEL_MAP: Record<string, string> = {
  overview: "Overview",
  client: "Client Context",
  requirements: "Requirements",
  evidence: "Site & Evidence",
  team: "Team members",
  materials: "Materials",
  hands: "Hands",
  basics: "Basics",
  activity: "Activity",
};

export function resolveProjectName(projectId: string, searchParams?: URLSearchParams | null): string {
  if (!projectId) return "Project Detail";

  // 1. Search parameter override
  const queryParamName = searchParams?.get("projectName") || searchParams?.get("name");
  if (queryParamName && queryParamName.trim()) {
    return queryParamName.trim();
  }

  // 2. Client-side session storage cache
  if (typeof window !== "undefined") {
    try {
      const cached = sessionStorage.getItem(`kallisto_project_name_${projectId}`);
      if (cached && cached.trim()) {
        return cached.trim();
      }
    } catch {
      // ignore storage access restrictions
    }
  }

  // 3. Direct match in dictionary
  const lowerId = projectId.toLowerCase().trim();
  if (PROJECT_NAME_MAP[lowerId]) {
    return PROJECT_NAME_MAP[lowerId];
  }

  // 4. Normalized variations
  const numericMatch = lowerId.match(/\d+/);
  if (numericMatch) {
    const num = parseInt(numericMatch[0], 10);
    const padded = String(num).padStart(3, "0");
    const candidates = [
      `proj-${padded}`,
      `proj-${num}`,
      `prj-${padded}`,
      `prj-${num}`,
      `project-${num}`,
      String(num),
    ];
    for (const cand of candidates) {
      if (PROJECT_NAME_MAP[cand]) {
        return PROJECT_NAME_MAP[cand];
      }
    }
  }

  // 5. Query projectService sync repository
  try {
    const repoProject = projectService?.getProjectByIdSync?.("ws-default", projectId);
    if (repoProject?.id) {
      const pid = repoProject.id.toLowerCase();
      const normPid = pid.replace(/^proj-/, "prj-").replace(/-(0+)/, "-");
      const normTid = lowerId.replace(/^proj-/, "prj-").replace(/-(0+)/, "-");
      if (pid === lowerId || normPid === normTid) {
        return repoProject.name.trim();
      }
    }
  } catch {
    // fallback
  }

  // 6. Check SAMPLE_PROJECTS
  const sample = SAMPLE_PROJECTS.find(
    (p) =>
      p.id.toLowerCase() === lowerId ||
      (numericMatch && p.id.match(/\d+/) && parseInt(p.id.match(/\d+/)![0], 10) === parseInt(numericMatch[0], 10))
  );
  if (sample?.name) {
    return sample.name;
  }

  // 7. Check DUMMY_BACKEND_PROJECTS
  if (numericMatch) {
    const num = parseInt(numericMatch[0], 10);
    const backendProj = DUMMY_BACKEND_PROJECTS.find((p) => p.id === num);
    if (backendProj?.projectName) {
      return backendProj.projectName.replace(" Luxury Residence", " Residence");
    }
  }

  // 8. Title-cased hyphenated slug
  if (lowerId.includes("-") && !lowerId.startsWith("proj-") && !lowerId.startsWith("prj-")) {
    return lowerId
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  }

  return "Project Detail";
}

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

const emptySubscribe = () => () => {};

function BreadcrumbNav({ currentPath }: { currentPath: string }) {
  const searchParams = useSearchParams();
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
  const [, setSessionTick] = useState(0);

  useEffect(() => {
    const handleUpdate = () => setSessionTick((t) => t + 1);
    if (typeof window !== "undefined") {
      window.addEventListener("kallisto_studio_session_updated", handleUpdate);
      window.addEventListener("kallisto_project_updated", handleUpdate);
      window.addEventListener("storage", handleUpdate);
      window.addEventListener("popstate", handleUpdate);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("kallisto_studio_session_updated", handleUpdate);
        window.removeEventListener("kallisto_project_updated", handleUpdate);
        window.removeEventListener("storage", handleUpdate);
        window.removeEventListener("popstate", handleUpdate);
      }
    };
  }, []);

  let items: BreadcrumbItem[];

  if (currentPath.startsWith("/partner")) {
    const parts = currentPath.split("/").filter(Boolean);
    const partnerKey = parts[1] || "hands";
    const PARTNER_NAME_MAP: Record<string, string> = {
      hands: "Kallisto Hands",
      hub: "Kallisto Hub",
      basics: "Kallisto Basics",
      settings: "Settings",
      help: "Help & Support",
    };
    const currentPartnerName = PARTNER_NAME_MAP[partnerKey] || "Kallisto Partner";
    const currentSearch = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : searchParams;
    const activeOrderId = currentSearch?.get("orderId");
    const activeSku = currentSearch?.get("sku");

    if (parts.length > 2) {
      const subRoute = parts[2];
      const formattedSub = subRoute
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");

      if (subRoute === "orders" && activeOrderId) {
        items = [
          { label: "Partner Workspace", href: "/partner" },
          { label: currentPartnerName, href: `/partner/${partnerKey}` },
          { label: "Orders", href: `/partner/${partnerKey}/orders` },
          { label: activeOrderId },
        ];
      } else if (subRoute === "products" && activeSku) {
        items = [
          { label: "Partner Workspace", href: "/partner" },
          { label: currentPartnerName, href: `/partner/${partnerKey}` },
          { label: "Products", href: `/partner/${partnerKey}/products` },
          { label: activeSku },
        ];
      } else {
        items = [
          { label: "Partner Workspace", href: "/partner" },
          { label: currentPartnerName, href: `/partner/${partnerKey}` },
          { label: formattedSub },
        ];
      }
    } else {
      items = [
        { label: "Partner Workspace", href: "/partner" },
        { label: currentPartnerName },
      ];
    }
  } else if (currentPath.startsWith("/client")) {
    const parts = currentPath.split("/").filter(Boolean);
    const subRoute = parts[1] || "overview";
    const CLIENT_MODULE_LABEL_MAP: Record<string, string> = {
      overview: "Ask Odin",
      projects: "Projects",
      enquiries: "Enquiries",
      payments: "Payments",
      providers: "Providers",
      settings: "Settings",
      help: "Help & Support",
    };

    const CLIENT_SETTINGS_LABEL_MAP: Record<string, string> = {
      profile: "Profile",
      security: "Security & Login",
      "project-preferences": "Project Preferences",
      "project-access": "Project Access",
      notifications: "Notifications",
      communication: "Communication Preferences",
      "payment-methods": "Payment Methods",
      billing: "Billing & Invoices",
      appearance: "Appearance",
      "language-region": "Language & Region",
      privacy: "Privacy & Data",
    };

    const currentLabel = CLIENT_MODULE_LABEL_MAP[subRoute] || (subRoute.charAt(0).toUpperCase() + subRoute.slice(1));
    if (subRoute === "overview") {
      const activeProjectName = searchParams.get("projectName") || searchParams.get("projectId") || "Start New Project / Explore";
      items = [
        { label: "Client Portal", href: "/client" },
        { label: "Ask Odin", href: "/client/overview" },
        { label: activeProjectName },
      ];
    } else if (subRoute === "settings" && parts.length > 2) {
      const settingsSection = parts[2];
      const sectionLabel = CLIENT_SETTINGS_LABEL_MAP[settingsSection] || (settingsSection.charAt(0).toUpperCase() + settingsSection.slice(1));
      items = [
        { label: "Client Portal", href: "/client" },
        { label: "Settings", href: "/client/settings" },
        { label: sectionLabel },
      ];
    } else if (subRoute === "projects" && parts.length > 2) {
      const clientProjectId = parts[2];
      const clientProjectName = resolveProjectName(clientProjectId, searchParams);
      const activeTabParam = searchParams.get("tab");
      if (activeTabParam && activeTabParam !== "overview" && TAB_LABEL_MAP[activeTabParam]) {
        items = [
          { label: "Client Portal", href: "/client" },
          { label: "Projects", href: "/client/projects" },
          { label: clientProjectName, href: `/client/projects/${clientProjectId}` },
          { label: TAB_LABEL_MAP[activeTabParam] },
        ];
      } else {
        items = [
          { label: "Client Portal", href: "/client" },
          { label: "Projects", href: "/client/projects" },
          { label: clientProjectName },
        ];
      }
    } else if (parts.length > 2) {
      items = [
        { label: "Client Portal", href: "/client" },
        { label: currentLabel, href: `/client/${subRoute}` },
        { label: parts.slice(2).join(" / ") },
      ];
    } else {
      items = [
        { label: "Client Portal", href: "/client" },
        { label: currentLabel },
      ];
    }
  } else if (currentPath.startsWith("/projects/")) {
    const parts = currentPath.split("/").filter(Boolean);
    const projectId = parts[1];
    const projectName = resolveProjectName(projectId, searchParams);
    const subModule = parts[2];
    const isGantt = currentPath.includes("/timeline/gantt");
    const activeTabParam = searchParams.get("tab");

    if (isGantt) {
      items = [
        { label: "Virtual Office", href: "/" },
        { label: "Projects", href: "/projects" },
        { label: projectName, href: `/projects/${projectId}` },
        { label: "Timeline", href: `/projects/${projectId}/timeline` },
        { label: "Gantt Chart" },
      ];
    } else if (subModule && subModule !== "overview") {
      const moduleLabel =
        MODULE_LABEL_MAP[subModule] ||
        subModule.charAt(0).toUpperCase() + subModule.slice(1);
      items = [
        { label: "Virtual Office", href: "/" },
        { label: "Projects", href: "/projects" },
        { label: projectName, href: `/projects/${projectId}` },
        { label: moduleLabel },
      ];
    } else {
      if (activeTabParam && activeTabParam !== "overview" && TAB_LABEL_MAP[activeTabParam]) {
        items = [
          { label: "Virtual Office", href: "/" },
          { label: "Projects", href: "/projects" },
          { label: projectName, href: `/projects/${projectId}` },
          { label: TAB_LABEL_MAP[activeTabParam] },
        ];
      } else {
        items = [
          { label: "Virtual Office", href: "/" },
          { label: "Projects", href: "/projects" },
          { label: projectName },
        ];
      }
    }
  } else if (MODULE_LABEL_MAP[currentPath.slice(1)]) {
    const standaloneModule = currentPath.slice(1);
    const moduleLabel = MODULE_LABEL_MAP[standaloneModule];
    items = [
      { label: "Virtual Office", href: "/" },
      { label: "Projects", href: "/projects" },
      { label: "Nila Residence", href: "/projects/proj-001" },
      { label: moduleLabel },
    ];
  } else if (currentPath.startsWith("/enquiries/")) {
    items = [
      { label: "Virtual Office", href: "/" },
      { label: "Enquiries", href: "/enquiries" },
      { label: "Enquiry Detail" },
    ];
  } else if (currentPath.startsWith("/clients/")) {
    items = [
      { label: "Virtual Office", href: "/" },
      { label: "Clients", href: "/clients" },
      { label: "Client Detail" },
    ];
  } else if (currentPath.startsWith("/studio") || currentPath === "/") {
    items = [
      { label: "Virtual Office", href: "/" },
      { label: "Hive Studio", href: "/studio" },
    ];
    const projectParam =
      searchParams.get("project") ||
      searchParams.get("projectName") ||
      (mounted && typeof window !== "undefined"
        ? window.localStorage.getItem("kallisto_active_studio_project")
        : null);

    if (projectParam && projectParam !== "Kallisto Virtual Office") {
      items.push({ label: projectParam });
    }

    const parts = currentPath.split("/").filter(Boolean);
    if (parts.length > 1) {
      if (parts[1] === "boq") items.push({ label: "BOQ Engine" });
      else if (parts[1] === "ai-plans") items.push({ label: "AI Plans" });
      else if (parts[1] === "proposals") items.push({ label: "Proposals" });
      else if (parts[1] === "tasks" && parts[2]) items.push({ label: "Active Task" });
    }
  } else if (currentPath.startsWith("/hands/trades/")) {
    const parts = currentPath.split("/").filter(Boolean);
    const crewId = parts[2];
    const crew = crewId ? getTradeCrewById(crewId) : null;
    items = [
      { label: "Virtual Office", href: "/" },
      { label: "Hands", href: "/hands" },
      { label: crew?.name || "Trade Crew Profile" },
    ];
  } else if (currentPath.startsWith("/basics/experts/")) {
    const parts = currentPath.split("/").filter(Boolean);
    const expertId = parts[2];
    items = [
      { label: "Virtual Office", href: "/" },
      { label: "Basics", href: "/basics" },
      { label: expertId ? "Expert Profile" : "Find Experts" },
    ];
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

    items = [
      {
        label: meta.parent,
        href:
          meta.parent === "Virtual Office"
            ? "/"
            : meta.parent === "Client Portal"
            ? "/client"
            : meta.parent === "Partner Workspace"
            ? "/partner"
            : undefined,
      },
      { label: meta.current },
    ];
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
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  const handleToggleFullscreen = async () => {
    if (document.fullscreenElement) {
      try {
        await document.exitFullscreen();
        setIsFullscreen(false);
      } catch {
        setIsFullscreen(false);
      }
    } else {
      try {
        if (typeof document.documentElement.requestFullscreen === "function") {
          await document.documentElement.requestFullscreen();
          setIsFullscreen(true);
        }
      } catch {
        // Fullscreen API may be blocked in some browser environments
      }
    }
  };

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
        <SearchDuotoneIcon size={14} className="search-icon" aria-hidden="true" />
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
            <FeedbackDuotoneIcon size={15} />
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
          <OdinDuotoneIcon size={15} className="sparkle-icon" />
          <span>Ask Odin</span>
        </button>
        <button
          className={`topbar-icon-btn${notificationsOpen ? " is-active" : ""}`}
          type="button"
          aria-label="Notifications"
          title="Notifications"
          onClick={() => {
            if (pathname?.startsWith("/partner")) {
              setNotificationsOpen(false);
              const targetRoute = pathname.startsWith("/partner/hands")
                ? "/partner/hands/notifications"
                : pathname.startsWith("/partner/hub")
                ? "/partner/hub/notifications"
                : pathname.startsWith("/partner/basics")
                ? "/partner/basics/notifications"
                : "/partner/notifications";
              router.push(targetRoute);
            } else if (pathname?.startsWith("/client")) {
              setNotificationsOpen(false);
              const targetRoute = pathname.startsWith("/client/enquiries")
                ? "/client/enquiries/notifications"
                : "/client/notifications";
              router.push(targetRoute);
            } else {
              setNotificationsOpen((prev) => !prev);
            }
          }}
        >
          <BellDuotoneIcon size={16} />
          <span className="notification-indicator" />
        </button>
        <button
          className={`topbar-icon-btn${isFullscreen ? " is-active" : ""}`}
          type="button"
          aria-label={isFullscreen ? "Exit full screen" : "Enter full screen"}
          title={isFullscreen ? "Exit full screen" : "Enter full screen"}
          onClick={handleToggleFullscreen}
        >
          {isFullscreen ? (
            <FullscreenExitDuotoneIcon size={16} />
          ) : (
            <FullscreenExpandDuotoneIcon size={16} />
          )}
        </button>
        <button
          className={`topbar-avatar-btn${accountOpen ? " is-active" : ""}`}
          type="button"
          aria-label="User profile"
          onClick={() => onToggleAccountPopover("main")}
          aria-expanded={accountOpen}
        >
          <span className="avatar-monogram">
            {pathname?.startsWith("/client")
              ? "AS"
              : pathname?.startsWith("/partner")
              ? pathname.includes("/hub")
                ? "AP"
                : pathname.includes("/basics")
                ? "RV"
                : "VM"
              : "AA"}
          </span>
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
