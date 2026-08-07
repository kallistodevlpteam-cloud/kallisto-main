"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ChevronDown, Check } from "lucide-react";
import {
  EnquiryQueryState,
  serializeEnquiryQuery,
} from "../utils/enquiry-query-state";
import {
  STATUS_LABELS,
  SOURCE_LABELS,
  PROJECT_TYPE_LABELS,
  STAGE_LABELS,
  EnquiryStatus,
  EnquirySource,
  ProjectType,
  EnquiryStage,
} from "../types/enquiry.types";
import styles from "./enquiries-workspace.module.css";

interface FilterToolbarProps {
  queryState: EnquiryQueryState;
  statusFilterRef?: React.RefObject<HTMLButtonElement | null>;
}

const SORT_LABELS = {
  received_desc: "Newest received",
  received_asc: "Oldest received",
};

export function EnquiryFilterToolbar({ queryState, statusFilterRef }: FilterToolbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Popover open states
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [isSortOpen, setIsSortOpen] = useState(false);

  // Refs for click-outside and focus restoration
  const toolbarRef = useRef<HTMLDivElement>(null);
  const sortTriggerRef = useRef<HTMLButtonElement>(null);

  const fallbackStatusRef = useRef<HTMLButtonElement | null>(null);
  const statusTriggerRef = statusFilterRef || fallbackStatusRef;

  const dropdownTriggerRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  // Active filter count (excluding q and sort)
  const activeFilterCount =
    (queryState.status ? 1 : 0) +
    (queryState.source ? 1 : 0) +
    (queryState.type ? 1 : 0) +
    (queryState.stage ? 1 : 0);

  // Click outside & Escape key listeners for accessibility
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      // Filter dropdowns click outside
      if (openDropdown && toolbarRef.current && !toolbarRef.current.contains(target)) {
        closeDropdownAndRestoreFocus();
      }

      // Sort dropdown click outside
      if (
        isSortOpen &&
        sortTriggerRef.current &&
        !sortTriggerRef.current.contains(target)
      ) {
        setIsSortOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (openDropdown) {
          closeDropdownAndRestoreFocus();
        }
        if (isSortOpen) {
          setIsSortOpen(false);
          sortTriggerRef.current?.focus();
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [openDropdown, isSortOpen]);

  const closeDropdownAndRestoreFocus = () => {
    const current = openDropdown;
    setOpenDropdown(null);
    if (current === "status") {
      statusTriggerRef.current?.focus();
    } else if (current && dropdownTriggerRefs.current[current]) {
      dropdownTriggerRefs.current[current]?.focus();
    }
  };

  // Centralized query update push
  const handleFilterUpdate = (updates: Partial<EnquiryQueryState>) => {
    const nextParams = serializeEnquiryQuery({ ...updates, page: 1 }, searchParams);
    router.push(`${pathname}?${nextParams.toString()}`);
  };

  const handleClearAll = () => {
    const nextParams = serializeEnquiryQuery(
      {
        status: null,
        source: null,
        type: null,
        stage: null,
        page: 1,
      },
      searchParams
    );
    router.push(`${pathname}?${nextParams.toString()}`);
  };

  const toggleDropdown = (name: string) => {
    if (openDropdown === name) {
      setOpenDropdown(null);
    } else {
      setOpenDropdown(name);
      setIsSortOpen(false);
    }
  };

  // Render list options helper
  const renderDropdownContent = (
    type: "status" | "source" | "type" | "stage",
    labels: Record<string, string>,
    currentValue: string | null
  ) => {
    return (
      <div className={styles.dropdownContent} role="menu">
        <button
          type="button"
          role="menuitem"
          className={`${styles.dropdownItem} ${!currentValue ? styles.dropdownItemActive : ""}`}
          onClick={() => {
            handleFilterUpdate({ [type]: null });
            setOpenDropdown(null);
          }}
        >
          <span>All</span>
          {!currentValue && <Check size={14} />}
        </button>
        {Object.entries(labels).map(([key, label]) => {
          const isSelected = currentValue === key;
          return (
            <button
              key={key}
              type="button"
              role="menuitem"
              className={`${styles.dropdownItem} ${isSelected ? styles.dropdownItemActive : ""}`}
              onClick={() => {
                handleFilterUpdate({ [type]: key as EnquiryStatus | EnquirySource | ProjectType | EnquiryStage });
                setOpenDropdown(null);
              }}
            >
              <span>{label}</span>
              {isSelected && <Check size={14} />}
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div className={styles.filtersBar} ref={toolbarRef}>
      {/* Left region: Filter controls */}
      <div className={styles.filterControls}>
        {/* Status Pill */}
        <div className={styles.dropdownContainer}>
          <button
            type="button"
            ref={statusTriggerRef}
            className={`${styles.pillBtn} ${queryState.status ? styles.pillBtnActive : ""}`}
            aria-haspopup="menu"
            aria-expanded={openDropdown === "status"}
            onClick={() => toggleDropdown("status")}
          >
            <span>
              {queryState.status ? STATUS_LABELS[queryState.status] : "Status"}
            </span>
            <ChevronDown size={12} />
          </button>
          {openDropdown === "status" &&
            renderDropdownContent("status", STATUS_LABELS, queryState.status)}
        </div>

        {/* Source Pill */}
        <div className={styles.dropdownContainer}>
          <button
            type="button"
            ref={(el) => {
              dropdownTriggerRefs.current.source = el;
            }}
            className={`${styles.pillBtn} ${queryState.source ? styles.pillBtnActive : ""}`}
            aria-haspopup="menu"
            aria-expanded={openDropdown === "source"}
            onClick={() => toggleDropdown("source")}
          >
            <span>
              {queryState.source ? SOURCE_LABELS[queryState.source] : "Source"}
            </span>
            <ChevronDown size={12} />
          </button>
          {openDropdown === "source" &&
            renderDropdownContent("source", SOURCE_LABELS, queryState.source)}
        </div>

        {/* Project Type Pill */}
        <div className={styles.dropdownContainer}>
          <button
            type="button"
            ref={(el) => {
              dropdownTriggerRefs.current.type = el;
            }}
            className={`${styles.pillBtn} ${queryState.type ? styles.pillBtnActive : ""}`}
            aria-haspopup="menu"
            aria-expanded={openDropdown === "type"}
            onClick={() => toggleDropdown("type")}
          >
            <span>
              {queryState.type ? PROJECT_TYPE_LABELS[queryState.type] : "Project Type"}
            </span>
            <ChevronDown size={12} />
          </button>
          {openDropdown === "type" &&
            renderDropdownContent("type", PROJECT_TYPE_LABELS, queryState.type)}
        </div>

        {/* Stage Pill */}
        <div className={styles.dropdownContainer}>
          <button
            type="button"
            ref={(el) => {
              dropdownTriggerRefs.current.stage = el;
            }}
            className={`${styles.pillBtn} ${queryState.stage ? styles.pillBtnActive : ""}`}
            aria-haspopup="menu"
            aria-expanded={openDropdown === "stage"}
            onClick={() => toggleDropdown("stage")}
          >
            <span>
              {queryState.stage ? STAGE_LABELS[queryState.stage] : "Stage"}
            </span>
            <ChevronDown size={12} />
          </button>
          {openDropdown === "stage" &&
            renderDropdownContent("stage", STAGE_LABELS, queryState.stage)}
        </div>

        {/* Clear All active filters option */}
        {activeFilterCount > 0 && (
          <button type="button" className={styles.pillClearAllBtn} onClick={handleClearAll}>
            Clear all
          </button>
        )}
      </div>

      {/* Right region: Sort selector dropdown */}
      <div className={styles.dropdownContainer}>
        <button
          type="button"
          ref={sortTriggerRef}
          className={styles.sortSelectBtn}
          onClick={() => setIsSortOpen(!isSortOpen)}
          aria-haspopup="menu"
          aria-expanded={isSortOpen}
        >
          <span>{SORT_LABELS[queryState.sort] || "Newest received"}</span>
          <ChevronDown size={14} className={styles.sortChevronIcon} />
        </button>
        {isSortOpen && (
          <div className={styles.dropdownContentRight} role="menu">
            {Object.entries(SORT_LABELS).map(([key, label]) => {
              const isSelected = queryState.sort === key;
              return (
                <button
                  key={key}
                  type="button"
                  role="menuitem"
                  className={`${styles.dropdownItem} ${isSelected ? styles.dropdownItemActive : ""}`}
                  onClick={() => {
                    handleFilterUpdate({ sort: key as any });
                    setIsSortOpen(false);
                  }}
                >
                  <span>{label}</span>
                  {isSelected && <Check size={14} />}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
