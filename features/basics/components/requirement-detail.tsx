"use client";

import {
  ArrowRight,
  Bookmark,
  Check,
  CheckSquare,
  FileText,
  MapPin,
  Pencil,
  Search,
  Send,
  Share2,
  Sparkles,
  Star,
  UsersRound,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  basicsProposalRepository,
  basicsProviderRepository,
  basicsRequirementRepository,
} from "../repositories/basics-repositories";
import { matchProvidersToRequirement } from "../lib/basics-search-matcher";
import type {
  BasicsProposal,
  BasicsProvider,
  BasicsRequirement,
} from "../types/basics.types";
import { formatCurrency, formatDate, titleCase } from "../utils/basics-formatters";
import {
  BasicsLoadingSkeleton,
  BasicsPageHeader,
  BasicsStateView,
  BasicsStatusBadge,
  ProviderVerificationBadge,
} from "./basics-shared";
import { ProposalComparisonTable } from "./proposal-comparison-table";
import styles from "./basics-workspace.module.css";

const PIPELINE = [
  ["Received", ["submitted"]],
  ["Viewed", ["viewed"]],
  ["Shortlisted", ["shortlisted"]],
  ["Clarification", ["clarification_requested"]],
  ["Negotiating", ["negotiating"]],
  ["Accepted", ["accepted"]],
  ["Rejected", ["rejected", "withdrawn"]],
] as const;

export function RequirementDetail({
  requirementId,
}: {
  requirementId: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const forcedState = searchParams.get("state");
  const [requirement, setRequirement] = useState<BasicsRequirement | null>(null);
  const [proposals, setProposals] = useState<BasicsProposal[]>([]);
  const [providers, setProviders] = useState<BasicsProvider[]>([]);
  const [selectedProposalIds, setSelectedProposalIds] = useState<string[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [matchedTab, setMatchedTab] = useState<"all" | "saved">("all");
  const [loadState, setLoadState] = useState<"loading" | "success" | "error" | "offline" | "forbidden">(
    forcedState === "forbidden" ? "forbidden" : "loading",
  );
  const [notice, setNotice] = useState(() => {
    if (searchParams.get("findMatches") === "true") {
      return "Requirement published successfully! Verified specialist profiles matching your request are displayed below.";
    }
    return searchParams.get("saved") ? "Requirement saved successfully." : "";
  });

  const matchedProviders = useMemo(() => {
    if (!requirement || !providers.length) return [];
    return matchProvidersToRequirement(
      {
        category: requirement.category,
        specialization: requirement.specialization,
        location: requirement.location,
        projectType: requirement.projectType,
      },
      providers,
    );
  }, [requirement, providers]);

  const savedMatchedProviders = useMemo(() => {
    return matchedProviders.filter(({ provider }) => savedIds.includes(provider.id));
  }, [matchedProviders, savedIds]);

  const displayedMatched =
    matchedTab === "saved" ? savedMatchedProviders : matchedProviders;

  async function inviteProvider(providerId: string) {
    if (!requirement) return;
    if (requirement.invitedProviderIds.includes(providerId)) return;
    const updatedIds = [...requirement.invitedProviderIds, providerId];
    try {
      const updated = await basicsRequirementRepository.updateRequirement(requirement.id, {
        invitedProviderIds: updatedIds,
      });
      setRequirement(updated);
      const invited = providers.find((p) => p.id === providerId);
      setNotice(
        invited
          ? `Invited ${invited.name} to submit a proposal for this requirement.`
          : "Provider invited successfully.",
      );
    } catch {
      setNotice("Could not send invite. Please try again.");
    }
  }

  useEffect(() => {
    if (forcedState === "forbidden") return;
    let cancelled = false;
    Promise.all([
      basicsRequirementRepository.getRequirement(requirementId),
      basicsProposalRepository.listProposals({ requirementId }),
      basicsProviderRepository.listProviders(),
      basicsProviderRepository.getSavedProviderIds(),
    ]).then(
      ([requirementResult, proposalResult, providerResult, savedResult]) => {
        if (cancelled) return;
        if (!requirementResult) {
          setLoadState("error");
          return;
        }
        setRequirement(requirementResult);
        setProposals(proposalResult);
        setProviders(providerResult);
        setSavedIds(savedResult);
        setLoadState("success");
      },
      () => {
        if (!cancelled) {
          setLoadState(
            typeof navigator !== "undefined" && !navigator.onLine
              ? "offline"
              : "error",
          );
        }
      },
    );
    return () => {
      cancelled = true;
    };
  }, [forcedState, requirementId]);

  if (loadState === "loading") {
    return <BasicsLoadingSkeleton label="Loading requirement" />;
  }
  if (loadState === "forbidden") {
    return <BasicsStateView state="forbidden" title="Requirement access is restricted" description="Only the requirement owner and explicitly authorised providers can view this private scope." />;
  }
  if (loadState === "offline") {
    return <BasicsStateView state="offline" title="You appear to be offline" description="Reconnect to load the current requirement and proposal pipeline." retryHref={`/basics/requirements/${requirementId}`} />;
  }
  if (loadState === "error" || !requirement) {
    return <BasicsStateView state="error" title="Requirement is unavailable" description="The requirement could not be found or loaded from the repository." retryHref="/basics/requirements" />;
  }

  const selectedProposals = proposals.filter((proposal) =>
    selectedProposalIds.includes(proposal.id),
  );
  const invitedProviders = providers.filter((provider) =>
    requirement.invitedProviderIds.includes(provider.id),
  );

  async function share() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setNotice("A shareable link was copied.");
    } catch {
      setNotice("Copy the current browser URL to share this requirement.");
    }
  }

  async function closeRequirement() {
    if (!requirement) return;
    if (
      !window.confirm(
        `Close "${requirement.title}"? Existing proposals and activity will be retained.`,
      )
    ) return;
    const updated = await basicsRequirementRepository.updateRequirement(
      requirement.id,
      { status: "closed" },
    );
    setRequirement(updated);
    setNotice("Requirement closed. Proposal history was retained.");
  }

  return (
    <div className={styles.page}>
      <BasicsPageHeader
        title={requirement.title}
        description={`${requirement.projectName ?? "No project"} · ${requirement.specialization}`}
        actions={
          <>
            <Link className={styles.secondaryButton} href={`/basics/requirements/new?edit=${requirement.id}`}>
              <Pencil size={13} aria-hidden="true" /> Edit
            </Link>
            <button type="button" className={styles.secondaryButton} onClick={() => void share()}>
              <Share2 size={13} aria-hidden="true" /> Share
            </button>
            <Link className={styles.secondaryButton} href={`/basics/experts?requirementId=${requirement.id}`}>
              <UsersRound size={13} aria-hidden="true" /> Invite providers
            </Link>
            <Link className={styles.primaryButton} href={`/basics/proposals?view=received&requirementId=${requirement.id}`}>
              View proposals
            </Link>
          </>
        }
      />

      {notice ? (
        <div className={`${styles.notice} ${styles.noticeSuccess}`} role="status">
          {notice}
          <button type="button" className={styles.tertiaryButton} onClick={() => setNotice("")}>Dismiss</button>
        </div>
      ) : null}

      <div className={styles.inlineActions}>
        <BasicsStatusBadge status={requirement.status} />
        <span className={styles.badge}>{requirement.visibility.replaceAll("_", " ")}</span>
        {requirement.status !== "closed" && requirement.status !== "awarded" ? (
          <button type="button" className={styles.tertiaryButton} onClick={() => void closeRequirement()}>
            <XCircle size={13} aria-hidden="true" /> Close requirement
          </button>
        ) : null}
      </div>

      {matchedProviders.length > 0 ? (
        <section className={styles.matchedSection} aria-labelledby="matched-specialists-title">
          <div className={styles.matchedSectionHeader}>
            <div className={styles.matchedSectionTitleGroup}>
              <h2 id="matched-specialists-title">
                <Sparkles size={16} style={{ color: "#2563eb" }} aria-hidden="true" />
                Matched Specialists in Basics
                <span className={styles.matchedSectionBadge}>{matchedProviders.length} Matched</span>
              </h2>
              <p>
                Verified professionals matching {requirement.specialization}
                {requirement.location ? ` in ${requirement.location}` : ""} with verified credentials.
              </p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
              {savedMatchedProviders.length > 0 ? (
                <div className={styles.wizardMatchTabs}>
                  <button
                    type="button"
                    className={`${styles.wizardMatchTabBtn} ${matchedTab === "all" ? styles.wizardMatchTabBtnActive : ""}`}
                    onClick={() => setMatchedTab("all")}
                  >
                    All ({matchedProviders.length})
                  </button>
                  <button
                    type="button"
                    className={`${styles.wizardMatchTabBtn} ${matchedTab === "saved" ? styles.wizardMatchTabBtnActive : ""}`}
                    onClick={() => setMatchedTab("saved")}
                  >
                    <Bookmark size={11} fill="currentColor" aria-hidden="true" />
                    Saved Profiles ({savedMatchedProviders.length})
                  </button>
                </div>
              ) : null}
              <Link
                href={`/basics/experts?requirementId=${requirement.id}&category=${requirement.category}`}
                className={styles.secondaryButton}
              >
                <Search size={13} aria-hidden="true" />
                Explore all in Expert Directory
                <ArrowRight size={13} aria-hidden="true" />
              </Link>
            </div>
          </div>

          <div className={styles.matchedGrid}>
            {displayedMatched.slice(0, 6).map(({ provider, matchScore, matchReasons }) => {
              const isInvited = requirement.invitedProviderIds.includes(provider.id);
              const isSaved = savedIds.includes(provider.id);
              return (
                <div className={styles.matchedCard} key={provider.id}>
                  <div className={styles.matchedCardHeader}>
                    <div className={styles.matchedProviderTitle}>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <h3 className={styles.matchedProviderName}>
                            <Link
                              href={`/basics/experts/${provider.id}?requirementId=${requirement.id}`}
                              style={{ textDecoration: "none", color: "inherit" }}
                            >
                              {provider.name}
                            </Link>
                          </h3>
                          {isSaved ? (
                            <span className={styles.wizardSavedTag} title="In your saved profiles">
                              <Bookmark size={10} fill="currentColor" aria-hidden="true" />
                              Saved
                            </span>
                          ) : null}
                        </div>
                        <p className={styles.matchedProviderSub}>
                          {provider.specializations[0] || provider.headline}
                        </p>
                      </div>
                    </div>
                    <span className={styles.matchedScoreBadge}>{matchScore}% match</span>
                  </div>

                  <div className={styles.matchedReasonsList}>
                    {matchReasons.map((reason) => (
                      <span key={reason} className={styles.matchedReasonTag}>
                        {reason}
                      </span>
                    ))}
                  </div>

                  <div className={styles.matchedMetaRow}>
                    <span className={styles.matchedRating}>
                      <Star size={11} fill="#eab308" style={{ color: "#eab308" }} aria-hidden="true" />
                      {provider.rating.toFixed(1)}
                    </span>
                    <span>·</span>
                    <span>{provider.yearsOfExperience} yrs exp</span>
                    <span>·</span>
                    <span title={provider.location.city}>
                      <MapPin size={10} aria-hidden="true" /> {provider.location.city}
                    </span>
                  </div>

                  <div className={styles.matchedActionsRow}>
                    <button
                      type="button"
                      className={isInvited ? styles.invitedButton : styles.inviteButton}
                      disabled={isInvited}
                      onClick={() => void inviteProvider(provider.id)}
                    >
                      {isInvited ? (
                        <>
                          <Check size={12} aria-hidden="true" />
                          Invited
                        </>
                      ) : (
                        <>
                          <Send size={12} aria-hidden="true" />
                          Invite to Requirement
                        </>
                      )}
                    </button>
                    <Link
                      href={`/basics/experts/${provider.id}?requirementId=${requirement.id}`}
                      className={styles.secondaryButton}
                      style={{ height: "30px", fontSize: "11.5px", padding: "0 10px" }}
                    >
                      Profile
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ) : null}

      <section className={styles.section} aria-labelledby="proposal-pipeline-title">
        <div className={styles.sectionHeader}>
          <div><h2 id="proposal-pipeline-title">Proposal pipeline</h2><p>Current state of all responses to this requirement.</p></div>
        </div>
        <div className={styles.pipeline}>
          {PIPELINE.map(([label, statuses]) => (
            <div className={styles.pipelineItem} key={label}>
              <strong>{proposals.filter((proposal) => (statuses as readonly string[]).includes(proposal.status)).length}</strong>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </section>

      <div className={styles.detailGrid}>
        <div className={styles.detailStack}>
          <section className={styles.detailPanel}>
            <h2>Requirement summary</h2>
            <p>{requirement.description}</p>
            <dl className={styles.detailList}>
              <div><dt>Category</dt><dd>{titleCase(requirement.category)}</dd></div>
              <div><dt>Specialization</dt><dd>{requirement.specialization}</dd></div>
              <div><dt>Engagement mode</dt><dd>{titleCase(requirement.engagementMode)}</dd></div>
              <div><dt>Created</dt><dd>{formatDate(requirement.createdAt)}</dd></div>
            </dl>
          </section>
          <section className={styles.detailPanel}>
            <h2>Scope and deliverables</h2>
            <ul className={styles.bulletList}>
              {requirement.deliverables.map((deliverable) => <li key={deliverable}>{deliverable}</li>)}
            </ul>
          </section>
          <section className={styles.detailPanel}>
            <h2>Attachments</h2>
            {requirement.attachments.length > 0 ? (
              <div className={styles.detailList}>
                {requirement.attachments.map((attachment) => (
                  <div key={attachment}><dt><FileText size={13} aria-hidden="true" /> Project document</dt><dd>{attachment}</dd></div>
                ))}
              </div>
            ) : <p>No attachments were added to this requirement.</p>}
          </section>
        </div>
        <aside className={styles.detailStack}>
          <section className={styles.detailPanel}>
            <h2>Project information</h2>
            <dl className={styles.detailList}>
              <div><dt>Project</dt><dd>{requirement.projectName ?? "Not bound"}</dd></div>
              <div><dt>Type</dt><dd>{requirement.projectType ?? "Not set"}</dd></div>
              <div><dt>Location</dt><dd>{requirement.location ?? "Not set"}</dd></div>
              <div><dt>Built-up area</dt><dd>{requirement.builtUpArea ? `${requirement.builtUpArea.toLocaleString("en-IN")} sq ft` : "Not set"}</dd></div>
              <div><dt>Floors</dt><dd>{requirement.numberOfFloors ?? "Not set"}</dd></div>
              <div><dt>Stage</dt><dd>{requirement.projectStage ?? "Not set"}</dd></div>
            </dl>
          </section>
          <section className={styles.detailPanel}>
            <h2>Budget and timeline</h2>
            <dl className={styles.detailList}>
              <div><dt>Budget</dt><dd>{requirement.budgetMin ? `${formatCurrency(requirement.budgetMin, requirement.currency)} to ${formatCurrency(requirement.budgetMax ?? requirement.budgetMin, requirement.currency)}` : "Request quote"}</dd></div>
              <div><dt>Start</dt><dd>{formatDate(requirement.expectedStartDate)}</dd></div>
              <div><dt>Completion</dt><dd>{formatDate(requirement.expectedCompletionDate)}</dd></div>
              <div><dt>Proposal deadline</dt><dd>{formatDate(requirement.closesAt)}</dd></div>
            </dl>
          </section>
          <section className={styles.detailPanel}>
            <h2>Invited providers</h2>
            {invitedProviders.length > 0 ? invitedProviders.map((provider) => (
              <div className={styles.cardFooter} key={provider.id}>
                <span className={styles.primaryCell}><strong>{provider.name}</strong><span>{provider.headline}</span></span>
                <ProviderVerificationBadge level={provider.verificationLevel} />
              </div>
            )) : <p>No providers have been invited directly.</p>}
          </section>
        </aside>
      </div>

      <section className={styles.detailPanel}>
        <div className={styles.sectionHeader}>
          <div><h2>Proposal summary</h2><p>Select up to three proposals for evidence-based comparison.</p></div>
          {proposals.length > 1 ? (
            <button type="button" className={styles.secondaryButton} onClick={() => setSelectedProposalIds(proposals.slice(0, 3).map((proposal) => proposal.id))}>
              Compare first {Math.min(3, proposals.length)}
            </button>
          ) : null}
        </div>
        {proposals.length > 0 ? proposals.map((proposal) => {
          const provider = providers.find((item) => item.id === proposal.providerId);
          const selected = selectedProposalIds.includes(proposal.id);
          return (
            <div className={styles.deliverableRow} key={proposal.id}>
              <label className={styles.checkRow}>
                <input
                  type="checkbox"
                  checked={selected}
                  disabled={!selected && selectedProposalIds.length >= 3}
                  onChange={(event) => setSelectedProposalIds((current) => event.target.checked ? [...current, proposal.id] : current.filter((id) => id !== proposal.id))}
                />
                <span className={styles.primaryCell}><strong>{provider?.name ?? "Provider"}</strong><span>{provider?.headline}</span></span>
              </label>
              <span><BasicsStatusBadge status={proposal.status} /></span>
              <span className={styles.numeric}>{formatCurrency(proposal.fee, proposal.currency)}</span>
              <Link className={styles.secondaryButton} href={`/basics/proposals/${proposal.id}`}>View</Link>
            </div>
          );
        }) : <p>No proposals have been received yet.</p>}
      </section>

      {selectedProposals.length > 1 ? (
        <ProposalComparisonTable
          proposals={selectedProposals}
          providers={providers}
          requirement={requirement}
          onEngagementCreated={(engagementId) => router.push(`/basics/engagements/${engagementId}?created=true`)}
        />
      ) : null}

      <section className={styles.detailPanel}>
        <h2>Activity</h2>
        <div className={styles.activityRow}>
          <span className={styles.activityIcon}><Send size={13} aria-hidden="true" /></span>
          <span className={styles.activityCopy}><strong>Requirement published</strong><span>{requirement.visibility.replaceAll("_", " ")} · {requirement.ownerId}</span></span>
          <time className={styles.activityTime}>{formatDate(requirement.createdAt)}</time>
        </div>
        {requirement.invitedProviderIds.length > 0 ? (
          <div className={styles.activityRow}>
            <span className={styles.activityIcon}><UsersRound size={13} aria-hidden="true" /></span>
            <span className={styles.activityCopy}><strong>Providers invited</strong><span>{requirement.invitedProviderIds.length} specialist provider(s)</span></span>
            <time className={styles.activityTime}>{formatDate(requirement.updatedAt)}</time>
          </div>
        ) : null}
        {proposals.length > 0 ? (
          <div className={styles.activityRow}>
            <span className={styles.activityIcon}><CheckSquare size={13} aria-hidden="true" /></span>
            <span className={styles.activityCopy}><strong>Proposal activity recorded</strong><span>{proposals.length} current proposal(s)</span></span>
            <time className={styles.activityTime}>{formatDate(proposals[0].updatedAt)}</time>
          </div>
        ) : null}
      </section>
    </div>
  );
}
