"use client";

import { KeyboardEvent, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Plus } from "lucide-react";
import {
  BuildingDuotoneIcon,
  CaseStudiesDuotoneIcon,
  PricingDuotoneIcon,
  ReviewsDuotoneIcon,
  TagDuotoneIcon,
} from "@/components/layout/sidebar-icons";
import type { PortfolioTab } from "@/features/portfolio/types/portfolio.types";
import {
  buildPortfolioQuery,
  getPortfolioTabs,
} from "@/features/portfolio/utils/portfolio-query-state";
import styles from "./portfolio.module.css";

const TAB_CONFIG: Record<
  PortfolioTab,
  { label: string; icon: React.ComponentType<{ size?: number; className?: string }> }
> = {
  projects: { label: "Projects", icon: BuildingDuotoneIcon },
  "case-studies": { label: "Case Studies", icon: CaseStudiesDuotoneIcon },
  tagged: { label: "Tagged", icon: TagDuotoneIcon },
  reviews: { label: "Reviews", icon: ReviewsDuotoneIcon },
  pricing: { label: "Pricing", icon: PricingDuotoneIcon },
};

interface PortfolioTabsProps {
  activeTab: PortfolioTab;
  isOwner: boolean;
  hidePricing?: boolean;
  onAddProject: () => void;
  onTabChange: (tab: PortfolioTab) => void;
}

export function PortfolioTabs({
  activeTab,
  isOwner,
  hidePricing,
  onAddProject,
  onTabChange,
}: PortfolioTabsProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const toolbarRef = useRef<HTMLDivElement | null>(null);
  const allTabs = getPortfolioTabs(isOwner);
  const tabs = hidePricing ? allTabs.filter((tab) => tab !== "pricing") : allTabs;

  const selectTab = (tab: PortfolioTab) => {
    const query = buildPortfolioQuery(
      new URLSearchParams(searchParams.toString()),
      tab,
    );
    router.replace(`${pathname}?${query}`, { scroll: false });
    onTabChange(tab);

    // Smoothly scroll the tab bar into the top freeze zone
    if (typeof toolbarRef.current?.scrollIntoView === "function") {
      toolbarRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  const handleKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    currentIndex: number,
  ) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") {
      return;
    }
    event.preventDefault();
    const direction = event.key === "ArrowRight" ? 1 : -1;
    const nextIndex = (currentIndex + direction + tabs.length) % tabs.length;
    const nextTab = tabs[nextIndex];
    selectTab(nextTab);
    tabRefs.current[nextIndex]?.focus();
  };

  return (
    <div ref={toolbarRef} className={styles.tabsToolbar}>
      <div
        className={styles.portfolioTabs}
        role="tablist"
        aria-label="Portfolio sections"
      >
        {tabs.map((tab, index) => {
          const config = TAB_CONFIG[tab];
          const Icon = config.icon;

          return (
            <button
              id={`portfolio-tab-${tab}`}
              className={`${styles.portfolioTab} ${
                activeTab === tab ? styles.portfolioTabActive : ""
              }`}
              type="button"
              role="tab"
              aria-selected={activeTab === tab}
              aria-controls={`portfolio-panel-${tab}`}
              tabIndex={activeTab === tab ? 0 : -1}
              key={tab}
              ref={(element) => {
                tabRefs.current[index] = element;
              }}
              onClick={() => selectTab(tab)}
              onKeyDown={(event) => handleKeyDown(event, index)}
            >
              <Icon size={16} className={styles.tabIcon} aria-hidden="true" />
              <span>{config.label}</span>
            </button>
          );
        })}
      </div>
      {isOwner ? (
        <button
          className={styles.addProjectDedicatedBtn}
          type="button"
          aria-label="Add project"
          onClick={onAddProject}
        >
          <Plus size={15} strokeWidth={2.2} aria-hidden="true" />
          <span>Add project</span>
        </button>
      ) : null}
    </div>
  );
}
