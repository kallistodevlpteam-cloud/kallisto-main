"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  ArrowUp,
  CheckCircle2,
  ChevronDown,
  RotateCcw,
  ShieldCheck,
  Search,
  Check,
  Boxes,
  Package,
  FileSpreadsheet,
  Image as ImageIcon,
  Paperclip,
  Sparkles,
  UploadCloud,
  Layers,
  ArrowRight,
  FileText,
  X,
  BarChart3,
  TrendingUp,
  Tag,
  Building2,
  Truck,
  PlusCircle,
  DollarSign,
  ShoppingBag,
  Plus,
  Mic,
  AudioWaveform,
  SendHorizontal,
} from "lucide-react";
import { StudioDuotoneIcon } from "@/components/layout/sidebar-icons";
import { ProductSKU, ProductCategory } from "../types/product-sku";
import styles from "./hub-sku-odin-panel.module.css";

export interface HubSkuOdinPanelProps {
  onAddProductSKU: (sku: ProductSKU) => void;
  onAddBatchProducts?: (skus: ProductSKU[]) => void;
  onClose?: () => void;
  selectedProduct?: ProductSKU | null;
  onDeselectProduct?: () => void;
  onUpdateProduct?: (sku: ProductSKU) => void;
}

const CATEGORIES: ProductCategory[] = [
  "Cement & Aggregates",
  "Steel & TMT",
  "Plumbing & Electrical",
  "Finishes & Tiles",
  "Masonry & Blocks",
  "Paints & Waterproofing",
  "Structural Hardware",
];

const PRESET_PRODUCTS: Record<
  ProductCategory,
  { name: string; brand: string; spec: string; unit: string; price: number; mrp: number; bay: string; stock: number }[]
> = {
  "Cement & Aggregates": [
    {
      name: "UltraTech Weather Plus 53 Grade Cement",
      brand: "UltraTech",
      spec: "50kg Bags · Water Repellent · IS 1489 Part 1",
      unit: "Bag (50kg)",
      price: 425,
      mrp: 465,
      bay: "Bay A-02 (Bulk Cement)",
      stock: 500,
    },
    {
      name: "Ambuja Kawach Waterproofing Cement",
      brand: "Ambuja",
      spec: "50kg Bags · Anti-Efflorescence shield · IS 1489",
      unit: "Bag (50kg)",
      price: 440,
      mrp: 480,
      bay: "Bay A-03 (Cement Depot)",
      stock: 350,
    },
  ],
  "Steel & TMT": [
    {
      name: "Tata Tiscon 550D Super Ductile TMT Rebar 12mm",
      brand: "Tata Steel",
      spec: "12mm Diameter · 12m length · Fe550D seismic grade",
      unit: "Metric Ton (MT)",
      price: 62500,
      mrp: 68000,
      bay: "Bay B-01 (Heavy Steel Yard)",
      stock: 45,
    },
    {
      name: "JSW Neosteel Fe550D TMT Bar 16mm",
      brand: "JSW Steel",
      spec: "16mm Diameter · 12m length · Fe550D column grade",
      unit: "Metric Ton (MT)",
      price: 61800,
      mrp: 67500,
      bay: "Bay B-02 (Steel Racks)",
      stock: 60,
    },
  ],
  "Plumbing & Electrical": [
    {
      name: "Finolex FlowGuard Plus CPVC Pipes 1-inch (25mm)",
      brand: "Finolex",
      spec: "SDR 11 Class 1 · 3m (10ft) Length · Lead-Free NSF Certified",
      unit: "Bundle (10 pcs)",
      price: 3450,
      mrp: 3950,
      bay: "Bay C-04 (Pipes & Racks)",
      stock: 120,
    },
    {
      name: "Jaquar Alive Single Lever Basin Mixer",
      brand: "Jaquar",
      spec: "Chrome Finish · Brass Body · 10-Year Warranty",
      unit: "Piece",
      price: 3890,
      mrp: 4750,
      bay: "Bay D-03 (High Value Secure)",
      stock: 25,
    },
  ],
  "Finishes & Tiles": [
    {
      name: "Kajaria Eternity Glazed Vitrified Tiles (GVT) 60x120cm",
      brand: "Kajaria",
      spec: "Staturaio White Marble Finish · 9mm · Nano Polished",
      unit: "Box (2 pcs / 15.5 sq.ft)",
      price: 1180,
      mrp: 1450,
      bay: "Bay D-01 (Tile Crates)",
      stock: 340,
    },
  ],
  "Masonry & Blocks": [
    {
      name: "Birla Aerocon AAC Blocks 6-inch (600x200x150mm)",
      brand: "Birla Aerocon",
      spec: "Grade 1 IS 2185 Part 3 · Thermal Insulating Blocks",
      unit: "Pallet (64 blocks)",
      price: 4480,
      mrp: 5120,
      bay: "Bay A-05 (Block Yard)",
      stock: 80,
    },
  ],
  "Paints & Waterproofing": [
    {
      name: "Asian Paints Apex Ultima Exterior Emulsion 20L",
      brand: "Asian Paints",
      spec: "20 Litre Bucket · 7-Year Anti-Algal Warranty",
      unit: "Bucket (20L)",
      price: 6850,
      mrp: 7600,
      bay: "Bay C-01 (Chemicals & Paints)",
      stock: 42,
    },
    {
      name: "Dr. Fixit 201 LW+ Integral Waterproofing Liquid 20L",
      brand: "Pidilite",
      spec: "20 Litre Drum · Plasticizer & Water Reducer · IS 2645",
      unit: "Drum (20L)",
      price: 3150,
      mrp: 3600,
      bay: "Bay C-02 (Admixtures)",
      stock: 55,
    },
  ],
  "Structural Hardware": [
    {
      name: "Hilti HST3 Heavy Duty Structural Anchor M12x115",
      brand: "Hilti",
      spec: "Zinc Plated Carbon Steel · ETA Option 1 Cracked Concrete",
      unit: "Box (25 pcs)",
      price: 2650,
      mrp: 3100,
      bay: "Bay D-04 (Hardware Racks)",
      stock: 90,
    },
  ],
};

const BATCH_IMPORT_MOCK: ProductSKU[] = [
  {
    id: "batch-sku-1",
    skuCode: "HUB-CEM-UT53-14",
    name: "UltraTech Super 53 Grade High Performance Cement",
    category: "Cement & Aggregates",
    subcategory: "OPC & PPC Cement",
    brand: "UltraTech",
    specification: "50kg Bags · Ultra Micro-Fine Particles · IS 12269",
    unit: "Bag (50kg)",
    contractorPrice: 435,
    mrpPrice: 475,
    stockQty: 600,
    reorderLevel: 200,
    moq: 50,
    leadTime: "Same Day Dispatch",
    depotBay: "Bay A-02 (Bulk Cement)",
    verified: true,
    status: "In Stock",
    createdAt: new Date().toISOString().split("T")[0],
  },
  {
    id: "batch-sku-2",
    skuCode: "HUB-STL-TATA-16",
    name: "Tata Tiscon 550D Super Ductile TMT Rebar 16mm",
    category: "Steel & TMT",
    subcategory: "TMT Rebars & Wire Rods",
    brand: "Tata Steel",
    specification: "16mm Diameter · 12m length · Fe550D Heavy Column Grade",
    unit: "Metric Ton (MT)",
    contractorPrice: 63200,
    mrpPrice: 69000,
    stockQty: 35,
    reorderLevel: 10,
    moq: 1,
    leadTime: "Same Day Dispatch",
    depotBay: "Bay B-01 (Heavy Steel Yard)",
    verified: true,
    status: "In Stock",
    createdAt: new Date().toISOString().split("T")[0],
  },
  {
    id: "batch-sku-3",
    skuCode: "HUB-PNT-AP-DMP",
    name: "Asian Paints SmartCare Damp Block 20L Waterproofing",
    category: "Paints & Waterproofing",
    subcategory: "Exterior & Interior Emulsions",
    brand: "Asian Paints",
    specification: "20L Bucket · Crystalline Nano-Technology · 5-Bar Pressure Resistant",
    unit: "Bucket (20L)",
    contractorPrice: 4250,
    mrpPrice: 4800,
    stockQty: 48,
    reorderLevel: 15,
    moq: 2,
    leadTime: "Same Day Dispatch",
    depotBay: "Bay C-01 (Chemicals & Paints)",
    verified: true,
    status: "In Stock",
    createdAt: new Date().toISOString().split("T")[0],
  },
  {
    id: "batch-sku-4",
    skuCode: "HUB-PLM-AST-50",
    name: "Astral Silencio Low Noise Acoustic Drainage Pipes 110mm",
    category: "Plumbing & Electrical",
    subcategory: "CPVC & UPVC Pipes",
    brand: "Astral",
    specification: "110mm x 3m · 3-Layer Mineral Reinforced · Sound Insulation",
    unit: "Length (3m)",
    contractorPrice: 1680,
    mrpPrice: 1950,
    stockQty: 85,
    reorderLevel: 25,
    moq: 5,
    leadTime: "24 Hours Dispatch",
    depotBay: "Bay C-04 (Pipes & Racks)",
    verified: true,
    status: "In Stock",
    createdAt: new Date().toISOString().split("T")[0],
  },
  {
    id: "batch-sku-5",
    skuCode: "HUB-MAS-AER-08",
    name: "Birla Aerocon AAC Blocks 8-inch (600x200x200mm)",
    category: "Masonry & Blocks",
    subcategory: "AAC Lightweight Blocks",
    brand: "Birla Aerocon",
    specification: "Grade 1 IS 2185 Part 3 · Heavy Structural Load-bearing",
    unit: "Pallet (48 blocks)",
    contractorPrice: 4920,
    mrpPrice: 5600,
    stockQty: 95,
    reorderLevel: 30,
    moq: 1,
    leadTime: "Same Day Dispatch",
    depotBay: "Bay A-05 (Block Yard)",
    verified: true,
    status: "In Stock",
    createdAt: new Date().toISOString().split("T")[0],
  },
];

type IntakeMode = "idle" | "select_category" | "spreadsheet_batch" | "image_ocr" | "single_spec";

export function HubSkuOdinPanel({
  onAddProductSKU,
  onAddBatchProducts,
  onClose,
  selectedProduct,
  onDeselectProduct,
  onUpdateProduct,
}: HubSkuOdinPanelProps) {
  const [intakeMode, setIntakeMode] = useState<IntakeMode>("idle");
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | null>(null);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [categorySearch, setCategorySearch] = useState("");

  // Extracted Spec state
  const [productName, setProductName] = useState("");
  const [brand, setBrand] = useState("");
  const [specification, setSpecification] = useState("");
  const [contractorPrice, setContractorPrice] = useState<number>(425);
  const [mrpPrice, setMrpPrice] = useState<number>(465);
  const [unit, setUnit] = useState("Bag (50kg)");
  const [stockQty, setStockQty] = useState<number>(500);
  const [reorderLevel, setReorderLevel] = useState<number>(150);
  const [depotBay, setDepotBay] = useState("Bay A-02 (Bulk Cement)");
  const [leadTime, setLeadTime] = useState("Same Day Dispatch");

  // Flow flags
  const [hasPublished, setHasPublished] = useState(false);
  const [publishedSkuCode, setPublishedSkuCode] = useState("");
  const [batchImportCount, setBatchImportCount] = useState(0);

  const [uploadedFileName, setUploadedFileName] = useState("");
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // Product Intelligence specific state
  const [activeIntelIntent, setActiveIntelIntent] = useState<
    "none" | "compare_prices" | "update_price" | "check_supplier" | "view_sales" | "add_to_project"
  >("none");
  const [intelCustomPrice, setIntelCustomPrice] = useState<string>("");
  const [intelProjectQty, setIntelProjectQty] = useState<string>("50");
  const [intelSelectedProject, setIntelSelectedProject] = useState<string>("Greenwood Residency (Site Phase 2)");
  const [isPriceSaved, setIsPriceSaved] = useState(false);
  const [isAllocatedToProject, setIsAllocatedToProject] = useState(false);
  const [intelChatLog, setIntelChatLog] = useState<Array<{ role: "user" | "odin"; text: string }>>([]);

  const chatBottomRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (selectedProduct) {
      setActiveIntelIntent("none");
      setIntelCustomPrice(selectedProduct.contractorPrice.toString());
      setIsPriceSaved(false);
      setIsAllocatedToProject(false);
      setIntelChatLog([]);
    }
  }, [selectedProduct]);

  useEffect(() => {
    if (typeof chatBottomRef.current?.scrollIntoView === "function") {
      chatBottomRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [intakeMode, selectedCategory, hasPublished, isTyping, activeIntelIntent, intelChatLog]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setCategoryDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectCategory = (category: ProductCategory) => {
    setSelectedCategory(category);
    setCategoryDropdownOpen(false);
    setIntakeMode("single_spec");

    const preset = PRESET_PRODUCTS[category]?.[0];
    if (preset) {
      setProductName(preset.name);
      setBrand(preset.brand);
      setSpecification(preset.spec);
      setUnit(preset.unit);
      setContractorPrice(preset.price);
      setMrpPrice(preset.mrp);
      setDepotBay(preset.bay);
      setStockQty(preset.stock);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      if (file.name.endsWith(".csv") || file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
        setIntakeMode("spreadsheet_batch");
      } else {
        // Image / PDF Spec Sheet
        setIntakeMode("image_ocr");
        setSelectedCategory("Cement & Aggregates");
        setProductName("UltraTech Weather Plus 53 Grade Cement");
        setBrand("UltraTech");
        setSpecification("50kg Bags · Water Repellent Formula · IS 1489 Part 1");
        setUnit("Bag (50kg)");
        setContractorPrice(425);
        setMrpPrice(465);
        setStockQty(500);
        setDepotBay("Bay A-02 (Bulk Cement)");
      }
    }, 450);
  };

  const handleTriggerSpreadsheetMock = () => {
    setUploadedFileName("depot_price_catalog_q3.xlsx");
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setIntakeMode("spreadsheet_batch");
    }, 400);
  };

  const handleTriggerImageMock = () => {
    setUploadedFileName("ultratech_bag_packaging_spec.png");
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setIntakeMode("image_ocr");
      setSelectedCategory("Cement & Aggregates");
      setProductName("UltraTech Weather Plus 53 Grade Cement");
      setBrand("UltraTech");
      setSpecification("50kg Bags · Water Repellent Formula · IS 1489 Part 1");
      setUnit("Bag (50kg)");
      setContractorPrice(425);
      setMrpPrice(465);
      setStockQty(500);
      setDepotBay("Bay A-02 (Bulk Cement)");
    }, 400);
  };

  const handlePublishSingleMaterial = () => {
    const prefix = selectedCategory?.slice(0, 3).toUpperCase() || "MAT";
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const skuCode = `HUB-${prefix}-${randomNum}`;

    const newSKU: ProductSKU = {
      id: `sku-custom-${Date.now()}`,
      skuCode,
      name: productName,
      category: selectedCategory || "Cement & Aggregates",
      subcategory: `${selectedCategory || "Material"} Supplies`,
      brand: brand || "Approved OEM",
      specification,
      unit,
      contractorPrice,
      mrpPrice,
      stockQty,
      reorderLevel,
      moq: unit.includes("Bag") ? 50 : unit.includes("MT") ? 1 : 5,
      leadTime,
      depotBay,
      verified: true,
      status: stockQty > reorderLevel ? "In Stock" : "Low Stock",
      createdAt: new Date().toISOString().split("T")[0],
    };

    onAddProductSKU(newSKU);
    setPublishedSkuCode(skuCode);
    setHasPublished(true);
  };

  const handlePublishBatchMaterials = () => {
    if (typeof onAddBatchProducts === "function") {
      onAddBatchProducts(BATCH_IMPORT_MOCK);
    } else {
      BATCH_IMPORT_MOCK.forEach((sku) => onAddProductSKU(sku));
    }
    setBatchImportCount(BATCH_IMPORT_MOCK.length);
    setHasPublished(true);
  };

  const handleReset = () => {
    setIntakeMode("idle");
    setSelectedCategory(null);
    setHasPublished(false);
    setPublishedSkuCode("");
    setBatchImportCount(0);
    setUploadedFileName("");
    setInputText("");
  };

  const handleNaturalInput = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const query = inputText.trim();
    setInputText("");

    if (selectedProduct) {
      setIntelChatLog((prev) => [...prev, { role: "user", text: query }]);
      setIsTyping(true);

      setTimeout(() => {
        setIsTyping(false);
        const lower = query.toLowerCase();
        let reply = `Odin Analysis for ${selectedProduct.name}: Based on current regional logistics and depot inventory (${selectedProduct.stockQty} ${selectedProduct.unit.split(" ")[0]}s in ${selectedProduct.depotBay.split("(")[0].trim()}), contractor demand is tracking steadily with same-day fulfillment capability.`;

        if (lower.includes("price increase") || lower.includes("why did the price") || lower.includes("price change") || lower.includes("rate increase")) {
          reply = `Price Increase Analysis for ${selectedProduct.name}: Regional freight and energy tariffs in North Kerala increased +3.2% this month. Your contractor rate was adjusted from ₹410 to ₹${selectedProduct.contractorPrice} to protect your 12% gross depot margin spread while remaining ₹13 below regional index.`;
        } else if (lower.includes("reorder") || lower.includes("should i order") || lower.includes("runway") || lower.includes("depletion")) {
          reply = `Reorder Recommendation: You currently have ${selectedProduct.stockQty} ${selectedProduct.unit.split(" ")[0]}s on hand. At your daily velocity of 28 units/day, you have ~${Math.round(selectedProduct.stockQty / 28)} days of runway. Odin recommends placing a factory replenishment order within 7 days to maintain safe buffer above your ${selectedProduct.reorderLevel}-unit threshold.`;
        } else if (lower.includes("cheaper") || lower.includes("alternative supplier") || lower.includes("lower cost supplier")) {
          reply = `Alternative Supplier Benchmarks (53-Grade Certified):
1. Birla A1 53 Grade: ₹415/bag (Save ₹10/bag, 1-day lead time)
2. ACC Suraksha 53 Grade: ₹420/bag (Save ₹5/bag)
Note: ${selectedProduct.brand} currently maintains a 94% contractor preference score on Kallisto project sites.`;
        } else if (lower.includes("acc") || lower.includes("compare") || lower.includes("comparison")) {
          reply = `Comparison: ${selectedProduct.name} vs ACC Suraksha 53 Grade:
• 28-day Compressive Strength: 58.5 MPa (${selectedProduct.brand}) vs 56.2 MPa (ACC)
• Initial Setting Time: 125 mins vs 140 mins
• Contractor Rate: ₹${selectedProduct.contractorPrice} vs ₹420/bag
• Compliance: Both exceed IS 1489 Part 1 specifications.`;
        } else if (lower.includes("purchase order") || lower.includes("po") || lower.includes("add 500") || lower.includes("order 500")) {
          reply = `✓ Queued for Next Purchase Order: Added 500 ${selectedProduct.unit.split(" ")[0]}s of ${selectedProduct.name} at wholesale dealer rate ₹380/bag (Total: ₹1,90,000). Ready for your review in the procurement pipeline.`;
        } else if (lower.includes("price") || lower.includes("cost") || lower.includes("rate") || lower.includes("margin")) {
          reply = `Current contractor rate for ${selectedProduct.name} is ₹${selectedProduct.contractorPrice} / ${selectedProduct.unit.split(" ")[0]} (MRP ₹${selectedProduct.mrpPrice}). Gross margin spread is ~12% (₹${Math.round(selectedProduct.contractorPrice * 0.12)} / unit). Recommended price range in North Kerala is ₹420 - ₹435.`;
        } else if (lower.includes("stock") || lower.includes("inventory") || lower.includes("bay") || lower.includes("quantity")) {
          reply = `Depot stock is ${selectedProduct.stockQty} ${selectedProduct.unit.split(" ")[0]}s located at ${selectedProduct.depotBay}. Reorder threshold is set at ${selectedProduct.reorderLevel} ${selectedProduct.unit.split(" ")[0]}s with ${selectedProduct.leadTime} supplier replenishment.`;
        } else if (lower.includes("supplier") || lower.includes("oem") || lower.includes("brand") || lower.includes("manufacturer")) {
          reply = `${selectedProduct.brand} is an authorized Tier-1 OEM partner for Kallisto. Certified test reports (IS compliant) are registered on file for your depot account.`;
        } else if (lower.includes("sales") || lower.includes("order") || lower.includes("demand") || lower.includes("velocity")) {
          reply = `Demand velocity: 420 ${selectedProduct.unit.split(" ")[0]}s dispatched in past 30 days across 3 active contractor projects. Current inventory will cover ~20 operational days.`;
        } else if (lower.includes("project") || lower.includes("boq") || lower.includes("site") || lower.includes("allocate")) {
          reply = `This SKU is eligible for immediate allocation into active project BOQs (Greenwood Residency, Skyline Horizon, Ocean Crest). Delivery lead time is ${selectedProduct.leadTime}.`;
        }

        setIntelChatLog((prev) => [...prev, { role: "odin", text: reply }]);
      }, 400);
      return;
    }

    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const lower = query.toLowerCase();
      if (lower.includes("steel") || lower.includes("rebar") || lower.includes("tata") || lower.includes("jsw")) {
        setSelectedCategory("Steel & TMT");
        setProductName("Tata Tiscon 550D Super Ductile TMT Rebar 12mm");
        setBrand("Tata Steel");
        setSpecification("12mm Diameter · Fe550D Seismic Grade");
        setUnit("Metric Ton (MT)");
        setContractorPrice(62500);
        setMrpPrice(68000);
        setStockQty(45);
        setDepotBay("Bay B-01 (Heavy Steel Yard)");
      } else if (lower.includes("tile") || lower.includes("kajaria") || lower.includes("marble")) {
        setSelectedCategory("Finishes & Tiles");
        setProductName("Kajaria Eternity Glazed Vitrified Tiles 60x120cm");
        setBrand("Kajaria");
        setSpecification("Staturaio White Marble Finish · 9mm Nano Polished");
        setUnit("Box (2 pcs / 15.5 sq.ft)");
        setContractorPrice(1180);
        setMrpPrice(1450);
        setStockQty(340);
        setDepotBay("Bay D-01 (Tile Crates)");
      } else if (lower.includes("paint") || lower.includes("asian") || lower.includes("emulsion")) {
        setSelectedCategory("Paints & Waterproofing");
        setProductName("Asian Paints Apex Ultima Exterior Emulsion 20L");
        setBrand("Asian Paints");
        setSpecification("20L Bucket · 7-Year Anti-Algal UV Protection");
        setUnit("Bucket (20L)");
        setContractorPrice(6850);
        setMrpPrice(7600);
        setStockQty(42);
        setDepotBay("Bay C-01 (Chemicals & Paints)");
      } else {
        setSelectedCategory("Cement & Aggregates");
        setProductName(query);
        setBrand("UltraTech");
        setSpecification(`${query} · High Grade Certified Material`);
        setUnit("Bag (50kg)");
        setContractorPrice(425);
        setMrpPrice(465);
        setStockQty(500);
        setDepotBay("Bay A-02 (Bulk Cement)");
      }
      setIntakeMode("single_spec");
    }, 350);
  };

  return (
    <aside className={styles.aiOrderPanelContainer} aria-label="Odin Material Agent">
      <div className={styles.minimalBookingCard}>
        {/* 1. FIXED TOP HEADER */}
        <header className={styles.minimalBookingHeader}>
          <div className={styles.minimalBotAvatar}>
            <StudioDuotoneIcon size={20} />
            <span className={styles.minimalOnlineDot} />
          </div>
          <div className={styles.minimalHeaderTitles}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <h3 className={styles.minimalHeaderTitle}>
                {selectedProduct ? "Odin · Product Intelligence" : "Onboard to Hub Catalog"}
              </h3>
              {!selectedProduct && (
                <span className={styles.minimalStudioBadge}>
                  ODIN AI
                </span>
              )}
            </div>
            <span className={styles.minimalHeaderSub}>
              {selectedProduct
                ? selectedProduct.skuCode
                : intakeMode === "idle"
                ? "Add materials to your Hub catalog"
                : intakeMode === "spreadsheet_batch"
                ? "AI Spreadsheet Batch Ingestion"
                : intakeMode === "image_ocr"
                ? "AI Vision Spec Extraction"
                : !hasPublished
                ? "AI Specification Spec Sheet"
                : "Materials Onboarded"}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            {!selectedProduct && (
              <button
                type="button"
                className={styles.minimalResetBtn}
                onClick={handleReset}
                title="Reset Material Intake"
                aria-label="Reset Material intake flow"
              >
                <RotateCcw size={13} />
              </button>
            )}
            {onClose && (
              <button
                type="button"
                className={styles.minimalResetBtn}
                onClick={onClose}
                title="Close Panel"
                aria-label="Close Panel"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </header>

        {/* 2. CHAT STREAM — PRODUCT INTELLIGENCE OR ONBOARDING WORKSPACE */}
        <div className={styles.minimalChatStream}>
          {selectedProduct ? (
            /* =========================================================================
               ODIN PRODUCT INTELLIGENCE CONTEXTUAL OPERATING LAYER
               ========================================================================= */
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%" }}>
              {/* TURN 1: PRODUCT SPOTLIGHT & METRICS CARD */}
              <div className={styles.odinChatRow}>
                <div className={styles.odinAvatarIcon} style={{ margin: "2px 0 0 0" }}>
                  <StudioDuotoneIcon size={16} />
                </div>
                <div className={styles.odinChatContent} style={{ width: "100%", flex: 1 }}>
                  <div style={{ marginBottom: "10px" }}>
                    <h4
                      style={{
                        margin: "0 0 3px 0",
                        fontSize: "14.5px",
                        fontWeight: 700,
                        color: "#0f172a",
                        lineHeight: "1.3",
                      }}
                    >
                      {selectedProduct.name}
                    </h4>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11.5px" }}>
                      <span style={{ fontFamily: "monospace", fontWeight: 600, color: "#2563eb" }}>
                        {selectedProduct.skuCode}
                      </span>
                      <span style={{ color: "#cbd5e1" }}>·</span>
                      <span style={{ color: "#64748b" }}>{selectedProduct.category}</span>
                    </div>
                  </div>

                  {/* 4-Item Operational Metric Box */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "7px",
                      padding: "10px 12px",
                      backgroundColor: "#f8fafc",
                      borderRadius: "12px",
                      border: "none",
                      fontSize: "12.5px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ color: "#64748b" }}>Current price:</span>
                      <span style={{ fontWeight: 700, color: "#0f172a" }}>
                        ₹{selectedProduct.contractorPrice.toLocaleString("en-IN")}{" "}
                        <span style={{ fontSize: "11px", fontWeight: 500, color: "#64748b" }}>
                          / {selectedProduct.unit.split(" ")[0]}
                        </span>
                      </span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ color: "#64748b" }}>Stock:</span>
                      <span style={{ fontWeight: 600, color: "#0f172a" }}>
                        {selectedProduct.stockQty} {selectedProduct.unit.split(" ")[0]}
                        {selectedProduct.stockQty > 1 ? "s" : ""}{" "}
                        <span style={{ fontSize: "11px", color: "#94a3b8", fontWeight: 400 }}>
                          ({selectedProduct.depotBay.split("(")[0].trim()})
                        </span>
                      </span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ color: "#64748b" }}>Supplier:</span>
                      <span style={{ fontWeight: 600, color: "#0f172a", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                        {selectedProduct.brand}
                        <span style={{ color: "#059669", fontSize: "11px", fontWeight: 600 }}>✓ Verified</span>
                      </span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ color: "#64748b" }}>Delivery:</span>
                      <span style={{ fontWeight: 600, color: "#2563eb" }}>
                        {selectedProduct.leadTime}
                      </span>
                    </div>
                  </div>

                  {/* Context Question & Action Intents */}
                  <div style={{ marginTop: "12px" }}>
                    <p style={{ margin: "0 0 8px 0", fontSize: "12px", fontWeight: 600, color: "#334155" }}>
                      What would you like to do?
                    </p>

                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                      {[
                        { id: "compare_prices", label: "Compare prices", icon: BarChart3 },
                        { id: "update_price", label: "Update price", icon: Tag },
                        { id: "check_supplier", label: "Check supplier", icon: Building2 },
                        { id: "view_sales", label: "View sales", icon: TrendingUp },
                        { id: "add_to_project", label: "Add to project", icon: ShoppingBag },
                      ].map((item) => {
                        const Icon = item.icon;
                        const isSelected = activeIntelIntent === item.id;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => {
                              setActiveIntelIntent(isSelected ? "none" : (item.id as typeof activeIntelIntent));
                              setIsPriceSaved(false);
                              setIsAllocatedToProject(false);
                            }}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "5px",
                              padding: "6px 12px",
                              borderRadius: "9999px",
                              border: "none",
                              backgroundColor: isSelected ? "#0f172a" : "#f1f5f9",
                              color: isSelected ? "#ffffff" : "#0f172a",
                              fontSize: "11.5px",
                              fontWeight: 600,
                              cursor: "pointer",
                              boxShadow: isSelected
                                ? "0 2px 4px rgba(15, 23, 42, 0.12)"
                                : "none",
                              transition: "all 140ms ease",
                            }}
                            onMouseEnter={(e) => {
                              if (!isSelected) {
                                e.currentTarget.style.backgroundColor = "#e2e8f0";
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!isSelected) {
                                e.currentTarget.style.backgroundColor = "#f1f5f9";
                              }
                            }}
                          >
                            <Icon size={12} color={isSelected ? "#ffffff" : "#0f172a"} />
                            <span>{item.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* INTENT PANEL: 1. COMPARE PRICES */}
              {activeIntelIntent === "compare_prices" && (
                <div className={styles.odinChatRow}>
                  <div className={styles.odinAvatarIcon}>
                    <BarChart3 size={15} color="#2563eb" />
                  </div>
                  <div className={styles.odinChatContent} style={{ width: "100%" }}>
                    <h5 style={{ margin: "0 0 6px 0", fontSize: "12.5px", fontWeight: 700, color: "#0f172a" }}>
                      📊 Regional Price Comparison
                    </h5>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "12px", background: "#f8fafc", padding: "10px", borderRadius: "10px", border: "none" }}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "#64748b" }}>Your Hub Rate:</span>
                        <strong style={{ color: "#0f172a" }}>₹{selectedProduct.contractorPrice} / {selectedProduct.unit.split(" ")[0]}</strong>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "#64748b" }}>Regional Index (North Kerala):</span>
                        <span style={{ fontWeight: 600, color: "#d97706" }}>₹{Math.round(selectedProduct.contractorPrice * 1.03)} (+3.0%)</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "#64748b" }}>Nearby Hub Average:</span>
                        <span style={{ fontWeight: 600, color: "#64748b" }}>₹{Math.round(selectedProduct.contractorPrice * 1.015)} (+1.5%)</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px dashed #e2e8f0", paddingTop: "5px" }}>
                        <span style={{ color: "#64748b" }}>Est. Gross Margin:</span>
                        <strong style={{ color: "#059669" }}>+ ₹{Math.round(selectedProduct.contractorPrice * 0.12)} / unit (12%)</strong>
                      </div>
                    </div>
                    <p style={{ margin: "6px 0 0 0", fontSize: "11.5px", color: "#475569", lineHeight: "1.4" }}>
                      💡 <strong>Odin Recommendation:</strong> Your ₹{selectedProduct.contractorPrice} rate gives local contractors a 3% competitive advantage over builder retail while securing your depot target margin.
                    </p>
                  </div>
                </div>
              )}

              {/* INTENT PANEL: 2. UPDATE PRICE */}
              {activeIntelIntent === "update_price" && (
                <div className={styles.odinChatRow}>
                  <div className={styles.odinAvatarIcon}>
                    <Tag size={15} color="#0f172a" />
                  </div>
                  <div className={styles.odinChatContent} style={{ width: "100%" }}>
                    <h5 style={{ margin: "0 0 6px 0", fontSize: "12.5px", fontWeight: 700, color: "#0f172a" }}>
                      🏷️ Quick Rate Revision
                    </h5>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px", background: "#f8fafc", padding: "10px", borderRadius: "10px", border: "none" }}>
                      <div>
                        <label style={{ fontSize: "11px", color: "#64748b", fontWeight: 600, display: "block", marginBottom: "4px" }}>
                          New Contractor Unit Price (₹ / {selectedProduct.unit}):
                        </label>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <span style={{ fontWeight: 700, color: "#0f172a", fontSize: "14px" }}>₹</span>
                          <input
                            type="number"
                            style={{
                              flex: 1,
                              height: "32px",
                              padding: "0 10px",
                              borderRadius: "6px",
                              border: "1px solid #cbd5e1",
                              fontSize: "13px",
                              fontWeight: 600,
                              outline: "none",
                            }}
                            value={intelCustomPrice}
                            onChange={(e) => {
                              setIntelCustomPrice(e.target.value);
                              setIsPriceSaved(false);
                            }}
                          />
                        </div>
                      </div>

                      {isPriceSaved ? (
                        <div style={{ display: "flex", alignItems: "center", gap: "5px", color: "#059669", fontSize: "11.5px", fontWeight: 600 }}>
                          <CheckCircle2 size={14} />
                          <span>Price updated to ₹{intelCustomPrice} in your live Hub catalog!</span>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            const val = Number(intelCustomPrice);
                            if (val > 0 && onUpdateProduct) {
                              onUpdateProduct({ ...selectedProduct, contractorPrice: val });
                              setIsPriceSaved(true);
                            }
                          }}
                          style={{
                            height: "32px",
                            backgroundColor: "#0f172a",
                            color: "#ffffff",
                            border: "none",
                            borderRadius: "6px",
                            fontSize: "12px",
                            fontWeight: 600,
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "5px",
                          }}
                        >
                          <Check size={13} />
                          <span>Save & Apply Price</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* INTENT PANEL: 3. CHECK SUPPLIER */}
              {activeIntelIntent === "check_supplier" && (
                <div className={styles.odinChatRow}>
                  <div className={styles.odinAvatarIcon}>
                    <Building2 size={15} color="#0f172a" />
                  </div>
                  <div className={styles.odinChatContent} style={{ width: "100%" }}>
                    <h5 style={{ margin: "0 0 6px 0", fontSize: "12.5px", fontWeight: 700, color: "#0f172a" }}>
                      🏭 Supplier & OEM Logistics Profile
                    </h5>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "12px", background: "#f8fafc", padding: "10px", borderRadius: "10px", border: "none" }}>
                      <div><strong>Primary OEM:</strong> {selectedProduct.brand} Building Materials Ltd.</div>
                      <div><strong>Hub Depot Account:</strong> <code>ACT-KNR-HUB-881</code></div>
                      <div><strong>Batch Testing:</strong> IS 1489 / BIS QA Grade 53 Certified</div>
                      <div><strong>Replenishment:</strong> Direct factory dispatch (Lead: {selectedProduct.leadTime})</div>
                      <div><strong>Reorder Threshold:</strong> {selectedProduct.reorderLevel} {selectedProduct.unit.split(" ")[0]}s</div>
                    </div>
                  </div>
                </div>
              )}

              {/* INTENT PANEL: 4. VIEW SALES */}
              {activeIntelIntent === "view_sales" && (
                <div className={styles.odinChatRow}>
                  <div className={styles.odinAvatarIcon}>
                    <TrendingUp size={15} color="#0f172a" />
                  </div>
                  <div className={styles.odinChatContent} style={{ width: "100%" }}>
                    <div
                      style={{
                        backgroundColor: "#ffffff",
                        padding: "12px",
                        borderRadius: "12px",
                        border: "none",
                        boxShadow: "0 1px 4px rgba(15, 23, 42, 0.07), 0 1px 2px rgba(15, 23, 42, 0.03)",
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px",
                      }}
                    >
                      {/* Header */}
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", color: "#64748b" }}>
                          Sales & Demand
                        </span>
                        <span style={{ fontSize: "11px", fontWeight: 600, color: "#059669", backgroundColor: "#ecfdf5", padding: "2px 6px", borderRadius: "4px" }}>
                          ↗ +18% MoM
                        </span>
                      </div>

                      {/* Main Metric Spotlight */}
                      <div>
                        <div style={{ fontSize: "20px", fontWeight: 700, color: "#0f172a", lineHeight: "1.1", letterSpacing: "-0.02em" }}>
                          420 {selectedProduct.unit.split(" ")[0].toLowerCase()}s
                        </div>
                        <div style={{ fontSize: "11.5px", color: "#64748b", marginTop: "2px" }}>
                          30-day dispatch volume
                        </div>
                      </div>

                      {/* Visual Micro Sparkline Bar Graph */}
                      <div style={{ backgroundColor: "#f8fafc", padding: "8px 10px", borderRadius: "8px", border: "none" }}>
                        <div style={{ display: "flex", alignItems: "flex-end", gap: "4px", height: "30px", marginBottom: "6px" }}>
                          {[
                            { h: 35, c: "#93c5fd" },
                            { h: 25, c: "#93c5fd" },
                            { h: 45, c: "#93c5fd" },
                            { h: 45, c: "#93c5fd" },
                            { h: 60, c: "#60a5fa" },
                            { h: 75, c: "#3b82f6" },
                            { h: 88, c: "#2563eb" },
                            { h: 100, c: "#1d4ed8" },
                            { h: 85, c: "#2563eb" },
                            { h: 95, c: "#1d4ed8" },
                          ].map((bar, i) => (
                            <div
                              key={i}
                              style={{
                                flex: 1,
                                height: `${bar.h}%`,
                                backgroundColor: bar.c,
                                borderRadius: "2px",
                                transition: "height 0.2s ease",
                              }}
                            />
                          ))}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "11px", fontWeight: 600, color: "#16a34a" }}>
                          <TrendingUp size={12} strokeWidth={2.5} />
                          <span>Demand trending upward</span>
                        </div>
                      </div>

                      {/* Velocity Breakdown */}
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", paddingTop: "2px" }}>
                        <div style={{ backgroundColor: "#f8fafc", padding: "6px 8px", borderRadius: "6px" }}>
                          <div style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a" }}>28 / day</div>
                          <div style={{ fontSize: "10.5px", color: "#64748b" }}>run-rate</div>
                        </div>
                        <div style={{ backgroundColor: "#f8fafc", padding: "6px 8px", borderRadius: "6px" }}>
                          <div style={{ fontSize: "13px", fontWeight: 700, color: "#059669" }}>
                            {Math.round(selectedProduct.stockQty / 28)} days
                          </div>
                          <div style={{ fontSize: "10.5px", color: "#64748b" }}>inventory runway</div>
                        </div>
                      </div>

                      {/* Odin Recommendation Pill */}
                      <div
                        style={{
                          backgroundColor: "#eff6ff",
                          border: "none",
                          borderRadius: "8px",
                          padding: "7px 10px",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          fontSize: "11.5px",
                          color: "#1e40af",
                        }}
                      >
                        <Sparkles size={13} color="#2563eb" style={{ flexShrink: 0 }} />
                        <span>
                          <strong>Odin recommendation:</strong> Reorder within 7 days.
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* INTENT PANEL: 5. ADD TO PROJECT */}
              {activeIntelIntent === "add_to_project" && (
                <div className={styles.odinChatRow}>
                  <div className={styles.odinAvatarIcon}>
                    <ShoppingBag size={15} color="#0f172a" />
                  </div>
                  <div className={styles.odinChatContent} style={{ width: "100%" }}>
                    <h5 style={{ margin: "0 0 6px 0", fontSize: "12.5px", fontWeight: 700, color: "#0f172a" }}>
                      🏗️ Allocate SKU to Active Project BOQ
                    </h5>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px", background: "#ffffff", padding: "10px", borderRadius: "8px", border: "none", boxShadow: "0 1px 4px rgba(15, 23, 42, 0.07), 0 1px 2px rgba(15, 23, 42, 0.03)" }}>
                      <div>
                        <label style={{ fontSize: "11px", color: "#64748b", fontWeight: 600, display: "block", marginBottom: "4px" }}>
                          Target Project Site:
                        </label>
                        <select
                          value={intelSelectedProject}
                          onChange={(e) => setIntelSelectedProject(e.target.value)}
                          style={{
                            width: "100%",
                            height: "32px",
                            padding: "0 8px",
                            borderRadius: "6px",
                            border: "1px solid #cbd5e1",
                            fontSize: "12px",
                            outline: "none",
                          }}
                        >
                          <option value="Greenwood Residency (Site Phase 2)">Greenwood Residency (Site Phase 2)</option>
                          <option value="Skyline Horizon Villa">Skyline Horizon Villa</option>
                          <option value="Palm Grove Retreat">Palm Grove Retreat</option>
                        </select>
                      </div>

                      <div>
                        <label style={{ fontSize: "11px", color: "#64748b", fontWeight: 600, display: "block", marginBottom: "4px" }}>
                          Allocation Quantity ({selectedProduct.unit}):
                        </label>
                        <input
                          type="number"
                          value={intelProjectQty}
                          onChange={(e) => setIntelProjectQty(e.target.value)}
                          style={{
                            width: "100%",
                            height: "32px",
                            padding: "0 10px",
                            borderRadius: "6px",
                            border: "1px solid #cbd5e1",
                            fontSize: "12px",
                            fontWeight: 600,
                            outline: "none",
                          }}
                        />
                      </div>

                      {isAllocatedToProject ? (
                        <div style={{ display: "flex", alignItems: "center", gap: "5px", color: "#059669", fontSize: "11.5px", fontWeight: 600 }}>
                          <CheckCircle2 size={14} />
                          <span>{intelProjectQty} {selectedProduct.unit.split(" ")[0]}s locked & reserved for {intelSelectedProject}!</span>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setIsAllocatedToProject(true)}
                          style={{
                            height: "32px",
                            backgroundColor: "#0f172a",
                            color: "#ffffff",
                            border: "none",
                            borderRadius: "6px",
                            fontSize: "12px",
                            fontWeight: 600,
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "5px",
                          }}
                        >
                          <ShoppingBag size={13} />
                          <span>Allocate & Reserve for BOQ</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* INTEL CONVERSATION LOG */}
              {intelChatLog.map((msg, idx) => (
                <div key={idx} className={styles.odinChatRow} style={{ justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
                  {msg.role === "odin" && (
                    <div className={styles.odinAvatarIcon}>
                      <StudioDuotoneIcon size={16} />
                    </div>
                  )}
                  <div
                    className={styles.odinChatContent}
                    style={{
                      flex: msg.role === "user" ? "0 1 auto" : 1,
                      marginLeft: msg.role === "user" ? "auto" : undefined,
                      alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                      width: msg.role === "user" ? "fit-content" : "100%",
                      backgroundColor: msg.role === "user" ? "#f1f5f9" : "transparent",
                      color: msg.role === "user" ? "#0f172a" : "#1e293b",
                      border: "none",
                      padding: msg.role === "user" ? "8px 14px" : "2px 0",
                      borderRadius: msg.role === "user" ? "14px" : "0",
                      fontSize: "12.5px",
                      maxWidth: msg.role === "user" ? "85%" : "100%",
                      lineHeight: "1.5",
                      fontWeight: msg.role === "user" ? 500 : 400,
                    }}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* =========================================================================
               STANDARD ODIN ONBOARDING INTAKE STREAM
               ========================================================================= */
            <>
              {/* TURN 1: ODIN WELCOME & INTAKE OPTIONS */}
              <div className={styles.odinChatRow}>
                <div className={styles.odinAvatarIcon} style={{ margin: "2px 0 0 0" }}>
                  <StudioDuotoneIcon size={16} />
                </div>
                <div className={styles.odinChatContent} style={{ width: "100%", flex: 1 }}>
                  <p className={styles.odinMessageText} style={{ margin: "0 0 8px 0", fontSize: "13px", lineHeight: "1.4" }}>
                    Upload your supplier price list. Odin will organize the products automatically.
                  </p>

                  {intakeMode === "idle" && (
                    <div className={styles.quickIngestionGrid}>
                      <button
                        type="button"
                        className={styles.quickIngestionCard}
                        onClick={handleTriggerSpreadsheetMock}
                      >
                        <div className={styles.quickIngestionIconWrap} style={{ background: "#ecfdf5", color: "#10b981" }}>
                          <FileSpreadsheet size={16} />
                        </div>
                        <div className={styles.quickIngestionTexts}>
                          <span className={styles.quickIngestionTitle}>Upload Supplier Price List</span>
                          <span className={styles.quickIngestionSub}>Import CSV or Excel spreadsheet</span>
                        </div>
                      </button>

                      <button
                        type="button"
                        className={styles.quickIngestionCard}
                        onClick={handleTriggerImageMock}
                      >
                        <div className={styles.quickIngestionIconWrap} style={{ background: "#eff6ff", color: "#2563eb" }}>
                          <ImageIcon size={16} />
                        </div>
                        <div className={styles.quickIngestionTexts}>
                          <span className={styles.quickIngestionTitle}>Scan Product Packaging / Spec</span>
                          <span className={styles.quickIngestionSub}>Extract brand, grade, and specifications</span>
                        </div>
                      </button>

                      <button
                        type="button"
                        className={styles.quickIngestionCard}
                        onClick={() => {
                          setIntakeMode("select_category");
                          setCategoryDropdownOpen(false);
                        }}
                      >
                        <div className={styles.quickIngestionIconWrap} style={{ background: "#fdf4ff", color: "#a855f7" }}>
                          <Boxes size={16} />
                        </div>
                        <div className={styles.quickIngestionTexts}>
                          <span className={styles.quickIngestionTitle}>Add Single Product Manually</span>
                          <span className={styles.quickIngestionSub}>Select category & enter product details</span>
                        </div>
                      </button>
                    </div>
                  )}

                  {/* TURN 1B: SELECT CATEGORY ONLY WHEN USER CHOOSES TO ADD A NEW PRODUCT */}
                  {intakeMode === "select_category" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "4px" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span style={{ fontSize: "12px", fontWeight: 600, color: "#0f172a" }}>
                          Select material category for the new product:
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setIntakeMode("idle");
                            setCategoryDropdownOpen(false);
                          }}
                          style={{
                            border: "none",
                            background: "transparent",
                            color: "#64748b",
                            fontSize: "11.5px",
                            fontWeight: 600,
                            cursor: "pointer",
                          }}
                        >
                          Cancel
                        </button>
                      </div>

                      {/* Category Dropdown Selector */}
                      <div className={styles.chatDropdownWrapper} ref={dropdownRef}>
                        <button
                          type="button"
                          className={styles.chatDropdownTrigger}
                          onClick={() => setCategoryDropdownOpen((prev) => !prev)}
                          aria-expanded={categoryDropdownOpen}
                        >
                          <div className={styles.chatDropdownTriggerLeft}>
                            <Boxes size={16} className={styles.chatDropdownTriggerIcon} />
                            <span className={styles.chatDropdownPlaceholder}>
                              Select a material category ({CATEGORIES.length} available)...
                            </span>
                          </div>
                          <ChevronDown
                            size={14}
                            className={`${styles.chatDropdownChevron} ${
                              categoryDropdownOpen ? styles.chatDropdownChevronOpen : ""
                            }`}
                          />
                        </button>

                        {categoryDropdownOpen && (
                          <div className={styles.chatDropdownMenu}>
                            <div className={styles.chatDropdownSearchWrap}>
                              <Search size={13} className={styles.chatDropdownSearchIcon} />
                              <input
                                type="text"
                                className={styles.chatDropdownSearchInput}
                                placeholder="Search category (e.g. Steel, Cement)..."
                                value={categorySearch}
                                onChange={(e) => setCategorySearch(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                autoFocus
                              />
                            </div>
                            <div className={styles.chatDropdownOptionsList}>
                              {CATEGORIES.filter((c) =>
                                c.toLowerCase().includes(categorySearch.toLowerCase())
                              ).map((category) => (
                                <button
                                  key={category}
                                  type="button"
                                  className={styles.chatDropdownOption}
                                  onClick={() => handleSelectCategory(category)}
                                >
                                  <span className={styles.chatDropdownOptionTitle}>{category}</span>
                                  <ArrowRight size={12} color="#94a3b8" />
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

              {/* Hidden File Input */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls,.png,.jpg,.jpeg,.pdf"
                style={{ display: "none" }}
                onChange={handleFileUpload}
              />

              {/* TURN 2: SPREADSHEET BATCH EXTRACTION */}
              {intakeMode === "spreadsheet_batch" && (
                <div className={styles.odinChatRow}>
                  <div className={styles.odinAvatarIcon}>
                    <StudioDuotoneIcon size={16} />
                  </div>
                  <div className={styles.odinChatContent} style={{ width: "100%" }}>
                    <div className={styles.fileParsedBanner}>
                      <FileSpreadsheet size={15} color="#059669" />
                      <span>Parsed {uploadedFileName || "depot_price_catalog_q3.xlsx"} — <strong>{BATCH_IMPORT_MOCK.length} SKUs Identified</strong></span>
                    </div>

                    <p className={styles.odinMessageText} style={{ marginTop: "8px" }}>
                      I extracted the following materials with specs and pricing from your sheet:
                    </p>

                    <div className={styles.batchPreviewList}>
                      {BATCH_IMPORT_MOCK.map((item, idx) => (
                        <div key={item.id} className={styles.batchPreviewRow}>
                          <div className={styles.batchRowLeft}>
                            <span className={styles.batchIndex}>{idx + 1}</span>
                            <div className={styles.batchDetails}>
                              <strong className={styles.batchName}>{item.name}</strong>
                              <span className={styles.batchSpec}>{item.specification}</span>
                            </div>
                          </div>
                          <div className={styles.batchRowRight}>
                            <span className={styles.batchPrice}>₹{item.contractorPrice.toLocaleString("en-IN")}</span>
                            <span className={styles.batchUnit}>/ {item.unit}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {!hasPublished && (
                      <button
                        type="button"
                        className={styles.publishCatalogCta}
                        onClick={handlePublishBatchMaterials}
                      >
                        <Sparkles size={14} />
                        <span>Publish {BATCH_IMPORT_MOCK.length} SKUs to Hub Catalog</span>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* TURN 3: SINGLE SPECIFICATION EXTRACTION */}
              {(intakeMode === "single_spec" || intakeMode === "image_ocr") && (
                <div className={styles.odinChatRow}>
                  <div className={styles.odinAvatarIcon}>
                    <StudioDuotoneIcon size={16} />
                  </div>
                  <div className={styles.odinChatContent} style={{ width: "100%" }}>
                    {intakeMode === "image_ocr" && (
                      <div className={styles.fileParsedBanner} style={{ background: "#eff6ff", color: "#1e40af", borderColor: "#bfdbfe" }}>
                        <ImageIcon size={15} color="#2563eb" />
                        <span>OCR Vision Extracted from {uploadedFileName || "packaging_spec.png"}</span>
                      </div>
                    )}

                    <p className={styles.odinMessageText} style={{ marginTop: intakeMode === "image_ocr" ? "8px" : "0" }}>
                      Here are the extracted specifications. You can adjust your contractor pricing and stock before publishing:
                    </p>

                    {/* Extracted Spec Editor Card */}
                    <div className={styles.extractedSpecCard}>
                      <div className={styles.specHeaderRow}>
                        <div className={styles.specBadgeRow}>
                          <span className={styles.specCategoryBadge}>{selectedCategory || "Material"}</span>
                          <span className={styles.specBrandBadge}>{brand || "OEM"}</span>
                        </div>
                      </div>

                      <div className={styles.specInputGroup}>
                        <label className={styles.specLabel}>Material Name & Grade</label>
                        <input
                          type="text"
                          className={styles.specInput}
                          value={productName}
                          onChange={(e) => setProductName(e.target.value)}
                        />
                      </div>

                      <div className={styles.specInputGroup}>
                        <label className={styles.specLabel}>Specification & Standards</label>
                        <input
                          type="text"
                          className={styles.specInput}
                          value={specification}
                          onChange={(e) => setSpecification(e.target.value)}
                        />
                      </div>

                      <div className={styles.specGrid2}>
                        <div className={styles.specInputGroup}>
                          <label className={styles.specLabel}>Your Contractor Rate (₹)</label>
                          <input
                            type="number"
                            className={styles.specInput}
                            value={contractorPrice}
                            onChange={(e) => setContractorPrice(Number(e.target.value))}
                          />
                        </div>
                        <div className={styles.specInputGroup}>
                          <label className={styles.specLabel}>MRP Reference (₹)</label>
                          <input
                            type="number"
                            className={styles.specInput}
                            value={mrpPrice}
                            onChange={(e) => setMrpPrice(Number(e.target.value))}
                          />
                        </div>
                      </div>

                      <div className={styles.specGrid2}>
                        <div className={styles.specInputGroup}>
                          <label className={styles.specLabel}>Initial Stock Qty</label>
                          <input
                            type="number"
                            className={styles.specInput}
                            value={stockQty}
                            onChange={(e) => setStockQty(Number(e.target.value))}
                          />
                        </div>
                        <div className={styles.specInputGroup}>
                          <label className={styles.specLabel}>Depot Bay</label>
                          <input
                            type="text"
                            className={styles.specInput}
                            value={depotBay}
                            onChange={(e) => setDepotBay(e.target.value)}
                          />
                        </div>
                      </div>

                      {!hasPublished && (
                        <button
                          type="button"
                          className={styles.publishCatalogCta}
                          onClick={handlePublishSingleMaterial}
                        >
                          <CheckCircle2 size={14} />
                          <span>Publish SKU to Hub Catalog</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TURN 4: PUBLISHED SUCCESS CONFIRMATION */}
              {hasPublished && (
                <div className={styles.odinChatRow}>
                  <div className={styles.odinAvatarIcon}>
                    <StudioDuotoneIcon size={16} />
                  </div>
                  <div className={styles.odinChatContent} style={{ width: "100%" }}>
                    <div className={styles.orderSuccessCard}>
                      <div className={styles.orderSuccessHeader}>
                        <div className={styles.orderSuccessIconWrap}>
                          <Check size={16} strokeWidth={3} />
                        </div>
                        <div className={styles.orderSuccessTitles}>
                          <span className={styles.orderSuccessTitle}>Published to Hub Catalog</span>
                          <span className={styles.orderSuccessSub}>
                            {batchImportCount > 0
                              ? `${batchImportCount} SKUs are now live for contractor orders`
                              : `${publishedSkuCode} is now live for contractor orders`}
                          </span>
                        </div>
                      </div>

                      <div className={styles.orderSuccessBody}>
                        {batchImportCount > 0 ? (
                          <div className={styles.orderSuccessRow}>
                            <span className={styles.orderSuccessKey}>Batch Items</span>
                            <span className={styles.orderSuccessVal}>{batchImportCount} SKUs Active</span>
                          </div>
                        ) : (
                          <>
                            <div className={styles.orderSuccessRow}>
                              <span className={styles.orderSuccessKey}>SKU Code</span>
                              <span className={styles.orderSuccessVal} style={{ fontFamily: "monospace", color: "#2563eb" }}>
                                {publishedSkuCode}
                              </span>
                            </div>
                            <div className={styles.orderSuccessRow}>
                              <span className={styles.orderSuccessKey}>Rate</span>
                              <span className={styles.orderSuccessVal}>
                                ₹{contractorPrice.toLocaleString("en-IN")} / {unit}
                              </span>
                            </div>
                          </>
                        )}
                      </div>

                      <button
                        type="button"
                        className={styles.orderSuccessAgainBtn}
                        onClick={handleReset}
                      >
                        + Onboard Another Material SKU
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {isTyping && (
            <div className={styles.odinChatRow}>
              <div className={styles.odinAvatarIcon}>
                <StudioDuotoneIcon size={16} />
              </div>
              <div style={{ display: "flex", gap: "4px", padding: "2px 0", background: "transparent" }}>
                <span style={{ fontSize: "12px", color: "#64748b", fontStyle: "italic" }}>
                  ✨ Odin AI is analyzing context...
                </span>
              </div>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* 3. PROMPT ACTION SUGGESTIONS & COMPOSER */}
        {selectedProduct && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              overflowX: "auto",
              padding: "0 5px 6px 5px",
              scrollbarWidth: "none",
            }}
          >
            {[
              "Why did the price increase?",
              "Should I reorder?",
              "Find a cheaper supplier",
              "Compare this with ACC",
              "Add 500 bags to next PO",
            ].map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => {
                  setInputText(suggestion);
                }}
                style={{
                  fontSize: "11px",
                  fontWeight: 500,
                  color: "#475569",
                  backgroundColor: "#f1f5f9",
                  border: "none",
                  borderRadius: "9999px",
                  padding: "4px 10px",
                  whiteSpace: "nowrap",
                  cursor: "pointer",
                  transition: "all 140ms ease",
                  flexShrink: 0,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#e2e8f0";
                  e.currentTarget.style.color = "#0f172a";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#f1f5f9";
                  e.currentTarget.style.color = "#475569";
                }}
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}

        {/* PROMPT COMPOSER BOX (MATCHING REFERENCE) */}
        <form className={styles.minimalComposer} onSubmit={handleNaturalInput}>
          <textarea
            className={styles.minimalInput}
            rows={2}
            placeholder={
              selectedProduct
                ? "Ask Odin about this product..."
                : intakeMode === "idle"
                ? "Describe material (e.g. 500 bags of UltraTech at 425)..."
                : "Type message to refine specifications..."
            }
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleNaturalInput(e);
              }
            }}
          />

          <div className={styles.composerBottomBar}>
            <div className={styles.composerLeftGroup}>
              <button
                type="button"
                className={styles.composerPlusBtn}
                onClick={() => fileInputRef.current?.click()}
                title="Attach CSV, Excel or Product Photo"
                aria-label="Attach file"
              >
                <Plus size={14} strokeWidth={2} />
              </button>

              <button
                type="button"
                className={styles.composerScopeTag}
                onClick={() => {}}
                title="Scope selection"
                aria-label="Scope"
              >
                <span>All</span>
                <ChevronDown size={12} color="#64748b" />
              </button>
            </div>

            <div className={styles.composerRightGroup}>
              <button
                type="button"
                className={styles.composerMicBtn}
                onClick={() => {}}
                title="Voice dictation"
                aria-label="Voice dictation"
              >
                <Mic size={15} />
              </button>

              <button
                type="submit"
                className={styles.minimalSendBtn}
                style={inputText.trim() ? { backgroundColor: "#2563eb", borderColor: "#2563eb", color: "#ffffff" } : undefined}
                aria-label="Send prompt"
                title="Send prompt"
              >
                <SendHorizontal size={14} style={{ marginLeft: "1px" }} />
              </button>
            </div>
          </div>
        </form>
      </div>
    </aside>
  );
}
