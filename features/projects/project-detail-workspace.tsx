"use client";

import React, { useEffect, useRef, useState, type RefObject } from "react";
import Link from "next/link";
import { Project } from "@/types/domain/project";
import { projectService } from "@/services/repositories/project-service";
import { RoutePageContainer } from "@/components/ui/route-page-container";
import { ProjectOverviewCard } from "@/features/documents/components/project-overview-card";
import { useProjectDashboardLayout } from "@/features/documents/hooks/use-project-dashboard-layout";
import { useDrawerBehaviour } from "@/features/hands/components/use-drawer-behaviour";
import styles from "./projects.module.css";

interface ProjectDetailWorkspaceProps {
  projectId: string;
  activeTab?: string;
}

interface UpdatesDrawerFocusManagerProps {
  panelRef: RefObject<HTMLElement | null>;
  onClose: () => void;
}

function UpdatesDrawerFocusManager({
  panelRef,
  onClose,
}: UpdatesDrawerFocusManagerProps) {
  useDrawerBehaviour(panelRef, onClose);
  return null;
}

export function ProjectDetailWorkspace({ projectId }: ProjectDetailWorkspaceProps) {
  const [project, setProject] = useState<Project | null>(() => {
    return typeof projectService?.getProjectByIdSync === "function"
      ? projectService.getProjectByIdSync("ws-default", projectId)
      : null;
  });
  const [loading, setLoading] = useState(!project);
  const [error, setError] = useState(false);
  const [updatesOpen, setUpdatesOpen] = useState(false);
  const updatesPanelRef = useRef<HTMLDivElement>(null);
  const updatesTriggerRef = useRef<HTMLButtonElement>(null);
  const { dashboardRef, mode: updatesMode, updatesWidth } =
    useProjectDashboardLayout(!loading && !error && project !== null);

  useEffect(() => {
    if (updatesMode !== "rail") return;

    const closeTimer = window.setTimeout(() => setUpdatesOpen(false), 0);
    return () => window.clearTimeout(closeTimer);
  }, [updatesMode]);

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
      setLoading(true);
      setError(false);
      try {
        const p = await projectService.getProjectById("ws-default", projectId);
        if (!active) return;
        if (!p) {
          setError(true);
          return;
        }
        setProject(p);
      } catch (err) {
        console.error(err);
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
      <div className="workspace-container">
        <div className="route-state-box route-state-loading" aria-label="Loading project detail">
          <div className="skeleton-bar skeleton-title" />
          <div className="skeleton-bar skeleton-subtitle" />
          <div className="skeleton-grid">
            <div className="skeleton-card" />
            <div className="skeleton-card" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="workspace-container">
        <div className={styles.stateBox}>
          <h3 className={styles.stateTitle}>Project not found</h3>
          <p className={styles.stateDesc}>The requested project workspace record could not be located.</p>
          <Link href="/projects" className={styles.primaryBtn}>
            Back to Projects
          </Link>
        </div>
      </div>
    );
  }

  return (
    <RoutePageContainer
      className="project-dashboard-page"
      title={project.name || "Nila Residence"}
      showHeading={false}
    >
      <ProjectOverviewCard
        projectId={project.id}
        dashboardRef={dashboardRef}
        layoutMode={updatesMode}
        updatesOpen={updatesOpen}
        updatesPanelRef={updatesPanelRef}
        updatesWidth={updatesWidth}
        onUpdatesClose={() => setUpdatesOpen(false)}
        updatesTriggerRef={updatesTriggerRef}
        onOpenUpdates={() => setUpdatesOpen(true)}
        projectName={project.name}
        description={project.description}
        projectStatus={project.status}
        isUpcoming={project.status === "upcoming"}
        statValues={{
          projectType: project.projectType || "Residential Design",
          duration: "Within 6 Months",
          builtUpArea: "2,800 – 3,200 sq ft",
          budget: project.budget && project.budget !== "₹ 12,0000" ? project.budget : "₹40L – ₹60L",
          client: "Ananya Builders",
        }}
      />
      {updatesMode === "drawer" && updatesOpen ? (
        <UpdatesDrawerFocusManager
          panelRef={updatesPanelRef}
          onClose={() => setUpdatesOpen(false)}
        />
      ) : null}
    </RoutePageContainer>
  );
}
