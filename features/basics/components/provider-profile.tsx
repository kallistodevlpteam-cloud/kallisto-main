import {
  ArrowRight,
  Award,
  Briefcase,
  Calendar,
  Check,
  Clock,
  Cpu,
  CreditCard,
  Languages,
  MessageSquareText,
  MapPin,
  Mail,
  Star,
  Target,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
  DeveloperDuotoneIcon,
  ShieldDuotoneIcon,
} from "@/components/layout/sidebar-icons";
import { basicsProviderRepository } from "../repositories/basics-repositories";
import { getCategoryLabel } from "../constants/service-catalogue";
import { formatCurrency, formatDate, pricingLabels } from "../utils/basics-formatters";
import {
  BasicsStateView,
  ProviderAvailabilityBadge,
} from "./basics-shared";
import { SaveProviderButton } from "./save-provider-button";
import { ProviderOrderPanel } from "./provider-order-panel";
import { ReviewItemActions } from "./review-item-actions";
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

  const hoursLogged = Math.max(provider.completedEngagements * 58 + 28, 640);

  return (
    <div className={styles.profilePage}>
      <div className={styles.profileTwoColumnLayout}>
        {/* LEFT SECTION: REVIEW THE PROVIDER */}
        <main className={styles.profileReviewSection}>
          {/* RESTRUCTURED PROFILE HERO CARD MATCHING TARGET UI */}
          <section className={styles.profileHeroCard} aria-label={`${provider.name} Profile Card`}>
            {/* 1. Panoramic Cover Banner */}
            <div className={styles.profileCoverBanner}>
              <div className={styles.coverGradient} />
              <div className={styles.coverShadowTexture} aria-hidden="true">
                <svg
                  className={styles.palmSilhouetteSvg}
                  viewBox="0 0 500 300"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    <filter id="palmLeafBlur" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="3" />
                    </filter>
                  </defs>
                  <g filter="url(#palmLeafBlur)" fill="#1e293b" opacity="0.32">
                    {/* Palm Frond Main Stem */}
                    <path
                      d="M510 -15 C450 35 370 100 270 190 C230 225 190 270 160 320"
                      stroke="#1e293b"
                      strokeWidth="5"
                      strokeLinecap="round"
                    />
                    {/* Radiating Frond Leaflets */}
                    <path d="M490 15 C420 20 350 42 295 68 C340 48 400 32 470 20 Z" />
                    <path d="M465 40 C385 52 315 78 260 108 C310 82 375 62 445 46 Z" />
                    <path d="M435 70 C355 88 285 118 230 152 C280 122 345 96 415 76 Z" />
                    <path d="M405 100 C325 120 255 158 200 198 C250 162 315 132 385 106 Z" />
                    <path d="M375 130 C295 158 235 198 180 242 C230 202 285 168 355 136 Z" />
                    <path d="M345 160 C265 192 215 238 165 288 C210 242 265 202 325 166 Z" />
                    {/* Upper Leaflets */}
                    <path d="M500 5 C450 55 410 105 380 155 C405 110 440 65 495 12 Z" />
                    <path d="M470 28 C420 80 380 135 350 190 C375 140 410 90 465 35 Z" />
                    <path d="M440 55 C390 110 350 165 320 225 C345 170 380 120 435 65 Z" />
                    <path d="M410 85 C360 140 320 195 290 260 C315 200 350 150 405 95 Z" />
                  </g>
                </svg>
              </div>

              {/* Top right Availability Badge */}
              <div className={styles.coverBadgeContainer}>
                <ProviderAvailabilityBadge availability={provider.availability} />
              </div>
            </div>

            {/* 2. Profile Main Identity Block */}
            <div className={styles.profileHeaderContent}>
              <div className={styles.profileIdentityRow}>
                {/* Overlapping Circular Avatar */}
                <div className={styles.profileAvatarContainer}>
                  {provider.avatarUrl ? (
                    <Image
                      src={provider.avatarUrl}
                      alt={provider.name}
                      width={104}
                      height={104}
                      className={styles.profileAvatarImg}
                      priority
                    />
                  ) : (
                    <div className={styles.profileAvatarFallback}>
                      <span>{getInitials(provider.name)}</span>
                    </div>
                  )}
                </div>

                {/* Name & Role */}
                <div className={styles.profileDetailsCol}>
                  <div className={styles.profileNameRow}>
                    <h1 className={styles.profileName}>{provider.name}</h1>
                    <span className={styles.verifiedCheckBadge} title="Verified Specialist" aria-label="Verified">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="11" fill="#0284c7" />
                        <path d="M7.5 12.5L10.5 15.5L16.5 9" stroke="#ffffff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  </div>

                  <p className={styles.profileRoleTitle}>
                    {provider.headline || `${provider.specializations[0] ?? "Specialist"} in ${getCategoryLabel(provider.primaryCategory)}`}
                  </p>
                </div>

                {/* Action Controls: Save + Message */}
                <div className={styles.profileHeaderActions}>
                  <SaveProviderButton providerId={provider.id} />
                  <Link
                    className={styles.messageBtn}
                    href={`/tools?tool=messages&providerId=${encodeURIComponent(provider.id)}`}
                  >
                    <MessageSquareText size={15} aria-hidden="true" />
                    <span>Message</span>
                  </Link>
                </div>
              </div>

              {/* Primary Expertise & Contact Meta (Left side of the profile) */}
              <div className={styles.profileMetaBlock}>
                {provider.specializations.length > 0 && (
                  <div className={styles.primaryExpertiseRow}>
                    <span className={styles.expertiseLabel}>Primary expertise:</span>
                    <div className={styles.expertisePillList}>
                      {provider.specializations.map((spec) => (
                        <span key={spec} className={styles.expertisePill}>
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className={styles.profileContactMeta}>
                  <span className={styles.metaItem}>
                    <MapPin size={15} className={styles.metaIcon} aria-hidden="true" />
                    <span>{provider.location.city}, {provider.location.state}</span>
                  </span>
                  <span className={styles.metaItem}>
                    <Mail size={15} className={styles.metaIcon} aria-hidden="true" />
                    <span>{provider.slug}@kallisto.io</span>
                  </span>
                </div>
              </div>

              {/* Bio */}
              {provider.bio && (
                <p className={styles.profileBioText}>{provider.bio}</p>
              )}

              {/* 3. Horizontal 4-Column Metrics Bar */}
              <div className={styles.profileMetricsBar} aria-label="Provider Performance Metrics">
                <div className={styles.metricCol}>
                  <div className={styles.metricValRow}>
                    <Clock size={18} className={styles.metricIcon} aria-hidden="true" />
                    <span className={styles.metricVal}>{hoursLogged}h</span>
                  </div>
                  <span className={styles.metricLbl}>Hours Logged</span>
                </div>

                <div className={styles.metricCol}>
                  <div className={styles.metricValRow}>
                    <Briefcase size={18} className={styles.metricIcon} aria-hidden="true" />
                    <span className={styles.metricVal}>{provider.completedEngagements}</span>
                  </div>
                  <span className={styles.metricLbl}>Completed Projects</span>
                </div>

                <div className={styles.metricCol}>
                  <div className={styles.metricValRow}>
                    <Calendar size={18} className={styles.metricIcon} aria-hidden="true" />
                    <span className={styles.metricVal}>{provider.yearsOfExperience} yrs</span>
                  </div>
                  <span className={styles.metricLbl}>Years of Experience</span>
                </div>

                <div className={styles.metricCol}>
                  <div className={styles.metricValRow}>
                    <Star size={18} className={styles.metricStarIcon} fill="#f59e0b" color="#f59e0b" aria-hidden="true" />
                    <span className={styles.metricVal}>
                      {provider.rating.toFixed(1)} <span className={styles.metricOutOf}>/ 5.0</span>
                    </span>
                  </div>
                  <span className={styles.metricLbl}>Overall Rating</span>
                </div>
              </div>
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
                <h2>
                  <Target size={18} className={styles.panelHeaderIcon} aria-hidden="true" />
                  Expertise and project fit
                </h2>
                <dl className={styles.detailGridList}>
                  <div className={styles.detailGridItem}>
                    <dt>Primary expertise</dt>
                    <dd>{provider.specializations.join(", ")}</dd>
                  </div>
                  <div className={styles.detailGridItem}>
                    <dt>Project types</dt>
                    <dd>{provider.projectTypes.join(", ")}</dd>
                  </div>
                  <div className={styles.detailGridItem}>
                    <dt>Locations served</dt>
                    <dd>
                      {provider.location.city}, {provider.location.state}; remote across India
                    </dd>
                  </div>
                  <div className={styles.detailGridItem}>
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
                  <h2>
                    <Cpu size={18} className={styles.panelHeaderIcon} aria-hidden="true" />
                    Technical capabilities
                  </h2>
                  <dl className={styles.detailList}>
                    <div>
                      <dt><DeveloperDuotoneIcon size={14} aria-hidden="true" /> Software</dt>
                      <dd>
                        <div className={styles.tagWrap}>
                          {provider.softwareSkills.map((skill) => (
                            <span key={skill} className={styles.skillTag}>{skill}</span>
                          ))}
                        </div>
                      </dd>
                    </div>
                    <div>
                      <dt><ShieldDuotoneIcon size={14} aria-hidden="true" /> Codes</dt>
                      <dd>
                        <div className={styles.tagWrap}>
                          {provider.codeKnowledge.map((code) => (
                            <span key={code} className={styles.codeTag}>{code}</span>
                          ))}
                        </div>
                      </dd>
                    </div>
                    <div>
                      <dt><Languages size={13} aria-hidden="true" /> Languages</dt>
                      <dd>{provider.languages.join(", ")}</dd>
                    </div>
                  </dl>
                </section>

                <section className={styles.detailPanel}>
                  <h2>
                    <CreditCard size={18} className={styles.panelHeaderIcon} aria-hidden="true" />
                    Commercial indication
                  </h2>
                  <dl className={styles.detailList}>
                    <div>
                      <dt>Pricing model</dt>
                      <dd>
                        <span className={styles.pricingModelBadge}>{pricingLabels[provider.pricing.model]}</span>
                      </dd>
                    </div>
                    <div>
                      <dt>Starting from</dt>
                      <dd className={styles.pricingStartingVal}>
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
                <h2>
                  <Award size={18} className={styles.panelHeaderIcon} aria-hidden="true" />
                  Qualifications and credentials
                </h2>
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
                <h2>
                  <Briefcase size={18} className={styles.panelHeaderIcon} aria-hidden="true" />
                  Practice experience
                </h2>
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
                <article className={styles.reviewCard} key={review.id}>
                  {/* Left Column: Reviewer Avatar, Name, Total Spend & Review Count */}
                  <div className={styles.reviewUserCol}>
                    <div className={styles.reviewUserAvatar}>
                      <span>{getInitials(review.reviewerName) || "R"}</span>
                    </div>
                    <div className={styles.reviewUserInfo}>
                      <h3 className={styles.reviewUserName}>{review.reviewerName}</h3>
                      <span className={styles.reviewUserSpend}>
                        Total Spend:{" "}
                        <strong>
                          ₹{(review.totalSpend ?? 38000).toLocaleString("en-IN")}
                        </strong>
                      </span>
                      <span className={styles.reviewUserCount}>
                        Total Review:{" "}
                        <strong>{review.totalReviews ?? 14}</strong>
                      </span>
                    </div>
                  </div>

                  {/* Right Column: Stars, Date, Comment Body, Actions Bar */}
                  <div className={styles.reviewContentCol}>
                    <div className={styles.reviewContentHeader}>
                      <div className={styles.reviewStars} aria-label={`${review.rating} stars`}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={14}
                            className={styles.reviewStarIcon}
                            fill={star <= Math.round(review.rating) ? "#f59e0b" : "none"}
                            color={star <= Math.round(review.rating) ? "#f59e0b" : "#e2e8f0"}
                            aria-hidden="true"
                          />
                        ))}
                      </div>
                      <span className={styles.reviewDate}>
                        {formatDate(review.completionDate)}
                      </span>
                    </div>

                    <p className={styles.reviewBodyText}>{review.review}</p>

                    <ReviewItemActions reviewerName={review.reviewerName} />
                  </div>
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


