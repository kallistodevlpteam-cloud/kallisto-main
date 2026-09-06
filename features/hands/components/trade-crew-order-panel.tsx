"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  BadgeCheck,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock,
  CreditCard,
  FolderOpen,
  MapPin,
  QrCode,
  RotateCcw,
  Search,
  ShieldCheck,
  Users,
  Wallet,
  Zap,
} from "lucide-react";
import {
  StudioDuotoneIcon,
  ProjectsDuotoneIcon,
  HandsDuotoneIcon,
  SpreadsheetDuotoneIcon,
  LockDuotoneIcon,
  RupeeIcon,
} from "@/components/layout/sidebar-icons";
import type { TradeCrew } from "../services/trade-crews.mock";
import styles from "./trade-crew-detail.module.css";

export interface KallistoHandsProjectContext {
  id: string;
  name: string;
  location: string;
  area: string;
  type: string;
  stage: string;
  clientName: string;
  scopeNotes: string[];
}

export const KALLISTO_HANDS_PROJECTS: KallistoHandsProjectContext[] = [
  {
    id: "proj-003",
    name: "Villa Renovation",
    location: "Kannur",
    area: "2,400 sq.ft",
    type: "Residential Renovation",
    stage: "Structural & Workforce",
    clientName: "Anoop Kumar",
    scopeNotes: [
      "Daily shift site reporting",
      "Lead supervisor coordination",
      "Standard safety compliance & PPE",
      "Escrow-protected milestone payments",
    ],
  },
  {
    id: "proj-001",
    name: "Nila Residence",
    location: "Trivandrum",
    area: "3,200 sq.ft",
    type: "Luxury Residential Villa",
    stage: "Structural Concrete",
    clientName: "Arjun Mehta",
    scopeNotes: [
      "Site utility integration & safety gear",
      "Daily muster roll tracking",
      "Quality check at reinforcement stages",
      "Milestone inspection sign-offs",
    ],
  },
  {
    id: "proj-002",
    name: "Azure Beach Villa",
    location: "Calicut",
    area: "2,800 sq.ft",
    type: "Contemporary Beach Villa",
    stage: "Masonry & Plastering",
    clientName: "Priya Menon",
    scopeNotes: [
      "Dedicated foreman & QA inspections",
      "Equipment & power tool checklist",
      "Daily productivity log & sign-offs",
      "Milestone escrow protection",
    ],
  },
  {
    id: "proj-004",
    name: "Horizon Bay Villa",
    location: "Kochi",
    area: "4,100 sq.ft",
    type: "Waterfront Residence",
    stage: "Finishing & Carpentry",
    clientName: "Nikhil Varma",
    scopeNotes: [
      "Specialized skilled gang execution",
      "Material handling & safety protocols",
      "Daily digital attendance verification",
      "Turnover inspection checkpoints",
    ],
  },
];

export interface TradePackage {
  id: string;
  title: string;
  description: string;
  dailyRate: number;
  durationDays: number;
  workerCount: number;
  features: string[];
}

export interface TradeCrewOrderPanelProps {
  crew: TradeCrew;
  projectId?: string;
  initialPackageId?: string;
  onOpenDrawer?: () => void;
}

export function TradeCrewOrderPanel({
  crew,
  projectId,
  initialPackageId,
}: TradeCrewOrderPanelProps) {
  const packages: TradePackage[] = [
    {
      id: "std-gang",
      title: `Standard ${crew.trade} Gang Shift`,
      description: `Coordinated squad of ${crew.crewSizeMin || 4} verified tradesmen and helpers.`,
      dailyRate: crew.dailyRate * (crew.crewSizeMin || 4),
      durationDays: 12,
      workerCount: crew.crewSizeMin || 4,
      features: [
        "Daily shift site reporting",
        "Lead supervisor coordination",
        "Standard safety compliance & PPE",
        "Escrow-protected milestone payments",
      ],
    },
    {
      id: "scaled-squad",
      title: `Fast-Track ${crew.trade} Squad`,
      description: `Double-capacity gang of ${Math.min(
        crew.crewSizeMax || 16,
        (crew.crewSizeMin || 4) * 2,
      )} workers for rapid execution.`,
      dailyRate: crew.dailyRate * Math.min(crew.crewSizeMax || 16, (crew.crewSizeMin || 4) * 2),
      durationDays: 6,
      workerCount: Math.min(crew.crewSizeMax || 16, (crew.crewSizeMin || 4) * 2),
      features: [
        "Rapid mobilization in 48 hours",
        "Dedicated foreman & QA inspections",
        "Equipment & power tool checklist",
        "Daily productivity log & sign-offs",
      ],
    },
  ];

  const initialProject =
    KALLISTO_HANDS_PROJECTS.find((p) => p.id === projectId) || null;

  const [selectedProject, setSelectedProject] =
    useState<KallistoHandsProjectContext | null>(initialProject);

  const defaultPkg = packages.find((p) => p.id === initialPackageId) || packages[0];
  const [selectedPackage, setSelectedPackage] = useState<TradePackage>(defaultPkg);

  useEffect(() => {
    if (initialPackageId) {
      const pkg = packages.find((p) => p.id === initialPackageId);
      if (pkg) setSelectedPackage(pkg);
    }
  }, [initialPackageId]);

  // Completed / Active Stages in the timeline
  const [hasReviewed, setHasReviewed] = useState(false);
  const [hasPlacedOrder, setHasPlacedOrder] = useState(false);
  const [hasPaid, setHasPaid] = useState(false);

  // Dropdown States
  const [projectDropdownOpen, setProjectDropdownOpen] = useState(false);
  const [projectSearchQuery, setProjectSearchQuery] = useState("");
  const [packageDropdownOpen, setPackageDropdownOpen] = useState(false);

  // Input & Payment States
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<
    "wallet" | "upi" | "netbanking" | "card"
  >("wallet");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [orderNumber, setOrderNumber] = useState("KAL-71089");

  const chatBottomRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const totalPackageCost = selectedPackage.dailyRate * selectedPackage.durationDays;
  const m1Amount = Math.round(totalPackageCost * 0.3);
  const m2Amount = Math.round(totalPackageCost * 0.4);
  const m3Amount = totalPackageCost - m1Amount - m2Amount;

  // Auto-scroll on new chat turns
  useEffect(() => {
    if (typeof chatBottomRef.current?.scrollIntoView === "function") {
      chatBottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [
    selectedProject,
    selectedPackage,
    hasReviewed,
    hasPlacedOrder,
    hasPaid,
    isTyping,
    isProcessingPayment,
  ]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProjectDropdownOpen(false);
        setPackageDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredProjects = KALLISTO_HANDS_PROJECTS.filter(
    (p) =>
      p.name.toLowerCase().includes(projectSearchQuery.toLowerCase()) ||
      p.location.toLowerCase().includes(projectSearchQuery.toLowerCase()) ||
      p.type.toLowerCase().includes(projectSearchQuery.toLowerCase()),
  );

  const handleSelectProject = (proj: KallistoHandsProjectContext) => {
    setSelectedProject(proj);
    setProjectDropdownOpen(false);
    setProjectSearchQuery("");
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
    }, 300);
  };

  const handleSelectPackage = (pkg: TradePackage) => {
    setSelectedPackage(pkg);
    setPackageDropdownOpen(false);
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
    }, 300);
  };

  const handleTriggerReview = () => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setHasReviewed(true);
    }, 300);
  };

  const handleTriggerPayment = () => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setHasPlacedOrder(true);
    }, 300);
  };

  const handleExecutePayment = () => {
    setIsProcessingPayment(true);
    setTimeout(() => {
      setIsProcessingPayment(false);
      const generated = `KAL-${Math.floor(10000 + Math.random() * 90000)}`;
      setOrderNumber(generated);
      setHasPaid(true);
    }, 1000);
  };

  const handleNaturalInput = (e: React.FormEvent) => {
    e.preventDefault();
    const query = inputText.trim();
    if (!query) return;
    setInputText("");

    const lower = query.toLowerCase();

    const matchedProject = KALLISTO_HANDS_PROJECTS.find(
      (p) =>
        lower.includes(p.name.toLowerCase()) ||
        p.name.toLowerCase().includes(lower) ||
        lower.includes(p.location.toLowerCase()),
    );

    if (matchedProject && !selectedProject) {
      handleSelectProject(matchedProject);
      return;
    }

    const matchedPkg = packages.find(
      (p) =>
        lower.includes(p.title.toLowerCase()) ||
        p.title.toLowerCase().includes(lower) ||
        (lower.includes("fast") && p.id === "scaled-squad") ||
        (lower.includes("standard") && p.id === "std-gang"),
    );

    if (matchedPkg) {
      if (!selectedProject) {
        setSelectedProject(KALLISTO_HANDS_PROJECTS[0]);
      }
      handleSelectPackage(matchedPkg);
      return;
    }

    if (lower.includes("review") || lower.includes("order") || lower.includes("summary")) {
      if (selectedProject && !hasReviewed) {
        handleTriggerReview();
      }
      return;
    }

    if (lower.includes("place") || lower.includes("proceed")) {
      if (hasReviewed && !hasPlacedOrder) {
        handleTriggerPayment();
      }
      return;
    }

    if (lower.includes("pay") || lower.includes("checkout")) {
      if (hasPlacedOrder && !hasPaid) {
        handleExecutePayment();
      }
      return;
    }

    if (lower.includes("reset") || lower.includes("clear") || lower.includes("restart")) {
      handleReset();
    }
  };

  const handleReset = () => {
    setSelectedProject(null);
    setSelectedPackage(packages[0]);
    setHasReviewed(false);
    setHasPlacedOrder(false);
    setHasPaid(false);
    setInputText("");
    setIsProcessingPayment(false);
  };

  const currentStepTitle = !selectedProject
    ? "Step 1 · Choose Project"
    : !hasReviewed
    ? "Step 2 · Order Summary"
    : !hasPlacedOrder
    ? "Step 3 · Milestone Escrow Review"
    : !hasPaid
    ? "Step 4 · Secure Escrow Payment"
    : "Deployment Confirmed";

  return (
    <aside className={styles.aiOrderPanelContainer} aria-label="Odin Hands Order Agent">
      <div className={styles.minimalBookingCard}>
        {/* 1. FIXED TOP HEADER */}
        <header className={styles.minimalBookingHeader}>
          <div className={styles.minimalBotAvatar}>
            <StudioDuotoneIcon size={20} />
            <span className={styles.minimalOnlineDot} />
          </div>
          <div className={styles.minimalHeaderTitles}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <h3 className={styles.minimalHeaderTitle}>Odin Order Agent</h3>
              <span
                style={{
                  fontSize: "9.5px",
                  fontWeight: "750",
                  color: "#0284c7",
                  background: "#e0f2fe",
                  padding: "1px 6px",
                  borderRadius: "9999px",
                  letterSpacing: "0.02em",
                }}
              >
                STUDIO
              </span>
            </div>
            <span className={styles.minimalHeaderSub}>{currentStepTitle}</span>
          </div>
          <button
            type="button"
            className={styles.minimalResetBtn}
            onClick={handleReset}
            title="Reset Order"
            aria-label="Reset order flow"
          >
            <RotateCcw size={13} />
          </button>
        </header>

        {/* 2. CHAT STREAM — PERSISTENT CONVERSATION TIMELINE */}
        <div className={styles.minimalChatStream}>
          {/* TURN 1: ODIN INITIAL PROMPT & PROJECT DROPDOWN */}
          <div className={styles.odinChatRow}>
            <div className={styles.odinAvatarIcon}>
              <StudioDuotoneIcon size={16} />
            </div>
            <div className={styles.odinChatContent}>
              <p className={styles.odinMessageText}>
                Let&apos;s place your workforce deployment order.
                <br />
                <strong>Which project is this trade crew for?</strong>
              </p>

              {!selectedProject && (
                <div className={styles.chatDropdownWrapper} ref={dropdownRef}>
                  <button
                    type="button"
                    className={styles.chatDropdownTrigger}
                    onClick={() => setProjectDropdownOpen((prev) => !prev)}
                    aria-expanded={projectDropdownOpen}
                  >
                    <div className={styles.chatDropdownTriggerLeft}>
                      <ProjectsDuotoneIcon size={16} className={styles.chatDropdownTriggerIcon} />
                      <span className={styles.chatDropdownPlaceholder}>
                        Select a project ({KALLISTO_HANDS_PROJECTS.length} available)...
                      </span>
                    </div>
                    <ChevronDown
                      size={14}
                      className={`${styles.chatDropdownChevron} ${
                        projectDropdownOpen ? styles.chatDropdownChevronOpen : ""
                      }`}
                    />
                  </button>

                  {projectDropdownOpen && (
                    <div className={styles.chatDropdownMenu}>
                      <div className={styles.chatDropdownSearchWrap}>
                        <Search size={13} className={styles.chatDropdownSearchIcon} />
                        <input
                          type="text"
                          className={styles.chatDropdownSearchInput}
                          placeholder="Search your Kallisto projects..."
                          value={projectSearchQuery}
                          onChange={(e) => setProjectSearchQuery(e.target.value)}
                          autoFocus
                        />
                      </div>

                      <div className={styles.chatDropdownOptionsList}>
                        {filteredProjects.map((proj) => (
                          <button
                            key={proj.id}
                            type="button"
                            className={styles.chatDropdownOption}
                            onClick={() => handleSelectProject(proj)}
                          >
                            <div className={styles.chatDropdownOptionThumb}>
                              <ProjectsDuotoneIcon size={15} />
                            </div>
                            <div className={styles.chatDropdownOptionDetails}>
                              <div className={styles.chatDropdownOptionNameRow}>
                                <span className={styles.chatDropdownOptionName}>{proj.name}</span>
                                <span className={styles.chatDropdownOptionStage}>{proj.stage}</span>
                              </div>
                              <span className={styles.chatDropdownOptionMeta}>
                                {proj.location} · {proj.area}
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* TURN 2: USER REPLIED WITH SELECTED PROJECT */}
          {selectedProject && (
            <div className={styles.userChatRow}>
              <div className={styles.userMessageBubble}>
                <div className={styles.userSelectedProjectText}>
                  <ProjectsDuotoneIcon size={14} />
                  <span>{selectedProject.name}</span>
                  <span className={styles.userBubbleSubDot}>·</span>
                  <span className={styles.userBubbleSub}>
                    {selectedProject.location} ({selectedProject.area})
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TURN 3: ODIN SERVICE SELECTION (OR AUTO-CONFIRMATION) */}
          {selectedProject && (
            <div className={styles.odinChatRow}>
              <div className={styles.odinAvatarIcon}>
                <StudioDuotoneIcon size={16} />
              </div>
              <div className={styles.odinChatContent}>
                <p className={styles.odinMessageText}>
                  Ordering for <strong>{selectedProject.name}</strong> ({selectedProject.location} · {selectedProject.area}).
                  <br />
                  Configured workforce deployment package with <strong>{crew.name}</strong>.
                </p>
              </div>
            </div>
          )}

          {/* TURN 5: ODIN "YOUR DEPLOYMENT ORDER IS READY" & SUMMARY CARD */}
          {selectedProject && (
            <div className={styles.odinChatRow}>
              <div className={styles.odinAvatarIcon}>
                <StudioDuotoneIcon size={16} />
              </div>
              <div className={styles.odinChatContent}>
                <p className={styles.odinMessageText}>
                  <strong>Your deployment order is ready.</strong>
                </p>

                <div className={styles.structuredOrderSummaryCard}>
                  <div className={styles.orderSummarySection}>
                    <span className={styles.orderSummaryLabel}>TRADE GANG</span>
                    <div className={styles.orderSummaryValueBold}>{selectedPackage.title}</div>
                    <div className={styles.orderSummarySubText}>{crew.name}</div>
                  </div>

                  <div className={styles.orderSummarySection}>
                    <span className={styles.orderSummaryLabel}>PROJECT</span>
                    <div className={styles.orderSummaryValueBold}>{selectedProject.name}</div>
                    <div className={styles.orderSummarySubText}>
                      {selectedProject.location} · {selectedProject.area}
                    </div>
                  </div>

                  <div className={styles.orderSummarySection}>
                    <span className={styles.orderSummaryLabel}>SCOPE</span>
                    <ul className={styles.orderSummaryScopeList}>
                      {selectedPackage.features.map((note, idx) => (
                        <li key={idx} className={styles.orderSummaryScopeItem}>
                          <Check size={11} className={styles.orderScopeCheck} />
                          <span>{note}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className={styles.orderSummaryBottomRow}>
                    <div>
                      <span className={styles.orderSummaryLabel}>DURATION</span>
                      <div className={styles.orderSummaryValueBold}>
                        {selectedPackage.workerCount} workers · {selectedPackage.durationDays} days
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <span className={styles.orderSummaryLabel}>TOTAL</span>
                      <div className={styles.orderSummaryPriceBig}>
                        <RupeeIcon size={16} />
                        <span>{totalPackageCost.toLocaleString("en-IN")}</span>
                      </div>
                    </div>
                  </div>

                  {!hasReviewed ? (
                    <button
                      type="button"
                      className={styles.minimalBookNowBtn}
                      onClick={handleTriggerReview}
                    >
                      <span>Review Order</span>
                      <ArrowRight size={14} />
                    </button>
                  ) : (
                    <div className={styles.chatActionCompletedBadge}>
                      <CheckCircle2 size={13} />
                      <span>Order Specification Reviewed</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TURN 6: USER REPLIED "REVIEW ORDER" */}
          {hasReviewed && (
            <div className={styles.userChatRow}>
              <div className={styles.userMessageBubble}>
                <span>Review Order Specification</span>
              </div>
            </div>
          )}

          {/* TURN 7: ODIN REVIEW SPECIFICATION & ESCROW CARD */}
          {hasReviewed && selectedProject && (
            <div className={styles.odinChatRow}>
              <div className={styles.odinAvatarIcon}>
                <StudioDuotoneIcon size={16} />
              </div>
              <div className={styles.odinChatContent}>
                <p className={styles.odinMessageText}>
                  Here is your milestone escrow schedule and workforce deployment terms.
                </p>

                <div className={styles.reviewOrderCard}>
                  <div className={styles.reviewOrderHeader}>
                    <h4 className={styles.reviewOrderTitle}>Order Review</h4>
                    <span className={styles.reviewOrderBadge}>Escrow Protected</span>
                  </div>

                  <div className={styles.reviewDetailsTable}>
                    <div className={styles.reviewDetailRow}>
                      <span className={styles.reviewDetailKey}>Trade Crew</span>
                      <span className={styles.reviewDetailVal}>
                        {crew.name} <BadgeCheck size={13} className={styles.reviewBadgeCheck} />
                      </span>
                    </div>
                    <div className={styles.reviewDetailRow}>
                      <span className={styles.reviewDetailKey}>Package</span>
                      <span className={styles.reviewDetailVal}>{selectedPackage.title}</span>
                    </div>
                    <div className={styles.reviewDetailRow}>
                      <span className={styles.reviewDetailKey}>Project</span>
                      <span className={styles.reviewDetailVal}>
                        {selectedProject.name} ({selectedProject.location})
                      </span>
                    </div>
                    <div className={styles.reviewDetailRow}>
                      <span className={styles.reviewDetailKey}>Workforce</span>
                      <span className={styles.reviewDetailVal}>
                        {selectedPackage.workerCount} Tradesmen · {selectedPackage.durationDays} Days
                      </span>
                    </div>
                    <div className={styles.reviewDetailRow}>
                      <span className={styles.reviewDetailKey}>Supervision</span>
                      <span className={styles.reviewDetailVal}>
                        Lead: {crew.leadName} ({crew.leadRole})
                      </span>
                    </div>
                  </div>

                  <div className={styles.reviewEscrowBox}>
                    <div className={styles.reviewEscrowHeader}>
                      <ShieldCheck size={14} className={styles.reviewEscrowShield} />
                      <span>Kallisto Milestone Escrow Schedule</span>
                    </div>
                    <div className={styles.minimalMilestonesRow}>
                      <div className={styles.minimalMilestonePill}>
                        <span className={styles.minimalMilestoneStep}>M1 · Mobilize (30%)</span>
                        <span className={styles.minimalMilestoneVal}>
                          ₹{m1Amount.toLocaleString("en-IN")}
                        </span>
                      </div>
                      <div className={styles.minimalMilestonePill}>
                        <span className={styles.minimalMilestoneStep}>M2 · Progress (40%)</span>
                        <span className={styles.minimalMilestoneVal}>
                          ₹{m2Amount.toLocaleString("en-IN")}
                        </span>
                      </div>
                      <div className={styles.minimalMilestonePill}>
                        <span className={styles.minimalMilestoneStep}>M3 · Sign-off (30%)</span>
                        <span className={styles.minimalMilestoneVal}>
                          ₹{m3Amount.toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>
                    <p className={styles.reviewEscrowNote}>
                      Funds are secured in escrow and released only upon your explicit approval of daily muster rolls.
                    </p>
                  </div>

                  {!hasPlacedOrder ? (
                    <button
                      type="button"
                      className={styles.reviewPlaceOrderBtn}
                      onClick={handleTriggerPayment}
                    >
                      <span>Place Order — ₹{totalPackageCost.toLocaleString("en-IN")}</span>
                      <ArrowRight size={14} />
                    </button>
                  ) : (
                    <div className={styles.chatActionCompletedBadge}>
                      <CheckCircle2 size={13} />
                      <span>Order Placed (₹{totalPackageCost.toLocaleString("en-IN")})</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TURN 8: USER REPLIED "PLACE ORDER" */}
          {hasPlacedOrder && (
            <div className={styles.userChatRow}>
              <div className={styles.userMessageBubble}>
                <span>Place Order — ₹{totalPackageCost.toLocaleString("en-IN")}</span>
              </div>
            </div>
          )}

          {/* TURN 9: ODIN PAYMENT CARD */}
          {hasPlacedOrder && selectedProject && (
            <div className={styles.odinChatRow}>
              <div className={styles.odinAvatarIcon}>
                <StudioDuotoneIcon size={16} />
              </div>
              <div className={styles.odinChatContent}>
                <p className={styles.odinMessageText}>
                  Please choose your payment method to lock the milestone escrow funds.
                </p>

                <div className={styles.paymentContainer}>
                  <div className={styles.paymentHeader}>
                    <span className={styles.paymentSubTitle}>PAYMENT</span>
                    <h4 className={styles.paymentMainTitle}>{selectedPackage.title}</h4>
                    <span className={styles.paymentProviderName}>{crew.name}</span>
                  </div>

                  <div className={styles.paymentAmountBanner}>
                    <div className={styles.paymentAmountValue}>
                      <RupeeIcon size={20} />
                      <span>{totalPackageCost.toLocaleString("en-IN")}</span>
                    </div>
                    <div className={styles.paymentEscrowShieldLine}>
                      <ShieldCheck size={13} color="#0284c7" />
                      <span>Protected by Kallisto Milestone Escrow</span>
                    </div>
                  </div>

                  {!hasPaid ? (
                    <>
                      <div className={styles.paymentMethodsList}>
                        <label
                          className={`${styles.paymentMethodCard} ${
                            selectedPaymentMethod === "wallet"
                              ? styles.paymentMethodCardSelected
                              : ""
                          }`}
                        >
                          <input
                            type="radio"
                            name="payMethodHands"
                            checked={selectedPaymentMethod === "wallet"}
                            onChange={() => setSelectedPaymentMethod("wallet")}
                            className={styles.paymentRadio}
                          />
                          <Wallet size={16} className={styles.paymentMethodIcon} />
                          <div className={styles.paymentMethodDetails}>
                            <span className={styles.paymentMethodTitle}>Kallisto Escrow Wallet</span>
                            <span className={styles.paymentMethodSubtitle}>
                              Balance: ₹1,50,000 · Instant Escrow Lock
                            </span>
                          </div>
                        </label>

                        <label
                          className={`${styles.paymentMethodCard} ${
                            selectedPaymentMethod === "upi"
                              ? styles.paymentMethodCardSelected
                              : ""
                          }`}
                        >
                          <input
                            type="radio"
                            name="payMethodHands"
                            checked={selectedPaymentMethod === "upi"}
                            onChange={() => setSelectedPaymentMethod("upi")}
                            className={styles.paymentRadio}
                          />
                          <QrCode size={16} className={styles.paymentMethodIcon} />
                          <div className={styles.paymentMethodDetails}>
                            <span className={styles.paymentMethodTitle}>UPI / Dynamic QR</span>
                            <span className={styles.paymentMethodSubtitle}>
                              GPay, PhonePe, Paytm, BHIM
                            </span>
                          </div>
                        </label>

                        <label
                          className={`${styles.paymentMethodCard} ${
                            selectedPaymentMethod === "netbanking"
                              ? styles.paymentMethodCardSelected
                              : ""
                          }`}
                        >
                          <input
                            type="radio"
                            name="payMethodHands"
                            checked={selectedPaymentMethod === "netbanking"}
                            onChange={() => setSelectedPaymentMethod("netbanking")}
                            className={styles.paymentRadio}
                          />
                          <CreditCard size={16} className={styles.paymentMethodIcon} />
                          <div className={styles.paymentMethodDetails}>
                            <span className={styles.paymentMethodTitle}>
                              NetBanking / RTGS / NEFT
                            </span>
                            <span className={styles.paymentMethodSubtitle}>
                              HDFC, ICICI, SBI, Axis & all Indian banks
                            </span>
                          </div>
                        </label>
                      </div>

                      <button
                        type="button"
                        className={styles.paymentPrimaryBtn}
                        onClick={handleExecutePayment}
                        disabled={isProcessingPayment}
                      >
                        {isProcessingPayment ? (
                          <span className={styles.paymentLoadingText}>Securing Escrow...</span>
                        ) : (
                          <span>Pay ₹{totalPackageCost.toLocaleString("en-IN")}</span>
                        )}
                      </button>
                    </>
                  ) : (
                    <div className={styles.chatActionCompletedBadge}>
                      <CheckCircle2 size={13} />
                      <span>Payment Secured via Escrow Wallet</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TURN 10: USER REPLIED "ESCROW SECURED" */}
          {hasPaid && (
            <div className={styles.userChatRow}>
              <div className={styles.userMessageBubble}>
                <span>Escrow Secured — ₹{totalPackageCost.toLocaleString("en-IN")}</span>
              </div>
            </div>
          )}

          {/* TURN 11: ODIN ORDER CONFIRMATION */}
          {hasPaid && selectedProject && (
            <div className={styles.odinChatRow}>
              <div className={styles.odinAvatarIcon}>
                <StudioDuotoneIcon size={16} />
              </div>
              <div className={styles.odinChatContent}>
                <div className={styles.orderSuccessCard}>
                  <div className={styles.orderSuccessIconWrap}>
                    <CheckCircle2 size={36} className={styles.orderSuccessCheckIcon} />
                  </div>

                  <span className={styles.orderSuccessHeadline}>✓ DEPLOYMENT PLACED</span>
                  <span className={styles.orderSuccessOrderNo}>{orderNumber}</span>

                  <div className={styles.orderSuccessTable}>
                    <div className={styles.orderSuccessRow}>
                      <span className={styles.orderSuccessKey}>Package</span>
                      <span className={styles.orderSuccessVal}>{selectedPackage.title}</span>
                    </div>
                    <div className={styles.orderSuccessRow}>
                      <span className={styles.orderSuccessKey}>Trade Crew</span>
                      <span className={styles.orderSuccessVal}>{crew.name}</span>
                    </div>
                    <div className={styles.orderSuccessRow}>
                      <span className={styles.orderSuccessKey}>Project</span>
                      <span className={styles.orderSuccessVal}>
                        {selectedProject.name} ({selectedProject.location})
                      </span>
                    </div>
                    <div className={styles.orderSuccessRow}>
                      <span className={styles.orderSuccessKey}>Total Locked</span>
                      <span className={styles.orderSuccessValBold}>
                        ₹{totalPackageCost.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>

                  <div className={styles.orderSuccessEscrowBox}>
                    <ShieldCheck size={14} className={styles.orderSuccessShield} />
                    <div>
                      <p className={styles.orderSuccessEscrowTitle}>
                        Payment secured through Kallisto Milestone Escrow
                      </p>
                      <p className={styles.orderSuccessEscrowSub}>
                        Crew mobilization pending. The first milestone (₹
                        {m1Amount.toLocaleString("en-IN")}) will be authorized upon site arrival.
                      </p>
                    </div>
                  </div>

                  <div className={styles.orderSuccessActions}>
                    <Link
                      href={`/hands/deployments?orderId=${orderNumber}`}
                      className={styles.orderSuccessPrimaryBtn}
                    >
                      <span>View Deployment</span>
                      <ArrowRight size={14} />
                    </Link>
                    <button
                      type="button"
                      className={styles.orderSuccessSecondaryBtn}
                      onClick={handleReset}
                    >
                      Place Another Order
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {isTyping && (
            <div className={styles.odinChatRow}>
              <div className={styles.odinAvatarIcon}>
                <StudioDuotoneIcon size={16} />
              </div>
              <div className={styles.minimalTypingDots}>
                <span />
                <span />
                <span />
              </div>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* 3. PROMPT COMPOSER BAR (Enabled only when Odin is asking questions) */}
        {(() => {
          const isAskingQuestions = !selectedProject;
          const composerPlaceholder = !selectedProject
            ? "Type project name or select above..."
            : !hasReviewed
            ? "Click 'Review Order' above to proceed..."
            : !hasPlacedOrder
            ? "Click 'Place Order' above to proceed..."
            : !hasPaid
            ? "Select payment method above to proceed..."
            : "Deployment completed.";

          return (
            <form
              className={`${styles.minimalComposer} ${
                !isAskingQuestions ? styles.minimalComposerDisabled : ""
              }`}
              onSubmit={handleNaturalInput}
            >
              <input
                type="text"
                className={styles.minimalInput}
                placeholder={composerPlaceholder}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                disabled={!isAskingQuestions}
              />
              <button
                type="submit"
                className={styles.minimalSendBtn}
                disabled={!isAskingQuestions || !inputText.trim()}
                aria-label="Submit input"
              >
                <ArrowUp size={15} strokeWidth={2.5} />
              </button>
            </form>
          );
        })()}

        {/* 4. ESCROW TRUST LINE */}
        <div className={styles.minimalEscrowTrust}>
          <ShieldCheck size={13} />
          <span>Kallisto Milestone Escrow: Pay only upon review approval</span>
        </div>
      </div>
    </aside>
  );
}
