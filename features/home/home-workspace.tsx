"use client";

import React, { useState, useEffect } from "react";
import styles from "./home-workspace.module.css";
import { RoutePageContainer } from "@/components/ui/route-page-container";
import { HomeHeader } from "./home-header";
import { ProfileCompletionCard } from "./components/profile-completion-card";
import { ActiveProjectsSection } from "./active-projects-section";
import { WorkspaceDashboardSection } from "./components/workspace-dashboard-section";
import { StudioSection } from "./components/studio-section";
import { HomeIntelligencePanel } from "./components/home-intelligence-panel";
import { homeWorkspaceService } from "@/services/repositories/home-workspace-service";
import {
  ActiveProjectItem,
  PriorityPreview,
} from "@/types/domain/home";

export interface HomeWorkspaceProps {
  userRole?: string;
  userName?: string;
}

export function HomeWorkspace({
  userName = "Arjun",
  userRole = "owner",
}: HomeWorkspaceProps) {
  const [projects, setProjects] = useState<ActiveProjectItem[]>([]);
  const [attentionItems, setAttentionItems] = useState<PriorityPreview[]>([]);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      const [projs, attention] = await Promise.all([
        homeWorkspaceService.getActiveProjects(userRole),
        homeWorkspaceService.getPriorityPreviews(userRole),
      ]);
      if (isMounted) {
        setProjects(projs);
        setAttentionItems(attention);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, [userRole]);

  return (
    <div className={styles.homeWorkspace}>
      <RoutePageContainer
        className="project-dashboard-page"
        title={`Welcome, ${userName}`}
        showHeading={false}
      >
        <div className={styles.homeLayout}>
          {/* Left Main Workspace Column */}
          <main className={styles.homeMain}>
            {/* Main Scrollable Content Area */}
            <div className={styles.homeMainScrollArea}>
              {/* Top Greeting & Operational Header */}
              <div className={styles.homeHeaderBlock}>
                <HomeHeader
                  userName={userName}
                  attentionCount={attentionItems.length || 5}
                />
              </div>

              {/* Profile Completion Stepper Card */}
              <ProfileCompletionCard />

              {/* Assigned Projects Section */}
              <ActiveProjectsSection
                projects={projects}
                title="Assigned Projects"
              />

              {/* Schedule / Calendar Preview Section */}
              <WorkspaceDashboardSection />

              {/* Studio Section */}
              <StudioSection />
            </div>
          </main>

          {/* Right Fixed Context & Intelligence Area */}
          <aside
            className={styles.homeDetails}
            aria-label="Practice Intelligence & Actions"
          >
            <div className={styles.homeDetailsTop}>
              <HomeIntelligencePanel attentionItems={attentionItems} />
            </div>
          </aside>
        </div>
      </RoutePageContainer>
    </div>
  );
}
