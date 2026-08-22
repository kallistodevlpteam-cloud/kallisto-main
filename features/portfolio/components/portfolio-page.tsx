"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  PortfolioCollection,
  PortfolioPageData,
  PortfolioProfile,
  PortfolioProject,
  PortfolioTab,
} from "@/features/portfolio/types/portfolio.types";
import { PortfolioCaseStudies } from "./portfolio-case-studies";
import { PortfolioCoverBanner } from "./portfolio-cover-banner";
import { PortfolioHighlights } from "./portfolio-highlights";
import { PortfolioPackageSummary } from "./portfolio-package-summary";
import { PortfolioPricing } from "./portfolio-pricing";
import { PortfolioProfileHeader } from "./portfolio-profile-header";
import { PortfolioProjectGrid } from "./portfolio-project-grid";
import { PortfolioProjectViewer } from "./portfolio-project-viewer";
import { PortfolioReviews } from "./portfolio-reviews";
import { PortfolioStatistics } from "./portfolio-statistics";
import { PortfolioTabs } from "./portfolio-tabs";
import { PortfolioTaggedGrid } from "./portfolio-tagged-grid";
import styles from "./portfolio.module.css";

interface PortfolioPageProps {
  data: PortfolioPageData;
  initialTab: PortfolioTab;
  initialCollectionId?: string;
  initialProjectId?: string;
}

export function PortfolioPage({
  data,
  initialTab,
  initialCollectionId,
  initialProjectId,
}: PortfolioPageProps) {
  const isOwner = data.mode === "owner";
  const [profile, setProfile] = useState<PortfolioProfile>(data.profile);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [selectedCollection, setSelectedCollection] =
    useState<PortfolioCollection>(
      data.collections.find(
        (collection) => collection.id === initialCollectionId,
      ) ?? data.collections[0],
    );
  const [selectedProject, setSelectedProject] =
    useState<PortfolioProject | null>(
      data.projects.find((project) => project.id === initialProjectId) ?? null,
    );
  const [coverImageUrl, setCoverImageUrl] = useState(
    data.profile.coverImageUrl,
  );
  const projectTriggerRef = useRef<HTMLButtonElement | null>(null);
  const uploadedCoverRef = useRef<string | null>(null);

  const visibleProjects = useMemo(() => {
    return data.projects.filter((project) =>
      selectedCollection.projectIds.includes(project.id),
    );
  }, [data.projects, selectedCollection]);

  const restoreProjectFocus = useCallback(() => {
    window.requestAnimationFrame(() => {
      projectTriggerRef.current?.focus();
    });
  }, []);

  const dismissProject = useCallback(() => {
    setSelectedProject(null);
    restoreProjectFocus();
  }, [restoreProjectFocus]);

  const closeProject = useCallback(() => {
    if (window.history.state?.portfolioProjectViewer) {
      window.history.back();
      return;
    }

    const url = new URL(window.location.href);
    url.searchParams.delete("project");
    window.history.replaceState(window.history.state, "", url);
    dismissProject();
  }, [dismissProject]);

  useEffect(() => {
    const handlePopState = () => {
      if (selectedProject) {
        dismissProject();
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [dismissProject, selectedProject]);

  useEffect(() => {
    return () => {
      if (uploadedCoverRef.current) {
        URL.revokeObjectURL(uploadedCoverRef.current);
      }
    };
  }, []);

  const openProject = (
    project: PortfolioProject,
    trigger: HTMLButtonElement,
  ) => {
    projectTriggerRef.current = trigger;
    setSelectedProject(project);
    const url = new URL(window.location.href);
    url.searchParams.set("project", project.id);
    window.history.pushState(
      { ...window.history.state, portfolioProjectViewer: true },
      "",
      url,
    );
  };

  const navigateProject = (project: PortfolioProject) => {
    setSelectedProject(project);
    const url = new URL(window.location.href);
    url.searchParams.set("project", project.id);
    window.history.replaceState(window.history.state, "", url);
  };

  const updateCover = (file: File) => {
    if (uploadedCoverRef.current) {
      URL.revokeObjectURL(uploadedCoverRef.current);
    }
    const nextUrl = URL.createObjectURL(file);
    uploadedCoverRef.current = nextUrl;
    setCoverImageUrl(nextUrl);
  };

  const [isEditingProfile, setIsEditingProfile] = useState(false);

  const showPricingPlans = () => {
    setActiveTab("pricing");
    const url = new URL(window.location.href);
    url.searchParams.set("portfolioTab", "pricing");
    url.searchParams.delete("project");
    window.history.replaceState(window.history.state, "", url);
    window.requestAnimationFrame(() => {
      const tabEl = document.getElementById("portfolio-tab-pricing");
      tabEl?.focus();
      tabEl?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  return (
    <div className={styles.portfolioPage}>
      <section className={styles.portfolioHero} aria-label="Portfolio profile">
        <PortfolioCoverBanner
          isOwner={isOwner}
          profile={profile}
          coverImageUrl={coverImageUrl}
          onCoverSelected={updateCover}
          onEdit={() => setIsEditingProfile(true)}
        />

        <div className={styles.portfolioHeroContent}>
          <PortfolioProfileHeader
            isOwner={isOwner}
            profile={profile}
            onProfileChange={setProfile}
            isEditingExternal={isEditingProfile}
            onCloseEditingExternal={() => setIsEditingProfile(false)}
          />
          <PortfolioPackageSummary onViewPlans={showPricingPlans} />
        </div>
      </section>

      <div className={styles.profileContent}>
        <PortfolioStatistics statistics={data.statistics} />
        <PortfolioHighlights
          collections={data.collections}
          isOwner={isOwner}
          selectedCollectionId={selectedCollection.id}
          onSelect={setSelectedCollection}
        />
      </div>

      <main className={styles.portfolioContent}>
        <PortfolioTabs
          activeTab={activeTab}
          isOwner={isOwner}
          onAddProject={() => {
            window.location.hash = "add-project";
          }}
          onTabChange={setActiveTab}
        />

        <section
          className={styles.tabPanel}
          id={`portfolio-panel-${activeTab}`}
          role="tabpanel"
          aria-label={`${activeTab.replace("-", " ")} portfolio content`}
        >
          {activeTab === "projects" ? (
            <PortfolioProjectGrid
              projects={visibleProjects}
              profile={profile}
              isOwner={isOwner}
              onOpenProject={openProject}
            />
          ) : null}
          {activeTab === "case-studies" ? (
            <PortfolioCaseStudies
              caseStudies={data.caseStudies}
              projects={data.projects}
              isOwner={isOwner}
              onOpenProject={openProject}
            />
          ) : null}
          {activeTab === "tagged" ? (
            <PortfolioTaggedGrid
              initialItems={data.taggedItems}
              isOwner={isOwner}
            />
          ) : null}
          {activeTab === "reviews" ? <PortfolioReviews /> : null}
          {activeTab === "pricing" ? <PortfolioPricing /> : null}
        </section>
      </main>

      {selectedProject ? (
        <PortfolioProjectViewer
          key={selectedProject.id}
          project={selectedProject}
          projects={visibleProjects.length > 0 ? visibleProjects : data.projects}
          profile={profile}
          isOwner={isOwner}
          onClose={closeProject}
          onNavigate={navigateProject}
        />
      ) : null}
    </div>
  );
}
