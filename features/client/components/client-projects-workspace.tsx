"use client";

import React, { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Search,
  ChevronDown,
  Building2,
  CheckCircle2,
  FolderOpen,
} from "lucide-react";
import {
  PreConstructionDuotoneIcon,
  ConstructionDuotoneIcon,
  PostConstructionDuotoneIcon,
} from "@/components/layout/sidebar-icons";
import {
  getCreatedProjects,
  subscribeToCreatedProjects,
  type CreatedProject,
} from "../services/accepted-projects-store";
import styles from "./client-projects.module.css";

export type ProjectLifecyclePhase =
  | "created"
  | "pre_construction"
  | "construction"
  | "post_construction";

interface DisplayProject {
  id: string;
  name: string;
  code: string;
  location: string;
  category: string;
  phase: string;
  lifecyclePhase: ProjectLifecyclePhase;
  image: string;
  progress: number;
  totalBudget: string;
  paidAmount: string;
  pendingAmount: string;
  leadProvider: string;
  targetCompletion: string;
  fileCount: number;
  activeTaskCount: number;
  needsAttention: Array<{
    id: string;
    title: string;
    category: "Approval" | "Payment" | "Review" | "Decision";
    urgency: "high" | "medium";
    date: string;
    actionLabel: string;
    description?: string;
  }>;
  upcoming: Array<{
    id: string;
    title: string;
    date: string;
    type: "meeting" | "deadline" | "payment" | "visit";
  }>;
  recentActivity: Array<{
    id: string;
    actor: string;
    action: string;
    target: string;
    time: string;
    iconType: "doc" | "payment" | "status" | "approval";
  }>;
  suggestedPrompts: string[];
}

const CLIENT_DISPLAY_PROJECTS: DisplayProject[] = [
  // ── CREATED PROJECTS ──────────────────────────────────────────────
  {
    id: "proj-skyline-heights",
    name: "Skyline Heights Villa",
    code: "KAL-SHV-2026",
    location: "Marine Drive, Kochi",
    category: "Luxury Residential",
    phase: "Proposal Accepted",
    lifecyclePhase: "created",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=900&auto=format&fit=crop&q=80",
    progress: 0,
    totalBudget: "₹1,45,00,000",
    paidAmount: "₹0",
    pendingAmount: "₹1,45,00,000",
    leadProvider: "Greenfield Architects",
    targetCompletion: "December 2026",
    fileCount: 12,
    activeTaskCount: 1,
    needsAttention: [],
    upcoming: [],
    recentActivity: [],
    suggestedPrompts: ["Tell me what happens next for Skyline Heights Villa"],
  },
  {
    id: "proj-verona-residence",
    name: "Verona Luxury Residence",
    code: "KAL-VLR-2026",
    location: "Vyttila, Kochi",
    category: "Contemporary Architecture",
    phase: "Proposal Accepted",
    lifecyclePhase: "created",
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=900&auto=format&fit=crop&q=80",
    progress: 0,
    totalBudget: "₹98,00,000",
    paidAmount: "₹0",
    pendingAmount: "₹98,00,000",
    leadProvider: "Studio Nila",
    targetCompletion: "January 2027",
    fileCount: 8,
    activeTaskCount: 0,
    needsAttention: [],
    upcoming: [],
    recentActivity: [],
    suggestedPrompts: ["Tell me what happens next for Verona Luxury Residence"],
  },
  // ── PRE CONSTRUCTION ──────────────────────────────────────────────
  {
    id: "proj-greenfield-villa",
    name: "Greenfield Villa",
    code: "KAL-GV-2026",
    location: "—",
    category: "Luxury Residential",
    phase: "Design development",
    lifecyclePhase: "pre_construction",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=900&auto=format&fit=crop&q=80",
    progress: 25,
    totalBudget: "₹1,20,00,000",
    paidAmount: "₹30,00,000",
    pendingAmount: "₹90,00,000",
    leadProvider: "Greenfield Architects",
    targetCompletion: "December 2026",
    fileCount: 16,
    activeTaskCount: 2,
    needsAttention: [
      {
        id: "att-gv-1",
        title: "Review Stone Cladding & Facade Detail",
        category: "Approval",
        urgency: "high",
        date: "Action by Tomorrow",
        actionLabel: "Review & Sign",
      },
    ],
    upcoming: [],
    recentActivity: [],
    suggestedPrompts: ["Show me the latest facade elevation drawing for Greenfield Villa"],
  },
  {
    id: "proj-greenfield-resort-phase2",
    name: "Greenfield Eco Resort",
    code: "KAL-GER-2026",
    location: "Alappuzha Backwaters",
    category: "Hospitality & Eco Living",
    phase: "In progress",
    lifecyclePhase: "construction",
    image: "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=900&auto=format&fit=crop&q=80",
    progress: 55,
    totalBudget: "₹3,80,00,000",
    paidAmount: "₹2,09,00,000",
    pendingAmount: "₹1,71,00,000",
    leadProvider: "Greenfield Architects",
    targetCompletion: "March 2027",
    fileCount: 42,
    activeTaskCount: 4,
    needsAttention: [],
    upcoming: [],
    recentActivity: [],
    suggestedPrompts: ["What is the current progress on Greenfield Eco Resort?"],
  },
  {
    id: "proj-nila-residence",
    name: "Nila Residence",
    code: "KAL-NR-2026",
    location: "Kakkanad, Kochi",
    category: "Contemporary Architecture",
    phase: "In progress",
    lifecyclePhase: "construction",
    image: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=900&auto=format&fit=crop&q=80",
    progress: 62,
    totalBudget: "₹85,00,000",
    paidAmount: "₹52,70,000",
    pendingAmount: "₹32,30,000",
    leadProvider: "Studio Nila",
    targetCompletion: "November 2026",
    fileCount: 31,
    activeTaskCount: 3,
    needsAttention: [],
    upcoming: [],
    recentActivity: [],
    suggestedPrompts: ["What's the current status of my Kochi residence project?"],
  },
  {
    id: "proj-nila-residence-kozhikode",
    name: "Nila Residence",
    code: "KAL-NRK-2026",
    location: "Nankanad, Kochi",
    category: "Residential Architecture",
    phase: "In progress",
    lifecyclePhase: "construction",
    image: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=900&auto=format&fit=crop&q=80",
    progress: 70,
    totalBudget: "₹72,00,000",
    paidAmount: "₹50,40,000",
    pendingAmount: "₹21,60,000",
    leadProvider: "Studio Nila",
    targetCompletion: "October 2026",
    fileCount: 24,
    activeTaskCount: 2,
    needsAttention: [],
    upcoming: [],
    recentActivity: [],
    suggestedPrompts: ["Summarise the latest changes on the Kozhikode residence"],
  },
  {
    id: "proj-palm-heights-completed",
    name: "Palm Heights Penthouse",
    code: "KAL-PHP-2025",
    location: "Kochi, Kerala",
    category: "Luxury Penthouse Renovation",
    phase: "Completed",
    lifecyclePhase: "post_construction",
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=900&auto=format&fit=crop&q=80",
    progress: 100,
    totalBudget: "₹1,50,00,000",
    paidAmount: "₹1,50,00,000",
    pendingAmount: "₹0",
    leadProvider: "Studio Horizon",
    targetCompletion: "Completed",
    fileCount: 32,
    activeTaskCount: 0,
    needsAttention: [],
    upcoming: [],
    recentActivity: [],
    suggestedPrompts: ["View handover docs for Palm Heights Penthouse"],
  },
  {
    id: "proj-azure-bay-completed",
    name: "Azure Bay Villa",
    code: "KAL-ABV-2025",
    location: "Kovalam, Kerala",
    category: "Luxury Coastal Residential",
    phase: "Completed",
    lifecyclePhase: "post_construction",
    image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=900&auto=format&fit=crop&q=80",
    progress: 100,
    totalBudget: "₹2,10,00,000",
    paidAmount: "₹2,10,00,000",
    pendingAmount: "₹0",
    leadProvider: "Studio Horizon",
    targetCompletion: "Completed",
    fileCount: 28,
    activeTaskCount: 0,
    needsAttention: [],
    upcoming: [],
    recentActivity: [],
    suggestedPrompts: ["Review annual warranty and maintenance schedule for Azure Bay"],
  },
];

/** Convert a CreatedProject store entry to a DisplayProject for the grid */
function createdProjectToDisplay(cp: CreatedProject): DisplayProject {
  return {
    id: cp.id,
    name: cp.title,
    code: `KAL-${cp.id.toUpperCase().replace(/-/g, "").slice(0, 6)}-NEW`,
    location: cp.location || "—",
    category: cp.projectType || "Project",
    phase: "Proposal Accepted",
    lifecyclePhase: "created",
    image:
      cp.thumbnailUrl ||
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=900&auto=format&fit=crop&q=80",
    progress: 0,
    totalBudget: cp.budget || "—",
    paidAmount: "₹0",
    pendingAmount: cp.budget || "—",
    leadProvider: cp.providerName || "Kallisto Studio",
    targetCompletion: "TBD",
    fileCount: 0,
    activeTaskCount: 0,
    needsAttention: [],
    upcoming: [],
    recentActivity: [],
    suggestedPrompts: [`Tell me what happens next for ${cp.title}`],
  };
}

const ALL_PHASES = [
  "Briefing",
  "Site verification",
  "Concept",
  "Design development",
  "Approvals",
  "BOQ and procurement",
  "Construction",
  "Handover",
  "Post-handover",
];

const ALL_LOCATIONS = [
  "Bangalore, Karnataka",
  "Calicut, Kerala",
  "Kochi, Kerala",
  "Kottayam, Kerala",
  "Munnar, Kerala",
];

const ATTENTION_OPTIONS = ["All Status", "Needs Attention"];
const SORT_OPTIONS = ["Recently updated", "Progress High-Low", "Name A-Z"];

export function ClientProjectsWorkspace() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<ProjectLifecyclePhase>("construction");
  const [searchQuery, setSearchQuery] = useState("");
  const [createdProjects, setCreatedProjects] = useState<CreatedProject[]>([]);

  // Popover filter values
  const [activePopover, setActivePopover] = useState<"phase" | "attention" | "location" | "sort" | null>(null);
  const [selectedPhase, setSelectedPhase] = useState<string | null>(null);
  const [selectedAttention, setSelectedAttention] = useState<string>("All Status");
  const [selectedSort, setSelectedSort] = useState<string>("Recently updated");
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [appliedLocations, setAppliedLocations] = useState<string[]>([]);
  const [locationSearch, setLocationSearch] = useState("");

  // Outside click listener to close popovers when clicking outside dropdown anchor
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as HTMLElement | null;
      if (target && !target.closest(`.${styles.popoverAnchor}`)) {
        setActivePopover(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Load created projects and subscribe to changes
  useEffect(() => {
    const initialList = getCreatedProjects();
    setCreatedProjects(initialList);
    if (initialList.length > 0) {
      setActiveTab("created");
    }
    const unsub = subscribeToCreatedProjects((newList) => {
      setCreatedProjects(newList);
      if (newList.length > 0) {
        setActiveTab("created");
      }
    });
    return unsub;
  }, []);

  const createdDisplayProjects = useMemo(() => {
    const fromStore = createdProjects.map(createdProjectToDisplay);
    const staticCreated = CLIENT_DISPLAY_PROJECTS.filter((p) => p.lifecyclePhase === "created");

    const map = new Map<string, DisplayProject>();
    staticCreated.forEach((p) => map.set(p.id, p));
    fromStore.forEach((p) => map.set(p.id, p));
    return Array.from(map.values());
  }, [createdProjects]);

  // Tab counts
  const tabCounts = useMemo(() => {
    return {
      created: createdDisplayProjects.length,
      pre_construction: CLIENT_DISPLAY_PROJECTS.filter((p) => p.lifecyclePhase === "pre_construction").length,
      construction: CLIENT_DISPLAY_PROJECTS.filter((p) => p.lifecyclePhase === "construction").length,
      post_construction: CLIENT_DISPLAY_PROJECTS.filter((p) => p.lifecyclePhase === "post_construction").length,
    };
  }, [createdDisplayProjects.length]);

  const filteredLocationOptions = useMemo(() => {
    if (!locationSearch.trim()) return ALL_LOCATIONS;
    return ALL_LOCATIONS.filter((loc) =>
      loc.toLowerCase().includes(locationSearch.toLowerCase().trim())
    );
  }, [locationSearch]);

  const toggleLocationSelection = (loc: string) => {
    setSelectedLocations((prev) =>
      prev.includes(loc) ? prev.filter((item) => item !== loc) : [...prev, loc]
    );
  };

  const handleApplyLocations = () => {
    setAppliedLocations(selectedLocations);
    setActivePopover(null);
  };

  const handleClearLocations = () => {
    setSelectedLocations([]);
    setAppliedLocations([]);
    setActivePopover(null);
  };

  // Filtered projects
  const filteredProjects = useMemo(() => {
    const pool =
      activeTab === "created"
        ? createdDisplayProjects
        : CLIENT_DISPLAY_PROJECTS.filter((p) => p.lifecyclePhase === activeTab);

    let list = pool.filter((p) => {
      // 1. Phase Filter
      if (selectedPhase) {
        if (p.phase.toLowerCase() !== selectedPhase.toLowerCase()) return false;
      }

      // 2. Location Checkbox Filter
      if (appliedLocations.length > 0) {
        const matchesLoc = appliedLocations.some((loc) => {
          const cityOnly = loc.split(",")[0].trim().toLowerCase();
          return p.location.toLowerCase().includes(cityOnly);
        });
        if (!matchesLoc) return false;
      }

      // 3. Attention Filter
      if (selectedAttention === "Needs Attention") {
        if (p.needsAttention.length === 0 && p.activeTaskCount === 0) {
          return false;
        }
      }

      // 4. Search Query Match
      const q = searchQuery.toLowerCase().trim();
      if (
        q &&
        !p.name.toLowerCase().includes(q) &&
        !p.code.toLowerCase().includes(q) &&
        !p.location.toLowerCase().includes(q) &&
        !p.leadProvider.toLowerCase().includes(q)
      ) {
        return false;
      }

      return true;
    });

    // Sorting
    if (selectedSort === "Progress High-Low") {
      list = [...list].sort((a, b) => b.progress - a.progress);
    } else if (selectedSort === "Name A-Z") {
      list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    }

    return list;
  }, [activeTab, selectedPhase, appliedLocations, selectedAttention, selectedSort, searchQuery, createdDisplayProjects]);

  const handleCardClick = (project: DisplayProject) => {
    router.push(`/client/projects/${project.id}`);
  };

  const getTabLabel = (tab: ProjectLifecyclePhase) => {
    switch (tab) {
      case "created":
        return "Created Projects";
      case "pre_construction":
        return "Pre Construction";
      case "construction":
        return "Construction";
      case "post_construction":
        return "Post Construction";
    }
  };

  return (
    <div className={styles.workspaceContainer}>
      {/* ── Top Header Row (Title & Subtitle on Left, Search on Top-Right) ── */}
      <div className={styles.headerRow}>
        <div className={styles.headerLeft}>
          <h1 className={styles.pageTitle}>Projects</h1>
          <p className={styles.pageSubtitle}>
            Manage active, upcoming, on hold and completed work across your practice.
          </p>
        </div>

        <div className={styles.searchWrap}>
          <Search size={15} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search project, client or code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
            aria-label="Search project, client or code..."
          />
        </div>
      </div>

      {/* ── Status Tabs Row ── */}
      <nav className={styles.tabsNav} role="tablist" aria-label="Project Status Tabs">
        {/* Created Projects tab — first, before Pre Construction */}
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "created"}
          className={`${styles.tabBtn} ${activeTab === "created" ? styles.tabBtnActive : ""} ${styles.tabBtnCreated}`}
          onClick={() => setActiveTab("created")}
        >
          <CheckCircle2 size={15} />
          <span>Created Projects</span>
          {tabCounts.created > 0 && (
            <span className={`${styles.tabCount} ${styles.tabCountCreated}`}>
              {tabCounts.created}
            </span>
          )}
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "pre_construction"}
          className={`${styles.tabBtn} ${activeTab === "pre_construction" ? styles.tabBtnActive : ""}`}
          onClick={() => setActiveTab("pre_construction")}
        >
          <PreConstructionDuotoneIcon size={15} />
          <span>Pre Construction</span>
          <span className={styles.tabCount}>{tabCounts.pre_construction}</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "construction"}
          className={`${styles.tabBtn} ${activeTab === "construction" ? styles.tabBtnActive : ""}`}
          onClick={() => setActiveTab("construction")}
        >
          <ConstructionDuotoneIcon size={15} />
          <span>Construction</span>
          <span className={styles.tabCount}>{tabCounts.construction}</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "post_construction"}
          className={`${styles.tabBtn} ${activeTab === "post_construction" ? styles.tabBtnActive : ""}`}
          onClick={() => setActiveTab("post_construction")}
        >
          <PostConstructionDuotoneIcon size={15} />
          <span>Post Construction</span>
          <span className={styles.tabCount}>{tabCounts.post_construction}</span>
        </button>
      </nav>

      {/* ── Filter Dropdowns Row (Matching Screenshot 2 & 3 — NO Ownership filter) ── */}
      <div className={styles.filterRow}>
        <div className={styles.filterGroupLeft}>
          {/* 1. Project Phase Dropdown */}
          <div className={styles.popoverAnchor}>
            <button
              type="button"
              className={`${styles.dropdownPill} ${activePopover === "phase" || selectedPhase ? styles.dropdownPillActive : ""}`}
              onClick={() => setActivePopover(activePopover === "phase" ? null : "phase")}
            >
              <span>{selectedPhase || "Project Phase"}</span>
              <ChevronDown size={13} />
            </button>

            {activePopover === "phase" && (
              <div className={styles.popoverDropdownCard}>
                <div className={styles.popoverMenuList}>
                  {ALL_PHASES.map((phase) => (
                    <button
                      key={phase}
                      type="button"
                      className={`${styles.popoverMenuItem} ${selectedPhase === phase ? styles.popoverMenuItemActive : ""}`}
                      onClick={() => {
                        setSelectedPhase(selectedPhase === phase ? null : phase);
                        setActivePopover(null);
                      }}
                    >
                      <span>{phase}</span>
                      {selectedPhase === phase && <CheckCircle2 size={13} color="#0f172a" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 2. Needs Attention Dropdown */}
          <div className={styles.popoverAnchor}>
            <button
              type="button"
              className={`${styles.dropdownPill} ${activePopover === "attention" || selectedAttention !== "All Status" ? styles.dropdownPillActive : ""}`}
              onClick={() => setActivePopover(activePopover === "attention" ? null : "attention")}
            >
              <span>{selectedAttention}</span>
              <ChevronDown size={13} />
            </button>

            {activePopover === "attention" && (
              <div className={styles.popoverDropdownCard}>
                <div className={styles.popoverMenuList}>
                  {ATTENTION_OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      className={`${styles.popoverMenuItem} ${selectedAttention === opt ? styles.popoverMenuItemActive : ""}`}
                      onClick={() => {
                        setSelectedAttention(opt);
                        setActivePopover(null);
                      }}
                    >
                      <span>{opt}</span>
                      {selectedAttention === opt && <CheckCircle2 size={13} color="#0f172a" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 3. Location Checkbox Dropdown */}
          <div className={styles.popoverAnchor}>
            <button
              type="button"
              className={`${styles.dropdownPill} ${activePopover === "location" || appliedLocations.length > 0 ? styles.dropdownPillActive : ""}`}
              onClick={() => setActivePopover(activePopover === "location" ? null : "location")}
            >
              <span>
                {appliedLocations.length === 1
                  ? appliedLocations[0].split(",")[0]
                  : appliedLocations.length > 1
                  ? `Location (${appliedLocations.length})`
                  : "Location"}
              </span>
              <ChevronDown size={13} />
            </button>

            {activePopover === "location" && (
              <div className={`${styles.popoverDropdownCard} ${styles.locationPopoverCard}`}>
                <div className={styles.popoverSearchBox}>
                  <Search size={14} className={styles.popoverSearchIcon} />
                  <input
                    type="text"
                    value={locationSearch}
                    onChange={(e) => setLocationSearch(e.target.value)}
                    placeholder="Search city or district"
                    className={styles.popoverInput}
                    autoFocus
                  />
                </div>

                <div className={styles.popoverCheckboxList}>
                  {filteredLocationOptions.map((loc) => (
                    <label key={loc} className={styles.popoverCheckboxRow}>
                      <input
                        type="checkbox"
                        checked={selectedLocations.includes(loc)}
                        onChange={() => toggleLocationSelection(loc)}
                        className={styles.checkboxInput}
                      />
                      <span>{loc}</span>
                    </label>
                  ))}
                </div>

                <div className={styles.popoverDivider} />

                <div className={styles.popoverFooterRow}>
                  <button type="button" className={styles.clearTextBtn} onClick={handleClearLocations}>
                    Clear
                  </button>
                  <button type="button" className={styles.applyBtn} onClick={handleApplyLocations}>
                    Apply
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 4. Recently Updated Dropdown */}
        <div className={styles.popoverAnchor}>
          <button
            type="button"
            className={`${styles.dropdownPill} ${activePopover === "sort" ? styles.dropdownPillActive : ""}`}
            onClick={() => setActivePopover(activePopover === "sort" ? null : "sort")}
          >
            <span>{selectedSort}</span>
            <ChevronDown size={13} />
          </button>

          {activePopover === "sort" && (
            <div className={`${styles.popoverDropdownCard} ${styles.popoverDropdownRight}`}>
              <div className={styles.popoverMenuList}>
                {SORT_OPTIONS.map((sortOpt) => (
                  <button
                    key={sortOpt}
                    type="button"
                    className={`${styles.popoverMenuItem} ${selectedSort === sortOpt ? styles.popoverMenuItemActive : ""}`}
                    onClick={() => {
                      setSelectedSort(sortOpt);
                      setActivePopover(null);
                    }}
                  >
                    <span>{sortOpt}</span>
                    {selectedSort === sortOpt && <CheckCircle2 size={13} color="#0f172a" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Projects Grid ── */}
      {filteredProjects.length > 0 ? (
        <div className={styles.pcGrid} role="region" aria-label="Projects Grid">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className={`${styles.pcCard} ${project.lifecyclePhase === "created" ? styles.pcCardCreated : ""}`}
              onClick={() => handleCardClick(project)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCardClick(project);
              }}
              aria-label={`Project ${project.name}, location ${project.location}`}
            >
              {/* Photo Box with Overlay Badge */}
              <div className={styles.pcMediaContainer}>
                <Image
                  src={project.image}
                  alt={project.name}
                  fill
                  sizes="(max-width: 600px) 100vw, (max-width: 960px) 50vw, (max-width: 1280px) 33vw, 25vw"
                  className={styles.pcMediaImage}
                  unoptimized
                />
                <div className={styles.pcMediaGradient} />
                <div className={styles.pcBottomOverlay}>
                  <span
                    className={`${styles.pcPhasePill} ${
                      project.lifecyclePhase === "created" ? styles.pcPhasePillCreated : ""
                    }`}
                  >
                    {project.phase}
                  </span>
                </div>
              </div>

              {/* Text Section Below Image */}
              <div className={styles.pcInfoSection}>
                <div className={styles.pcTitleRow}>
                  <h3 className={styles.pcName} title={project.name}>
                    {project.name}
                  </h3>
                  <span className={styles.pcPercent}>
                    {project.lifecyclePhase === "created" ? "New" : `${project.progress}%`}
                  </span>
                </div>

                <div className={styles.pcSubtitleRow}>
                  <span className={styles.pcLocation}>{project.location}</span>
                  {project.category && (
                    <span style={{ fontSize: "11px", color: "#94a3b8" }}>{project.category}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : activeTab === "created" ? (
        /* Empty state for Created Projects — actionable nudge */
        <div className={styles.emptyState}>
          <FolderOpen size={36} style={{ color: "#94a3b8" }} />
          <h3 className={styles.emptyTitle}>No created projects yet</h3>
          <p className={styles.emptySubtitle}>
            When you accept a proposal from your Enquiries, the project will appear here ready for the next stage.
          </p>
          <button
            type="button"
            className={styles.emptyActionBtn}
            onClick={() => router.push("/client/enquiries")}
          >
            View Enquiries
          </button>
        </div>
      ) : (
        <div className={styles.emptyState}>
          <Building2 size={36} style={{ color: "#94a3b8" }} />
          <h3 className={styles.emptyTitle}>No {getTabLabel(activeTab)} projects</h3>
          <p className={styles.emptySubtitle}>
            There are currently no projects in this lifecycle phase matching the selected filters.
          </p>
        </div>
      )}
    </div>
  );
}
