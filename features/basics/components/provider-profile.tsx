import {
  ArrowRight,
  BadgeCheck,
  Briefcase,
  Building2,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock,
  Columns3,
  GraduationCap,
  Heart,
  Languages,
  MapPin,
  MessageSquareText,
  Radar,
  Shield,
  Star,
  TrendingUp,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { RupeeIcon } from "@/components/layout/sidebar-icons";
import {
  DeveloperDuotoneIcon,
  ClockDuotoneIcon,
} from "@/components/layout/sidebar-icons";
import { basicsProviderRepository } from "../repositories/basics-repositories";
import { getCategoryLabel } from "../constants/service-catalogue";
import { formatCurrency, formatDate, pricingLabels } from "../utils/basics-formatters";
import {
  BasicsStateView,
} from "./basics-shared";
import { SaveProviderButton } from "./save-provider-button";
import { ProviderLogoTile } from "./provider-logo-tile";
import { ProviderOrderPanel } from "./provider-order-panel";
import styles from "./basics-workspace.module.css";

function SakuraBonsaiTree() {
  return (
    <svg width="46" height="46" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* Trunk */}
      <path d="M24 41C24 35 21 30 22 24C22.5 21 24.5 19 25 16" stroke="#451a03" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M22 28C19 26 17 24 16 22" stroke="#451a03" strokeWidth="2" strokeLinecap="round" />
      <path d="M23 22C26 20 28 19 30 18" stroke="#451a03" strokeWidth="2" strokeLinecap="round" />
      {/* Foliage / Blossoms */}
      <circle cx="25" cy="14" r="7.5" fill="#f472b6" opacity="0.9" />
      <circle cx="17" cy="19" r="6" fill="#fb7185" opacity="0.85" />
      <circle cx="32" cy="17" r="6" fill="#f43f5e" opacity="0.85" />
      <circle cx="22" cy="10" r="5" fill="#fda4af" />
      <circle cx="29" cy="11" r="4.5" fill="#fbcfe8" />
      {/* Falling petals */}
      <circle cx="11" cy="27" r="1.2" fill="#fb7185" opacity="0.7" />
      <circle cx="36" cy="26" r="1.2" fill="#f43f5e" opacity="0.7" />
      <circle cx="39" cy="33" r="1" fill="#fda4af" opacity="0.6" />
      {/* Ground line */}
      <ellipse cx="24" cy="41" rx="8" ry="1.5" fill="#cbd5e1" />
    </svg>
  );
}

function AutumnBonsaiTree() {
  return (
    <svg width="46" height="46" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* Trunk */}
      <path d="M24 41C24 35 22 31 23 25C23.5 22 25.5 20 26 17" stroke="#451a03" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M23 29C20 27 18 25 17 23" stroke="#451a03" strokeWidth="2" strokeLinecap="round" />
      <path d="M24 23C27 21 29 20 31 19" stroke="#451a03" strokeWidth="2" strokeLinecap="round" />
      {/* Foliage */}
      <circle cx="25" cy="14" r="7.5" fill="#f59e0b" opacity="0.9" />
      <circle cx="17" cy="19" r="6" fill="#d97706" opacity="0.85" />
      <circle cx="32" cy="17" r="6" fill="#b45309" opacity="0.85" />
      <circle cx="22" cy="10" r="5" fill="#fbbf24" />
      <circle cx="29" cy="11" r="4.5" fill="#fde68a" />
      {/* Falling leaves */}
      <circle cx="12" cy="27" r="1.2" fill="#d97706" opacity="0.7" />
      <circle cx="37" cy="26" r="1.2" fill="#f59e0b" opacity="0.7" />
      <circle cx="38" cy="34" r="1" fill="#fbbf24" opacity="0.6" />
      {/* Ground line */}
      <ellipse cx="24" cy="41" rx="8" ry="1.5" fill="#cbd5e1" />
    </svg>
  );
}

function DiamondBulletIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="#94a3b8" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style={{ flexShrink: 0 }}>
      <path d="M8 1L10 6L8 8L6 6L8 1Z" />
      <path d="M15 8L10 10L8 8L10 6L15 8Z" />
      <path d="M8 15L6 10L8 8L10 10L8 15Z" />
      <path d="M1 8L6 6L8 8L6 10L1 8Z" />
    </svg>
  );
}

type ProfileTab = "services" | "overview" | "experience" | "reviews";

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

  const profileTabs: { id: ProfileTab; label: string; count?: number }[] = [
    { id: "services", label: "Services", count: provider.services.length },
    { id: "overview", label: "Overview" },
    { id: "experience", label: "Experience & Credentials", count: provider.credentials.length },
    { id: "reviews", label: "Reviews", count: provider.reviewCount },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.profileTwoColumnLayout}>
        {/* LEFT SECTION: PROFILE DETAILS & PORTFOLIO */}
        <main className={styles.profileReviewSection}>
          {/* APPROVED THEMED PROFILE HERO CARD */}
          <section className={styles.profileHeroCard}>
            {/* 1. Top Identity & Rate Row */}
            <div className={styles.profileHeroHeaderRow}>
              <div className={styles.profileHeroIdentityGroup}>
                {/* Brand Visual Logo Tile */}
                <div className={styles.profileBrandVisualBlock}>
                  <ProviderLogoTile name={provider.name} className={styles.profileBrandVisualTile} />
                </div>

                {/* Identity Details */}
                <div className={styles.profileIdentityDetails}>
                  <div className={styles.profileTitleRow}>
                    <h1 className={styles.profileTeamName}>{provider.name}</h1>
                    <BadgeCheck size={20} className={styles.profileVerifiedBlueIcon} aria-label="Verified provider" />
                  </div>
                  <div className={styles.profileSpecializationRow}>
                    <span>{provider.specializations[0] ?? provider.headline}</span>
                    <span className={styles.profileBulletSeparator}>·</span>
                    <span>{provider.specializations[1] ?? getCategoryLabel(provider.primaryCategory)}</span>
                  </div>
                </div>
              </div>

              {/* Rate Block in Top Right (Single Line with Vector Rupee) */}
              <div className={styles.profileHeroRateBlock}>
                <div className={styles.profileHeroRateValue}>
                  <RupeeIcon size={19} className={styles.profileHeroRupeeIcon} aria-hidden="true" />
                  <span>
                    {provider.pricing.startingFrom
                      ? provider.pricing.startingFrom.toLocaleString("en-IN")
                      : "38,000"}
                  </span>
                  <span className={styles.profileHeroRateLabel}>
                    {pricingLabels[provider.pricing.model] ? `/${pricingLabels[provider.pricing.model]}` : "/PER SQ FT"}
                  </span>
                </div>
              </div>
            </div>

            {/* 2. Service Area, Radius & Quick Actions Strip */}
            <div className={styles.profileServiceAreaSubRow}>
              <div className={styles.profileServiceAreaWrapper}>
                <MapPin size={15} className={styles.profileLocationPinIcon} aria-hidden="true" />
                <span>
                  Service Area: <strong className={styles.profileServiceAreaText}>{provider.location.city}, {provider.location.state}</strong>
                </span>
              </div>

              <div className={styles.profileServiceAreaRightActions}>
                <div className={styles.profileServiceRadiusBadge}>
                  <Radar size={13} className={styles.profileRadiusIcon} aria-hidden="true" />
                  <span>45 km service radius</span>
                </div>

                <SaveProviderButton providerId={provider.id} variant="icon" />

                <Link
                  href={`/basics/experts?compare=${encodeURIComponent(provider.id)}`}
                  className={styles.profileIconActionButton}
                  aria-label="Compare with other providers"
                  title="Compare with other providers"
                >
                  <Columns3 size={13} strokeWidth={2.2} aria-hidden="true" />
                </Link>
              </div>
            </div>

            {/* 3. Strong Scannable Proof Metrics Row (4 Columns) */}
            <div className={styles.profileProofMetricsGrid}>
              <div className={styles.profileMetricTile}>
                <div className={styles.profileMetricTileHeader}>
                  <Briefcase size={14} className={styles.profileMetricCardIcon} aria-hidden="true" />
                  <span className={styles.profileMetricSubLabel}>Experience</span>
                </div>
                <span className={styles.profileMetricBigValue}>{provider.yearsOfExperience} yrs</span>
              </div>

              <div className={styles.profileMetricTile}>
                <div className={styles.profileMetricTileHeader}>
                  <Star size={14} fill="#eab308" color="#eab308" className={styles.profileMetricCardIcon} aria-hidden="true" />
                  <span className={styles.profileMetricSubLabel}>{provider.reviewCount} Reviews</span>
                </div>
                <span className={styles.profileMetricBigValue}>{provider.rating.toFixed(1)}</span>
              </div>

              <div className={styles.profileMetricTile}>
                <div className={styles.profileMetricTileHeader}>
                  <Building2 size={14} className={styles.profileMetricCardIcon} aria-hidden="true" />
                  <span className={styles.profileMetricSubLabel}>Projects Completed</span>
                </div>
                <span className={styles.profileMetricBigValue}>{provider.completedEngagements}+</span>
              </div>

              <div className={styles.profileMetricTile}>
                <div className={styles.profileMetricTileHeader}>
                  <Users size={14} className={styles.profileMetricCardIcon} aria-hidden="true" />
                  <span className={styles.profileMetricSubLabel}>Response Time</span>
                </div>
                <span className={styles.profileMetricBigValue}>~{provider.responseTimeHours ?? 4} hrs</span>
              </div>
            </div>
          </section>

          {/* SEGMENTED TAB NAVIGATION */}
          <nav className={styles.profileSegmentedTabs} aria-label="Provider profile sections">
            {profileTabs.map((profileTab) => {
              const params = new URLSearchParams({ tab: profileTab.id });
              if (projectId) params.set("projectId", projectId);
              if (serviceId) params.set("serviceId", serviceId);

              const isActive = tab === profileTab.id;

              return (
                <Link
                  key={profileTab.id}
                  href={`/basics/experts/${provider.id}?${params.toString()}`}
                  className={`${styles.profileSegmentedTab} ${
                    isActive ? styles.profileSegmentedTabActive : ""
                  }`}
                  aria-current={isActive ? "page" : undefined}
                >
                  <span>{profileTab.label}</span>
                  {typeof profileTab.count === "number" && profileTab.count > 0 ? (
                    <span className={styles.profileTabCountBadge}>{profileTab.count}</span>
                  ) : null}
                </Link>
              );
            })}
          </nav>

          {/* TAB 1: SERVICES (PACKAGES IN APPROVED REFERENCE STYLE) */}
          {tab === "services" ? (
            <div className={styles.profileServicesContainer}>
              <section className={styles.serviceCardsGrid}>
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
                      className={`${styles.modernServiceCard} ${
                        isSelected ? styles.modernServiceCardSelected : ""
                      }`}
                      key={service.id}
                    >
                      {/* Top Floating White Header Box */}
                      <div className={styles.serviceInsertHeaderBox}>
                        <div className={styles.serviceInsertHeaderLeft}>
                          <span className={styles.serviceInsertTitle}>{service.title}</span>
                          <div className={styles.serviceInsertPriceRow}>
                            <RupeeIcon size={18} className={styles.serviceRupeeIcon} aria-hidden="true" />
                            <span className={styles.serviceInsertPrice}>
                              {service.startingPrice
                                ? service.startingPrice.toLocaleString("en-IN")
                                : "38,000"}
                            </span>
                          </div>
                          <span className={styles.serviceInsertSubLabel}>
                            {index === 0 ? "Starting from" : "Hourly rate / fixed"}
                          </span>
                        </div>

                        {/* Decorative Tree Illustration */}
                        <div className={styles.serviceTreeIllustration}>
                          {index === 0 ? <SakuraBonsaiTree /> : <AutumnBonsaiTree />}
                        </div>
                      </div>

                      {/* Description Statement */}
                      <p className={styles.modernServiceDesc}>{service.description}</p>

                      {/* Deliverables Checklist with Diamond Icons */}
                      <ul className={styles.modernServiceDeliverables}>
                        {service.deliverables.map((deliverable) => (
                          <li key={deliverable} className={styles.modernServiceDeliverableItem}>
                            <DiamondBulletIcon />
                            <span>{deliverable}</span>
                          </li>
                        ))}
                        <li className={styles.modernServiceDeliverableItem}>
                          <DiamondBulletIcon />
                          <span>{service.estimatedDuration ?? "Fast Delivery"}</span>
                        </li>
                        <li className={styles.modernServiceDeliverableItem}>
                          <DiamondBulletIcon />
                          <span>2 revision cycles included</span>
                        </li>
                      </ul>

                      {/* Full Width Let's Talk / Selection Action Button */}
                      <Link
                        className={
                          isSelected
                            ? styles.modernServiceButtonSelected
                            : styles.modernServiceButton
                        }
                        href={`/basics/experts/${provider.id}?${selectParams.toString()}`}
                      >
                        {isSelected ? "Selected ✓" : "Let's Talk"}
                      </Link>
                    </article>
                  );
                })}
              </section>

              {/* Unique Request Banner Card */}
              <article className={styles.uniqueRequestCard}>
                <h3 className={styles.uniqueRequestTitle}>Unique Request</h3>
                <p className={styles.uniqueRequestDesc}>
                  Are you looking for something custom? Don&apos;t hesitate to contact us, and we&apos;ll help brainstorming your project to success.
                </p>
                <Link
                  className={styles.uniqueRequestButton}
                  href={`/tools?tool=messages&providerId=${encodeURIComponent(provider.id)}`}
                >
                  Let&apos;s Talk
                </Link>
              </article>
            </div>
          ) : null}

          {/* TAB 2: OVERVIEW (STRUCTURED PROPERTY TABLES) */}
          {tab === "overview" ? (
            <div className={styles.profileOverviewStack}>
              {/* Expertise & Project Fit Table Card */}
              <section className={styles.profileDetailCard}>
                <div className={styles.profileDetailCardHeader}>
                  <h2 className={styles.profileDetailCardTitle}>
                    <Briefcase size={16} className={styles.profileSectionIcon} />
                    Expertise & Project Fit
                  </h2>
                </div>
                <div className={styles.profileTableWrap}>
                  <table className={styles.profilePropertyTable}>
                    <tbody>
                      <tr>
                        <th scope="row">Primary Specialization</th>
                        <td>{provider.specializations.join(", ")}</td>
                      </tr>
                      <tr>
                        <th scope="row">Supported Project Types</th>
                        <td>{provider.projectTypes.join(", ")}</td>
                      </tr>
                      <tr>
                        <th scope="row">Locations Served</th>
                        <td>
                          {provider.location.city}, {provider.location.state}; remote engagements across India
                        </td>
                      </tr>
                      <tr>
                        <th scope="row">Engagement Options</th>
                        <td>
                          {provider.remoteAvailable ? "Remote Collaboration" : ""}
                          {provider.remoteAvailable && provider.onsiteAvailable ? " & " : ""}
                          {provider.onsiteAvailable ? "On-site Supervision" : ""}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              <div className={styles.profileDetailTwoColumnGrid}>
                {/* Software & Standards Table Card */}
                <section className={styles.profileDetailCard}>
                  <div className={styles.profileDetailCardHeader}>
                    <h2 className={styles.profileDetailCardTitle}>
                      <DeveloperDuotoneIcon size={16} className={styles.profileSectionIcon} />
                      Software & Standards
                    </h2>
                  </div>
                  <div className={styles.profileTableWrap}>
                    <table className={styles.profilePropertyTable}>
                      <tbody>
                        <tr>
                          <th scope="row">Software Tools</th>
                          <td>
                            <div className={styles.profileChipGroup}>
                              {provider.softwareSkills.map((skill) => (
                                <span key={skill} className={styles.profileSkillChip}>
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <th scope="row">Building Codes</th>
                          <td>
                            <div className={styles.profileChipGroup}>
                              {provider.codeKnowledge.map((code) => (
                                <span key={code} className={styles.profileCodeChip}>
                                  <Shield size={11} aria-hidden="true" />
                                  {code}
                                </span>
                              ))}
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <th scope="row">Languages Spoken</th>
                          <td>
                            <div className={styles.profileChipGroup}>
                              {provider.languages.map((lang) => (
                                <span key={lang} className={styles.profileLangChip}>
                                  <Languages size={11} aria-hidden="true" />
                                  {lang}
                                </span>
                              ))}
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </section>

                {/* Commercial Terms & Rates Table Card */}
                <section className={styles.profileDetailCard}>
                  <div className={styles.profileDetailCardHeader}>
                    <h2 className={styles.profileDetailCardTitle}>
                      <ClockDuotoneIcon size={16} className={styles.profileSectionIcon} />
                      Commercial Terms & Rates
                    </h2>
                  </div>
                  <div className={styles.profileTableWrap}>
                    <table className={styles.profilePropertyTable}>
                      <tbody>
                        <tr>
                          <th scope="row">Pricing Model</th>
                          <td>{pricingLabels[provider.pricing.model]}</td>
                        </tr>
                        <tr>
                          <th scope="row">Starting Package Rate</th>
                          <td className={styles.profileDetailHighlightPrice}>
                            {provider.pricing.startingFrom
                              ? formatCurrency(provider.pricing.startingFrom, provider.pricing.currency)
                              : "Request customized quote"}
                          </td>
                        </tr>
                        <tr>
                          <th scope="row">Average Response Time</th>
                          <td>Under {provider.responseTimeHours ?? 4} business hours</td>
                        </tr>
                        <tr>
                          <th scope="row">Experience</th>
                          <td>{provider.yearsOfExperience} years in professional practice</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </section>
              </div>
            </div>
          ) : null}

          {/* TAB 3: EXPERIENCE & CREDENTIALS */}
          {tab === "experience" ? (
            <div className={styles.profileOverviewStack}>
              <section className={styles.profileDetailCard}>
                <div className={styles.profileDetailCardHeader}>
                  <h2 className={styles.profileDetailCardTitle}>
                    <GraduationCap size={16} className={styles.profileSectionIcon} />
                    Professional Qualifications & Accreditations
                  </h2>
                </div>
                <div className={styles.profileCardBody}>
                  <div className={styles.profileCredentialsGrid}>
                    {provider.credentials.map((credential) => (
                      <div key={credential.id} className={styles.profileCredentialCard}>
                        <div className={styles.profileCredentialHeader}>
                          <span className={styles.profileCredentialKind}>
                            {credential.kind.replaceAll("_", " ")}
                          </span>
                          {credential.verified ? (
                            <span className={styles.profileCredentialVerifiedBadge}>
                              <CheckCircle2 size={11} aria-hidden="true" />
                              Verified
                            </span>
                          ) : null}
                        </div>
                        <h3 className={styles.profileCredentialTitle}>{credential.title}</h3>
                        <p className={styles.profileCredentialIssuer}>
                          {credential.issuer}
                          {credential.issuedYear ? ` · Issued ${credential.issuedYear}` : ""}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              <section className={styles.profileDetailCard}>
                <div className={styles.profileDetailCardHeader}>
                  <h2 className={styles.profileDetailCardTitle}>
                    <Briefcase size={16} className={styles.profileSectionIcon} />
                    Practice Track Record
                  </h2>
                </div>
                <div className={styles.profileTableWrap}>
                  <table className={styles.profilePropertyTable}>
                    <tbody>
                      <tr>
                        <th scope="row">Years of Practice</th>
                        <td>{provider.yearsOfExperience} Years</td>
                      </tr>
                      <tr>
                        <th scope="row">Completed Engagements</th>
                        <td>{provider.completedEngagements} Projects delivered</td>
                      </tr>
                      <tr>
                        <th scope="row">Primary Software</th>
                        <td>{provider.softwareSkills.join(", ")}</td>
                      </tr>
                      <tr>
                        <th scope="row">Standards & Codes</th>
                        <td>{provider.codeKnowledge.join(", ")}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          ) : null}

          {/* TAB 4: REVIEWS */}
          {tab === "reviews" ? (
            <section className={styles.modernReviewsSection}>
              {/* 1. Header with Date Filter */}
              <div className={styles.modernReviewsHeader}>
                <h2 className={styles.modernReviewsTitle}>Reviews</h2>
                <div className={styles.modernReviewsDateFilter}>
                  <span>March 2021 - February 2022</span>
                  <ChevronDown size={14} className={styles.modernReviewsChevron} />
                </div>
              </div>

              {/* 2. Top 3-Column Summary Card */}
              <div className={styles.modernReviewsStatsCard}>
                {/* Column 1: Total Reviews */}
                <div className={styles.modernReviewsStatCol}>
                  <span className={styles.modernStatLabel}>Total Reviews</span>
                  <div className={styles.modernStatValueRow}>
                    <span className={styles.modernStatBigNum}>{provider.reviewCount}</span>
                    <span className={styles.modernGrowthBadge}>
                      21% <TrendingUp size={11} strokeWidth={2.5} />
                    </span>
                  </div>
                  <span className={styles.modernStatSub}>Growth in reviews on this year</span>
                </div>

                <div className={styles.modernStatsDivider} />

                {/* Column 2: Average Rating */}
                <div className={styles.modernReviewsStatCol}>
                  <span className={styles.modernStatLabel}>Average Rating</span>
                  <div className={styles.modernStatValueRow}>
                    <span className={styles.modernStatBigNum}>{provider.rating.toFixed(1)}</span>
                    <div className={styles.modernStarsCluster}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={14}
                          fill={star <= Math.round(provider.rating) ? "#f59e0b" : "#e2e8f0"}
                          color={star <= Math.round(provider.rating) ? "#f59e0b" : "#e2e8f0"}
                        />
                      ))}
                    </div>
                  </div>
                  <span className={styles.modernStatSub}>Average rating on this year</span>
                </div>

                <div className={styles.modernStatsDivider} />

                {/* Column 3: Rating Distribution Bars */}
                <div className={styles.modernReviewsDistCol}>
                  <div className={styles.modernDistRow}>
                    <span className={styles.modernDistStarLabel}>5</span>
                    <div className={styles.modernDistBarTrack}>
                      <div className={styles.modernDistBarFill} style={{ width: "82%", background: "#10b981" }} />
                    </div>
                    <span className={styles.modernDistCount}>2.0k</span>
                  </div>
                  <div className={styles.modernDistRow}>
                    <span className={styles.modernDistStarLabel}>4</span>
                    <div className={styles.modernDistBarTrack}>
                      <div className={styles.modernDistBarFill} style={{ width: "48%", background: "#06b6d4" }} />
                    </div>
                    <span className={styles.modernDistCount}>1.0k</span>
                  </div>
                  <div className={styles.modernDistRow}>
                    <span className={styles.modernDistStarLabel}>3</span>
                    <div className={styles.modernDistBarTrack}>
                      <div className={styles.modernDistBarFill} style={{ width: "24%", background: "#f59e0b" }} />
                    </div>
                    <span className={styles.modernDistCount}>500</span>
                  </div>
                  <div className={styles.modernDistRow}>
                    <span className={styles.modernDistStarLabel}>2</span>
                    <div className={styles.modernDistBarTrack}>
                      <div className={styles.modernDistBarFill} style={{ width: "12%", background: "#3b82f6" }} />
                    </div>
                    <span className={styles.modernDistCount}>200</span>
                  </div>
                  <div className={styles.modernDistRow}>
                    <span className={styles.modernDistStarLabel}>1</span>
                    <div className={styles.modernDistBarTrack}>
                      <div className={styles.modernDistBarFill} style={{ width: "3%", background: "#ef4444" }} />
                    </div>
                    <span className={styles.modernDistCount}>0k</span>
                  </div>
                </div>
              </div>

              {/* 3. Review Items Feed */}
              <div className={styles.modernReviewsFeed}>
                {provider.reviews.map((review) => (
                  <article className={styles.modernReviewRow} key={review.id}>
                    {/* Left User Meta */}
                    <div className={styles.modernReviewUserMeta}>
                      <div className={styles.modernReviewUserAvatar}>
                        {review.reviewerName.charAt(0)}
                      </div>
                      <div className={styles.modernReviewUserInfo}>
                        <h3 className={styles.modernReviewUserName}>{review.reviewerName}</h3>
                        <span className={styles.modernReviewUserSpend}>
                          Total Spend: <strong>₹{(provider.pricing.startingFrom ?? 38000).toLocaleString("en-IN")}</strong>
                        </span>
                        <span className={styles.modernReviewUserCount}>
                          Total Review: <strong>14</strong>
                        </span>
                      </div>
                    </div>

                    {/* Right Content & Actions */}
                    <div className={styles.modernReviewContent}>
                      <div className={styles.modernReviewContentHeader}>
                        <div className={styles.modernReviewContentStars}>
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              size={13}
                              fill={s <= review.rating ? "#f59e0b" : "#e2e8f0"}
                              color={s <= review.rating ? "#f59e0b" : "#e2e8f0"}
                            />
                          ))}
                        </div>
                        <span className={styles.modernReviewDate}>
                          {formatDate(review.completionDate)}
                        </span>
                      </div>

                      <p className={styles.modernReviewBodyText}>{review.review}</p>

                      <div className={styles.modernReviewActionsBar}>
                        <button type="button" className={styles.modernReviewActionBtn}>
                          Public Comment
                        </button>
                        <button type="button" className={styles.modernReviewActionBtn}>
                          Direct Message
                        </button>
                        <button type="button" className={styles.modernReviewHeartBtn} aria-label="Like review">
                          <Heart size={14} fill="#3b82f6" color="#3b82f6" />
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ) : null}
        </main>

        {/* RIGHT SECTION: PLACE ORDER / CONCIERGE PANEL */}
        <ProviderOrderPanel
          provider={provider}
          projectId={projectId}
          initialServiceId={serviceId}
        />
      </div>
    </div>
  );
}


