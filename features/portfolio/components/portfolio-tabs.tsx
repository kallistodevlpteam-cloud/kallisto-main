"use client";

import { KeyboardEvent, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Banknote,
  Building2,
  FileText,
  Heart,
  Plus,
  Tag,
} from "lucide-react";
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
  projects: { label: "Projects", icon: Building2 },
  "case-studies": { label: "Case Studies", icon: FileText },
  tagged: { label: "Tagged", icon: Tag },
  reviews: { label: "Reviews", icon: Heart },
  pricing: { label: "Pricing", icon: Banknote },
};

interface PortfolioTabsProps {
  activeTab: PortfolioTab;
  isOwner: boolean;
  onAddProject: () => void;
  onTabChange: (tab: PortfolioTab) => void;
}

export function PortfolioTabs({
  activeTab,
  isOwner,
  onAddProject,
  onTabChange,
}: PortfolioTabsProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const tabs = getPortfolioTabs(isOwner);

  const selectTab = (tab: PortfolioTab) => {
    const query = buildPortfolioQuery(
      new URLSearchParams(searchParams.toString()),
      tab,
    );
    router.replace(`${pathname}?${query}`, { scroll: false });
    onTabChange(tab);
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
    <div className={styles.tabsToolbar}>
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
          className={styles.addProjectButton}
          type="button"
          aria-label="Add project"
          onClick={onAddProject}
        >
          <Plus size={15} aria-hidden="true" />
          <span>Add project</span>
        </button>
      ) : null}
    </div>
  );
}
