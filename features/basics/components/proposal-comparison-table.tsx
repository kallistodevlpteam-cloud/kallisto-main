"use client";

import Link from "next/link";
import { useState } from "react";
import { basicsProposalRepository } from "../repositories/basics-repositories";
import { acceptProposalAndCreateEngagement } from "../services/basics-domain-service";
import type {
  BasicsProposal,
  BasicsProvider,
  BasicsRequirement,
} from "../types/basics.types";
import { formatCurrency, formatDate, pricingLabels, verificationLabels } from "../utils/basics-formatters";
import styles from "./basics-workspace.module.css";

export function ProposalComparisonTable({
  proposals,
  providers,
  requirement,
  onEngagementCreated,
}: {
  proposals: BasicsProposal[];
  providers: BasicsProvider[];
  requirement: BasicsRequirement;
  onEngagementCreated: (engagementId: string) => void;
}) {
  const [items, setItems] = useState(proposals);
  const [notice, setNotice] = useState("");
  const [workingId, setWorkingId] = useState("");
  const lowestFee = Math.min(...items.map((proposal) => proposal.fee));
  const earliestCompletion = [...items]
    .map((proposal) => proposal.estimatedCompletionDate)
    .filter((value): value is string => Boolean(value))
    .sort()[0];
  const providerFor = (proposal: BasicsProposal) =>
    providers.find((provider) => provider.id === proposal.providerId);
  const highestRating = Math.max(
    ...items.map((proposal) => providerFor(proposal)?.rating ?? 0),
  );
  const mostExperience = Math.max(
    ...items.map((proposal) => providerFor(proposal)?.yearsOfExperience ?? 0),
  );

  async function updateStatus(
    proposal: BasicsProposal,
    status: BasicsProposal["status"],
  ) {
    setWorkingId(proposal.id);
    try {
      const updated = await basicsProposalRepository.updateProposalStatus(
        proposal.id,
        status,
      );
      setItems((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      );
      setNotice(`Proposal status changed to ${status.replaceAll("_", " ")}.`);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Proposal status could not be updated.");
    } finally {
      setWorkingId("");
    }
  }

  async function award(proposal: BasicsProposal) {
    if (
      !window.confirm(
        `Award ${providerFor(proposal)?.name ?? "this provider"} the engagement for ${formatCurrency(proposal.fee, proposal.currency)}? Scope and milestones will be copied from this proposal.`,
      )
    ) return;
    setWorkingId(proposal.id);
    try {
      const engagement = await acceptProposalAndCreateEngagement(proposal.id);
      onEngagementCreated(engagement.id);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "The proposal could not be accepted.");
      setWorkingId("");
    }
  }

  return (
    <section className={styles.section} aria-labelledby="proposal-comparison-title">
      <div className={styles.sectionHeader}>
        <div>
          <h2 id="proposal-comparison-title">Proposal comparison</h2>
          <p>Highlighted evidence supports a decision; no provider is ranked automatically.</p>
        </div>
      </div>
      {notice ? <div className={styles.notice} role="status">{notice}</div> : null}
      <div className={styles.comparisonPanel}>
        <table className={styles.comparisonTable}>
          <tbody>
            {[
              ["Provider", (proposal: BasicsProposal) => providerFor(proposal)?.name ?? "Provider"],
              ["Verification", (proposal: BasicsProposal) => {
                const provider = providerFor(proposal);
                return provider ? verificationLabels[provider.verificationLevel] : "Unavailable";
              }],
              ["Rating", (proposal: BasicsProposal) => (providerFor(proposal)?.rating ?? 0).toFixed(1)],
              ["Relevant experience", (proposal: BasicsProposal) => `${providerFor(proposal)?.yearsOfExperience ?? 0} years`],
              ["Total fee", (proposal: BasicsProposal) => formatCurrency(proposal.fee, proposal.currency)],
              ["Pricing model", (proposal: BasicsProposal) => pricingLabels[proposal.pricingModel]],
              ["Start date", (proposal: BasicsProposal) => formatDate(proposal.estimatedStartDate)],
              ["Completion date", (proposal: BasicsProposal) => formatDate(proposal.estimatedCompletionDate)],
              ["Duration", (proposal: BasicsProposal) => `${proposal.estimatedDurationDays ?? 0} days`],
              ["Deliverables", (proposal: BasicsProposal) => proposal.includedDeliverables.join(", ")],
              ["Missing deliverables", (proposal: BasicsProposal) => requirement.deliverables.filter((deliverable) => !proposal.includedDeliverables.includes(deliverable)).join(", ") || "None"],
              ["Exclusions", (proposal: BasicsProposal) => proposal.excludedDeliverables.join(", ") || "None"],
              ["Revisions", (proposal: BasicsProposal) => String(proposal.revisionCount)],
              ["Site visits", (proposal: BasicsProposal) => String(proposal.siteVisitCount)],
              ["Milestones", (proposal: BasicsProposal) => `${proposal.milestones.length} commercial milestones`],
              ["Availability", (proposal: BasicsProposal) => providerFor(proposal)?.availability.replaceAll("_", " ") ?? "Unavailable"],
            ].map(([label, getter]) => (
              <tr key={String(label)}>
                <th scope="row">{String(label)}</th>
                {items.map((proposal) => {
                  const provider = providerFor(proposal);
                  const value = (getter as (proposal: BasicsProposal) => string)(proposal);
                  const highlighted =
                    (label === "Total fee" && proposal.fee === lowestFee) ||
                    (label === "Completion date" && proposal.estimatedCompletionDate === earliestCompletion) ||
                    (label === "Rating" && provider?.rating === highestRating) ||
                    (label === "Relevant experience" && provider?.yearsOfExperience === mostExperience);
                  const warning =
                    (label === "Missing deliverables" && value !== "None") ||
                    (label === "Exclusions" && value !== "None");
                  return (
                    <td
                      key={proposal.id}
                      className={
                        highlighted
                          ? styles.highlight
                          : warning
                            ? styles.warningText
                            : undefined
                      }
                    >
                      {value}
                    </td>
                  );
                })}
              </tr>
            ))}
            <tr>
              <th scope="row">Actions</th>
              {items.map((proposal) => (
                <td key={proposal.id}>
                  <div className={styles.detailStack}>
                    <Link className={styles.secondaryButton} href={`/basics/proposals/${proposal.id}`}>View proposal</Link>
                    <button type="button" className={styles.secondaryButton} disabled={workingId === proposal.id || ["accepted", "rejected", "withdrawn"].includes(proposal.status)} onClick={() => void updateStatus(proposal, "clarification_requested")}>Clarify</button>
                    <button type="button" className={styles.secondaryButton} disabled={workingId === proposal.id || ["accepted", "rejected", "withdrawn"].includes(proposal.status)} onClick={() => void updateStatus(proposal, "negotiating")}>Negotiate</button>
                    <button type="button" className={styles.primaryButton} disabled={workingId === proposal.id || ["rejected", "withdrawn"].includes(proposal.status)} onClick={() => void award(proposal)}>Award engagement</button>
                  </div>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}

