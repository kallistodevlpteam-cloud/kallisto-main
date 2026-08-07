import { Search } from "lucide-react";
import type { RefObject } from "react";

import type {
  HubCategoryFilter,
  HubProjectFilter,
  HubQueryState,
  MaterialRequestStatus,
  ProjectOption,
  RequiredDateFilter,
} from "../types/hub.types";
import { MATERIAL_REQUEST_STATUS_LABELS } from "../utils/filter-material-requests";
import styles from "./hub-workspace.module.css";

interface MaterialRequestToolbarProps {
  projects: ReadonlyArray<ProjectOption>;
  query: HubQueryState;
  searchInputRef: RefObject<HTMLInputElement | null>;
  onChange: (update: Partial<HubQueryState>) => void;
}

const CATEGORY_OPTIONS: ReadonlyArray<{
  value: HubCategoryFilter;
  label: string;
}> = [
  { value: "all", label: "All categories" },
  { value: "cement", label: "Cement & aggregates" },
  { value: "electrical", label: "Electrical" },
  { value: "sanitaryware", label: "Sanitaryware" },
  { value: "steel", label: "Steel" },
];

const DATE_OPTIONS: ReadonlyArray<{
  value: RequiredDateFilter;
  label: string;
}> = [
  { value: "all", label: "Any required date" },
  { value: "overdue", label: "Overdue" },
  { value: "7_days", label: "Next 7 days" },
  { value: "30_days", label: "Next 30 days" },
];

export function MaterialRequestToolbar({
  projects,
  query,
  searchInputRef,
  onChange,
}: MaterialRequestToolbarProps) {
  return (
    <div className={styles.toolbar} aria-label="Material request filters">
      <label className={styles.searchField}>
        <span className="sr-only">Search material requests</span>
        <Search size={15} aria-hidden="true" />
        <input
          ref={searchInputRef}
          type="search"
          value={query.search}
          placeholder="Search requests or materials"
          aria-label="Search material requests"
          onChange={(event) => onChange({ search: event.target.value })}
        />
      </label>

      <div className={styles.toolbarFilters}>
        <label className={styles.filterControl}>
          <span className="sr-only">Filter by project</span>
          <select
            aria-label="Filter by project"
            value={query.project}
            onChange={(event) =>
              onChange({ project: event.target.value as HubProjectFilter })
            }
          >
            <option value="all">All projects</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </label>

        <label className={styles.filterControl}>
          <span className="sr-only">Filter by category</span>
          <select
            aria-label="Filter by category"
            value={query.category}
            onChange={(event) =>
              onChange({ category: event.target.value as HubCategoryFilter })
            }
          >
            {CATEGORY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className={styles.filterControl}>
          <span className="sr-only">Filter by status</span>
          <select
            aria-label="Filter by status"
            value={query.status ?? ""}
            onChange={(event) =>
              onChange({
                status: event.target.value
                  ? (event.target.value as MaterialRequestStatus)
                  : null,
              })
            }
          >
            <option value="">All statuses</option>
            {Object.entries(MATERIAL_REQUEST_STATUS_LABELS).map(
              ([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ),
            )}
          </select>
        </label>

        <label className={styles.filterControl}>
          <span className="sr-only">Filter by required date</span>
          <select
            aria-label="Filter by required date"
            value={query.requiredDate}
            onChange={(event) =>
              onChange({
                requiredDate: event.target.value as RequiredDateFilter,
              })
            }
          >
            {DATE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <button
          className={`${styles.attentionToggle}${
            query.attention ? ` ${styles.attentionToggleActive}` : ""
          }`}
          type="button"
          role="switch"
          aria-checked={query.attention}
          onClick={() => onChange({ attention: !query.attention })}
        >
          <span className={styles.toggleTrack} aria-hidden="true">
            <span />
          </span>
          Needs attention
        </button>
      </div>
    </div>
  );
}
