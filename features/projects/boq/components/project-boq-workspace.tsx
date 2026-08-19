"use client";

import {
  AlertTriangle,
  CheckCircle2,
  FileSpreadsheet,
} from "lucide-react";
import {
  ImportDuotoneIcon,
  ExportDuotoneIcon,
  SortDuotoneIcon,
  PaymentsDuotoneIcon,
  LayersDuotoneIcon,
  ListViewDuotoneIcon,
  BoqItemsDuotoneIcon,
  RateAnalysisDuotoneIcon,
  VariationsDuotoneIcon,
  VersionsDuotoneIcon,
} from "@/components/layout/sidebar-icons";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Project } from "@/types/domain/project";
import { ProjectBoqSnapshot } from "@/types/domain/project-boq";
import {
  countBoqValidationIssues,
  formatIndianCurrency,
  getApprovedVariationTotal,
} from "../services/project-boq-calculations";
import {
  ProjectBoqService,
  projectBoqService,
} from "../services/project-boq.service";
import { normalizeProjectBoqSnapshot } from "../utils/normalize-project-boq";
import { exportBoqCsv } from "../utils/project-boq-export";
import {
  BoqFilterPopover,
  SortValue,
  StatusFilter,
  ToggleableColumn,
} from "./boq-filter-popover";
import { BoqImportModal } from "./boq-import-modal";
import { BoqItemsView } from "./boq-items-view";
import {
  RateAnalysisView,
  VariationsView,
  VersionsView,
} from "./boq-supporting-views";
import styles from "./project-boq-workspace.module.css";

type BoqView = "items" | "rates" | "variations" | "versions";

interface ProjectBoqWorkspaceProps {
  project: Project;
  service?: ProjectBoqService;
}

const BOQ_VIEWS: Array<{
  id: BoqView;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}> = [
  { id: "items", label: "BOQ Items", icon: BoqItemsDuotoneIcon },
  { id: "rates", label: "Rate Analysis", icon: RateAnalysisDuotoneIcon },
  { id: "variations", label: "Variations", icon: VariationsDuotoneIcon },
  { id: "versions", label: "Versions", icon: VersionsDuotoneIcon },
];

function isBoqView(value: string | null): value is BoqView {
  return BOQ_VIEWS.some((view) => view.id === value);
}

export function ProjectBoqWorkspace({
  project,
  service = projectBoqService,
}: ProjectBoqWorkspaceProps) {
  const [rawSnapshot, setRawSnapshot] = useState<ProjectBoqSnapshot | null>(null);
  const searchParams = useSearchParams();
  const initialQueryView = searchParams.get("boqView");
  const [view, setView] = useState<BoqView>(
    isBoqView(initialQueryView) ? initialQueryView : "items"
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVersionId, setSelectedVersionId] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [stagedFile, setStagedFile] = useState<File | null>(null);
  const importInputRef = useRef<HTMLInputElement>(null);

  // Filter & View Controls State
  const searchQuery = searchParams.get("q") ?? "";
  const [sectionFilter, setSectionFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sort, setSort] = useState<SortValue>("code");
  const [visibleColumns, setVisibleColumns] = useState<Set<ToggleableColumn>>(
    () => new Set(["unit", "quantity", "rate"])
  );

  // 1. Single Normalization Boundary at ingestion
  const snapshot = useMemo(() => {
    if (!rawSnapshot) return null;
    return normalizeProjectBoqSnapshot(rawSnapshot);
  }, [rawSnapshot]);

  // Expansion Keys: section:${id} and subsection:${id}
  const allHierarchyKeys = useMemo(() => {
    if (!snapshot) return new Set<string>();
    const keys = new Set<string>();
    for (const sec of snapshot.sections) {
      keys.add(`section:${sec.id}`);
      for (const sub of sec.subsections) {
        keys.add(`subsection:${sub.id}`);
      }
    }
    return keys;
  }, [snapshot]);

  const selectedSection = useMemo(() => {
    if (!snapshot || sectionFilter === "all") return null;
    return (
      snapshot.sections.find(
        (sec) => sec.id === sectionFilter || sec.code === sectionFilter
      ) ?? null
    );
  }, [snapshot, sectionFilter]);

  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(() => new Set());
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(() => new Set());

  const [filterPopoverOpen, setFilterPopoverOpen] = useState(false);
  const filterTriggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadBoq() {
      setLoading(true);
      setError(null);

      try {
        const nextSnapshot = await service.getProjectBoq(
          project.id,
          project.name,
          project.projectCode
        );

        if (!cancelled) {
          const normalized = normalizeProjectBoqSnapshot(nextSnapshot);
          setRawSnapshot(normalized);
          setSelectedVersionId(normalized.currentVersionId);

          const initialKeys = new Set<string>();
          for (const sec of normalized.sections) {
            initialKeys.add(`section:${sec.id}`);
            for (const sub of sec.subsections) {
              initialKeys.add(`subsection:${sub.id}`);
            }
          }
          setExpandedKeys(initialKeys);
          setSelectedItemIds(new Set());
        }
      } catch {
        if (!cancelled) {
          setError("The BOQ workspace could not be loaded. Try again.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadBoq();
    return () => {
      cancelled = true;
    };
  }, [project.id, project.name, project.projectCode, service]);

  function handleVersionChange(nextVersionId: string) {
    setSelectedVersionId(nextVersionId);
    setSelectedItemIds(new Set());
  }

  function handleViewChange(nextView: BoqView) {
    setView(nextView);

    const url = new URL(window.location.href);
    url.searchParams.set("tab", "boq");
    url.searchParams.set("boqView", nextView);
    window.history.replaceState({}, "", `${url.pathname}${url.search}`);
  }

  function handleClearFilters() {
    setSectionFilter("all");
    setStatusFilter("all");
    setSort("code");
    setVisibleColumns(new Set(["unit", "quantity", "rate"]));
  }

  const allExpanded = allHierarchyKeys.size > 0 && expandedKeys.size === allHierarchyKeys.size;

  function handleToggleAllExpanded() {
    if (!snapshot) return;
    if (allExpanded) {
      setExpandedKeys(new Set());
    } else {
      setExpandedKeys(new Set(allHierarchyKeys));
    }
  }

  function handleToggleItemSelection(itemId: string) {
    setSelectedItemIds((current) => {
      const next = new Set(current);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  }

  function handleToggleSelectAllVisible(visibleItemIds: string[]) {
    setSelectedItemIds((current) => {
      const allSelected = visibleItemIds.every((id) => current.has(id));
      const next = new Set(current);
      if (allSelected) {
        for (const id of visibleItemIds) {
          next.delete(id);
        }
      } else {
        for (const id of visibleItemIds) {
          next.add(id);
        }
      }
      return next;
    });
  }

  if (loading) {
    return (
      <section
        className={styles.workspace}
        aria-label="Loading Bill of Quantities"
      >
        <div className={styles.loadingHeader}>
          <div className={styles.skeletonTitle} />
          <div className={styles.skeletonActions} />
        </div>
        <div className={styles.skeletonSummary} />
        <div className={styles.skeletonTable} />
      </section>
    );
  }

  if (error || !snapshot) {
    return (
      <section className={styles.workspace} aria-label="BOQ load error">
        <div className={styles.statePanel}>
          <FileSpreadsheet size={24} aria-hidden="true" />
          <h2>BOQ workspace unavailable</h2>
          <p>{error ?? "The project BOQ record was not found."}</p>
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </section>
    );
  }

  const validationIssues = countBoqValidationIssues(
    snapshot.sections,
    snapshot.hiddenValidationIssueCount
  );
  const revisedTotal =
    snapshot.baseTotal + getApprovedVariationTotal(snapshot.variations);
  const selectedVersion =
    snapshot.versions.find((version) => version.id === selectedVersionId) ??
    snapshot.versions[0];

  const isFilterActive =
    sectionFilter !== "all" ||
    statusFilter !== "all" ||
    sort !== "code" ||
    visibleColumns.size < 4;

  const hasSelectedItems = selectedItemIds.size > 0;

  const activeTotalLabel = selectedSection
    ? `${selectedSection.code} Total`
    : "Revised Total";

  const activeTotalValue = selectedSection
    ? selectedSection.subtotal
    : revisedTotal;

  return (
    <>
      {/* BoqImportModal is rendered outside the workspace section grid so it
          does not participate as an auto-placed grid child. Its backdrop and
          drawer are both position:fixed and belong to the portal layer. */}
      {stagedFile && (
        <BoqImportModal
          file={stagedFile}
          projectId={project.id}
          versionId={selectedVersionId}
          onClose={() => setStagedFile(null)}
        />
      )}

      <section className={`${styles.workspace} projectBoqWorkspace`} aria-labelledby="boq-workspace-title">
        {/* Row 1 — control bar: view tabs + search + filter */}
        <div className={styles.controlBar}>
          <nav className={styles.viewTabs} aria-label="BOQ workspace views">
            {BOQ_VIEWS.map((item) => {
              const Icon = item.icon;
              const isActive = view === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  className={isActive ? styles.tabFlatActive : styles.tabFlat}
                  aria-current={isActive ? "page" : undefined}
                  aria-label={item.label}
                  onClick={() => handleViewChange(item.id)}
                >
                  <Icon size={16} aria-hidden="true" />
                  <span>{item.label}</span>
                  {item.id === "variations" && (
                    <span className={styles.tabBadgeMuted}>
                      {snapshot.variations.length}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          <div className={styles.controlBarRight}>
            <input
              ref={importInputRef}
              className={styles.hiddenInput}
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) {
                  setStagedFile(file);
                }
                event.target.value = "";
              }}
            />
            <button
              type="button"
              className={styles.roundIconButton}
              aria-label="Import BOQ"
              title="Import BOQ"
              onClick={() => importInputRef.current?.click()}
            >
              <ImportDuotoneIcon size={18} aria-hidden="true" />
            </button>
            <button
              type="button"
              className={styles.roundIconButton}
              aria-label={hasSelectedItems ? "Export selected BOQ items" : "Export BOQ"}
              title={hasSelectedItems ? "Export selected BOQ items" : "Export BOQ"}
              onClick={() => {
                exportBoqCsv(snapshot, selectedItemIds);
                setNotice(
                  hasSelectedItems
                    ? `Exported ${selectedItemIds.size} selected BOQ items.`
                    : "Full BOQ snapshot exported as CSV."
                );
              }}
            >
              <ExportDuotoneIcon size={18} aria-hidden="true" />
            </button>
            <button
              ref={filterTriggerRef}
              type="button"
              className={`${styles.filterTrigger} ${isFilterActive ? styles.filterTriggerActive : ""}`}
              aria-label="Filter and settings"
              aria-expanded={filterPopoverOpen}
              aria-controls="boq-filter-popover"
              aria-haspopup="dialog"
              onClick={() => setFilterPopoverOpen((prev) => !prev)}
            >
              <SortDuotoneIcon size={18} aria-hidden="true" />
              {isFilterActive && (
                <span className={styles.activeFilterDot} aria-hidden="true" />
              )}
            </button>

            <BoqFilterPopover
              isOpen={filterPopoverOpen}
              onClose={() => setFilterPopoverOpen(false)}
              sections={snapshot.sections}
              sectionFilter={sectionFilter}
              onSectionFilterChange={setSectionFilter}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              sort={sort}
              onSortChange={setSort}
              visibleColumns={visibleColumns}
              onToggleColumn={(col) => {
                setVisibleColumns((current) => {
                  const next = new Set(current);
                  if (next.has(col)) {
                    next.delete(col);
                  } else {
                    next.add(col);
                  }
                  return next;
                });
              }}
              allExpanded={allExpanded}
              onToggleAllExpanded={handleToggleAllExpanded}
              onClearFilters={handleClearFilters}
              triggerRef={filterTriggerRef}
            />
          </div>
        </div>

        {/* Row 2 — view area: owns table viewport scroll (items) or page scroll
            (rates / variations / versions via overflow-y: auto on viewArea). */}
        <div className={styles.viewArea}>
          {notice && (
            <div className={styles.notice} role="status">
              <CheckCircle2 size={15} aria-hidden="true" />
              <span>{notice}</span>
              <button
                type="button"
                aria-label="Dismiss notification"
                onClick={() => setNotice(null)}
              >
                Dismiss
              </button>
            </div>
          )}

          {view === "items" && (
            <div className={styles.itemsWorkspace}>
              {/* Summary metrics strip inside BOQ Items view */}
              <dl className={styles.summaryStrip} aria-label="BOQ summary">
                <div className={styles.summaryCard}>
                  <div className={styles.summaryIconBox} style={{ backgroundColor: "#EEF2FF", color: "#4F46E5" }}>
                    <PaymentsDuotoneIcon size={15} aria-hidden="true" />
                  </div>
                  <div className={styles.summaryCardContent}>
                    <dt>Base BOQ</dt>
                    <dd>{formatIndianCurrency(snapshot.baseTotal)}</dd>
                  </div>
                </div>
                <div className={styles.summaryCard}>
                  <div className={styles.summaryIconBox} style={{ backgroundColor: "#F5F3FF", color: "#7C3AED" }}>
                    <LayersDuotoneIcon size={15} aria-hidden="true" />
                  </div>
                  <div className={styles.summaryCardContent}>
                    <dt>Phases</dt>
                    <dd>{snapshot.sectionCount}</dd>
                  </div>
                </div>
                <div className={styles.summaryCard}>
                  <div className={styles.summaryIconBox} style={{ backgroundColor: "#EFF6FF", color: "#2563EB" }}>
                    <ListViewDuotoneIcon size={15} aria-hidden="true" />
                  </div>
                  <div className={styles.summaryCardContent}>
                    <dt>Work Items</dt>
                    <dd>{snapshot.workItemCount}</dd>
                  </div>
                </div>
                <div className={`${styles.summaryCard} ${validationIssues > 0 ? styles.summaryCardWarning : ""}`}>
                  <div
                    className={styles.summaryIconBox}
                    style={
                      validationIssues > 0
                        ? { backgroundColor: "#FEF2F2", color: "#DC2626" }
                        : { backgroundColor: "#F0FDF4", color: "#16A34A" }
                    }
                  >
                    {validationIssues > 0 ? (
                      <AlertTriangle size={15} aria-hidden="true" />
                    ) : (
                      <CheckCircle2 size={15} aria-hidden="true" />
                    )}
                  </div>
                  <div className={styles.summaryCardContent}>
                    <dt>Validation Issues</dt>
                    <dd style={validationIssues > 0 ? { color: "#dc2626" } : undefined}>{validationIssues}</dd>
                  </div>
                </div>
                <div className={styles.summaryCard}>
                  <div className={styles.summaryIconBox} style={{ backgroundColor: "#ECFDF5", color: "#059669" }}>
                    <PaymentsDuotoneIcon size={15} aria-hidden="true" />
                  </div>
                  <div className={styles.summaryCardContent}>
                    <dt>{activeTotalLabel}</dt>
                    <dd>{formatIndianCurrency(activeTotalValue)}</dd>
                  </div>
                </div>
              </dl>

              <BoqItemsView
                snapshot={snapshot}
                selectedVersionId={selectedVersion.id}
                searchQuery={searchQuery}
                sectionFilter={sectionFilter}
                statusFilter={statusFilter}
                sort={sort}
                visibleColumns={visibleColumns}
                expandedKeys={expandedKeys}
                onToggleKey={(key) => {
                  setExpandedKeys((current) => {
                    const next = new Set(current);
                    if (next.has(key)) {
                      next.delete(key);
                    } else {
                      next.add(key);
                    }
                    return next;
                  });
                }}
                selectedItemIds={selectedItemIds}
                onToggleItemSelection={handleToggleItemSelection}
                onToggleSelectAllVisible={handleToggleSelectAllVisible}
              />
            </div>
          )}
          {view === "rates" && <RateAnalysisView snapshot={snapshot} />}
          {view === "variations" && <VariationsView snapshot={snapshot} />}
          {view === "versions" && (
            <VersionsView
              snapshot={snapshot}
              selectedVersionId={selectedVersion.id}
              onSelectVersion={(versionId) => {
                handleVersionChange(versionId);
                handleViewChange("items");
              }}
            />
          )}
        </div>
      </section>
    </>
  );
}
