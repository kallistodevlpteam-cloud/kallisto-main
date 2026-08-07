import {
  BadgeCheck,
  BriefcaseBusiness,
  Clock3,
  Languages,
  MapPin,
  MessageSquareText,
  MonitorCog,
  Send,
  Star,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { basicsProviderRepository } from "../repositories/basics-repositories";
import { getCategoryLabel } from "../constants/service-catalogue";
import { formatCurrency, formatDate, pricingLabels } from "../utils/basics-formatters";
import {
  BasicsStateView,
  ProviderAvailabilityBadge,
  ProviderVerificationBadge,
} from "./basics-shared";
import { SaveProviderButton } from "./save-provider-button";
import styles from "./basics-workspace.module.css";

type ProfileTab = "overview" | "services" | "portfolio" | "experience" | "reviews";

const PROFILE_TABS: { id: ProfileTab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "services", label: "Services" },
  { id: "portfolio", label: "Portfolio" },
  { id: "experience", label: "Experience" },
  { id: "reviews", label: "Reviews" },
];

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();
}

export async function ProviderProfile({
  providerId,
  tab = "overview",
  projectId,
}: {
  providerId: string;
  tab?: ProfileTab;
  projectId?: string;
}) {
  const provider = await basicsProviderRepository.getProvider(providerId);

  if (!provider) {
    return (
      <BasicsStateView
        state="error"
        title="Provider profile is unavailable"
        description="The provider may no longer be listed, or the marketplace profile could not be loaded."
        retryHref="/basics/experts"
      />
    );
  }

  const inviteParams = new URLSearchParams({ providerId: provider.id });
  if (projectId) inviteParams.set("projectId", projectId);

  return (
    <div className={styles.page}>
      <section className={styles.profileHeader}>
        <span className={styles.profileAvatar} aria-hidden="true">
          {getInitials(provider.name)}
        </span>
        <div className={styles.profileIdentity}>
          <h1>{provider.name}</h1>
          <p>
            {provider.headline} · {getCategoryLabel(provider.primaryCategory)}
          </p>
          <div className={styles.inlineActions}>
            <ProviderVerificationBadge level={provider.verificationLevel} />
            <ProviderAvailabilityBadge availability={provider.availability} />
          </div>
          <div className={styles.profileStats}>
            <span className={styles.profileStat}>
              <MapPin size={12} aria-hidden="true" />
              <strong>{provider.location.city}, {provider.location.state}</strong>
            </span>
            <span className={styles.profileStat}>
              <Star size={12} aria-hidden="true" />
              <strong>{provider.rating.toFixed(1)}</strong> ({provider.reviewCount} reviews)
            </span>
            <span className={styles.profileStat}>
              <BriefcaseBusiness size={12} aria-hidden="true" />
              <strong>{provider.completedEngagements}</strong> engagements
            </span>
            <span className={styles.profileStat}>
              <Clock3 size={12} aria-hidden="true" />
              responds in {provider.responseTimeHours ?? 24} hours
            </span>
          </div>
        </div>
        <div className={styles.detailActions}>
          <SaveProviderButton providerId={provider.id} />
          <Link
            className={styles.secondaryButton}
            href={`/tools?tool=messages&providerId=${encodeURIComponent(provider.id)}`}
          >
            <MessageSquareText size={13} aria-hidden="true" />
            Message
          </Link>
          <Link
            className={styles.secondaryButton}
            href={`/basics/requirements/new?${inviteParams.toString()}&intent=proposal`}
          >
            Request proposal
          </Link>
          <Link
            className={styles.primaryButton}
            href={`/basics/requirements/new?${inviteParams.toString()}`}
          >
            <Send size={13} aria-hidden="true" />
            Invite to project
          </Link>
        </div>
      </section>

      <nav className={styles.profileTabs} aria-label="Provider profile">
        {PROFILE_TABS.map((profileTab) => {
          const params = new URLSearchParams({ tab: profileTab.id });
          if (projectId) params.set("projectId", projectId);
          return (
            <Link
              key={profileTab.id}
              href={`/basics/experts/${provider.id}?${params.toString()}`}
              className={`${styles.profileTab} ${
                tab === profileTab.id ? styles.profileTabActive : ""
              }`}
              aria-current={tab === profileTab.id ? "page" : undefined}
            >
              {profileTab.label}
            </Link>
          );
        })}
      </nav>

      {tab === "overview" ? (
        <div className={styles.detailGrid}>
          <div className={styles.detailStack}>
            <section className={styles.detailPanel}>
              <h2>Professional summary</h2>
              <p>{provider.bio}</p>
            </section>
            <section className={styles.detailPanel}>
              <h2>Expertise and project fit</h2>
              <dl className={styles.detailList}>
                <div>
                  <dt>Primary expertise</dt>
                  <dd>{provider.specializations.join(", ")}</dd>
                </div>
                <div>
                  <dt>Project types</dt>
                  <dd>{provider.projectTypes.join(", ")}</dd>
                </div>
                <div>
                  <dt>Locations served</dt>
                  <dd>
                    {provider.location.city}, {provider.location.state}; remote across India
                  </dd>
                </div>
                <div>
                  <dt>Engagement modes</dt>
                  <dd>
                    {provider.remoteAvailable ? "Remote" : ""}
                    {provider.remoteAvailable && provider.onsiteAvailable ? " and " : ""}
                    {provider.onsiteAvailable ? "On-site" : ""}
                  </dd>
                </div>
              </dl>
            </section>
          </div>
          <aside className={styles.detailStack}>
            <section className={styles.detailPanel}>
              <h2>Technical capabilities</h2>
              <dl className={styles.detailList}>
                <div>
                  <dt><MonitorCog size={13} aria-hidden="true" /> Software</dt>
                  <dd>{provider.softwareSkills.join(", ")}</dd>
                </div>
                <div>
                  <dt><BadgeCheck size={13} aria-hidden="true" /> Codes</dt>
                  <dd>{provider.codeKnowledge.join(", ")}</dd>
                </div>
                <div>
                  <dt><Languages size={13} aria-hidden="true" /> Languages</dt>
                  <dd>{provider.languages.join(", ")}</dd>
                </div>
              </dl>
            </section>
            <section className={styles.detailPanel}>
              <h2>Commercial indication</h2>
              <dl className={styles.detailList}>
                <div>
                  <dt>Pricing model</dt>
                  <dd>{pricingLabels[provider.pricing.model]}</dd>
                </div>
                <div>
                  <dt>Starting from</dt>
                  <dd>
                    {provider.pricing.startingFrom
                      ? formatCurrency(provider.pricing.startingFrom, provider.pricing.currency)
                      : "Request quote"}
                  </dd>
                </div>
              </dl>
            </section>
          </aside>
        </div>
      ) : null}

      {tab === "services" ? (
        <section className={styles.serviceList}>
          {provider.services.map((service) => (
            <article className={styles.serviceCard} key={service.id}>
              <h3>{service.title}</h3>
              <p>{service.description}</p>
              <ul className={styles.bulletList}>
                {service.deliverables.map((deliverable) => (
                  <li key={deliverable}>{deliverable}</li>
                ))}
              </ul>
              <div className={styles.cardFooter}>
                <span className={styles.pricing}>
                  <span>{pricingLabels[service.pricingModel]}</span>
                  <strong>
                    {service.startingPrice
                      ? `${formatCurrency(service.startingPrice, provider.pricing.currency)} · ${service.estimatedDuration}`
                      : "Request quote"}
                  </strong>
                </span>
                <Link
                  className={styles.primaryButton}
                  href={`/basics/requirements/new?${inviteParams.toString()}&serviceId=${service.id}`}
                >
                  Request proposal
                </Link>
              </div>
            </article>
          ))}
        </section>
      ) : null}

      {tab === "portfolio" ? (
        <section className={styles.portfolioGrid}>
          {provider.portfolio.map((item) => (
            <article className={styles.portfolioCard} key={item.id}>
              <div className={styles.portfolioImage}>
                <Image
                  src={item.imageUrls[0]}
                  alt={`${item.title}, ${item.location}`}
                  width={640}
                  height={360}
                />
              </div>
              <h3>{item.title}</h3>
              <p>{item.projectType} · {item.location} · {item.projectScale}</p>
              <dl className={styles.detailList}>
                <div><dt>Scope</dt><dd>{item.scope}</dd></div>
                <div><dt>Contribution</dt><dd>{item.contribution}</dd></div>
                <div><dt>Completed</dt><dd>{item.completionYear}</dd></div>
              </dl>
            </article>
          ))}
        </section>
      ) : null}

      {tab === "experience" ? (
        <div className={styles.detailGrid}>
          <section className={styles.detailPanel}>
            <h2>Qualifications and credentials</h2>
            <div className={styles.detailList}>
              {provider.credentials.map((credential) => (
                <div key={credential.id}>
                  <dt>{credential.kind.replaceAll("_", " ")}</dt>
                  <dd>
                    {credential.title}, {credential.issuer}
                    {credential.issuedYear ? ` (${credential.issuedYear})` : ""}
                    {credential.verified ? " · Verified" : ""}
                  </dd>
                </div>
              ))}
            </div>
          </section>
          <section className={styles.detailPanel}>
            <h2>Practice experience</h2>
            <dl className={styles.detailList}>
              <div><dt>Years of experience</dt><dd>{provider.yearsOfExperience}</dd></div>
              <div><dt>Completed engagements</dt><dd>{provider.completedEngagements}</dd></div>
              <div><dt>Software</dt><dd>{provider.softwareSkills.join(", ")}</dd></div>
              <div><dt>Codes and standards</dt><dd>{provider.codeKnowledge.join(", ")}</dd></div>
            </dl>
          </section>
        </div>
      ) : null}

      {tab === "reviews" ? (
        <section className={styles.detailStack}>
          {provider.reviews.map((review) => (
            <article className={styles.detailPanel} key={review.id}>
              <div className={styles.sectionHeader}>
                <div>
                  <h2>{review.reviewerName}</h2>
                  <p>{review.projectName} · {review.service}</p>
                </div>
                <span className={styles.inlineActions}>
                  <span className={styles.verifiedLabel}>
                    <BadgeCheck size={11} aria-hidden="true" />
                    Verified engagement
                  </span>
                  <strong>{review.rating.toFixed(1)} / 5</strong>
                </span>
              </div>
              <p>{review.review}</p>
              <span className={styles.cellMuted}>
                Completed {formatDate(review.completionDate)}
              </span>
            </article>
          ))}
        </section>
      ) : null}
    </div>
  );
}

