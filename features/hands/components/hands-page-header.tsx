"use client";

import {
  Bookmark,
  Search,
  ShoppingBag,
  Sparkles,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { AVAILABLE_TRADES } from "./hands-search-bar";
import styles from "./hands-overview.module.css";

interface HandsPageHeaderProps {
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onRequestWorkforce?: () => void;
  onOverflowAction?: (action: string) => void;
}

export function HandsPageHeader({
  searchQuery = "",
  onSearchChange,
}: HandsPageHeaderProps) {
  const [internalQuery, setInternalQuery] = useState(searchQuery);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const activeQuery = onSearchChange ? searchQuery : internalQuery;
  const cleanQ = activeQuery.trim().toLowerCase();

  const matchingTrades = useMemo(() => {
    if (!cleanQ) return [];
    return AVAILABLE_TRADES.filter(
      (t) =>
        t.name.toLowerCase().includes(cleanQ) ||
        t.trade.toLowerCase().includes(cleanQ) ||
        t.category.toLowerCase().includes(cleanQ)
    );
  }, [cleanQ]);

  useEffect(() => {
    function handleDocClick(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleDocClick);
    return () => document.removeEventListener("mousedown", handleDocClick);
  }, []);

  const handleSelectTrade = (tradeName: string) => {
    setInternalQuery(tradeName);
    onSearchChange?.(tradeName);
    setIsOpen(false);
  };

  const handleClear = () => {
    setInternalQuery("");
    onSearchChange?.("");
    setIsOpen(false);
  };

  return (
    <header className={styles.handsStickyHeader}>
      <div className={styles.handsTopNavRow}>
        {/* Left: Kallisto Hands Logo */}
        <Link href="/hands" className={styles.handsLogoLink} title="Kallisto Hands Overview">
          <Image
            src="/kallisto-hands-logo.png"
            alt="Kallisto Hands"
            width={195}
            height={32}
            className={styles.handsLogoImg}
            priority
            unoptimized
          />
        </Link>

        {/* Center: Search Box Pill with Dropdown */}
        <div ref={containerRef} className={styles.handsTopNavCenter} style={{ position: "relative" }}>
          <form
            className={styles.handsSearchBox}
            onSubmit={(e) => {
              e.preventDefault();
              setIsOpen(false);
            }}
            role="search"
          >
            <input
              className={styles.handsSearchInput}
              value={activeQuery}
              placeholder="Search trades, workforce, site supervisors or projects..."
              onChange={(event) => {
                const val = event.target.value;
                setInternalQuery(val);
                onSearchChange?.(val);
                setIsOpen(val.trim().length > 0);
              }}
              onFocus={() => {
                if (cleanQ) setIsOpen(true);
              }}
              aria-label="Search trades, workforce, site supervisors or projects"
            />
            {activeQuery ? (
              <button
                type="button"
                className={styles.paletteClearBtn}
                onClick={handleClear}
                aria-label="Clear search input"
              >
                <X size={13} aria-hidden="true" />
              </button>
            ) : null}
            <button
              type="submit"
              className={styles.searchPillSendBtn}
              aria-label="Search"
            >
              <Search size={16} aria-hidden="true" />
            </button>
          </form>

          {/* Real-time Matching Trades Dropdown */}
          {isOpen && cleanQ && (
            <div className={styles.paletteDropdownOverlay} role="listbox" aria-label="Trade suggestions">
              <div className={styles.paletteBody}>
                {matchingTrades.length > 0 ? (
                  <div className={styles.paletteSection}>
                    <div className={styles.paletteSectionHeader}>
                      <span className={styles.paletteSectionTitle}>Matching Trades ({matchingTrades.length})</span>
                    </div>
                    <div className={styles.paletteSuggestionList}>
                      {matchingTrades.map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          className={styles.paletteSuggestionItem}
                          onClick={() => handleSelectTrade(t.trade)}
                        >
                          <span className={styles.paletteSuggestionIconWrap} style={{ color: t.accentColor }}>
                            <t.icon size={14} aria-hidden="true" />
                          </span>
                          <span className={styles.paletteSuggestionLabel}>{t.name}</span>
                          <span className={styles.paletteSuggestionHint}>{t.rate}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className={styles.paletteEmptyHints}>
                    <Sparkles size={16} className={styles.paletteEmptyIcon} aria-hidden="true" />
                    <span>No specific trades match &ldquo;{activeQuery}&rdquo;. Press enter to search all deployments.</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right: Actions */}
        <div className={styles.handsTopNavRight}>
          {/* Round Wishlist / Saved */}
          <button
            type="button"
            className={styles.handsRoundBtn}
            title="Saved Workforce"
            aria-label="Saved workforce"
          >
            <Bookmark size={15} aria-hidden="true" />
          </button>

          {/* Round Deployments / Orders */}
          <button
            type="button"
            className={styles.handsRoundBtn}
            title="Deployments & Requests"
            aria-label="Deployments and requests"
          >
            <ShoppingBag size={15} aria-hidden="true" />
          </button>
        </div>
      </div>
    </header>
  );
}
