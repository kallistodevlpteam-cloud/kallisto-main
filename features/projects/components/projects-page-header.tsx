import React from "react";
import { Search, X } from "lucide-react";
import styles from "../projects.module.css";

interface ProjectsPageHeaderProps {
  canImport?: boolean;
  onOpenImportDrawer?: () => void;
  searchInput?: string;
  setSearchInput?: (val: string) => void;
}

export function ProjectsPageHeader({
  canImport: _canImport,
  onOpenImportDrawer: _onOpenImportDrawer,
  searchInput = "",
  setSearchInput = () => {},
}: ProjectsPageHeaderProps) {
  return (
    <div className={styles.projectsHeader}>
      <div className={styles.pageHeaderLeft}>
        <h1 className={styles.title}>Projects</h1>
        <p className={styles.description}>
          Manage active, upcoming, on hold and completed work across your practice.
        </p>
      </div>

      <div className={styles.pageHeaderRight}>
        <div className={styles.headerSearchContainer}>
          <Search size={16} className={styles.headerSearchIcon} />
          <input
            type="text"
            placeholder="Search project, client or code..."
            className={styles.headerSearchInput}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          {searchInput && (
            <button
              type="button"
              onClick={() => setSearchInput("")}
              className={styles.clearSearchBtn}
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}



