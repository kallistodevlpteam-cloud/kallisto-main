"use client";

import {
  BuildingDuotoneIcon,
  DrawingsDuotoneIcon,
  EnergyDuotoneIcon,
  ExploreDuotoneIcon,
  LayersDuotoneIcon,
  ResolveDuotoneIcon,
  SiteDuotoneIcon,
  UserDuotoneIcon,
} from "@/components/layout/sidebar-icons";
import { Check, ChevronDown, Folder, FolderOpen, Search, Sparkles, X } from "lucide-react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import styles from "./hands-overview.module.css";

export const AVAILABLE_HANDS_PROJECTS = [
  { id: "proj-001", name: "Nila Residence", code: "KL-TVM-2026" },
  { id: "proj-002", name: "Arjun Villa", code: "KL-KOC-2026" },
  { id: "proj-003", name: "Marina Office", code: "KL-CLT-2026" },
  { id: "proj-004", name: "Green Courtyard", code: "KL-TCR-2026" },
];

export const AVAILABLE_TRADES = [
  {
    id: "trade-masons",
    name: "Masons & Civil Crew",
    trade: "Masons",
    category: "Civil & Structural",
    rate: "₹950 / day",
    icon: BuildingDuotoneIcon,
    accentColor: "#16a34a",
  },
  {
    id: "trade-electricians",
    name: "MEP & Electricians",
    trade: "Electricians",
    category: "Electrical & MEP",
    rate: "₹1,100 / day",
    icon: EnergyDuotoneIcon,
    accentColor: "#0284c7",
  },
  {
    id: "trade-plumbers",
    name: "Plumbing & Sanitary",
    trade: "Plumbers",
    category: "Plumbing & Drainage",
    rate: "₹1,050 / day",
    icon: ResolveDuotoneIcon,
    accentColor: "#0891b2",
  },
  {
    id: "trade-carpenters",
    name: "Carpentry & Shuttering",
    trade: "Carpenters",
    category: "Woodwork & Formwork",
    rate: "₹1,150 / day",
    icon: LayersDuotoneIcon,
    accentColor: "#d97706",
  },
  {
    id: "trade-painters",
    name: "Painting & Finishing",
    trade: "Painters",
    category: "Finishing & Coating",
    rate: "₹900 / day",
    icon: DrawingsDuotoneIcon,
    accentColor: "#e11d48",
  },
  {
    id: "trade-supervisors",
    name: "Site Supervisors",
    trade: "Supervisors",
    category: "Management & QA",
    rate: "₹1,600 / day",
    icon: UserDuotoneIcon,
    accentColor: "#9333ea",
  },
  {
    id: "trade-surveyors",
    name: "Land Surveyors & QS",
    trade: "Surveyors",
    category: "Survey & Engineering",
    rate: "₹1,800 / day",
    icon: ExploreDuotoneIcon,
    accentColor: "#ea580c",
  },
  {
    id: "trade-helpers",
    name: "Site Helpers & Labourers",
    trade: "Helpers",
    category: "General Site Support",
    rate: "₹750 / day",
    icon: SiteDuotoneIcon,
    accentColor: "#64748b",
  },
];

interface HandsSearchBarProps {
  onSearch?: (query: string, projectId?: string | null) => void;
  initialQuery?: string;
  projectId?: string;
}

export function HandsSearchBar({
  onSearch,
  initialQuery = "",
  projectId: defaultProjectId,
}: HandsSearchBarProps) {
  const [query, setQuery] = useState(initialQuery);
  const [isOpen, setIsOpen] = useState(false);
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    defaultProjectId || null
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const projectMenuRef = useRef<HTMLDivElement>(null);

  const selectedProject = useMemo(() => {
    return AVAILABLE_HANDS_PROJECTS.find((p) => p.id === selectedProjectId);
  }, [selectedProjectId]);

  useEffect(() => {
    function handleDocClick(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
        setIsProjectDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleDocClick);
    return () => document.removeEventListener("mousedown", handleDocClick);
  }, []);

  const cleanQ = query.trim().toLowerCase();

  const matchingTrades = useMemo(() => {
    if (!cleanQ) return [];
    return AVAILABLE_TRADES.filter(
      (t) =>
        t.name.toLowerCase().includes(cleanQ) ||
        t.trade.toLowerCase().includes(cleanQ) ||
        t.category.toLowerCase().includes(cleanQ)
    );
  }, [cleanQ]);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsOpen(false);
    onSearch?.(query.trim(), selectedProjectId);
  };

  const handleSelectTrade = (tradeName: string) => {
    setQuery(tradeName);
    setIsOpen(false);
    onSearch?.(tradeName, selectedProjectId);
  };

  return (
    <div ref={containerRef} className={styles.composerCardContainer}>
      {/* 1. Backdrop Tab with Choose Project */}
      <div className={styles.composerProjectBackdrop}>
        <button
          type="button"
          className={`${styles.composerProjectBtn} ${
            selectedProject ? styles.composerProjectBtnSelected : ""
          }`}
          onClick={() => setIsProjectDropdownOpen((prev) => !prev)}
          title="Choose active project for workforce deployment"
          aria-label="Choose project"
          aria-expanded={isProjectDropdownOpen}
        >
          <Folder size={14} className={styles.composerProjectIcon} aria-hidden="true" />
          <span className={styles.composerProjectText}>
            {selectedProject ? selectedProject.name : "Choose project"}
          </span>
          <ChevronDown size={12} className={styles.composerProjectChevron} aria-hidden="true" />
        </button>

        {isProjectDropdownOpen && (
          <div ref={projectMenuRef} className={styles.searchProjectDropdown}>
            <div className={styles.searchProjectDropdownHeader}>
              <span>Active Sites & Projects</span>
              {selectedProjectId && (
                <button
                  type="button"
                  className={styles.searchProjectClearBtn}
                  onClick={() => {
                    setSelectedProjectId(null);
                    setIsProjectDropdownOpen(false);
                  }}
                >
                  Clear selection
                </button>
              )}
            </div>
            <div className={styles.searchProjectDropdownList}>
              {AVAILABLE_HANDS_PROJECTS.map((proj) => {
                const isSelected = selectedProjectId === proj.id;
                return (
                  <button
                    key={proj.id}
                    type="button"
                    className={`${styles.searchProjectDropdownItem} ${
                      isSelected ? styles.searchProjectDropdownItemActive : ""
                    }`}
                    onClick={() => {
                      setSelectedProjectId(proj.id);
                      setIsProjectDropdownOpen(false);
                    }}
                  >
                    <div className={styles.searchProjectDropdownItemLeft}>
                      <span className={styles.searchProjectItemIcon}>
                        <FolderOpen size={13} aria-hidden="true" />
                      </span>
                      <div className={styles.searchProjectItemInfo}>
                        <strong className={styles.searchProjectItemName}>
                          {proj.name}
                        </strong>
                        <span className={styles.searchProjectItemCode}>
                          {proj.code}
                        </span>
                      </div>
                    </div>
                    {isSelected && (
                      <Check
                        size={13}
                        className={styles.searchProjectCheck}
                        aria-hidden="true"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 2. Main White Search Box Card */}
      <div
        className={`${styles.searchPillCard} ${
          isOpen ? styles.searchPillCardOpen : ""
        }`}
      >
        <form
          className={styles.searchPillForm}
          onSubmit={handleSearchSubmit}
          role="search"
        >
          <input
            ref={inputRef}
            className={styles.searchPillInput}
            type="text"
            value={query}
            onFocus={() => setIsOpen(true)}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            placeholder="Search trades, workforce, site supervisors or projects..."
            aria-label="Search trades, workforce, site supervisors or projects"
          />

          <div className={styles.searchPillControls}>
            {query.trim() ? (
              <button
                type="button"
                className={styles.paletteClearBtn}
                onClick={() => {
                  setQuery("");
                  inputRef.current?.focus();
                }}
                aria-label="Clear search input"
              >
                <X size={13} aria-hidden="true" />
              </button>
            ) : null}

            <button
              type="submit"
              className={styles.searchPillSendBtn}
              aria-label="Execute search"
            >
              <Search size={16} aria-hidden="true" />
            </button>
          </div>
        </form>

        {/* Dropdown with live suggestions */}
        {isOpen && (
          <div className={styles.paletteDropdownOverlay}>
            <div className={styles.paletteBody}>
              {cleanQ.length > 0 ? (
                <>
                  <button
                    type="button"
                    className={styles.paletteDirectHintRow}
                    onClick={() => handleSearchSubmit()}
                  >
                    <Search
                      size={14}
                      className={styles.paletteDirectHintIcon}
                      aria-hidden="true"
                    />
                    <span className={styles.paletteDirectHintText}>
                      Search workforce deployments for{" "}
                      <strong>&ldquo;{query.trim()}&rdquo;</strong>
                    </span>
                  </button>

                  {matchingTrades.length > 0 && (
                    <div className={styles.paletteSection}>
                      <div className={styles.paletteSectionHeader}>
                        <span className={styles.paletteSectionTitle}>
                          Matching Worker Trades
                        </span>
                      </div>
                      <div className={styles.paletteSuggestionList}>
                        {matchingTrades.map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            className={styles.paletteSuggestionItem}
                            onClick={() => handleSelectTrade(item.trade)}
                          >
                            <span className={styles.paletteSuggestionIconWrap}>
                              <item.icon size={13} aria-hidden="true" />
                            </span>
                            <span className={styles.paletteSuggestionLabel}>
                              {item.name}
                            </span>
                            <span className={styles.paletteSuggestionHint}>
                              {item.rate}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {matchingTrades.length === 0 && (
                    <div className={styles.paletteEmptyHints}>
                      <Sparkles
                        size={16}
                        className={styles.paletteEmptyIcon}
                        aria-hidden="true"
                      />
                      <span>
                        Press <strong>Enter</strong> to search all active site
                        deployments, supervisors, and labor attendance.
                      </span>
                    </div>
                  )}
                </>
              ) : (
                <div className={styles.paletteSection}>
                  <div className={styles.paletteSectionHeader}>
                    <span className={styles.paletteSectionTitle}>
                      Popular Trades & Crews
                    </span>
                  </div>
                  <div className={styles.paletteSuggestionList}>
                    {AVAILABLE_TRADES.slice(0, 4).map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        className={styles.paletteSuggestionItem}
                        onClick={() => handleSelectTrade(item.trade)}
                      >
                        <span className={styles.paletteSuggestionIconWrap}>
                          <item.icon size={13} aria-hidden="true" />
                        </span>
                        <span className={styles.paletteSuggestionLabel}>
                          {item.name}
                        </span>
                        <span className={styles.paletteSuggestionHint}>
                          {item.rate}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
