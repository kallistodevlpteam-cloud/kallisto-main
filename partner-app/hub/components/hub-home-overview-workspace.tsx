"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Package,
  Send,
  ExternalLink,
  Clock,
  Building2,
  Truck,
  Plus,
  ChevronDown,
  Mic,
  SendHorizontal,
} from "lucide-react";
import {
  MapPinDuotoneIcon,
  CalendarDuotoneIcon,
  StudioDuotoneIcon,
} from "@/components/layout/sidebar-icons";
import styles from "./hub-home-overview.module.css";

interface OrderAlertItem {
  id: string;
  project: string;
  materialsCount: number;
  timelineLabel: string;
  status: "NEW_REQUEST" | "PREPARING" | "PAYMENT_PENDING" | "DISPATCHED";
  statusLabel: string;
  actionLabel: string;
}

interface ProductAlertItem {
  id: string;
  name: string;
  issue: string;
  type: "warning" | "success" | "critical";
}

const ATTENTION_ORDERS: OrderAlertItem[] = [
  {
    id: "ORD-1024",
    project: "Greenwood Villa",
    materialsCount: 4,
    timelineLabel: "Required Tomorrow",
    status: "NEW_REQUEST",
    statusLabel: "New Request",
    actionLabel: "Review",
  },
  {
    id: "ORD-1021",
    project: "Skyline Apartments",
    materialsCount: 7,
    timelineLabel: "Delivery Today",
    status: "PREPARING",
    statusLabel: "Preparing",
    actionLabel: "Open",
  },
  {
    id: "ORD-1018",
    project: "Ocean Heights",
    materialsCount: 2,
    timelineLabel: "Payment Pending · ₹64,000",
    status: "PAYMENT_PENDING",
    statusLabel: "Payment Pending",
    actionLabel: "View",
  },
  {
    id: "ORD-1022",
    project: "Prestige Heights",
    materialsCount: 3,
    timelineLabel: "Out for Delivery",
    status: "DISPATCHED",
    statusLabel: "Dispatched",
    actionLabel: "Track",
  },
];

const PRODUCT_ALERTS: ProductAlertItem[] = [
  {
    id: "p-1",
    name: "Tata TMT 16mm",
    issue: "Low availability · 3.2 MT remaining",
    type: "warning",
  },
  {
    id: "p-2",
    name: "Asian Paints Apex",
    issue: "Product availability needs update",
    type: "warning",
  },
  {
    id: "p-3",
    name: "UltraTech Cement",
    issue: "High demand · 840 Bags available",
    type: "success",
  },
  {
    id: "p-4",
    name: "Supreme CPVC Pipes",
    issue: "Stock depleted · Sourcing required",
    type: "critical",
  },
];

interface ChatTurn {
  role: "user" | "odin";
  text: string;
  timestamp: string;
  widget?: {
    type: "quote" | "supplier" | "payment" | "tracking";
    data?: any;
    executed?: boolean;
  };
}

function LocationDuotoneIcon({ size = 16, color = "#2563eb" }: { size?: number; color?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ color, flexShrink: 0 }}
      aria-hidden="true"
    >
      <path
        d="M12 2C7.6 2 4 5.6 4 10C4 15.2 12 22 12 22C12 22 20 15.2 20 10C20 5.6 16.4 2 12 2Z"
        fill="currentColor"
        opacity="0.38"
      />
      <circle cx="12" cy="10" r="3.5" fill="currentColor" />
    </svg>
  );
}

export function HubHomeOverviewWorkspace() {
  const router = useRouter();

  // Reactive workspace data
  const [orders, setOrders] = useState<OrderAlertItem[]>(ATTENTION_ORDERS);
  const [products, setProducts] = useState<ProductAlertItem[]>(PRODUCT_ALERTS);
  const [metrics, setMetrics] = useState({
    requests: 4,
    active: 12,
    activeValue: "₹4.8L",
    pendingPayments: "₹1.2L",
  });

  // Hub operational status toggle
  const [isHubActive, setIsHubActive] = useState<boolean>(true);

  // Odin interactive chat state
  const [odinInput, setOdinInput] = useState<string>("");
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [chatLog, setChatLog] = useState<ChatTurn[]>([]);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof chatBottomRef.current?.scrollIntoView === "function") {
      chatBottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatLog, isTyping]);

  const handleExecuteWidgetAction = (idx: number, type: string) => {
    setChatLog((prev) =>
      prev.map((turn, i) =>
        i === idx && turn.widget ? { ...turn, widget: { ...turn.widget, executed: true } } : turn
      )
    );

    if (type === "quote") {
      // Transition ORD-1024 from NEW_REQUEST to PREPARING
      setOrders((prev) =>
        prev.map((ord) =>
          ord.id === "ORD-1024"
            ? { ...ord, status: "PREPARING", statusLabel: "Preparing", actionLabel: "Open" }
            : ord
        )
      );
      setMetrics((prev) => ({
        ...prev,
        requests: Math.max(0, prev.requests - 1),
        active: prev.active + 1,
        activeValue: "₹5.4L",
      }));
    } else if (type === "supplier") {
      // Resolve Supreme CPVC pipes alert
      setProducts((prev) =>
        prev.map((prod) =>
          prod.id === "p-4"
            ? {
                ...prod,
                issue: "Factory cross-docking scheduled (ETA 3:30 PM)",
                type: "success" as const,
              }
            : prod
        )
      );
    } else if (type === "payment") {
      // Payment reminder confirmation
      setOrders((prev) =>
        prev.map((ord) =>
          ord.id === "ORD-1018"
            ? { ...ord, timelineLabel: "Reminder Sent · ₹64,000" }
            : ord
        )
      );
    }
  };

  const handleQuery = (queryText: string) => {
    const text = queryText.trim();
    if (!text) return;

    const userTurn: ChatTurn = {
      role: "user",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    let responseText = "";
    let widgetData: ChatTurn["widget"] = undefined;
    const q = text.toLowerCase();

    if (q.includes("quote") || q.includes("urgent") || q.includes("ord-1024") || q.includes("most urgent")) {
      responseText =
        "ORD-1024 for Greenwood Villa is your most urgent item. Calculated optimal contractor quote with 12% target margin:";
      widgetData = {
        type: "quote",
        data: {
          orderId: "ORD-1024",
          project: "Greenwood Villa",
          items: "4 Materials (TMT, Cement, Sand, CPVC)",
          value: "₹2,82,400",
          margin: "12% Gross Margin",
        },
      };
    } else if (q.includes("supplier") || q.includes("sourcing") || q.includes("pipes") || q.includes("cpvc")) {
      responseText =
        "Found 2 verified Tier-1 suppliers with immediate CPVC pipe stock near Kochi:";
      widgetData = {
        type: "supplier",
        data: {
          supplier: "Supreme Depot Kazhakkoottam (1.2 km)",
          price: "₹455 / bundle · 120 units available",
          pickup: "Ready for pickup within 45 mins",
        },
      };
    } else if (q.includes("payment") || q.includes("pending payment")) {
      responseText =
        "You have ₹1.2L in pending milestone payments. ORD-1018 (₹64,000) and ORD-1015 (₹56,000) are awaiting client settlement:";
      widgetData = {
        type: "payment",
        data: {
          order: "ORD-1018 · Ocean Heights",
          amount: "₹64,000",
          status: "Milestone 2 Verified by Site Engineer",
        },
      };
    } else if (q.includes("track") || q.includes("delivery") || q.includes("prestige")) {
      responseText =
        "Vehicle KL-07-CD-4421 (Flatbed) is currently in transit to Prestige Heights:";
      widgetData = {
        type: "tracking",
        data: {
          driver: "Ramesh K. (+91 98471 22910)",
          eta: "11:30 AM (On Schedule)",
          gatePass: "Pass #GP-8842 Verified",
        },
      };
    } else if (q.includes("product") || q.includes("attention")) {
      responseText =
        "2 products need immediate review: Tata TMT 16mm is down to 3.2 MT, and Supreme CPVC Pipes require cross-docking sourcing.";
    } else {
      responseText =
        "Review ORD-1024 first to send the quote before cutoff, then replenish Tata TMT 16mm stock in Bay A.";
    }

    const odinTurn: ChatTurn = {
      role: "odin",
      text: responseText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      widget: widgetData,
    };

    setChatLog((prev) => [...prev, userTurn, odinTurn]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!odinInput.trim()) return;
    handleQuery(odinInput);
    setOdinInput("");
  };

  return (
    <div className={styles.homeContainer}>
      {/* LEFT: PRIMARY OPERATIONAL WORKSPACE */}
      <main className={styles.mainWorkspace} aria-label="Hub Overview Workspace">
        {/* 1. CONTEXT HEADER & METADATA BAR */}
        <header className={styles.pageHeaderStack} aria-label="Hub Context Header">
          <div className={styles.headerTopRow}>
            <div className={styles.headerTitleGroup}>
              <h1 className={styles.headerGreeting}>Good morning, BuildMart</h1>
              <p className={styles.headerSubtitle}>
                Here&apos;s what&apos;s happening with your Hub today.
              </p>
            </div>
          </div>

          {/* Context Metadata Bar */}
          <div className={styles.contextMetadataBar}>
            <div className={styles.metaGroupLeft}>
              <div className={styles.metaItem}>
                <LocationDuotoneIcon size={16} color="#2563eb" />
                <span className={styles.metaZoneLabel}>Fulfilment Zone:</span>
                <span className={styles.metaZoneValue}>Kochi · 25 km</span>
              </div>
            </div>

            <div className={styles.metaGroupRight}>
              <div className={styles.metaToggleContainer}>
                <span className={styles.metaActiveIndicator}>
                  <span
                    className={`${styles.metaIndicatorDot} ${
                      isHubActive ? "" : styles.metaIndicatorDotInactive
                    }`}
                  />
                  <span>{isHubActive ? "Active" : "Inactive"}</span>
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={isHubActive}
                  aria-label="Toggle Hub Operational Status"
                  className={`${styles.toggleSwitchBtn} ${
                    isHubActive ? styles.toggleSwitchBtnActive : ""
                  }`}
                  onClick={() => setIsHubActive((prev) => !prev)}
                >
                  <span
                    className={`${styles.toggleThumb} ${
                      isHubActive ? styles.toggleThumbActive : ""
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* 2. TODAY'S BUSINESS SNAPSHOT */}
        <section className={styles.snapshotGrid} aria-label="Today's Business Snapshot">
          <div
            className={styles.snapshotCard}
            onClick={() => router.push("/partner/hub/orders?tab=requests")}
            role="button"
            tabIndex={0}
          >
            <span className={styles.snapshotValue}>{metrics.requests}</span>
            <span className={styles.snapshotLabel}>New Requests</span>
          </div>

          <div
            className={styles.snapshotCard}
            onClick={() => router.push("/partner/hub/orders?tab=active")}
            role="button"
            tabIndex={0}
          >
            <span className={styles.snapshotValue}>{metrics.active}</span>
            <span className={styles.snapshotLabel}>Active Orders</span>
          </div>

          <div
            className={styles.snapshotCard}
            onClick={() => router.push("/partner/hub/orders")}
            role="button"
            tabIndex={0}
          >
            <span className={styles.snapshotValue}>{metrics.activeValue}</span>
            <span className={styles.snapshotLabel}>Active Order Value</span>
          </div>

          <div
            className={styles.snapshotCard}
            onClick={() => router.push("/partner/hub/payments")}
            role="button"
            tabIndex={0}
          >
            <span className={styles.snapshotValue}>{metrics.pendingPayments}</span>
            <span className={styles.snapshotLabel}>Pending Payments</span>
          </div>
        </section>

        {/* 3. ORDERS REQUIRING ATTENTION */}
        <section className={styles.sectionCard} aria-label="Orders Requiring Attention">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Orders Requiring Attention</h2>
            <button
              type="button"
              className={styles.viewAllLink}
              onClick={() => router.push("/partner/hub/orders")}
            >
              <span>View All</span>
              <ArrowRight size={12} />
            </button>
          </div>

          <div className={styles.ordersList}>
            {orders.map((order) => {
              const getBadgeClass = () => {
                switch (order.status) {
                  case "NEW_REQUEST":
                    return styles.badgeNewRequest;
                  case "PREPARING":
                    return styles.badgePreparing;
                  case "PAYMENT_PENDING":
                    return styles.badgePaymentPending;
                  case "DISPATCHED":
                    return styles.badgeDispatched;
                }
              };

              return (
                <div
                  key={order.id}
                  className={styles.orderRow}
                  onClick={() => router.push(`/partner/hub/orders?orderId=${order.id}`)}
                >
                  <div className={styles.orderLeftInfo}>
                    <div className={styles.orderMetaStack}>
                      <div className={styles.orderTitleRow}>
                        <span className={styles.orderId}>{order.id}</span>
                        <span className={styles.orderProject}>· {order.project}</span>
                      </div>
                      <div className={styles.orderDetailsSub}>
                        <span>
                          {order.materialsCount}{" "}
                          {order.materialsCount === 1 ? "Material" : "Materials"}
                        </span>
                        <span>·</span>
                        <span>{order.timelineLabel}</span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.orderRightActions}>
                    <span className={`${styles.orderStatusBadge} ${getBadgeClass()}`}>
                      {order.statusLabel}
                    </span>
                    <button
                      type="button"
                      className={styles.orderRowBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/partner/hub/orders?orderId=${order.id}`);
                      }}
                    >
                      {order.actionLabel}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 4. PRODUCT ALERTS */}
        <section className={styles.sectionCard} aria-label="Product Alerts">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Product Alerts</h2>
            <button
              type="button"
              className={styles.viewAllLink}
              onClick={() => router.push("/partner/hub/products")}
            >
              <span>View Products</span>
              <ArrowRight size={12} />
            </button>
          </div>

          <div className={styles.productAlertsList}>
            {products.map((prod) => (
              <div
                key={prod.id}
                className={styles.productAlertRow}
                onClick={() => router.push("/partner/hub/products")}
              >
                <div className={styles.productAlertLeft}>
                  {prod.type === "success" ? (
                    <CheckCircle2 size={15} className={styles.productAlertIconGreen} />
                  ) : (
                    <AlertTriangle size={15} className={styles.productAlertIconAmber} />
                  )}
                  <strong className={styles.productAlertName}>{prod.name}</strong>
                  <span className={styles.productAlertSep}>—</span>
                  <span className={styles.productAlertDesc}>{prod.issue}</span>
                </div>
                <ArrowRight size={13} color="#94a3b8" />
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* RIGHT: ODIN HUB INTELLIGENCE PANEL (3-Card Structure) */}
      <aside className={styles.rightOdinPanel} aria-label="Odin Hub Intelligence">
        <div className={styles.minimalBookingCard}>
          {/* 1. TOP HEADER CARD */}
          <header className={styles.minimalBookingHeader}>
            <div className={styles.minimalBookingHeaderLeft}>
              <div className={styles.minimalOdinAvatar}>
                <StudioDuotoneIcon size={18} />
              </div>
              <div className={styles.minimalBookingHeaderTitles}>
                <h4 className={styles.minimalBookingTitle}>Odin</h4>
                <p className={styles.minimalBookingSub}>Hub Intelligence</p>
              </div>
            </div>
          </header>

          {/* 2. MIDDLE CHAT & CONTEXT STREAM CARD */}
          <div className={styles.minimalChatStream}>
            {/* Operational Summary */}
            <div className={styles.odinSummaryBox}>
              <p className={styles.odinSummaryTitle}>
                Here&apos;s what needs your attention today:
              </p>
              <div className={styles.odinBulletList}>
                <div className={styles.odinBulletItem}>
                  <AlertTriangle size={12} color="#ea580c" />
                  <span>4 new order requests</span>
                </div>
                <div className={styles.odinBulletItem}>
                  <AlertTriangle size={12} color="#ea580c" />
                  <span>2 products need attention</span>
                </div>
                <div className={styles.odinBulletItem}>
                  <Clock size={12} color="#2563eb" />
                  <span>₹1.2L pending payments</span>
                </div>
              </div>
            </div>

            {/* Prioritized Recommendation */}
            <div className={styles.odinRecommendCard}>
              <span className={styles.recommendTag}>RECOMMENDED NEXT STEP</span>
              <p className={styles.recommendText}>
                Review ORD-1024 before its required delivery date.
              </p>
              <button
                type="button"
                className={styles.recommendBtn}
                onClick={() => router.push("/partner/hub/orders?orderId=ORD-1024")}
              >
                <span>Review Order</span>
                <ExternalLink size={12} />
              </button>
            </div>

            {/* Interactive Chat Messages */}
            {chatLog.map((msg, idx) => (
              <React.Fragment key={idx}>
                {msg.role === "user" ? (
                  <div className={styles.userChatRow}>
                    <div className={styles.userChatContent}>{msg.text}</div>
                  </div>
                ) : (
                  <div className={styles.odinChatRow}>
                    <div className={styles.odinAvatarIcon}>
                      <StudioDuotoneIcon size={15} />
                    </div>
                    <div className={styles.odinChatContent}>
                      <div>{msg.text}</div>

                      {/* Generative Interactive Micro-Widgets */}
                      {msg.widget && (
                        <div className={styles.widgetCard}>
                          {msg.widget.type === "quote" && (
                            <>
                              <div className={styles.widgetHeader}>
                                <span className={styles.widgetTitle}>
                                  <Package size={12} />
                                  <span>Quote Summary · {msg.widget.data.orderId}</span>
                                </span>
                                <span className={`${styles.widgetBadge} ${styles.widgetBadgeAmber}`}>
                                  {msg.widget.data.margin}
                                </span>
                              </div>
                              <div className={styles.widgetRow}>
                                <span>Project:</span>
                                <strong>{msg.widget.data.project}</strong>
                              </div>
                              <div className={styles.widgetRow}>
                                <span>Materials:</span>
                                <span>{msg.widget.data.items}</span>
                              </div>
                              <div className={styles.widgetRow}>
                                <span>Calculated Quote:</span>
                                <strong style={{ color: "#0f172a", fontSize: "12px" }}>
                                  {msg.widget.data.value}
                                </strong>
                              </div>

                              {msg.widget.executed ? (
                                <div className={styles.widgetSuccessBanner}>
                                  <CheckCircle2 size={13} />
                                  <span>Quote sent to contractor · Order moved to Preparing</span>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  className={styles.widgetActionBtn}
                                  onClick={() => handleExecuteWidgetAction(idx, "quote")}
                                >
                                  <span>⚡ Send Quote ({msg.widget.data.value})</span>
                                </button>
                              )}
                            </>
                          )}

                          {msg.widget.type === "supplier" && (
                            <>
                              <div className={styles.widgetHeader}>
                                <span className={styles.widgetTitle}>
                                  <Building2 size={12} />
                                  <span>Nearby Tier-1 Supplier</span>
                                </span>
                                <span className={`${styles.widgetBadge} ${styles.widgetBadgeGreen}`}>
                                  In Stock
                                </span>
                              </div>
                              <div className={styles.widgetRow}>
                                <span>Supplier:</span>
                                <strong>{msg.widget.data.supplier}</strong>
                              </div>
                              <div className={styles.widgetRow}>
                                <span>Rate & Stock:</span>
                                <span>{msg.widget.data.price}</span>
                              </div>

                              {msg.widget.executed ? (
                                <div className={styles.widgetSuccessBanner}>
                                  <CheckCircle2 size={13} />
                                  <span>Cross-docking pickup request dispatched</span>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  className={styles.widgetActionBtn}
                                  onClick={() => handleExecuteWidgetAction(idx, "supplier")}
                                >
                                  <span>⚡ 1-Click Request Stock</span>
                                </button>
                              )}
                            </>
                          )}

                          {msg.widget.type === "payment" && (
                            <>
                              <div className={styles.widgetHeader}>
                                <span className={styles.widgetTitle}>
                                  <Clock size={12} />
                                  <span>Milestone Escrow Status</span>
                                </span>
                                <span className={`${styles.widgetBadge} ${styles.widgetBadgeAmber}`}>
                                  Pending Settlement
                                </span>
                              </div>
                              <div className={styles.widgetRow}>
                                <span>Order & Project:</span>
                                <strong>{msg.widget.data.order}</strong>
                              </div>
                              <div className={styles.widgetRow}>
                                <span>Milestone Amount:</span>
                                <strong style={{ color: "#0f172a" }}>{msg.widget.data.amount}</strong>
                              </div>

                              {msg.widget.executed ? (
                                <div className={styles.widgetSuccessBanner}>
                                  <CheckCircle2 size={13} />
                                  <span>WhatsApp & SMS reminder sent to client</span>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  className={styles.widgetActionBtn}
                                  onClick={() => handleExecuteWidgetAction(idx, "payment")}
                                >
                                  <span>📲 Send WhatsApp Reminder</span>
                                </button>
                              )}
                            </>
                          )}

                          {msg.widget.type === "tracking" && (
                            <>
                              <div className={styles.widgetHeader}>
                                <span className={styles.widgetTitle}>
                                  <Truck size={12} />
                                  <span>Live Vehicle Dispatch</span>
                                </span>
                                <span className={`${styles.widgetBadge} ${styles.widgetBadgeGreen}`}>
                                  On Schedule
                                </span>
                              </div>
                              <div className={styles.widgetRow}>
                                <span>Assigned Driver:</span>
                                <strong>{msg.widget.data.driver}</strong>
                              </div>
                              <div className={styles.widgetRow}>
                                <span>Site Arrival ETA:</span>
                                <strong style={{ color: "#15803d" }}>{msg.widget.data.eta}</strong>
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </React.Fragment>
            ))}

            {isTyping && (
              <div className={styles.odinChatRow}>
                <div className={styles.odinAvatarIcon}>
                  <StudioDuotoneIcon size={15} />
                </div>
                <div className={styles.typingIndicator}>
                  <span className={styles.typingDot} />
                  <span className={styles.typingDot} />
                  <span className={styles.typingDot} />
                </div>
              </div>
            )}

            <div ref={chatBottomRef} />
          </div>

          {/* 3. BOTTOM COMPOSER CARD (Products Page Layout) */}
          <form onSubmit={handleSubmit} className={styles.minimalComposer}>
            <textarea
              className={styles.minimalInput}
              rows={2}
              placeholder="Describe material (e.g. 500 bags of UltraTech at 425)..."
              value={odinInput}
              onChange={(e) => setOdinInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />

            <div className={styles.composerBottomBar}>
              <div className={styles.composerLeftGroup}>
                <button
                  type="button"
                  className={styles.composerPlusBtn}
                  title="Attach file or photo"
                  aria-label="Attach file"
                >
                  <Plus size={14} strokeWidth={2} />
                </button>

                <button
                  type="button"
                  className={styles.composerScopeTag}
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
                  title="Voice dictation"
                  aria-label="Voice dictation"
                >
                  <Mic size={15} />
                </button>

                <button
                  type="submit"
                  className={`${styles.minimalSendBtn} ${
                    odinInput.trim() ? styles.minimalSendBtnActive : ""
                  }`}
                  aria-label="Send query"
                  title="Send query"
                >
                  <SendHorizontal size={14} style={{ marginLeft: "1px" }} />
                </button>
              </div>
            </div>
          </form>
        </div>
      </aside>
    </div>
  );
}
