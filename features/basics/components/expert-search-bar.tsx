"use client";

import {
  AlertCircle,
  ArrowRight,
  ArrowUp,
  Building,
  Check,
  CheckCircle2,
  ChevronDown,
  Cpu,
  Folder,
  FolderOpen,
  Layers,
  Mic,
  Plus,
  Search,
  Sparkles,
  Tag,
  Users,
  X,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./basics-workspace.module.css";

const DEFAULT_TAGS = ["Structural", "MEP", "Kochi"];

const AVAILABLE_PROJECTS = [
  { id: "p1", name: "Villa Design Consultation", code: "PRJ-2026-01" },
  { id: "p2", name: "Nila Residence Fit-out", code: "PRJ-2026-02" },
  { id: "p3", name: "Horizon Bay Villa", code: "PRJ-2026-03" },
  { id: "p4", name: "Emerald Heights Penthouse", code: "PRJ-2026-04" },
];

const ALL_DISCIPLINES = [
  { label: "Architecture & Design", query: "Architecture", icon: Building },
  { label: "Architectural Visualization (3D)", query: "Architectural Visualization", icon: Sparkles },
  { label: "Architectural Acoustics", query: "Architectural Acoustics", icon: Layers },
  { label: "Landscape Design & Masterplanning", query: "Landscape Design", icon: Building },
  { label: "BIM Coordination & Digital Twin", query: "BIM", icon: Layers },
  { label: "RCC & Steel Structural Design", query: "Structural", icon: Building },
  { label: "Structural Peer Review", query: "Structural Peer Review", icon: CheckCircle2 },
  { label: "Integrated MEP Design", query: "MEP", icon: Cpu },
  { label: "HVAC & Thermal Engineering", query: "HVAC", icon: Cpu },
  { label: "Electrical & Lighting Systems", query: "Electrical Design", icon: Sparkles },
  { label: "Plumbing, PHE & Drainage", query: "Plumbing", icon: Cpu },
  { label: "Fire, Life Safety & NFPA Compliance", query: "Fire and Life Safety", icon: CheckCircle2 },
  { label: "Quantity Surveying & BOQ Estimation", query: "Quantity Surveying", icon: Tag },
  { label: "Cost Consulting & Value Engineering", query: "Cost Consulting", icon: Tag },
  { label: "Geotechnical & Soil Investigation", query: "Geotechnical", icon: Layers },
  { label: "Facade Engineering & Fenestration", query: "Facade Engineering", icon: Building },
  { label: "Sustainability & Green Building (IGBC/LEED)", query: "Sustainability Consulting", icon: Sparkles },
  { label: "Permit & Municipal Approvals (KMBR/KPBR)", query: "Permit Consulting", icon: CheckCircle2 },
  { label: "Construction Project Management (PMC)", query: "Construction Project Management", icon: Users },
];

const ALL_SPECIALISTS = [
  {
    id: "provider-018",
    name: "RenderField Studio",
    specialty: "Architectural Visualization",
    category: "Architecture & 3D",
    metric: "4.9 ★ · 80 consults",
    city: "Kozhikode",
    software: ["3ds Max", "Lumion", "SketchUp"],
    avatarBg: "#c4ff00",
    avatarColor: "#0b0f17",
    initials: "RS",
  },
  {
    id: "provider-014",
    name: "Studio Canopy",
    specialty: "Landscape Architecture",
    category: "Architecture & Design",
    metric: "4.8 ★ · 36 consults",
    city: "Kochi",
    software: ["AutoCAD", "SketchUp", "Lumion"],
    avatarBg: "#10b981",
    avatarColor: "#ffffff",
    initials: "SC",
  },
  {
    id: "provider-016",
    name: "Echo Acoustic Lab",
    specialty: "Architectural Acoustics",
    category: "Specialist Consulting",
    metric: "4.7 ★ · 28 consults",
    city: "Chennai",
    software: ["AutoCAD", "Revit"],
    avatarBg: "#1e1b4b",
    avatarColor: "#818cf8",
    initials: "EA",
  },
  {
    id: "provider-009",
    name: "Circuit MEP Design",
    specialty: "Electrical & MEP Coordination",
    category: "Engineering & MEP",
    metric: "4.9 ★ · 44 consults",
    city: "Kannur",
    software: ["AutoCAD", "Revit"],
    avatarBg: "#0b0d11",
    avatarColor: "#00f0ff",
    initials: "CM",
  },
  {
    id: "provider-003",
    name: "Enviro MEP Consultants",
    specialty: "Integrated MEP Design",
    category: "Engineering & MEP",
    metric: "4.8 ★ · 52 consults",
    city: "Kozhikode",
    software: ["Revit", "Navisworks", "AutoCAD"],
    avatarBg: "#064e3b",
    avatarColor: "#34d399",
    initials: "EM",
  },
  {
    id: "provider-008",
    name: "ModuBIM Studio",
    specialty: "BIM Coordination & Clash Detection",
    category: "BIM & Digital",
    metric: "4.8 ★ · 40 consults",
    city: "Kochi",
    software: ["Revit", "Navisworks", "AutoCAD"],
    avatarBg: "#ff2727",
    avatarColor: "#ffffff",
    initials: "MS",
  },
  {
    id: "provider-007",
    name: "BeamWorks Structural",
    specialty: "Steel & RCC Structural Design",
    category: "Engineering",
    metric: "4.9 ★ · 62 consults",
    city: "Kottayam",
    software: ["STAAD.Pro", "Tekla", "ETABS"],
    avatarBg: "#0a0a0a",
    avatarColor: "#ffffff",
    initials: "BW",
  },
  {
    id: "provider-001",
    name: "Axis Structures",
    specialty: "RCC Structural Engineering",
    category: "Engineering",
    metric: "4.9 ★ · 64 consults",
    city: "Kochi",
    software: ["ETABS", "STAAD.Pro", "AutoCAD"],
    avatarBg: "#0f172a",
    avatarColor: "#38bdf8",
    initials: "AS",
  },
  {
    id: "provider-005",
    name: "Flow HVAC Studio",
    specialty: "HVAC Engineering",
    category: "Engineering & MEP",
    metric: "4.8 ★ · 38 consults",
    city: "Kochi",
    software: ["Revit", "AutoCAD", "Navisworks"],
    avatarBg: "#0284c7",
    avatarColor: "#ffffff",
    initials: "FH",
  },
  {
    id: "provider-006",
    name: "Terra Geotechnics",
    specialty: "Geotechnical & Soil Analysis",
    category: "Engineering",
    metric: "4.7 ★ · 25 consults",
    city: "Thrissur",
    software: ["AutoCAD", "STAAD.Pro"],
    avatarBg: "#78350f",
    avatarColor: "#fde68a",
    initials: "TG",
  },
  {
    id: "provider-011",
    name: "SafeCore Fire Consultants",
    specialty: "Fire & Life Safety (NFPA)",
    category: "Engineering",
    metric: "4.8 ★ · 30 consults",
    city: "Kochi",
    software: ["AutoCAD", "Revit"],
    avatarBg: "#991b1b",
    avatarColor: "#fecaca",
    initials: "SF",
  },
  {
    id: "provider-012",
    name: "Ledger QS",
    specialty: "Quantity Surveying & BOQ",
    category: "Commercial & PM",
    metric: "4.8 ★ · 42 consults",
    city: "Kozhikode",
    software: ["AutoCAD", "MS Project"],
    avatarBg: "#374151",
    avatarColor: "#e5e7eb",
    initials: "LQ",
  },
];

import { matchesFuzzyQuery } from "../lib/basics-search-matcher";

export function ExpertSearchBar({
  initialValue = "",
  projectId,
}: {
  initialValue?: string;
  projectId?: string;
}) {
  const router = useRouter();
  const [query, setQuery] = useState(initialValue);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(projectId || null);
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
  const [activeTags, setActiveTags] = useState<string[]>(DEFAULT_TAGS);
  const containerRef = useRef<HTMLDivElement>(null);
  const projectMenuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedProject = useMemo(() => {
    return AVAILABLE_PROJECTS.find((p) => p.id === selectedProjectId) || null;
  }, [selectedProjectId]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
        setIsProjectDropdownOpen(false);
        inputRef.current?.blur();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setIsProjectDropdownOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  function handleSearchSubmit(event?: FormEvent<HTMLFormElement>) {
    if (event) event.preventDefault();
    const params = new URLSearchParams();
    const cleanQuery = query.trim();
    if (cleanQuery) params.set("q", cleanQuery);
    if (activeTags.length > 0) {
      params.set("tags", activeTags.join(","));
    }
    const effectiveProjectId = selectedProjectId || projectId;
    if (effectiveProjectId) params.set("projectId", effectiveProjectId);
    setIsOpen(false);
    router.push(`/basics/experts?${params.toString()}`);
  }

  function handleRemoveTag(tagToRemove: string) {
    setActiveTags((prev) => prev.filter((tag) => tag !== tagToRemove));
  }

  function handleAddTag() {
    const newTag = prompt("Enter a skill, location, or specialty (e.g. HVAC, Fire Safety, Bengaluru):");
    if (newTag && newTag.trim() && !activeTags.includes(newTag.trim())) {
      setActiveTags((prev) => [...prev, newTag.trim()]);
    }
  }

  function handleSelectSpecialist(item: typeof ALL_SPECIALISTS[0]) {
    const params = new URLSearchParams({ q: item.name });
    const effectiveProjectId = selectedProjectId || projectId;
    if (effectiveProjectId) params.set("projectId", effectiveProjectId);
    setIsOpen(false);
    router.push(`/basics/experts?${params.toString()}`);
  }

  function handleSelectDiscipline(queryText: string) {
    const params = new URLSearchParams({ q: queryText });
    const effectiveProjectId = selectedProjectId || projectId;
    if (effectiveProjectId) params.set("projectId", effectiveProjectId);
    setIsOpen(false);
    router.push(`/basics/experts?${params.toString()}`);
  }

  // Dynamic matching suggestions while typing (with fuzzy / spell-mistake tolerance)
  const cleanQ = query.trim();

  const matchingDisciplines = useMemo(() => {
    if (!cleanQ) return [];
    return ALL_DISCIPLINES.filter((d) =>
      matchesFuzzyQuery(cleanQ, [d.label, d.query])
    ).slice(0, 4);
  }, [cleanQ]);

  const matchingSpecialists = useMemo(() => {
    if (!cleanQ) return [];
    return ALL_SPECIALISTS.filter((s) =>
      matchesFuzzyQuery(cleanQ, [
        s.name,
        s.specialty,
        s.category,
        s.city,
        ...s.software,
      ])
    ).slice(0, 5);
  }, [cleanQ]);

  return (
    <div
      ref={containerRef}
      className={styles.composerCardContainer}
    >
      {/* 1. Backdrop Tab with Choose Project */}
      <div className={styles.composerProjectBackdrop}>
        <button
          type="button"
          className={`${styles.composerProjectBtn} ${selectedProject ? styles.composerProjectBtnSelected : ""}`}
          onClick={() => setIsProjectDropdownOpen((prev) => !prev)}
          title="Choose active project for this search"
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
              <span>Active Projects</span>
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
              {AVAILABLE_PROJECTS.map((proj) => {
                const isSelected = selectedProjectId === proj.id;
                return (
                  <button
                    key={proj.id}
                    type="button"
                    className={`${styles.searchProjectDropdownItem} ${isSelected ? styles.searchProjectDropdownItemActive : ""}`}
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
                        <strong className={styles.searchProjectItemName}>{proj.name}</strong>
                        <span className={styles.searchProjectItemCode}>{proj.code}</span>
                      </div>
                    </div>
                    {isSelected && <Check size={13} className={styles.searchProjectCheck} aria-hidden="true" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 2. Main White Search Box Card */}
      <div className={`${styles.searchPillCard} ${isOpen ? styles.searchPillCardOpen : ""}`}>
        <form className={styles.searchPillForm} onSubmit={handleSearchSubmit} role="search">
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
            placeholder="What do you want to explore or build?"
            aria-label="What do you want to explore or build?"
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

        {/* Body Content - Only Shown When Focused or Typing */}
        {isOpen && (
          <div className={styles.paletteDropdownOverlay}>
            <div className={styles.paletteBody}>
              {/* 1. TYPING STATE: SHOW REAL-TIME DYNAMIC HINTS */}
              {cleanQ.length > 0 ? (
                <>
                  {/* Instant Top Search Suggestion */}
                  <button
                    type="button"
                    className={styles.paletteDirectHintRow}
                    onClick={() => handleSearchSubmit()}
                  >
                    <Search size={14} className={styles.paletteDirectHintIcon} aria-hidden="true" />
                    <span className={styles.paletteDirectHintText}>
                      Search all specialists for <strong>&ldquo;{query.trim()}&rdquo;</strong>
                    </span>
                    <ArrowRight size={13} className={styles.paletteDirectHintArrow} aria-hidden="true" />
                  </button>

                  {/* Matching Disciplines & Skills */}
                  {matchingDisciplines.length > 0 && (
                    <div className={styles.paletteSection}>
                      <div className={styles.paletteSectionHeader}>
                        <span className={styles.paletteSectionTitle}>Matching Disciplines & Capabilities</span>
                      </div>
                      <div className={styles.paletteSuggestionList}>
                        {matchingDisciplines.map((item) => (
                          <button
                            key={item.label}
                            type="button"
                            className={styles.paletteSuggestionItem}
                            onClick={() => handleSelectDiscipline(item.query)}
                          >
                            <span className={styles.paletteSuggestionIconWrap}>
                              <item.icon size={13} aria-hidden="true" />
                            </span>
                            <span className={styles.paletteSuggestionLabel}>{item.label}</span>
                            <span className={styles.paletteSuggestionHint}>Discipline</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Matching Specialists / Studios */}
                  {matchingSpecialists.length > 0 && (
                    <div className={styles.paletteSection}>
                      <div className={styles.paletteSectionHeader}>
                        <span className={styles.paletteSectionTitle}>Verified Specialists & Studios</span>
                      </div>
                      <div className={styles.paletteItemList}>
                        {matchingSpecialists.map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            className={styles.paletteItem}
                            onClick={() => handleSelectSpecialist(item)}
                          >
                            <div className={styles.paletteItemLeft}>
                              <span
                                className={styles.paletteAvatar}
                                style={{ background: item.avatarBg, color: item.avatarColor }}
                                aria-hidden="true"
                              >
                                {item.initials}
                              </span>
                              <div className={styles.paletteItemText}>
                                <strong className={styles.paletteItemName}>{item.name}</strong>
                                <span className={styles.paletteItemSub}>
                                  {item.specialty} · {item.city}
                                </span>
                              </div>
                            </div>
                            <div className={styles.paletteItemRight}>
                              <span className={styles.paletteMetricBadge}>{item.metric}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* If No Direct Matches Found */}
                  {matchingDisciplines.length === 0 && matchingSpecialists.length === 0 && (
                    <div className={styles.paletteEmptyHints}>
                      <Sparkles size={16} className={styles.paletteEmptyIcon} aria-hidden="true" />
                      <span>Press <strong>Enter</strong> to run an open search across all verified specialist portfolios and documentation.</span>
                    </div>
                  )}
                </>
              ) : (
                /* 2. DEFAULT IDLE STATE: SHOW SEARCHING FOR + RECENT */
                <>
                  {/* Searching For Section */}
                  <div className={styles.paletteSection}>
                    <div className={styles.paletteSectionHeader}>
                      <span className={styles.paletteSectionTitle}>Searching For</span>
                    </div>
                    <div className={styles.paletteTagRow}>
                      {activeTags.map((tag) => (
                        <span key={tag} className={styles.paletteTagPill}>
                          <span>{tag}</span>
                          <button
                            type="button"
                            className={styles.paletteTagRemoveBtn}
                            onClick={() => handleRemoveTag(tag)}
                            aria-label={`Remove ${tag} filter`}
                          >
                            <X size={12} aria-hidden="true" />
                          </button>
                        </span>
                      ))}
                      <button
                        type="button"
                        className={styles.paletteTagAddBtn}
                        onClick={handleAddTag}
                      >
                        + Add New
                      </button>
                    </div>
                  </div>

                  <div className={styles.paletteDivider} />

                  {/* Recent Specialists List */}
                  <div className={styles.paletteSection}>
                    <div className={styles.paletteSectionHeader}>
                      <span className={styles.paletteSectionTitle}>Recent</span>
                    </div>
                    <div className={styles.paletteItemList}>
                      {ALL_SPECIALISTS.slice(0, 4).map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          className={styles.paletteItem}
                          onClick={() => handleSelectSpecialist(item)}
                        >
                          <div className={styles.paletteItemLeft}>
                            <span
                              className={styles.paletteAvatar}
                              style={{ background: item.avatarBg, color: item.avatarColor }}
                              aria-hidden="true"
                            >
                              {item.initials}
                            </span>
                            <div className={styles.paletteItemText}>
                              <strong className={styles.paletteItemName}>{item.name}</strong>
                              <span className={styles.paletteItemSub}>{item.specialty}</span>
                            </div>
                          </div>
                          <div className={styles.paletteItemRight}>
                            <span className={styles.paletteMetricBadge}>{item.metric}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}




