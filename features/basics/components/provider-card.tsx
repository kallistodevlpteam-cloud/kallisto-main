import {
  Bookmark,
  Check,
  Columns3,
  Send,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { BasicsProvider } from "../types/basics.types";
import { formatCurrency, pricingLabels } from "../utils/basics-formatters";
import {
  ProviderAvailabilityBadge,
  ProviderEvidence,
  ProviderVerificationBadge,
} from "./basics-shared";
import styles from "./basics-workspace.module.css";

function initials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();
}

export function ProviderCard({
  provider,
  projectId,
  discovery = false,
  selected = false,
  saved = false,
  compareDisabled = false,
  onToggleCompare,
  onToggleSave,
}: {
  provider: BasicsProvider;
  projectId?: string;
  discovery?: boolean;
  selected?: boolean;
  saved?: boolean;
  compareDisabled?: boolean;
  onToggleCompare?: (providerId: string) => void;
  onToggleSave?: (providerId: string) => void;
}) {
  const profileHref = `/basics/experts/${provider.id}${
    projectId ? `?projectId=${encodeURIComponent(projectId)}` : ""
  }`;
  const inviteParams = new URLSearchParams({ providerId: provider.id });
  if (projectId) inviteParams.set("projectId", projectId);

  return (
    <article className={styles.providerCard}>
      <div className={styles.providerIdentity}>
        <span className={styles.avatar} aria-hidden="true">
          {initials(provider.name)}
        </span>
        <div className={styles.identityCopy}>
          <h3>{provider.name}</h3>
          <p>{provider.companyName ?? "Independent specialist"}</p>
          {provider.verified ? (
            <ProviderVerificationBadge level={provider.verificationLevel} />
          ) : null}
        </div>
        {discovery && onToggleSave ? (
          <button
            type="button"
            className={styles.iconButton}
            aria-label={saved ? `Remove ${provider.name} from saved experts` : `Save ${provider.name}`}
            aria-pressed={saved}
            onClick={() => onToggleSave(provider.id)}
          >
            {saved ? <Check size={14} aria-hidden="true" /> : <Bookmark size={14} aria-hidden="true" />}
          </button>
        ) : (
          <ProviderAvailabilityBadge availability={provider.availability} />
        )}
      </div>

      <p className={styles.providerHeadline}>{provider.headline}</p>

      <ProviderEvidence
        location={`${provider.location.city}, ${provider.location.state}`}
        rating={provider.rating}
        reviewCount={provider.reviewCount}
        experience={provider.yearsOfExperience}
        completed={provider.completedEngagements}
      />

      <div className={styles.tagRow} aria-label="Provider capabilities">
        {provider.projectTypes.slice(0, 2).map((projectType) => (
          <span key={projectType} className={styles.tag}>
            {projectType}
          </span>
        ))}
        {provider.softwareSkills.slice(0, 2).map((software) => (
          <span key={software} className={styles.tag}>
            {software}
          </span>
        ))}
      </div>

      {discovery ? (
        <div className={styles.portfolioStrip} aria-label="Portfolio preview">
          {provider.portfolio.slice(0, 3).map((item) => (
            <span className={styles.portfolioThumb} key={item.id}>
              <Image
                src={item.imageUrls[0]}
                alt={`${item.title} portfolio preview`}
                fill
                sizes="100px"
              />
            </span>
          ))}
        </div>
      ) : null}

      <div className={styles.cardFooter}>
        <span className={styles.pricing}>
          <span>{pricingLabels[provider.pricing.model]}</span>
          <strong>
            {provider.pricing.startingFrom
              ? `From ${formatCurrency(provider.pricing.startingFrom, provider.pricing.currency)}`
              : "Request quote"}
          </strong>
        </span>
        <div className={styles.cardActions}>
          {discovery && onToggleCompare ? (
            <button
              type="button"
              className={styles.selectAction}
              aria-pressed={selected}
              disabled={compareDisabled && !selected}
              onClick={() => onToggleCompare(provider.id)}
            >
              <Columns3 size={12} aria-hidden="true" />
              {selected ? "Selected" : "Compare"}
            </button>
          ) : null}
          <Link className={styles.secondaryButton} href={profileHref}>
            View profile
          </Link>
          <Link
            className={styles.primaryButton}
            href={`/basics/requirements/new?${inviteParams.toString()}`}
          >
            <Send size={13} aria-hidden="true" />
            Invite
          </Link>
        </div>
      </div>
    </article>
  );
}

