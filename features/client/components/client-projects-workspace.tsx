"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Search,
  ChevronDown,
  Building2,
} from "lucide-react";
import {
  PreConstructionDuotoneIcon,
  ConstructionDuotoneIcon,
  PostConstructionDuotoneIcon,
} from "@/components/layout/sidebar-icons";
import { ClientProject } from "../types";
import { ClientProjectDetailDrawer } from "./client-project-detail-drawer";
import styles from "./client-projects.module.css";

export type ProjectLifecyclePhase = "pre_construction" | "construction" | "post_construction";

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
    code: "KAL-GER2-2026",
    location: "Alappuzha Backwaters",
    category: "Hospitality & Eco-Living",
    phase: "Permits & Feasibility",
    lifecyclePhase: "pre_construction",
    image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=900&auto=format&fit=crop&q=80",
    progress: 15,
    totalBudget: "₹1,80,00,000",
    paidAmount: "₹35,00,000",
    pendingAmount: "₹1,45,00,000",
    leadProvider: "Apex Environmental Designs",
    targetCompletion: "February 2027",
    fileCount: 20,
    activeTaskCount: 2,
    needsAttention: [],
    upcoming: [],
    recentActivity: [],
    suggestedPrompts: ["Show me the landscape water-body plans for Greenfield Eco Resort"],
  },

  // ── CONSTRUCTION ──────────────────────────────────────────────────
  {
    id: "proj-nila-residence",
    name: "Nila Residence",
    code: "KAL-NR-2026",
    location: "Kakkanad, Kochi",
    category: "Contemporary Architecture",
    phase: "In progress",
    lifecyclePhase: "construction",
    image: "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=900&auto=format&fit=crop&q=80",
    progress: 62,
    totalBudget: "₹95,00,000",
    paidAmount: "₹55,00,000",
    pendingAmount: "₹40,00,000",
    leadProvider: "Arjun Architects",
    targetCompletion: "October 2026",
    fileCount: 18,
    activeTaskCount: 3,
    needsAttention: [
      {
        id: "att-nr-1",
        title: "Review Pool Deck Reinforcement Drawing",
        category: "Approval",
        urgency: "high",
        date: "Action by Tomorrow",
        actionLabel: "Review Drawing",
      },
    ],
    upcoming: [],
    recentActivity: [],
    suggestedPrompts: ["Review pool deck structural details with Odin"],
  },
  {
    id: "proj-greenfield-resort",
    name: "Greenfield Eco Resort",
    code: "KAL-GER-2026",
    location: "Alappuzha Backwaters",
    category: "Hospitality & Eco-Living",
    phase: "In progress",
    lifecyclePhase: "construction",
    image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=900&auto=format&fit=crop&q=80",
    progress: 55,
    totalBudget: "₹2,50,00,000",
    paidAmount: "₹1,40,00,000",
    pendingAmount: "₹1,10,00,000",
    leadProvider: "Apex Environmental Designs",
    targetCompletion: "January 2027",
    fileCount: 24,
    activeTaskCount: 4,
    needsAttention: [
      {
        id: "att-ger-1",
        title: "Confirm Thatched Roof Treated Timber Specs",
        category: "Decision",
        urgency: "high",
        date: "Due in 2 days",
        actionLabel: "Confirm Material",
      },
    ],
    upcoming: [],
    recentActivity: [],
    suggestedPrompts: ["Check ecological sustainability report for Alappuzha site"],
  },
  {
    id: "proj-nila-residence-phase2",
    name: "Nila Residence",
    code: "KAL-NR2-2026",
    location: "Kakkanad, Kochi",
    category: "Residential Architecture",
    phase: "In progress",
    lifecyclePhase: "construction",
    image: "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=900&auto=format&fit=crop&q=80",
    progress: 70,
    totalBudget: "₹85,00,000",
    paidAmount: "₹60,00,000",
    pendingAmount: "₹25,00,000",
    leadProvider: "Arjun Architects",
    targetCompletion: "November 2026",
    fileCount: 14,
    activeTaskCount: 1,
    needsAttention: [],
    upcoming: [],
    recentActivity: [],
    suggestedPrompts: ["Audit Milestone 3 payments for Nila Residence"],
  },

  // ── POST CONSTRUCTION ─────────────────────────────────────────────
  {
    id: "proj-palm-heights",
    name: "Palm Heights Penthouse",
    code: "KAL-PH-2025",
    location: "Trivandrum City",
    category: "Luxury Penthouse",
    phase: "Handover complete",
    lifecyclePhase: "post_construction",
    image: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=900&auto=format&fit=crop&q=80",
    progress: 100,
    totalBudget: "₹1,60,00,000",
    paidAmount: "₹1,60,00,000",
    pendingAmount: "₹0",
    leadProvider: "Kallisto Studio",
    targetCompletion: "Completed",
    fileCount: 32,
    activeTaskCount: 0,
    needsAttention: [],
    upcoming: [],
    recentActivity: [],
    suggestedPrompts: ["Download handover sign-off certificate for Palm Heights"],
  },
  {
    id: "proj-azure-bay",
    name: "Azure Bay Villa",
    code: "KAL-AB-2025",
    location: "Calicut Coastline",
    category: "Beachfront Villa",
    phase: "Post-handover warranty",
    lifecyclePhase: "post_construction",
    image: "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=900&auto=format&fit=crop&q=80",
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

export function ClientProjectsWorkspace() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<ProjectLifecyclePhase>("construction");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<string>("all");
  const [selectedProjectForDetail, setSelectedProjectForDetail] = useState<ClientProject | null>(null);

  // Tab counts
  const tabCounts = useMemo(() => {
    return {
      pre_construction: CLIENT_DISPLAY_PROJECTS.filter((p) => p.lifecyclePhase === "pre_construction").length,
      construction: CLIENT_DISPLAY_PROJECTS.filter((p) => p.lifecyclePhase === "construction").length,
      post_construction: CLIENT_DISPLAY_PROJECTS.filter((p) => p.lifecyclePhase === "post_construction").length,
    };
  }, []);

  // Filtered projects
  const filteredProjects = useMemo(() => {
    return CLIENT_DISPLAY_PROJECTS.filter((p) => {
      // Tab filter
      if (p.lifecyclePhase !== activeTab) return false;

      // Location filter
      if (selectedLocation !== "all" && !p.location.toLowerCase().includes(selectedLocation.toLowerCase())) {
        return false;
      }

      // Search match
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
  }, [activeTab, selectedLocation, searchQuery]);

  const handleCardClick = (project: DisplayProject) => {
    router.push(`/client/projects/${project.id}`);
  };

  const getTabLabel = (tab: ProjectLifecyclePhase) => {
    switch (tab) {
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

      {/* ── Status Tabs Row (Pre Construction, Construction, Post Construction) ── */}
      <nav className={styles.tabsNav} role="tablist" aria-label="Project Status Tabs">
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

      {/* ── Filter Dropdowns Row ── */}
      <div className={styles.filterRow}>
        <div className={styles.filterGroupLeft}>
          <button type="button" className={styles.dropdownPill}>
            <span>Ownership</span>
            <ChevronDown size={13} />
          </button>

          <button type="button" className={styles.dropdownPill}>
            <span>Project Phase</span>
            <ChevronDown size={13} />
          </button>

          <button type="button" className={styles.dropdownPill}>
            <span>Needs Attention</span>
            <ChevronDown size={13} />
          </button>

          <button
            type="button"
            className={`${styles.dropdownPill} ${selectedLocation !== "all" ? styles.dropdownPillActive : ""}`}
            onClick={() => setSelectedLocation((prev) => (prev === "all" ? "Kochi" : "all"))}
          >
            <span>Location</span>
            <ChevronDown size={13} />
          </button>
        </div>

        <button type="button" className={styles.dropdownPill}>
          <span>Recently updated</span>
          <ChevronDown size={13} />
        </button>
      </div>

      {/* ── 4-Column Photo Cards Grid (Matching Reference Screenshot) ── */}
      {filteredProjects.length > 0 ? (
        <div className={styles.pcGrid} role="region" aria-label="Projects Grid">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className={styles.pcCard}
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
                  <span className={styles.pcPhasePill}>{project.phase}</span>
                </div>
              </div>

              {/* Text Section Below Image */}
              <div className={styles.pcInfoSection}>
                <div className={styles.pcTitleRow}>
                  <h3 className={styles.pcName} title={project.name}>
                    {project.name}
                  </h3>
                  <span className={styles.pcDash}>—</span>
                </div>

                <div className={styles.pcSubtitleRow}>
                  <span className={styles.pcLocation}>{project.location}</span>
                </div>
              </div>
            </div>
          ))}
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

      {/* ── Interactive Detail Modal / Drawer ── */}
      {selectedProjectForDetail && (
        <ClientProjectDetailDrawer
          project={selectedProjectForDetail}
          onClose={() => setSelectedProjectForDetail(null)}
          onOpenOdinWithPrompt={(promptText) => {
            router.push(
              `/client/overview?projectId=${selectedProjectForDetail.id}&prompt=${encodeURIComponent(promptText)}`
            );
            setSelectedProjectForDetail(null);
          }}
        />
      )}
    </div>
  );
}
