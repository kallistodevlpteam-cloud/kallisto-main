"use client";

import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Download,
  Eye,
  FileText,
  MessageSquare,
  MessageSquareText,
  Pencil,
  RotateCcw,
  Send,
  ShieldCheck,
  User,
  UsersRound,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { EngagementChatModal } from "./engagement-chat-modal";
import { ProposalDocumentViewerModal } from "./proposal-document-viewer-modal";
import {
  basicsEngagementRepository,
  basicsProposalRepository,
  basicsProviderRepository,
  basicsRequirementRepository,
} from "../repositories/basics-repositories";
import { canEditProposal } from "../services/basics-domain-service";
import type {
  BasicsProposal,
  BasicsProvider,
  BasicsRequirement,
} from "../types/basics.types";
import { formatCurrency, formatDate, pricingLabels } from "../utils/basics-formatters";
import {
  BasicsLoadingSkeleton,
  BasicsPageHeader,
  BasicsStateView,
  BasicsStatusBadge,
  ProviderVerificationBadge,
} from "./basics-shared";
import styles from "./basics-workspace.module.css";

export function ProposalDetail({ proposalId }: { proposalId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode");
  const [proposal, setProposal] = useState<BasicsProposal | null>(null);
  const [provider, setProvider] = useState<BasicsProvider | null>(null);
  const [requirement, setRequirement] = useState<BasicsRequirement | null>(null);
  const [loadState, setLoadState] = useState<"loading" | "success" | "error" | "offline" | "forbidden">(
    searchParams.get("state") === "forbidden" ? "forbidden" : "loading",
  );
  const [notice, setNotice] = useState("");
  const [working, setWorking] = useState(false);
  const [coverNote, setCoverNote] = useState("");
  const [scopeSummary, setScopeSummary] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activePreviewFile, setActivePreviewFile] = useState<{
    fileName: string;
    contextTitle?: string;
    submittedBy?: string;
    submittedAt?: string;
    fileSize?: string;
  } | null>(null);

  const handleViewFile = (
    fileName: string,
    contextTitle = "Proposal Attachment",
    submittedBy = provider?.name || "Specialist Provider",
    submittedAt = proposal ? formatDate(proposal.submittedAt) : "14 Jul 2026",
    fileSize = "3.8 MB",
  ) => {
    setActivePreviewFile({
      fileName,
      contextTitle,
      submittedBy,
      submittedAt,
      fileSize,
    });
  };

  const handleDownloadFile = (fileName: string) => {
    const blob = new Blob(
      [
        `KALLISTO BASICS — VERIFIED SERVICE PROPOSAL DOCUMENT\n` +
        `===================================================\n` +
        `Document: ${fileName}\n` +
        `Project: ${requirement?.projectName ?? "General Project"}\n` +
        `Requirement: ${requirement?.title ?? "Service Scope"}\n` +
        `Specialization: ${requirement?.specialization ?? "Consulting"}\n` +
        `Submitted By: ${provider?.name ?? "Provider"}\n` +
        `Date: ${proposal ? formatDate(proposal.submittedAt) : "Recent"}\n`
      ],
      { type: "application/pdf" },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    if (loadState === "forbidden") return;
    let cancelled = false;
    void basicsProposalRepository.getProposal(proposalId).then(
      async (proposalResult) => {
        if (cancelled || !proposalResult) {
          if (!cancelled) setLoadState("error");
          return;
        }
        const [providerResult, requirementResult] = await Promise.all([
          basicsProviderRepository.getProvider(proposalResult.providerId),
          basicsRequirementRepository.getRequirement(proposalResult.requirementId),
        ]);
        if (cancelled || !providerResult || !requirementResult) {
          if (!cancelled) setLoadState("error");
          return;
        }
        setProposal(proposalResult);
        setProvider(providerResult);
        setRequirement(requirementResult);
        setCoverNote(proposalResult.coverNote);
        setScopeSummary(proposalResult.scopeSummary);
        setLoadState("success");
      },
      () => {
        if (!cancelled) setLoadState(typeof navigator !== "undefined" && !navigator.onLine ? "offline" : "error");
      },
    );
    return () => {
      cancelled = true;
    };
  }, [loadState, proposalId]);

  if (loadState === "loading") return <BasicsLoadingSkeleton label="Loading proposal" />;
  if (loadState === "forbidden") return <BasicsStateView state="forbidden" title="Proposal access is restricted" description="Only the requirement owner, proposal provider and authorised project members can view these terms." />;
  if (loadState === "offline") return <BasicsStateView state="offline" title="You appear to be offline" description="Reconnect to load the current proposal terms and activity." retryHref={`/basics/proposals/${proposalId}`} />;
  if (loadState === "error" || !proposal || !provider || !requirement) return <BasicsStateView state="error" title="Proposal is unavailable" description="The proposal or its linked provider and requirement could not be loaded." retryHref="/basics/proposals" />;
  const currentProposal = proposal;

  async function changeStatus(status: BasicsProposal["status"], confirmText?: string) {
    if (confirmText && !window.confirm(confirmText)) return;
    setWorking(true);
    try {
      const updated = await basicsProposalRepository.updateProposalStatus(currentProposal.id, status);
      setProposal(updated);
      setNotice(`Proposal status changed to ${status.replaceAll("_", " ")}.`);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Proposal status could not be updated.");
    } finally {
      setWorking(false);
    }
  }

  async function saveResponse() {
    setWorking(true);
    try {
      const updated = await basicsProposalRepository.updateProposal(currentProposal.id, {
        coverNote,
        scopeSummary,
        status: "submitted",
      });
      setProposal(updated);
      setNotice(mode === "respond" ? "Clarification response submitted." : "Proposal revision submitted.");
      router.replace(`/basics/proposals/${currentProposal.id}`);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "The proposal could not be updated.");
    } finally {
      setWorking(false);
    }
  }

  const isBuyer = proposal.ownerPerspective === "buyer";

  return (
    <div className={styles.page}>
      <BasicsPageHeader
        title={isBuyer ? `${provider.name} proposal` : `Proposal for ${requirement.title}`}
        description={`${requirement.projectName ?? "No project"} · ${requirement.specialization}`}
        actions={
          isBuyer ? (
            <>
              <button
                type="button"
                className={styles.dangerButton}
                disabled={working || ["withdrawn", "rejected"].includes(proposal.status)}
                onClick={() =>
                  void changeStatus(
                    "withdrawn",
                    "Cancel this service request? This will withdraw the proposal from active consideration.",
                  )
                }
              >
                <XCircle size={13} aria-hidden="true" /> Cancel request
              </button>
              <Link
                className={styles.secondaryButton}
                href={`/basics/experts/${provider.id}`}
              >
                <User size={13} aria-hidden="true" /> View profile
              </Link>
              <button
                type="button"
                className={styles.primaryButton}
                onClick={() => setIsChatOpen(true)}
              >
                <MessageSquare size={13} aria-hidden="true" /> Message
              </button>
            </>
          ) : (
            <>
              {canEditProposal(proposal) ? <Link className={styles.secondaryButton} href={`/basics/proposals/${proposal.id}?mode=edit`}><Pencil size={13} aria-hidden="true" /> Edit</Link> : null}
              {proposal.status === "clarification_requested" ? <Link className={styles.primaryButton} href={`/basics/proposals/${proposal.id}?mode=respond`}><MessageSquareText size={13} aria-hidden="true" /> Respond</Link> : null}
              {["submitted", "viewed", "shortlisted", "negotiating"].includes(proposal.status) ? <button type="button" className={styles.secondaryButton} onClick={() => router.push(`/basics/proposals/${proposal.id}?mode=edit`)}><RotateCcw size={13} aria-hidden="true" /> Submit revision</button> : null}
              {!["accepted", "rejected", "withdrawn"].includes(proposal.status) ? <button type="button" className={styles.dangerButton} disabled={working} onClick={() => void changeStatus("withdrawn", "Withdraw this proposal? The buyer will retain the proposal history.")}><XCircle size={13} aria-hidden="true" /> Withdraw</button> : null}
            </>
          )
        }
      />

      <div className={styles.inlineActions}>
        <BasicsStatusBadge status={proposal.status} />
        <ProviderVerificationBadge level={provider.verificationLevel} />
        <span className={styles.badge}>{isBuyer ? "Received proposal" : "Submitted proposal"}</span>
      </div>

      {notice ? <div className={styles.notice} role="status">{notice}<button type="button" className={styles.tertiaryButton} onClick={() => setNotice("")}>Dismiss</button></div> : null}

      {proposal.status === "accepted" ? (
        <div className={`${styles.notice} ${styles.noticeSuccess}`}>
          <CheckCircle2 size={15} aria-hidden="true" />
          This proposal has been accepted. Its scope and milestones are immutable and linked to one engagement.
          <button
            type="button"
            className={styles.tertiaryButton}
            onClick={() => void basicsEngagementRepository.createFromProposal(proposal.id).then((engagement) => router.push(`/basics/engagements/${engagement.id}`))}
          >
            Open engagement <ArrowRight size={12} aria-hidden="true" />
          </button>
        </div>
      ) : null}

      {mode === "edit" || mode === "respond" ? (
        <section className={styles.wizardPanel}>
          <div className={styles.wizardPanelHeader}>
            <span>{mode === "respond" ? "Clarification response" : "Proposal revision"}</span>
            <h2>{mode === "respond" ? "Respond to the buyer" : "Update proposal terms"}</h2>
            <p>Submitting creates an updated proposal record and preserves the current status history.</p>
          </div>
          <div className={styles.formGrid}>
            <label className={`${styles.field} ${styles.fieldWide}`}><span>Cover note</span><textarea className={styles.textarea} value={coverNote} onChange={(event) => setCoverNote(event.target.value)} /></label>
            <label className={`${styles.field} ${styles.fieldWide}`}><span>Scope summary</span><textarea className={styles.textarea} value={scopeSummary} onChange={(event) => setScopeSummary(event.target.value)} /></label>
          </div>
          <div className={styles.wizardFooter}>
            <Link className={styles.tertiaryButton} href={`/basics/proposals/${proposal.id}`}>Cancel</Link>
            <button type="button" className={styles.primaryButton} disabled={working || !coverNote.trim() || !scopeSummary.trim()} onClick={() => void saveResponse()}><Send size={13} aria-hidden="true" /> Submit update</button>
          </div>
        </section>
      ) : null}

      <div className={styles.detailGrid}>
        <div className={styles.detailStack}>
          {/* Linked Service Request Overview */}
          <section className={styles.requirementOverviewSection}>
            <div className={styles.requirementOverviewHeader}>
              <div className={styles.requirementOverviewBadgeRow}>
                <span className={styles.requirementBadgeTag}>
                  Service Request
                </span>
                <span className={styles.requirementProjectTag}>
                  {requirement.projectName ?? "General Project"}
                </span>
                <span className={styles.requirementSpecializationTag}>
                  {requirement.specialization}
                </span>
              </div>
              <Link
                href={`/basics/requirements/${requirement.id}`}
                className={styles.requirementViewLink}
                title="View full requirement details"
              >
                <span>View full requirement</span>
                <ArrowRight size={12} aria-hidden="true" />
              </Link>
            </div>

            <h3 className={styles.requirementOverviewTitle}>
              {requirement.title}
            </h3>
            <p className={styles.requirementOverviewDesc}>
              {requirement.description}
            </p>

            <div className={styles.requirementDeliverablesGrid}>
              <div className={styles.requirementDeliverablesCol}>
                <div className={styles.requirementColHeader}>
                  <div className={styles.requirementColHeaderLeft}>
                    <CheckCircle2 size={13} className={styles.requirementColHeaderScopeIcon} aria-hidden="true" />
                    <span className={styles.requirementDeliverablesLabel}>
                      Requested Scope & Deliverables
                    </span>
                  </div>
                  <span className={styles.requirementColCountBadge}>
                    {requirement.deliverables.length} items
                  </span>
                </div>
                <ul className={styles.requirementBulletList}>
                  {requirement.deliverables.map((item) => (
                    <li key={item}>
                      <span className={styles.requirementBulletIconWrap}>
                        <CheckCircle2 size={11} aria-hidden="true" />
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {requirement.attachments && requirement.attachments.length > 0 ? (
                <div className={styles.requirementAttachmentsCol}>
                  <div className={styles.requirementColHeader}>
                    <div className={styles.requirementColHeaderLeft}>
                      <FileText size={13} className={styles.requirementColHeaderFileIcon} aria-hidden="true" />
                      <span className={styles.requirementDeliverablesLabel}>
                        Client Brief Files
                      </span>
                    </div>
                    <span className={styles.requirementColCountBadge}>
                      {requirement.attachments.length} files
                    </span>
                  </div>
                  <div className={styles.proposalAttachmentsList}>
                    {requirement.attachments.map((file) => (
                      <div key={file} className={styles.proposalAttachmentCard}>
                        <div className={styles.proposalAttachmentLeft}>
                          <div className={styles.proposalAttachmentIconWrap}>
                            <FileText size={18} aria-hidden="true" />
                            <span className={styles.proposalAttachmentExtBadge}>PDF</span>
                          </div>
                          <div className={styles.proposalAttachmentInfo}>
                            <div className={styles.proposalAttachmentTitleRow}>
                              <span className={styles.proposalAttachmentName} title={file}>
                                {file}
                              </span>
                              {file.includes("Rev") ? (
                                <span className={styles.proposalAttachmentRevBadge}>
                                  {file.match(/Rev\s*\d+/i)?.[0] ?? "REV"}
                                </span>
                              ) : null}
                            </div>
                            <div className={styles.proposalAttachmentMeta}>
                              <span className={styles.proposalAttachmentTagClient}>Client Brief</span>
                              <span className={styles.proposalAttachmentMetaDot}>·</span>
                              <span>2.4 MB</span>
                              <span className={styles.proposalAttachmentMetaDot}>·</span>
                              <span className={styles.proposalAttachmentVerifiedText}>
                                <ShieldCheck size={11} aria-hidden="true" />
                                Verified
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className={styles.proposalAttachmentActions}>
                          <button
                            type="button"
                            className={styles.proposalAttachmentActionBtnPrimary}
                            onClick={() => handleViewFile(file, `Client Scope Brief for ${requirement.projectName}`, "Client", formatDate(requirement.createdAt), "2.4 MB")}
                            title={`View ${file}`}
                          >
                            <Eye size={12} aria-hidden="true" />
                            <span>View</span>
                          </button>
                          <button
                            type="button"
                            className={styles.proposalAttachmentActionBtn}
                            onClick={() => handleDownloadFile(file)}
                            title={`Download ${file}`}
                          >
                            <Download size={12} aria-hidden="true" />
                            <span>Download</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </section>

          <section className={styles.detailPanel}>
            <h2>Cover note</h2>
            <p>{proposal.coverNote}</p>
          </section>

          <section className={styles.detailPanel}>
            <h2>Scope summary</h2>
            <p>{proposal.scopeSummary}</p>
            <div className={styles.serviceList}>
              <div><h3>Included deliverables</h3><ul className={styles.bulletList}>{proposal.includedDeliverables.map((item) => <li key={item}>{item}</li>)}</ul></div>
              <div><h3>Excluded deliverables</h3><ul className={styles.bulletList}>{proposal.excludedDeliverables.map((item) => <li key={item}>{item}</li>)}</ul></div>
            </div>
          </section>

          <section className={styles.detailPanel}>
            <h2>Milestones</h2>
            {proposal.milestones.map((milestone) => (
              <div className={styles.milestoneRow} key={milestone.id}>
                <span className={styles.primaryCell}><strong>{milestone.title}</strong><span>{milestone.deliverableIds.length} linked deliverable(s)</span></span>
                <span className={styles.numeric}>{formatCurrency(milestone.amount, milestone.currency)}</span>
                <span className={styles.cellMuted}>{formatDate(milestone.dueDate)}</span>
                <BasicsStatusBadge status={milestone.approvalStatus} />
              </div>
            ))}
          </section>
        </div>

        <aside className={styles.detailStack}>
          <section className={styles.detailPanel}>
            <h2>Commercial terms</h2>
            <dl className={styles.detailList}>
              <div><dt>Total fee</dt><dd>{formatCurrency(proposal.fee, proposal.currency)}</dd></div>
              <div><dt>Pricing model</dt><dd>{pricingLabels[proposal.pricingModel]}</dd></div>
              <div><dt>Revisions</dt><dd>{proposal.revisionCount}</dd></div>
              <div><dt>Site visits</dt><dd>{proposal.siteVisitCount}</dd></div>
            </dl>
          </section>

          <section className={styles.detailPanel}>
            <h2>Timeline</h2>
            <dl className={styles.detailList}>
              <div><dt>Start</dt><dd>{formatDate(proposal.estimatedStartDate)}</dd></div>
              <div><dt>Completion</dt><dd>{formatDate(proposal.estimatedCompletionDate)}</dd></div>
              <div><dt>Duration</dt><dd>{proposal.estimatedDurationDays ?? "Not set"} days</dd></div>
            </dl>
          </section>

          <section className={styles.detailPanel}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
              <h2 style={{ margin: 0 }}>Proposal Attachments</h2>
              <span className={styles.badge}>{proposal.attachments.length} files</span>
            </div>
            <p className={styles.deliverablesSubtitle} style={{ marginBottom: "12px" }}>
              Verified technical files and milestone schedules submitted by {provider.name}.
            </p>
            <div className={styles.proposalAttachmentsList}>
              {proposal.attachments.map((attachment) => (
                <div key={attachment} className={styles.proposalAttachmentCard}>
                  <div className={styles.proposalAttachmentLeft}>
                    <div className={styles.proposalAttachmentIconWrap}>
                      <FileText size={18} aria-hidden="true" />
                      <span className={styles.proposalAttachmentExtBadge}>PDF</span>
                    </div>
                    <div className={styles.proposalAttachmentInfo}>
                      <div className={styles.proposalAttachmentTitleRow}>
                        <span className={styles.proposalAttachmentName} title={attachment}>
                          {attachment}
                        </span>
                      </div>
                      <div className={styles.proposalAttachmentMeta}>
                        <span className={styles.proposalAttachmentTagClient}>{provider.name}</span>
                        <span className={styles.proposalAttachmentMetaDot}>·</span>
                        <span>3.8 MB</span>
                        <span className={styles.proposalAttachmentMetaDot}>·</span>
                        <span className={styles.proposalAttachmentVerifiedText}>
                          <ShieldCheck size={11} aria-hidden="true" />
                          Verified
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className={styles.proposalAttachmentActions}>
                    <button
                      type="button"
                      className={styles.proposalAttachmentActionBtnPrimary}
                      onClick={() => handleViewFile(attachment, `Submitted by ${provider.name} for ${requirement.projectName}`, provider.name, formatDate(proposal.submittedAt), "3.8 MB")}
                      title={`View ${attachment}`}
                    >
                      <Eye size={12} aria-hidden="true" />
                      <span>View</span>
                    </button>
                    <button
                      type="button"
                      className={styles.proposalAttachmentActionBtn}
                      onClick={() => handleDownloadFile(attachment)}
                      title={`Download ${attachment}`}
                    >
                      <Download size={12} aria-hidden="true" />
                      <span>Download</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className={`${styles.detailPanel} ${styles.providerDetailPanel}`}>
            <div className={styles.providerDetailHeaderRow}>
              <h2>Provider</h2>
              <span className={styles.providerBadgeVerified}>
                <ShieldCheck size={11} aria-hidden="true" />
                Verified Specialist
              </span>
            </div>
            <div className={styles.providerProfileInfoBlock}>
              <strong className={styles.providerProfileName}>{provider.name}</strong>
              {provider.companyName && provider.companyName !== provider.name ? (
                <span className={styles.providerProfileCompany}>{provider.companyName}</span>
              ) : null}
              <p className={styles.providerProfileHeadline}>{provider.headline}</p>
            </div>
            <div className={styles.cardFooter}>
              <span className={styles.cellMuted}>{provider.location.city}, {provider.location.state}</span>
              <Link className={styles.secondaryButton} href={`/basics/experts/${provider.id}`}>View profile</Link>
            </div>
          </section>
        </aside>
      </div>

      {/* Service Request Updates & Timeline */}
      <section className={styles.detailPanel}>
        <h2>Service Request Updates & Proposal History</h2>
        <p className={styles.deliverablesSubtitle} style={{ marginBottom: "16px" }}>
          Track the lifecycle and status updates of this service request between client and specialist.
        </p>

        <div className={styles.requestUpdatesTimeline}>
          {/* Timeline Step 1: Request Created */}
          <div className={styles.requestTimelineItem}>
            <div className={`${styles.requestTimelineIcon} ${styles.requestTimelineIconDone}`}>
              <CheckCircle2 size={13} aria-hidden="true" />
            </div>
            <div className={styles.requestTimelineContent}>
              <div className={styles.requestTimelineHeadingRow}>
                <span className={styles.requestTimelineTitle}>Service Request Published</span>
                <time className={styles.requestTimelineTime}>{formatDate(requirement.createdAt)}</time>
              </div>
              <p className={styles.requestTimelineDesc}>
                Requirement <strong>&ldquo;{requirement.title}&rdquo;</strong> was published for {requirement.projectName} in {requirement.specialization}.
              </p>
            </div>
          </div>

          {/* Timeline Step 2: Provider Matched & Invited */}
          <div className={styles.requestTimelineItem}>
            <div className={`${styles.requestTimelineIcon} ${styles.requestTimelineIconDone}`}>
              <UsersRound size={13} aria-hidden="true" />
            </div>
            <div className={styles.requestTimelineContent}>
              <div className={styles.requestTimelineHeadingRow}>
                <span className={styles.requestTimelineTitle}>Specialist Provider Invited</span>
                <time className={styles.requestTimelineTime}>{formatDate(proposal.submittedAt)}</time>
              </div>
              <p className={styles.requestTimelineDesc}>
                <strong>{provider.name}</strong> received the service request scope and technical guidelines.
              </p>
            </div>
          </div>

          {/* Timeline Step 3: Proposal Submitted */}
          <div className={styles.requestTimelineItem}>
            <div className={`${styles.requestTimelineIcon} ${styles.requestTimelineIconDone}`}>
              <Send size={13} aria-hidden="true" />
            </div>
            <div className={styles.requestTimelineContent}>
              <div className={styles.requestTimelineHeadingRow}>
                <span className={styles.requestTimelineTitle}>Commercial Proposal & Files Submitted</span>
                <time className={styles.requestTimelineTime}>{formatDate(proposal.submittedAt)}</time>
              </div>
              <p className={styles.requestTimelineDesc}>
                {provider.name} submitted terms with fee of {formatCurrency(proposal.fee, proposal.currency)}, {proposal.milestones.length} milestones, and {proposal.attachments.length} attached document(s).
              </p>
            </div>
          </div>

          {/* Timeline Step 4: Current Status */}
          <div className={styles.requestTimelineItem}>
            <div className={`${styles.requestTimelineIcon} ${styles.requestTimelineIconActive}`}>
              <Clock size={13} aria-hidden="true" />
            </div>
            <div className={styles.requestTimelineContent}>
              <div className={styles.requestTimelineHeadingRow}>
                <span className={styles.requestTimelineTitle}>
                  Current Status: {proposal.status.replaceAll("_", " ").toUpperCase()}
                </span>
                <time className={styles.requestTimelineTime}>{formatDate(proposal.updatedAt)}</time>
              </div>
              <p className={styles.requestTimelineDesc}>
                {proposal.status === "submitted"
                  ? "Proposal is under review by the project team. You may Shortlist, Request Clarification, or Accept."
                  : proposal.status === "shortlisted"
                  ? "Proposal is shortlisted for final contractor and specialist selection."
                  : proposal.status === "clarification_requested"
                  ? "Clarification requested from provider. Awaiting updated response."
                  : proposal.status === "negotiating"
                  ? "Commercial terms and delivery scope are currently under active negotiation."
                  : proposal.status === "accepted"
                  ? "Proposal accepted! Engagement active with milestone escrow governance."
                  : "Proposal has concluded."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {activePreviewFile ? (
        <ProposalDocumentViewerModal
          isOpen={Boolean(activePreviewFile)}
          onClose={() => setActivePreviewFile(null)}
          fileName={activePreviewFile.fileName}
          contextTitle={activePreviewFile.contextTitle}
          projectContext={requirement.projectName ?? "Nila Residence"}
          submittedBy={activePreviewFile.submittedBy}
          submittedAt={activePreviewFile.submittedAt}
          fileSize={activePreviewFile.fileSize}
        />
      ) : null}

      {isChatOpen ? (
        <EngagementChatModal
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          engagement={{ projectName: requirement.projectName ?? "Project" }}
          provider={provider}
        />
      ) : null}
    </div>
  );
}
