"use client";

import {
  Activity,
  ArrowUpRight,
  CalendarDays,
  CircleDollarSign,
  FileClock,
  FileText,
  FolderOpen,
  MessageSquareText,
  MoreHorizontal,
  RotateCcw,
  Sparkles,
  Upload,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  basicsEngagementRepository,
  basicsProviderRepository,
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
} from "../types/basics.types";
import { formatCurrency, formatDate } from "../utils/basics-formatters";
import {
  BasicsLoadingSkeleton,
  BasicsPageHeader,
  BasicsStateView,
  BasicsStatusBadge,
} from "./basics-shared";
import styles from "./basics-workspace.module.css";

type EngagementTab =
  | "overview"
  | "deliverables"
  | "milestones"
  | "files"
  | "activity"
  | "commercials";

const TABS: { id: EngagementTab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "deliverables", label: "Deliverables" },
  { id: "milestones", label: "Milestones" },
  { id: "files", label: "Files" },
  { id: "activity", label: "Activity" },
  { id: "commercials", label: "Commercials" },
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

  useEffect(() => {
    if (loadState === "forbidden") return;
    let cancelled = false;
    void basicsEngagementRepository.getEngagement(engagementId).then(
      async (engagementResult) => {
        if (cancelled || !engagementResult) {
          if (!cancelled) setLoadState("error");
          return;
        }
        const providerResult = await basicsProviderRepository.getProvider(
          engagementResult.providerId,
        );
        if (cancelled || !providerResult) {
          if (!cancelled) setLoadState("error");
          return;
        }
        setEngagement(engagementResult);
        setProvider(providerResult);
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

  const paidAmount = useMemo(
    () =>
      engagement?.milestones
        .filter((milestone) => milestone.paymentStatus === "paid")
        .reduce((sum, milestone) => sum + milestone.amount, 0) ?? 0,
    [engagement],
  );
  const dueAmount = useMemo(
    () =>
      engagement?.milestones
        .filter((milestone) => milestone.paymentStatus === "due")
        .reduce((sum, milestone) => sum + milestone.amount, 0) ?? 0,
    [engagement],
  );

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

  async function approve(deliverable: BasicsDeliverable) {
    setWorking(true);
    try {
      const approved = approveDeliverable(deliverable, "Arjun Mehta");
      const updated = await basicsEngagementRepository.updateDeliverable(
        currentEngagement.id,
        approved,
      );
      setEngagement(updated);
      setNotice(`${deliverable.name} version ${approved.versions.at(-1)?.version} was approved.`);
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

  return (
    <div className={styles.page}>
      <BasicsPageHeader
        title={engagement.title}
        description={`${provider.name} · ${engagement.projectName}`}
        actions={
          <>
            <Link className={styles.secondaryButton} href={`/tools?tool=messages&engagementId=${engagement.id}`}>
              <MessageSquareText size={13} aria-hidden="true" /> Message
            </Link>
            <button type="button" className={styles.secondaryButton} onClick={() => goToTab("deliverables", { upload: "true" })}>
              <Upload size={13} aria-hidden="true" /> Upload deliverable
            </button>
            <button type="button" className={styles.secondaryButton} disabled={working} onClick={() => void updateEngagementStatus("awaiting_review")}>
              Request review
            </button>
            <button type="button" className={styles.secondaryButton} disabled={working} onClick={() => void updateEngagementStatus("revision_requested")}>
              Request revision
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

      {tab === "overview" ? (
        <div className={styles.detailGrid}>
          <div className={styles.detailStack}>
            <section className={styles.detailPanel}>
              <h2>Scope</h2>
              <ul className={styles.bulletList}>{engagement.scope.map((item) => <li key={item}>{item}</li>)}</ul>
            </section>
            <section className={styles.detailPanel}>
              <h2>Exclusions and revision limits</h2>
              <dl className={styles.detailList}>
                <div><dt>Exclusions</dt><dd>{engagement.exclusions.join(", ") || "None recorded"}</dd></div>
                <div><dt>Revision limit</dt><dd>{engagement.revisionLimit ?? "Not set"}</dd></div>
                <div><dt>Revisions used</dt><dd>{engagement.revisionsUsed ?? 0}</dd></div>
              </dl>
            </section>
            <section className={styles.detailPanel}>
              <h2>Project connections</h2>
              <div className={styles.serviceList}>
                <Link className={styles.serviceCard} href={`/projects/${engagement.projectId}`}><FolderOpen size={16} aria-hidden="true" /><h3>Project</h3><p>Open {engagement.projectName}.</p></Link>
                <Link className={styles.serviceCard} href={`/calendar?engagementId=${engagement.id}`}><CalendarDays size={16} aria-hidden="true" /><h3>Calendar</h3><p>Review deliverable and milestone dates.</p></Link>
                <Link className={styles.serviceCard} href={`/documents?engagementId=${engagement.id}`}><FileText size={16} aria-hidden="true" /><h3>Documents</h3><p>Reference approved engagement outputs.</p></Link>
                <Link className={styles.serviceCard} href={`/studio?engagementId=${engagement.id}`}><Sparkles size={16} aria-hidden="true" /><h3>Hive Studio</h3><p>Reference relevant production outputs.</p></Link>
              </div>
            </section>
          </div>
          <aside className={styles.detailStack}>
            <section className={styles.detailPanel}>
              <h2>Schedule</h2>
              <dl className={styles.detailList}>
                <div><dt>Start date</dt><dd>{formatDate(engagement.startDate)}</dd></div>
                <div><dt>Expected completion</dt><dd>{formatDate(engagement.expectedCompletionDate)}</dd></div>
              </dl>
            </section>
            <section className={styles.detailPanel}>
              <h2>Provider and client</h2>
              <dl className={styles.detailList}>
                <div><dt>Provider</dt><dd>{provider.name}</dd></div>
                <div><dt>Client</dt><dd>Arjun Architects</dd></div>
                <div><dt>Project</dt><dd>{engagement.projectName}</dd></div>
              </dl>
              <div className={styles.cardFooter}>
                <Link className={styles.secondaryButton} href={`/basics/experts/${provider.id}`}>View provider</Link>
                <Link className={styles.secondaryButton} href={`/basics/requirements/${engagement.requirementId}`}>View requirement</Link>
              </div>
            </section>
          </aside>
        </div>
      ) : null}

      {tab === "deliverables" ? (
        <section className={styles.detailPanel}>
          <div className={styles.sectionHeader}><div><h2>Deliverables</h2><p>Approved versions remain immutable. Later changes create a new version.</p></div></div>
          {searchParams.get("upload") === "true" ? (
            <div className={styles.wizardPanel}>
              <div className={styles.formGrid}>
                <label className={styles.field}><span>Deliverable</span><select className={styles.select} value={uploadDeliverableId} onChange={(event) => setUploadDeliverableId(event.target.value)}>{engagement.deliverables.map((deliverable) => <option key={deliverable.id} value={deliverable.id}>{deliverable.name}</option>)}</select></label>
                <label className={styles.field}><span>File</span><input className={styles.input} type="file" onChange={(event) => setUploadFileName(event.target.files?.[0]?.name ?? "")} /></label>
              </div>
              <div className={styles.wizardFooter}><button type="button" className={styles.tertiaryButton} onClick={() => goToTab("deliverables")}>Cancel</button><button type="button" className={styles.primaryButton} disabled={working || !uploadFileName} onClick={() => void uploadRevision()}><Upload size={13} aria-hidden="true" /> Submit version</button></div>
            </div>
          ) : null}
          {engagement.deliverables.map((deliverable) => {
            const latest = deliverable.versions.at(-1);
            return (
              <div key={deliverable.id}>
                <div className={styles.deliverableRow}>
                  <span className={styles.primaryCell}><strong>{deliverable.name}</strong><span>{deliverable.description} · owner {deliverable.owner}</span></span>
                  <span className={styles.cellMuted}>Due {formatDate(deliverable.dueDate)} · v{latest?.version ?? 0}</span>
                  <BasicsStatusBadge status={deliverable.status} />
                  <span className={styles.inlineActions}>
                    {["submitted", "under_review"].includes(deliverable.status) ? <button type="button" className={styles.tertiaryButton} disabled={working} onClick={() => void approve(deliverable)}>Approve</button> : null}
                    {latest && latest.status !== "approved" ? <button type="button" className={styles.tertiaryButton} onClick={() => setRevisionTargetId(deliverable.id)}><RotateCcw size={12} aria-hidden="true" /> Revise</button> : null}
                  </span>
                </div>
                {revisionTargetId === deliverable.id ? (
                  <div className={styles.formGrid}>
                    <label className={`${styles.field} ${styles.fieldWide}`}><span>Revision comments</span><textarea className={styles.textarea} value={revisionComments} onChange={(event) => setRevisionComments(event.target.value)} /></label>
                    <div className={`${styles.inlineActions} ${styles.fieldWide}`}><button type="button" className={styles.tertiaryButton} onClick={() => setRevisionTargetId("")}>Cancel</button><button type="button" className={styles.secondaryButton} disabled={!revisionComments.trim() || working} onClick={() => void requestRevision(deliverable)}>Request revision</button></div>
                  </div>
                ) : null}
              </div>
            );
          })}
        </section>
      ) : null}

      {tab === "milestones" ? (
        <section className={styles.detailPanel}>
          <h2>Milestones</h2>
          {engagement.milestones.map((milestone) => (
            <div className={styles.milestoneRow} key={milestone.id}>
              <span className={styles.primaryCell}><strong>{milestone.title}</strong><span>{milestone.deliverableIds.length} linked deliverable(s)</span></span>
              <span className={styles.numeric}>{formatCurrency(milestone.amount, milestone.currency)}</span>
              <span className={styles.cellMuted}>{formatDate(milestone.dueDate)}</span>
              <span className={styles.inlineActions}><BasicsStatusBadge status={milestone.completionStatus} /><BasicsStatusBadge status={milestone.approvalStatus} /><BasicsStatusBadge status={milestone.paymentStatus} /></span>
            </div>
          ))}
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

      {tab === "commercials" ? (
        <section className={styles.detailPanel}>
          <div className={styles.sectionHeader}><div><h2>Commercials</h2><p>Payment display is informational and requires evidence from the approved payment system.</p></div><Link className={styles.secondaryButton} href={`/payments?engagementId=${engagement.id}`}>Payments <ArrowUpRight size={12} aria-hidden="true" /></Link></div>
          <div className={styles.commercialGrid}>
            <div className={styles.commercialMetric}><span>Agreed fee</span><strong>{formatCurrency(engagement.agreedFee, engagement.currency)}</strong></div>
            <div className={styles.commercialMetric}><span>Evidence-backed paid amount</span><strong>{formatCurrency(paidAmount, engagement.currency)}</strong></div>
            <div className={styles.commercialMetric}><span>Payment due</span><strong>{formatCurrency(dueAmount, engagement.currency)}</strong></div>
            <div className={styles.commercialMetric}><span>Pending amount</span><strong>{formatCurrency(Math.max(engagement.agreedFee - paidAmount, 0), engagement.currency)}</strong></div>
          </div>
          <div className={styles.notice}>
            <CircleDollarSign size={15} aria-hidden="true" />
            Status is not proof of settlement. Paid milestones must include a valid payment evidence reference.
          </div>
          {engagement.milestones.map((milestone) => (
            <div className={styles.milestoneRow} key={milestone.id}>
              <span className={styles.primaryCell}><strong>{milestone.title}</strong><span>{milestone.paymentEvidenceReference ?? "No payment evidence reference"}</span></span>
              <span className={styles.numeric}>{formatCurrency(milestone.amount, milestone.currency)}</span>
              <span className={styles.cellMuted}>{formatDate(milestone.dueDate)}</span>
              <BasicsStatusBadge status={milestone.paymentStatus} />
            </div>
          ))}
        </section>
      ) : null}
    </div>
  );
}
