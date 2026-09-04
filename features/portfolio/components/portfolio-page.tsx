"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
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
import { PortfolioReviews } from "./portfolio-reviews";
import { PortfolioStatistics } from "./portfolio-statistics";
import { PortfolioTabs } from "./portfolio-tabs";
import { PortfolioTaggedGrid } from "./portfolio-tagged-grid";
import styles from "./portfolio.module.css";

interface PortfolioPageProps {
  data: PortfolioPageData;
  initialTab: PortfolioTab;
  initialCollectionId?: string;
}

export function PortfolioPage({
  data,
  initialTab,
  initialCollectionId,
}: PortfolioPageProps) {
  const router = useRouter();
  const isOwner = data.mode === "owner";
  const [profile, setProfile] = useState<PortfolioProfile>(data.profile);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [selectedCollection, setSelectedCollection] =
    useState<PortfolioCollection>(
      data.collections.find(
        (collection) => collection.id === initialCollectionId,
      ) ?? data.collections[0],
    );
  const [coverImageUrl, setCoverImageUrl] = useState(
    data.profile.coverImageUrl,
  );
  const uploadedCoverRef = useRef<string | null>(null);

  const visibleProjects = useMemo(() => {
    return data.projects.filter((project) =>
      selectedCollection.projectIds.includes(project.id),
    );
  }, [data.projects, selectedCollection]);

  useEffect(() => {
    return () => {
      if (uploadedCoverRef.current) {
        URL.revokeObjectURL(uploadedCoverRef.current);
      }
    };
  }, []);

  const openProject = (project: PortfolioProject) => {
    const targetSlug = project.slug || project.id;
    router.push(`/portfolio/projects/${targetSlug}`);
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

      <main
        className={`${styles.portfolioContent} ${
          activeTab === "case-studies" ? styles.portfolioContentFixed : ""
        }`}
      >
        <PortfolioTabs
          activeTab={activeTab}
          isOwner={isOwner}
          onAddProject={() => {
            router.push("/portfolio/projects/new");
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
          {activeTab === "pricing" ? (
            <PortfolioPricing profile={profile} isOwner={isOwner} />
          ) : null}
        </section>
      </main>
    </div>
  );
}
