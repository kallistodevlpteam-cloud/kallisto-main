"use client";

import {
  ArrowRight,
  CheckCircle2,
  FileText,
  MessageSquareText,
  Pencil,
  RotateCcw,
  Send,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  basicsEngagementRepository,
  basicsProposalRepository,
  basicsProviderRepository,
  basicsRequirementRepository,
} from "../repositories/basics-repositories";
import { acceptProposalAndCreateEngagement, canEditProposal } from "../services/basics-domain-service";
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
  const currentProvider = provider;

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

  async function accept() {
    if (!window.confirm(`Accept ${currentProvider.name}'s proposal for ${formatCurrency(currentProposal.fee, currentProposal.currency)} and create an engagement?`)) return;
    setWorking(true);
    try {
      const engagement = await acceptProposalAndCreateEngagement(currentProposal.id);
      router.push(`/basics/engagements/${engagement.id}?created=true`);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "The proposal could not be accepted.");
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
              <button type="button" className={styles.secondaryButton} disabled={working || ["accepted", "rejected", "withdrawn"].includes(proposal.status)} onClick={() => void changeStatus("shortlisted")}>Shortlist</button>
              <button type="button" className={styles.secondaryButton} disabled={working || ["accepted", "rejected", "withdrawn"].includes(proposal.status)} onClick={() => void changeStatus("clarification_requested")}>Request clarification</button>
              <button type="button" className={styles.secondaryButton} disabled={working || ["accepted", "rejected", "withdrawn"].includes(proposal.status)} onClick={() => void changeStatus("negotiating")}>Start negotiation</button>
              <button type="button" className={styles.dangerButton} disabled={working || ["accepted", "rejected", "withdrawn"].includes(proposal.status)} onClick={() => void changeStatus("rejected", `Reject ${provider.name}'s proposal?`)}>Reject</button>
              <button type="button" className={styles.primaryButton} disabled={working || ["rejected", "withdrawn"].includes(proposal.status)} onClick={() => void accept()}>Accept proposal</button>
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
            <h2>Attachments</h2>
            <div className={styles.detailList}>
              {proposal.attachments.map((attachment) => <div key={attachment}><dt><FileText size={13} aria-hidden="true" /> Proposal file</dt><dd>{attachment}</dd></div>)}
            </div>
          </section>
          <section className={styles.detailPanel}>
            <h2>Provider</h2>
            <p>{provider.headline}</p>
            <div className={styles.cardFooter}><span className={styles.cellMuted}>{provider.location.city}, {provider.location.state}</span><Link className={styles.secondaryButton} href={`/basics/experts/${provider.id}`}>View profile</Link></div>
          </section>
        </aside>
      </div>

      <section className={styles.detailPanel}>
        <h2>Activity and communication</h2>
        <div className={styles.activityRow}><span className={styles.activityIcon}><Send size={13} aria-hidden="true" /></span><span className={styles.activityCopy}><strong>Proposal submitted</strong><span>{provider.name} submitted scope and commercial terms.</span></span><time className={styles.activityTime}>{formatDate(proposal.submittedAt)}</time></div>
        <div className={styles.activityRow}><span className={styles.activityIcon}><MessageSquareText size={13} aria-hidden="true" /></span><span className={styles.activityCopy}><strong>Current status: {proposal.status.replaceAll("_", " ")}</strong><span>Use proposal actions to continue the documented workflow.</span></span><time className={styles.activityTime}>{formatDate(proposal.updatedAt)}</time></div>
      </section>
    </div>
  );
}
