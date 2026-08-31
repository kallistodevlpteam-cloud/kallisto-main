"use client";

import React, { useState, useRef, useEffect } from "react";
import { Search, ChevronDown, Check, X } from "lucide-react";
import {
  WorkerTrade,
  WorkerAvailability,
} from "../../types/worker-domain";

interface HandsWorkersToolbarProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  selectedTrade: WorkerTrade | "All";
  onTradeChange: (trade: WorkerTrade | "All") => void;
  selectedAvailability: WorkerAvailability | "All" | "NeedsAttention";
  onAvailabilityChange: (avail: WorkerAvailability | "All" | "NeedsAttention") => void;
  sortBy?: "default" | "experience_desc" | "name_asc" | "trade_asc";
  onSortByChange?: (sort: "default" | "experience_desc" | "name_asc" | "trade_asc") => void;
  totalWorkers?: number;
  availableWorkers?: number;
}

export function HandsWorkersToolbar({
  searchQuery,
  onSearchChange,
  selectedTrade,
  onTradeChange,
  selectedAvailability,
  onAvailabilityChange,
  sortBy = "default",
  onSortByChange,
  totalWorkers = 170,
  availableWorkers = 42,
}: HandsWorkersToolbarProps) {
  const [tradeOpen, setTradeOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  const tradeRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node | null;
      if (tradeRef.current && target && !tradeRef.current.contains(target)) {
        setTradeOpen(false);
      }
      if (statusRef.current && target && !statusRef.current.contains(target)) {
        setStatusOpen(false);
      }
      if (sortRef.current && target && !sortRef.current.contains(target)) {
        setSortOpen(false);
      }
    }
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const trades: Array<WorkerTrade | "All"> = [
    "All",
    "Mason",
    "Helper",
    "Carpenter",
    "Electrician",
    "Plumber",
    "Painter",
    "Steel Fixer",
    "Tile Worker",
  ];

  const statusOptions = [
    { id: "All", label: "All Statuses" },
    { id: "Available", label: "Available" },
    { id: "Assigned", label: "On Assignment" },
    { id: "Unavailable", label: "Unavailable" },
    { id: "NeedsAttention", label: "Needs Attention" },
  ];

  const sortOptions = [
    { id: "default", label: "Default Roster" },
    { id: "experience_desc", label: "Experience: High to Low" },
    { id: "name_asc", label: "Worker Name (A-Z)" },
    { id: "trade_asc", label: "Trade (A-Z)" },
  ];

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "12px",
        width: "100%",
        boxSizing: "border-box",
        flexWrap: "wrap",
      }}
      role="search"
      aria-label="Workforce search and filters"
    >
      {/* Left: Live Depot / Fleet Telemetry Strip */}
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
          height: "32px",
          padding: "0 14px",
          backgroundColor: "#f1f5f9",
          borderRadius: "9999px",
          fontSize: "12px",
          color: "#64748b",
          boxSizing: "border-box",
          flex: 1,
          minWidth: "280px",
        }}
      >
        <div style={{ display: "inline-flex", alignItems: "center", gap: "10px", minWidth: 0, flexWrap: "nowrap" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
            <span style={{ fontWeight: 700, color: "#0f172a" }}>{totalWorkers}</span>
            <span>Total Fleet</span>
          </span>
          <span style={{ color: "#cbd5e1" }}>·</span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
            <span style={{ fontWeight: 700, color: "#059669" }}>98%</span>
            <span>KYC Verified</span>
          </span>
          <span style={{ color: "#cbd5e1" }}>·</span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
            <span style={{ fontWeight: 700, color: "#2563eb" }}>{availableWorkers}</span>
            <span>Available Today</span>
          </span>
        </div>

        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "5px",
            fontSize: "11px",
            fontWeight: 600,
            color: "#059669",
            flexShrink: 0,
          }}
        >
          <span
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "9999px",
              backgroundColor: "#10b981",
              boxShadow: "0 0 0 2px rgba(16, 185, 129, 0.25)",
              flexShrink: 0,
            }}
          />
          <span>Live</span>
        </div>
      </div>

      {/* Right: Search Pill + Filter Action Buttons */}
      <div style={{ display: "flex", alignItems: "center", gap: "6px", height: "32px", flexShrink: 0 }}>
        {/* Search Pill */}
        <div style={{ position: "relative", width: "220px", height: "32px" }}>
          <Search
            size={13}
            style={{
              position: "absolute",
              left: "11px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "#94a3b8",
              pointerEvents: "none",
            }}
          />
          <input
            type="text"
            placeholder="Search workers by name, trade or worker ID..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            style={{
              width: "100%",
              height: "32px",
              lineHeight: "32px",
              padding: "0 28px 0 30px",
              borderRadius: "9999px",
              border: "none",
              fontSize: "12px",
              color: "#0f172a",
              outline: "none",
              backgroundColor: "#f1f5f9",
              boxSizing: "border-box",
              transition: "all 140ms ease",
            }}
            onFocus={(e) => {
              e.target.style.backgroundColor = "#ffffff";
              e.target.style.boxShadow = "0 0 0 1.5px #0f172a, 0 1px 2px rgba(15, 23, 42, 0.05)";
            }}
            onBlur={(e) => {
              e.target.style.backgroundColor = "#f1f5f9";
              e.target.style.boxShadow = "none";
            }}
            aria-label="Search workers by name, trade or worker ID"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              style={{
                position: "absolute",
                right: "9px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "transparent",
                border: "none",
                color: "#94a3b8",
                cursor: "pointer",
                padding: "2px",
                display: "grid",
                placeItems: "center",
              }}
              aria-label="Clear search"
            >
              <X size={12} />
            </button>
          )}
        </div>

        {/* Action Filter Button: Trade */}
        <div ref={tradeRef} style={{ position: "relative" }}>
          <button
            type="button"
            onClick={() => {
              setTradeOpen(!tradeOpen);
              setStatusOpen(false);
              setSortOpen(false);
            }}
            aria-label="Filter by Trade"
            title="Filter by Trade"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "5px",
              height: "32px",
              padding: "0 11px",
              borderRadius: "9999px",
              border: "none",
              backgroundColor: selectedTrade !== "All" || tradeOpen ? "#0f172a" : "#f1f5f9",
              color: selectedTrade !== "All" || tradeOpen ? "#ffffff" : "#475569",
              fontSize: "12px",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 140ms ease",
              whiteSpace: "nowrap",
            }}
          >
            <span>{selectedTrade === "All" ? "Trade" : selectedTrade}</span>
            <ChevronDown
              size={12}
              style={{
                transform: tradeOpen ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 140ms ease",
              }}
            />
          </button>

          {tradeOpen && (
            <div
              style={{
                position: "absolute",
                top: "calc(100% + 4px)",
                right: 0,
                width: "180px",
                backgroundColor: "#ffffff",
                borderRadius: "12px",
                border: "1px solid #e2e8f0",
                boxShadow: "0 8px 24px -4px rgba(15, 23, 42, 0.12)",
                padding: "4px",
                zIndex: 50,
              }}
            >
              {trades.map((t) => {
                const isSelected = selectedTrade === t;
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => {
                      onTradeChange(t);
                      setTradeOpen(false);
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      width: "100%",
                      padding: "7px 10px",
                      borderRadius: "8px",
                      border: "none",
                      backgroundColor: isSelected ? "#f1f5f9" : "transparent",
                      color: isSelected ? "#0f172a" : "#334155",
                      fontSize: "12px",
                      fontWeight: isSelected ? 600 : 500,
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "background-color 0.12s ease",
                    }}
                  >
                    <span>{t === "All" ? "All Trades" : t}</span>
                    {isSelected && <Check size={13} color="#0f172a" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Action Filter Button: Status */}
        <div ref={statusRef} style={{ position: "relative" }}>
          <button
            type="button"
            onClick={() => {
              setStatusOpen(!statusOpen);
              setTradeOpen(false);
              setSortOpen(false);
            }}
            aria-label="Filter by Status"
            title="Filter by Status"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "5px",
              height: "32px",
              padding: "0 11px",
              borderRadius: "9999px",
              border: "none",
              backgroundColor: selectedAvailability !== "All" || statusOpen ? "#0f172a" : "#f1f5f9",
              color: selectedAvailability !== "All" || statusOpen ? "#ffffff" : "#475569",
              fontSize: "12px",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 140ms ease",
              whiteSpace: "nowrap",
            }}
          >
            <span>
              {selectedAvailability === "All"
                ? "Status"
                : selectedAvailability === "NeedsAttention"
                ? "Needs Attention"
                : selectedAvailability}
            </span>
            <ChevronDown
              size={12}
              style={{
                transform: statusOpen ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 140ms ease",
              }}
            />
          </button>

          {statusOpen && (
            <div
              style={{
                position: "absolute",
                top: "calc(100% + 4px)",
                right: 0,
                width: "160px",
                backgroundColor: "#ffffff",
                borderRadius: "12px",
                border: "1px solid #e2e8f0",
                boxShadow: "0 8px 24px -4px rgba(15, 23, 42, 0.12)",
                padding: "4px",
                zIndex: 50,
              }}
            >
              {statusOptions.map((s) => {
                const isSelected = selectedAvailability === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      onAvailabilityChange(s.id as WorkerAvailability | "All" | "NeedsAttention");
                      setStatusOpen(false);
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      width: "100%",
                      padding: "7px 10px",
                      borderRadius: "8px",
                      border: "none",
                      backgroundColor: isSelected ? "#f1f5f9" : "transparent",
                      color: isSelected ? "#0f172a" : "#334155",
                      fontSize: "12px",
                      fontWeight: isSelected ? 600 : 500,
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "background-color 0.12s ease",
                    }}
                  >
                    <span>{s.label}</span>
                    {isSelected && <Check size={13} color="#0f172a" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Action Filter Button: Sort */}
        <div ref={sortRef} style={{ position: "relative" }}>
          <button
            type="button"
            onClick={() => {
              setSortOpen(!sortOpen);
              setTradeOpen(false);
              setStatusOpen(false);
            }}
            aria-label="Sort options"
            title="Sort options"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "5px",
              height: "32px",
              padding: "0 11px",
              borderRadius: "9999px",
              border: "none",
              backgroundColor: sortBy !== "default" || sortOpen ? "#0f172a" : "#f1f5f9",
              color: sortBy !== "default" || sortOpen ? "#ffffff" : "#475569",
              fontSize: "12px",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 140ms ease",
              whiteSpace: "nowrap",
            }}
          >
            <span>
              {sortBy === "default"
                ? "Sort"
                : sortBy === "experience_desc"
                ? "Experience"
                : sortBy === "name_asc"
                ? "Name (A-Z)"
                : "Trade"}
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
            <div
              style={{
                position: "absolute",
                top: "calc(100% + 4px)",
                right: 0,
                width: "190px",
                backgroundColor: "#ffffff",
                borderRadius: "12px",
                border: "1px solid #e2e8f0",
                boxShadow: "0 8px 24px -4px rgba(15, 23, 42, 0.12)",
                padding: "4px",
                zIndex: 50,
              }}
            >
              {sortOptions.map((s) => {
                const isSelected = sortBy === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      if (onSortByChange) {
                        onSortByChange(s.id as typeof sortBy);
                      }
                      setSortOpen(false);
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      width: "100%",
                      padding: "7px 10px",
                      borderRadius: "8px",
                      border: "none",
                      backgroundColor: isSelected ? "#f1f5f9" : "transparent",
                      color: isSelected ? "#0f172a" : "#334155",
                      fontSize: "12px",
                      fontWeight: isSelected ? 600 : 500,
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "background-color 0.12s ease",
                    }}
                  >
                    <span>{s.label}</span>
                    {isSelected && <Check size={13} color="#0f172a" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
