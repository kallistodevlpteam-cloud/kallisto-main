"use client";

import { X } from "lucide-react";
import React, { useEffect, useRef } from "react";
import { ThemeSelect } from "@/components/ui/theme-select";
import { BoqSection } from "@/types/domain/project-boq";
import styles from "./project-boq-workspace.module.css";

export type ToggleableColumn = "unit" | "quantity" | "rate";
export type StatusFilter = "all" | "draft" | "reviewed" | "approved" | "issues";
export type SortValue = "code" | "description" | "amount-desc" | "amount-asc";

interface BoqFilterPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  sections: BoqSection[];
  sectionFilter: string;
  onSectionFilterChange: (value: string) => void;
  statusFilter: StatusFilter;
  onStatusFilterChange: (value: StatusFilter) => void;
  sort: SortValue;
  onSortChange: (value: SortValue) => void;
  visibleColumns: Set<ToggleableColumn>;
  onToggleColumn: (column: ToggleableColumn) => void;
  allExpanded: boolean;
  onToggleAllExpanded: () => void;
  onClearFilters: () => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
}

export function BoqFilterPopover({
  isOpen,
  onClose,
  sections,
  sectionFilter,
  onSectionFilterChange,
  statusFilter,
  onStatusFilterChange,
  sort,
  onSortChange,
  visibleColumns,
  onToggleColumn,
  allExpanded,
  onToggleAllExpanded,
  onClearFilters,
  triggerRef,
}: BoqFilterPopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    function handlePointerDown(event: PointerEvent) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
        triggerRef.current?.focus();
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose, triggerRef]);

  if (!isOpen) return null;

  return (
    <div
      ref={popoverRef}
      id="boq-filter-popover"
      className={styles.filterPopover}
      role="dialog"
      aria-label="BOQ filters and settings"
    >
      <div className={styles.filterPopoverHeader}>
        <strong>Filters & Settings</strong>
        <button
          type="button"
          className={styles.popoverCloseBtn}
          aria-label="Close filters"
          onClick={onClose}
        >
          <X size={14} aria-hidden="true" />
        </button>
      </div>

      <div className={styles.filterPopoverBody}>
        {/* Section Filter */}
        <div className={styles.filterGroup}>
          <label htmlFor="boq-filter-section">Section</label>
          <ThemeSelect
            id="boq-filter-section"
            fullWidth
            value={sectionFilter}
            onChange={onSectionFilterChange}
            options={[
              { value: "all", label: "All sections" },
              ...sections.map((section) => ({
                value: section.id,
                label: `${section.code} · ${section.title}`,
              })),
            ]}
          />
        </div>

        {/* Status Filter */}
        <div className={styles.filterGroup}>
          <label htmlFor="boq-filter-status">Status</label>
          <ThemeSelect
            id="boq-filter-status"
            fullWidth
            value={statusFilter}
            onChange={(val) => onStatusFilterChange(val as StatusFilter)}
            options={[
              { value: "all", label: "All statuses" },
              { value: "draft", label: "Draft" },
              { value: "reviewed", label: "Reviewed" },
              { value: "approved", label: "Approved" },
              { value: "issues", label: "Validation issues" },
            ]}
          />
        </div>

        {/* Sort */}
        <div className={styles.filterGroup}>
          <label htmlFor="boq-filter-sort">Sort order</label>
          <ThemeSelect
            id="boq-filter-sort"
            fullWidth
            value={sort}
            onChange={(val) => onSortChange(val as SortValue)}
            options={[
              { value: "code", label: "Code" },
              { value: "description", label: "Description" },
              { value: "amount-desc", label: "Amount, high to low" },
              { value: "amount-asc", label: "Amount, low to high" },
            ]}
          />
        </div>

        {/* Visible Columns */}
        <div className={styles.filterGroup}>
          <span className={styles.filterGroupLabel}>Visible columns</span>
          <div className={styles.checkboxGrid}>
            {(
              [
                ["unit", "Unit"],
                ["quantity", "Quantity"],
                ["rate", "Rate"],
              ] as Array<[ToggleableColumn, string]>
            ).map(([col, label]) => (
              <label key={col} className={styles.checkboxOption}>
                <input
                  type="checkbox"
                  checked={visibleColumns.has(col)}
                  onChange={() => onToggleColumn(col)}
                />
                <span>{label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Section Expand/Collapse Toggle */}
        <div className={styles.filterGroup}>
          <span className={styles.filterGroupLabel}>Section display</span>
          <div className={styles.toggleButtonGroup}>
            <button
              type="button"
              className={`${styles.toggleOptionBtn} ${allExpanded ? styles.activeToggle : ""}`}
              onClick={() => {
                if (!allExpanded) onToggleAllExpanded();
              }}
            >
              Expand all
            </button>
            <button
              type="button"
              className={`${styles.toggleOptionBtn} ${!allExpanded ? styles.activeToggle : ""}`}
              onClick={() => {
                if (allExpanded) onToggleAllExpanded();
              }}
            >
              Collapse all
            </button>
          </div>
        </div>
      </div>

      <div className={styles.filterPopoverFooter}>
        <button
          type="button"
          className={styles.clearFiltersBtn}
          onClick={onClearFilters}
        >
          Clear filters
        </button>
        <button
          type="button"
          className={styles.primaryButton}
          style={{ height: "30px", fontSize: "11.5px" }}
          onClick={onClose}
        >
          Done
        </button>
      </div>
    </div>
  );
}
