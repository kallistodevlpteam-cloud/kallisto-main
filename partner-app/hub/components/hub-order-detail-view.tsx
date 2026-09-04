"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Phone,
  User,
  Package,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Truck,
  Check,
  Send,
  Building,
  Search,
  Tag,
  ShieldCheck,
  CheckCheck,
} from "lucide-react";
import { HubOrder, HubOrderStatus } from "../types/hub-order";
import styles from "./hub-orders.module.css";

/* KALLISTO SIDEBAR THEME DUOTONE ICONS */
function StepRequestDuotoneIcon({ size = 14, color }: { size?: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color }}>
      <path d="M6 2C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2H6Z" fill="currentColor" opacity="0.38" />
      <path d="M14 2V7C14 7.6 14.4 8 15 8H20L14 2ZM7 11.5H17V13.5H7V11.5ZM7 15.5H14V17.5H7V15.5Z" fill="currentColor" />
    </svg>
  );
}

function StepReviewingDuotoneIcon({ size = 14, color }: { size?: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color }}>
      <circle cx="11" cy="11" r="6.5" fill="currentColor" opacity="0.38" />
      <path d="M11 2C6 2 2 6 2 11C2 16 6 20 11 20C13.3 20 15.3 19.1 16.8 17.7L20.3 21.2C20.7 21.6 21.3 21.6 21.7 21.2C22.1 20.8 22.1 20.2 21.7 19.8L18.2 16.3C19.3 14.8 20 13 20 11C20 6 16 2 11 2ZM4.5 11C4.5 7.4 7.4 4.5 11 4.5C14.6 4.5 17.5 7.4 17.5 11C17.5 14.6 14.6 17.5 11 17.5C7.4 17.5 4.5 14.6 4.5 11Z" fill="currentColor" />
    </svg>
  );
}

function StepQuotedDuotoneIcon({ size = 14, color }: { size?: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color }}>
      <path d="M2.5 11.5L11.5 2.5H20C21.1 2.5 22 3.4 22 4.5V13C22 13.8 21.7 14.6 21.1 15.2L12.1 24.2C11.5 24.8 10.5 24.8 9.9 24.2L2.5 16.8C1.9 16.2 1.9 15.2 2.5 14.6L2.5 11.5Z" fill="currentColor" opacity="0.38" />
      <circle cx="17.5" cy="7" r="2" fill="currentColor" />
      <path d="M12 9.5L5.5 16C4.9 16.6 4.9 17.6 5.5 18.2L8.8 21.5C9.4 22.1 10.4 22.1 11 21.5L17.5 15L12 9.5Z" fill="currentColor" />
    </svg>
  );
}

function StepConfirmedDuotoneIcon({ size = 14, color }: { size?: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color }}>
      <path d="M12 2L4 5V11.5C4 16.5 7.4 21.2 12 22.5C16.6 21.2 20 16.5 20 11.5V5L12 2Z" fill="currentColor" opacity="0.38" />
      <path d="M10.2 15.4L7.4 12.6C7 12.2 7 11.6 7.4 11.2C7.8 10.8 8.4 10.8 8.8 11.2L10.9 13.3L15.2 9C15.6 8.6 16.2 8.6 16.6 9C17 9.4 17 10 16.6 10.4L11.6 15.4C11.2 15.8 10.6 15.8 10.2 15.4Z" fill="currentColor" />
    </svg>
  );
}

function StepPreparingDuotoneIcon({ size = 14, color }: { size?: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color }}>
      <path d="M12 2L3 6.5L12 11L21 6.5L12 2Z" fill="currentColor" opacity="0.4" />
      <path d="M3 7.8V17.2L11.5 21.8V12.3L3 7.8Z" fill="currentColor" />
      <path d="M12.5 12.3V21.8L21 17.2V7.8L12.5 12.3Z" fill="currentColor" opacity="0.8" />
    </svg>
  );
}

function StepDispatchedDuotoneIcon({ size = 14, color }: { size?: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color }}>
      <path d="M2 5C2 3.9 2.9 3 4 3H14C15.1 3 16 3.9 16 5V14H2V5Z" fill="currentColor" opacity="0.38" />
      <path d="M16 8H19.2C19.7 8 20.2 8.3 20.5 8.7L22.6 11.8C22.9 12.2 23 12.6 23 13.1V16C23 16.6 22.6 17 22 17H16V8Z" fill="currentColor" opacity="0.55" />
      <circle cx="6.5" cy="18" r="2.5" fill="currentColor" />
      <circle cx="16.5" cy="18" r="2.5" fill="currentColor" />
      <path d="M2 14H22V16H2V14Z" fill="currentColor" />
    </svg>
  );
}

function StepCompletedDuotoneIcon({ size = 14, color }: { size?: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color }}>
      <circle cx="12" cy="12" r="9.5" fill="currentColor" opacity="0.38" />
      <path d="M10.5 16.2L6.8 12.5C6.4 12.1 6.4 11.5 6.8 11.1C7.2 10.7 7.8 10.7 8.2 11.1L10.5 13.4L15.8 8.1C16.2 7.7 16.8 7.7 17.2 8.1C17.6 8.5 17.6 9.1 17.2 9.5L11.2 16.2C11 16.4 10.7 16.4 10.5 16.2Z" fill="currentColor" />
    </svg>
  );
}

function BuildingDuotoneIcon({ size = 16, color = "#2563eb" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color }}>
      <path d="M3 21H21V19H3V21ZM5 19H11V3H5V19ZM7 5H9V7H7V5ZM7 9H9V11H7V9ZM7 13H9V15H7V13Z" fill="currentColor" opacity="0.38" />
      <path d="M13 7H19V19H13V7ZM15 9H17V11H15V9ZM15 13H17V15H15V13Z" fill="currentColor" />
    </svg>
  );
}

function UserDuotoneIcon({ size = 16, color = "#2563eb" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color }}>
      <circle cx="12" cy="7" r="4.5" fill="currentColor" opacity="0.38" />
      <path d="M12 13.5C7.5 13.5 3 15.8 3 20.2V21H21V20.2C21 15.8 16.5 13.5 12 13.5Z" fill="currentColor" />
    </svg>
  );
}

function PhoneDuotoneIcon({ size = 16, color = "#2563eb" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color }}>
      <path d="M6.5 2H17.5C18.6 2 19.5 2.9 19.5 4V20C19.5 21.1 18.6 22 17.5 22H6.5C5.4 22 4.5 21.1 4.5 20V4C4.5 2.9 5.4 2 6.5 2Z" fill="currentColor" opacity="0.38" />
      <path d="M12 18.5C12.8 18.5 13.5 17.8 13.5 17C13.5 16.2 12.8 15.5 12 15.5C11.2 15.5 10.5 16.2 10.5 17C10.5 17.8 11.2 18.5 12 18.5ZM9 4H15V5.5H9V4Z" fill="currentColor" />
    </svg>
  );
}

function LocationDuotoneIcon({ size = 16, color = "#2563eb" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color }}>
      <path d="M12 2C7.6 2 4 5.6 4 10C4 15.2 12 22 12 22C12 22 20 15.2 20 10C20 5.6 16.4 2 12 2Z" fill="currentColor" opacity="0.38" />
      <circle cx="12" cy="10" r="3.5" fill="currentColor" />
    </svg>
  );
}

function GstDuotoneIcon({ size = 16, color = "#2563eb" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color }}>
      <path d="M4 3C2.9 3 2 3.9 2 5V21L5 19.5L8 21L11 19.5L14 21L17 19.5L20 21L22 19.5V5C22 3.9 21.1 3 20 3H4Z" fill="currentColor" opacity="0.38" />
      <path d="M6 7H18V9H6V7ZM6 11H18V13H6V11ZM6 15H14V17H6V15Z" fill="currentColor" />
    </svg>
  );
}

function CalendarDuotoneIcon({ size = 16, color = "#2563eb" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color }}>
      <path d="M5 4C3.9 4 3 4.9 3 6V9H21V6C21 4.9 20.1 4 19 4H17V2H15V4H9V2H7V4H5Z" fill="currentColor" opacity="0.38" />
      <path d="M3 9V19C3 20.7 4.3 22 6 22H18C19.7 22 21 20.7 21 19V9H3ZM8 12H10V14H8V12ZM12 12H14V14H12V12ZM16 12H18V14H16V12ZM8 16H10V18H8V16ZM12 16H14V18H12V16ZM16 16H18V18H16V16Z" fill="currentColor" />
    </svg>
  );
}

function getLifecycleStepIcon(step: HubOrderStatus, isReached: boolean, size = 14) {
  const color = isReached ? "#ffffff" : "#94a3b8";

  switch (step) {
    case "REQUEST":
      return <StepRequestDuotoneIcon size={size} color={color} />;
    case "REVIEWING":
      return <StepReviewingDuotoneIcon size={size} color={color} />;
    case "QUOTED":
      return <StepQuotedDuotoneIcon size={size} color={color} />;
    case "CONFIRMED":
      return <StepConfirmedDuotoneIcon size={size} color={color} />;
    case "PREPARING":
      return <StepPreparingDuotoneIcon size={size} color={color} />;
    case "DISPATCHED":
      return <StepDispatchedDuotoneIcon size={size} color={color} />;
    case "COMPLETED":
      return <StepCompletedDuotoneIcon size={size} color={color} />;
    default:
      return <StepCompletedDuotoneIcon size={size} color={color} />;
  }
}

function formatStatusLabel(status: string): string {
  if (!status) return "";
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
}

interface HubOrderDetailViewProps {
  order: HubOrder;
  onBack: () => void;
  onUpdateStatus: (newStatus: HubOrderStatus) => void;
  onBuildQuote?: () => void;
}

const LIFECYCLE_STEPS: HubOrderStatus[] = [
  "REQUEST",
  "REVIEWING",
  "QUOTED",
  "CONFIRMED",
  "PREPARING",
  "DISPATCHED",
  "COMPLETED",
];

export function HubOrderDetailView({
  order,
  onBack,
  onUpdateStatus,
}: HubOrderDetailViewProps) {
  const [isQuoting, setIsQuoting] = useState(false);
  const [customDeliveryFee, setCustomDeliveryFee] = useState("2500");
  const [quoteNotes, setQuoteNotes] = useState("Materials valid for 7 calendar days. Loading included.");

  const currentStepIndex = LIFECYCLE_STEPS.indexOf(order.status);
  const stepperContainerRef = useRef<HTMLDivElement>(null);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [progressWidth, setProgressWidth] = useState<number | null>(null);

  useEffect(() => {
    const updateWidth = () => {
      const activeEl = stepRefs.current[currentStepIndex];
      if (activeEl) {
        const activeRightEdge = activeEl.offsetLeft + activeEl.offsetWidth;
        setProgressWidth(activeRightEdge);
      }
    };

    updateWidth();
    const timer = setTimeout(updateWidth, 30);
    window.addEventListener("resize", updateWidth);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", updateWidth);
    };
  }, [currentStepIndex]);

  const getStatusPillClass = (st: HubOrderStatus) => {
    switch (st) {
      case "REQUEST":
        return styles.statusRequest;
      case "REVIEWING":
        return styles.statusReviewing;
      case "QUOTED":
        return styles.statusQuoted;
      case "CONFIRMED":
        return styles.statusConfirmed;
      case "PREPARING":
        return styles.statusPreparing;
      case "DISPATCHED":
        return styles.statusDispatched;
      case "COMPLETED":
        return styles.statusCompleted;
      default:
        return styles.statusRequest;
    }
  };

  const handleAdvanceStep = () => {
    if (currentStepIndex < LIFECYCLE_STEPS.length - 1) {
      onUpdateStatus(LIFECYCLE_STEPS[currentStepIndex + 1]);
    }
  };

  const subtotal = order.items.reduce(
    (sum, item) => sum + item.quantity * (item.quotedRate || item.estimatedRate),
    0
  );
  const deliveryFee = Number(customDeliveryFee) || 0;
  const tax = Math.round(subtotal * 0.12);
  const total = subtotal + deliveryFee + tax;

  return (
    <div className={styles.detailContainer}>
      {/* 1. ORDER HEADER & LIFECYCLE STEPPER CARD */}
      <div className={styles.detailHeaderCard}>
        <div className={styles.detailTitleRow}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
              <div className={styles.detailOrderId}>{order.id}</div>
              <span className={`${styles.statusPill} ${getStatusPillClass(order.status)}`}>
                {formatStatusLabel(order.status)}
              </span>
            </div>
            <div className={styles.detailProjectTitle}>
              {order.project} · {order.customer}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <span style={{ fontSize: "11.5px", color: "#64748b" }}>Order Value</span>
            <div style={{ fontSize: "20px", fontWeight: 750, color: "#0f172a" }}>
              ₹{(order.finalValue || subtotal).toLocaleString("en-IN")}
            </div>
          </div>
        </div>

        {/* Interactive Progress Stepper Bar starting from Stage 1 and expanding to current Stage title */}
        <div
          ref={stepperContainerRef}
          style={{
            position: "relative",
            height: "34px",
            backgroundColor: "#f1f5f9",
            borderRadius: "9999px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "3px 8px",
            boxSizing: "border-box",
            width: "100%",
            overflowX: "auto",
            scrollbarWidth: "none",
          }}
        >
          {/* Continuous Blue Progress Capsule starting from left (Stage 1) and ending strictly at active stage */}
          <div
            style={{
              position: "absolute",
              top: "2px",
              bottom: "2px",
              left: "2px",
              width: progressWidth !== null ? `${progressWidth}px` : "0px",
              opacity: progressWidth !== null ? 1 : 0,
              backgroundColor: "#2563eb",
              borderRadius: "9999px",
              boxShadow: "0 1px 4px rgba(37, 99, 235, 0.25)",
              transition: "width 240ms cubic-bezier(0.4, 0, 0.2, 1), opacity 150ms ease",
              zIndex: 1,
              pointerEvents: "none",
            }}
          />

          {LIFECYCLE_STEPS.map((step, idx) => {
            const isCompleted = idx < currentStepIndex;
            const isActive = idx === currentStepIndex;
            const isReached = idx <= currentStepIndex;

            return (
              <React.Fragment key={step}>
                <div
                  ref={(el) => {
                    stepRefs.current[idx] = el;
                  }}
                  style={{
                    position: "relative",
                    zIndex: 2,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    fontSize: "11.5px",
                    fontWeight: isActive ? 750 : isCompleted ? 600 : 500,
                    color: isReached ? "#ffffff" : "#64748b",
                    whiteSpace: "nowrap",
                    padding: "3px 6px",
                    transition: "color 180ms ease",
                    flexShrink: 0,
                  }}
                >
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {getLifecycleStepIcon(step, isReached, 14)}
                  </span>
                  <span>{formatStatusLabel(step)}</span>
                </div>

                {idx < LIFECYCLE_STEPS.length - 1 && (
                  <div
                    style={{
                      position: "relative",
                      zIndex: 2,
                      flex: 1,
                      height: "2px",
                      margin: "0 6px",
                      backgroundColor: idx < currentStepIndex ? "rgba(255, 255, 255, 0.45)" : "#cbd5e1",
                      borderRadius: "9999px",
                      minWidth: "10px",
                      transition: "background-color 200ms ease",
                    }}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* 3. TWO COLUMN METADATA GRIDS */}
      <div className={styles.detailGrid2}>
        {/* Customer & Project Details */}
        <div className={styles.cardBox}>
          <h4 className={styles.cardBoxTitle}>Customer & Site Details</h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "12.5px" }}>
            {/* Project */}
            <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
              <div style={{ marginTop: "2px", color: "#2563eb", flexShrink: 0 }}>
                <BuildingDuotoneIcon size={16} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
                <span style={{ fontSize: "11px", color: "#64748b", fontWeight: 500 }}>Project</span>
                <span style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a" }}>{order.project}</span>
              </div>
            </div>

            {/* Customer */}
            <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
              <div style={{ marginTop: "2px", color: "#2563eb", flexShrink: 0 }}>
                <UserDuotoneIcon size={16} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
                <span style={{ fontSize: "11px", color: "#64748b", fontWeight: 500 }}>Client / Contractor</span>
                <span style={{ fontSize: "13px", fontWeight: 600, color: "#1e293b" }}>{order.customer}</span>
              </div>
            </div>

            {/* Contact Phone */}
            <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
              <div style={{ marginTop: "2px", color: "#2563eb", flexShrink: 0 }}>
                <PhoneDuotoneIcon size={16} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
                <span style={{ fontSize: "11px", color: "#64748b", fontWeight: 500 }}>Contact Phone</span>
                <span style={{ fontSize: "13px", color: "#1e293b", fontWeight: 500 }}>{order.phone}</span>
              </div>
            </div>

            {/* Site Address */}
            <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
              <div style={{ marginTop: "2px", color: "#2563eb", flexShrink: 0 }}>
                <LocationDuotoneIcon size={16} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
                <span style={{ fontSize: "11px", color: "#64748b", fontWeight: 500 }}>Site Address</span>
                <span style={{ fontSize: "12.5px", color: "#1e293b", lineHeight: 1.4 }}>{order.deliveryLocation}</span>
              </div>
            </div>

            {/* GSTIN / Tax Details */}
            <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
              <div style={{ marginTop: "2px", color: "#2563eb", flexShrink: 0 }}>
                <GstDuotoneIcon size={16} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                <span style={{ fontSize: "11px", color: "#64748b", fontWeight: 500 }}>GSTIN / Tax ID</span>
                {order.gstin ? (
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                    <span
                      style={{
                        fontSize: "12px",
                        fontFamily: "monospace",
                        fontWeight: 650,
                        color: "#0f172a",
                        backgroundColor: "#f1f5f9",
                        padding: "2px 7px",
                        borderRadius: "4px",
                        letterSpacing: "0.5px",
                      }}
                    >
                      {order.gstin}
                    </span>
                    <span
                      style={{
                        fontSize: "10.5px",
                        color: "#16a34a",
                        backgroundColor: "#f0fdf4",
                        border: "1px solid #bbf7d0",
                        padding: "1px 6px",
                        borderRadius: "9999px",
                        fontWeight: 600,
                      }}
                    >
                      Verified GST
                    </span>
                  </div>
                ) : (
                  <span style={{ fontSize: "12px", color: "#94a3b8" }}>Unregistered / Not Provided</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Fulfillment & Schedule */}
        <div className={styles.cardBox}>
          <h4 className={styles.cardBoxTitle}>Fulfillment Schedule</h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "12.5px" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
              <div style={{ marginTop: "2px", color: "#2563eb", flexShrink: 0 }}>
                <CalendarDuotoneIcon size={16} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
                <span style={{ fontSize: "11px", color: "#64748b", fontWeight: 500 }}>Required By</span>
                <span style={{ fontSize: "13px", fontWeight: 650, color: "#0f172a" }}>{order.requiredBy}</span>
              </div>
            </div>

            {order.deliveryTracking ? (
              <div
                style={{
                  background: "#f8fafc",
                  padding: "8px 10px",
                  borderRadius: "8px",
                  fontSize: "12px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px",
                }}
              >
                <div>
                  <strong>Driver:</strong> {order.deliveryTracking.driverName}
                </div>
                <div>
                  <strong>Vehicle:</strong> {order.deliveryTracking.vehicleNo}
                </div>
                <div>
                  <strong>ETA:</strong> {order.deliveryTracking.eta} (Dispatched at{" "}
                  {order.deliveryTracking.dispatchedTime})
                </div>
              </div>
            ) : (
              <div style={{ color: "#64748b", fontSize: "12px" }}>
                Vehicle dispatch will be assigned when the order moves to Preparing stage.
              </div>
            )}

            {order.notes && (
              <div
                style={{
                  marginTop: "6px",
                  padding: "8px 10px",
                  borderRadius: "8px",
                  backgroundColor: "#fffbeb",
                  border: "1px solid #fef3c7",
                  fontSize: "12px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "2px",
                }}
              >
                <span style={{ fontSize: "11px", fontWeight: 700, color: "#b45309" }}>
                  ⚠️ Special Handling & Site Logistics
                </span>
                <span style={{ color: "#92400e", lineHeight: 1.4 }}>
                  {order.notes}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. MATERIAL REQUIREMENTS TABLE */}
      <div className={styles.materialRequirementsSection}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 4px" }}>
          <h4 className={styles.cardBoxTitle}>
            Material Requirements ({order.items.length} Items)
          </h4>
          <span style={{ fontSize: "11.5px", color: "#64748b" }}>
            {order.items.filter((i) => i.inStock).length} in stock ·{" "}
            {order.items.filter((i) => !i.inStock).length} sourcing required
          </span>
        </div>

        <div style={{ overflowX: "auto", scrollbarWidth: "none", msOverflowStyle: "none" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "separate",
              borderSpacing: "0 4px",
              textAlign: "left",
              fontSize: "12.5px",
            }}
          >
            <thead>
              <tr
                style={{
                  backgroundColor: "#ffffff",
                  color: "#94a3b8",
                  fontSize: "11px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                <th style={{ padding: "10px 14px", borderBottom: "1px solid #f1f5f9", borderTopLeftRadius: "10px", borderBottomLeftRadius: "10px" }}>
                  Material
                </th>
                <th style={{ padding: "10px 14px", borderBottom: "1px solid #f1f5f9" }}>
                  Category
                </th>
                <th style={{ padding: "10px 14px", borderBottom: "1px solid #f1f5f9" }}>
                  Quantity
                </th>
                <th style={{ padding: "10px 14px", borderBottom: "1px solid #f1f5f9" }}>
                  Stock Availability
                </th>
                <th style={{ padding: "10px 14px", borderBottom: "1px solid #f1f5f9" }}>
                  Depot Bay
                </th>
                <th style={{ padding: "10px 14px", borderBottom: "1px solid #f1f5f9" }}>
                  Rate (₹)
                </th>
                <th style={{ padding: "10px 16px", textAlign: "right", borderBottom: "1px solid #f1f5f9", borderTopRightRadius: "10px", borderBottomRightRadius: "10px" }}>
                  Total (₹)
                </th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => {
                const rate = item.quotedRate || item.estimatedRate;
                const lineTotal = item.quantity * rate;

                return (
                  <tr
                    key={item.id}
                    style={{
                      backgroundColor: "transparent",
                      transition: "all 0.12s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#f8fafc";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                    }}
                  >
                    {/* Material Name & Brand */}
                    <td style={{ padding: "11px 14px", verticalAlign: "middle", borderTopLeftRadius: "10px", borderBottomLeftRadius: "10px" }}>
                      <div style={{ fontWeight: 650, color: "#0f172a", fontSize: "13px" }}>{item.name}</div>
                      {item.brand && (
                        <div style={{ fontSize: "11px", color: "#64748b", marginTop: "1px" }}>OEM: {item.brand}</div>
                      )}
                    </td>

                    {/* Category */}
                    <td style={{ padding: "11px 14px", verticalAlign: "middle", color: "#64748b", fontSize: "12px" }}>
                      {item.category}
                    </td>

                    {/* Quantity */}
                    <td style={{ padding: "11px 14px", verticalAlign: "middle" }}>
                      <span style={{ fontWeight: 700, color: "#0f172a", fontSize: "13px" }}>
                        {item.quantity} {item.unit}
                      </span>
                    </td>

                    {/* Stock Availability */}
                    <td style={{ padding: "11px 14px", verticalAlign: "middle" }}>
                      {item.inStock ? (
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "5px",
                            fontSize: "11.5px",
                            fontWeight: 600,
                            color: "#16a34a",
                            backgroundColor: "#f0fdf4",
                            border: "1px solid #bbf7d0",
                            padding: "3px 9px",
                            borderRadius: "9999px",
                          }}
                        >
                          <CheckCircle2 size={12} color="#16a34a" />
                          <span>In Stock ({item.availableQty} available)</span>
                        </span>
                      ) : (
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "5px",
                            fontSize: "11.5px",
                            fontWeight: 600,
                            color: "#d97706",
                            backgroundColor: "#fffbeb",
                            border: "1px solid #fde68a",
                            padding: "3px 9px",
                            borderRadius: "9999px",
                          }}
                        >
                          <AlertTriangle size={12} color="#d97706" />
                          <span>Requires Sourcing</span>
                        </span>
                      )}
                    </td>

                    {/* Depot Bay */}
                    <td style={{ padding: "11px 14px", verticalAlign: "middle" }}>
                      <span
                        style={{
                          fontFamily: "monospace",
                          fontSize: "11.5px",
                          fontWeight: 650,
                          color: "#334155",
                          backgroundColor: "#f1f5f9",
                          padding: "2px 7px",
                          borderRadius: "4px",
                          letterSpacing: "0.3px",
                        }}
                      >
                        {item.bayLocation || "Bay A-01"}
                      </span>
                    </td>

                    {/* Unit Rate */}
                    <td style={{ padding: "11px 14px", verticalAlign: "middle", fontSize: "12.5px", color: "#475569" }}>
                      ₹{rate.toLocaleString("en-IN")}
                    </td>

                    {/* Line Total */}
                    <td style={{ padding: "11px 16px", textAlign: "right", verticalAlign: "middle", borderTopRightRadius: "10px", borderBottomRightRadius: "10px" }}>
                      <strong style={{ fontSize: "13px", fontWeight: 750, color: "#0f172a" }}>
                        ₹{lineTotal.toLocaleString("en-IN")}
                      </strong>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. QUOTATION BUILDER & SUMMARY SECTION */}
      {isQuoting ? (
        <div
          className={styles.cardBox}
          style={{ borderColor: "#bfdbfe", background: "#f8faff" }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <h4 style={{ margin: 0, fontSize: "13px", fontWeight: 700, color: "#1e40af" }}>
              🛠️ Quick Contractor Quotation Builder
            </h4>
            <button
              type="button"
              onClick={() => setIsQuoting(false)}
              style={{
                fontSize: "12px",
                color: "#64748b",
                background: "none",
                border: "none",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginTop: "8px" }}>
            <div>
              <label style={{ fontSize: "12px", color: "#475569", fontWeight: 600, display: "block", marginBottom: "4px" }}>
                Delivery & Staging Fee (₹):
              </label>
              <input
                type="number"
                value={customDeliveryFee}
                onChange={(e) => setCustomDeliveryFee(e.target.value)}
                style={{
                  width: "100%",
                  height: "34px",
                  padding: "0 10px",
                  borderRadius: "6px",
                  border: "1px solid #cbd5e1",
                  fontSize: "13px",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: "12px", color: "#475569", fontWeight: 600, display: "block", marginBottom: "4px" }}>
                Quotation Validity & Notes:
              </label>
              <input
                type="text"
                value={quoteNotes}
                onChange={(e) => setQuoteNotes(e.target.value)}
                style={{
                  width: "100%",
                  height: "34px",
                  padding: "0 10px",
                  borderRadius: "6px",
                  border: "1px solid #cbd5e1",
                  fontSize: "13px",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>
          </div>

          <div
            style={{
              marginTop: "12px",
              padding: "10px 14px",
              background: "#ffffff",
              borderRadius: "8px",
              border: "1px solid #e2e8f0",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div style={{ fontSize: "12.5px", color: "#475569" }}>
              Subtotal: ₹{subtotal.toLocaleString("en-IN")} + Delivery: ₹{deliveryFee} + GST (12%): ₹{tax.toLocaleString("en-IN")}
            </div>
            <div style={{ fontSize: "16px", fontWeight: 750, color: "#0f172a" }}>
              Total: ₹{total.toLocaleString("en-IN")}
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "10px" }}>
            <button
              type="button"
              onClick={() => {
                onUpdateStatus("QUOTED");
                setIsQuoting(false);
              }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 16px",
                background: "#2563eb",
                color: "#ffffff",
                border: "none",
                borderRadius: "9999px",
                fontSize: "12.5px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              <Send size={13} />
              <span>Send Official Quote to Contractor</span>
            </button>
          </div>
        </div>
      ) : null}

      {/* 6. OPERATIONAL LIFECYCLE ACTION BAR */}
      <div className={styles.actionFooterBar}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "12.5px", color: "#64748b" }}>Current Lifecycle Stage:</span>
          <span className={`${styles.statusPill} ${getStatusPillClass(order.status)}`}>
            {order.status}
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          {order.status === "REQUEST" && (
            <>
              <button
                type="button"
                className={styles.secondaryActionBtn}
                onClick={() => onUpdateStatus("REVIEWING")}
              >
                Mark Under Review
              </button>
              <button
                type="button"
                className={styles.primaryActionBtn}
                onClick={() => setIsQuoting(true)}
              >
                <FileText size={14} />
                <span>Build & Send Quote</span>
              </button>
            </>
          )}

          {order.status === "REVIEWING" && (
            <button
              type="button"
              className={styles.primaryActionBtn}
              onClick={() => setIsQuoting(true)}
            >
              <FileText size={14} />
              <span>Build & Send Quote</span>
            </button>
          )}

          {order.status === "QUOTED" && (
            <button
              type="button"
              className={styles.primaryActionBtn}
              onClick={() => onUpdateStatus("CONFIRMED")}
            >
              <CheckCircle2 size={14} />
              <span>Confirm Contractor Acceptance</span>
            </button>
          )}

          {order.status === "CONFIRMED" && (
            <button
              type="button"
              className={styles.primaryActionBtn}
              onClick={() => onUpdateStatus("PREPARING")}
            >
              <Package size={14} />
              <span>Start Preparing in Depot</span>
            </button>
          )}

          {order.status === "PREPARING" && (
            <button
              type="button"
              className={styles.primaryActionBtn}
              onClick={() => onUpdateStatus("DISPATCHED")}
            >
              <Truck size={14} />
              <span>Dispatch Order (Assign Vehicle)</span>
            </button>
          )}

          {order.status === "DISPATCHED" && (
            <button
              type="button"
              className={styles.primaryActionBtn}
              onClick={() => onUpdateStatus("COMPLETED")}
            >
              <Check size={14} />
              <span>Mark Delivered & Completed</span>
            </button>
          )}

          {order.status === "COMPLETED" && (
            <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#059669", fontSize: "13px", fontWeight: 650 }}>
              <CheckCircle2 size={16} />
              <span>Order Fulfilled and Settled</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
