"use client";

import {
  Activity,
  AlertCircle,
  ArrowUpRight,
  Calendar,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock,
  FileCheck2,
  FileClock,
  FileText,
  FolderOpen,
  Layers,
  MessageSquareText,
  MoreHorizontal,
  RotateCcw,
  Sparkles,
  Upload,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  basicsEngagementRepository,
  basicsProviderRepository,
  basicsRequirementRepository,
} from "../repositories/basics-repositories";
import {
  approveDeliverable,
  createDeliverableRevision,
  requestDeliverableRevision,
  validateEngagementCompletion,
} from "../services/basics-domain-service";
import type {
  BasicsDeliverable,
  BasicsEngagement,
  BasicsProvider,
  BasicsRequirement,
} from "../types/basics.types";
import { formatCurrency, formatDate, titleCase } from "../utils/basics-formatters";
import {
  BasicsLoadingSkeleton,
  BasicsPageHeader,
  BasicsStateView,
  BasicsStatusBadge,
} from "./basics-shared";
import { EngagementChatModal } from "./engagement-chat-modal";
import { ApproveDeliverableModal } from "./approve-deliverable-modal";
import { projectDocumentRepository } from "@/services/repositories/project-document-repository";
import type { ProjectDocumentOwner } from "@/types/domain/project-document";
import styles from "./basics-workspace.module.css";

type EngagementTab =
  | "overview"
  | "deliverables"
  | "files"
  | "activity";

const TABS: { id: EngagementTab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "deliverables", label: "Deliverables" },
  { id: "files", label: "Files" },
  { id: "activity", label: "Activity" },
];

export function EngagementDetail({
  engagementId,
}: {
  engagementId: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedTab = searchParams.get("tab") as EngagementTab | null;
  const tab = TABS.some((item) => item.id === requestedTab)
    ? (requestedTab as EngagementTab)
    : "overview";
  const [engagement, setEngagement] = useState<BasicsEngagement | null>(null);
  const [provider, setProvider] = useState<BasicsProvider | null>(null);
  const [requirement, setRequirement] = useState<BasicsRequirement | null>(null);
  const [loadState, setLoadState] = useState<"loading" | "success" | "error" | "offline" | "forbidden">(
    searchParams.get("state") === "forbidden" ? "forbidden" : "loading",
  );
  const [notice, setNotice] = useState(
    searchParams.get("created") ? "Engagement created from the accepted proposal." : "",
  );
  const [uploadDeliverableId, setUploadDeliverableId] = useState("");
  const [uploadFileName, setUploadFileName] = useState("");
  const [revisionTargetId, setRevisionTargetId] = useState("");
  const [revisionComments, setRevisionComments] = useState("");
  const [working, setWorking] = useState(false);
  const [chatModalOpen, setChatModalOpen] = useState(false);
  const [approvingDeliverable, setApprovingDeliverable] = useState<BasicsDeliverable | null>(null);

  useEffect(() => {
    if (loadState === "forbidden") return;
    let cancelled = false;
    void basicsEngagementRepository.getEngagement(engagementId).then(
      async (engagementResult) => {
        if (cancelled || !engagementResult) {
          if (!cancelled) setLoadState("error");
          return;
        }
        const [providerResult, requirementResult] = await Promise.all([
          basicsProviderRepository.getProvider(engagementResult.providerId),
          basicsRequirementRepository.getRequirement(engagementResult.requirementId),
        ]);
        if (cancelled || !providerResult) {
          if (!cancelled) setLoadState("error");
          return;
        }
        setEngagement(engagementResult);
        setProvider(providerResult);
        setRequirement(requirementResult);
        setUploadDeliverableId(
          engagementResult.deliverables.find((item) => item.status !== "approved")?.id ??
            engagementResult.deliverables[0]?.id ??
            "",
        );
        setLoadState("success");
      },
      () => {
        if (!cancelled) setLoadState(typeof navigator !== "undefined" && !navigator.onLine ? "offline" : "error");
      },
    );
    return () => {
      cancelled = true;
    };
  }, [engagementId, loadState]);

  if (loadState === "loading") return <BasicsLoadingSkeleton label="Loading engagement" />;
  if (loadState === "forbidden") return <BasicsStateView state="forbidden" title="Engagement access is restricted" description="Only authorised project members, the client and the selected provider can access this engagement." />;
  if (loadState === "offline") return <BasicsStateView state="offline" title="You appear to be offline" description="Reconnect to load current deliverables, approvals and payment evidence." retryHref={`/basics/engagements/${engagementId}`} />;
  if (loadState === "error" || !engagement || !provider) return <BasicsStateView state="error" title="Engagement is unavailable" description="The engagement could not be found or loaded from the repository." retryHref="/basics/engagements" />;
  const currentEngagement = engagement;
  const currentProvider = provider;

  function goToTab(nextTab: EngagementTab, extra?: Record<string, string>) {
    const params = new URLSearchParams();
    params.set("tab", nextTab);
    Object.entries(extra ?? {}).forEach(([key, value]) => params.set(key, value));
    router.push(`/basics/engagements/${currentEngagement.id}?${params.toString()}`);
  }

  async function updateEngagementStatus(
    status: BasicsEngagement["status"],
    confirmation?: string,
  ) {
    if (confirmation && !window.confirm(confirmation)) return;
    setWorking(true);
    try {
      const updated = await basicsEngagementRepository.updateStatus(
        currentEngagement.id,
        status,
      );
      setEngagement(updated);
      setNotice(`Engagement status changed to ${status.replaceAll("_", " ")}.`);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Engagement status could not be updated.");
    } finally {
      setWorking(false);
    }
  }

  async function markComplete() {
    const validation = validateEngagementCompletion(currentEngagement);
    if (validation.length > 0) {
      setNotice(`Completion is blocked: ${validation.join(" ")}`);
      return;
    }
    await updateEngagementStatus(
      "completed",
      "Mark this engagement complete? All approved files and payment evidence will remain linked.",
    );
  }

  async function uploadRevision() {
    if (!uploadDeliverableId || !uploadFileName.trim()) return;
    const deliverable = currentEngagement.deliverables.find(
      (item) => item.id === uploadDeliverableId,
    );
    if (!deliverable) return;
    setWorking(true);
    try {
      const revised = createDeliverableRevision(
        deliverable,
        uploadFileName.trim(),
        `mock://engagement/${currentEngagement.id}/deliverable/${deliverable.id}/v${deliverable.versions.length + 1}`,
        currentProvider.name,
      );
      const updated = await basicsEngagementRepository.updateDeliverable(
        currentEngagement.id,
        revised,
      );
      setEngagement(updated);
      setUploadFileName("");
      setNotice(`${revised.name} version ${revised.versions.length} was submitted for review.`);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "The deliverable could not be uploaded.");
    } finally {
      setWorking(false);
    }
  }

  async function approve(
    deliverable: BasicsDeliverable,
    options?: {
      addToDrive: boolean;
      folderId: string;
      sharedWith: ProjectDocumentOwner[];
    },
  ) {
    setWorking(true);
    try {
      const approved = approveDeliverable(deliverable, "Arjun Mehta");
      const updated = await basicsEngagementRepository.updateDeliverable(
        currentEngagement.id,
        approved,
      );
      setEngagement(updated);

      if (options?.addToDrive && projectDocumentRepository.publishApprovedDeliverable) {
        const latestVer = approved.versions.at(-1);
        const fileName = latestVer?.fileName || `${approved.name}.pdf`;
        await projectDocumentRepository.publishApprovedDeliverable({
          projectId: currentEngagement.projectId,
          deliverableId: approved.id,
          deliverableName: approved.name,
          fileName,
          version: latestVer?.version ?? 1,
          folderId: options.folderId,
          approvedBy: "Arjun Mehta",
          owner: {
            id: currentProvider.id,
            name: currentProvider.name,
            role: "Specialist Provider",
            organization: currentProvider.name,
            type: "basics",
          },
          sharedWith: options.sharedWith,
        });

        setNotice(
          `${deliverable.name} version ${latestVer?.version} was approved and added to Project Drive (${options.folderId}) with access granted to ${options.sharedWith.length} stakeholder(s).`,
        );
      } else {
        setNotice(`${deliverable.name} version ${approved.versions.at(-1)?.version} was approved.`);
      }
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "The deliverable could not be approved.");
    } finally {
      setWorking(false);
    }
  }

  async function requestRevision(deliverable: BasicsDeliverable) {
    if (!revisionComments.trim()) return;
    setWorking(true);
    try {
      const revised = requestDeliverableRevision(
        deliverable,
        revisionComments.trim(),
      );
      const updated = await basicsEngagementRepository.updateDeliverable(
        currentEngagement.id,
        revised,
      );
      setEngagement(updated);
      setRevisionTargetId("");
      setRevisionComments("");
      setNotice(`Revision requested for ${deliverable.name}.`);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "The revision request could not be recorded.");
    } finally {
      setWorking(false);
    }
  }

  const approvedDeliverablesCount = engagement.deliverables.filter(
    (d) => d.status === "approved",
  ).length;

  return (
    <div className={`${styles.page} ${styles.engagementDetailPage}`}>
      {/* Fixed Sticky Header Section: Title, Actions, Badges & Tabs */}
      <div className={styles.engagementStickyHeader}>
        <BasicsPageHeader
          title={engagement.title}
          description={`${provider.name} · ${engagement.projectName}`}
          actions={
            <>
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={() => setChatModalOpen(true)}
              >
                <MessageSquareText size={13} aria-hidden="true" /> Message
              </button>
              <button type="button" className={styles.primaryButton} disabled={working || engagement.status === "completed"} onClick={() => void markComplete()}>
                Mark complete
              </button>
              <details className={styles.actionMenu}>
                <summary className={styles.iconButton} aria-label="More engagement actions"><MoreHorizontal size={14} aria-hidden="true" /></summary>
                <div className={styles.menuPopover}>
                  <button type="button" className={styles.menuItem} onClick={() => void updateEngagementStatus("paused", "Pause this engagement?")}>Pause</button>
                  <button type="button" className={`${styles.menuItem} ${styles.menuItemDanger}`} onClick={() => void updateEngagementStatus("cancelled", "Cancel this engagement? Approved files and activity will be retained.")}>Cancel</button>
                  <button type="button" className={`${styles.menuItem} ${styles.menuItemDanger}`} onClick={() => void updateEngagementStatus("disputed", "Flag this engagement as disputed?")}>Flag dispute</button>
                </div>
              </details>
            </>
          }
        />

        <div className={styles.inlineActions}>
          <BasicsStatusBadge status={engagement.status} />
          <BasicsStatusBadge status={engagement.paymentStatus === "partially_paid" ? "pending" : engagement.paymentStatus} label={engagement.paymentStatus.replaceAll("_", " ")} />
          <span className={styles.badge}>{engagement.progress}% complete</span>
          <span className={styles.badge}>{formatCurrency(engagement.agreedFee, engagement.currency)}</span>
          <span className={styles.badge}>Due {formatDate(engagement.expectedCompletionDate)}</span>
        </div>

        {notice ? (
          <div className={styles.notice} role="status">
            {notice}
            <button type="button" className={styles.tertiaryButton} onClick={() => setNotice("")}>Dismiss</button>
          </div>
        ) : null}

        <nav className={styles.profileTabs} aria-label="Engagement sections">
          {TABS.map((item) => (
            <button key={item.id} type="button" className={`${styles.profileTab} ${tab === item.id ? styles.profileTabActive : ""}`} aria-pressed={tab === item.id} onClick={() => goToTab(item.id)}>
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      {tab === "overview" ? (
        <div className={styles.detailStack}>
          {/* 1. Project & Selected Plan Details */}
          <section className={styles.detailPanel} aria-label="Project and Plan details">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px", flexWrap: "wrap", marginBottom: "8px" }}>
              <h2 style={{ margin: 0 }}>Project & Plan Details</h2>
              <span className={styles.planSelectedBadge}>
                Selected Plan: {engagement.title}
              </span>
            </div>
            <dl className={styles.detailList}>
              <div>
                <dt>Project</dt>
                <dd><strong>{engagement.projectName}</strong></dd>
              </div>
              <div>
                <dt>Selected Plan</dt>
                <dd>{engagement.title}</dd>
              </div>
              <div>
                <dt>Service Person / Firm</dt>
                <dd>{provider.name}</dd>
              </div>
              <div>
                <dt>Schedule</dt>
                <dd>
                  {formatDate(engagement.startDate)} → {formatDate(engagement.expectedCompletionDate)}
                </dd>
              </div>
              <div>
                <dt>Committed Fee</dt>
                <dd>{formatCurrency(engagement.agreedFee, engagement.currency)}</dd>
              </div>
              <div>
                <dt>Revision Limit</dt>
                <dd>
                  {engagement.revisionLimit ?? "Not set"} ({engagement.revisionsUsed ?? 0} used)
                </dd>
              </div>
              <div>
                <dt>Exclusions</dt>
                <dd>{engagement.exclusions.join(", ") || "None recorded"}</dd>
              </div>
            </dl>
            <div className={styles.cardFooter} style={{ justifyContent: "flex-end" }}>
              <Link className={styles.secondaryButton} href={`/basics/experts/${provider.id}`}>
                View provider
              </Link>
            </div>
          </section>

          {/* 2. Request Requirements */}
          {requirement ? (
            <section
              id="request-requirements"
              className={styles.detailPanel}
              aria-label="Request Requirements"
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "8px",
                  flexWrap: "wrap",
                  marginBottom: "12px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                  <h2 style={{ margin: 0 }}>Request Requirements</h2>
                  <BasicsStatusBadge status={requirement.status} />
                  <span className={styles.badge}>{titleCase(requirement.category)}</span>
                </div>
                <Link
                  className={styles.secondaryButton}
                  href={`/basics/requirements/${requirement.id}`}
                  style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "12px" }}
                >
                  Full requirement page <ArrowUpRight size={13} aria-hidden="true" />
                </Link>
              </div>

              <p
                style={{
                  margin: "0 0 16px 0",
                  color: "var(--ink-secondary, #475569)",
                  lineHeight: 1.5,
                  fontSize: "13.5px",
                }}
              >
                {requirement.description}
              </p>

              <dl className={styles.detailList}>
                <div>
                  <dt>Requirement Title</dt>
                  <dd><strong>{requirement.title}</strong></dd>
                </div>
                <div>
                  <dt>Specialization</dt>
                  <dd>{requirement.specialization}</dd>
                </div>
                <div>
                  <dt>Engagement Mode</dt>
                  <dd>{titleCase(requirement.engagementMode)}</dd>
                </div>
                <div>
                  <dt>Budget Range</dt>
                  <dd>
                    {requirement.budgetMin
                      ? `${formatCurrency(requirement.budgetMin, requirement.currency)} - ${formatCurrency(requirement.budgetMax ?? requirement.budgetMin, requirement.currency)}`
                      : "Request quote"}
                  </dd>
                </div>
                <div>
                  <dt>Target Timeline</dt>
                  <dd>
                    {formatDate(requirement.expectedStartDate)} → {formatDate(requirement.expectedCompletionDate)}
                  </dd>
                </div>
                <div>
                  <dt>Project Stage</dt>
                  <dd>{requirement.projectStage ?? "Not specified"}</dd>
                </div>
                {requirement.builtUpArea ? (
                  <div>
                    <dt>Built-up Area</dt>
                    <dd>{requirement.builtUpArea.toLocaleString("en-IN")} sq ft</dd>
                  </div>
                ) : null}
                {requirement.numberOfFloors ? (
                  <div>
                    <dt>Floors</dt>
                    <dd>{requirement.numberOfFloors}</dd>
                  </div>
                ) : null}
                {requirement.location ? (
                  <div>
                    <dt>Site Location</dt>
                    <dd>{requirement.location}</dd>
                  </div>
                ) : null}
              </dl>

              {requirement.deliverables && requirement.deliverables.length > 0 ? (
                <div style={{ marginTop: "16px", paddingTop: "14px", borderTop: "1px solid var(--line, #e2e8f0)" }}>
                  <h3 style={{ fontSize: "12.5px", fontWeight: 650, color: "var(--ink, #0f172a)", margin: "0 0 8px 0" }}>
                    Requested Deliverables ({requirement.deliverables.length})
                  </h3>
                  <ul className={styles.bulletList} style={{ margin: 0 }}>
                    {requirement.deliverables.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {requirement.attachments && requirement.attachments.length > 0 ? (
                <div style={{ marginTop: "14px", paddingTop: "14px", borderTop: "1px solid var(--line, #e2e8f0)" }}>
                  <h3 style={{ fontSize: "12.5px", fontWeight: 650, color: "var(--ink, #0f172a)", margin: "0 0 8px 0" }}>
                    Client Attachments ({requirement.attachments.length})
                  </h3>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    {requirement.attachments.map((att) => (
                      <span
                        key={att}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          padding: "4px 10px",
                          borderRadius: "6px",
                          background: "var(--surface-subtle, #f8fafc)",
                          border: "1px solid var(--line, #e2e8f0)",
                          fontSize: "12px",
                          color: "var(--ink, #1e293b)",
                        }}
                      >
                        <FileText size={12} aria-hidden="true" style={{ color: "#64748b" }} />
                        {att}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
            </section>
          ) : null}

          {/* 3. Scope Deliverables */}
          <section className={styles.detailPanel}>
            <h2>Scope & Deliverables</h2>
            <ul className={styles.bulletList}>
              {engagement.scope.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          {/* 3. Project Connections */}
          <section className={styles.detailPanelBorderless}>
            <h2>Project connections</h2>
            <div className={styles.serviceList}>
              <Link className={styles.serviceCard} href={`/projects/${engagement.projectId}`}>
                <FolderOpen size={16} aria-hidden="true" />
                <h3>Project</h3>
                <p>Open {engagement.projectName}.</p>
              </Link>
              <Link className={styles.serviceCard} href={`/calendar?engagementId=${engagement.id}`}>
                <CalendarDays size={16} aria-hidden="true" />
                <h3>Calendar</h3>
                <p>Review deliverable and milestone dates.</p>
              </Link>
              <Link className={styles.serviceCard} href={`/documents?engagementId=${engagement.id}`}>
                <FileText size={16} aria-hidden="true" />
                <h3>Documents</h3>
                <p>Reference approved engagement outputs.</p>
              </Link>
              <Link className={styles.serviceCard} href={`/studio?engagementId=${engagement.id}`}>
                <Sparkles size={16} aria-hidden="true" />
                <h3>Hive Studio</h3>
                <p>Reference relevant production outputs.</p>
              </Link>
            </div>
          </section>
        </div>
      ) : null}

      {tab === "deliverables" ? (
        <section className={styles.detailPanel}>
          {/* Section Header with count, progress, and upload button */}
          <div className={styles.deliverablesSectionHeader}>
            <div className={styles.deliverablesHeaderInfo}>
              <div className={styles.deliverablesTitleRow}>
                <h2 style={{ margin: 0 }}>Deliverables</h2>
                <span className={styles.deliverablesCountBadge}>
                  {engagement.deliverables.length}
                </span>
                {approvedDeliverablesCount > 0 ? (
                  <span className={styles.deliverablesApprovedBadge}>
                    <CheckCircle2 size={11} aria-hidden="true" />
                    <span>{approvedDeliverablesCount}/{engagement.deliverables.length} Approved</span>
                  </span>
                ) : null}
              </div>
              <p className={styles.deliverablesSubtitle}>
                Approved versions remain immutable. Later changes create a tracked new version.
              </p>
            </div>
            <button
              type="button"
              className={styles.deliverableUploadHeaderBtn}
              onClick={() =>
                goToTab("deliverables", {
                  upload: searchParams.get("upload") === "true" ? "" : "true",
                })
              }
            >
              <Upload size={13} aria-hidden="true" />
              <span>{searchParams.get("upload") === "true" ? "Close upload" : "Upload deliverable"}</span>
            </button>
          </div>

          {searchParams.get("upload") === "true" ? (
            <div className={styles.wizardPanel}>
              <div className={styles.wizardHeaderRow}>
                <h4>Submit Deliverable Output</h4>
                <p>Upload the latest drawing package, calculation sheet, or report file for review.</p>
              </div>
              <div className={styles.formGrid}>
                <label className={styles.field}>
                  <span>Target Deliverable</span>
                  <select
                    className={styles.select}
                    value={uploadDeliverableId}
                    onChange={(event) => setUploadDeliverableId(event.target.value)}
                  >
                    {engagement.deliverables.map((deliverable) => (
                      <option key={deliverable.id} value={deliverable.id}>
                        {deliverable.name} (v{deliverable.versions.at(-1)?.version ?? 0})
                      </option>
                    ))}
                  </select>
                </label>
                <label className={styles.field}>
                  <span>Select File</span>
                  <input
                    className={styles.input}
                    type="file"
                    onChange={(event) => setUploadFileName(event.target.files?.[0]?.name ?? "")}
                  />
                </label>
              </div>
              <div className={styles.wizardFooter}>
                <button
                  type="button"
                  className={styles.tertiaryButton}
                  onClick={() => goToTab("deliverables")}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className={styles.primaryButton}
                  disabled={working || !uploadFileName}
                  onClick={() => void uploadRevision()}
                >
                  <Upload size={13} aria-hidden="true" />
                  <span>Submit version</span>
                </button>
              </div>
            </div>
          ) : null}

          {/* Deliverables Card List */}
          <div className={styles.deliverablesList}>
            {engagement.deliverables.map((deliverable) => {
              const latest = deliverable.versions.at(-1);
              const isApproved = deliverable.status === "approved";
              const isUnderReview = ["submitted", "under_review"].includes(deliverable.status);

              return (
                <div key={deliverable.id} className={styles.deliverableItemCard}>
                  <div className={styles.deliverableItemMain}>
                    {/* Left Column: Icon + Deliverable Details */}
                    <div className={styles.deliverableItemLeft}>
                      <div
                        className={`${styles.deliverableIconBox} ${
                          isApproved
                            ? styles.deliverableIconBoxApproved
                            : isUnderReview
                            ? styles.deliverableIconBoxReview
                            : styles.deliverableIconBoxDefault
                        }`}
                        aria-hidden="true"
                      >
                        {isApproved ? (
                          <FileCheck2 size={18} />
                        ) : isUnderReview ? (
                          <FileText size={18} />
                        ) : (
                          <FileClock size={18} />
                        )}
                      </div>

                      <div className={styles.deliverableDetailsCol}>
                        <div className={styles.deliverableTitleRow}>
                          <h4 className={styles.deliverableName}>{deliverable.name}</h4>
                          <span className={styles.deliverableVersionChip}>
                            v{latest?.version ?? 0}
                          </span>
                          {latest?.fileName ? (
                            <span className={styles.deliverableFileNameChip} title={latest.fileName}>
                              {latest.fileName}
                            </span>
                          ) : null}
                        </div>

                        <p className={styles.deliverableDescription}>
                          {deliverable.description}
                          {deliverable.owner ? (
                            <span className={styles.deliverableOwnerMeta}>
                              {" "}· owner <strong>{deliverable.owner}</strong>
                            </span>
                          ) : null}
                        </p>

                        <div className={styles.deliverableMetaPills}>
                          <span className={styles.deliverableMetaPill}>
                            <Calendar size={11} aria-hidden="true" />
                            <span>Due {formatDate(deliverable.dueDate)}</span>
                          </span>
                          {latest?.submittedAt ? (
                            <span className={styles.deliverableMetaPill}>
                              <Clock size={11} aria-hidden="true" />
                              <span>Submitted {formatDate(latest.submittedAt)}</span>
                            </span>
                          ) : null}
                          {deliverable.versions.length > 1 ? (
                            <span className={styles.deliverableMetaPill}>
                              <Layers size={11} aria-hidden="true" />
                              <span>{deliverable.versions.length} versions</span>
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Status Badge & Interactive Action Buttons */}
                    <div className={styles.deliverableItemRight}>
                      <BasicsStatusBadge status={deliverable.status} />

                      <div className={styles.deliverableActionsGroup}>
                        {isUnderReview ? (
                          <button
                            type="button"
                            className={styles.deliverableApproveBtn}
                            disabled={working}
                            onClick={() => setApprovingDeliverable(deliverable)}
                            title="Approve this deliverable"
                          >
                            <Check size={12} aria-hidden="true" />
                            <span>Approve</span>
                          </button>
                        ) : null}

                        {latest && latest.status !== "approved" ? (
                          <button
                            type="button"
                            className={`${styles.deliverableReviseBtn} ${
                              revisionTargetId === deliverable.id ? styles.deliverableReviseBtnActive : ""
                            }`}
                            onClick={() =>
                              setRevisionTargetId(revisionTargetId === deliverable.id ? "" : deliverable.id)
                            }
                            title="Request modifications or revision"
                          >
                            <RotateCcw size={12} aria-hidden="true" />
                            <span>{revisionTargetId === deliverable.id ? "Close" : "Revise"}</span>
                          </button>
                        ) : null}

                        {isApproved ? (
                          <span className={styles.deliverableApprovedTag}>
                            <Check size={12} aria-hidden="true" />
                            <span>Signed off</span>
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  {/* Inline Revision Request Panel */}
                  {revisionTargetId === deliverable.id ? (
                    <div className={styles.deliverableRevisionPanel}>
                      <div className={styles.revisionPanelHeader}>
                        <AlertCircle size={14} className={styles.revisionWarningIcon} aria-hidden="true" />
                        <div>
                          <h5>Request Revision for {deliverable.name}</h5>
                          <p>Specify required changes, drawing annotations, or technical notes for the provider.</p>
                        </div>
                      </div>
                      <textarea
                        className={styles.revisionTextarea}
                        rows={3}
                        placeholder="Detail required adjustments (e.g. Update foundation load capacity specifications on sheet S-02)..."
                        value={revisionComments}
                        onChange={(event) => setRevisionComments(event.target.value)}
                      />
                      <div className={styles.revisionPanelFooter}>
                        <button
                          type="button"
                          className={styles.tertiaryButton}
                          onClick={() => {
                            setRevisionTargetId("");
                            setRevisionComments("");
                          }}
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          className={styles.secondaryButton}
                          disabled={!revisionComments.trim() || working}
                          onClick={() => void requestRevision(deliverable)}
                        >
                          <RotateCcw size={12} aria-hidden="true" />
                          <span>Request revision</span>
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </section>
      ) : null}


      {tab === "files" ? (
        <section className={styles.detailPanel}>
          <div className={styles.sectionHeader}><div><h2>Files and versions</h2><p>Mock references expose version metadata; binary preview and download require Firebase Storage integration.</p></div><Link className={styles.secondaryButton} href={`/documents?engagementId=${engagement.id}`}>Project documents <ArrowUpRight size={12} aria-hidden="true" /></Link></div>
          {engagement.deliverables.flatMap((deliverable) =>
            deliverable.versions.map((version) => (
              <div className={styles.deliverableRow} key={`${deliverable.id}-${version.version}`}>
                <span className={styles.primaryCell}><strong>{version.fileName}</strong><span>{deliverable.name} · uploaded by {version.submittedBy}</span></span>
                <span className={styles.cellMuted}>Version {version.version}</span>
                <BasicsStatusBadge status={version.status} />
                <span className={styles.cellMuted}>{formatDate(version.submittedAt)}</span>
              </div>
            )),
          )}
        </section>
      ) : null}

      {tab === "activity" ? (
        <section className={styles.detailPanel}>
          <h2>Activity</h2>
          {engagement.activity.map((item) => (
            <div className={styles.activityRow} key={item.id}>
              <span className={styles.activityIcon}><Activity size={13} aria-hidden="true" /></span>
              <span className={styles.activityCopy}><strong>{item.action}</strong><span>{item.actor} · {item.actorRole}{item.detail ? ` · ${item.detail}` : ""}</span></span>
              <time className={styles.activityTime}>{formatDate(item.timestamp)}</time>
            </div>
          ))}
          {engagement.deliverables.flatMap((deliverable) => deliverable.versions).map((version) => (
            <div className={styles.activityRow} key={`${version.fileReference}-${version.version}`}>
              <span className={styles.activityIcon}><FileClock size={13} aria-hidden="true" /></span>
              <span className={styles.activityCopy}><strong>Deliverable version submitted</strong><span>{version.fileName} · {version.status.replaceAll("_", " ")}</span></span>
              <time className={styles.activityTime}>{formatDate(version.submittedAt)}</time>
            </div>
          ))}
        </section>
      ) : null}

      {chatModalOpen ? (
        <EngagementChatModal
          isOpen={chatModalOpen}
          onClose={() => setChatModalOpen(false)}
          engagement={currentEngagement}
          provider={currentProvider}
        />
      ) : null}

      {approvingDeliverable ? (
        <ApproveDeliverableModal
          isOpen={!!approvingDeliverable}
          deliverable={approvingDeliverable}
          engagement={currentEngagement}
          provider={currentProvider}
          onClose={() => setApprovingDeliverable(null)}
          onConfirmApproval={async (options) => {
            await approve(approvingDeliverable, options);
          }}
        />
      ) : null}
    </div>
  );
}
