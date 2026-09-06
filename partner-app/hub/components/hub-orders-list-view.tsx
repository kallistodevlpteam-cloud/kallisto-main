"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  Search,
  CheckCircle2,
  AlertTriangle,
  Package,
  Clock,
  MapPin,
  Sparkles,
  ChevronDown,
  Check,
  X,
  MoreHorizontal,
  Trash2,
  Edit3,
  Plus,
  Eye,
  FileText,
  Truck,
  TrendingUp,
  Building,
  User,
  Phone,
  Send,
  Building2,
  DollarSign,
  AlertCircle,
  PackageCheck,
} from "lucide-react";
import {
  LocationDuotoneIcon,
  EditDuotoneIcon,
  EyeDuotoneIcon,
  TagDuotoneIcon,
  BoxesDuotoneIcon,
  SupplierDuotoneIcon,
  ArchiveDuotoneIcon,
  StudioDuotoneIcon,
} from "@/components/layout/sidebar-icons";
import { HubOrder, HubOrderStatus, HubOrderTab } from "../types/hub-order";

interface HubOrdersListViewProps {
  orders: HubOrder[];
  selectedOrderId?: string | null;
  onSelectOrder: (order: HubOrder) => void;
  onOpenCreateOrder?: () => void;
  isCreateOrderOpen?: boolean;
  onUpdateOrderStatus: (orderId: string, newStatus: HubOrderStatus) => void;
  onRemoveOrder?: (orderId: string) => void;
}

function MetricBoxDuotoneIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L3 6.5L12 11L21 6.5L12 2Z" fill="currentColor" opacity="0.4" />
      <path d="M3 7.8V17.2L11.5 21.8V12.3L3 7.8Z" fill="currentColor" />
      <path d="M12.5 12.3V21.8L21 17.2V7.8L12.5 12.3Z" fill="currentColor" opacity="0.8" />
    </svg>
  );
}

function MetricLayersDuotoneIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2 17L12 22L22 17L12 12L2 17Z" fill="currentColor" opacity="0.32" />
      <path d="M2 12L12 17L22 12L12 7L2 12Z" fill="currentColor" opacity="0.55" />
      <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor" />
    </svg>
  );
}

function MetricBuildingDuotoneIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M14 6H20C21.1 6 22 6.9 22 8V20C22 21.1 21.1 22 20 22H14V6Z" fill="currentColor" opacity="0.38" />
      <path d="M2 22H14V4C14 2.9 13.1 2 12 2H4C2.9 2 2 2.9 2 4V22ZM5 6H8V8H5V6ZM5 10H8V12H5V10ZM5 14H8V16H5V14ZM5 18H8V20H5V18Z" fill="currentColor" />
    </svg>
  );
}

function MetricClockDuotoneIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.28" />
      <path d="M12 7V12L15.5 14" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="2" fill="currentColor" />
    </svg>
  );
}

const WORKFLOW_TABS = [
  { id: "ALL", label: "All Orders" },
  { id: "REQUESTS", label: "Requests" },
  { id: "ACTIVE", label: "Active Orders" },
  { id: "COMPLETED", label: "Completed" },
  { id: "ATTENTION", label: "Need Attention" },
];

export function HubOrdersListView({
  orders,
  selectedOrderId,
  onSelectOrder,
  onOpenCreateOrder,
  isCreateOrderOpen,
  onUpdateOrderStatus,
  onRemoveOrder,
}: HubOrdersListViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedWorkflowTab, setSelectedWorkflowTab] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<"default" | "value_desc" | "value_asc" | "date" | "project">("default");

  // Dropdown states
  const [stageOpen, setStageOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [openActionMenuId, setOpenActionMenuId] = useState<string | null>(null);

  // View Order Details Modal state
  const [viewingOrder, setViewingOrder] = useState<HubOrder | null>(null);

  // Fulfilment zone state (matching Products page)
  const [fulfilmentCity, setFulfilmentCity] = useState("Kannur, Kerala");
  const [fulfilmentRadius, setFulfilmentRadius] = useState(45);
  const [isEditingZone, setIsEditingZone] = useState(false);
  const [tempCity, setTempCity] = useState("Kannur, Kerala");
  const [tempRadius, setTempRadius] = useState(45);

  const stageRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node | null;
      if (stageRef.current && target && !stageRef.current.contains(target)) {
        setStageOpen(false);
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

  useEffect(() => {
    if (!openActionMenuId) return;
    function handleActionMenuOutside(e: MouseEvent | PointerEvent) {
      const target = e.target as HTMLElement | null;
      if (target && target.closest && target.closest("[data-order-actions]")) {
        return;
      }
      setOpenActionMenuId(null);
    }
    window.addEventListener("pointerdown", handleActionMenuOutside);
    return () => window.removeEventListener("pointerdown", handleActionMenuOutside);
  }, [openActionMenuId]);

  // Operational metrics
  const newRequestsCount = useMemo(
    () => orders.filter((o) => o.status === "REQUEST" || o.status === "REVIEWING").length,
    [orders]
  );
  const activeOrdersCount = useMemo(
    () => orders.filter((o) => o.status === "QUOTED" || o.status === "CONFIRMED" || o.status === "PREPARING" || o.status === "DISPATCHED").length,
    [orders]
  );
  const activeValueLakhs = useMemo(() => {
    const activeOrders = orders.filter(
      (o) => o.status === "QUOTED" || o.status === "CONFIRMED" || o.status === "PREPARING" || o.status === "DISPATCHED"
    );
    const sum = activeOrders.reduce((acc, o) => acc + (o.finalValue || o.estimatedValue), 0);
    return (sum / 100000).toFixed(1);
  }, [orders]);
  const needAttentionCount = useMemo(
    () => orders.filter((o) => o.needsAttention).length,
    [orders]
  );

  // Filtered orders
  const filteredOrders = useMemo(() => {
    let list = orders.filter((order) => {
      // Workflow Tab Filter
      if (selectedWorkflowTab === "REQUESTS") {
        if (order.status !== "REQUEST" && order.status !== "REVIEWING" && order.status !== "QUOTED") return false;
      } else if (selectedWorkflowTab === "ACTIVE") {
        if (order.status !== "CONFIRMED" && order.status !== "PREPARING" && order.status !== "DISPATCHED") return false;
      } else if (selectedWorkflowTab === "COMPLETED") {
        if (order.status !== "COMPLETED") return false;
      } else if (selectedWorkflowTab === "ATTENTION") {
        if (!order.needsAttention) return false;
      }

      // Status Filter
      if (statusFilter !== "ALL" && order.status !== statusFilter) {
        return false;
      }

      // Search Query
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase();
        const matchesId = order.id.toLowerCase().includes(q);
        const matchesProj = order.project.toLowerCase().includes(q);
        const matchesCust = order.customer.toLowerCase().includes(q);
        const matchesItems = order.items.some((i) => i.name.toLowerCase().includes(q));
        if (!matchesId && !matchesProj && !matchesCust && !matchesItems) return false;
      }

      return true;
    });

    // Sorting
    if (sortBy === "value_desc") {
      list.sort((a, b) => (b.finalValue || b.estimatedValue) - (a.finalValue || a.estimatedValue));
    } else if (sortBy === "value_asc") {
      list.sort((a, b) => (a.finalValue || a.estimatedValue) - (b.finalValue || b.estimatedValue));
    } else if (sortBy === "project") {
      list.sort((a, b) => a.project.localeCompare(b.project));
    }

    return list;
  }, [orders, selectedWorkflowTab, statusFilter, searchQuery, sortBy]);

  const getStatusPillConfig = (st: HubOrderStatus) => {
    switch (st) {
      case "REQUEST":
        return { label: "New Request", bg: "#fef3c7", color: "#92400e", border: "#fde68a" };
      case "REVIEWING":
        return { label: "Needs Review", bg: "#e0e7ff", color: "#3730a3", border: "#c7d2fe" };
      case "QUOTED":
        return { label: "Quoted", bg: "#f3e8ff", color: "#6b21a8", border: "#e9d5ff" };
      case "CONFIRMED":
        return { label: "Confirmed", bg: "#dbeafe", color: "#1e40af", border: "#bfdbfe" };
      case "PREPARING":
        return { label: "Preparing", bg: "#ffedd5", color: "#9a3412", border: "#fed7aa" };
      case "DISPATCHED":
        return { label: "Dispatched", bg: "#e0f2fe", color: "#0369a1", border: "#bae6fd" };
      case "COMPLETED":
        return { label: "Completed", bg: "#ecfdf5", color: "#065f46", border: "#a7f3d0" };
      default:
        return { label: st, bg: "#f1f5f9", color: "#475569", border: "#e2e8f0" };
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "14px",
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      {/* 1. Header Section: Title + Subtitle on Left | Add / Create Order CTA on Right */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "16px",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "baseline", gap: "8px", flexWrap: "wrap" }}>
            <h1
              style={{
                fontSize: "20px",
                fontWeight: 750,
                color: "#0f172a",
                letterSpacing: "-0.02em",
                margin: 0,
                lineHeight: 1.2,
              }}
            >
              Orders
            </h1>
            <span style={{ fontSize: "14px", fontWeight: 600, color: "#475569" }}>
              · Active Requisitions & Demands
            </span>
          </div>
          <p style={{ margin: "2px 0 0", fontSize: "13px", color: "#64748b" }}>
            Incoming material requirements from site managers and contractors with stock allocation, quoting, and delivery dispatches.
          </p>
        </div>
      </div>

      {/* 2. Top Row: Fulfilment Zone Pill on Left + Search Pill & Filter Buttons on Right */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        {/* Left: Fulfilment Zone Pill */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "9px",
            height: "32px",
            padding: "0 4px 0 12px",
            backgroundColor: "#f1f5f9",
            borderRadius: "9999px",
            fontSize: "12px",
            color: "#475569",
            boxSizing: "border-box",
            flex: 1,
            minWidth: 0,
          }}
        >
          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", minWidth: 0 }}>
            <LocationDuotoneIcon size={16} style={{ flexShrink: 0, color: "#2563eb" }} />
            <span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", color: "#64748b" }}>
              Fulfilment Zone:
            </span>
            <span style={{ fontWeight: 600, color: "#0f172a", whiteSpace: "nowrap" }}>
              {fulfilmentCity} · {fulfilmentRadius} km
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              setTempCity(fulfilmentCity);
              setTempRadius(fulfilmentRadius);
              setIsEditingZone(true);
            }}
            style={{
              marginLeft: "auto",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "4px",
              height: "24px",
              padding: "0 10px",
              borderRadius: "9999px",
              border: "none",
              backgroundColor: "#ffffff",
              color: "#0f172a",
              fontSize: "11.5px",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 140ms ease",
              flexShrink: 0,
              boxShadow: "0 1px 2px rgba(15, 23, 42, 0.06)",
            }}
          >
            <EditDuotoneIcon size={12} />
            <span>Edit</span>
          </button>
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
              placeholder="Search orders, projects, materials..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
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
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* Action Filter Button: Stage */}
          <div ref={stageRef} style={{ position: "relative" }}>
            <button
              type="button"
              onClick={() => {
                setStageOpen(!stageOpen);
                setStatusOpen(false);
                setSortOpen(false);
              }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                height: "32px",
                padding: "0 11px",
                borderRadius: "9999px",
                border: "none",
                backgroundColor: selectedWorkflowTab !== "ALL" || stageOpen ? "#0f172a" : "#f1f5f9",
                color: selectedWorkflowTab !== "ALL" || stageOpen ? "#ffffff" : "#475569",
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 140ms ease",
                whiteSpace: "nowrap",
              }}
            >
              <span>
                {selectedWorkflowTab === "ALL"
                  ? "Workflow Stage"
                  : WORKFLOW_TABS.find((t) => t.id === selectedWorkflowTab)?.label || "Stage"}
              </span>
              <ChevronDown
                size={12}
                style={{
                  transform: stageOpen ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 140ms ease",
                }}
              />
            </button>

            {stageOpen && (
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
                {WORKFLOW_TABS.map((tab) => {
                  const isSelected = selectedWorkflowTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => {
                        setSelectedWorkflowTab(tab.id);
                        setStageOpen(false);
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
                      <span>{tab.label}</span>
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
                setStageOpen(false);
                setStatusOpen(false);
              }}
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
                  : sortBy === "value_desc"
                  ? "Value: High to Low"
                  : sortBy === "value_asc"
                  ? "Value: Low to High"
                  : "Project Name"}
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
                  width: "180px",
                  backgroundColor: "#ffffff",
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 8px 24px -4px rgba(15, 23, 42, 0.12)",
                  padding: "4px",
                  zIndex: 50,
                }}
              >
                {[
                  { id: "default", label: "Default Order" },
                  { id: "value_desc", label: "Value: High to Low" },
                  { id: "value_asc", label: "Value: Low to High" },
                  { id: "project", label: "Project Name (A-Z)" },
                ].map((s) => {
                  const isSelected = sortBy === s.id;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => {
                        setSortBy(s.id as typeof sortBy);
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

      {/* 3. Operational Top Metrics (4 Cards) */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
          gap: "10px",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        {/* Metric 1: New Requests */}
        <div
          onClick={() => setSelectedWorkflowTab("REQUESTS")}
          style={{
            backgroundColor: selectedWorkflowTab === "REQUESTS" ? "#f8faff" : "#ffffff",
            borderRadius: "14px",
            padding: "9px 12px",
            border: selectedWorkflowTab === "REQUESTS" ? "1px solid #2563eb" : "1px solid #e2e8f0",
            boxShadow: "0 1px 2px rgba(15, 23, 42, 0.03)",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            cursor: "pointer",
            minWidth: 0,
            transition: "all 140ms ease",
          }}
        >
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              backgroundColor: "#fef3c7",
              display: "grid",
              placeItems: "center",
              color: "#b45309",
              flexShrink: 0,
            }}
          >
            <MetricBoxDuotoneIcon size={18} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", minWidth: 0, gap: "1px" }}>
            <span style={{ fontSize: "16px", fontWeight: 700, color: "#0f172a", letterSpacing: "-0.02em", lineHeight: 1.1 }}>
              {newRequestsCount}
            </span>
            <span style={{ fontSize: "11.5px", color: "#64748b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              New Requests
            </span>
          </div>
        </div>

        {/* Metric 2: Active Orders */}
        <div
          onClick={() => setSelectedWorkflowTab("ACTIVE")}
          style={{
            backgroundColor: selectedWorkflowTab === "ACTIVE" ? "#f8faff" : "#ffffff",
            borderRadius: "14px",
            padding: "9px 12px",
            border: selectedWorkflowTab === "ACTIVE" ? "1px solid #2563eb" : "1px solid #e2e8f0",
            boxShadow: "0 1px 2px rgba(15, 23, 42, 0.03)",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            cursor: "pointer",
            minWidth: 0,
            transition: "all 140ms ease",
          }}
        >
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              backgroundColor: "#ecfdf5",
              display: "grid",
              placeItems: "center",
              color: "#059669",
              flexShrink: 0,
            }}
          >
            <MetricBuildingDuotoneIcon size={18} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", minWidth: 0, gap: "1px" }}>
            <span style={{ fontSize: "16px", fontWeight: 700, color: "#0f172a", letterSpacing: "-0.02em", lineHeight: 1.1 }}>
              {activeOrdersCount}
            </span>
            <span style={{ fontSize: "11.5px", color: "#64748b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              Active Orders
            </span>
          </div>
        </div>

        {/* Metric 3: Active Value */}
        <div
          onClick={() => setSelectedWorkflowTab("ACTIVE")}
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "14px",
            padding: "9px 12px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 1px 2px rgba(15, 23, 42, 0.03)",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            cursor: "pointer",
            minWidth: 0,
            transition: "all 140ms ease",
          }}
        >
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              backgroundColor: "#eff6ff",
              display: "grid",
              placeItems: "center",
              color: "#2563eb",
              flexShrink: 0,
            }}
          >
            <MetricLayersDuotoneIcon size={18} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", minWidth: 0, gap: "1px" }}>
            <span style={{ fontSize: "16px", fontWeight: 700, color: "#0f172a", letterSpacing: "-0.02em", lineHeight: 1.1 }}>
              ₹{activeValueLakhs}L
            </span>
            <span style={{ fontSize: "11.5px", color: "#64748b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              Active Value
            </span>
          </div>
        </div>

        {/* Metric 4: Need Attention */}
        <div
          onClick={() => setSelectedWorkflowTab("ATTENTION")}
          style={{
            backgroundColor: selectedWorkflowTab === "ATTENTION" ? "#fffbeb" : "#ffffff",
            borderRadius: "14px",
            padding: "9px 12px",
            border: selectedWorkflowTab === "ATTENTION" ? "1px solid #f59e0b" : "1px solid #e2e8f0",
            boxShadow: "0 1px 2px rgba(15, 23, 42, 0.03)",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            cursor: "pointer",
            minWidth: 0,
            transition: "all 140ms ease",
          }}
        >
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              backgroundColor: "#fff7ed",
              display: "grid",
              placeItems: "center",
              color: "#ea580c",
              flexShrink: 0,
            }}
          >
            <MetricClockDuotoneIcon size={18} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", minWidth: 0, gap: "1px" }}>
            <span style={{ fontSize: "16px", fontWeight: 700, color: "#0f172a", letterSpacing: "-0.02em", lineHeight: 1.1 }}>
              {needAttentionCount}
            </span>
            <span style={{ fontSize: "11.5px", color: "#64748b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              Need Attention
            </span>
          </div>
        </div>
      </div>

      {/* 4. Workflow Stage Pills */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          overflowX: "auto",
          scrollbarWidth: "none",
          paddingBottom: "2px",
        }}
      >
        {WORKFLOW_TABS.map((tab) => {
          const isSelected = selectedWorkflowTab === tab.id;
          const count =
            tab.id === "ALL"
              ? orders.length
              : tab.id === "REQUESTS"
              ? newRequestsCount
              : tab.id === "ACTIVE"
              ? activeOrdersCount
              : tab.id === "COMPLETED"
              ? orders.filter((o) => o.status === "COMPLETED").length
              : needAttentionCount;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedWorkflowTab(tab.id)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                height: "30px",
                padding: "0 12px",
                borderRadius: "9999px",
                border: "none",
                backgroundColor: isSelected ? "#0f172a" : "#f1f5f9",
                color: isSelected ? "#ffffff" : "#475569",
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 140ms ease",
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}
            >
              <span>{tab.label}</span>
              <span
                style={{
                  fontSize: "10.5px",
                  fontWeight: 700,
                  padding: "1px 6px",
                  borderRadius: "9999px",
                  backgroundColor: isSelected ? "rgba(255, 255, 255, 0.2)" : "#e2e8f0",
                  color: isSelected ? "#ffffff" : "#475569",
                }}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 5. Master Material & Requisition Orders Table (Borderless Direct Layout) */}
      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "8px" }}>
        {filteredOrders.length === 0 ? (
          <div style={{ padding: "48px 24px", textAlign: "center", color: "#64748b" }}>
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "14px",
                backgroundColor: "#f1f5f9",
                display: "grid",
                placeItems: "center",
                margin: "0 auto 12px",
                color: "#64748b",
              }}
            >
              <Package size={22} />
            </div>
            <h4 style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: "#0f172a" }}>
              No material orders found
            </h4>
            <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#64748b" }}>
              Try clearing filters or search terms to inspect all requisitions.
            </p>
          </div>
        ) : (
          <div style={{ overflowX: "auto", scrollbarWidth: "none", msOverflowStyle: "none" }}>
            <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0 4px", textAlign: "left", fontSize: "12.5px" }}>
              <thead>
                <tr style={{ backgroundColor: "#ffffff", color: "#94a3b8", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  <th style={{ padding: "10px 18px", borderBottom: "1px solid #f1f5f9", borderTopLeftRadius: "10px", borderBottomLeftRadius: "10px" }}>
                    Requisition / Order
                  </th>
                  <th style={{ padding: "10px 14px", borderBottom: "1px solid #f1f5f9" }}>
                    Project & Customer
                  </th>
                  <th style={{ padding: "10px 14px", borderBottom: "1px solid #f1f5f9" }}>
                    Materials Breakdown
                  </th>
                  <th style={{ padding: "10px 14px", borderBottom: "1px solid #f1f5f9" }}>
                    Order Value
                  </th>
                  <th style={{ padding: "10px 14px", borderBottom: "1px solid #f1f5f9" }}>
                    Required By
                  </th>
                  <th style={{ padding: "10px 14px", borderBottom: "1px solid #f1f5f9" }}>
                    Status
                  </th>
                  <th style={{ padding: "10px 16px", textAlign: "right", borderBottom: "1px solid #f1f5f9", borderTopRightRadius: "10px", borderBottomRightRadius: "10px" }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => {
                  const isSelected = order.id === selectedOrderId;
                  const statusPill = getStatusPillConfig(order.status);
                  const orderValue = order.finalValue || order.estimatedValue;

                  return (
                    <tr
                      key={order.id}
                      onClick={() => onSelectOrder(order)}
                      style={{
                        backgroundColor: isSelected ? "#eff6ff" : "transparent",
                        cursor: "pointer",
                        transition: "all 0.12s ease",
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) e.currentTarget.style.backgroundColor = "#f8fafc";
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) e.currentTarget.style.backgroundColor = "transparent";
                      }}
                    >
                      {/* 1. Order ID + Attention badge */}
                      <td style={{ padding: "12px 18px", verticalAlign: "middle", borderTopLeftRadius: "10px", borderBottomLeftRadius: "10px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "12px", fontWeight: 750, color: "#0f172a" }}>
                            {order.id}
                          </span>
                        </div>
                        {order.needsAttention && (
                          <div style={{ display: "inline-flex", alignItems: "center", gap: "3px", fontSize: "10.5px", color: "#d97706", fontWeight: 600, marginTop: "2px" }}>
                            <AlertTriangle size={11} />
                            <span>Attention Required</span>
                          </div>
                        )}
                      </td>

                      {/* 2. Project & Customer */}
                      <td style={{ padding: "12px 14px", verticalAlign: "middle" }}>
                        <div style={{ fontWeight: 650, color: "#0f172a" }}>{order.project}</div>
                        <div style={{ fontSize: "11.5px", color: "#64748b", marginTop: "1px" }}>
                          {order.customer}
                        </div>
                      </td>

                      {/* 3. Materials Breakdown */}
                      <td style={{ padding: "12px 14px", verticalAlign: "middle" }}>
                        <div style={{ fontWeight: 600, color: "#334155" }}>
                          {order.items.length} {order.items.length === 1 ? "Material Line" : "Material Lines"}
                        </div>
                        <div style={{ fontSize: "11px", color: "#94a3b8", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "220px" }}>
                          {order.items.map((i) => i.name).join(", ")}
                        </div>
                      </td>

                      {/* 4. Order Value */}
                      <td style={{ padding: "12px 14px", verticalAlign: "middle" }}>
                        <div style={{ fontSize: "13px", fontWeight: 750, color: "#0f172a" }}>
                          ₹{orderValue.toLocaleString("en-IN")}
                        </div>
                        <div style={{ fontSize: "10.5px", color: order.paymentStatus === "paid" ? "#059669" : "#64748b" }}>
                          {order.paymentStatus === "paid" ? "Paid in Full" : order.paymentStatus === "partially_paid" ? "50% Advance" : "Pending"}
                        </div>
                      </td>

                      {/* 5. Required By */}
                      <td style={{ padding: "12px 14px", verticalAlign: "middle", color: "#475569" }}>
                        {order.requiredBy}
                      </td>

                      {/* 6. Lifecycle Status Pill */}
                      <td style={{ padding: "12px 14px", verticalAlign: "middle" }}>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                            padding: "3px 8px",
                            borderRadius: "9999px",
                            fontSize: "11px",
                            fontWeight: 650,
                            backgroundColor: statusPill.bg,
                            color: statusPill.color,
                            border: `1px solid ${statusPill.border}`,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {statusPill.label}
                        </span>
                      </td>

                      {/* 7. Actions column */}
                      <td style={{ padding: "12px 16px", verticalAlign: "middle", textAlign: "right", borderTopRightRadius: "10px", borderBottomRightRadius: "10px" }} onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", position: "relative" }} data-order-actions>
                          <button
                            type="button"
                            onClick={() => setOpenActionMenuId(openActionMenuId === order.id ? null : order.id)}
                            style={{
                              width: "26px",
                              height: "26px",
                              borderRadius: "6px",
                              border: "none",
                              backgroundColor: openActionMenuId === order.id ? "#0f172a" : "#f1f5f9",
                              color: openActionMenuId === order.id ? "#ffffff" : "#64748b",
                              display: "grid",
                              placeItems: "center",
                              cursor: "pointer",
                            }}
                            aria-label="Order actions"
                          >
                            <MoreHorizontal size={13} />
                          </button>

                          {/* Action Menu Dropdown */}
                          {openActionMenuId === order.id && (
                            <div
                              style={{
                                position: "absolute",
                                top: "calc(100% + 4px)",
                                right: 0,
                                width: "160px",
                                backgroundColor: "#ffffff",
                                borderRadius: "10px",
                                border: "1px solid #e2e8f0",
                                boxShadow: "0 10px 25px -5px rgba(15, 23, 42, 0.12)",
                                padding: "4px",
                                zIndex: 60,
                                textAlign: "left",
                              }}
                            >
                              <button
                                type="button"
                                onClick={() => {
                                  setViewingOrder(order);
                                  setOpenActionMenuId(null);
                                }}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "6px",
                                  width: "100%",
                                  padding: "6px 8px",
                                  border: "none",
                                  background: "none",
                                  fontSize: "12px",
                                  color: "#334155",
                                  cursor: "pointer",
                                  borderRadius: "6px",
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f8fafc")}
                                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                              >
                                <EyeDuotoneIcon size={13} />
                                <span>View Order</span>
                              </button>

                              {order.status === "REQUEST" && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    onUpdateOrderStatus(order.id, "REVIEWING");
                                    setOpenActionMenuId(null);
                                  }}
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "6px",
                                    width: "100%",
                                    padding: "6px 8px",
                                    border: "none",
                                    background: "none",
                                    fontSize: "12px",
                                    color: "#334155",
                                    cursor: "pointer",
                                    borderRadius: "6px",
                                  }}
                                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f8fafc")}
                                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                                >
                                  <EditDuotoneIcon size={13} />
                                  <span>Mark Under Review</span>
                                </button>
                              )}

                              {order.status === "CONFIRMED" && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    onUpdateOrderStatus(order.id, "PREPARING");
                                    setOpenActionMenuId(null);
                                  }}
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "6px",
                                    width: "100%",
                                    padding: "6px 8px",
                                    border: "none",
                                    background: "none",
                                    fontSize: "12px",
                                    color: "#334155",
                                    cursor: "pointer",
                                    borderRadius: "6px",
                                  }}
                                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f8fafc")}
                                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                                >
                                  <BoxesDuotoneIcon size={13} />
                                  <span>Start Preparing</span>
                                </button>
                              )}

                              {order.status === "PREPARING" && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    onUpdateOrderStatus(order.id, "DISPATCHED");
                                    setOpenActionMenuId(null);
                                  }}
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "6px",
                                    width: "100%",
                                    padding: "6px 8px",
                                    border: "none",
                                    background: "none",
                                    fontSize: "12px",
                                    color: "#334155",
                                    cursor: "pointer",
                                    borderRadius: "6px",
                                  }}
                                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f8fafc")}
                                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                                >
                                  <Truck size={13} />
                                  <span>Dispatch Order</span>
                                </button>
                              )}

                              {onRemoveOrder && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    onRemoveOrder(order.id);
                                    setOpenActionMenuId(null);
                                  }}
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "6px",
                                    width: "100%",
                                    padding: "6px 8px",
                                    border: "none",
                                    background: "none",
                                    fontSize: "12px",
                                    color: "#ef4444",
                                    cursor: "pointer",
                                    borderRadius: "6px",
                                  }}
                                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#fef2f2")}
                                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                                >
                                  <Trash2 size={13} />
                                  <span>Remove Order</span>
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 6. POPUP MODAL: View Order Details (Kallisto Theme) */}
      {viewingOrder && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(15, 23, 42, 0.45)",
            backdropFilter: "blur(4px)",
            display: "grid",
            placeItems: "center",
            padding: "16px",
            zIndex: 110,
          }}
          onClick={() => setViewingOrder(null)}
        >
          <div
            style={{
              width: "580px",
              maxWidth: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
              backgroundColor: "#ffffff",
              borderRadius: "16px",
              padding: "22px",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              boxSizing: "border-box",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with Title, Status Pill, and Circular Close Button */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                  <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 750, color: "#0f172a" }}>
                    {viewingOrder.id} · {viewingOrder.project}
                  </h3>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      padding: "2px 8px",
                      borderRadius: "9999px",
                      fontSize: "11px",
                      fontWeight: 650,
                      backgroundColor: getStatusPillConfig(viewingOrder.status).bg,
                      color: getStatusPillConfig(viewingOrder.status).color,
                      border: `1px solid ${getStatusPillConfig(viewingOrder.status).border}`,
                    }}
                  >
                    {getStatusPillConfig(viewingOrder.status).label}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11.5px", color: "#64748b" }}>
                  <span>{viewingOrder.customer}</span>
                  <span>·</span>
                  <span>{viewingOrder.deliveryLocation}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setViewingOrder(null)}
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  border: "none",
                  backgroundColor: "#f1f5f9",
                  color: "#64748b",
                  cursor: "pointer",
                  display: "grid",
                  placeItems: "center",
                  flexShrink: 0,
                  transition: "all 120ms ease",
                }}
                aria-label="Close"
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#e2e8f0";
                  e.currentTarget.style.color = "#0f172a";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#f1f5f9";
                  e.currentTarget.style.color = "#64748b";
                }}
              >
                <X size={15} />
              </button>
            </div>

            {/* Overview Metric Boxes */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <div
                style={{
                  padding: "12px",
                  borderRadius: "10px",
                  border: "1px solid #e2e8f0",
                  backgroundColor: "#ffffff",
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px",
                }}
              >
                <span style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  Total Order Value
                </span>
                <span style={{ fontSize: "18px", fontWeight: 750, color: "#0f172a" }}>
                  ₹{(viewingOrder.finalValue || viewingOrder.estimatedValue).toLocaleString("en-IN")}
                </span>
                <span style={{ fontSize: "11px", color: viewingOrder.paymentStatus === "paid" ? "#059669" : "#64748b", fontWeight: 600 }}>
                  {viewingOrder.paymentStatus === "paid" ? "✓ Paid in Full" : viewingOrder.paymentStatus === "partially_paid" ? "50% Advance Received" : "Payment Pending"}
                </span>
              </div>

              <div
                style={{
                  padding: "12px",
                  borderRadius: "10px",
                  border: "1px solid #e2e8f0",
                  backgroundColor: "#ffffff",
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px",
                }}
              >
                <span style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  Required Schedule
                </span>
                <span style={{ fontSize: "14px", fontWeight: 700, color: "#0f172a", marginTop: "2px" }}>
                  {viewingOrder.requiredBy}
                </span>
                <span style={{ fontSize: "11px", color: "#64748b" }}>
                  Depot dispatch & crane offloading
                </span>
              </div>
            </div>

            {/* Materials Requirements Table */}
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                <span style={{ fontSize: "11.5px", fontWeight: 700, color: "#0f172a", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  Material Requirements ({viewingOrder.items.length} items)
                </span>
              </div>
              <div style={{ borderRadius: "10px", border: "1px solid #e2e8f0", overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px", textAlign: "left" }}>
                  <thead>
                    <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0", color: "#64748b", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                      <th style={{ padding: "8px 12px", fontWeight: 700 }}>Material</th>
                      <th style={{ padding: "8px 10px", fontWeight: 700 }}>Qty</th>
                      <th style={{ padding: "8px 10px", fontWeight: 700 }}>Depot Bay</th>
                      <th style={{ padding: "8px 10px", fontWeight: 700 }}>Rate</th>
                      <th style={{ padding: "8px 12px", fontWeight: 700, textAlign: "right" }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {viewingOrder.items.map((it) => (
                      <tr key={it.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                        <td style={{ padding: "8px 12px" }}>
                          <div style={{ fontWeight: 650, color: "#0f172a" }}>{it.name}</div>
                          {it.brand && <div style={{ fontSize: "10.5px", color: "#64748b" }}>OEM: {it.brand}</div>}
                        </td>
                        <td style={{ padding: "8px 10px", color: "#334155" }}>
                          {it.quantity} {it.unit}
                        </td>
                        <td style={{ padding: "8px 10px" }}>
                          <span style={{ fontFamily: "monospace", fontSize: "11px", backgroundColor: "#f1f5f9", padding: "2px 6px", borderRadius: "4px", color: "#334155" }}>
                            {it.bayLocation || "Bay A-01"}
                          </span>
                        </td>
                        <td style={{ padding: "8px 10px", color: "#334155" }}>
                          ₹{(it.quotedRate || it.estimatedRate).toLocaleString("en-IN")}
                        </td>
                        <td style={{ padding: "8px 12px", textAlign: "right", fontWeight: 700, color: "#0f172a" }}>
                          ₹{(it.quantity * (it.quotedRate || it.estimatedRate)).toLocaleString("en-IN")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal Footer */}
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "8px",
                paddingTop: "6px",
              }}
            >
              <button
                type="button"
                onClick={() => setViewingOrder(null)}
                style={{
                  padding: "7px 18px",
                  borderRadius: "9999px",
                  border: "1px solid #e2e8f0",
                  backgroundColor: "#ffffff",
                  color: "#0f172a",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 120ms ease",
                  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#f8fafc";
                  e.currentTarget.style.borderColor = "#cbd5e1";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#ffffff";
                  e.currentTarget.style.borderColor = "#e2e8f0";
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. EDIT FULFILMENT ZONE MODAL */}
      {isEditingZone && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(15, 23, 42, 0.5)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "20px",
          }}
          onClick={() => setIsEditingZone(false)}
        >
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "18px",
              width: "100%",
              maxWidth: "420px",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
              padding: "20px",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: "0 0 4px", fontSize: "16px", fontWeight: 750, color: "#0f172a" }}>
              Edit Selling & Fulfilment Zone
            </h3>
            <p style={{ margin: "0 0 16px", fontSize: "12px", color: "#64748b" }}>
              Define the operational dispatch radius for local contractor orders.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#334155", marginBottom: "4px" }}>
                  Hub Operating Location
                </label>
                <input
                  type="text"
                  value={tempCity}
                  onChange={(e) => setTempCity(e.target.value)}
                  style={{
                    width: "100%",
                    height: "36px",
                    padding: "0 10px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    fontSize: "13px",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#334155", marginBottom: "4px" }}>
                  Delivery Radius (km)
                </label>
                <input
                  type="number"
                  value={tempRadius}
                  onChange={(e) => setTempRadius(Number(e.target.value))}
                  style={{
                    width: "100%",
                    height: "36px",
                    padding: "0 10px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    fontSize: "13px",
                    boxSizing: "border-box",
                  }}
                />
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "18px" }}>
              <button
                type="button"
                onClick={() => setIsEditingZone(false)}
                style={{
                  padding: "8px 14px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  background: "#ffffff",
                  color: "#475569",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setFulfilmentCity(tempCity);
                  setFulfilmentRadius(tempRadius);
                  setIsEditingZone(false);
                }}
                style={{
                  padding: "8px 16px",
                  borderRadius: "8px",
                  border: "none",
                  background: "#0f172a",
                  color: "#ffffff",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer",
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
