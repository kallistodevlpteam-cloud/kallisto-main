"use client";

import React, { useState, useRef, useEffect } from "react";
import { Search, X, ChevronDown, Check } from "lucide-react";
import { LocationDuotoneIcon, EditDuotoneIcon } from "@/components/layout/sidebar-icons";
import styles from "./hands-requests.module.css";

interface HandsRequestsToolbarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedTrade: string;
  onTradeChange: (trade: string) => void;
  selectedSort: string;
  onSortChange: (sort: string) => void;
  dispatchCity?: string;
  dispatchRadius?: number;
  onUpdateDispatchZone?: (city: string, radius: number) => void;
}

const TRADE_OPTIONS = [
  { id: "All", label: "All Trades" },
  { id: "Mason", label: "Mason" },
  { id: "Carpenter", label: "Carpenter" },
  { id: "Electrician", label: "Electrician" },
  { id: "Plumber", label: "Plumber" },
  { id: "Painter", label: "Painter" },
  { id: "Steel Fixer", label: "Steel Fixer" },
  { id: "Tile Worker", label: "Tile Worker" },
  { id: "Helper", label: "Helper" },
];

const SORT_OPTIONS = [
  { id: "default", label: "Default" },
  { id: "urgency", label: "Urgency / Start Date" },
  { id: "workers_desc", label: "Workforce Required: High to Low" },
  { id: "workers_asc", label: "Workforce Required: Low to High" },
  { id: "match_desc", label: "Best Match %" },
];

export function HandsRequestsToolbar({
  searchQuery,
  onSearchChange,
  selectedTrade,
  onTradeChange,
  selectedSort,
  onSortChange,
  dispatchCity = "Trivandrum, Kerala",
  dispatchRadius = 45,
  onUpdateDispatchZone,
}: HandsRequestsToolbarProps) {
  const [isEditingZone, setIsEditingZone] = useState(false);
  const [tempCity, setTempCity] = useState(dispatchCity);
  const [tempRadius, setTempRadius] = useState(dispatchRadius);

  const [tradeOpen, setTradeOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  const tradeRef = useRef<HTMLDivElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (tradeRef.current && !tradeRef.current.contains(e.target as Node)) {
        setTradeOpen(false);
      }
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setSortOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={styles.telemetryBarContainer}>
      {/* Left: Dispatch Zone Pill Strip */}
      <div className={styles.dispatchZonePill}>
        <div className={styles.dispatchZoneLeft}>
          <LocationDuotoneIcon size={16} className={styles.dispatchLocationIcon} />
          <span className={styles.dispatchZoneLabel}>
            Dispatch Zone:
          </span>
          <span className={styles.dispatchZoneValue}>
            {dispatchCity} · {dispatchRadius} km
          </span>
        </div>

        <button
          type="button"
          className={styles.dispatchEditBtn}
          onClick={() => {
            setTempCity(dispatchCity);
            setTempRadius(dispatchRadius);
            setIsEditingZone(true);
          }}
          aria-label="Edit dispatch zone"
        >
          <EditDuotoneIcon size={12} />
          <span>Edit</span>
        </button>
      </div>

      {/* Right: Search Pill + Dropdowns */}
      <div className={styles.telemetryRightGroup}>
        {/* Search Pill */}
        <div className={styles.searchPillWrap}>
          <Search size={13} className={styles.searchPillIcon} />
          <input
            type="text"
            className={styles.searchPillInput}
            placeholder="Search requests, projects, trades..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label="Search requests"
          />
          {searchQuery && (
            <button
              type="button"
              className={styles.searchPillClearBtn}
              onClick={() => onSearchChange("")}
              aria-label="Clear search"
            >
              <X size={12} />
            </button>
          )}
        </div>

        {/* Dropdown: Trade / Workflow Stage */}
        <div ref={tradeRef} style={{ position: "relative" }}>
          <button
            type="button"
            className={`${styles.filterPillBtn} ${
              selectedTrade !== "All" || tradeOpen ? styles.filterPillBtnActive : ""
            }`}
            onClick={() => {
              setTradeOpen(!tradeOpen);
              setSortOpen(false);
            }}
          >
            <span>
              {selectedTrade === "All"
                ? "Workflow Stage"
                : TRADE_OPTIONS.find((t) => t.id === selectedTrade)?.label || selectedTrade}
            </span>
            <ChevronDown
              size={12}
              style={{
                transform: tradeOpen ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 140ms ease",
              }}
            />
          </button>

          {tradeOpen && (
            <div className={styles.dropdownMenu}>
              {TRADE_OPTIONS.map((opt) => {
                const isSelected = selectedTrade === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    className={`${styles.dropdownItem} ${isSelected ? styles.dropdownItemActive : ""}`}
                    onClick={() => {
                      onTradeChange(opt.id);
                      setTradeOpen(false);
                    }}
                  >
                    <span>{opt.label}</span>
                    {isSelected && <Check size={13} color="#0f172a" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Dropdown: Sort */}
        <div ref={sortRef} style={{ position: "relative" }}>
          <button
            type="button"
            className={`${styles.filterPillBtn} ${
              selectedSort !== "default" || sortOpen ? styles.filterPillBtnActive : ""
            }`}
            onClick={() => {
              setSortOpen(!sortOpen);
              setTradeOpen(false);
            }}
          >
            <span>
              {selectedSort === "default"
                ? "Sort"
                : SORT_OPTIONS.find((s) => s.id === selectedSort)?.label || "Sort"}
            </span>
            <ChevronDown
              size={12}
              style={{
                transform: sortOpen ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 140ms ease",
              }}
            />
          </button>

          {sortOpen && (
            <div className={styles.dropdownMenu}>
              {SORT_OPTIONS.map((opt) => {
                const isSelected = selectedSort === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    className={`${styles.dropdownItem} ${isSelected ? styles.dropdownItemActive : ""}`}
                    onClick={() => {
                      onSortChange(opt.id);
                      setSortOpen(false);
                    }}
                  >
                    <span>{opt.label}</span>
                    {isSelected && <Check size={13} color="#0f172a" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Edit Dispatch Zone Modal */}
      {isEditingZone && (
        <div className={styles.modalOverlay} role="dialog" aria-modal="true">
          <div className={styles.zoneEditModal}>
            <div className={styles.zoneEditHeader}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <LocationDuotoneIcon size={18} style={{ color: "#2563eb" }} />
                <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "#0f172a" }}>
                  Edit Dispatch Zone
                </h3>
              </div>
              <button
                type="button"
                className={styles.zoneModalCloseBtn}
                onClick={() => setIsEditingZone(false)}
              >
                <X size={15} />
              </button>
            </div>

            <div className={styles.zoneEditBody}>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <label style={{ fontSize: "12px", fontWeight: 600, color: "#475569" }}>
                  Base City / Operational Hub
                </label>
                <input
                  type="text"
                  value={tempCity}
                  onChange={(e) => setTempCity(e.target.value)}
                  className={styles.zoneInput}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <label style={{ fontSize: "12px", fontWeight: 600, color: "#475569" }}>
                  Service Radius ({tempRadius} km)
                </label>
                <input
                  type="range"
                  min={10}
                  max={150}
                  step={5}
                  value={tempRadius}
                  onChange={(e) => setTempRadius(Number(e.target.value))}
                  style={{ width: "100%", accentColor: "#0f172a" }}
                />
              </div>
            </div>

            <div className={styles.zoneEditFooter}>
              <button
                type="button"
                className={styles.zoneCancelBtn}
                onClick={() => setIsEditingZone(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className={styles.zoneSaveBtn}
                onClick={() => {
                  if (onUpdateDispatchZone) {
                    onUpdateDispatchZone(tempCity, tempRadius);
                  }
                  setIsEditingZone(false);
                }}
              >
                Save Zone
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
