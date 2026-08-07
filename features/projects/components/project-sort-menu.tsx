import React, { useState } from "react";
import { ChevronDown, Check } from "lucide-react";
import { ProjectSortOption } from "../types/project.types";
import styles from "../projects.module.css";

interface ProjectSortMenuProps {
  currentSort?: ProjectSortOption;
  onSelectSort: (sort: ProjectSortOption) => void;
}

const SORT_OPTIONS: Array<{ value: ProjectSortOption; label: string }> = [
  { value: "recently-updated", label: "Recently updated" },
  { value: "project-name", label: "Project name" },
  { value: "start-date", label: "Start date" },
  { value: "completion-date", label: "Completion date" },
  { value: "highest-priority", label: "Highest priority" },
];

export function ProjectSortMenu({
  currentSort = "recently-updated",
  onSelectSort,
}: ProjectSortMenuProps) {
  const [open, setOpen] = useState(false);

  const currentLabel =
    SORT_OPTIONS.find((opt) => opt.value === currentSort)?.label || "Recently updated";

  return (
    <div className={styles.sortMenuContainer}>
      <button
        type="button"
        className={styles.sortSelectBtn}
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span>{currentLabel}</span>
        <ChevronDown size={14} />
      </button>

      {open && (
        <div className={styles.dropdownContentRight} role="listbox">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              role="option"
              aria-selected={currentSort === opt.value}
              className={`${styles.dropdownItem}${currentSort === opt.value ? ` ${styles.dropdownItemActive}` : ""}`}
              onClick={() => {
                onSelectSort(opt.value);
                setOpen(false);
              }}
            >
              <span>{opt.label}</span>
              {currentSort === opt.value && <Check size={14} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
