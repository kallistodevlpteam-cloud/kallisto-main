"use client";

import {
  Check,
  ChevronDown,
  LayoutGrid,
  List,
  PanelLeft,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { formatRelativeTime } from "@/lib/utils/format-relative-time";
import {
  DriveModifiedRange,
  DriveQueryState,
  DriveSort,
  DriveViewMode,
} from "./drive-query-state";
import styles from "./project-documents-workspace.module.css";

interface FilterOption {
  value: string;
  label: string;
}

type FilterMenuId = "type" | "people" | "modified" | "source";

function toggleValue(values: string[], value: string): string[] {
  return values.includes(value)
    ? values.filter((candidate) => candidate !== value)
    : [...values, value];
}

interface MultiFilterProps {
  filterId: FilterMenuId;
  label: string;
  options: FilterOption[];
  values: string[];
  isOpen: boolean;
  onChange: (values: string[]) => void;
  onOpenChange: (open: boolean) => void;
}

function MultiFilter({
  filterId,
  label,
  options,
  values,
  isOpen,
  onChange,
  onOpenChange,
}: MultiFilterProps) {
  return (
    <details
      className={styles.filterMenu}
      data-filter-id={filterId}
      open={isOpen}
      onKeyDown={(event) => {
        if (event.key !== "Escape" || !isOpen) return;
        event.preventDefault();
        onOpenChange(false);
        event.currentTarget.querySelector("summary")?.focus();
      }}
    >
      <summary
        className={values.length ? styles.filterTriggerActive : styles.filterTrigger}
        aria-expanded={isOpen}
        onClick={(event) => {
          event.preventDefault();
          onOpenChange(!isOpen);
        }}
      >
        <span>{label}</span>
        <ChevronDown size={14} strokeWidth={1.75} aria-hidden="true" />
      </summary>
      <div className={styles.filterPopover} role="group" aria-label={`${label} filters`}>
        {options.map((option) => {
          const checked = values.includes(option.value);
          return (
            <label key={option.value} className={styles.filterOption}>
              <input
                type="checkbox"
                checked={checked}
                onChange={() => onChange(toggleValue(values, option.value))}
              />
              <span className={styles.filterCheckbox} aria-hidden="true">
                {checked ? <Check size={12} strokeWidth={1.75} /> : null}
              </span>
              <span>{option.label}</span>
            </label>
          );
        })}
        {values.length ? (
          <button type="button" className={styles.filterClearButton} onClick={() => onChange([])}>
            Clear {label.toLowerCase()}
          </button>
        ) : null}
      </div>
    </details>
  );
}

const modifiedOptions: Array<{ value: DriveModifiedRange; label: string }> = [
  { value: "all", label: "Any time" },
  { value: "today", label: "Today" },
  { value: "week", label: "Past 7 days" },
  { value: "month", label: "Past 30 days" },
  { value: "older", label: "Older than 30 days" },
];

interface ModifiedFilterProps {
  value: DriveModifiedRange;
  isOpen: boolean;
  onChange: (value: DriveModifiedRange) => void;
  onOpenChange: (open: boolean) => void;
}

function ModifiedFilter({ value, isOpen, onChange, onOpenChange }: ModifiedFilterProps) {
  return (
    <details
      className={styles.filterMenu}
      data-filter-id="modified"
      open={isOpen}
      onKeyDown={(event) => {
        if (event.key !== "Escape" || !isOpen) return;
        event.preventDefault();
        onOpenChange(false);
        event.currentTarget.querySelector("summary")?.focus();
      }}
    >
      <summary
        className={value !== "all" ? styles.filterTriggerActive : styles.filterTrigger}
        aria-expanded={isOpen}
        onClick={(event) => {
          event.preventDefault();
          onOpenChange(!isOpen);
        }}
      >
        <span>Modified</span>
        <ChevronDown size={14} strokeWidth={1.75} aria-hidden="true" />
      </summary>
      <div className={styles.filterPopover} role="radiogroup" aria-label="Modified filters">
        {modifiedOptions.map((option) => (
          <label key={option.value} className={styles.filterOption}>
            <input
              type="radio"
              name="drive-modified-filter"
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
            />
            <span className={styles.filterRadio} aria-hidden="true" />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
    </details>
  );
}

const sortOptions: Array<{ value: DriveSort; label: string }> = [
  { value: "updated-desc", label: "Last updated" },
  { value: "updated-asc", label: "Oldest updated" },
  { value: "name-asc", label: "Name A–Z" },
  { value: "name-desc", label: "Name Z–A" },
  { value: "size-desc", label: "Largest size" },
  { value: "size-asc", label: "Smallest size" },
];

interface DriveToolbarProps {
  folderTitle: string;
  fileCount: number;
  lastUpdatedAt?: string | null;
  filters: DriveQueryState["filters"];
  typeOptions: FilterOption[];
  peopleOptions: FilterOption[];
  sourceOptions: FilterOption[];
  sort: DriveSort;
  viewMode: DriveViewMode;
  onFiltersChange: (filters: DriveQueryState["filters"]) => void;
  onSortChange: (sort: DriveSort) => void;
  onViewChange: (view: DriveViewMode) => void;
  onOpenSidebar: () => void;
}

export function DriveToolbar({
  folderTitle,
  fileCount,
  lastUpdatedAt,
  filters,
  typeOptions,
  peopleOptions,
  sourceOptions,
  sort,
  viewMode,
  onFiltersChange,
  onSortChange,
  onViewChange,
  onOpenSidebar,
}: DriveToolbarProps) {
  const [openFilter, setOpenFilter] = useState<FilterMenuId | null>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!openFilter) return;

    const dismissOutside = (event: PointerEvent) => {
      const activeMenu = toolbarRef.current?.querySelector(
        `[data-filter-id="${openFilter}"]`,
      );
      if (activeMenu?.contains(event.target as Node)) return;
      setOpenFilter(null);
    };

    document.addEventListener("pointerdown", dismissOutside);
    return () => document.removeEventListener("pointerdown", dismissOutside);
  }, [openFilter]);

  const activeFilterCount =
    filters.types.length +
    filters.people.length +
    filters.sources.length +
    (filters.modifiedRange === "all" ? 0 : 1);

  const clearAll = () =>
    onFiltersChange({ types: [], people: [], modifiedRange: "all", sources: [] });

  const relativeTimeLabel = lastUpdatedAt
    ? formatRelativeTime(lastUpdatedAt)
    : "Just now";

  return (
    <div className={styles.driveMainHeader}>
      <div className={styles.folderHeaderRow}>
        <div className={styles.folderHeadingBlock}>
          <h2>{folderTitle}</h2>
          <p>
            {fileCount} {fileCount === 1 ? "File" : "Files"} • Last updated {relativeTimeLabel}
          </p>
        </div>
        <div className={styles.viewSwitcher} aria-label="Document view">
          <button
            type="button"
            aria-label="List view"
            aria-pressed={viewMode === "list"}
            className={viewMode === "list" ? styles.viewBtnActive : styles.viewBtn}
            onClick={() => onViewChange("list")}
          >
            <List size={18} strokeWidth={1.75} aria-hidden="true" />
          </button>
          <button
            type="button"
            aria-label="Grid view"
            aria-pressed={viewMode === "grid"}
            className={viewMode === "grid" ? styles.viewBtnActive : styles.viewBtn}
            onClick={() => onViewChange("grid")}
          >
            <LayoutGrid size={18} strokeWidth={1.75} aria-hidden="true" />
          </button>
        </div>
      </div>

      <div
        ref={toolbarRef}
        className={styles.driveToolbar}
        aria-label="Document filters and display controls"
      >
        <button
          type="button"
          className={styles.sidebarToggle}
          aria-label="Open folder navigation"
          onClick={onOpenSidebar}
        >
          <PanelLeft size={18} strokeWidth={1.75} aria-hidden="true" />
          Folders
        </button>
        <div className={styles.filterControls}>
          <span className={styles.mobileFilterLabel}>
            <SlidersHorizontal size={16} strokeWidth={1.75} aria-hidden="true" /> Filters
          </span>
          <MultiFilter
            filterId="type"
            label="Type"
            options={typeOptions}
            values={filters.types}
            isOpen={openFilter === "type"}
            onChange={(types) => onFiltersChange({ ...filters, types })}
            onOpenChange={(open) => setOpenFilter(open ? "type" : null)}
          />
          <MultiFilter
            filterId="people"
            label="People"
            options={peopleOptions}
            values={filters.people}
            isOpen={openFilter === "people"}
            onChange={(people) => onFiltersChange({ ...filters, people })}
            onOpenChange={(open) => setOpenFilter(open ? "people" : null)}
          />
          <ModifiedFilter
            value={filters.modifiedRange}
            isOpen={openFilter === "modified"}
            onChange={(modifiedRange) => onFiltersChange({ ...filters, modifiedRange })}
            onOpenChange={(open) => setOpenFilter(open ? "modified" : null)}
          />
          <MultiFilter
            filterId="source"
            label="Source"
            options={sourceOptions}
            values={filters.sources}
            isOpen={openFilter === "source"}
            onChange={(sources) => onFiltersChange({ ...filters, sources })}
            onOpenChange={(open) => setOpenFilter(open ? "source" : null)}
          />
          {activeFilterCount ? (
            <button type="button" className={styles.clearAllFilters} onClick={clearAll}>
              <X size={16} strokeWidth={1.75} aria-hidden="true" />
              Clear all ({activeFilterCount})
            </button>
          ) : null}
        </div>
        <div className={styles.toolbarDisplayControls}>
          <label className={styles.sortControl}>
            <SlidersHorizontal size={16} strokeWidth={1.75} aria-hidden="true" />
            <select
              aria-label="Sort documents"
              value={sort}
              onChange={(event) => onSortChange(event.target.value as DriveSort)}
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>
    </div>
  );
}
