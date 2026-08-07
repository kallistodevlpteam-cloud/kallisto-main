"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
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

export const PROJECT_MODULE_TITLES: Record<string, string> = {
  tasks: "Tasks",
  timeline: "Timeline",
  documents: "Docs",
  boq: "Bill of Quantities",
  finance: "Finance",
  site: "Site",
  updates: "Updates",
};

interface ProjectModuleSubpageProps {
  projectId: string;
  module: "updates" | "tasks" | "timeline" | "documents" | "boq" | "finance" | "site";
}

export function ProjectModuleSubpage({ projectId, module }: ProjectModuleSubpageProps) {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(false);
      try {
        const p = await projectService.getProjectById("ws-default", projectId);
        if (!p) {
          setError(true);
          return;
        }
        setProject(p);
      } catch (err) {
        console.error("Failed to load project for module subpage:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [projectId]);

  if (loading) {
    return (
      <div className="workspace-container" style={{ padding: "24px" }}>
        <div className="route-state-box route-state-loading" aria-label="Loading subpage workspace">
          <div className="skeleton-bar skeleton-title" />
          <div className="skeleton-bar skeleton-subtitle" />
          <div className="skeleton-card" />
        </div>
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

  const title = PROJECT_MODULE_TITLES[module] || project.name || "Nila Residence";

  return (
    <RoutePageContainer
      title={title}
      showHeading={module !== "documents"}
      className={
        module === "documents"
          ? `${documentStyles.documentsBoundedRoute} documentsBoundedRoute`
          : module === "boq"
          ? "boqBoundedRoute"
          : undefined
      }
      showShareAction={false}
      titleRowContent={module === "documents" ? undefined : <DocumentsTitleRowActions />}
    >
      {module === "tasks" ? (
        <ProjectTasksWorkspace project={project} />
      ) : module === "timeline" ? (
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
        />
      ) : (
        <ProjectOverviewCard />
      )}
    </RoutePageContainer>
  );
}

