"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Search, X } from "lucide-react";
import {
  MapPinDuotoneIcon,
  CalendarDuotoneIcon,
  BuildingDuotoneIcon,
} from "@/components/layout/sidebar-icons";
import { Project } from "@/types/domain/project";
import { projectService } from "@/services/repositories/project-service";
import { RoutePageContainer } from "@/components/ui/route-page-container";
import { DocumentsTitleRowActions } from "@/features/documents/components/documents-title-row-actions";
import { ProjectOverviewCard } from "@/features/documents/components/project-overview-card";
import { ProjectDocumentsWorkspace } from "./components/documents/project-documents-workspace";
import { ProjectBoqWorkspace } from "./boq/components/project-boq-workspace";
import { ProjectTasksWorkspace } from "./components/tasks/project-tasks-workspace";
import { ProjectTimelineWorkspace } from "./components/timeline/project-timeline-workspace";
import { ProjectFinanceWorkspace } from "./finance/components/project-finance-workspace";
import { ProjectSiteWorkspace } from "./site/components/project-site-workspace";
import styles from "./projects.module.css";
import documentStyles from "./components/documents/project-documents-workspace.module.css";
import enquiryStyles from "@/features/enquiries/detail/components/enquiry-detail-workspace.module.css";

export const PROJECT_MODULE_TITLES: Record<string, string> = {
  tasks: "Tasks",
  timeline: "Timeline",
  gantt: "Gantt Chart",
  documents: "Docs",
  boq: "Bill of Quantities",
  finance: "Finance",
  site: "Site",
  updates: "Updates",
};

export const SEARCH_PLACEHOLDERS: Record<string, string> = {
  tasks: "Search tasks, assignees or phases",
  timeline: "Search timeline...",
  gantt: "Search gantt...",
  documents: "Search files, folders or tags",
  boq: "Search items, codes or sections",
  finance: "Search finances or invoices",
  site: "Search site reports, logs",
  updates: "Search updates...",
};

interface ProjectModuleSubpageProps {
  projectId: string;
  module: "updates" | "tasks" | "timeline" | "gantt" | "documents" | "boq" | "finance" | "site";
  customTitle?: string;
}

export function ProjectModuleSubpage({ projectId, module, customTitle }: ProjectModuleSubpageProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const isGantt = module === "gantt" || Boolean(pathname?.endsWith("/timeline/gantt"));
  const effectiveModule = isGantt ? "gantt" : module;
  const searchQuery = searchParams?.get("q") || "";
  const [project, setProject] = useState<Project | null>(() => {
    return typeof projectService?.getProjectByIdSync === "function"
      ? projectService.getProjectByIdSync("ws-default", projectId)
      : null;
  });
  const [loading, setLoading] = useState(!project);
  const [error, setError] = useState(false);

  const handleSearchChange = (val: string) => {
    const params = new URLSearchParams(searchParams ? searchParams.toString() : "");
    if (val.trim()) {
      params.set("q", val);
    } else {
      params.delete("q");
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  useEffect(() => {
    let active = true;
    async function loadData() {
      if (typeof projectService?.getProjectByIdSync === "function") {
        const cached = projectService.getProjectByIdSync("ws-default", projectId);
        if (cached) {
          setProject(cached);
          setLoading(false);
          return;
        }
      }
      try {
        setLoading(true);
        setError(false);
        const data = await projectService.getProjectById("ws-default", projectId);
        if (!active) return;
        if (!data) {
          setError(true);
        } else {
          setProject(data);
        }
      } catch {
        if (active) setError(true);
      } finally {
        if (active) setLoading(false);
      }
    }
    loadData();
    return () => {
      active = false;
    };
  }, [projectId]);

  if (loading) {
    return (
      <div className="workspace-container" style={{ padding: "24px" }}>
        <div className={styles.loadingSkeleton} />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="workspace-container" style={{ padding: "24px" }}>
        <div className={styles.stateBox}>
          <h3 className={styles.stateTitle}>Project record not found</h3>
          <p className={styles.stateDesc}>The project subpage workspace could not be loaded.</p>
          <Link href="/projects" className={styles.primaryBtn}>
            Back to Projects
          </Link>
        </div>
      </div>
    );
  }

  const title =
    customTitle ||
    PROJECT_MODULE_TITLES[effectiveModule] ||
    PROJECT_MODULE_TITLES[module] ||
    project.name ||
    "Nila Residence";

  return (
    <RoutePageContainer
      title={title}
      showHeading={false}
      className={`project-dashboard-page ${
        module === "documents"
          ? `${documentStyles.documentsBoundedRoute} documentsBoundedRoute`
          : module === "boq"
          ? "boqBoundedRoute"
          : ""
      }`}
      showShareAction={false}
    >
      <div className="project-subpage-root">
        {/* Persistent Top Header pinned in the EXACT same spot as the Overview page */}
        <div
          className={`poc-left-header-sticky project-subpage-header-sticky ${
            module !== "documents" ? "page-heading" : ""
          }`}
        >
          <div className={enquiryStyles.headerBlock}>
            <div className={enquiryStyles.titleRow}>
              <h1 className={enquiryStyles.projectTitle}>{title}</h1>
              <DocumentsTitleRowActions />
            </div>

            <div className="project-subpage-meta-search-row">
              <div className={enquiryStyles.subMetaRow}>
                <div className={enquiryStyles.subMetaLeft}>
                  <span className={enquiryStyles.metaItem}>
                    <strong className={enquiryStyles.metaHighlight}>
                      {project.name || "Nila Residence"}
                    </strong>
                  </span>
                  <span className={enquiryStyles.metaDivider}>•</span>
                  <span className={enquiryStyles.metaItem}>
                    <MapPinDuotoneIcon size={15} className={enquiryStyles.locationPinIcon} />
                    <span>{project.location || "Calicut, Kerala"}</span>
                  </span>
                  <span className={enquiryStyles.metaDivider}>•</span>
                  <span className={enquiryStyles.metaItem}>
                    <CalendarDuotoneIcon size={14} className={enquiryStyles.metaIconMuted} />
                    <span>Received Jul 23, 2026</span>
                  </span>
                </div>

                <div className={enquiryStyles.subMetaRight}>
                  <span className={enquiryStyles.metaItem}>
                    <BuildingDuotoneIcon size={14} className={enquiryStyles.metaIconMuted} />
                    <span>{project.projectType || "Residential Design"}</span>
                  </span>
                  <span className={enquiryStyles.metaDivider}>•</span>
                  <span className={`${enquiryStyles.stagePillInline} ${enquiryStyles.stageNew}`}>
                    <span className={enquiryStyles.stageDot} />
                    <span>New</span>
                  </span>
                </div>
              </div>

              {/* Header Search Box in the right space */}
              <div className="project-subpage-header-search">
                <Search size={14} className="subpage-search-icon" aria-hidden="true" />
                <input
                  type="text"
                  placeholder={SEARCH_PLACEHOLDERS[effectiveModule] || SEARCH_PLACEHOLDERS[module] || "Search..."}
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="subpage-search-input"
                  aria-label={`Search ${title}`}
                />
                {searchQuery ? (
                  <button
                    type="button"
                    onClick={() => handleSearchChange("")}
                    className="subpage-search-clear"
                    aria-label="Clear search"
                  >
                    <X size={13} aria-hidden="true" />
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        {/* Subpage Workspace Body */}
        <div className="project-subpage-content">
          {module === "tasks" ? (
            <ProjectTasksWorkspace project={project} />
          ) : module === "timeline" || module === "gantt" || isGantt ? (
            <ProjectTimelineWorkspace project={project} />
          ) : module === "boq" ? (
            <ProjectBoqWorkspace project={project} />
          ) : module === "finance" ? (
            <ProjectFinanceWorkspace project={project} />
          ) : module === "site" ? (
            <ProjectSiteWorkspace project={project} />
          ) : module === "documents" ? (
            <ProjectDocumentsWorkspace
              projectId={project.id}
              projectCode={project.projectCode}
              hideHeaderTitleRow={true}
            />
          ) : (
            <ProjectOverviewCard
              projectId={project.id}
              projectName={project.name}
              description={project.description}
              projectStatus={project.status}
              isUpcoming={project.status === "upcoming"}
            />
          )}
        </div>
      </div>
    </RoutePageContainer>
  );
}
