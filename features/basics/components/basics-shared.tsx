import {
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  Building2,
  CalendarClock,
  CircleDollarSign,
  Clock3,
  FileQuestion,
  MapPin,
  RefreshCw,
  ShieldAlert,
  Star,
  WifiOff,
} from "lucide-react";
import Link from "next/link";
import type {
  BasicsAvailability,
  BasicsEngagementStatus,
  BasicsProposalStatus,
  BasicsRequirementStatus,
  BasicsVerificationLevel,
} from "../types/basics.types";
import {
  availabilityLabels,
  formatCurrency,
  pricingLabels,
  titleCase,
  verificationLabels,
} from "../utils/basics-formatters";
import styles from "./basics-workspace.module.css";

export function BasicsPageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description: string;
  actions?: React.ReactNode;
}) {
  return (
    <header className={styles.pageHeader}>
      <div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {actions ? <div className={styles.headerActions}>{actions}</div> : null}
    </header>
  );
}

export function ProviderVerificationBadge({
  level,
}: {
  level: BasicsVerificationLevel;
}) {
  return (
    <span className={styles.verifiedLabel}>
      <BadgeCheck size={11} aria-hidden="true" />
      {verificationLabels[level]}
    </span>
  );
}

export function ProviderAvailabilityBadge({
  availability,
}: {
  availability: BasicsAvailability;
}) {
  return (
    <span
      className={`${styles.availabilityBadge} ${
        availability === "limited" || availability === "unavailable"
          ? styles.availabilityLimited
          : ""
      }`}
    >
      {availabilityLabels[availability]}
    </span>
  );
}

type Status =
  | BasicsRequirementStatus
  | BasicsProposalStatus
  | BasicsEngagementStatus
  | "submitted"
  | "under_review"
  | "approved"
  | "not_due"
  | "due"
  | "processing"
  | "paid"
  | "on_hold"
  | "not_started"
  | "partially_paid"
  | "payment_due"
  | "in_progress"
  | "not_required"
  | "pending";

const SUCCESS_STATUSES: Status[] = ["awarded", "accepted", "completed", "approved", "paid"];
const INFO_STATUSES: Status[] = ["open", "viewed", "shortlisted", "active", "submitted", "under_review", "processing"];
const WARNING_STATUSES: Status[] = ["reviewing", "clarification_requested", "negotiating", "awaiting_review", "revision_requested", "due", "pending"];
const DANGER_STATUSES: Status[] = ["cancelled", "rejected", "withdrawn", "disputed", "on_hold"];

export function BasicsStatusBadge({
  status,
  label,
}: {
  status: Status;
  label?: string;
}) {
  const tone = SUCCESS_STATUSES.includes(status)
    ? styles.statusSuccess
    : INFO_STATUSES.includes(status)
      ? styles.statusInfo
      : WARNING_STATUSES.includes(status)
        ? styles.statusWarning
        : DANGER_STATUSES.includes(status)
          ? styles.statusDanger
          : styles.statusNeutral;
  return (
    <span className={`${styles.statusBadge} ${tone}`}>
      {label ?? titleCase(status)}
    </span>
  );
}

export function BasicsEmptyState({
  title,
  description,
  actionLabel,
  href,
}: {
  title: string;
  description: string;
  actionLabel: string;
  href: string;
}) {
  return (
    <section className={styles.emptyState}>
      <span className={styles.stateIcon}>
        <FileQuestion size={21} aria-hidden="true" />
      </span>
      <h2>{title}</h2>
      <p>{description}</p>
      <Link href={href} className={styles.primaryButton}>
        {actionLabel}
        <ArrowRight size={13} aria-hidden="true" />
      </Link>
    </section>
  );
}

export function BasicsStateView({
  state,
  title,
  description,
  retryHref = "/basics",
}: {
  state: "error" | "offline" | "forbidden";
  title: string;
  description: string;
  retryHref?: string;
}) {
  const Icon =
    state === "offline"
      ? WifiOff
      : state === "forbidden"
        ? ShieldAlert
        : AlertTriangle;
  return (
    <section className={styles.stateView}>
      <span className={styles.stateIcon}>
        <Icon size={21} aria-hidden="true" />
      </span>
      <h2>{title}</h2>
      <p>{description}</p>
      {state !== "forbidden" ? (
        <Link href={retryHref} className={styles.secondaryButton}>
          <RefreshCw size={13} aria-hidden="true" />
          Try again
        </Link>
      ) : null}
    </section>
  );
}

export function BasicsLoadingSkeleton({ label = "Loading Basics" }: { label?: string }) {
  return (
    <div className={styles.skeletonStack} aria-label={label}>
      <span className={styles.skeletonTitle} />
      <span className={styles.skeletonLine} />
      <div className={styles.skeletonGrid}>
        {[0, 1, 2].map((item) => (
          <span key={item} className={styles.skeletonCard} />
        ))}
      </div>
    </div>
  );
}

export function ProviderEvidence({
  location,
  rating,
  reviewCount,
  experience,
  completed,
}: {
  location: string;
  rating: number;
  reviewCount: number;
  experience: number;
  completed: number;
}) {
  return (
    <div className={styles.providerMeta}>
      <span className={styles.metaItem}>
        <MapPin size={12} aria-hidden="true" />
        <strong>{location}</strong>
      </span>
      <span className={styles.metaItem}>
        <Star size={12} aria-hidden="true" />
        <strong>{rating.toFixed(1)} ({reviewCount})</strong>
      </span>
      <span className={styles.metaItem}>
        <Clock3 size={12} aria-hidden="true" />
        <strong>{experience} years</strong>
      </span>
      <span className={styles.metaItem}>
        <BriefcaseBusiness size={12} aria-hidden="true" />
        <strong>{completed} completed</strong>
      </span>
    </div>
  );
}

export function CommercialSummary({
  amount,
  currency,
  pricingModel,
}: {
  amount?: number;
  currency: string;
  pricingModel: keyof typeof pricingLabels;
}) {
  return (
    <span className={styles.pricing}>
      <span>{pricingLabels[pricingModel]}</span>
      <strong>
        {amount ? `From ${formatCurrency(amount, currency)}` : "Request quote"}
      </strong>
    </span>
  );
}

export const BASICS_META_ICONS = {
  project: Building2,
  date: CalendarClock,
  commercial: CircleDollarSign,
};
