"use client";

import React, { useState, useEffect } from "react";
import styles from "./home-workspace.module.css";
import { HomeHeader } from "./home-header";
import { ProfileCompletionCard } from "./components/profile-completion-card";
import { ActiveProjectsSection } from "./active-projects-section";
import { WorkspaceDashboardSection } from "./components/workspace-dashboard-section";
import { StudioSection } from "./components/studio-section";
import { homeWorkspaceService } from "@/services/repositories/home-workspace-service";
import { ActiveProjectItem } from "@/types/domain/home";
import { FileText, Layers, Edit3, Wrench } from "lucide-react";

export interface HomeWorkspaceProps {
  userRole?: string;
  userName?: string;
}

export function HomeWorkspace({ userName = "Arjun", userRole = "owner" }: HomeWorkspaceProps) {
  const [projects, setProjects] = useState<ActiveProjectItem[]>([]);

  useEffect(() => {
    homeWorkspaceService.getActiveProjects(userRole).then((data) => {
      setProjects(data);
    });
  }, [userRole]);

  return (
    <div className="workspace-container">
      <div className={styles.svgHomeContainer}>
        {/* Welcome Header */}
        <HomeHeader userName={userName} />

        {/* Profile Completion Stepper Card */}
        <ProfileCompletionCard />

        {/* 4 Cards Row */}
        <div className={styles.drawingCardsRow} aria-label="Drawing status overview">
          <div className={styles.drawingCard}>
            <div className={styles.drawingCardIconWrapper}>
              <FileText size={15} className={styles.drawingCardIcon} />
            </div>
            <div className={styles.drawingCardText}>
              <h3>MEP Drawings</h3>
              <p>View 3 new</p>
            </div>
          </div>

          <div className={styles.drawingCard}>
            <div className={styles.drawingCardIconWrapper}>
              <Layers size={15} className={styles.drawingCardIcon} />
            </div>
            <div className={styles.drawingCardText}>
              <h3>BOQ / Scope</h3>
              <p>12 items</p>
            </div>
          </div>

          <div className={styles.drawingCard}>
            <div className={styles.drawingCardIconWrapper}>
              <Edit3 size={15} className={styles.drawingCardIcon} />
            </div>
            <div className={styles.drawingCardText}>
              <h3>Shop Drawings</h3>
              <p>5 pending</p>
            </div>
          </div>

          <div className={styles.drawingCard}>
            <div className={styles.drawingCardIconWrapper}>
              <Wrench size={15} className={styles.drawingCardIcon} />
            </div>
            <div className={styles.drawingCardText}>
              <h3>Mockup Drawings</h3>
              <p>2 ready</p>
            </div>
          </div>
        </div>

        {/* Assigned Projects Section */}
        <ActiveProjectsSection projects={projects} title="Assigned Projects" />

        {/* Schedule Section */}
        <WorkspaceDashboardSection />

        {/* Studio Section */}
        <StudioSection />
      </div>
    </div>
  );
}
