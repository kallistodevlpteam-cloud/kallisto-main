"use client";

import { ArrowRight, Inbox, Send } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  basicsProposalRepository,
  basicsProviderRepository,
  basicsRequirementRepository,
} from "../repositories/basics-repositories";
import type {
  BasicsProposal,
  BasicsProposalStatus,
  BasicsProvider,
  BasicsRequirement,
} from "../types/basics.types";
import { formatCurrency, formatDate } from "../utils/basics-formatters";
import {
  BasicsEmptyState,
  BasicsLoadingSkeleton,
  BasicsStateView,
  BasicsStatusBadge,
} from "./basics-shared";
import styles from "./basics-workspace.module.css";

const STATUS_FILTERS: { label: string; value?: BasicsProposalStatus }[] = [
  { label: "All" },
  { label: "Draft", value: "draft" },
  { label: "Submitted", value: "submitted" },
  { label: "Viewed", value: "viewed" },
  { label: "Shortlisted", value: "shortlisted" },
  { label: "Clarification requested", value: "clarification_requested" },
  { label: "Negotiating", value: "negotiating" },
  { label: "Accepted", value: "accepted" },
  { label: "Rejected", value: "rejected" },
  { label: "Withdrawn", value: "withdrawn" },
];

export function ProposalsList() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const view = searchParams.get("view") === "submitted" ? "submitted" : "received";
  const status = (searchParams.get("status") as BasicsProposalStatus | null) ?? undefined;
  const requirementId = searchParams.get("requirementId") ?? undefined;
  const [proposals, setProposals] = useState<BasicsProposal[]>([]);
  const [providers, setProviders] = useState<BasicsProvider[]>([]);
  const [requirements, setRequirements] = useState<BasicsRequirement[]>([]);
  const [loadState, setLoadState] = useState<"loading" | "success" | "error" | "offline">("loading");

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      basicsProposalRepository.listProposals({ view, status, requirementId }),
      basicsProviderRepository.listProviders(),
      basicsRequirementRepository.listRequirements(),
    ]).then(
      ([proposalItems, providerItems, requirementItems]) => {
        if (cancelled) return;
        setProposals(proposalItems);
        setProviders(providerItems);
        setRequirements(requirementItems);
        setLoadState("success");
      },
      () => {
        if (!cancelled) {
          setLoadState(typeof navigator !== "undefined" && !navigator.onLine ? "offline" : "error");
        }
      },
    );
    return () => {
      cancelled = true;
    };
  }, [requirementId, status, view]);

  function updateParams(updates: Record<string, string | undefined>) {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });
    router.push(`/basics/proposals?${params.toString()}`);
  }

  if (loadState === "loading") return <BasicsLoadingSkeleton label="Loading proposals" />;
  if (loadState === "error") return <BasicsStateView state="error" title="Proposals could not be loaded" description="The proposal repository returned an unexpected error." retryHref="/basics/proposals" />;
  if (loadState === "offline") return <BasicsStateView state="offline" title="You appear to be offline" description="Reconnect to load proposal status and commercial terms." retryHref="/basics/proposals" />;

  return (
    <>
      <div className={styles.statusTabs} aria-label="Proposal ownership">
        <button type="button" className={`${styles.filterChip} ${view === "received" ? styles.filterChipActive : ""}`} aria-pressed={view === "received"} onClick={() => updateParams({ view: "received" })}>
          <Inbox size={13} aria-hidden="true" /> Received
        </button>
        <button type="button" className={`${styles.filterChip} ${view === "submitted" ? styles.filterChipActive : ""}`} aria-pressed={view === "submitted"} onClick={() => updateParams({ view: "submitted" })}>
          <Send size={13} aria-hidden="true" /> Submitted
        </button>
      </div>
      <div className={styles.filterChips} aria-label="Proposal status filters">
        {STATUS_FILTERS.map((filter) => (
          <button key={filter.label} type="button" className={`${styles.filterChip} ${status === filter.value ? styles.filterChipActive : ""}`} aria-pressed={status === filter.value} onClick={() => updateParams({ status: filter.value })}>
            {filter.label}
          </button>
        ))}
      </div>

      {proposals.length === 0 ? (
        <BasicsEmptyState
          title={`No ${view} proposals in this view`}
          description={view === "received" ? "Post a requirement or clear the current status filter." : "Find an open requirement before preparing a provider proposal."}
          actionLabel={view === "received" ? "Post a requirement" : "Find requirements"}
          href={view === "received" ? "/basics/requirements/new" : "/basics/requirements?status=open"}
        />
      ) : (
        <>
          <div className={`${styles.tableCard} ${styles.desktopTable}`}>
            <div className={`${styles.tableHeader} ${styles.proposalsColumns}`}>
              <span>{view === "received" ? "Provider" : "Requirement"}</span><span>Requirement</span><span>Fee</span><span>Timeline</span><span>Status</span><span />
            </div>
            {proposals.map((proposal) => {
              const provider = providers.find((item) => item.id === proposal.providerId);
              const requirement = requirements.find((item) => item.id === proposal.requirementId);
              return (
                <div className={`${styles.tableRow} ${styles.proposalsColumns}`} key={proposal.id}>
                  <span className={styles.primaryCell}><strong>{view === "received" ? provider?.name ?? "Provider" : requirement?.title ?? "Requirement"}</strong><span>{view === "received" ? provider?.headline : requirement?.projectName ?? "No project"}</span></span>
                  <span className={styles.primaryCell}><strong>{requirement?.title ?? "Requirement"}</strong><span>{requirement?.projectName ?? "No project"}</span></span>
                  <span className={styles.numeric}>{formatCurrency(proposal.fee, proposal.currency)}</span>
                  <span className={styles.cellMuted}>{formatDate(proposal.estimatedStartDate)} to {formatDate(proposal.estimatedCompletionDate)}</span>
                  <span><BasicsStatusBadge status={proposal.status} /></span>
                  <Link className={styles.secondaryButton} href={`/basics/proposals/${proposal.id}`}>View</Link>
                </div>
              );
            })}
          </div>
          <div className={styles.mobileOnly}>
            {proposals.map((proposal) => {
              const provider = providers.find((item) => item.id === proposal.providerId);
              const requirement = requirements.find((item) => item.id === proposal.requirementId);
              return (
                <article className={styles.mobileDataCard} key={proposal.id}>
                  <div className={styles.sectionHeader}><div><strong className={styles.cardTitle}>{provider?.name ?? "Provider"}</strong><p>{requirement?.title}</p></div><BasicsStatusBadge status={proposal.status} /></div>
                  <dl className={styles.detailList}>
                    <div><dt>Project</dt><dd>{requirement?.projectName ?? "No project"}</dd></div>
                    <div><dt>Fee</dt><dd>{formatCurrency(proposal.fee, proposal.currency)}</dd></div>
                    <div><dt>Completion</dt><dd>{formatDate(proposal.estimatedCompletionDate)}</dd></div>
                  </dl>
                  <div className={styles.cardFooter}><span /><Link className={styles.secondaryButton} href={`/basics/proposals/${proposal.id}`}>Open <ArrowRight size={12} aria-hidden="true" /></Link></div>
                </article>
              );
            })}
          </div>
        </>
      )}
    </>
  );
}

