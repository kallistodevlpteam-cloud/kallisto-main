"use client";

import React, {
  useRef,
  useState,
  useEffect,
  type RefObject,
  type CSSProperties,
} from "react";
import { useRouter } from "next/navigation";
import { Briefcase, Building2, CheckCircle2, Clock, FileText, FolderOpen, HelpCircle, IndianRupee, Layers, Pencil, XCircle, MapPin, Tag, User2 } from "lucide-react";
import { EnquiryOverviewCard } from "./enquiry-overview-card";
import { useProjectDashboardLayout } from "@/features/documents/hooks/use-project-dashboard-layout";
import { RoutePageContainer } from "@/components/ui/route-page-container";
import { useDrawerBehaviour } from "@/features/hands/components/use-drawer-behaviour";
import { PROJECT_UPDATES_GAP } from "@/lib/layout/project-dashboard-responsive-contract";
import { RequirementStrengthCard } from "./requirement-strength-card";
import { EnquiryClarificationComposer } from "./enquiry-clarification-composer";
import { EnquirySiteImagesCard } from "./enquiry-site-images-card";
import { EnquiryProjectDocumentsSection } from "./enquiry-project-documents-section";
import { buildEnquiriesFromProjects } from "../../utils/enquiries-from-backend-projects";
import { PROJECT_TYPE_LABELS } from "../../types/enquiry.types";
import type { EnquiryRecord } from "../../types/enquiry.types";
import styles from "./enquiry-detail-workspace.module.css";



// ─── Types ────────────────────────────────────────────────────────────────────

/** Fallback record so the detail page always renders a complete UI. */
function createDefaultEnquiry(enquiryId: string): EnquiryRecord {
  return {
    id: enquiryId,
    title: "Your Project Enquiry",
    requirementSummary: "Project details will appear here once provided.",
    clientName: "—",
    location: "—",
    thumbnailUrl: "/assets/projects/greenfield-villa.png",
    source: "website",
    status: "active",
    stage: "new",
    projectType: "residential",
    budgetMin: 0,
    budgetMax: 0,
    receivedAt: new Date().toISOString(),
    nextAction: { type: "review_enquiry", label: "Review enquiry" },
  };
}

export type EnquiryStage = "idle" | "accepted" | "clarification" | "rejected";

// Full stage progression used for the meta bar track
const STAGE_TRACK = [
  { id: "new",          label: "New"           },
  { id: "clarification",label: "Clarification" },
  { id: "consultation", label: "Consultation"  },
  { id: "qualified",    label: "Qualified"      },
  { id: "proposal",     label: "Proposal Sent" },
  { id: "won",          label: "Won"            },
] as const;

type StageTrackId = typeof STAGE_TRACK[number]["id"];

const STAGE_ORDER: StageTrackId[] = STAGE_TRACK.map(s => s.id);


// ─── Focus manager ────────────────────────────────────────────────────────────

interface UpdatesDrawerFocusManagerProps {
  panelRef: RefObject<HTMLElement | null>;
  onClose: () => void;
}

function UpdatesDrawerFocusManager({
  panelRef,
  onClose,
}: UpdatesDrawerFocusManagerProps) {
  useDrawerBehaviour(panelRef, onClose);
  return null;
}

// ─── Status pill ──────────────────────────────────────────────────────────────

const STAGE_PILL: Record<EnquiryStage, { label: string; css: string } | null> = {
  idle:          null,
  accepted:      { label: "Accepted",               css: styles.pillAccepted      },
  clarification: { label: "Clarification Requested", css: styles.pillClarification },
  rejected:      { label: "Rejected",                css: styles.pillRejected      },
};

function EnquiryStatusPill({ stage }: { stage: EnquiryStage }) {
  const pill = STAGE_PILL[stage];
  if (!pill) return null;
  return (
    <span className={`${styles.statusPill} ${pill.css}`} aria-live="polite">
      {pill.label}
    </span>
  );
}

// ─── Actions card ─────────────────────────────────────────────────────────────

/** Returns a human-readable elapsed time from a past ISO string to now. */
function formatRelativeTime(isoString: string | undefined): string {
  if (!isoString) return "—";
  const delta = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(delta / 60_000);
  if (mins < 1)  return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

/** Returns a human-readable time delta from now to a future ISO string. */
function formatDeadline(isoString: string | undefined): string {
  if (!isoString) return "—";
  const delta = new Date(isoString).getTime() - Date.now();
  if (delta <= 0) return "Overdue";
  const totalMinutes = Math.floor(delta / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const mins  = totalMinutes % 60;
  if (hours === 0) return `${mins}m`;
  return `${hours}h ${mins}m`;
}





/**
 * Stage model (state is owned by the parent workspace):
 *  idle          → decision row  (Reject / Request Clarification / Accept)
 *  accepted      → status badge + next-workflow actions
 *  clarification → status badge + Undo only
 *  rejected      → status badge + Undo only
 */
export type ProposalStatus =
  | "none"
  | "draft"
  | "sent"
  | "viewed"
  | "accepted"
  | "rejected"
  | "revision_requested";

export interface EnquiryActionsCardProps {
  stage: EnquiryStage;
  onStageChange: (stage: EnquiryStage) => void;
  enquiry?: EnquiryRecord;
  initialProposalStatus?: ProposalStatus;
}

export function EnquiryActionsCard({
  stage,
  onStageChange,
  enquiry,
  initialProposalStatus = "none",
}: EnquiryActionsCardProps) {
  const [sentMessage, setSentMessage] = useState<string | null>(null);
  const [sentTime, setSentTime] = useState<string | null>(null);
  const [showAcceptConfirm, setShowAcceptConfirm] = useState(false);
  const [proposalStatus, setProposalStatus] = useState<ProposalStatus>(
    (enquiry as Record<string, unknown> | undefined)?.proposalStatus as ProposalStatus || initialProposalStatus
  );

  useEffect(() => {
    setProposalStatus((enquiry as Record<string, unknown> | undefined)?.proposalStatus as ProposalStatus || initialProposalStatus);
  }, [initialProposalStatus, enquiry]);
  const confirmDialogRef = useRef<HTMLDivElement>(null);
  const confirmBtnRef = useRef<HTMLButtonElement>(null);

  const router = useRouter();

  // Accept action: persists on the backend first (project character
  // enq -> pr); the UI stage only advances after the backend confirms.
  const [acceptSubmitting, setAcceptSubmitting] = useState(false);
  const [acceptError, setAcceptError] = useState<string | null>(null);

  function handleConfirmAccept() {
    if (acceptSubmitting) return;
    setShowAcceptConfirm(false);
    setAcceptError(null);
    const match = /^prj-(\d+)$/.exec(enquiry?.id ?? "");
    if (!match) {
      setAcceptError("Cannot accept: the enquiry has no backend project id.");
      return;
    }
    setAcceptSubmitting(true);
    fetch(`/api/projects/${match[1]}/accept`, {
      method: "POST",
      cache: "no-store",
    })
      .then(async (response) => {
        const payload = (await response.json()) as {
          status: string;
          message?: string;
        };
        if (!response.ok || payload.status !== "ok") {
          throw new Error(payload.message ?? `Accept failed with status ${response.status}`);
        }
        onStageChange("accepted");
      })
      .catch((error: unknown) => {
        setAcceptError(error instanceof Error ? error.message : "Backend accept failed.");
      })
      .finally(() => setAcceptSubmitting(false));
  }

  function handleCreateOrViewProposal() {
    const targetId = enquiry?.id || "enq-1";
    router.push(`/studio?intent=create_proposal&enquiryId=${targetId}`);
  }

  // Focus the primary confirm button when dialog opens
  useEffect(() => {
    if (showAcceptConfirm) {
      confirmBtnRef.current?.focus();
    }
  }, [showAcceptConfirm]);

  // Close on Escape key
  useEffect(() => {
    if (!showAcceptConfirm) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setShowAcceptConfirm(false);
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [showAcceptConfirm]);

  function handleSendClarification(msg: string) {
    setSentMessage(msg);
    setSentTime(
      new Date().toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
    );
    onStageChange("clarification");
  }

  function handleViewAllFiles() {
    document.getElementById("enquiry-files")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  return (
    <aside
      className={`poc-right-column ${styles.enquiryRightRail}`}
      aria-label="Enquiry Actions"
    >
      <div className={styles.rightRailContent}>
        {/* Requirement Strength Card */}
        <RequirementStrengthCard
          completedSignals={4}
          totalSignals={7}
          previousScore={55.0}
          onDetailsClick={() => {
            // Qualification details action
          }}
        />

        {/* Site Images Preview Card */}
        <EnquirySiteImagesCard
          images={enquiry?.siteImages ?? []}
          onViewAll={handleViewAllFiles}
        />

        {/* Project Documents Section */}
        <EnquiryProjectDocumentsSection
          documents={(enquiry?.documents ?? []).map((doc) => ({
            id: `doc-${doc.id}`,
            name: doc.name,
            docImageUrl: doc.docImageUrl,
          }))}
        />
      </div>

      {/* Bottom Pinned Action Section (Request Clarification + Action Buttons) */}
      <div className={styles.rightRailBottom}>
        <div className={styles.clarificationSection}>
          <EnquiryClarificationComposer
            status={stage === "clarification" ? "sent" : undefined}
            onSend={handleSendClarification}
          />
        </div>

        {/* ── Stage-driven action area ──────────────────────── */}
        <div className={styles.ctaBody}>

          {acceptError && (
            <p className={styles.confirmAcceptError} role="alert">
              {acceptError}
            </p>
          )}

          {/* IDLE → decision row (Reject and Accept buttons) */}
          {stage === "idle" && !showAcceptConfirm && (
            <div className={styles.ctaRowGroup}>
              <button
                type="button"
                className={styles.rejectBtn}
                onClick={() => onStageChange("rejected")}
                aria-label="Reject Enquiry"
                title="Reject Enquiry"
              >
                <XCircle size={15} aria-hidden="true" />
                <span>Reject</span>
              </button>

              <button
                type="button"
                className={styles.acceptBtn}
                onClick={() => {
                  setAcceptError(null);
                  setShowAcceptConfirm(true);
                }}
                aria-label="Accept Enquiry"
                aria-haspopup="dialog"
                title="Accept Enquiry"
              >
                <CheckCircle2 size={15} aria-hidden="true" />
                <span>Accept</span>
              </button>
            </div>
          )}

          {/* Accept confirmation dialog */}
          {showAcceptConfirm && (
            <div
              className={styles.confirmOverlay}
              role="presentation"
              onClick={(e) => {
                if (e.target === e.currentTarget) setShowAcceptConfirm(false);
              }}
            >
              <div
                ref={confirmDialogRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="accept-confirm-title"
                aria-describedby="accept-confirm-desc"
                className={styles.confirmDialog}
              >
                <div className={styles.confirmDialogIcon}>
                  <CheckCircle2 size={24} aria-hidden="true" />
                </div>
                <h3 id="accept-confirm-title" className={styles.confirmDialogTitle}>
                  Accept this Enquiry?
                </h3>
                <p id="accept-confirm-desc" className={styles.confirmDialogDesc}>
                  You are about to accept this enquiry and proceed with the client. This action will move the enquiry to the next stage.
                </p>
                <div className={styles.confirmDialogActions}>
                  <button
                    type="button"
                    className={styles.confirmCancelBtn}
                    onClick={() => setShowAcceptConfirm(false)}
                    disabled={acceptSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    ref={confirmBtnRef}
                    type="button"
                    className={styles.confirmAcceptBtn}
                    onClick={handleConfirmAccept}
                    disabled={acceptSubmitting}
                  >
                    <CheckCircle2 size={14} aria-hidden="true" />
                    {acceptSubmitting ? "Accepting…" : "Yes, Accept"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ACCEPTED STAGE → proposal-status-driven workflow actions */}
          {stage === "accepted" && (
            <div className={styles.acceptedWorkflowContainer}>
              {proposalStatus !== "none" && (
                <div className={`${styles.proposalStatusBadge} ${styles[`status_${proposalStatus}`]}`}>
                  <span className={styles.statusDot} />
                  <span>
                    {proposalStatus === "draft" && "Proposal: Draft"}
                    {proposalStatus === "sent" && "Proposal: Sent"}
                    {proposalStatus === "viewed" && "Proposal: Viewed"}
                    {proposalStatus === "accepted" && "Proposal: Accepted"}
                    {proposalStatus === "rejected" && "Proposal: Rejected"}
                    {proposalStatus === "revision_requested" && "Proposal: Revision Requested"}
                  </span>
                </div>
              )}

              <div className={styles.nextWorkflowGroup}>
                {/* State 1: Before proposal creation */}
                {proposalStatus === "none" && (
                  <>
                    <button
                      type="button"
                      className={styles.workflowPrimaryBtn}
                      onClick={handleCreateOrViewProposal}
                    >
                      <FileText size={15} aria-hidden="true" />
                      <span>Create Proposal</span>
                    </button>
                    <button type="button" className={styles.workflowSecondaryBtn}>
                      <Clock size={15} aria-hidden="true" />
                      <span>Schedule Consultation</span>
                    </button>
                  </>
                )}

                {/* State 2: Proposal created, pending client decision */}
                {proposalStatus !== "none" && proposalStatus !== "accepted" && (
                  <>
                    <button
                      type="button"
                      className={styles.workflowSecondaryBtn}
                      onClick={handleCreateOrViewProposal}
                    >
                      <FileText size={15} aria-hidden="true" />
                      <span>View Proposal</span>
                    </button>
                    <button type="button" className={styles.workflowSecondaryBtn}>
                      <Clock size={15} aria-hidden="true" />
                      <span>Schedule Consultation</span>
                    </button>
                  </>
                )}

                {/* State 3: Client accepted proposal -> Convert to Project becomes primary */}
                {proposalStatus === "accepted" && (
                  <>
                    <button type="button" className={styles.workflowPrimaryBtn}>
                      <FolderOpen size={15} aria-hidden="true" />
                      <span>Convert to Project</span>
                    </button>
                    <button
                      type="button"
                      className={styles.workflowSecondaryBtn}
                      onClick={handleCreateOrViewProposal}
                    >
                      <FileText size={15} aria-hidden="true" />
                      <span>View Proposal</span>
                    </button>
                    <button type="button" className={styles.workflowSecondaryBtn}>
                      <Clock size={15} aria-hidden="true" />
                      <span>Schedule Consultation</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {/* CLARIFICATION → sent confirmation box */}
          {stage === "clarification" && (
            <div className={styles.clarificationSentBox}>
              <div className={styles.clarificationSentHeader}>
                <CheckCircle2 size={16} />
                <span>Clarification sent</span>
              </div>
              <span className={styles.clarificationSentTimestamp}>
                Sent today at {sentTime || "10:35 AM"}
              </span>
              <div className={styles.clarificationSentActions}>
                {sentMessage && (
                  <button
                    type="button"
                    className={styles.clarificationSentBtn}
                    onClick={() => alert(`Clarification Message:\n\n"${sentMessage}"`)}
                  >
                    View message
                  </button>
                )}
                <button
                  type="button"
                  className={styles.clarificationSentBtn}
                  onClick={() => {
                    onStageChange("idle");
                  }}
                >
                  Reset
                </button>
              </div>
            </div>
          )}

          {/* REJECTED → status badge + undo only */}
          {stage === "rejected" && (
            <div className={`${styles.actionFeedback} ${styles.feedback_rejected}`}>
              <span>Enquiry Rejected</span>
              <button
                type="button"
                className={styles.resetActionBtn}
                onClick={() => onStageChange("idle")}
              >
                Undo
              </button>
            </div>
          )}

        </div>
      </div>
    </aside>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

export function EnquiryDetailSkeleton() {
  return (
    <div className="workspace-container">
      <div className="route-state-box route-state-loading" aria-label="Loading enquiry detail">
        <div className="skeleton-bar skeleton-title" />
        <div className="skeleton-bar skeleton-subtitle" />
      </div>
    </div>
  );
}

// ─── Main workspace ───────────────────────────────────────────────────────────

/**
 * Marks the opened backend enquiry as viewed. Fire-and-forget: the page
 * never blocks on this call, and failures are deliberately ignored so a
 * backend hiccup cannot take the detail view down.
 */
function markEnquiryViewed(enquiryId: string) {
  const match = /^prj-(\d+)$/.exec(enquiryId);
  if (!match) return;
  fetch(`/api/projects/${match[1]}/view`, { method: "POST", cache: "no-store" }).catch(
    () => {}
  );
}

export function EnquiryDetailWorkspace({ enquiryId }: { enquiryId: string }) {
  /* Stage lifted here so the title-row pill and the actions card stay in sync */
  const [stage, setStage] = useState<EnquiryStage>("idle");

  const [updatesOpen, setUpdatesOpen] = useState(false);
  const updatesPanelRef = useRef<HTMLDivElement>(null);
  const { dashboardRef, mode: updatesMode, updatesWidth } =
    useProjectDashboardLayout(true);

  // The detail page is driven exclusively by backend enq projects. The
  // default record is only a typed placeholder; the project type, client,
  // budget and title are replaced by backend data once loaded. A missing
  // or failed backend match renders an explicit not-found state.
  const [enquiry, setEnquiry] = useState<EnquiryRecord>(() =>
    createDefaultEnquiry(enquiryId)
  );
  const [loadState, setLoadState] = useState<
    "loading" | "ready" | "not_found"
  >("loading");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/projects?character=enq", { cache: "no-store" })
      .then(async (response) => {
        const payload = (await response.json()) as {
          status: string;
          projects: Array<Record<string, unknown>>;
        };
        if (!response.ok || payload.status !== "ok") {
          throw new Error("Backend projects request failed");
        }
        const records = buildEnquiriesFromProjects(payload.projects as never[]);
        const match = records.find((record) => record.id === enquiryId);
        return match ?? null;
      })
      .then((match) => {
        if (cancelled) return;
        if (!match) {
          setLoadState("not_found");
          return;
        }
        setEnquiry(match);
        setLoadState("ready");
        markEnquiryViewed(enquiryId);
      })
      .catch(() => {
        if (cancelled) return;
        setLoadState("not_found");
      });
    return () => {
      cancelled = true;
    };
  }, [enquiryId]);

  if (loadState === "not_found") {
    return (
      <div className="workspace-container">
        <div className="route-state-box" role="alert">
          <h3>Enquiry not found</h3>
          <p>This enquiry does not exist or is not assigned to your account in the backend.</p>
        </div>
      </div>
    );
  }

  if (loadState === "loading") {
    return <EnquiryDetailSkeleton />;
  }

  const enquiryTitle = enquiry.title || "Project Enquiry";

  return (
    <div
      className={styles.enquiryDetailRoot}
      data-layout-mode={updatesMode}
      style={{
        "--enquiry-detail-rail-width": `${updatesWidth}px`,
        "--enquiry-detail-column-gap": `${PROJECT_UPDATES_GAP}px`,
      } as CSSProperties}
    >
      <RoutePageContainer
        className="project-dashboard-page"
        title={enquiryTitle}
        /* Heading, Status pill, and Enquiry identity metadata in the right side of the title row */
        titleRightContent={
          <div className={styles.topRightHeaderWrap}>
            <div className={styles.topRightHeader}>
              <h2 className={styles.topRightTitle}>Enquiry Details</h2>
              <EnquiryStatusPill stage={stage} />
            </div>
            <div className={styles.metaRow}>
              {enquiry.enquiryRef && (
                <span className={styles.metaId}>{enquiry.enquiryRef}</span>
              )}
              {enquiry.lastUpdatedAt && (
                <>
                  <span className={styles.metaDivider} aria-hidden="true">·</span>
                  <span className={styles.metaItem}>
                    Updated {new Date(enquiry.lastUpdatedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                  </span>
                </>
              )}
            </div>
          </div>
        }
      >
        <EnquiryOverviewCard
          dashboardRef={dashboardRef}
          layoutMode={updatesMode}
          updatesOpen={updatesOpen}
          updatesPanelRef={updatesPanelRef}
          updatesWidth={updatesWidth}
          onUpdatesClose={() => setUpdatesOpen(false)}
          overviewTitle=""
          projectName={enquiryTitle}
          description="Office Interior Fit-out for Greenleaf Spaces — a commercial workspace design project in Bengaluru targeting collaborative environments, ergonomic layouts, and a complete interior fit-out across an open-plan office floor."
          statValues={{
            client:      enquiry.clientName !== "—" ? enquiry.clientName : "Greenleaf Spaces",
            budget:      enquiry.budget ? `Up to ${enquiry.budget}` : "—",
            builtUpArea: enquiry.sqArea ?? "—",
            duration:    enquiry.timeline ? `Within ${enquiry.timeline}` : "—",
            projectType: PROJECT_TYPE_LABELS[enquiry.projectType],
          }}
          inspirationImages={enquiry.inspirationImages}
          projectScopes={enquiry.projectScopes ?? []}
          highlights={[
            { text: "Service matches our offering", status: "positive" },
            { text: "Location is serviceable",      status: "positive" },
            { text: "Requirement is clear",          status: "positive" },
            { text: "Budget is viable",              status: "positive" },
            { text: "Timeline is achievable",        status: "positive" },
            { text: "Required documents received",   status: "neutral"  },
          ]}
          customRightPanel={
            <EnquiryActionsCard stage={stage} onStageChange={setStage} enquiry={enquiry} />
          }
        />
        {updatesMode === "drawer" && updatesOpen ? (
          <UpdatesDrawerFocusManager
            panelRef={updatesPanelRef}
            onClose={() => setUpdatesOpen(false)}
          />
        ) : null}
      </RoutePageContainer>
    </div>
  );
}

