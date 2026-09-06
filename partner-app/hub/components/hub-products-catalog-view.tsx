"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Package,
  Layers,
  Building,
  Building2,
  Tag,
  Clock,
  MapPin,
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  Boxes,
  LayoutGrid,
  Radar,
  Bookmark,
  Columns3,
  Briefcase,
  Star,
  Users,
  ChevronDown,
  ArrowUpDown,
  SlidersHorizontal,
  Check,
  X,
  MoreHorizontal,
  Trash2,
  Edit3,
  Plus,
  Eye,
  Archive,
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
import { ProductSKU, ProductCategory } from "../types/product-sku";

interface HubProductsCatalogViewProps {
  products: ProductSKU[];
  selectedProductId?: string | null;
  onSelectProduct?: (product: ProductSKU) => void;
  onOpenAddMaterials?: () => void;
  isAddMaterialsOpen?: boolean;
  onUpdateProduct?: (product: ProductSKU) => void;
  onRemoveProduct?: (productId: string) => void;
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

const CATEGORY_TABS: (ProductCategory | "All Products")[] = [
  "All Products",
  "Cement & Aggregates",
  "Steel & TMT",
  "Plumbing & Electrical",
  "Finishes & Tiles",
  "Masonry & Blocks",
  "Paints & Waterproofing",
  "Structural Hardware",
];

export function HubProductsCatalogView({
  products,
  selectedProductId,
  onSelectProduct,
  onOpenAddMaterials,
  isAddMaterialsOpen,
  onUpdateProduct,
  onRemoveProduct,
}: HubProductsCatalogViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | "All Products">("All Products");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "IN_STOCK" | "LOW_STOCK" | "NOT_AVAILABLE" | "AVAILABLE">("ALL");
  const [sortBy, setSortBy] = useState<"default" | "price_asc" | "price_desc" | "stock" | "brand">("default");

  // Dropdown open states
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  // Hover & Action states
  const [hoveredRowId, setHoveredRowId] = useState<string | null>(null);
  const [openActionMenuId, setOpenActionMenuId] = useState<string | null>(null);

  // View Product Details modal state
  const [viewingProductSku, setViewingProductSku] = useState<ProductSKU | null>(null);

  // Quick edit modal states
  const [editingPriceSku, setEditingPriceSku] = useState<ProductSKU | null>(null);
  const [newPriceValue, setNewPriceValue] = useState<string>("");

  const [editingInventorySku, setEditingInventorySku] = useState<ProductSKU | null>(null);
  const [newStockValue, setNewStockValue] = useState<string>("");
  const [newBayValue, setNewBayValue] = useState<string>("");

  const [editingSupplierSku, setEditingSupplierSku] = useState<ProductSKU | null>(null);
  const [newBrandValue, setNewBrandValue] = useState<string>("");

  const [editingDetailsSku, setEditingDetailsSku] = useState<ProductSKU | null>(null);
  const [newNameValue, setNewNameValue] = useState<string>("");
  const [newSpecValue, setNewSpecValue] = useState<string>("");

  // Selling & fulfilment zone states
  const [fulfilmentCity, setFulfilmentCity] = useState("Kannur, Kerala");
  const [fulfilmentRadius, setFulfilmentRadius] = useState(45);
  const [isEditingZone, setIsEditingZone] = useState(false);
  const [tempCity, setTempCity] = useState("Kannur, Kerala");
  const [tempRadius, setTempRadius] = useState(45);

  const categoryRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);
  const actionMenuRef = useRef<HTMLDivElement>(null);

  // Close filter dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node | null;
      if (categoryRef.current && target && !categoryRef.current.contains(target)) {
        setCategoryOpen(false);
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
      if (target && target.closest && target.closest("[data-sku-actions]")) {
        return;
      }
      setOpenActionMenuId(null);
    }
    window.addEventListener("pointerdown", handleActionMenuOutside);
    return () => window.removeEventListener("pointerdown", handleActionMenuOutside);
  }, [openActionMenuId]);

  const filteredProducts = useMemo(() => {
    const list = products.filter((p) => {
      const matchesCategory = selectedCategory === "All Products" || p.category === selectedCategory;
      const matchesSearch =
        searchQuery.trim() === "" ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.skuCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.specification.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "IN_STOCK" && p.status === "In Stock") ||
        (statusFilter === "LOW_STOCK" && p.status === "Low Stock") ||
        (statusFilter === "NOT_AVAILABLE" && p.status === "Not Available") ||
        (statusFilter === "AVAILABLE" && p.status === "Available");

      return matchesCategory && matchesSearch && matchesStatus;
    });

    if (sortBy === "price_asc") {
      return [...list].sort((a, b) => a.contractorPrice - b.contractorPrice);
    }
    if (sortBy === "price_desc") {
      return [...list].sort((a, b) => b.contractorPrice - a.contractorPrice);
    }
    if (sortBy === "stock") {
      return [...list].sort((a, b) => b.stockQty - a.stockQty);
    }
    if (sortBy === "brand") {
      return [...list].sort((a, b) => a.brand.localeCompare(b.brand));
    }
    return list;
  }, [products, searchQuery, selectedCategory, statusFilter, sortBy]);

  const activeCount = products.length;
  const inStockCount = products.filter((p) => p.status === "In Stock" || p.status === "Available" || (!p.status && p.stockQty > 20)).length;
  const lowStockCount = products.filter((p) => p.status === "Low Stock" || (!p.status && p.stockQty > 0 && p.stockQty <= 20)).length;
  const notAvailableCount = products.filter((p) => p.status === "Not Available" || p.stockQty === 0).length;

  return (
    <section style={{ display: "flex", flexDirection: "column", gap: "16px", minWidth: 0 }}>
      {/* 1. Header Title & "Add Materials" CTA Row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
          padding: "2px 0",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "3px", minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: "8px", flexWrap: "wrap" }}>
            <h1 style={{ margin: 0, fontSize: "22px", fontWeight: 700, color: "#0f172a", letterSpacing: "-0.02em" }}>
              Products
            </h1>
            <span style={{ fontSize: "14px", fontWeight: 600, color: "#475569" }}>
              · Your Kallisto Hub catalog
            </span>
          </div>
          <p style={{ margin: "2px 0 0", fontSize: "13px", color: "#64748b" }}>
            Materials you offer through Kallisto Hub, with pricing, availability, supplier and delivery information.
          </p>
        </div>

        {/* CTA Button to Trigger Odin Material Agent (Hidden while in onboarding view) */}
        {!isAddMaterialsOpen && (
          <button
            type="button"
            onClick={onOpenAddMaterials}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              height: "32px",
              padding: "0 14px",
              backgroundColor: "#ffffff",
              color: "#0f172a",
              border: "1px solid #e2e8f0",
              borderRadius: "9999px",
              fontSize: "12.5px",
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: "0 1px 3px rgba(15, 23, 42, 0.04), 0 1px 2px rgba(15, 23, 42, 0.02)",
              transition: "all 140ms ease",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#f8fafc";
              e.currentTarget.style.borderColor = "#cbd5e1";
              e.currentTarget.style.boxShadow = "0 2px 5px rgba(15, 23, 42, 0.06)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#ffffff";
              e.currentTarget.style.borderColor = "#e2e8f0";
              e.currentTarget.style.boxShadow = "0 1px 3px rgba(15, 23, 42, 0.04), 0 1px 2px rgba(15, 23, 42, 0.02)";
            }}
            aria-label="Add Product"
          >
            <StudioDuotoneIcon size={16} />
            <span>Add Product</span>
          </button>
        )}
      </div>

      {/* 2. Top Row: Location Pill on Left + Search Pill & Filter Action Buttons on Right (Borderless Kallisto Theme) */}
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
        {/* Left: Live Depot Telemetry Strip (Replacing Location Pill) */}
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
            minWidth: 0,
          }}
        >
          <div style={{ display: "inline-flex", alignItems: "center", gap: "10px", minWidth: 0, flexWrap: "nowrap" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
              <span style={{ fontWeight: 700, color: "#0f172a" }}>₹18.4L</span>
              <span>Catalog Value</span>
            </span>
            <span style={{ color: "#cbd5e1" }}>·</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
              <span style={{ fontWeight: 700, color: "#059669" }}>96%</span>
              <span>Price Accuracy</span>
            </span>
            <span style={{ color: "#cbd5e1" }}>·</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
              <span style={{ fontWeight: 700, color: "#2563eb" }}>4.2h</span>
              <span>Avg. Fulfilment</span>
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
            <span className="sr-only">Live Depot Inventory & Pricing Telemetry</span>
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
              placeholder="Search by SKU, product name, brand..."
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
                aria-label="Clear search"
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* Action Filter Button: Category */}
          <div ref={categoryRef} style={{ position: "relative" }}>
            <button
              type="button"
              onClick={() => {
                setCategoryOpen(!categoryOpen);
                setStatusOpen(false);
                setSortOpen(false);
              }}
              aria-label="Filter by Material Category"
              title="Filter by Material Category"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                height: "32px",
                padding: "0 11px",
                borderRadius: "9999px",
                border: "none",
                backgroundColor: selectedCategory !== "All Products" || categoryOpen ? "#0f172a" : "#f1f5f9",
                color: selectedCategory !== "All Products" || categoryOpen ? "#ffffff" : "#475569",
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 140ms ease",
                whiteSpace: "nowrap",
              }}
            >
              <span>{selectedCategory === "All Products" ? "Category" : selectedCategory.split(" ")[0]}</span>
              <ChevronDown
                size={12}
                style={{
                  transform: categoryOpen ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 140ms ease",
                }}
              />
            </button>

            {categoryOpen && (
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 4px)",
                  right: 0,
                  width: "210px",
                  backgroundColor: "#ffffff",
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 8px 24px -4px rgba(15, 23, 42, 0.12)",
                  padding: "4px",
                  zIndex: 50,
                }}
              >
                {CATEGORY_TABS.map((cat) => {
                  const isSelected = selectedCategory === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => {
                        setSelectedCategory(cat);
                        setCategoryOpen(false);
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
                      onMouseEnter={(e) => {
                        if (!isSelected) e.currentTarget.style.backgroundColor = "#f8fafc";
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) e.currentTarget.style.backgroundColor = "transparent";
                      }}
                    >
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {cat}
                      </span>
                      {isSelected && <Check size={13} color="#0f172a" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Action Filter Button: Stock Status */}
          <div ref={statusRef} style={{ position: "relative" }}>
            <button
              type="button"
              onClick={() => {
                setStatusOpen(!statusOpen);
                setCategoryOpen(false);
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
                backgroundColor: statusFilter !== "ALL" || statusOpen ? "#0f172a" : "#f1f5f9",
                color: statusFilter !== "ALL" || statusOpen ? "#ffffff" : "#475569",
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 140ms ease",
                whiteSpace: "nowrap",
              }}
            >
              <span>
                {statusFilter === "ALL"
                  ? "Status"
                  : statusFilter === "IN_STOCK"
                  ? "In Stock"
                  : statusFilter === "LOW_STOCK"
                  ? "Low Stock"
                  : statusFilter === "NOT_AVAILABLE"
                  ? "Not Available"
                  : "Available"}
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
                {[
                  { id: "ALL", label: "All Statuses" },
                  { id: "IN_STOCK", label: "In Stock" },
                  { id: "LOW_STOCK", label: "Low Stock" },
                  { id: "NOT_AVAILABLE", label: "Not Available" },
                  { id: "AVAILABLE", label: "Available" },
                ].map((st) => {
                  const isSelected = statusFilter === st.id;
                  return (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => {
                        setStatusFilter(st.id as typeof statusFilter);
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
                      onMouseEnter={(e) => {
                        if (!isSelected) e.currentTarget.style.backgroundColor = "#f8fafc";
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) e.currentTarget.style.backgroundColor = "transparent";
                      }}
                    >
                      <span>{st.label}</span>
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
                setCategoryOpen(false);
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
                  : sortBy === "price_asc"
                  ? "Price: Low"
                  : sortBy === "price_desc"
                  ? "Price: High"
                  : sortBy === "stock"
                  ? "Stock"
                  : "Brand"}
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
                  { id: "price_asc", label: "Price: Low to High" },
                  { id: "price_desc", label: "Price: High to Low" },
                  { id: "stock", label: "Highest Stock" },
                  { id: "brand", label: "Brand Name (A-Z)" },
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
                      onMouseEnter={(e) => {
                        if (!isSelected) e.currentTarget.style.backgroundColor = "#f8fafc";
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) e.currentTarget.style.backgroundColor = "transparent";
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

      {/* 3. Operational Top Metrics (Active Products, In Stock, Low Stock, Pending Approval) */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
          gap: "10px",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        {/* Metric 1: Active Products */}
        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "14px",
            padding: "9px 12px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 1px 2px rgba(15, 23, 42, 0.03)",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            minWidth: 0,
          }}
        >
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              backgroundColor: "#f1f5f9",
              display: "grid",
              placeItems: "center",
              color: "#0f172a",
              flexShrink: 0,
            }}
          >
            <MetricBoxDuotoneIcon size={18} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", minWidth: 0, gap: "1px" }}>
            <span
              style={{
                fontSize: "16px",
                fontWeight: 700,
                color: "#0f172a",
                letterSpacing: "-0.02em",
                lineHeight: 1.1,
              }}
            >
              {activeCount}
            </span>
            <span
              style={{
                fontSize: "11.5px",
                color: "#64748b",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              Active Products
            </span>
          </div>
        </div>

        {/* Metric 2: In Stock */}
        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "14px",
            padding: "9px 12px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 1px 2px rgba(15, 23, 42, 0.03)",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            minWidth: 0,
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
            <span
              style={{
                fontSize: "16px",
                fontWeight: 700,
                color: "#0f172a",
                letterSpacing: "-0.02em",
                lineHeight: 1.1,
              }}
            >
              {inStockCount}
            </span>
            <span
              style={{
                fontSize: "11.5px",
                color: "#64748b",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              In Stock
            </span>
          </div>
        </div>

        {/* Metric 3: Low Stock */}
        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "14px",
            padding: "9px 12px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 1px 2px rgba(15, 23, 42, 0.03)",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            minWidth: 0,
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
            <span
              style={{
                fontSize: "16px",
                fontWeight: 700,
                color: "#0f172a",
                letterSpacing: "-0.02em",
                lineHeight: 1.1,
              }}
            >
              {lowStockCount}
            </span>
            <span
              style={{
                fontSize: "11.5px",
                color: "#64748b",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              Low Stock
            </span>
          </div>
        </div>

        {/* Metric 4: Not Available / Out of Stock */}
        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "14px",
            padding: "9px 12px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 1px 2px rgba(15, 23, 42, 0.03)",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            minWidth: 0,
          }}
        >
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              backgroundColor: "#fef2f2",
              display: "grid",
              placeItems: "center",
              color: "#dc2626",
              flexShrink: 0,
            }}
          >
            <MetricLayersDuotoneIcon size={18} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", minWidth: 0, gap: "1px" }}>
            <span
              style={{
                fontSize: "16px",
                fontWeight: 700,
                color: "#0f172a",
                letterSpacing: "-0.02em",
                lineHeight: 1.1,
              }}
            >
              {notAvailableCount}
            </span>
            <span
              style={{
                fontSize: "11.5px",
                color: "#64748b",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              Not Available
            </span>
          </div>
        </div>
      </div>



      {/* Catalog Table (Borderless Direct Layout) */}
      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "8px" }}>
        {filteredProducts.length === 0 ? (
          <div style={{ padding: "48px 24px", textAlign: "center", color: "#64748b" }}>
            <Boxes size={36} style={{ margin: "0 auto 12px", color: "#cbd5e1" }} />
            <h4 style={{ margin: "0 0 4px", fontSize: "15px", color: "#1e293b" }}>No matching SKUs found in your catalog</h4>
            <p style={{ margin: 0, fontSize: "13px" }}>Try searching with a different keyword or onboard new materials with Odin.</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto", scrollbarWidth: "none", msOverflowStyle: "none" }}>
            <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0 4px", textAlign: "left", fontSize: "13px" }}>
              <thead>
                <tr style={{ backgroundColor: "#ffffff", color: "#94a3b8", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  <th style={{ padding: "10px 18px", borderBottom: "1px solid #f1f5f9" }}>PRODUCT</th>
                  <th style={{ padding: "10px 14px", borderBottom: "1px solid #f1f5f9" }}>CATEGORY</th>
                  <th style={{ padding: "10px 14px", borderBottom: "1px solid #f1f5f9" }}>STATUS</th>
                  <th style={{ padding: "10px 14px", borderBottom: "1px solid #f1f5f9" }}>YOUR UNIT PRICE</th>
                  <th style={{ padding: "10px 14px", borderBottom: "1px solid #f1f5f9" }}>AVAILABILITY</th>
                  <th style={{ padding: "10px 14px", borderBottom: "1px solid #f1f5f9" }}>BRAND / SUPPLIER</th>
                  <th style={{ padding: "10px 16px", textAlign: "right", borderBottom: "1px solid #f1f5f9" }}></th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((p) => {
                  const isLow = p.status === "Low Stock";
                  const isActionOpen = openActionMenuId === p.id;
                  const isSelected = selectedProductId === p.id;
                  const isHovered = hoveredRowId === p.id;
                  return (
                    <tr
                      key={p.id}
                      style={{
                        backgroundColor: isSelected ? "#f1f5f9" : isHovered ? "#f8fafc" : "transparent",
                        transition: "all 0.12s ease",
                        cursor: "pointer",
                      }}
                      onClick={() => onSelectProduct?.(p)}
                      onMouseEnter={() => setHoveredRowId(p.id)}
                      onMouseLeave={() => setHoveredRowId(null)}
                    >
                      {/* 1:1 Image + Product Title + Badge + Spec */}
                      <td
                        style={{
                          padding: "12px 18px",
                          maxWidth: "300px",
                          borderTopLeftRadius: "10px",
                          borderBottomLeftRadius: "10px",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          {/* 1:1 Square Image Thumbnail */}
                          <div
                            style={{
                              width: "36px",
                              height: "36px",
                              borderRadius: "8px",
                              overflow: "hidden",
                              backgroundColor: "#ffffff",
                              border: "1px solid #e2e8f0",
                              flexShrink: 0,
                              display: "grid",
                              placeItems: "center",
                              boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04)",
                            }}
                          >
                            {p.imageUrl ? (
                              <img
                                src={p.imageUrl}
                                alt={p.name}
                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                              />
                            ) : (
                              <Package size={17} color="#6366f1" />
                            )}
                          </div>

                          <div style={{ display: "flex", flexDirection: "column", gap: "2px", minWidth: 0 }}>
                            <span
                              style={{
                                fontWeight: isSelected ? 700 : 600,
                                color: "#0f172a",
                                fontSize: "13px",
                                lineHeight: "1.3",
                              }}
                            >
                              {p.name}
                            </span>
                            <span style={{ fontWeight: 500, color: "#64748b", fontFamily: "monospace", fontSize: "11px" }}>
                              {p.skuCode}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td style={{ padding: "12px 14px", color: "#334155", fontSize: "12.5px", fontWeight: 500 }}>
                        {p.category}
                      </td>

                      {/* Status Badge (In Stock, Low Stock, Not Available, Available) */}
                      <td style={{ padding: "12px 14px" }}>
                        {(() => {
                          const status = p.status || (p.stockQty === 0 ? "Not Available" : isLow ? "Low Stock" : "In Stock");

                          let bg = "#ecfdf5";
                          let color = "#15803d";

                          if (status === "Low Stock") {
                            bg = "#fffbeb";
                            color = "#b45309";
                          } else if (status === "Not Available") {
                            bg = "#fef2f2";
                            color = "#b91c1c";
                          } else if (status === "Available") {
                            bg = "#eff6ff";
                            color = "#2563eb";
                          } else {
                            // "In Stock"
                            bg = "#ecfdf5";
                            color = "#15803d";
                          }

                          return (
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                padding: "3px 8px",
                                borderRadius: "9999px",
                                fontSize: "11.5px",
                                fontWeight: 600,
                                backgroundColor: bg,
                                color: color,
                                whiteSpace: "nowrap",
                              }}
                            >
                              {status}
                            </span>
                          );
                        })()}
                      </td>

                      {/* Pricing */}
                      <td style={{ padding: "12px 14px" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
                          <span style={{ fontWeight: 600, color: "#0f172a", fontSize: "13px" }}>
                            ₹{p.contractorPrice.toLocaleString("en-IN")}
                          </span>
                          <span style={{ fontSize: "11px", color: "#94a3b8" }}>
                            / {p.unit}
                          </span>
                        </div>
                      </td>

                      {/* Stock & Bay */}
                      <td style={{ padding: "12px 14px" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
                          <span style={{ fontWeight: 500, color: isLow ? "#2563eb" : "#334155", fontSize: "12px" }}>
                            {p.stockQty} {p.unit.split(" ")[0]}
                          </span>
                          <span style={{ fontSize: "11px", color: "#94a3b8" }}>
                            {p.depotBay.split("(")[0].trim()} · {p.leadTime}
                          </span>
                        </div>
                      </td>

                      {/* Brand Avatar & Name */}
                      <td style={{ padding: "12px 14px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                          <div
                            style={{
                              width: "24px",
                              height: "24px",
                              borderRadius: "50%",
                              backgroundColor: "#f1f5f9",
                              color: "#475569",
                              fontSize: "10px",
                              fontWeight: 700,
                              display: "grid",
                              placeItems: "center",
                              flexShrink: 0,
                            }}
                          >
                            {p.brand.slice(0, 2).toUpperCase()}
                          </div>
                          <span style={{ fontSize: "12px", fontWeight: 500, color: "#334155" }}>
                            {p.brand}
                          </span>
                        </div>
                      </td>

                      {/* Secondary Action Menu Trigger (•••) & Floating Menu */}
                      <td
                        style={{
                          padding: "12px 16px",
                          textAlign: "right",
                          position: "relative",
                          borderTopRightRadius: "10px",
                          borderBottomRightRadius: "10px",
                        }}
                      >
                        <div
                          data-sku-actions="true"
                          style={{ position: "relative", display: "inline-block" }}
                          ref={isActionOpen ? actionMenuRef : undefined}
                        >
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenActionMenuId(isActionOpen ? null : p.id);
                            }}
                            style={{
                              width: "28px",
                              height: "28px",
                              border: "none",
                              backgroundColor: isActionOpen ? "#f1f5f9" : "transparent",
                              color: isActionOpen ? "#0f172a" : "#64748b",
                              borderRadius: "6px",
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              transition: "all 140ms ease",
                            }}
                            title="More options"
                            aria-label={`Options for ${p.name}`}
                          >
                            <MoreHorizontal size={16} />
                          </button>

                          {/* Dropdown Menu Popup with Specifications & Actions */}
                          {isActionOpen && (
                            <div
                              onClick={(e) => e.stopPropagation()}
                              style={{
                                position: "absolute",
                                right: 0,
                                top: "calc(100% + 4px)",
                                width: "230px",
                                backgroundColor: "#ffffff",
                                borderRadius: "12px",
                                border: "1px solid #e2e8f0",
                                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.08)",
                                padding: "6px",
                                zIndex: 60,
                                textAlign: "left",
                              }}
                            >
                              {/* Action Items */}
                              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setViewingProductSku(p);
                                    setOpenActionMenuId(null);
                                  }}
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                    width: "100%",
                                    padding: "7px 10px",
                                    borderRadius: "6px",
                                    border: "none",
                                    backgroundColor: "transparent",
                                    color: "#1e293b",
                                    fontSize: "12px",
                                    fontWeight: 500,
                                    cursor: "pointer",
                                    textAlign: "left",
                                    transition: "background-color 0.12s ease",
                                  }}
                                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f1f5f9")}
                                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                                >
                                  <EyeDuotoneIcon size={15} style={{ color: "#2563eb", flexShrink: 0 }} />
                                  <span>View Product</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingDetailsSku(p);
                                    setNewNameValue(p.name);
                                    setNewSpecValue(p.specification);
                                    setOpenActionMenuId(null);
                                  }}
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                    width: "100%",
                                    padding: "7px 10px",
                                    borderRadius: "6px",
                                    border: "none",
                                    backgroundColor: "transparent",
                                    color: "#1e293b",
                                    fontSize: "12px",
                                    fontWeight: 500,
                                    cursor: "pointer",
                                    textAlign: "left",
                                    transition: "background-color 0.12s ease",
                                  }}
                                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f1f5f9")}
                                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                                >
                                  <EditDuotoneIcon size={14} style={{ color: "#64748b", flexShrink: 0 }} />
                                  <span>Edit</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingPriceSku(p);
                                    setNewPriceValue(p.contractorPrice.toString());
                                    setOpenActionMenuId(null);
                                  }}
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                    width: "100%",
                                    padding: "7px 10px",
                                    borderRadius: "6px",
                                    border: "none",
                                    backgroundColor: "transparent",
                                    color: "#1e293b",
                                    fontSize: "12px",
                                    fontWeight: 500,
                                    cursor: "pointer",
                                    textAlign: "left",
                                    transition: "background-color 0.12s ease",
                                  }}
                                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f1f5f9")}
                                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                                >
                                  <TagDuotoneIcon size={15} style={{ color: "#2563eb", flexShrink: 0 }} />
                                  <span>Update Price</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingInventorySku(p);
                                    setNewStockValue(p.stockQty.toString());
                                    setNewBayValue(p.depotBay);
                                    setOpenActionMenuId(null);
                                  }}
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                    width: "100%",
                                    padding: "7px 10px",
                                    borderRadius: "6px",
                                    border: "none",
                                    backgroundColor: "transparent",
                                    color: "#1e293b",
                                    fontSize: "12px",
                                    fontWeight: 500,
                                    cursor: "pointer",
                                    textAlign: "left",
                                    transition: "background-color 0.12s ease",
                                  }}
                                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f1f5f9")}
                                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                                >
                                  <BoxesDuotoneIcon size={15} style={{ color: "#059669", flexShrink: 0 }} />
                                  <span>Update Inventory</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingSupplierSku(p);
                                    setNewBrandValue(p.brand);
                                    setOpenActionMenuId(null);
                                  }}
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                    width: "100%",
                                    padding: "7px 10px",
                                    borderRadius: "6px",
                                    border: "none",
                                    backgroundColor: "transparent",
                                    color: "#1e293b",
                                    fontSize: "12px",
                                    fontWeight: 500,
                                    cursor: "pointer",
                                    textAlign: "left",
                                    transition: "background-color 0.12s ease",
                                  }}
                                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f1f5f9")}
                                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                                >
                                  <SupplierDuotoneIcon size={15} style={{ color: "#d97706", flexShrink: 0 }} />
                                  <span>Change Supplier</span>
                                </button>

                                <div style={{ height: "1px", backgroundColor: "#f1f5f9", margin: "4px 0" }} />

                                <button
                                  type="button"
                                  onClick={() => {
                                    onRemoveProduct?.(p.id);
                                    setOpenActionMenuId(null);
                                  }}
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                    width: "100%",
                                    padding: "7px 10px",
                                    borderRadius: "6px",
                                    border: "none",
                                    backgroundColor: "transparent",
                                    color: "#e11d48",
                                    fontSize: "12px",
                                    fontWeight: 500,
                                    cursor: "pointer",
                                    textAlign: "left",
                                    transition: "background-color 0.12s ease",
                                  }}
                                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#fff1f2")}
                                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                                >
                                  <ArchiveDuotoneIcon size={15} style={{ color: "#e11d48", flexShrink: 0 }} />
                                  <span>Archive</span>
                                </button>
                              </div>
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

      {/* Quick Modal: Change Unit Price */}
      {editingPriceSku && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(15, 23, 42, 0.4)",
            backdropFilter: "blur(4px)",
            display: "grid",
            placeItems: "center",
            zIndex: 100,
          }}
          onClick={() => setEditingPriceSku(null)}
        >
          <div
            style={{
              width: "360px",
              backgroundColor: "#ffffff",
              borderRadius: "16px",
              padding: "20px",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.15)",
              display: "flex",
              flexDirection: "column",
              gap: "14px",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "#0f172a" }}>
                Update Contractor Price
              </h3>
              <button
                type="button"
                onClick={() => setEditingPriceSku(null)}
                style={{ border: "none", background: "transparent", cursor: "pointer", color: "#94a3b8" }}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ fontSize: "12px", color: "#64748b" }}>
              Set the updated rate for <strong>{editingPriceSku.name}</strong> ({editingPriceSku.unit}):
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "16px", fontWeight: 700, color: "#0f172a" }}>₹</span>
              <input
                type="number"
                value={newPriceValue}
                onChange={(e) => setNewPriceValue(e.target.value)}
                style={{
                  flex: 1,
                  height: "36px",
                  padding: "0 12px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "#0f172a",
                  outline: "none",
                }}
                autoFocus
              />
              <span style={{ fontSize: "12px", color: "#64748b" }}>/ {editingPriceSku.unit}</span>
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "8px", marginTop: "4px" }}>
              <button
                type="button"
                onClick={() => setEditingPriceSku(null)}
                style={{
                  height: "32px",
                  padding: "0 14px",
                  borderRadius: "9999px",
                  border: "1px solid #e2e8f0",
                  backgroundColor: "#ffffff",
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "#64748b",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const val = parseFloat(newPriceValue);
                  if (!isNaN(val) && val > 0) {
                    onUpdateProduct?.({
                      ...editingPriceSku,
                      contractorPrice: val,
                    });
                  }
                  setEditingPriceSku(null);
                }}
                style={{
                  height: "32px",
                  padding: "0 16px",
                  borderRadius: "9999px",
                  border: "none",
                  backgroundColor: "#0f172a",
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "#ffffff",
                  cursor: "pointer",
                }}
              >
                Save Price
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Modal: Edit Product Details */}
      {editingDetailsSku && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(15, 23, 42, 0.4)",
            backdropFilter: "blur(4px)",
            display: "grid",
            placeItems: "center",
            zIndex: 100,
          }}
          onClick={() => setEditingDetailsSku(null)}
        >
          <div
            style={{
              width: "380px",
              backgroundColor: "#ffffff",
              borderRadius: "16px",
              padding: "20px",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.15)",
              display: "flex",
              flexDirection: "column",
              gap: "14px",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "#0f172a" }}>
                Edit Product Details
              </h3>
              <button
                type="button"
                onClick={() => setEditingDetailsSku(null)}
                style={{ border: "none", background: "transparent", cursor: "pointer", color: "#94a3b8" }}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "11px", fontWeight: 600, color: "#64748b" }}>Product Name</label>
              <input
                type="text"
                value={newNameValue}
                onChange={(e) => setNewNameValue(e.target.value)}
                style={{
                  height: "36px",
                  padding: "0 12px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "#0f172a",
                  outline: "none",
                }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "11px", fontWeight: 600, color: "#64748b" }}>Material Specification</label>
              <input
                type="text"
                value={newSpecValue}
                onChange={(e) => setNewSpecValue(e.target.value)}
                style={{
                  height: "36px",
                  padding: "0 12px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "13px",
                  color: "#0f172a",
                  outline: "none",
                }}
              />
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "8px", marginTop: "4px" }}>
              <button
                type="button"
                onClick={() => setEditingDetailsSku(null)}
                style={{
                  height: "32px",
                  padding: "0 14px",
                  borderRadius: "9999px",
                  border: "1px solid #e2e8f0",
                  backgroundColor: "#ffffff",
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "#64748b",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (newNameValue.trim()) {
                    onUpdateProduct?.({
                      ...editingDetailsSku,
                      name: newNameValue.trim(),
                      specification: newSpecValue.trim() || editingDetailsSku.specification,
                    });
                  }
                  setEditingDetailsSku(null);
                }}
                style={{
                  height: "32px",
                  padding: "0 16px",
                  borderRadius: "9999px",
                  border: "none",
                  backgroundColor: "#0f172a",
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "#ffffff",
                  cursor: "pointer",
                }}
              >
                Save Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Modal: Update Inventory */}
      {editingInventorySku && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(15, 23, 42, 0.4)",
            backdropFilter: "blur(4px)",
            display: "grid",
            placeItems: "center",
            zIndex: 100,
          }}
          onClick={() => setEditingInventorySku(null)}
        >
          <div
            style={{
              width: "360px",
              backgroundColor: "#ffffff",
              borderRadius: "16px",
              padding: "20px",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.15)",
              display: "flex",
              flexDirection: "column",
              gap: "14px",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "#0f172a" }}>
                Update Inventory & Bay
              </h3>
              <button
                type="button"
                onClick={() => setEditingInventorySku(null)}
                style={{ border: "none", background: "transparent", cursor: "pointer", color: "#94a3b8" }}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "11px", fontWeight: 600, color: "#64748b" }}>
                Stock Quantity ({editingInventorySku.unit})
              </label>
              <input
                type="number"
                value={newStockValue}
                onChange={(e) => setNewStockValue(e.target.value)}
                style={{
                  height: "36px",
                  padding: "0 12px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "#0f172a",
                  outline: "none",
                }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "11px", fontWeight: 600, color: "#64748b" }}>Depot Bay Location</label>
              <input
                type="text"
                value={newBayValue}
                onChange={(e) => setNewBayValue(e.target.value)}
                style={{
                  height: "36px",
                  padding: "0 12px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "13px",
                  color: "#0f172a",
                  outline: "none",
                }}
              />
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "8px", marginTop: "4px" }}>
              <button
                type="button"
                onClick={() => setEditingInventorySku(null)}
                style={{
                  height: "32px",
                  padding: "0 14px",
                  borderRadius: "9999px",
                  border: "1px solid #e2e8f0",
                  backgroundColor: "#ffffff",
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "#64748b",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const qty = parseInt(newStockValue, 10);
                  if (!isNaN(qty) && qty >= 0) {
                    onUpdateProduct?.({
                      ...editingInventorySku,
                      stockQty: qty,
                      depotBay: newBayValue.trim() || editingInventorySku.depotBay,
                      status: qty <= editingInventorySku.reorderLevel ? "Low Stock" : "In Stock",
                    });
                  }
                  setEditingInventorySku(null);
                }}
                style={{
                  height: "32px",
                  padding: "0 16px",
                  borderRadius: "9999px",
                  border: "none",
                  backgroundColor: "#059669",
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "#ffffff",
                  cursor: "pointer",
                }}
              >
                Save Inventory
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Modal: Change Supplier */}
      {editingSupplierSku && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(15, 23, 42, 0.4)",
            backdropFilter: "blur(4px)",
            display: "grid",
            placeItems: "center",
            zIndex: 100,
          }}
          onClick={() => setEditingSupplierSku(null)}
        >
          <div
            style={{
              width: "360px",
              backgroundColor: "#ffffff",
              borderRadius: "16px",
              padding: "20px",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.15)",
              display: "flex",
              flexDirection: "column",
              gap: "14px",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "#0f172a" }}>
                Change Supplier / Brand
              </h3>
              <button
                type="button"
                onClick={() => setEditingSupplierSku(null)}
                style={{ border: "none", background: "transparent", cursor: "pointer", color: "#94a3b8" }}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "11px", fontWeight: 600, color: "#64748b" }}>Supplier / OEM Brand Name</label>
              <input
                type="text"
                value={newBrandValue}
                onChange={(e) => setNewBrandValue(e.target.value)}
                style={{
                  height: "36px",
                  padding: "0 12px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "#0f172a",
                  outline: "none",
                }}
              />
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "8px", marginTop: "4px" }}>
              <button
                type="button"
                onClick={() => setEditingSupplierSku(null)}
                style={{
                  height: "32px",
                  padding: "0 14px",
                  borderRadius: "9999px",
                  border: "1px solid #e2e8f0",
                  backgroundColor: "#ffffff",
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "#64748b",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (newBrandValue.trim()) {
                    onUpdateProduct?.({
                      ...editingSupplierSku,
                      brand: newBrandValue.trim(),
                    });
                  }
                  setEditingSupplierSku(null);
                }}
                style={{
                  height: "32px",
                  padding: "0 16px",
                  borderRadius: "9999px",
                  border: "none",
                  backgroundColor: "#d97706",
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "#ffffff",
                  cursor: "pointer",
                }}
              >
                Save Supplier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Edit Selling & Fulfilment Zone */}
      {isEditingZone && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(15, 23, 42, 0.4)",
            backdropFilter: "blur(4px)",
            display: "grid",
            placeItems: "center",
            zIndex: 100,
            padding: "16px",
          }}
          onClick={() => setIsEditingZone(false)}
        >
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "16px",
              border: "1px solid #e2e8f0",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
              width: "100%",
              maxWidth: "460px",
              padding: "20px 24px",
              display: "flex",
              flexDirection: "column",
              gap: "18px",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "8px",
                    backgroundColor: "#eff6ff",
                    color: "#2563eb",
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  <MapPin size={16} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "#0f172a" }}>
                    Selling & Fulfilment Zone
                  </h3>
                  <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#64748b" }}>
                    Define the operational region and delivery radius for your Hub depot.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditingZone(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#94a3b8",
                  cursor: "pointer",
                  padding: "4px",
                  borderRadius: "6px",
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* City Selection / Input */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "12px", fontWeight: 600, color: "#334155" }}>
                Primary Depot Hub & Location
              </label>
              <select
                value={tempCity}
                onChange={(e) => setTempCity(e.target.value)}
                style={{
                  height: "38px",
                  padding: "0 12px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "13px",
                  color: "#0f172a",
                  backgroundColor: "#ffffff",
                  outline: "none",
                  cursor: "pointer",
                }}
              >
                <option value="Kannur, Kerala">Kannur, Kerala</option>
                <option value="Kozhikode, Kerala">Kozhikode, Kerala</option>
                <option value="Kochi, Kerala">Kochi, Kerala</option>
                <option value="Mangaluru, Karnataka">Mangaluru, Karnataka</option>
                <option value="Bengaluru, Karnataka">Bengaluru, Karnataka</option>
                <option value="Coimbatore, Tamil Nadu">Coimbatore, Tamil Nadu</option>
              </select>
            </div>

            {/* Radius Slider / Quick Chips */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <label style={{ fontSize: "12px", fontWeight: 600, color: "#334155" }}>
                  Delivery & Supply Radius
                </label>
                <span style={{ fontSize: "13px", fontWeight: 700, color: "#2563eb" }}>
                  {tempRadius} km
                </span>
              </div>

              {/* Quick Radius Chips */}
              <div style={{ display: "flex", gap: "6px" }}>
                {[15, 25, 45, 60, 100].map((r) => {
                  const isSelected = tempRadius === r;
                  return (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setTempRadius(r)}
                      style={{
                        flex: 1,
                        height: "30px",
                        borderRadius: "6px",
                        border: isSelected ? "1.5px solid #2563eb" : "1px solid #e2e8f0",
                        backgroundColor: isSelected ? "#eff6ff" : "#ffffff",
                        color: isSelected ? "#2563eb" : "#475569",
                        fontSize: "11.5px",
                        fontWeight: isSelected ? 700 : 500,
                        cursor: "pointer",
                        transition: "all 120ms ease",
                      }}
                    >
                      {r} km
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Operational Note */}
            <div
              style={{
                padding: "10px 12px",
                backgroundColor: "#f8fafc",
                borderRadius: "8px",
                border: "1px solid #f1f5f9",
                fontSize: "11.5px",
                color: "#64748b",
                lineHeight: "1.4",
              }}
            >
              🚀 Contractors and projects located within <strong>{tempRadius} km</strong> of <strong>{tempCity}</strong> will be matched with your catalog for priority same-day and 24-hour dispatches.
            </div>

            {/* Action Buttons */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "10px", marginTop: "4px" }}>
              <button
                type="button"
                onClick={() => setIsEditingZone(false)}
                style={{
                  height: "36px",
                  padding: "0 16px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  backgroundColor: "#ffffff",
                  color: "#475569",
                  fontSize: "12.5px",
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
                  height: "36px",
                  padding: "0 18px",
                  borderRadius: "8px",
                  border: "none",
                  backgroundColor: "#0f172a",
                  color: "#ffffff",
                  fontSize: "12.5px",
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

      {/* 8. Dedicated Product Details Modal Popup */}
      {viewingProductSku && (
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
          onClick={() => setViewingProductSku(null)}
        >
          <div
            style={{
              width: "520px",
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
            {/* Header with Title, Status Pill, and Close Button */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 750, color: "#0f172a" }}>
                    Product Details
                  </h3>
                  {/* Status Badge */}
                  {(() => {
                    const status =
                      viewingProductSku.status ||
                      (viewingProductSku.stockQty === 0
                        ? "Not Available"
                        : viewingProductSku.stockQty <= viewingProductSku.reorderLevel
                        ? "Low Stock"
                        : "In Stock");

                    let bg = "#ecfdf5";
                    let color = "#15803d";

                    if (status === "Low Stock") {
                      bg = "#fffbeb";
                      color = "#b45309";
                    } else if (status === "Not Available") {
                      bg = "#fef2f2";
                      color = "#b91c1c";
                    } else if (status === "Available") {
                      bg = "#eff6ff";
                      color = "#2563eb";
                    }

                    return (
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          padding: "2px 8px",
                          borderRadius: "9999px",
                          fontSize: "11px",
                          fontWeight: 600,
                          backgroundColor: bg,
                          color: color,
                        }}
                      >
                        {status}
                      </span>
                    );
                  })()}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11.5px", color: "#64748b" }}>
                  <span style={{ fontFamily: "monospace", fontWeight: 600 }}>{viewingProductSku.skuCode}</span>
                  <span>·</span>
                  <span>{viewingProductSku.category}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setViewingProductSku(null)}
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
              >
                <X size={15} />
              </button>
            </div>

            {/* Product Hero Info (Clean & Borderless) */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "14px",
                padding: "2px 0",
              }}
            >
              {/* Product Thumbnail */}
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "10px",
                  overflow: "hidden",
                  backgroundColor: "#ffffff",
                  border: "1px solid #e2e8f0",
                  display: "grid",
                  placeItems: "center",
                  flexShrink: 0,
                  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04)",
                }}
              >
                {viewingProductSku.imageUrl ? (
                  <img
                    src={viewingProductSku.imageUrl}
                    alt={viewingProductSku.name}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  <Package size={24} color="#6366f1" />
                )}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "2px", minWidth: 0 }}>
                <h4 style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: "#0f172a", lineHeight: "1.3" }}>
                  {viewingProductSku.name}
                </h4>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "2px" }}>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                      fontSize: "11.5px",
                      fontWeight: 600,
                      color: "#0f172a",
                      backgroundColor: "#ffffff",
                      padding: "2px 7px",
                      borderRadius: "6px",
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    <Building2 size={11} color="#64748b" />
                    <span>{viewingProductSku.brand}</span>
                  </span>
                  <span style={{ fontSize: "11px", color: "#059669", fontWeight: 600 }}>
                    ✓ Verified OEM
                  </span>
                </div>
              </div>
            </div>

            {/* Grid: Pricing & Inventory Overview */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              {/* Pricing Box */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                  padding: "12px",
                  backgroundColor: "#ffffff",
                  borderRadius: "10px",
                  border: "1px solid #e2e8f0",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "5px", color: "#64748b", fontSize: "11px", fontWeight: 700, textTransform: "uppercase" }}>
                  <Tag size={12} />
                  <span>Commercials</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
                  <span style={{ fontSize: "18px", fontWeight: 750, color: "#0f172a" }}>
                    ₹{viewingProductSku.contractorPrice.toLocaleString("en-IN")}
                  </span>
                  <span style={{ fontSize: "11px", color: "#64748b" }}>
                    Contractor rate / {viewingProductSku.unit}
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11.5px", paddingTop: "4px", borderTop: "1px dashed #f1f5f9" }}>
                  <span style={{ color: "#64748b" }}>MRP Retail:</span>
                  <span style={{ fontWeight: 600, color: "#475569" }}>₹{viewingProductSku.mrpPrice.toLocaleString("en-IN")}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11.5px" }}>
                  <span style={{ color: "#64748b" }}>Est. Margin:</span>
                  <span style={{ fontWeight: 700, color: "#059669" }}>+ ₹{Math.round(viewingProductSku.contractorPrice * 0.12)} (12%)</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11.5px" }}>
                  <span style={{ color: "#64748b" }}>Min. Order (MOQ):</span>
                  <span style={{ fontWeight: 600, color: "#0f172a" }}>{viewingProductSku.moq} {viewingProductSku.unit.split(" ")[0]}</span>
                </div>
              </div>

              {/* Logistics & Depot Box */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                  padding: "12px",
                  backgroundColor: "#ffffff",
                  borderRadius: "10px",
                  border: "1px solid #e2e8f0",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "5px", color: "#64748b", fontSize: "11px", fontWeight: 700, textTransform: "uppercase" }}>
                  <Boxes size={12} />
                  <span>Depot Logistics</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
                  <span style={{ fontSize: "18px", fontWeight: 750, color: viewingProductSku.stockQty <= viewingProductSku.reorderLevel ? "#d97706" : "#0f172a" }}>
                    {viewingProductSku.stockQty} {viewingProductSku.unit.split(" ")[0]}
                  </span>
                  <span style={{ fontSize: "11px", color: "#64748b" }}>
                    Depot Inventory Level
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11.5px", paddingTop: "4px", borderTop: "1px dashed #f1f5f9" }}>
                  <span style={{ color: "#64748b" }}>Reorder Threshold:</span>
                  <span style={{ fontWeight: 600, color: "#475569" }}>{viewingProductSku.reorderLevel} {viewingProductSku.unit.split(" ")[0]}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11.5px" }}>
                  <span style={{ color: "#64748b" }}>Depot Bay:</span>
                  <span style={{ fontWeight: 600, color: "#0f172a" }}>{viewingProductSku.depotBay.split("(")[0].trim()}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11.5px" }}>
                  <span style={{ color: "#64748b" }}>Lead Time:</span>
                  <span style={{ fontWeight: 600, color: "#0f172a" }}>{viewingProductSku.leadTime}</span>
                </div>
              </div>
            </div>

            {/* Specifications Box */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "6px",
                padding: "12px",
                backgroundColor: "#f8fafc",
                borderRadius: "10px",
                border: "1px solid #f1f5f9",
              }}
            >
              <span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "#64748b" }}>
                Technical Specification & Quality Compliance
              </span>
              <p style={{ margin: 0, fontSize: "12.5px", color: "#1e293b", lineHeight: "1.45" }}>
                {viewingProductSku.specification}
              </p>
            </div>

            {/* Action Footer Buttons */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px", marginTop: "2px" }}>
              <button
                type="button"
                onClick={() => {
                  const target = viewingProductSku;
                  setViewingProductSku(null);
                  onSelectProduct?.(target);
                }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  height: "34px",
                  padding: "0 14px",
                  borderRadius: "9999px",
                  border: "1px solid #e2e8f0",
                  backgroundColor: "#ffffff",
                  color: "#0f172a",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer",
                  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04)",
                  transition: "all 120ms ease",
                }}
              >
                <StudioDuotoneIcon size={15} />
                <span>Ask Odin</span>
              </button>

              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <button
                  type="button"
                  onClick={() => {
                    const target = viewingProductSku;
                    setViewingProductSku(null);
                    setEditingPriceSku(target);
                    setNewPriceValue(target.contractorPrice.toString());
                  }}
                  style={{
                    height: "34px",
                    padding: "0 14px",
                    borderRadius: "9999px",
                    border: "1px solid #cbd5e1",
                    backgroundColor: "#ffffff",
                    color: "#0f172a",
                    fontSize: "12px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Update Price
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const target = viewingProductSku;
                    setViewingProductSku(null);
                    setEditingDetailsSku(target);
                    setNewNameValue(target.name);
                    setNewSpecValue(target.specification);
                  }}
                  style={{
                    height: "34px",
                    padding: "0 16px",
                    borderRadius: "9999px",
                    border: "none",
                    backgroundColor: "#0f172a",
                    color: "#ffffff",
                    fontSize: "12px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Edit SKU
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
