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
  MapPin,
  QrCode,
  RotateCcw,
  Search,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import {
  StudioDuotoneIcon,
  ProjectsDuotoneIcon,
  BasicsDuotoneIcon,
  SpreadsheetDuotoneIcon,
  LockDuotoneIcon,
  RupeeIcon,
} from "@/components/layout/sidebar-icons";
import type { BasicsProvider, BasicsProviderService } from "../types/basics.types";
import styles from "./basics-workspace.module.css";

export interface KallistoProjectContext {
  id: string;
  name: string;
  location: string;
  area: string;
  type: string;
  stage: string;
  clientName: string;
  scopeNotes: string[];
}

export const KALLISTO_USER_PROJECTS: KallistoProjectContext[] = [
  {
    id: "proj-003",
    name: "Villa Renovation",
    location: "Kannur",
    area: "2,400 sq.ft",
    type: "Residential Renovation",
    stage: "Design & MEP Scope",
    clientName: "Anoop Kumar",
    scopeNotes: [
      "Design basis and scope note",
      "Coordinated drawing/report package",
      "Review response schedule",
      "2 revision cycles",
    ],
  },
  {
    id: "proj-001",
    name: "Nila Residence",
    location: "Trivandrum",
    area: "3,200 sq.ft",
    type: "Luxury Residential Villa",
    stage: "Structural & Services",
    clientName: "Arjun Mehta",
    scopeNotes: [
      "Detailed MEP load calculations",
      "Site utility integration plan",
      "Single line diagram (SLD)",
      "2 revision cycles",
    ],
  },
  {
    id: "proj-002",
    name: "Azure Beach Villa",
    location: "Calicut",
    area: "2,800 sq.ft",
    type: "Contemporary Beach Villa",
    stage: "Schematic Architecture",
    clientName: "Priya Menon",
    scopeNotes: [
      "Full schematic drawings in AutoCAD DWG",
      "3D spatial coordination",
      "Bill of quantities (BOQ) review",
      "2 revision cycles",
    ],
  },
  {
    id: "proj-004",
    name: "Horizon Bay Villa",
    location: "Kochi",
    area: "4,100 sq.ft",
    type: "Waterfront Residence",
    stage: "Execution Drawings",
    clientName: "Nikhil Varma",
    scopeNotes: [
      "Execution-level working drawings",
      "Site coordination meeting schedule",
      "Material specifications and schedules",
      "3 revision cycles",
    ],
  },
];

export interface ProviderOrderPanelProps {
  provider: BasicsProvider;
  projectId?: string;
  initialServiceId?: string;
}

export function ProviderOrderPanel({
  provider,
  projectId,
  initialServiceId,
}: ProviderOrderPanelProps) {
  const services = provider.services.length > 0 ? provider.services : [];

  const matchedInitialProject =
    KALLISTO_USER_PROJECTS.find((p) => p.id === projectId) || null;

  const initialMatchedService =
    services.find((s) => s.id === initialServiceId) ||
    (services.length === 1 ? services[0] : null);

  const [selectedProject, setSelectedProject] =
    useState<KallistoProjectContext | null>(matchedInitialProject);
  const [selectedService, setSelectedService] =
    useState<BasicsProviderService | null>(initialMatchedService);

  // Completed / Active Stages in the timeline
  const [hasReviewed, setHasReviewed] = useState(false);
  const [hasPlacedOrder, setHasPlacedOrder] = useState(false);
  const [hasPaid, setHasPaid] = useState(false);

  // Dropdown States
  const [projectDropdownOpen, setProjectDropdownOpen] = useState(false);
  const [projectSearchQuery, setProjectSearchQuery] = useState("");
  const [serviceDropdownOpen, setServiceDropdownOpen] = useState(false);

  // Input & Payment States
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<
    "wallet" | "upi" | "netbanking" | "card"
  >("wallet");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [orderNumber, setOrderNumber] = useState("KAL-89421");

  const chatBottomRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new chat turns
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [
    selectedProject,
    selectedService,
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
        setServiceDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const effectivePrice =
    selectedService?.startingPrice ?? provider.pricing.startingFrom ?? 38000;
  const m1Amount = Math.round(effectivePrice * 0.3);
  const m2Amount = Math.round(effectivePrice * 0.4);
  const m3Amount = effectivePrice - m1Amount - m2Amount;

  const filteredProjects = KALLISTO_USER_PROJECTS.filter(
    (p) =>
      p.name.toLowerCase().includes(projectSearchQuery.toLowerCase()) ||
      p.location.toLowerCase().includes(projectSearchQuery.toLowerCase()) ||
      p.type.toLowerCase().includes(projectSearchQuery.toLowerCase()),
  );

  // Step 1: Select Project
  const handleSelectProject = (proj: KallistoProjectContext) => {
    setSelectedProject(proj);
    setProjectDropdownOpen(false);
    setProjectSearchQuery("");
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      if (services.length === 1) {
        setSelectedService(services[0]);
      }
    }, 300);
  };

  // Step 2: Select Service
  const handleSelectService = (srv: BasicsProviderService) => {
    setSelectedService(srv);
    setServiceDropdownOpen(false);
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
    }, 300);
  };

  // Step 3: Trigger Review Turn
  const handleTriggerReview = () => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setHasReviewed(true);
    }, 300);
  };

  // Step 4: Trigger Payment Turn
  const handleTriggerPayment = () => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setHasPlacedOrder(true);
    }, 300);
  };

  // Step 5: Execute Payment
  const handleExecutePayment = () => {
    setIsProcessingPayment(true);
    setTimeout(() => {
      setIsProcessingPayment(false);
      const generated = `KAL-${Math.floor(10000 + Math.random() * 90000)}`;
      setOrderNumber(generated);
      setHasPaid(true);
    }, 1000);
  };

  // Natural language query handler
  const handleNaturalInput = (e: React.FormEvent) => {
    e.preventDefault();
    const query = inputText.trim();
    if (!query) return;
    setInputText("");

    const lower = query.toLowerCase();

    // Check project match
    const matchedProject = KALLISTO_USER_PROJECTS.find(
      (p) =>
        lower.includes(p.name.toLowerCase()) ||
        p.name.toLowerCase().includes(lower) ||
        lower.includes(p.location.toLowerCase()),
    );

    if (matchedProject && !selectedProject) {
      handleSelectProject(matchedProject);
      return;
    }

    // Check service match
    const matchedService = services.find(
      (s) =>
        lower.includes(s.title.toLowerCase()) ||
        s.title.toLowerCase().includes(lower),
    );

    if (matchedService && !selectedService) {
      if (!selectedProject) {
        setSelectedProject(KALLISTO_USER_PROJECTS[0]);
      }
      handleSelectService(matchedService);
      return;
    }

    // Actions
    if (lower.includes("review") || lower.includes("order") || lower.includes("summary")) {
      if (selectedProject && selectedService && !hasReviewed) {
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
    setSelectedService(services.length === 1 ? services[0] : null);
    setHasReviewed(false);
    setHasPlacedOrder(false);
    setHasPaid(false);
    setInputText("");
    setIsProcessingPayment(false);
  };

  // Current step indicator title
  const currentStepTitle = !selectedProject
    ? "Step 1 · Choose Project"
    : services.length > 1 && !selectedService
    ? "Step 2 · Choose Service"
    : !hasReviewed
    ? "Step 3 · Order Summary"
    : !hasPlacedOrder
    ? "Step 4 · Milestone Escrow Review"
    : !hasPaid
    ? "Step 5 · Secure Escrow Payment"
    : "Order Confirmed";

  return (
    <aside className={styles.aiOrderPanelContainer} aria-label="Odin Order Placing Agent">
      <div className={styles.minimalBookingCard}>
        {/* 1. FIXED TOP HEADER WITH ODIN BRANDING */}
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
          {/* =========================================================================
              TURN 1: ODIN INITIAL PROMPT & PROJECT DROPDOWN
              ========================================================================= */}
          <div className={styles.odinChatRow}>
            <div className={styles.odinAvatarIcon}>
              <StudioDuotoneIcon size={16} />
            </div>
            <div className={styles.odinChatContent}>
              <p className={styles.odinMessageText}>
                Let&apos;s place your order.
                <br />
                <strong>Which project is this service for?</strong>
              </p>

              {/* Searchable Dropdown Selector */}
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
                        Select a project ({KALLISTO_USER_PROJECTS.length} available)...
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

          {/* =========================================================================
              TURN 2: USER REPLIED WITH SELECTED PROJECT
              ========================================================================= */}
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

          {/* =========================================================================
              TURN 3: ODIN SERVICE SELECTION (OR AUTO-CONFIRMATION)
              ========================================================================= */}
          {selectedProject && (
            <div className={styles.odinChatRow}>
              <div className={styles.odinAvatarIcon}>
                <StudioDuotoneIcon size={16} />
              </div>
              <div className={styles.odinChatContent}>
                <p className={styles.odinMessageText}>
                  Ordering for <strong>{selectedProject.name}</strong> ({selectedProject.location} · {selectedProject.area}).
                  <br />
                  {services.length > 1 && !selectedService
                    ? `What service would you like from ${provider.name}?`
                    : `Configured service package with ${provider.name}.`}
                </p>

                {/* Service Dropdown (If multiple and not yet selected) */}
                {services.length > 1 && !selectedService && (
                  <div className={styles.chatDropdownWrapper}>
                    <button
                      type="button"
                      className={styles.chatDropdownTrigger}
                      onClick={() => setServiceDropdownOpen((prev) => !prev)}
                    >
                      <div className={styles.chatDropdownTriggerLeft}>
                        <BasicsDuotoneIcon size={16} className={styles.chatDropdownTriggerIcon} />
                        <span className={styles.chatDropdownPlaceholder}>
                          Select service package...
                        </span>
                      </div>
                      <ChevronDown
                        size={14}
                        className={`${styles.chatDropdownChevron} ${
                          serviceDropdownOpen ? styles.chatDropdownChevronOpen : ""
                        }`}
                      />
                    </button>

                    {serviceDropdownOpen && (
                      <div className={styles.chatDropdownMenu}>
                        <div className={styles.chatDropdownOptionsList}>
                          {services.map((srv) => (
                            <button
                              key={srv.id}
                              type="button"
                              className={styles.chatDropdownOption}
                              onClick={() => handleSelectService(srv)}
                            >
                              <div className={styles.chatDropdownOptionThumb}>
                                <BasicsDuotoneIcon size={15} />
                              </div>
                              <div className={styles.chatDropdownOptionDetails}>
                                <div className={styles.chatDropdownOptionNameRow}>
                                  <span className={styles.chatDropdownOptionName}>{srv.title}</span>
                                  <span className={styles.chatDropdownOptionPrice}>
                                    ₹{(srv.startingPrice ?? 38000).toLocaleString("en-IN")}
                                  </span>
                                </div>
                                <span className={styles.chatDropdownOptionMeta}>
                                  {srv.estimatedDuration || "6 weeks"} · {srv.pricingModel || "Fixed"}
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
          )}

          {/* =========================================================================
              TURN 4: USER REPLIED WITH SELECTED SERVICE
              ========================================================================= */}
          {selectedProject && selectedService && services.length > 1 && (
            <div className={styles.userChatRow}>
              <div className={styles.userMessageBubble}>
                <div className={styles.userSelectedProjectText}>
                  <BasicsDuotoneIcon size={14} />
                  <span>{selectedService.title}</span>
                  <span className={styles.userBubbleSubDot}>·</span>
                  <span className={styles.userBubbleSub}>
                    ₹{effectivePrice.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              TURN 5: ODIN "YOUR ORDER IS READY" & STRUCTURED SUMMARY CARD
              ========================================================================= */}
          {selectedProject && selectedService && (
            <div className={styles.odinChatRow}>
              <div className={styles.odinAvatarIcon}>
                <StudioDuotoneIcon size={16} />
              </div>
              <div className={styles.odinChatContent}>
                <p className={styles.odinMessageText}>
                  <strong>Your order is ready.</strong>
                </p>

                {/* Structured Order Summary Card */}
                <div className={styles.structuredOrderSummaryCard}>
                  <div className={styles.orderSummarySection}>
                    <span className={styles.orderSummaryLabel}>SERVICE</span>
                    <div className={styles.orderSummaryValueBold}>{selectedService.title}</div>
                    <div className={styles.orderSummarySubText}>{provider.name}</div>
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
                      {selectedProject.scopeNotes.map((note, idx) => (
                        <li key={idx} className={styles.orderSummaryScopeItem}>
                          <Check size={11} className={styles.orderScopeCheck} />
                          <span>{note}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className={styles.orderSummaryBottomRow}>
                    <div>
                      <span className={styles.orderSummaryLabel}>DELIVERY</span>
                      <div className={styles.orderSummaryValueBold}>
                        {selectedService.estimatedDuration || "6 weeks"}
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <span className={styles.orderSummaryLabel}>TOTAL</span>
                      <div className={styles.orderSummaryPriceBig}>
                        <RupeeIcon size={16} />
                        <span>{effectivePrice.toLocaleString("en-IN")}</span>
                      </div>
                    </div>
                  </div>

                  {/* Review Order CTA */}
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

          {/* =========================================================================
              TURN 6: USER REPLIED "REVIEW ORDER"
              ========================================================================= */}
          {hasReviewed && (
            <div className={styles.userChatRow}>
              <div className={styles.userMessageBubble}>
                <span>Review Order Specification</span>
              </div>
            </div>
          )}

          {/* =========================================================================
              TURN 7: ODIN REVIEW SPECIFICATION & MILESTONE ESCROW CARD
              ========================================================================= */}
          {hasReviewed && selectedProject && selectedService && (
            <div className={styles.odinChatRow}>
              <div className={styles.odinAvatarIcon}>
                <StudioDuotoneIcon size={16} />
              </div>
              <div className={styles.odinChatContent}>
                <p className={styles.odinMessageText}>
                  Here is your milestone escrow schedule and terms for <strong>{selectedService.title}</strong>.
                </p>

                <div className={styles.reviewOrderCard}>
                  <div className={styles.reviewOrderHeader}>
                    <h4 className={styles.reviewOrderTitle}>Order Review</h4>
                    <span className={styles.reviewOrderBadge}>Escrow Protected</span>
                  </div>

                  <div className={styles.reviewDetailsTable}>
                    <div className={styles.reviewDetailRow}>
                      <span className={styles.reviewDetailKey}>Provider</span>
                      <span className={styles.reviewDetailVal}>
                        {provider.name} <BadgeCheck size={13} className={styles.reviewBadgeCheck} />
                      </span>
                    </div>
                    <div className={styles.reviewDetailRow}>
                      <span className={styles.reviewDetailKey}>Service</span>
                      <span className={styles.reviewDetailVal}>{selectedService.title}</span>
                    </div>
                    <div className={styles.reviewDetailRow}>
                      <span className={styles.reviewDetailKey}>Project</span>
                      <span className={styles.reviewDetailVal}>
                        {selectedProject.name} ({selectedProject.location})
                      </span>
                    </div>
                    <div className={styles.reviewDetailRow}>
                      <span className={styles.reviewDetailKey}>Duration</span>
                      <span className={styles.reviewDetailVal}>
                        {selectedService.estimatedDuration || "6 weeks"}
                      </span>
                    </div>
                    <div className={styles.reviewDetailRow}>
                      <span className={styles.reviewDetailKey}>Revisions</span>
                      <span className={styles.reviewDetailVal}>2 cycles included</span>
                    </div>
                  </div>

                  {/* Escrow Schedule */}
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
                      Funds are secured in escrow and released only upon your explicit approval of deliverables.
                    </p>
                  </div>

                  {/* Actions */}
                  {!hasPlacedOrder ? (
                    <button
                      type="button"
                      className={styles.reviewPlaceOrderBtn}
                      onClick={handleTriggerPayment}
                    >
                      <span>Place Order — ₹{effectivePrice.toLocaleString("en-IN")}</span>
                      <ArrowRight size={14} />
                    </button>
                  ) : (
                    <div className={styles.chatActionCompletedBadge}>
                      <CheckCircle2 size={13} />
                      <span>Order Placed (₹{effectivePrice.toLocaleString("en-IN")})</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              TURN 8: USER REPLIED "PLACE ORDER"
              ========================================================================= */}
          {hasPlacedOrder && (
            <div className={styles.userChatRow}>
              <div className={styles.userMessageBubble}>
                <span>Place Order — ₹{effectivePrice.toLocaleString("en-IN")}</span>
              </div>
            </div>
          )}

          {/* =========================================================================
              TURN 9: ODIN PAYMENT METHOD SELECTOR CARD
              ========================================================================= */}
          {hasPlacedOrder && selectedProject && selectedService && (
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
                    <h4 className={styles.paymentMainTitle}>{selectedService.title}</h4>
                    <span className={styles.paymentProviderName}>{provider.name}</span>
                  </div>

                  <div className={styles.paymentAmountBanner}>
                    <div className={styles.paymentAmountValue}>
                      <RupeeIcon size={20} />
                      <span>{effectivePrice.toLocaleString("en-IN")}</span>
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
                            name="payMethodStream"
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
                            name="payMethodStream"
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
                            name="payMethodStream"
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
                          <span>Pay ₹{effectivePrice.toLocaleString("en-IN")}</span>
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

          {/* =========================================================================
              TURN 10: USER REPLIED "ESCROW SECURED"
              ========================================================================= */}
          {hasPaid && (
            <div className={styles.userChatRow}>
              <div className={styles.userMessageBubble}>
                <span>Escrow Secured — ₹{effectivePrice.toLocaleString("en-IN")}</span>
              </div>
            </div>
          )}

          {/* =========================================================================
              TURN 11: ODIN ORDER CONFIRMATION
              ========================================================================= */}
          {hasPaid && selectedProject && selectedService && (
            <div className={styles.odinChatRow}>
              <div className={styles.odinAvatarIcon}>
                <StudioDuotoneIcon size={16} />
              </div>
              <div className={styles.odinChatContent}>
                <div className={styles.orderSuccessCard}>
                  <div className={styles.orderSuccessIconWrap}>
                    <CheckCircle2 size={36} className={styles.orderSuccessCheckIcon} />
                  </div>

                  <span className={styles.orderSuccessHeadline}>✓ ORDER PLACED</span>
                  <span className={styles.orderSuccessOrderNo}>{orderNumber}</span>

                  <div className={styles.orderSuccessTable}>
                    <div className={styles.orderSuccessRow}>
                      <span className={styles.orderSuccessKey}>Service</span>
                      <span className={styles.orderSuccessVal}>{selectedService.title}</span>
                    </div>
                    <div className={styles.orderSuccessRow}>
                      <span className={styles.orderSuccessKey}>Provider</span>
                      <span className={styles.orderSuccessVal}>{provider.name}</span>
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
                        ₹{effectivePrice.toLocaleString("en-IN")}
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
                        Provider confirmation pending. The first milestone (₹
                        {m1Amount.toLocaleString("en-IN")}) will be authorized upon kickoff.
                      </p>
                    </div>
                  </div>

                  <div className={styles.orderSuccessActions}>
                    <Link
                      href={`/basics/orders?orderId=${orderNumber}`}
                      className={styles.orderSuccessPrimaryBtn}
                    >
                      <span>View Order</span>
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

          {/* Typing Indicator */}
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
          const isAskingQuestions =
            !selectedProject || (services.length > 1 && !selectedService);
          const composerPlaceholder = !selectedProject
            ? "Type project name or select above..."
            : services.length > 1 && !selectedService
            ? "Type service name or select above..."
            : !hasReviewed
            ? "Click 'Review Order' above to proceed..."
            : !hasPlacedOrder
            ? "Click 'Place Order' above to proceed..."
            : !hasPaid
            ? "Select payment method above to proceed..."
            : "Order completed.";

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
                aria-label="Submit message"
              >
                <ArrowUp size={15} strokeWidth={2.5} />
              </button>
            </form>
          );
        })()}

        {/* 4. ESCROW TRUST FOOTER */}
        <div className={styles.minimalEscrowTrust}>
          <ShieldCheck size={13} />
          <span>Kallisto Milestone Escrow: Pay only upon review approval</span>
        </div>
      </div>
    </aside>
  );
}
