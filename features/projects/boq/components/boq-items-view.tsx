"use client";

import {
  ChevronDown,
  ChevronRight,
  Search,
} from "lucide-react";
import React, { useMemo, useState } from "react";
import { ProjectBoqSnapshot } from "@/types/domain/project-boq";
import {
  formatBoqNumber,
  formatIndianCurrency,
} from "../services/project-boq-calculations";
import { filterAndSortBoqSections } from "../utils/project-boq-filtering";
import { findBoqItemContext } from "../utils/project-boq-hierarchy";
import { BoqItemInspector } from "./boq-item-inspector";
import { toDisplaySections } from "./boq-table-presentation";
import styles from "./project-boq-workspace.module.css";

export type ToggleableColumn = "unit" | "quantity" | "rate";
export type StatusFilter = "all" | "draft" | "reviewed" | "approved" | "issues";
export type SortValue = "code" | "description" | "amount-desc" | "amount-asc";

interface BoqItemsViewProps {
  snapshot: ProjectBoqSnapshot;
  selectedVersionId: string;
  searchQuery?: string;
  sectionFilter?: string;
  statusFilter?: StatusFilter;
  sort?: SortValue;
  visibleColumns?: Set<ToggleableColumn>;
  expandedKeys?: Set<string>;
  onToggleKey?: (key: string) => void;
  selectedItemIds?: Set<string>;
  onToggleItemSelection?: (itemId: string) => void;
  onToggleSelectAllVisible?: (visibleItemIds: string[]) => void;
}

function getVisibleTableColumnCount(
  visibleColumns: Set<ToggleableColumn>
): number {
  let count = 4;
  // Always visible: Selection, Hierarchy, Description, Amount

  if (visibleColumns.has("unit")) count += 1;
  if (visibleColumns.has("quantity")) count += 1;
  if (visibleColumns.has("rate")) count += 1;

  return count;
}



export function BoqItemsView({
  snapshot,
  selectedVersionId,
  searchQuery = "",
  sectionFilter = "all",
  statusFilter = "all",
  sort = "code",
  visibleColumns = new Set(["unit", "quantity", "rate"]),
  expandedKeys: propExpandedKeys,
  onToggleKey: propOnToggleKey,
  selectedItemIds = new Set(),
}: BoqItemsViewProps) {
  // Default internal expansion: expand all sections and subsections initially
  const defaultKeys = useMemo(() => {
    const keys = new Set<string>();
    for (const sec of snapshot.sections) {
      keys.add(`section:${sec.id}`);
      for (const sub of sec.subsections) {
        keys.add(`subsection:${sub.id}`);
      }
    }
    return keys;
  }, [snapshot.sections]);

  const [internalExpandedKeys, setInternalExpandedKeys] = useState<Set<string>>(defaultKeys);
  const expandedKeys = propExpandedKeys ?? internalExpandedKeys;

  function toggleKey(key: string) {
    if (propOnToggleKey) {
      propOnToggleKey(key);
    } else {
      setInternalExpandedKeys((current) => {
        const next = new Set(current);
        if (next.has(key)) {
          next.delete(key);
        } else {
          next.add(key);
        }
        return next;
      });
    }
  }

  const [inspectedItemId, setInspectedItemId] = useState<string | null>(null);
  const [expandedItemIds, setExpandedItemIds] = useState<Set<string>>(new Set());

  const toggleExpandedItem = (itemId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedItemIds((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  };

  // 1. Pure tree-preserving filtering & localized item sorting
  const filteredSections = useMemo(() => {
    let sections = snapshot.sections;
    if (sectionFilter !== "all") {
      sections = sections.filter((sec) => sec.id === sectionFilter);
    }
    return filterAndSortBoqSections(sections, searchQuery, statusFilter, sort);
  }, [snapshot.sections, sectionFilter, searchQuery, statusFilter, sort]);

  const displaySections = useMemo(
    () => toDisplaySections(filteredSections),
    [filteredSections]
  );

  // All visible work-item IDs currently rendered
  const visibleWorkItemIds = useMemo(() => {
    const ids: string[] = [];
    for (const sec of displaySections) {
      for (const item of sec.directItems) {
        ids.push(item.id);
      }
      for (const sub of sec.subsections) {
        for (const item of sub.items) {
          ids.push(item.id);
        }
      }
    }
    return ids;
  }, [displaySections]);

  // Counts for table footer
  const totalVisibleSubsections = useMemo(() => {
    return displaySections.reduce((acc, sec) => acc + sec.subsections.length, 0);
  }, [displaySections]);

  // Inspector item context lookup using findBoqItemContext
  const inspectedContext = useMemo(() => {
    if (!inspectedItemId) return null;
    return findBoqItemContext(snapshot, inspectedItemId);
  }, [inspectedItemId, snapshot]);

  // Dynamic Column Count Calculation Helper
  const visibleColumnCount = useMemo(() => {
    return getVisibleTableColumnCount(visibleColumns);
  }, [visibleColumns]);

  // Compute dynamic trailing width for section & subsection rows based on visible optional columns
  const trailingWidthStyle = useMemo(() => {
    let width = 120; // Amount column always 120px
    if (visibleColumns.has("unit")) width += 76;
    if (visibleColumns.has("quantity")) width += 92;
    if (visibleColumns.has("rate")) width += 100;
    return { "--boq-trailing-width": `${width}px` } as React.CSSProperties;
  }, [visibleColumns]);

  function renderReadonlyCell(value: number | null | undefined) {
    return <span className={styles.readonlyValue}>{formatBoqNumber(value ?? 0)}</span>;
  }

  const versionLabel =
    snapshot.versions.find((version) => version.id === selectedVersionId)
      ?.label ?? "Current version";

  return (
    <div className={styles.itemsWorkspace}>
      <div className={styles.itemsContentGrid}>
        <div className={styles.tableSurface}>
          <div className={styles.tableScroller}>
            <table className={styles.boqTable}>
              <colgroup>
                <col className={styles.selectionColumn} />
                <col className={styles.hierarchyColumn} />
                <col className={styles.descriptionColumn} />

                {visibleColumns.has("unit") ? (
                  <col className={styles.unitColumn} />
                ) : null}

                {visibleColumns.has("quantity") ? (
                  <col className={styles.quantityColumn} />
                ) : null}

                {visibleColumns.has("rate") ? (
                  <col className={styles.rateColumn} />
                ) : null}

                <col className={styles.amountColumn} />
              </colgroup>
              <thead>
                <tr>
                  <th className={styles.selectionColumn} />
                  <th className={styles.hierarchyColumn}>
                    <span className="sr-only">Hierarchy</span>
                  </th>
                  <th className={styles.descriptionColumn}>Description</th>
                  {visibleColumns.has("unit") && (
                    <th className={styles.unitColumn}>Unit</th>
                  )}
                  {visibleColumns.has("quantity") && (
                    <th className={styles.quantityColumn}>Quantity</th>
                  )}
                  {visibleColumns.has("rate") && (
                    <th className={styles.rateColumn}>Rate</th>
                  )}
                  <th className={styles.amountColumn}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {displaySections.map((section) => {
                  const sectionKey = `section:${section.id}`;
                  const sectionExpanded = expandedKeys.has(sectionKey);

                  return (
                    <React.Fragment key={section.id}>
                      {/* Major Section Row */}
                      <tr className={styles.sectionRow}>
                        <td colSpan={visibleColumnCount}>
                          <div
                            className={styles.sectionHierarchyRow}
                            style={trailingWidthStyle}
                          >
                            <button
                              type="button"
                              className={`${styles.hierarchyToggle} ${sectionExpanded ? styles.hierarchyToggleExpanded : ""}`}
                              aria-expanded={sectionExpanded}
                              onClick={() => toggleKey(sectionKey)}
                              aria-label={`${sectionExpanded ? "Collapse" : "Expand"} ${section.code}`}
                            >
                              <ChevronRight size={13} aria-hidden="true" />
                            </button>

                            <span className={styles.sectionBadge}>
                              {section.code}
                            </span>

                            <div className={styles.sectionTitleGroup}>
                              <strong className={styles.sectionTitle}>
                                {section.title}
                              </strong>
                            </div>

                            <div className={styles.sectionTrailing}>
                              <span className={styles.sectionSubtotalLabel}>Section subtotal </span>
                              <strong className={styles.sectionSubtotalValue}>
                                {formatIndianCurrency(section.subtotal)}
                              </strong>
                            </div>
                          </div>
                        </td>
                      </tr>

                      {sectionExpanded && (
                        <>
                          {/* 1. Direct Items First (Deterministic Ordering Rule) */}
                          {section.directItems.map((item) => (
                            <React.Fragment key={item.id}>
                              <tr
                                data-item-code={item.code}
                                aria-label={`${item.code}: ${item.description}`}
                                className={
                                  item.amount === null ||
                                  item.status === "Needs attention"
                                    ? styles.itemRowAttention
                                    : styles.itemRow
                                }
                              >
                                <td className={styles.selectionColumn} />
                                <td className={styles.hierarchyCell}>
                                  <span className={styles.rowSeqNumber}>
                                    {item.code}
                                  </span>
                                </td>
                                <td className={styles.descriptionColumn} title={item.description}>
                                  <div className={styles.itemDescriptionContainer}>
                                    <div className={styles.itemDescriptionHeader}>
                                      <span
                                        className={styles.itemDescriptionTitle}
                                        onClick={(e) => toggleExpandedItem(item.id, e)}
                                      >
                                        {item.description}
                                      </span>
                                      <button
                                        type="button"
                                        className={`${styles.rowDropdownButton} ${expandedItemIds.has(item.id) ? styles.rowDropdownExpanded : ""}`}
                                        aria-label={`Toggle details for ${item.code}`}
                                        onClick={(e) => toggleExpandedItem(item.id, e)}
                                      >
                                        <ChevronDown size={12} aria-hidden="true" />
                                      </button>
                                    </div>

                                    {expandedItemIds.has(item.id) && (
                                      <div className={styles.itemSpecDetails}>
                                        Carefully Break And Remove Existing Ceramic/Vitrified Wall Tile Dado From Bathroom Walls Using Chisel & Hammer (Manual Breaking To Avoid Damage To Substrate Plumbing Lines). Includes Removal Of Old Tile Adhesive/Mortar Bed Down To Base Plaster. <em>Area:</em> Approx. 20.65 M² Per Toilet × 3 Toilets = 62 M² Total. Debris Stacked At Site & Removed To Designated Dumping Area Same Day (Disposal As Per Local Panchayat/Municipal Norms). <em>Rate Includes:</em> Breaking, Removal, Debris Carry To
                                      </div>
                                    )}
                                  </div>
                                </td>
                                {visibleColumns.has("unit") && (
                                  <td className={styles.unitCell}>{item.unit}</td>
                                )}
                                {visibleColumns.has("quantity") && (
                                  <td className={styles.quantityCell}>
                                    {renderReadonlyCell(item.quantity)}
                                  </td>
                                )}
                                {visibleColumns.has("rate") && (
                                  <td className={styles.rateCell}>
                                    {renderReadonlyCell(item.rate)}
                                  </td>
                                )}
                                <td className={styles.amountCell}>
                                  {formatIndianCurrency(item.amount ?? 0)}
                                </td>
                              </tr>
                            </React.Fragment>
                          ))}

                          {/* 2. Subsections Second (Deterministic Ordering Rule) */}
                          {section.subsections.map((subsection) => {
                            const subKey = `subsection:${subsection.id}`;
                            const subExpanded = expandedKeys.has(subKey);

                            return (
                              <React.Fragment key={subsection.id}>
                                {/* Subsection Hierarchy Row */}
                                <tr className={styles.subsectionRow}>
                                  <td colSpan={visibleColumnCount}>
                                    <div
                                      className={styles.subsectionHierarchyRow}
                                      style={trailingWidthStyle}
                                    >
                                      <button
                                        type="button"
                                        className={`${styles.hierarchyToggle} ${subExpanded ? styles.hierarchyToggleExpanded : ""}`}
                                        aria-expanded={subExpanded}
                                        onClick={() => toggleKey(subKey)}
                                        aria-label={`${subExpanded ? "Collapse" : "Expand"} ${subsection.code}`}
                                      >
                                        <ChevronRight size={13} aria-hidden="true" />
                                      </button>

                                      <span className={styles.subsectionCode}>
                                        {subsection.code}
                                      </span>

                                      <div className={styles.subsectionTitleGroup}>
                                        <strong className={styles.subsectionTitle}>
                                          {subsection.title}
                                        </strong>
                                        <span className={styles.subsectionItemCount}>
                                          {subsection.itemCount} items
                                        </span>
                                      </div>

                                      <div className={styles.subsectionSubtotal}>
                                        <span>Section Subtotal </span>
                                        <strong>
                                          {formatIndianCurrency(subsection.subtotal)}
                                        </strong>
                                      </div>
                                    </div>
                                  </td>
                                </tr>

                                {/* Subsection Work-Items */}
                                {subExpanded &&
                                  subsection.items.map((item) => (
                                    <React.Fragment key={item.id}>
                                      <tr
                                        data-item-code={item.code}
                                        aria-label={`${item.code}: ${item.description}`}
                                        className={
                                          item.amount === null ||
                                          item.status === "Needs attention"
                                            ? styles.itemRowAttention
                                            : styles.itemRow
                                        }
                                      >
                                        <td className={styles.selectionColumn} />
                                        <td className={styles.hierarchyCell}>
                                          <span className={styles.rowSeqNumber}>
                                            {item.code}
                                          </span>
                                        </td>
                                        <td
                                          className={styles.descriptionColumn}
                                          title={item.description}
                                        >
                                          <div className={styles.itemDescriptionContainer}>
                                            <div className={styles.itemDescriptionHeader}>
                                              <span
                                                className={styles.itemDescriptionTitle}
                                                onClick={(e) => toggleExpandedItem(item.id, e)}
                                              >
                                                {item.description}
                                              </span>
                                              <button
                                                type="button"
                                                className={`${styles.rowDropdownButton} ${expandedItemIds.has(item.id) ? styles.rowDropdownExpanded : ""}`}
                                                aria-label={`Toggle details for ${item.code}`}
                                                onClick={(e) => toggleExpandedItem(item.id, e)}
                                              >
                                                <ChevronDown size={12} aria-hidden="true" />
                                              </button>
                                            </div>

                                            {expandedItemIds.has(item.id) && (
                                              <div className={styles.itemSpecDetails}>
                                                Carefully Break And Remove Existing Ceramic/Vitrified Wall Tile Dado From Bathroom Walls Using Chisel & Hammer (Manual Breaking To Avoid Damage To Substrate Plumbing Lines). Includes Removal Of Old Tile Adhesive/Mortar Bed Down To Base Plaster. <em>Area:</em> Approx. 20.65 M² Per Toilet × 3 Toilets = 62 M² Total. Debris Stacked At Site & Removed To Designated Dumping Area Same Day (Disposal As Per Local Panchayat/Municipal Norms). <em>Rate Includes:</em> Breaking, Removal, Debris Carry To
                                              </div>
                                            )}
                                          </div>
                                        </td>
                                        {visibleColumns.has("unit") && (
                                          <td className={styles.unitCell}>{item.unit}</td>
                                        )}
                                        {visibleColumns.has("quantity") && (
                                          <td className={styles.quantityCell}>
                                            {renderReadonlyCell(item.quantity)}
                                          </td>
                                        )}
                                        {visibleColumns.has("rate") && (
                                          <td className={styles.rateCell}>
                                            {renderReadonlyCell(item.rate)}
                                          </td>
                                        )}
                                        <td className={styles.amountCell}>
                                          {formatIndianCurrency(item.amount ?? 0)}
                                        </td>
                                      </tr>
                                    </React.Fragment>
                                  ))}
                              </React.Fragment>
                            );
                          })}
                        </>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>

            {filteredSections.length === 0 && (
              <div className={styles.noResults}>
                <Search size={20} aria-hidden="true" />
                <strong>No BOQ items match</strong>
                <span>Clear or adjust the current search and filters.</span>
              </div>
            )}
          </div>

          {/* Table Footer matching SVG reference */}
          <footer className={styles.tableFooter}>
            <div className={styles.tableFooterLeft}>
              Showing {visibleWorkItemIds.length} loaded items across{" "}
              {filteredSections.length} sections
              {totalVisibleSubsections > 0 ? ` and ${totalVisibleSubsections} subsections` : ""}
            </div>
            <div className={styles.tableFooterRight}>
              {selectedItemIds.size === 0
                ? "No items selected"
                : `${selectedItemIds.size} item${selectedItemIds.size === 1 ? "" : "s"} selected`}
            </div>
          </footer>
        </div>

        {inspectedContext && (
          <BoqItemInspector
            item={inspectedContext.item}
            section={inspectedContext.section}
            subsection={inspectedContext.subsection}
            versionLabel={versionLabel}
            projectId={snapshot.projectId}
            versionId={selectedVersionId}
            onClose={() => setInspectedItemId(null)}
          />
        )}
      </div>
    </div>
  );
}
