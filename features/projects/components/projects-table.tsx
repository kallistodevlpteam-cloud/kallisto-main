import React from "react";
import { ProjectListItem, ProjectStatus } from "../types/project.types";
import { ProjectMobileCard } from "./project-mobile-card";
import { ProjectTableRow } from "./project-table-row";
import styles from "../projects.module.css";

interface ProjectsTableProps {
  projects: ProjectListItem[];
  onUpdateStatus?: (projectId: string, newStatus: ProjectStatus, reason?: string) => void;
  onOpenReopenModal?: (project: ProjectListItem) => void;
}

export function ProjectsTable({
  projects,
  onUpdateStatus,
  onOpenReopenModal,
}: ProjectsTableProps) {
  return null;
}
