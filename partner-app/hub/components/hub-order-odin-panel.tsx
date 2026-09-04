"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  SendHorizontal,
  X,
  Package,
  CheckCircle2,
  AlertTriangle,
  FileText,
  DollarSign,
  Truck,
  Building2,
  Check,
  Clock,
} from "lucide-react";
import { StudioDuotoneIcon } from "@/components/layout/sidebar-icons";
import { HubOrder } from "../types/hub-order";
import styles from "./hub-order-odin-panel.module.css";

interface HubOrderOdinPanelProps {
  order: HubOrder | null;
  onClose?: () => void;
  onAdvanceStatus?: (nextStatus: HubOrder["status"]) => void;
  onBuildQuote?: () => void;
}

interface ChatMessage {
  role: "user" | "odin";
  text: string;
  timestamp: string;
  actionWidget?: "quote_preview" | "supplier_lookup" | "pricing_comparison" | "delay_analysis";
}

export function HubOrderOdinPanel({
  order,
  onClose,
  onAdvanceStatus,
  onBuildQuote,
}: HubOrderOdinPanelProps) {
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [chatLog, setChatLog] = useState<ChatMessage[]>([]);
  const [activeIntent, setActiveIntent] = useState<string | null>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new turns
  useEffect(() => {
    if (typeof chatBottomRef.current?.scrollIntoView === "function") {
      chatBottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatLog, isTyping, activeIntent]);

  // Reset chat when order changes
  useEffect(() => {
    setChatLog([]);
    setActiveIntent(null);
  }, [order?.id]);

  // Derived stock availability stats
  const totalItems = order?.items.length || 0;
  const inStockItems = order?.items.filter((it) => it.inStock) || [];
  const sourcingItems = order?.items.filter((it) => !it.inStock) || [];
  const inStockCount = inStockItems.length;
  const sourcingCount = sourcingItems.length;

  const handleSendMessage = (textToSend?: string) => {
    const text = textToSend || inputText.trim();
    if (!text) return;

    const userMsg: ChatMessage = {
      role: "user",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setChatLog((prev) => [...prev, userMsg]);
    if (!textToSend) setInputText("");
    setIsTyping(true);

    setTimeout(() => {
      let odinResponse = "";
      let widget: ChatMessage["actionWidget"] | undefined = undefined;

      const lower = text.toLowerCase();
      if (lower.includes("fulfil") || lower.includes("today")) {
        odinResponse = `Analysis for ${order ? order.id : "current orders"}: 3 of 4 materials are staged in Bay A & B. The Supreme CPVC Pipes require factory pickup (ETA 3:30 PM). If dispatched by 4:00 PM, full delivery will reach ${order?.project || "site"} before 5:30 PM.`;
      } else if (lower.includes("supplier") || lower.includes("alternative")) {
        odinResponse = `Found 2 verified nearby Tier-1 suppliers with immediate CPVC stock: Supreme Depot Kazhakkoottam (1.2 km, ₹455/unit) and Astral Authorized Distributor (3.5 km, ₹462/unit). Direct pickup available within 45 mins.`;
        widget = "supplier_lookup";
      } else if (lower.includes("quote") || lower.includes("price")) {
        odinResponse = `Calculated optimal contractor quote for ${order ? order.project : "this order"}: Subtotal ₹${order ? order.estimatedValue.toLocaleString("en-IN") : "2,82,400"} with 12% target margin. Valid for 7 calendar days.`;
        widget = "quote_preview";
      } else if (lower.includes("delay") || lower.includes("status")) {
        odinResponse = `No major critical path delays. Bay loading is 80% complete. Flatbed vehicle KL-07-CD-4421 is assigned and awaiting final gate security pass.`;
        widget = "delay_analysis";
      } else if (lower.includes("compare") || lower.includes("history")) {
        odinResponse = `Compared with ${order ? order.customer : "contractor"}'s last requisition (ORD-1011 on Aug 12): Cement rate is steady at ₹425/bag, TMT 12mm increased by ₹800/MT due to recent steel index adjustment.`;
        widget = "pricing_comparison";
      } else {
        odinResponse = `Understood. I've updated the order context for ${order ? order.id : "Hub Orders"}. All line items and depot allocations remain synchronized.`;
      }

      setChatLog((prev) => [
        ...prev,
        {
          role: "odin",
          text: odinResponse,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          actionWidget: widget,
        },
      ]);
      setIsTyping(false);
    }, 600);
  };

  return (
    <aside className={styles.aiOrderPanelContainer}>
      <div className={styles.minimalBookingCard}>
        {/* 1. TOP HEADER CARD */}
        <header className={styles.minimalBookingHeader}>
          <div className={styles.minimalBookingHeaderLeft}>
            <div className={styles.minimalOdinAvatar}>
              <Sparkles size={14} />
            </div>
            <div className={styles.minimalBookingHeaderTitles}>
              <h4 className={styles.minimalBookingTitle}>Odin · Order Intelligence</h4>
              <p className={styles.minimalBookingSub}>
                {order ? `${order.id} · ${order.project}` : "Hub Operational Assistant"}
              </p>
            </div>
          </div>
          {onClose && (
            <button
              type="button"
              className={styles.minimalHeaderActionBtn}
              onClick={onClose}
              aria-label="Close Odin Assistant"
            >
              <X size={14} />
            </button>
          )}
        </header>

        {/* 2. MIDDLE CHAT & INTELLIGENCE STREAM CARD */}
        <div className={styles.minimalChatStream}>
          {order ? (
            <>
              {/* ORDER DIAGNOSTIC CARD */}
              <div className={styles.odinChatRow}>
                <div className={styles.odinAvatarIcon}>
                  <StudioDuotoneIcon size={16} />
                </div>
                <div className={styles.odinChatContent}>
                  <p style={{ margin: "0 0 8px 0" }}>
                    This requisition for <strong>{order.project}</strong> contains{" "}
                    <strong>
                      {totalItems} material {totalItems === 1 ? "line" : "lines"}
                    </strong>
                    .
                  </p>

                  {/* Stock Availability Breakdown */}
                  <div
                    style={{
                      background: "#f8fafc",
                      borderRadius: "12px",
                      padding: "10px 12px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "6px",
                      fontSize: "12px",
                      marginBottom: "10px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#059669" }}>
                      <CheckCircle2 size={14} />
                      <span>
                        <strong>{inStockCount}</strong> requested {inStockCount === 1 ? "material" : "materials"} available in depot
                      </span>
                    </div>

                    {sourcingCount > 0 ? (
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#d97706" }}>
                        <AlertTriangle size={14} />
                        <span>
                          <strong>{sourcingCount}</strong> material requires sourcing (
                          {sourcingItems.map((it) => it.name.split(" ")[0]).join(", ")})
                        </span>
                      </div>
                    ) : (
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#059669" }}>
                        <CheckCircle2 size={14} />
                        <span>All materials in stock and ready for staging</span>
                      </div>
                    )}
                  </div>

                  {/* Operational Status Context */}
                  <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "10px" }}>
                    {order.status === "REQUEST" || order.status === "REVIEWING" ? (
                      <span>
                        📌 <strong>Required By:</strong> {order.requiredBy} ({order.deliveryLocation.split(",")[1]?.trim() || "Local Site"})
                      </span>
                    ) : (
                      <span>
                        🚚 <strong>Status:</strong> Currently in <strong>{order.status}</strong> stage.
                      </span>
                    )}
                  </div>

                  {/* CONTEXTUAL ACTION PILLS */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                    {(order.status === "REQUEST" || order.status === "REVIEWING") && (
                      <button
                        type="button"
                        onClick={() => {
                          if (onBuildQuote) onBuildQuote();
                          handleSendMessage("Build a quote for this order");
                        }}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "5px",
                          padding: "5px 10px",
                          background: "#0f172a",
                          color: "#ffffff",
                          border: "none",
                          borderRadius: "9999px",
                          fontSize: "11.5px",
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        <FileText size={12} />
                        <span>Build Quote</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleSendMessage("Check pricing and margins")}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "5px",
                        padding: "5px 10px",
                        background: "#f1f5f9",
                        color: "#0f172a",
                        border: "none",
                        borderRadius: "9999px",
                        fontSize: "11.5px",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      <DollarSign size={12} />
                      <span>Check Pricing</span>
                    </button>

                    {sourcingCount > 0 && (
                      <button
                        type="button"
                        onClick={() => handleSendMessage("Find an alternative supplier for missing items")}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "5px",
                          padding: "5px 10px",
                          background: "#f1f5f9",
                          color: "#0f172a",
                          border: "none",
                          borderRadius: "9999px",
                          fontSize: "11.5px",
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        <Building2 size={12} />
                        <span>Find Supplier</span>
                      </button>
                    )}

                    {order.status === "CONFIRMED" && (
                      <button
                        type="button"
                        onClick={() => {
                          if (onAdvanceStatus) onAdvanceStatus("PREPARING");
                          handleSendMessage("Start preparing order at warehouse bays");
                        }}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "5px",
                          padding: "5px 10px",
                          background: "#0f172a",
                          color: "#ffffff",
                          border: "none",
                          borderRadius: "9999px",
                          fontSize: "11.5px",
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        <Package size={12} />
                        <span>Start Preparing</span>
                      </button>
                    )}

                    {order.status === "PREPARING" && (
                      <button
                        type="button"
                        onClick={() => {
                          if (onAdvanceStatus) onAdvanceStatus("DISPATCHED");
                          handleSendMessage("Dispatch order and alert site team");
                        }}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "5px",
                          padding: "5px 10px",
                          background: "#0f172a",
                          color: "#ffffff",
                          border: "none",
                          borderRadius: "9999px",
                          fontSize: "11.5px",
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        <Truck size={12} />
                        <span>Dispatch Order</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* DYNAMIC CHAT LOG */}
              {chatLog.map((msg, idx) => (
                <div
                  key={idx}
                  className={styles.odinChatRow}
                  style={{ justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}
                >
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
                    <div>{msg.text}</div>

                    {/* CONTEXTUAL ACTION WIDGETS */}
                    {msg.actionWidget === "supplier_lookup" && (
                      <div
                        style={{
                          marginTop: "8px",
                          padding: "10px",
                          background: "#f8fafc",
                          borderRadius: "10px",
                          fontSize: "11.5px",
                          display: "flex",
                          flexDirection: "column",
                          gap: "6px",
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <strong>Supreme Depot Kazhakkoottam</strong>
                          <span style={{ color: "#059669", fontWeight: 650 }}>₹455 / unit</span>
                        </div>
                        <div style={{ color: "#64748b" }}>Distance: 1.2 km · Stock: 150 units · Lead: 45 min</div>
                        <button
                          type="button"
                          onClick={() => handleSendMessage("Request emergency dispatch from Supreme Depot")}
                          style={{
                            marginTop: "4px",
                            padding: "4px 8px",
                            background: "#0f172a",
                            color: "#ffffff",
                            border: "none",
                            borderRadius: "6px",
                            fontSize: "11px",
                            fontWeight: 600,
                            cursor: "pointer",
                            width: "fit-content",
                          }}
                        >
                          Request Dispatch
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className={styles.odinChatRow}>
                  <div className={styles.odinAvatarIcon}>
                    <StudioDuotoneIcon size={16} />
                  </div>
                  <div style={{ display: "flex", gap: "4px", padding: "2px 0", background: "transparent" }}>
                    <span style={{ fontSize: "12px", color: "#64748b", fontStyle: "italic" }}>
                      ✨ Odin AI is analyzing order context...
                    </span>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* GENERAL HUB ORDERS OVERVIEW IF NO SPECIFIC ORDER IS OPEN */
            <div className={styles.odinChatRow}>
              <div className={styles.odinAvatarIcon}>
                <StudioDuotoneIcon size={16} />
              </div>
              <div className={styles.odinChatContent}>
                <p style={{ margin: "0 0 6px 0", fontWeight: 600 }}>Hub Order Operations Live</p>
                <p style={{ margin: 0, color: "#64748b" }}>
                  Select an order from the list to view automated stock availability, quote builders, and delivery dispatch routes.
                </p>
              </div>
            </div>
          )}
          <div ref={chatBottomRef} />
        </div>

        {/* 3. PROMPT ACTION SUGGESTIONS & COMPOSER */}
        {order && (
          <div
            style={{
              padding: "0 10px 6px 10px",
              display: "flex",
              gap: "6px",
              overflowX: "auto",
              scrollbarWidth: "none",
            }}
          >
            {[
              "Can we fulfil this order today?",
              "Find an alternative supplier",
              "Compare pricing with last order",
              "What is causing the delay?",
            ].map((suggestion, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(suggestion)}
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

        <form
          className={styles.minimalComposer}
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
        >
          <div className={styles.minimalComposerRow}>
            <input
              type="text"
              className={styles.minimalComposerInput}
              placeholder={order ? `Ask Odin about ${order.id}...` : "Ask Odin about orders..."}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
            <button
              type="submit"
              className={`${styles.minimalSendBtn} ${inputText.trim() ? styles.minimalSendBtnActive : ""}`}
              aria-label="Send query to Odin"
            >
              <SendHorizontal size={14} />
            </button>
          </div>
        </form>
      </div>
    </aside>
  );
}
