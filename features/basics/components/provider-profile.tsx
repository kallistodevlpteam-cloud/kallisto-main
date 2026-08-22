import {
  ArrowRight,
  BadgeCheck,
  Check,
  Languages,
  MessageSquareText,
  MonitorCog,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
  BriefcaseDuotoneIcon,
  ClockDuotoneIcon,
  DeveloperDuotoneIcon,
  MapPinDuotoneIcon,
  ShieldDuotoneIcon,
  StarDuotoneIcon,
} from "@/components/layout/sidebar-icons";
import { basicsProviderRepository } from "../repositories/basics-repositories";
import { getCategoryLabel } from "../constants/service-catalogue";
import { formatCurrency, formatDate, pricingLabels } from "../utils/basics-formatters";
import {
  BasicsStateView,
  ProviderAvailabilityBadge,
  ProviderVerificationBadge,
} from "./basics-shared";
import { SaveProviderButton } from "./save-provider-button";
import { ProviderOrderPanel } from "./provider-order-panel";
import { ProviderLogoTile } from "./provider-logo-tile";
import styles from "./basics-workspace.module.css";

type ProfileTab = "services" | "overview" | "experience" | "reviews";

const PROFILE_TABS: { id: ProfileTab; label: string }[] = [
  { id: "services", label: "Services" },
  { id: "overview", label: "Overview" },
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
  tab = "services",
  projectId,
  serviceId,
}: {
  providerId: string;
  tab?: ProfileTab;
  projectId?: string;
  serviceId?: string;
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
      <div className={styles.profileTwoColumnLayout}>
        {/* LEFT SECTION: REVIEW THE PROVIDER */}
        <main className={styles.profileReviewSection}>
          <section className={styles.referenceHero}>
            <div className={styles.referenceHeroTop}>
              <div className={styles.profileBrandTileWrapper}>
                <ProviderLogoTile name={provider.name} />
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
              </div>
            </div>

            <h1 className={styles.referenceHeroTitle}>
              {provider.providerType === "company" ? "Hi, we’re" : "Hi, I’m"} {provider.name} —{" "}
              {provider.providerType === "company"
                ? `we specialize in ${provider.specializations[0] ?? provider.headline}`
                : `I’m a ${provider.specializations[0] ?? "Specialist"}`}{" "}
              in {getCategoryLabel(provider.primaryCategory)}.{" "}
              <span className={styles.referenceHeroMuted}>
                Based in {provider.location.city}, {provider.location.state}.
              </span>
            </h1>

            <p className={styles.referenceHeroBio}>{provider.bio}</p>

            <div className={styles.heroBadgesRow}>
              <ProviderVerificationBadge level={provider.verificationLevel} />
              <ProviderAvailabilityBadge availability={provider.availability} />
            </div>

            <div className={styles.profileStats}>
              <span className={styles.profileStat}>
                <MapPinDuotoneIcon size={14} aria-hidden="true" />
                <strong>{provider.location.city}, {provider.location.state}</strong>
              </span>
              <span className={styles.profileStat}>
                <StarDuotoneIcon size={14} aria-hidden="true" />
                <strong>{provider.rating.toFixed(1)}</strong> ({provider.reviewCount} reviews)
              </span>
              <span className={styles.profileStat}>
                <BriefcaseDuotoneIcon size={14} aria-hidden="true" />
                <strong>{provider.completedEngagements}</strong> engagements
              </span>
              <span className={styles.profileStat}>
                <ClockDuotoneIcon size={14} aria-hidden="true" />
                responds in {provider.responseTimeHours ?? 24} hours
              </span>
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
            <div className={styles.detailStack}>
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

              <div className={styles.detailSubGrid}>
                <section className={styles.detailPanel}>
                  <h2>Technical capabilities</h2>
                  <dl className={styles.detailList}>
                    <div>
                      <dt><DeveloperDuotoneIcon size={14} aria-hidden="true" /> Software</dt>
                      <dd>{provider.softwareSkills.join(", ")}</dd>
                    </div>
                    <div>
                      <dt><ShieldDuotoneIcon size={14} aria-hidden="true" /> Codes</dt>
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
              </div>
            </div>
          ) : null}

          {tab === "services" ? (
            <section className={styles.serviceList}>
              {provider.services.map((service, index) => {
                const isSelected = serviceId
                  ? service.id === serviceId
                  : index === 0;

                const selectParams = new URLSearchParams({
                  tab: "services",
                  serviceId: service.id,
                });
                if (projectId) selectParams.set("projectId", projectId);

                return (
                  <article
                    className={`${styles.serviceCard} ${
                      isSelected ? styles.serviceCardSelected : ""
                    }`}
                    key={service.id}
                  >
                    <div className={styles.serviceCardHeader}>
                      <h3 className={styles.servicePackageTitle}>
                        {service.title}
                      </h3>
                      <p className={styles.servicePackageDesc}>
                        {service.description}
                      </p>
                    </div>

                    <ul className={styles.serviceCheckList}>
                      {service.deliverables.map((deliverable) => (
                        <li key={deliverable} className={styles.serviceCheckItem}>
                          <Check
                            size={14}
                            className={styles.serviceCheckIcon}
                            aria-hidden="true"
                          />
                          <span>{deliverable}</span>
                        </li>
                      ))}
                    </ul>

                    <div className={styles.servicePricingGroup}>
                      <div className={styles.servicePriceBlock}>
                        <span className={styles.servicePriceVal}>
                          {service.startingPrice
                            ? formatCurrency(
                                service.startingPrice,
                                provider.pricing.currency
                              )
                            : "Custom quote"}
                        </span>
                        <span className={styles.serviceTimelineRevisions}>
                          {service.estimatedDuration ?? "4–7 working days"} · 2 revisions
                        </span>
                      </div>

                      <Link
                        className={
                          isSelected
                            ? styles.serviceSelectBtnActive
                            : styles.serviceSelectBtn
                        }
                        href={`/basics/experts/${provider.id}?${selectParams.toString()}`}
                      >
                        {isSelected ? (
                          <>
                            <span>Selected</span>
                            <Check size={14} aria-hidden="true" />
                          </>
                        ) : (
                          <>
                            <span>Select Package</span>
                            <ArrowRight size={14} aria-hidden="true" />
                          </>
                        )}
                      </Link>
                    </div>
                  </article>
                );
              })}
            </section>
          ) : null}

          {tab === "experience" ? (
            <div className={styles.detailStack}>
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
        </main>

        {/* RIGHT SECTION: PLACE ORDER */}
        <ProviderOrderPanel
          provider={provider}
          projectId={projectId}
          initialServiceId={serviceId}
        />
      </div>
    </div>
  );
}


