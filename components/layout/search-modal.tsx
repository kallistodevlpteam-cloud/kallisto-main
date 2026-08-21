"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CornerDownLeft, X } from "lucide-react";
import {
  HomeDuotoneIcon,
  EnquiriesDuotoneIcon,
  ProjectsDuotoneIcon,
  StudioDuotoneIcon,
  CalendarDuotoneIcon,
  TeamDuotoneIcon,
  DocumentsDuotoneIcon,
  PaymentsDuotoneIcon,
  AnalyticsDuotoneIcon,
  PortfolioDuotoneIcon,
  HubDuotoneIcon,
  HandsDuotoneIcon,
  BasicsDuotoneIcon,
  MoreToolsDuotoneIcon,
  SearchDuotoneIcon,
  OdinDuotoneIcon,
} from "./sidebar-icons";
import { projectService } from "@/services/repositories/project-service";
import { Project } from "@/types/domain/project";
import { Client } from "@/types/domain/client";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onToggleAssistant: () => void;
}

type AppRouterInstance = ReturnType<typeof useRouter>;

interface CommandItem {
  id: string;
  label: string;
  subtitle: string;
  icon: React.ComponentType<{ size?: number | string; className?: string }>;
  section: "Quick actions" | "Pages" | "Projects" | "Clients";
  action: (router: AppRouterInstance, onToggleAssistant: () => void, onClose: () => void) => void;
}

const COMMAND_ITEMS: CommandItem[] = [
  {
    id: "ask-odin",
    label: "Ask Odin",
    subtitle: "Ask your AI assistant anything about this workspace",
    icon: OdinDuotoneIcon,
    section: "Quick actions",
    action: (_, onToggleAssistant, onClose) => {
      onToggleAssistant();
      onClose();
    },
  },
  {
    id: "view-projects",
    label: "Projects Directory",
    subtitle: "Track milestones, BOQs, proposals and variations",
    icon: ProjectsDuotoneIcon,
    section: "Quick actions",
    action: (router, _, onClose) => {
      router.push("/projects");
      onClose();
    },
  },
  {
    id: "view-studio",
    label: "Hive Studio",
    subtitle: "Create project BOQs, estimates, visualisations and proposals",
    icon: StudioDuotoneIcon,
    section: "Pages",
    action: (router, _, onClose) => {
      router.push("/studio");
      onClose();
    },
  },
  {
    id: "view-calendar",
    label: "Calendar",
    subtitle: "Schedule site visits, meetings, deliveries and approvals",
    icon: CalendarDuotoneIcon,
    section: "Pages",
    action: (router, _, onClose) => {
      router.push("/calendar");
      onClose();
    },
  },
  {
    id: "view-enquiries",
    label: "Enquiries",
    subtitle: "Review new and pending client enquiries",
    icon: EnquiriesDuotoneIcon,
    section: "Quick actions",
    action: (router, _, onClose) => {
      router.push("/enquiries");
      onClose();
    },
  },
  {
    id: "view-home",
    label: "Home Dashboard",
    subtitle: "Go to workspace overview dashboard",
    icon: HomeDuotoneIcon,
    section: "Pages",
    action: (router, _, onClose) => {
      router.push("/home");
      onClose();
    },
  },
  {
    id: "view-team",
    label: "Team",
    subtitle: "Configure studio members, roles and details",
    icon: TeamDuotoneIcon,
    section: "Pages",
    action: (router, _, onClose) => {
      router.push("/team");
      onClose();
    },
  },
  {
    id: "view-documents",
    label: "Documents",
    subtitle: "Manage scope records, contracts and drawing files",
    icon: DocumentsDuotoneIcon,
    section: "Pages",
    action: (router, _, onClose) => {
      router.push("/documents");
      onClose();
    },
  },
  {
    id: "view-payments",
    label: "Payments",
    subtitle: "Check transactions and contract payment status",
    icon: PaymentsDuotoneIcon,
    section: "Pages",
    action: (router, _, onClose) => {
      router.push("/payments");
      onClose();
    },
  },
  {
    id: "view-analytics",
    label: "Analytics",
    subtitle: "Review studio performance indicators and stats",
    icon: AnalyticsDuotoneIcon,
    section: "Pages",
    action: (router, _, onClose) => {
      router.push("/analytics");
      onClose();
    },
  },
  {
    id: "view-portfolio",
    label: "Portfolio",
    subtitle: "Add images and project references to showcase",
    icon: PortfolioDuotoneIcon,
    section: "Pages",
    action: (router, _, onClose) => {
      router.push("/portfolio");
      onClose();
    },
  },
  {
    id: "view-hub",
    label: "Hub",
    subtitle: "Centralized hub for ecosystem connections and feasibility tracking",
    icon: HubDuotoneIcon,
    section: "Pages",
    action: (router, _, onClose) => {
      router.push("/hub");
      onClose();
    },
  },
  {
    id: "view-hands",
    label: "Hands",
    subtitle: "On-site team coordination and field execution services",
    icon: HandsDuotoneIcon,
    section: "Pages",
    action: (router, _, onClose) => {
      router.push("/hands");
      onClose();
    },
  },
  {
    id: "view-basics",
    label: "Basics",
    subtitle: "Standard operating specifications and core service foundations",
    icon: BasicsDuotoneIcon,
    section: "Pages",
    action: (router, _, onClose) => {
      router.push("/basics");
      onClose();
    },
  },
  {
    id: "view-tools",
    label: "More Tools",
    subtitle: "Check additional workspace custom utilities",
    icon: MoreToolsDuotoneIcon,
    section: "Pages",
    action: (router, _, onClose) => {
      router.push("/tools");
      onClose();
    },
  },
];

export function SearchModal({ isOpen, onClose, onToggleAssistant }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [dynamicProjects, setDynamicProjects] = useState<Project[]>([]);
  const [dynamicClients, setDynamicClients] = useState<
    Array<Client & { linkedProjectsCount: number; activeProject?: Project }>
  >([]);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Fetch dynamic entities from project service
  useEffect(() => {
    if (!isOpen) return;

    projectService.searchEntities("ws-default", query).then((res) => {
      setDynamicProjects(res.projects || []);
      setDynamicClients(res.clients || []);
    });
  }, [isOpen, query]);

  // Keyboard navigation & scroll-into-view
  useEffect(() => {
    if (!listRef.current) return;
    const activeItem = listRef.current.querySelector(".search-item.is-selected") as HTMLElement;
    if (activeItem) {
      activeItem.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [selectedIndex]);

  // Focus input upon open
  useEffect(() => {
    if (!isOpen) return;
    setQuery("");
    setSelectedIndex(0);
    const timeoutId = setTimeout(() => {
      inputRef.current?.focus();
    }, 50);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = prevOverflow;
      clearTimeout(timeoutId);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Filter static page items
  const filteredStaticItems = COMMAND_ITEMS.filter((item) => {
    const searchString = `${item.label} ${item.subtitle}`.toLowerCase();
    return searchString.includes(query.toLowerCase());
  });

  // Dynamic project search items
  const projectItems: CommandItem[] = dynamicProjects.map((p) => ({
    id: `dynamic-proj-${p.id}`,
    label: p.name,
    subtitle: `${p.projectCode} · Phase: ${p.phase} · Location: ${p.location}`,
    icon: ProjectsDuotoneIcon,
    section: "Projects",
    action: (r, _, close) => {
      r.push(`/projects/${p.id}`);
      close();
    },
  }));

  // Dynamic client search items
  const clientItems: CommandItem[] = dynamicClients.map((c) => ({
    id: `dynamic-cli-${c.id}`,
    label: c.organisationName ? `${c.name} (${c.organisationName})` : c.name,
    subtitle: `${c.linkedProjectsCount} linked project(s)${
      c.activeProject ? ` · Active: ${c.activeProject.name}` : ""
    }`,
    icon: TeamDuotoneIcon,
    section: "Clients",
    action: (r, _, close) => {
      if (c.linkedProjectsCount === 1 && c.activeProject) {
        r.push(`/projects/${c.activeProject.id}?tab=client`);
      } else {
        r.push(`/clients/${c.id}`);
      }
      close();
    },
  }));

  const allFilteredItems = [
    ...projectItems,
    ...clientItems,
    ...filteredStaticItems,
  ];

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        allFilteredItems.length > 0 ? (prev + 1) % allFilteredItems.length : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        allFilteredItems.length > 0
          ? (prev - 1 + allFilteredItems.length) % allFilteredItems.length
          : 0
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (allFilteredItems[selectedIndex]) {
        allFilteredItems[selectedIndex].action(router, onToggleAssistant, onClose);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    }
  };

  const sections: { title: string; items: CommandItem[] }[] = [];
  const projectSec = allFilteredItems.filter((item) => item.section === "Projects");
  const clientSec = allFilteredItems.filter((item) => item.section === "Clients");
  const quickActions = allFilteredItems.filter((item) => item.section === "Quick actions");
  const pages = allFilteredItems.filter((item) => item.section === "Pages");

  if (projectSec.length > 0) sections.push({ title: "Projects", items: projectSec });
  if (clientSec.length > 0) sections.push({ title: "Clients", items: clientSec });
  if (quickActions.length > 0) sections.push({ title: "Quick actions", items: quickActions });
  if (pages.length > 0) sections.push({ title: "Pages", items: pages });

  let itemCounter = 0;

  return (
    <div
      className="search-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Search and command palette"
    >
      <div className="search-card" onClick={(e) => e.stopPropagation()}>
        <div className="search-header">
          <SearchDuotoneIcon size={16} className="search-header-icon" />
          <input
            ref={inputRef}
            type="text"
            className="search-input-field"
            placeholder="Search projects, clients, actions, pages..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
          />
          <button
            className="search-close-btn"
            type="button"
            onClick={onClose}
            aria-label="Close search"
          >
            <X size={16} />
          </button>
        </div>

        <div className="search-body" ref={listRef}>
          {allFilteredItems.length === 0 ? (
            <div className="search-empty-state">
              <p className="search-empty-title">No results found</p>
              <p className="search-empty-desc">
                No matches found for <span className="highlight-query">&quot;{query}&quot;</span>
              </p>
            </div>
          ) : (
            sections.map((section) => (
              <div key={section.title} className="search-section">
                <h3 className="search-section-title">{section.title}</h3>
                <div className="search-section-items">
                  {section.items.map((item) => {
                    const currentIndex = itemCounter;
                    itemCounter++;
                    const isSelected = currentIndex === selectedIndex;
                    const IconComponent = item.icon;

                    return (
                      <button
                        key={item.id}
                        className={`search-item${isSelected ? " is-selected" : ""}`}
                        type="button"
                        onMouseEnter={() => setSelectedIndex(currentIndex)}
                        onClick={() => item.action(router, onToggleAssistant, onClose)}
                      >
                        <div className="search-item-icon-wrapper">
                          <IconComponent size={17} />
                        </div>
                        <div className="search-item-info">
                          <span className="search-item-label">{item.label}</span>
                          <span className="search-item-subtitle">{item.subtitle}</span>
                        </div>
                        {isSelected && (
                          <div className="search-item-badge">
                            <span>Open</span>
                            <CornerDownLeft size={10} className="badge-enter-icon" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
