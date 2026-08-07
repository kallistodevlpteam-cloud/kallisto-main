"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ActiveProjectItem } from "@/types/domain/home";
import { ActiveProjectCard } from "./components/active-project-card";
import styles from "./home-workspace.module.css";

export interface ActiveProjectsSectionProps {
  projects: ActiveProjectItem[];
  title?: string;
}

export function ActiveProjectsSection({ projects, title = "Active Projects" }: ActiveProjectsSectionProps) {
  // Display up to 4 equal-width operational cards on the Home workspace
  const displayProjects = projects.slice(0, 4);

  return (
    <section className={styles.activeProjectsSection}>
      <div className={styles.activeProjectsHeader}>
        <div>
          <h2 className={styles.sectionTitleLarge}>{title}</h2>
          <p className={styles.sectionSubtitle}>
            Operational health, milestone progress, and pending decisions across your active sites.
          </p>
        </div>
        <Link href="/projects" className={styles.headerActionLink}>
          <span>View all projects</span>
          <ArrowRight size={14} />
        </Link>
      </div>

      {displayProjects.length === 0 ? (
        <div className={styles.emptyStateBox}>
          <p>No active projects found. Qualified enquiries can be converted into projects.</p>
        </div>
      ) : (
        <div className={styles.assignedProjectsContainer} aria-label="Assigned projects">
          <div className={styles.assignedProjectsTrack}>
            {displayProjects.map((proj, idx) => (
              <ActiveProjectCard key={proj.id} project={proj} index={idx} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
