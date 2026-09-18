"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  Clock,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Package,
  X,
  ChevronLeft,
  ChevronRight,
  Download,
} from "lucide-react";
import type { EnquiryTabKey } from "@/features/enquiries/detail/components/enquiry-detail-tabs";
import styles from "./project-overview-activity-sections.module.css";

interface DeliverableImage {
  src: string;
  alt: string;
  title: string;
}

interface CommentItem {
  id: string;
  text: string;
  timestamp: string;
  author: string;
}

interface ActionDeliverableItem {
  id: string;
  title: string;
  version: string;
  submitter: string;
  role: string;
  submittedTime: string;
  images: DeliverableImage[];
}

const ACTION_DELIVERABLES: ActionDeliverableItem[] = [
  {
    id: "deliv-3d-design",
    title: "3D Design & Interior Concept",
    version: "v2.1",
    submitter: "Priya Sharma",
    role: "Lead Architect",
    submittedTime: "2 days ago",
    images: [
      {
        src: "/assets/nila-thumb2.jpg",
        alt: "Living Room & Double-Height Atrium - 3D Design Preview",
        title: "Living & Atrium View",
      },
      {
        src: "/assets/nila-thumb1.jpg",
        alt: "Kitchen & Dining Concept - 3D Design Preview",
        title: "Kitchen & Dining View",
      },
      {
        src: "/assets/nila-thumb3.jpg",
        alt: "Master Bedroom & Balcony - 3D Design Preview",
        title: "Master Suite View",
      },
    ],
  },
  {
    id: "deliv-marble-spec",
    title: "Italian Marble Flooring & Wall Cladding Specification",
    version: "v1.0",
    submitter: "Arjun Menon",
    role: "Project Manager",
    submittedTime: "3 days ago",
    images: [
      {
        src: "/assets/nila-thumb1.jpg",
        alt: "Italian Marble Flooring & Wall Cladding Specification Preview",
        title: "Flooring & Cladding Spec",
      },
      {
        src: "/assets/nila-thumb2.jpg",
        alt: "Marble Layout Detail",
        title: "Layout Detail",
      },
    ],
  },
  {
    id: "deliv-mep-layout",
    title: "MEP Electrical Point Marking & Conduit Layout",
    version: "v1.2",
    submitter: "Karthik Verma",
    role: "Apex Consultants",
    submittedTime: "4 days ago",
    images: [
      {
        src: "/assets/nila-thumb3.jpg",
        alt: "MEP Electrical Point Marking & Conduit Layout Preview",
        title: "MEP Layout Sheet",
      },
    ],
  },
  {
    id: "deliv-teak-schedule",
    title: "Teak Wood Joinery & Door/Window Schedule",
    version: "v2.0",
    submitter: "Rohan Das",
    role: "Studio Luxe",
    submittedTime: "5 days ago",
    images: [
      {
        src: "/assets/nila-thumb2.jpg",
        alt: "Teak Wood Joinery & Door/Window Schedule Preview",
        title: "Joinery Schedule",
      },
    ],
  },
];

interface ClientTodayActivity {
  id: string;
  title: string;
  status: string;
  badgeType: "inProgress" | "pendingReview" | "pending" | "completed" | "scheduled";
}

const CLIENT_TODAY_ACTIVITIES: ClientTodayActivity[] = [
  {
    id: "cta-site-prep",
    title: "Site preparation",
    status: "Completed",
    badgeType: "completed",
  },
  {
    id: "cta-floor-tiles",
    title: "Floor tile installation",
    status: "In Progress",
    badgeType: "inProgress",
  },
  {
    id: "cta-internal-plastering",
    title: "Internal plastering",
    status: "In Progress",
    badgeType: "inProgress",
  },
  {
    id: "cta-door-frame",
    title: "Door frame installation",
    status: "Scheduled",
    badgeType: "scheduled",
  },
  {
    id: "cta-painting",
    title: "Painting",
    status: "Scheduled",
    badgeType: "scheduled",
  },
];

export interface ProjectOverviewActivitySectionsProps {
  projectId?: string;
  onNavigateTab?: (tab: EnquiryTabKey) => void;
  isClient?: boolean;
}

export function ProjectOverviewActivitySections({
  projectId = "proj-001",
  onNavigateTab,
  isClient: explicitIsClient,
}: ProjectOverviewActivitySectionsProps) {
  const router = useRouter();
  const currentPathname = usePathname();
  const isClient = explicitIsClient !== undefined ? explicitIsClient : Boolean(currentPathname?.startsWith("/client"));
  const basePath = currentPathname || (isClient ? `/client/projects/${projectId}` : `/projects/${projectId}`);

  const [decisions, setDecisions] = useState<Record<string, "approved" | "rejected">>({});
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [activeViewerDeliverableId, setActiveViewerDeliverableId] = useState<string>("deliv-3d-design");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const [deliverableComments, setDeliverableComments] = useState<Record<string, CommentItem[]>>({});
  const [commentInput, setCommentInput] = useState("");
  const [rejectCommentOpenId, setRejectCommentOpenId] = useState<string | null>(null);

  const [isReviewAllExpanded, setIsReviewAllExpanded] = useState(false);

  const activeDeliverable =
    ACTION_DELIVERABLES.find((d) => d.id === activeViewerDeliverableId) || ACTION_DELIVERABLES[0];
  const activeImages = activeDeliverable.images;

  const handleReject = (deliverableId: string) => {
    setDecisions((prev) => ({ ...prev, [deliverableId]: "rejected" }));
    setRejectCommentOpenId(deliverableId);
  };

  const handleApprove = (deliverableId: string) => {
    setDecisions((prev) => ({ ...prev, [deliverableId]: "approved" }));
    if (rejectCommentOpenId === deliverableId) {
      setRejectCommentOpenId(null);
    }
  };

  const handleCancelRejection = (deliverableId: string) => {
    setDecisions((prev) => {
      const updated = { ...prev };
      delete updated[deliverableId];
      return updated;
    });
    if (rejectCommentOpenId === deliverableId) {
      setRejectCommentOpenId(null);
    }
    setCommentInput("");
  };

  const handleAddComment = (deliverableId: string) => {
    const trimmed = commentInput.trim();
    if (!trimmed) return;
    const newComment: CommentItem = {
      id: `c-${Date.now()}`,
      text: trimmed,
      timestamp: "Just now",
      author: "Client",
    };
    setDeliverableComments((prev) => ({
      ...prev,
      [deliverableId]: [...(prev[deliverableId] || []), newComment],
    }));
    setCommentInput("");
    setRejectCommentOpenId(null);
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : prev));
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev < activeImages.length - 1 ? prev + 1 : prev));
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsViewerOpen(false);
      } else if (e.key === "ArrowLeft") {
        setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : prev));
      } else if (e.key === "ArrowRight") {
        setCurrentImageIndex((prev) => (prev < activeImages.length - 1 ? prev + 1 : prev));
      }
    };
    if (isViewerOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isViewerOpen, activeImages.length]);

  const handleTabClick = (tab: EnquiryTabKey) => (e: React.MouseEvent) => {
    if (onNavigateTab) {
      e.preventDefault();
      onNavigateTab(tab);
      const params = new URLSearchParams(window.location.search);
      params.set("tab", tab);
      router.push(`${basePath}?${params.toString()}`, { scroll: false });
    }
  };
  return (
    <div className={styles.container} aria-label="Project Activity Command Center">
      {/* ── 1. PROJECT PROGRESS ─────────────────────────────────── */}
      <section className={styles.card} aria-label="Project Progress">
        <h3 className={styles.sectionTitle}>
          <span>PROJECT PROGRESS</span>
          <span className={styles.sectionBadge}>Interior Design Phase</span>
        </h3>

        <div className={styles.progressTopRow}>
          <span className={styles.progressLabel}>Overall Progress</span>
          <span className={styles.progressPercent}>42%</span>
        </div>

        <div className={styles.progressBarTrack} role="progressbar" aria-valuenow={42} aria-valuemin={0} aria-valuemax={100}>
          <div
            className={`${styles.progressBarFill} ${isClient ? styles.progressBarFillClient : ""}`}
            style={{ width: "42%" }}
          />
        </div>

        <div className={styles.phaseStepper}>
          <div className={styles.stepperItem}>
            <span className={styles.stepperName}>Planning</span>
            <span className={styles.stepperBadgeCompleted}>
              ✓ Completed
            </span>
          </div>

          <div className={styles.stepperItem}>
            <span className={styles.stepperName}>Design</span>
            <span className={styles.stepperBadgeInProgress}>
              ● In Progress
            </span>
          </div>

          <div className={styles.stepperItem}>
            <span className={styles.stepperName}>Execution</span>
            <span className={styles.stepperBadgeUpcoming}>
              ○ Upcoming
            </span>
          </div>

          <div className={styles.stepperItem}>
            <span className={styles.stepperName}>Handover</span>
            <span className={styles.stepperBadgeUpcoming}>
              ○ Upcoming
            </span>
          </div>
        </div>

        <div className={styles.progressMetaStrip}>
          <div className={styles.progressMetaItem}>
            <span>Current Phase:</span>
            <strong>Interior Design</strong>
          </div>
          <div className={styles.progressMetaItem}>
            <span>Next Milestone:</span>
            <strong>MEP Coordination</strong>
          </div>
          <div className={styles.dueChip}>
            <Clock size={12} />
            <span>Due in 4 days</span>
          </div>
        </div>
      </section>

      {/* ── 2. TODAY'S ACTIVITY + PENDING REVIEW ───────────────── */}
      <div className={styles.twoColGrid}>
        {/* Left: TODAY'S ACTIVITY */}
        <section className={styles.card} aria-label="Today's Activity">
          <h3 className={styles.sectionTitle}>
            <span>TODAY&apos;S ACTIVITY</span>
          </h3>

          {isClient ? (
            <>
              <div className={styles.statsRow}>
                <div className={styles.statBox}>
                  <span className={styles.statBoxNum}>05</span>
                  <span className={styles.statBoxLabel}>Total Planned</span>
                </div>
                <div className={styles.statBox}>
                  <span className={`${styles.statBoxNum} ${styles.statBoxNumCompleted}`}>02</span>
                  <span className={styles.statBoxLabel}>In Progress</span>
                </div>
                <div className={styles.statBox}>
                  <span className={styles.statBoxNum}>01</span>
                  <span className={styles.statBoxLabel}>Completed</span>
                </div>
                <div className={styles.statBox}>
                  <span className={styles.statBoxNum}>02</span>
                  <span className={styles.statBoxLabel}>Scheduled</span>
                </div>
              </div>

              <div className={styles.taskList}>
                {CLIENT_TODAY_ACTIVITIES.map((act) => {
                  let badgeClass = styles.stepperBadgeUpcoming;
                  if (act.badgeType === "inProgress") badgeClass = styles.stepperBadgeInProgress;
                  if (act.badgeType === "pendingReview") badgeClass = styles.dueChip;
                  if (act.badgeType === "completed") badgeClass = styles.stepperBadgeCompleted;

                  return (
                    <Link
                      key={act.id}
                      href={projectId ? `/client/projects/${projectId}/tasks` : "/tasks"}
                      className={styles.taskItem}
                    >
                      <span className={styles.taskItemName}>{act.title}</span>
                      <span className={badgeClass}>{act.status}</span>
                    </Link>
                  );
                })}
              </div>

              <Link
                href={projectId ? `/client/projects/${projectId}/tasks` : "/tasks"}
                className={styles.footerLink}
              >
                <span>View all tasks</span>
                <ArrowRight size={13} />
              </Link>
            </>
          ) : (
            <>
              <div className={styles.statsRow}>
                <div className={styles.statBox}>
                  <span className={styles.statBoxNum}>08</span>
                  <span className={styles.statBoxLabel}>Active Tasks</span>
                </div>
                <div className={styles.statBox}>
                  <span className={`${styles.statBoxNum} ${styles.statBoxNumCompleted}`}>05</span>
                  <span className={styles.statBoxLabel}>Completed</span>
                </div>
                <div className={styles.statBox}>
                  <span className={styles.statBoxNum}>03</span>
                  <span className={styles.statBoxLabel}>Pending</span>
                </div>
                <div className={styles.statBox}>
                  <span className={`${styles.statBoxNum} ${styles.statBoxNumOverdue}`}>01</span>
                  <span className={styles.statBoxLabel}>Overdue</span>
                </div>
              </div>

              <div className={styles.taskList}>
                <Link href={projectId ? `/projects/${projectId}/tasks` : "/tasks"} className={styles.taskItem}>
                  <span className={styles.taskItemName}>MEP layout review</span>
                  <span className={styles.stepperBadgeInProgress}>In Progress</span>
                </Link>
                <Link href={projectId ? `/projects/${projectId}/tasks` : "/tasks"} className={styles.taskItem}>
                  <span className={styles.taskItemName}>Living room elevation</span>
                  <span className={styles.dueChip}>Pending Review</span>
                </Link>
                <Link href={projectId ? `/projects/${projectId}/tasks` : "/tasks"} className={styles.taskItem}>
                  <span className={styles.taskItemName}>Electrical point marking</span>
                  <span className={styles.stepperBadgeUpcoming}>Pending</span>
                </Link>
                <Link href={projectId ? `/projects/${projectId}/tasks` : "/tasks"} className={styles.taskItem}>
                  <span className={styles.taskItemName}>Marble specification approval</span>
                  <span className={styles.stepperBadgeCompleted}>Completed</span>
                </Link>
              </div>

              <Link href={projectId ? `/projects/${projectId}/tasks` : "/tasks"} className={styles.footerLink}>
                <span>View all tasks</span>
                <ArrowRight size={13} />
              </Link>
            </>
          )}
        </section>

        {/* Right: ACTION NEEDED (Client) / PENDING REVIEW & REQUESTS (Provider) */}
        <section className={styles.card} aria-label={isClient ? "Action Needed" : "Pending Review & Requests"}>
          <h3 className={styles.sectionTitle}>
            <span>{isClient ? "ACTION NEEDED" : "PENDING REVIEW & REQUESTS"}</span>
          </h3>

          <div className={styles.alertBanner}>
            <AlertCircle size={15} style={{ flexShrink: 0 }} />
            <span>
              {isClient
                ? `${ACTION_DELIVERABLES.length} items require your attention`
                : "3 items require your attention"}
            </span>
          </div>

          {/* Client View: Deliverable items list with Approve, Reject, and View buttons */}
          {isClient && (
            <div
              className={isReviewAllExpanded ? styles.deliverablesScrollContainer : styles.deliverablesStaticContainer}
            >
              {(isReviewAllExpanded ? ACTION_DELIVERABLES : ACTION_DELIVERABLES.slice(0, 2)).map((item) => {
                const itemDecision = decisions[item.id] || null;
                const isRejectOpen = rejectCommentOpenId === item.id;
                const itemComments = deliverableComments[item.id] || [];

                return (
                  <div
                    key={item.id}
                    className={styles.clientDeliverableCard}
                    onClick={() => {
                      setActiveViewerDeliverableId(item.id);
                      setCurrentImageIndex(0);
                      setIsViewerOpen(true);
                    }}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setActiveViewerDeliverableId(item.id);
                        setCurrentImageIndex(0);
                        setIsViewerOpen(true);
                      }
                    }}
                    aria-label={`${item.title} ${item.version}`}
                  >
                    <div className={styles.clientDeliverableMainRow}>
                      <div className={styles.clientDeliverableContent}>
                        <div className={styles.actionItemTitleRow}>
                          <span className={styles.actionItemTitle}>{item.title}</span>
                          <span className={styles.actionItemVersion}>{item.version}</span>
                        </div>
                        <span className={styles.actionItemMeta}>
                          Submitted by {item.submitter} ({item.role}) · {item.submittedTime}
                        </span>
                      </div>

                      <div className={styles.clientActionButtonsRow}>
                        {itemDecision === "approved" && (
                          <span className={styles.approvedStatusBadge} title="Approved">
                            <CheckCircle2 size={14} />
                            <span>Approved</span>
                          </span>
                        )}
                        {itemDecision === "rejected" && (
                          <span className={styles.rejectedStatusBadge} title="Rejected">
                            <XCircle size={14} />
                            <span>Rejected</span>
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveViewerDeliverableId(item.id);
                            setCurrentImageIndex(0);
                            setIsViewerOpen(true);
                          }}
                          className={styles.deliverableArrowBtn}
                          aria-label={`View ${item.title}`}
                          title="View"
                        >
                          <ChevronRight size={18} strokeWidth={2.2} />
                        </button>
                      </div>
                    </div>

                    {isRejectOpen && (
                      <div className={styles.commentBox}>
                        <textarea
                          value={commentInput}
                          onChange={(e) => setCommentInput(e.target.value)}
                          placeholder={`Please provide reason or feedback for rejection for ${item.submitter} (${item.role})...`}
                          className={styles.commentTextarea}
                          aria-label={`Rejection feedback comment for ${item.title}`}
                        />
                        <div className={styles.commentActionsRow}>
                          <button
                            type="button"
                            onClick={() => handleCancelRejection(item.id)}
                            className={styles.commentCancelBtn}
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAddComment(item.id)}
                            disabled={!commentInput.trim()}
                            className={styles.commentSubmitBtn}
                          >
                            Submit Feedback
                          </button>
                        </div>
                      </div>
                    )}

                    {itemComments.length > 0 && (
                      <div className={styles.commentsList}>
                        {itemComments.map((c) => (
                          <div key={c.id} className={styles.commentItem}>
                            <div className={styles.commentItemHeader}>
                              <span className={styles.commentAuthor}>{c.author}</span>
                              <span className={styles.commentTime}>{c.timestamp}</span>
                            </div>
                            <p className={styles.commentText}>{c.text}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {!isClient && (
            <div className={styles.reviewList}>
              <div className={styles.reviewItem}>
                <span className={styles.reviewItemLabel}>Task Reviews</span>
                <span className={styles.reviewItemCount}>02</span>
              </div>
              <div className={styles.reviewItem}>
                <span className={styles.reviewItemLabel}>Client Requests</span>
                <span className={styles.reviewItemCount}>01</span>
              </div>
              <div className={styles.reviewItem}>
                <span className={styles.reviewItemLabel}>Approval Requests</span>
                <span className={styles.reviewItemCount}>02</span>
              </div>
              <div className={styles.reviewItem}>
                <span className={styles.reviewItemLabel}>BOQ / Quote Requests</span>
                <span className={styles.reviewItemCount}>01</span>
              </div>
            </div>
          )}

          {isClient ? (
            ACTION_DELIVERABLES.length > 2 ? (
              <button
                type="button"
                onClick={() => setIsReviewAllExpanded((prev) => !prev)}
                className={styles.footerLinkBtn}
                aria-label={isReviewAllExpanded ? "Show fewer items" : "Review all"}
              >
                <span>{isReviewAllExpanded ? "Show less" : "Review all"}</span>
                <ArrowRight
                  size={13}
                  style={{
                    transform: isReviewAllExpanded ? "rotate(-90deg)" : "none",
                    transition: "transform 0.2s ease",
                  }}
                />
              </button>
            ) : null
          ) : (
            <Link
              href={`/projects/${projectId}/approvals`}
              className={styles.footerLink}
            >
              <span>Review all</span>
              <ArrowRight size={13} />
            </Link>
          )}
        </section>
      </div>

      {/* ── 3. PROJECT TIMELINE ─────────────────────────────────── */}
      <section className={styles.card} aria-label="Project Timeline">
        <h3 className={styles.sectionTitle}>
          <span>PROJECT TIMELINE</span>
          <span className={styles.sectionBadge}>6 Milestones</span>
        </h3>

        <div className={styles.timelineTrackHorizontal}>
          <div className={styles.timelineCardNode}>
            <div className={styles.timelineNodeTitleRow}>
              <span style={{ color: "#16a34a" }}>✓</span>
              <span>Project Brief</span>
            </div>
            <span className={styles.timelineNodeMeta}>Completed · 12 May</span>
          </div>

          <div className={styles.timelineCardNode}>
            <div className={styles.timelineNodeTitleRow}>
              <span style={{ color: "#16a34a" }}>✓</span>
              <span>Site Assessment</span>
            </div>
            <span className={styles.timelineNodeMeta}>Completed · 18 May</span>
          </div>

          <div className={styles.timelineCardNode}>
            <div className={styles.timelineNodeTitleRow}>
              <span style={{ color: "#16a34a" }}>✓</span>
              <span>Concept Design</span>
            </div>
            <span className={styles.timelineNodeMeta}>Completed · 28 May</span>
          </div>

          <div className={`${styles.timelineCardNode} ${styles.timelineCardNodeActive}`}>
            <div className={styles.timelineNodeTitleRow}>
              <span style={{ color: "#7c3aed" }}>●</span>
              <span>Interior Design</span>
            </div>
            <span className={styles.timelineNodeMeta}>In Progress · 65%</span>
          </div>

          <div className={styles.timelineCardNode}>
            <div className={styles.timelineNodeTitleRow}>
              <span style={{ color: "#94a3b8" }}>○</span>
              <span>MEP Coordination</span>
            </div>
            <span className={styles.timelineNodeMeta}>Upcoming · 04 Sep</span>
          </div>

          <div className={styles.timelineCardNode}>
            <div className={styles.timelineNodeTitleRow}>
              <span style={{ color: "#94a3b8" }}>○</span>
              <span>Execution</span>
            </div>
            <span className={styles.timelineNodeMeta}>Upcoming · 20 Sep</span>
          </div>
        </div>

        <Link href={`/projects/${projectId}/timeline`} className={styles.footerLink}>
          <span>View Full Timeline</span>
          <ArrowRight size={13} />
        </Link>
      </section>

      {/* ── 4. HANDS / LABOUR + ACTIVE TEAM ─────────────────────── */}
      <div className={styles.twoColGrid}>
        {/* Left: HANDS */}
        <section className={styles.card} aria-label="Hands Project Labour">
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "4px" }}>
            <h3 className={styles.sectionTitle} style={{ margin: 0 }}>
              <span>HANDS</span>
            </h3>
            <span className={styles.sectionBadge}>
              {isClient ? "18 Active Today" : "₹16,850 Today's Spend"}
            </span>
          </div>

          <div className={styles.statsRow} style={{ marginTop: "10px" }}>
            <div className={styles.statBox}>
              <span className={styles.statBoxNum}>24</span>
              <span className={styles.statBoxLabel}>Total Labour</span>
            </div>
            <div className={styles.statBox}>
              <span className={`${styles.statBoxNum} ${styles.statBoxNumCompleted}`}>18</span>
              <span className={styles.statBoxLabel}>Active Today</span>
            </div>
            <div className={styles.statBox}>
              <span className={styles.statBoxNum}>04</span>
              <span className={styles.statBoxLabel}>On Leave</span>
            </div>
            <div className={styles.statBox}>
              <span className={`${styles.statBoxNum} ${styles.statBoxNumOverdue}`}>02</span>
              <span className={styles.statBoxLabel}>Not Assigned</span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: "6px" }}>
            <span>ACTIVE TODAY (18 WORKERS)</span>
            {!isClient && (
              <span style={{ color: "#15803d", fontWeight: 700 }}>₹16,850 / DAY</span>
            )}
          </div>

          <div className={styles.labourTradesGrid}>
            <div className={styles.tradePill}>
              <span>Mason{!isClient ? " (06)" : ""}</span>
              <strong>{isClient ? "06" : "₹5,400"}</strong>
            </div>
            <div className={styles.tradePill}>
              <span>Carpenter{!isClient ? " (04)" : ""}</span>
              <strong>{isClient ? "04" : "₹3,600"}</strong>
            </div>
            <div className={styles.tradePill}>
              <span>Electrician{!isClient ? " (03)" : ""}</span>
              <strong>{isClient ? "03" : "₹2,700"}</strong>
            </div>
            <div className={styles.tradePill}>
              <span>Plumber{!isClient ? " (02)" : ""}</span>
              <strong>{isClient ? "02" : "₹1,800"}</strong>
            </div>
            <div className={styles.tradePill}>
              <span>Painter{!isClient ? " (03)" : ""}</span>
              <strong>{isClient ? "03" : "₹2,400"}</strong>
            </div>
            <div className={styles.tradePill}>
              <span>Other{!isClient ? " (03)" : ""}</span>
              <strong>{isClient ? "03" : "₹2,100"}</strong>
            </div>
          </div>

          <div className={styles.labourStatusBar}>
            <span>18 / 24 active today (75% on-site)</span>
            {isClient ? (
              <span style={{ fontWeight: 600 }}>Verified &amp; deployed</span>
            ) : (
              <span style={{ fontWeight: 700, color: "#15803d" }}>Today&apos;s Labour Spend: ₹16,850</span>
            )}
          </div>

          <Link
            href={`${basePath}?tab=hands`}
            onClick={handleTabClick("hands")}
            className={styles.footerLink}
          >
            <span>View Hands</span>
            <ArrowRight size={13} />
          </Link>
        </section>

        {/* Right: ACTIVE PROJECT TEAM */}
        <section className={styles.card} aria-label="Active Project Team">
          <h3 className={styles.sectionTitle}>
            <span>ACTIVE PROJECT TEAM</span>
            <span className={styles.sectionBadge}>02 Members</span>
          </h3>

          <div className={styles.teamList}>
            <div className={styles.teamMemberRow}>
              <div className={styles.teamMemberLeft}>
                <img
                  src="/assets/arjun-avatar.jpg"
                  alt="Arjun Menon"
                  className={styles.teamMemberAvatar}
                />
                <div>
                  <span className={styles.teamMemberName}>Arjun Menon</span>
                  <span className={styles.teamMemberRole}>Project Manager</span>
                </div>
              </div>
              <span className={styles.activeDotBadge}>Active</span>
            </div>

            <div className={styles.teamMemberRow}>
              <div className={styles.teamMemberLeft}>
                <img
                  src="/assets/priya-avatar.jpg"
                  alt="Priya Sharma"
                  className={styles.teamMemberAvatar}
                />
                <div>
                  <span className={styles.teamMemberName}>Priya Sharma</span>
                  <span className={styles.teamMemberRole}>Lead Architect</span>
                </div>
              </div>
              <span className={styles.activeDotBadge}>Active</span>
            </div>
          </div>

          <Link
            href={`${basePath}?tab=team`}
            onClick={handleTabClick("team")}
            className={styles.footerLink}
          >
            <span>View Team</span>
            <ArrowRight size={13} />
          </Link>
        </section>
      </div>

      {/* ── 5. HUB + HIVE PRODUCTS ──────────────────────────────── */}
      <div className={styles.twoColGrid}>
        {/* Left: PROJECT MATERIALS */}
        <section className={styles.card} aria-label="Project Materials">
          <h3 className={styles.sectionTitle}>
            <span>PROJECT MATERIALS</span>
            <span className={styles.sectionBadge}>BOQ Linked</span>
          </h3>

          <div className={styles.materialStatsGrid}>
            <div className={styles.materialStatCard}>
              <span className={styles.materialStatNum} style={{ color: "#16a34a" }}>
                {isClient ? "04" : "₹5.6L"}
              </span>
              <span className={styles.materialStatLabel}>
                {isClient ? "Total Materials" : "Total Spent"}
              </span>
            </div>
            <div className={styles.materialStatCard}>
              <span className={styles.materialStatNum} style={{ color: "#7c3aed" }}>
                {isClient ? "02" : "₹2.8L"}
              </span>
              <span className={styles.materialStatLabel}>
                {isClient ? "Available on Site" : "Available Value"}
              </span>
            </div>
            <div className={styles.materialStatCard}>
              <span className={styles.materialStatNum} style={{ color: "#d97706" }}>
                {isClient ? "02" : "₹3.6L"}
              </span>
              <span className={styles.materialStatLabel}>
                {isClient ? "Pending Procurement" : "BOQ Required"}
              </span>
            </div>
          </div>

          <div className={styles.materialItemsList}>
            <div className={styles.materialItemCard}>
              <div className={styles.materialItemLeft}>
                <span className={styles.materialItemTitle}>Italian Marble Flooring</span>
                <span className={styles.materialItemSub}>
                  {isClient ? (
                    <>Quantity: <strong>850 sq ft</strong> · Status: <strong>In Stock</strong></>
                  ) : (
                    <>Spent: <strong>₹2.40L</strong> (850 sq ft) · Stock: <strong>₹95K</strong></>
                  )}
                </span>
              </div>
              <span className={`${styles.materialStatusTag} ${styles.materialTagUsed}`}>
                {isClient ? "In Stock" : "₹3.35L (BOQ)"}
              </span>
            </div>

            <div className={styles.materialItemCard}>
              <div className={styles.materialItemLeft}>
                <span className={styles.materialItemTitle}>Structural Cement (53 Grade)</span>
                <span className={styles.materialItemSub}>
                  {isClient ? (
                    <>Quantity: <strong>120 Bags</strong> · Status: <strong>In Stock</strong></>
                  ) : (
                    <>Spent: <strong>₹85K</strong> (120 Bags) · Stock: <strong>₹42K</strong></>
                  )}
                </span>
              </div>
              <span className={`${styles.materialStatusTag} ${styles.materialTagUsed}`}>
                {isClient ? "In Stock" : "₹1.27L (BOQ)"}
              </span>
            </div>

            <div className={styles.materialItemCard}>
              <div className={styles.materialItemLeft}>
                <span className={styles.materialItemTitle}>Teak Wood Framing &amp; Joinery</span>
                <span className={styles.materialItemSub}>
                  {isClient ? (
                    <>Quantity: <strong>08 Units</strong> · Status: <strong>Pending</strong></>
                  ) : (
                    <>Spent: <strong>₹1.45L</strong> (08 Units) · Stock: <strong>₹75K</strong></>
                  )}
                </span>
              </div>
              <span className={`${styles.materialStatusTag} ${styles.materialTagRequired}`}>
                {isClient ? "Pending" : "₹1.20L Pending"}
              </span>
            </div>

            <div className={styles.materialItemCard}>
              <div className={styles.materialItemLeft}>
                <span className={styles.materialItemTitle}>Conduit &amp; Electrical Wiring</span>
                <span className={styles.materialItemSub}>
                  {isClient ? (
                    <>Quantity: <strong>15 Sets</strong> · Status: <strong>Pending</strong></>
                  ) : (
                    <>Spent: <strong>₹90K</strong> (15 Sets) · Stock: <strong>₹68K</strong></>
                  )}
                </span>
              </div>
              <span className={`${styles.materialStatusTag} ${styles.materialTagRequired}`}>
                {isClient ? "Pending" : "₹1.18L Pending"}
              </span>
            </div>
          </div>

          <div className={styles.materialBannerNote}>
            <Package size={14} style={{ color: "#7c3aed", flexShrink: 0 }} />
            <span>
              {isClient
                ? "2 of 4 materials delivered on-site · 2 pending procurement in BOQ"
                : "₹5.6L spent of ₹12.0L allocated · ₹3.6L pending procurement in BOQ"}
            </span>
          </div>

          <Link href={`/projects/${projectId}/boq`} className={styles.footerLink}>
            <span>View BOQ Materials</span>
            <ArrowRight size={13} />
          </Link>
        </section>

        {/* Right: HIVE STUDIO */}
        <section className={styles.card} aria-label="Hive Studio">
          <h3 className={styles.sectionTitle}>
            <span>HIVE STUDIO</span>
            <span className={styles.sectionBadge}>
              {isClient ? "03 Workspaces Used" : "04 Workspaces Used"}
            </span>
          </h3>

          <div className={styles.servicesList}>
            <div className={styles.serviceRow}>
              <div className={styles.serviceInfoCol}>
                <span className={styles.serviceName}>AI Requirement Brief &amp; Spatial Synthesis</span>
                <span className={styles.serviceUpdateNote}>
                  Output: <strong>ODIN Brief &amp; 10 Domain Specs Synced</strong>
                </span>
              </div>
              <span className={styles.stepperBadgeCompleted}>Completed</span>
            </div>

            <div className={styles.serviceRow}>
              <div className={styles.serviceInfoCol}>
                <span className={styles.serviceName}>Concept Scheme &amp; Palette Studio</span>
                <span className={styles.serviceUpdateNote}>
                  Output: <strong>8 Design Themes &amp; Moodboard Generated</strong>
                </span>
              </div>
              <span className={styles.stepperBadgeCompleted}>Delivered</span>
            </div>

            {!isClient && (
              <div className={styles.serviceRow}>
                <div className={styles.serviceInfoCol}>
                  <span className={styles.serviceName}>Automated Proposal &amp; Scope Generator</span>
                  <span className={styles.serviceUpdateNote}>
                    Output: <strong>Commercial Proposal v1.0 Dispatched</strong>
                  </span>
                </div>
                <span className={styles.stepperBadgeInProgress}>Sent to Client</span>
              </div>
            )}

            <div className={styles.serviceRow}>
              <div className={styles.serviceInfoCol}>
                <span className={styles.serviceName}>CAD Spec &amp; Feasibility Verifier</span>
                <span className={styles.serviceUpdateNote}>
                  Output: <strong>4 Architectural Sheets Checked (0 Conflicts)</strong>
                </span>
              </div>
              <span className={styles.stepperBadgeCompleted}>Verified</span>
            </div>
          </div>

          {!isClient && (
            <div className={styles.serviceValueBanner}>
              <span>4 Hive Studio Tasks Active</span>
              <span style={{ fontWeight: 700 }}>Outputs Synced to Project</span>
            </div>
          )}

          <Link href="/studio" className={styles.footerLink}>
            <span>Open Hive Studio</span>
            <ArrowRight size={13} />
          </Link>
        </section>
      </div>

      {/* ── Deliverable Overlay / Modal ───────────────────────── */}
      {isClient && isViewerOpen && (
        <div
          className={styles.modalBackdrop}
          onClick={() => setIsViewerOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="deliverable-modal-title"
        >
          <div
            className={styles.modalDialog}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <div className={styles.modalTitleGroup}>
                <div className={styles.actionItemTitleRow}>
                  <h3 id="deliverable-modal-title" className={styles.actionItemTitle} style={{ fontSize: "16px", margin: 0 }}>
                    {activeDeliverable.title}
                  </h3>
                  <span className={styles.actionItemVersion}>{activeDeliverable.version}</span>
                </div>
                <span className={styles.actionItemMeta}>
                  Submitted by {activeDeliverable.submitter} ({activeDeliverable.role}) · {activeDeliverable.submittedTime}
                </span>
              </div>

              <div className={styles.modalHeaderActions}>
                <a
                  href={activeImages[currentImageIndex]?.src}
                  download={`${activeDeliverable.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-view-${currentImageIndex + 1}.jpg`}
                  className={styles.modalDownloadBtn}
                  aria-label="Download image"
                  title="Download image"
                >
                  <Download size={14} />
                  <span>Download</span>
                </a>
                <button
                  type="button"
                  onClick={() => setIsViewerOpen(false)}
                  className={styles.modalCloseBtn}
                  aria-label="Close preview"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.modalImageContainer}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={activeImages[currentImageIndex]?.src}
                  alt={activeImages[currentImageIndex]?.alt}
                  className={styles.modalImage}
                />

                {activeImages.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={handlePrevImage}
                      disabled={currentImageIndex === 0}
                      className={`${styles.imageNavBtn} ${styles.imageNavPrev}`}
                      aria-label="Previous image"
                    >
                      <ChevronLeft size={22} strokeWidth={2.4} />
                    </button>

                    <button
                      type="button"
                      onClick={handleNextImage}
                      disabled={currentImageIndex === activeImages.length - 1}
                      className={`${styles.imageNavBtn} ${styles.imageNavNext}`}
                      aria-label="Next image"
                    >
                      <ChevronRight size={22} strokeWidth={2.4} />
                    </button>

                    <div className={styles.imagePagingBadge}>
                      <span>{currentImageIndex + 1} / {activeImages.length}</span>
                    </div>
                  </>
                )}
              </div>

              {rejectCommentOpenId === activeDeliverable.id && (
                <div className={styles.commentBox}>
                  <textarea
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                    placeholder={`Please provide reason or feedback for rejection for ${activeDeliverable.submitter} (${activeDeliverable.role})...`}
                    className={styles.commentTextarea}
                    aria-label="Rejection feedback comment in preview"
                  />
                  <div className={styles.commentActionsRow}>
                    <button
                      type="button"
                      onClick={() => handleCancelRejection(activeDeliverable.id)}
                      className={styles.commentCancelBtn}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddComment(activeDeliverable.id)}
                      disabled={!commentInput.trim()}
                      className={styles.commentSubmitBtn}
                    >
                      Submit Feedback
                    </button>
                  </div>
                </div>
              )}

              {(deliverableComments[activeDeliverable.id] || []).length > 0 && (
                <div className={styles.modalCommentsSection}>
                  <h4 className={styles.modalCommentsTitle}>
                    Rejection Feedback ({(deliverableComments[activeDeliverable.id] || []).length})
                  </h4>
                  <div className={styles.commentsList}>
                    {(deliverableComments[activeDeliverable.id] || []).map((c) => (
                      <div key={c.id} className={styles.commentItem}>
                        <div className={styles.commentItemHeader}>
                          <span className={styles.commentAuthor}>{c.author}</span>
                          <span className={styles.commentTime}>{c.timestamp}</span>
                        </div>
                        <p className={styles.commentText}>{c.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className={styles.modalFooter}>
              <div className={styles.modalFooterActions}>
                {decisions[activeDeliverable.id] === "approved" ? (
                  <span className={styles.approvedStatusBadge}>
                    <CheckCircle2 size={13} />
                    <span>Approved</span>
                  </span>
                ) : decisions[activeDeliverable.id] === "rejected" ? (
                  <span className={styles.rejectedStatusBadge}>
                    <XCircle size={13} />
                    <span>Rejected</span>
                  </span>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => handleApprove(activeDeliverable.id)}
                      className={styles.modalApproveBtn}
                      aria-label="Approve deliverable"
                    >
                      <CheckCircle2 size={13} />
                      <span>Approve</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleReject(activeDeliverable.id)}
                      className={styles.modalRejectBtn}
                      aria-label="Reject deliverable"
                    >
                      <XCircle size={13} />
                      <span>Reject</span>
                    </button>
                  </>
                )}
              </div>

              <span className={styles.imageCounter}>
                View {currentImageIndex + 1} of {activeImages.length} · {activeImages[currentImageIndex]?.title}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
