"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Package,
  Plus,
  ArrowRight,
  Search,
  LayoutGrid,
  Table as TableIcon,
  X,
  CheckCircle2,
  Warehouse,
  ShoppingCart,
  DollarSign,
  AlertTriangle,
  Minus,
} from "lucide-react";
import styles from "./project-materials-workspace.module.css";

export interface ProjectMaterialItem {
  id: string;
  boqCode: string;
  name: string;
  category: "Finishes & Flooring" | "Civil & Structural" | "Woodwork & Joinery" | "MEP & Electrical";
  unit: string;
  unitRate: number;
  boqAllocatedQty: number;
  boqAllocatedAmount: number;
  purchasedQty: number;
  spentAmount: number;
  stockOnHandQty: number;
  stockOnHandValue: number;
  consumedQty: number;
  status: "In Stock" | "Low Stock" | "In Transit" | "Delivered" | "Verified On-Site";
  reorderLevel: number;
  supplier: string;
  lastInward: string;
}

export const INITIAL_PROJECT_MATERIALS: ProjectMaterialItem[] = [
  {
    id: "mat-1",
    boqCode: "BOQ-FIN-01",
    name: "Italian Marble Flooring",
    category: "Finishes & Flooring",
    unit: "sq ft",
    unitRate: 335,
    boqAllocatedQty: 1000,
    boqAllocatedAmount: 335000,
    purchasedQty: 850,
    spentAmount: 240000,
    stockOnHandQty: 320,
    stockOnHandValue: 95000,
    consumedQty: 530,
    status: "In Stock",
    reorderLevel: 100,
    supplier: "Classic Marble Galore Ltd.",
    lastInward: "01 Sep 2026",
  },
  {
    id: "mat-2",
    boqCode: "BOQ-CIV-01",
    name: "Structural Cement (53 Grade)",
    category: "Civil & Structural",
    unit: "Bags",
    unitRate: 420,
    boqAllocatedQty: 180,
    boqAllocatedAmount: 127000,
    purchasedQty: 120,
    spentAmount: 85000,
    stockOnHandQty: 60,
    stockOnHandValue: 42000,
    consumedQty: 60,
    status: "Delivered",
    reorderLevel: 30,
    supplier: "Ultratech Building Supplies",
    lastInward: "Yesterday",
  },
  {
    id: "mat-3",
    boqCode: "BOQ-WDW-02",
    name: "Teak Wood Framing & Joinery",
    category: "Woodwork & Joinery",
    unit: "Units",
    unitRate: 17666,
    boqAllocatedQty: 15,
    boqAllocatedAmount: 265000,
    purchasedQty: 8,
    spentAmount: 145000,
    stockOnHandQty: 4,
    stockOnHandValue: 75000,
    consumedQty: 4,
    status: "Low Stock",
    reorderLevel: 5,
    supplier: "Malabar Timber Depot",
    lastInward: "28 Aug 2026",
  },
  {
    id: "mat-4",
    boqCode: "BOQ-MEP-01",
    name: "Conduit & Electrical Wiring",
    category: "MEP & Electrical",
    unit: "Sets",
    unitRate: 5942,
    boqAllocatedQty: 35,
    boqAllocatedAmount: 208000,
    purchasedQty: 15,
    spentAmount: 90000,
    stockOnHandQty: 8,
    stockOnHandValue: 68000,
    consumedQty: 7,
    status: "In Stock",
    reorderLevel: 5,
    supplier: "Schneider & Finolex Dist.",
    lastInward: "25 Aug 2026",
  },
  {
    id: "mat-5",
    boqCode: "BOQ-FIN-02",
    name: "Vitrified Porcelain Tiles",
    category: "Finishes & Flooring",
    unit: "sq ft",
    unitRate: 94,
    boqAllocatedQty: 1600,
    boqAllocatedAmount: 150000,
    purchasedQty: 1200,
    spentAmount: 110000,
    stockOnHandQty: 450,
    stockOnHandValue: 40000,
    consumedQty: 750,
    status: "In Transit",
    reorderLevel: 200,
    supplier: "Kajaria Tile Mart",
    lastInward: "Dispatched (ETA 05 Sep)",
  },
  {
    id: "mat-6",
    boqCode: "BOQ-CIV-02",
    name: "Structural Steel TMT Rebars (Fe 500D)",
    category: "Civil & Structural",
    unit: "Tons",
    unitRate: 62857,
    boqAllocatedQty: 3.5,
    boqAllocatedAmount: 220000,
    purchasedQty: 2.5,
    spentAmount: 165000,
    stockOnHandQty: 0.8,
    stockOnHandValue: 55000,
    consumedQty: 1.7,
    status: "Verified On-Site",
    reorderLevel: 0.5,
    supplier: "Tata Tiscon Steel Traders",
    lastInward: "29 Aug 2026",
  },
];

export interface ProjectMaterialsWorkspaceProps {
  projectId?: string;
  projectName?: string;
}

export function formatCurrency(amount: number): string {
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(2)}L`;
  }
  if (amount >= 1000) {
    return `₹${Math.round(amount / 1000)}K`;
  }
  return `₹${amount.toLocaleString("en-IN")}`;
}

export function ProjectMaterialsWorkspace({
  projectId = "prj-1",
  projectName = "Nila Residence",
}: ProjectMaterialsWorkspaceProps) {
  const [materials, setMaterials] = useState<ProjectMaterialItem[]>(INITIAL_PROJECT_MATERIALS);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals state
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [isUsageModalOpen, setIsUsageModalOpen] = useState(false);

  // Purchase Form State
  const [purchaseMatId, setPurchaseMatId] = useState(materials[0]?.id || "");
  const [purchaseQty, setPurchaseQty] = useState("");
  const [purchaseRate, setPurchaseRate] = useState("");
  const [purchaseSupplier, setPurchaseSupplier] = useState("");
  const [purchasePoRef, setPurchasePoRef] = useState("");

  // Usage Form State
  const [usageMatId, setUsageMatId] = useState(materials[0]?.id || "");
  const [usageQty, setUsageQty] = useState("");
  const [usageNotes, setUsageNotes] = useState("");

  // Filtering
  const filteredMaterials = useMemo(() => {
    return materials.filter((m) => {
      const matchesSearch =
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.boqCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.supplier.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.category.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === "all" || m.category.toLowerCase() === selectedCategory.toLowerCase();

      const matchesStatus =
        selectedStatus === "all" || m.status.toLowerCase() === selectedStatus.toLowerCase();

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [materials, searchQuery, selectedCategory, selectedStatus]);

  // Aggregate Metrics
  const totalBudget = materials.reduce((acc, m) => acc + m.boqAllocatedAmount, 0);
  const totalSpent = materials.reduce((acc, m) => acc + m.spentAmount, 0);
  const totalStockValue = materials.reduce((acc, m) => acc + m.stockOnHandValue, 0);
  const totalPendingRequired = Math.max(0, totalBudget - totalSpent);

  function showToast(msg: string) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  }

  function handleRecordPurchaseSubmit(e: React.FormEvent) {
    e.preventDefault();
    const qty = parseFloat(purchaseQty);
    if (!qty || qty <= 0) return;

    const target = materials.find((m) => m.id === purchaseMatId);
    if (!target) return;

    const rate = parseFloat(purchaseRate) || target.unitRate;
    const addedCost = Math.round(qty * rate);

    setMaterials((prev) =>
      prev.map((item) => {
        if (item.id === purchaseMatId) {
          const newPurchasedQty = item.purchasedQty + qty;
          const newSpent = item.spentAmount + addedCost;
          const newStockQty = item.stockOnHandQty + qty;
          const newStockVal = item.stockOnHandValue + addedCost;
          return {
            ...item,
            purchasedQty: newPurchasedQty,
            spentAmount: newSpent,
            stockOnHandQty: newStockQty,
            stockOnHandValue: newStockVal,
            supplier: purchaseSupplier.trim() || item.supplier,
            lastInward: "Just now",
            status: newStockQty > item.reorderLevel ? "In Stock" : "Low Stock",
          };
        }
        return item;
      })
    );

    setIsPurchaseModalOpen(false);
    setPurchaseQty("");
    setPurchaseRate("");
    setPurchaseSupplier("");
    setPurchasePoRef("");
    showToast(`Recorded purchase of ${qty} ${target.unit} for ${target.name} (${formatCurrency(addedCost)})`);
  }

  function handleLogUsageSubmit(e: React.FormEvent) {
    e.preventDefault();
    const qty = parseFloat(usageQty);
    if (!qty || qty <= 0) return;

    const target = materials.find((m) => m.id === usageMatId);
    if (!target) return;

    setMaterials((prev) =>
      prev.map((item) => {
        if (item.id === usageMatId) {
          const newStockQty = Math.max(0, item.stockOnHandQty - qty);
          const newConsumed = item.consumedQty + Math.min(qty, item.stockOnHandQty);
          const newStockVal = Math.round(newStockQty * item.unitRate);
          return {
            ...item,
            stockOnHandQty: newStockQty,
            consumedQty: newConsumed,
            stockOnHandValue: newStockVal,
            status: newStockQty <= item.reorderLevel ? "Low Stock" : "In Stock",
          };
        }
        return item;
      })
    );

    setIsUsageModalOpen(false);
    setUsageQty("");
    setUsageNotes("");
    showToast(`Logged usage of ${qty} ${target.unit} for ${target.name}`);
  }

  function getStatusTagClass(status: ProjectMaterialItem["status"]) {
    switch (status) {
      case "Delivered":
      case "Verified On-Site":
        return styles.tagGreen;
      case "In Stock":
        return styles.tagGreen;
      case "Low Stock":
        return styles.tagAmber;
      case "In Transit":
        return styles.tagBlue;
      default:
        return styles.tagGreen;
    }
  }

  return (
    <div className={styles.container} aria-label="Project Materials & BOQ Allocation">
      {/* ── 1. Header Row ─────────────────────────────────────────── */}
      <div className={styles.headerRow}>
        <div className={styles.titleGroup}>
          <h4 className={styles.heading}>Project Materials &amp; BOQ Allocation</h4>
          <span className={styles.badge}>BOQ Linked</span>
        </div>

        <div className={styles.headerActions}>
          <button
            type="button"
            className={styles.actionBtnPrimary}
            onClick={() => {
              setPurchaseMatId(materials[0]?.id || "");
              setIsPurchaseModalOpen(true);
            }}
          >
            <Plus size={14} />
            <span>Record Purchase</span>
          </button>

          <button
            type="button"
            className={styles.actionBtnSecondary}
            onClick={() => {
              setUsageMatId(materials[0]?.id || "");
              setIsUsageModalOpen(true);
            }}
          >
            <Minus size={14} />
            <span>Log Usage</span>
          </button>

          <Link href={`/projects/${projectId}/boq`} className={styles.boqLinkBtn}>
            <span>View Full BOQ</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      </div>

      {/* ── 2. KPI Summary Cards ──────────────────────────────────── */}
      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Total Spent</span>
            <DollarSign size={16} />
          </div>
          <span className={styles.kpiValue} style={{ color: "#0f172a" }}>
            {formatCurrency(totalSpent)}
          </span>
          <span className={styles.kpiSubText}>
            {((totalSpent / (totalBudget || 1)) * 100).toFixed(1)}% of BOQ Budget
          </span>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Available Value</span>
            <Warehouse size={16} />
          </div>
          <span className={styles.kpiValue} style={{ color: "#0f172a" }}>
            {formatCurrency(totalStockValue)}
          </span>
          <span className={styles.kpiSubText}>Active stock on site</span>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>BOQ Required</span>
            <ShoppingCart size={16} />
          </div>
          <span className={styles.kpiValue} style={{ color: "#0f172a" }}>
            {formatCurrency(totalPendingRequired)}
          </span>
          <span className={styles.kpiSubText}>Pending procurement</span>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Total Budget</span>
            <Package size={16} />
          </div>
          <span className={styles.kpiValue} style={{ color: "#0f172a" }}>
            {formatCurrency(totalBudget)}
          </span>
          <span className={styles.kpiSubText}>{materials.length} line items</span>
        </div>
      </div>

      {/* ── 3. Toolbar (Search, Filter, View Mode) ─────────────────── */}
      <div className={styles.toolbar}>
        <div className={styles.toolbarLeft}>
          <div className={styles.searchBox}>
            <Search size={15} color="#94a3b8" />
            <input
              type="text"
              placeholder="Search material, BOQ code, supplier..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className={styles.filterSelect}
            aria-label="Filter by category"
          >
            <option value="all">All Categories</option>
            <option value="Finishes & Flooring">Finishes &amp; Flooring</option>
            <option value="Civil & Structural">Civil &amp; Structural</option>
            <option value="Woodwork & Joinery">Woodwork &amp; Joinery</option>
            <option value="MEP & Electrical">MEP &amp; Electrical</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className={styles.filterSelect}
            aria-label="Filter by status"
          >
            <option value="all">All Statuses</option>
            <option value="In Stock">In Stock</option>
            <option value="Delivered">Delivered</option>
            <option value="Verified On-Site">Verified On-Site</option>
            <option value="Low Stock">Low Stock</option>
            <option value="In Transit">In Transit</option>
          </select>
        </div>

        <div className={styles.toolbarRight}>
          <div className={styles.viewToggleGroup}>
            <button
              type="button"
              className={`${styles.viewToggleBtn} ${viewMode === "grid" ? styles.viewToggleBtnActive : ""}`}
              onClick={() => setViewMode("grid")}
            >
              <LayoutGrid size={13} />
              <span>Cards</span>
            </button>
            <button
              type="button"
              className={`${styles.viewToggleBtn} ${viewMode === "table" ? styles.viewToggleBtnActive : ""}`}
              onClick={() => setViewMode("table")}
            >
              <TableIcon size={13} />
              <span>Matrix</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── 4. Content (Cards vs Matrix Table) ─────────────────────── */}
      {viewMode === "grid" ? (
        <div className={styles.materialsGrid}>
          {filteredMaterials.map((mat) => {
            const pctPurchased = Math.min(
              100,
              Math.round((mat.purchasedQty / (mat.boqAllocatedQty || 1)) * 100)
            );
            return (
              <div key={mat.id} className={styles.materialCard}>
                {/* Header */}
                <div className={styles.cardHeader}>
                  <div>
                    <h5 className={styles.materialName}>{mat.name}</h5>
                    <div className={styles.itemMetaRow}>
                      <span className={styles.codeBadge}>{mat.boqCode}</span>
                      <span>·</span>
                      <span>{mat.category}</span>
                    </div>
                  </div>

                  <span className={`${styles.statusTag} ${getStatusTagClass(mat.status)}`}>
                    {mat.status === "Low Stock" ? (
                      <>
                        <AlertTriangle size={11} />
                        <span>Low Stock</span>
                      </>
                    ) : (
                      <span>{mat.status}</span>
                    )}
                  </span>
                </div>

                {/* Stock & Spend Breakdown */}
                <div className={styles.metricsStrip}>
                  <div className={styles.metricCol}>
                    <span className={styles.metricColLabel}>BOQ Target</span>
                    <span className={styles.metricColVal}>
                      {mat.boqAllocatedQty} {mat.unit}
                    </span>
                    <span className={styles.metricColSub}>{formatCurrency(mat.boqAllocatedAmount)}</span>
                  </div>

                  <div className={styles.metricCol}>
                    <span className={styles.metricColLabel}>Purchased</span>
                    <span className={styles.metricColVal}>
                      {mat.purchasedQty} {mat.unit}
                    </span>
                    <span className={styles.metricColSub}>{formatCurrency(mat.spentAmount)}</span>
                  </div>

                  <div className={styles.metricCol}>
                    <span className={styles.metricColLabel}>Stock on Site</span>
                    <span className={styles.metricColVal} style={{ color: mat.stockOnHandQty <= mat.reorderLevel ? "#b45309" : "#0f172a" }}>
                      {mat.stockOnHandQty} {mat.unit}
                    </span>
                    <span className={styles.metricColSub}>{formatCurrency(mat.stockOnHandValue)}</span>
                  </div>
                </div>

                {/* BOQ Procurement Progress Bar */}
                <div className={styles.progressSection}>
                  <div className={styles.progressLabelRow}>
                    <span className={styles.progressLabel}>BOQ Procured</span>
                    <span className={styles.progressValue}>
                      {pctPurchased}% ({mat.purchasedQty}/{mat.boqAllocatedQty} {mat.unit})
                    </span>
                  </div>
                  <div className={styles.progressBarTrack}>
                    <div
                      className={`${styles.progressBarFill} ${
                        pctPurchased >= 100 ? styles.progressBarFillSuccess : ""
                      }`}
                      style={{ width: `${pctPurchased}%` }}
                    />
                  </div>
                </div>

                {/* Footer & Quick Actions */}
                <div className={styles.cardFooter}>
                  <div className={styles.supplierInfo} title={`Supplier: ${mat.supplier}`}>
                    <span>Supplier: <strong>{mat.supplier}</strong></span>
                  </div>

                  <div className={styles.cardActionBtns}>
                    <button
                      type="button"
                      className={styles.cardBtnSmall}
                      onClick={() => {
                        setUsageMatId(mat.id);
                        setIsUsageModalOpen(true);
                      }}
                    >
                      <Minus size={11} />
                      <span>Use</span>
                    </button>
                    <button
                      type="button"
                      className={`${styles.cardBtnSmall} ${styles.cardBtnSmallPrimary}`}
                      onClick={() => {
                        setPurchaseMatId(mat.id);
                        setIsPurchaseModalOpen(true);
                      }}
                    >
                      <Plus size={11} />
                      <span>Inward</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Matrix Tabular View */
        <div className={styles.tableContainer}>
          <table className={styles.matrixTable}>
            <thead>
              <tr>
                <th>BOQ Code</th>
                <th>Material &amp; Scope</th>
                <th>Category</th>
                <th>BOQ Qty</th>
                <th>Purchased</th>
                <th>Stock on Site</th>
                <th>Spent</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMaterials.map((mat) => (
                <tr key={mat.id}>
                  <td>
                    <span className={styles.codeBadge}>{mat.boqCode}</span>
                  </td>
                  <td>
                    <strong style={{ color: "#0f172a", display: "block" }}>{mat.name}</strong>
                    <span style={{ fontSize: "11px", color: "#64748b" }}>{mat.supplier}</span>
                  </td>
                  <td>{mat.category}</td>
                  <td>
                    <strong>{mat.boqAllocatedQty} {mat.unit}</strong>
                    <span style={{ fontSize: "11px", color: "#64748b", display: "block" }}>
                      {formatCurrency(mat.boqAllocatedAmount)}
                    </span>
                  </td>
                  <td>
                    <span>{mat.purchasedQty} {mat.unit}</span>
                  </td>
                  <td>
                    <strong style={{ color: mat.stockOnHandQty <= mat.reorderLevel ? "#b45309" : "#0f172a" }}>
                      {mat.stockOnHandQty} {mat.unit}
                    </strong>
                    <span style={{ fontSize: "11px", color: "#64748b", display: "block" }}>
                      {formatCurrency(mat.stockOnHandValue)}
                    </span>
                  </td>
                  <td>
                    <strong>{formatCurrency(mat.spentAmount)}</strong>
                  </td>
                  <td>
                    <span className={`${styles.statusTag} ${getStatusTagClass(mat.status)}`}>
                      {mat.status}
                    </span>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <div style={{ display: "inline-flex", gap: "6px" }}>
                      <button
                        type="button"
                        className={styles.cardBtnSmall}
                        onClick={() => {
                          setUsageMatId(mat.id);
                          setIsUsageModalOpen(true);
                        }}
                      >
                        Use
                      </button>
                      <button
                        type="button"
                        className={`${styles.cardBtnSmall} ${styles.cardBtnSmallPrimary}`}
                        onClick={() => {
                          setPurchaseMatId(mat.id);
                          setIsPurchaseModalOpen(true);
                        }}
                      >
                        + Inward
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── 5. Record Purchase / Inward Stock Modal ───────────────── */}
      {isPurchaseModalOpen && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modalContent} role="dialog" aria-modal="true">
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Record Material Purchase / Inward</h3>
              <button
                type="button"
                className={styles.modalCloseBtn}
                onClick={() => setIsPurchaseModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleRecordPurchaseSubmit} className={styles.modalForm}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Select BOQ Material Item</label>
                <select
                  value={purchaseMatId}
                  onChange={(e) => setPurchaseMatId(e.target.value)}
                  className={styles.formSelect}
                  required
                >
                  {materials.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.boqCode} - {m.name} ({m.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Quantity Received / Inward</label>
                  <input
                    type="number"
                    step="any"
                    min="0.1"
                    placeholder="e.g. 50"
                    value={purchaseQty}
                    onChange={(e) => setPurchaseQty(e.target.value)}
                    className={styles.formInput}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Unit Rate (₹)</label>
                  <input
                    type="number"
                    step="any"
                    placeholder={
                      materials.find((m) => m.id === purchaseMatId)?.unitRate.toString() || "Rate"
                    }
                    value={purchaseRate}
                    onChange={(e) => setPurchaseRate(e.target.value)}
                    className={styles.formInput}
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Supplier / Vendor Name</label>
                <input
                  type="text"
                  placeholder="e.g. Ultratech Building Supplies"
                  value={purchaseSupplier}
                  onChange={(e) => setPurchaseSupplier(e.target.value)}
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>PO / Invoice Reference Number</label>
                <input
                  type="text"
                  placeholder="e.g. INV-9481 / PO-2026-08"
                  value={purchasePoRef}
                  onChange={(e) => setPurchasePoRef(e.target.value)}
                  className={styles.formInput}
                />
              </div>

              <div className={styles.modalFooter}>
                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={() => setIsPurchaseModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className={styles.submitBtn}>
                  Confirm Inward
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── 6. Log Material Usage / Consumption Modal ─────────────── */}
      {isUsageModalOpen && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modalContent} role="dialog" aria-modal="true">
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Log Site Material Consumption</h3>
              <button
                type="button"
                className={styles.modalCloseBtn}
                onClick={() => setIsUsageModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleLogUsageSubmit} className={styles.modalForm}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Select Material</label>
                <select
                  value={usageMatId}
                  onChange={(e) => setUsageMatId(e.target.value)}
                  className={styles.formSelect}
                  required
                >
                  {materials.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.boqCode} - {m.name} (Stock: {m.stockOnHandQty} {m.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Quantity Consumed</label>
                <input
                  type="number"
                  step="any"
                  min="0.1"
                  placeholder="e.g. 10"
                  value={usageQty}
                  onChange={(e) => setUsageQty(e.target.value)}
                  className={styles.formInput}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Task / Work Area Description</label>
                <textarea
                  placeholder="e.g. Used for Ground floor living room wall tiling"
                  value={usageNotes}
                  onChange={(e) => setUsageNotes(e.target.value)}
                  className={styles.formTextarea}
                />
              </div>

              <div className={styles.modalFooter}>
                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={() => setIsUsageModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className={styles.submitBtn}>
                  Log Consumption
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Toast Notification ────────────────────────────────────── */}
      {toastMessage && (
        <div className={styles.toast}>
          <CheckCircle2 size={16} />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}