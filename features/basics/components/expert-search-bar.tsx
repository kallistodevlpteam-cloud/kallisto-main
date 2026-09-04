"use client";

import {
  Search,
  X,
} from "lucide-react";
import { FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./basics-workspace.module.css";

const DEFAULT_TAGS = ["Structural", "MEP", "Kochi"];

const RECENT_SPECIALISTS = [
  {
    id: "provider-001",
    name: "Circuit MEP Design",
    specialty: "MEP & Electrical Coordination",
    metric: "4.9 ★ · 44 consults",
    query: "MEP",
    avatarBg: "#0b0d11",
    avatarColor: "#00f0ff",
    initials: "CM",
  },
  {
    id: "provider-002",
    name: "RenderField Studio",
    specialty: "Architectural 3D & BIM",
    metric: "4.9 ★ · 80 consults",
    query: "BIM",
    avatarBg: "#c4ff00",
    avatarColor: "#0b0f17",
    initials: "RS",
  },
  {
    id: "provider-003",
    name: "ModuBIM Studio",
    specialty: "BIM Coordination",
    metric: "4.8 ★ · 40 consults",
    query: "BIM Coordination",
    avatarBg: "#ff2727",
    avatarColor: "#ffffff",
    initials: "MS",
  },
  {
    id: "provider-004",
    name: "BeamWorks Structural",
    specialty: "Foundation & Seismic Analysis",
    metric: "4.9 ★ · 62 consults",
    query: "Structural",
    avatarBg: "#0a0a0a",
    avatarColor: "#ffffff",
    initials: "BW",
  },
];

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
  const [activeTags, setActiveTags] = useState<string[]>(DEFAULT_TAGS);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams();
    const cleanQuery = query.trim();
    if (cleanQuery) params.set("q", cleanQuery);
    if (activeTags.length > 0) {
      params.set("tags", activeTags.join(","));
    }
    if (projectId) params.set("projectId", projectId);
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

  function handleSelectSpecialist(item: typeof RECENT_SPECIALISTS[0]) {
    const params = new URLSearchParams({ q: item.query });
    if (projectId) params.set("projectId", projectId);
    setIsOpen(false);
    router.push(`/basics/experts?${params.toString()}`);
  }

  return (
    <div
      ref={containerRef}
      className={`${styles.minimalSearchCard} ${isOpen ? styles.minimalSearchCardOpen : ""}`}
    >
      {/* Top Search Input Box */}
      <form className={styles.paletteSearchHeader} onSubmit={handleSearchSubmit} role="search">
        <input
          ref={inputRef}
          className={styles.paletteSearchInput}
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

        <div className={styles.grokSearchControls}>
          <button
            type="submit"
            className={styles.grokSendBtn}
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
                {RECENT_SPECIALISTS.map((item) => (
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
          </div>
        </div>
      )}
    </div>
  );
}




