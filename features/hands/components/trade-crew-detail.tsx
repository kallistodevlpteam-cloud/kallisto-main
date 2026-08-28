"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
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
  Droplets,
  GraduationCap,
  Grid3X3,
  Heart,
  Layers,
  MapPin,
  Radar,
  Shield,
  ShieldCheck,
  Sparkles,
  Star,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import Image from "next/image";
import { RupeeIcon } from "@/components/layout/sidebar-icons";
import { getTradeCrewById, type TradeCrew } from "../services/trade-crews.mock";
import { TradeCrewOrderPanel } from "./trade-crew-order-panel";
import { WorkforceRequestDrawer } from "./workforce-request-drawer";
import styles from "./trade-crew-detail.module.css";

interface TradeCrewDetailProps {
  crewId: string;
  projectId?: string;
  tab?: string;
  packageId?: string;
}

type HandsProfileTab = "services" | "overview" | "experience" | "reviews";

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

function TradeCrewLogoTile({ name, trade }: { name: string; trade: string }) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <div className={styles.profileBrandVisualTile}>
      <span className={styles.profileBrandInitials}>{initials || "HC"}</span>
    </div>
  );
}

export function TradeCrewDetail({ crewId, projectId, tab = "services", packageId }: TradeCrewDetailProps) {
  const crew: TradeCrew | null = useMemo(() => getTradeCrewById(crewId), [crewId]);
  const [activeTab, setActiveTab] = useState<HandsProfileTab>(
    (tab as HandsProfileTab) || "services"
  );
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  const profileTabs: { id: HandsProfileTab; label: string; count?: number }[] = [
    { id: "services", label: "Services", count: 2 },
    { id: "overview", label: "Overview" },
    { id: "experience", label: "Experience & Credentials", count: crew?.certifications.length || 2 },
    { id: "reviews", label: "Reviews", count: crew?.reviewCount || 24 },
  ];

  if (!crew) {
    return (
      <div className={styles.page}>
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <h2>Trade Crew Not Found</h2>
          <p style={{ color: "#64748b", marginTop: "8px" }}>
            The requested trade crew record could not be retrieved from the Kallisto Hands registry.
          </p>
          <div style={{ marginTop: "20px" }}>
            <Link href="/hands/trades" className={styles.minimalBookNowBtn} style={{ maxWidth: "220px", margin: "0 auto" }}>
              Return to Trade Directory
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Pre-configured packages for this trade crew
  const tradePackages = [
    {
      id: "std-gang",
      title: `${crew.trade} Standard Gang`,
      startingPrice: crew.dailyRate * (crew.crewSizeMin || 4) * 12,
      durationText: "12 working days",
      pricingModelText: "per gang / shift",
      features: [
        `Verified squad of ${crew.crewSizeMin || 4} tradesmen & helpers`,
        "Daily shift progress reporting",
        "Lead supervisor coordination",
        "12 working days typical turnaround",
        "2 site inspection checkpoints included",
      ],
      iconType: "sakura",
    },
    {
      id: "scaled-squad",
      title: `${crew.trade} Fast-Track Squad`,
      startingPrice: crew.dailyRate * Math.min(crew.crewSizeMax || 16, (crew.crewSizeMin || 4) * 2) * 6,
      durationText: "6 working days",
      pricingModelText: "per gang / shift",
      features: [
        `High-capacity squad of ${Math.min(crew.crewSizeMax || 16, (crew.crewSizeMin || 4) * 2)} workers`,
        "Rapid mobilization in 48 hours",
        "Dedicated foreman & QA inspections",
        "6 working days fast-track execution",
        "Daily productivity sign-offs",
      ],
      iconType: "autumn",
    },
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
                  <TradeCrewLogoTile name={crew.name} trade={crew.trade} />
                </div>

                {/* Identity Details */}
                <div className={styles.profileIdentityDetails}>
                  <div className={styles.profileTitleRow}>
                    <h1 className={styles.profileTeamName}>{crew.name}</h1>
                    <BadgeCheck size={20} className={styles.profileVerifiedBlueIcon} aria-label="Verified trade crew" />
                  </div>
                  <div className={styles.profileSpecializationRow}>
                    <span>{crew.trade}</span>
                    <span className={styles.profileBulletSeparator}>·</span>
                    <span>{crew.category}</span>
                    <span className={styles.profileBulletSeparator}>·</span>
                    <span>Lead: {crew.leadName} ({crew.leadRole})</span>
                  </div>
                </div>
              </div>

              {/* Rate Block in Top Right (Single Line with Vector Rupee) */}
              <div className={styles.profileHeroRateBlock}>
                <div className={styles.profileHeroRateValue}>
                  <RupeeIcon size={19} className={styles.profileHeroRupeeIcon} aria-hidden="true" />
                  <span>{crew.dailyRate.toLocaleString("en-IN")}</span>
                  <span className={styles.profileHeroRateLabel}>/DAY PER WORKER</span>
                </div>
              </div>
            </div>

            {/* 2. Service Area, Radius & Quick Actions Strip */}
            <div className={styles.profileServiceAreaSubRow}>
              <div className={styles.profileServiceAreaWrapper}>
                <MapPin size={15} className={styles.profileLocationPinIcon} aria-hidden="true" />
                <span>
                  Service Area: <strong className={styles.profileServiceAreaText}>{crew.location}, {crew.state}</strong>
                </span>
              </div>

              <div className={styles.profileServiceAreaRightActions}>
                <div className={styles.profileServiceRadiusBadge}>
                  <Radar size={13} className={styles.profileRadiusIcon} aria-hidden="true" />
                  <span>45 km service radius</span>
                </div>

                <button
                  type="button"
                  className={styles.profileIconActionButton}
                  onClick={() => setIsSaved((prev) => !prev)}
                  title={isSaved ? "Saved in bookmarks" : "Save trade crew"}
                  aria-label="Save trade crew"
                >
                  <Heart size={14} fill={isSaved ? "#ef4444" : "none"} color={isSaved ? "#ef4444" : "#64748b"} />
                </button>

                <Link
                  href={`/hands/trades?compare=${encodeURIComponent(crew.id)}`}
                  className={styles.profileIconActionButton}
                  aria-label="Compare with other trade crews"
                  title="Compare with other trade crews"
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
                <span className={styles.profileMetricBigValue}>{crew.experienceYears} yrs</span>
              </div>

              <div className={styles.profileMetricTile}>
                <div className={styles.profileMetricTileHeader}>
                  <Star size={14} fill="#eab308" color="#eab308" className={styles.profileMetricCardIcon} aria-hidden="true" />
                  <span className={styles.profileMetricSubLabel}>{crew.reviewCount} Reviews</span>
                </div>
                <span className={styles.profileMetricBigValue}>{crew.rating.toFixed(1)}</span>
              </div>

              <div className={styles.profileMetricTile}>
                <div className={styles.profileMetricTileHeader}>
                  <Building2 size={14} className={styles.profileMetricCardIcon} aria-hidden="true" />
                  <span className={styles.profileMetricSubLabel}>Deployments Completed</span>
                </div>
                <span className={styles.profileMetricBigValue}>{crew.completedJobs}+</span>
              </div>

              <div className={styles.profileMetricTile}>
                <div className={styles.profileMetricTileHeader}>
                  <Users size={14} className={styles.profileMetricCardIcon} aria-hidden="true" />
                  <span className={styles.profileMetricSubLabel}>Gang Capacity</span>
                </div>
                <span className={styles.profileMetricBigValue}>{crew.crewSizeMin}-{crew.crewSizeMax} workers</span>
              </div>
            </div>
          </section>

          {/* SEGMENTED TAB NAVIGATION (PILL GEOMETRY) */}
          <nav className={styles.profileSegmentedTabs} aria-label="Trade crew profile sections">
            {profileTabs.map((profileTab) => {
              const isActive = activeTab === profileTab.id;

              return (
                <button
                  key={profileTab.id}
                  type="button"
                  onClick={() => setActiveTab(profileTab.id)}
                  className={`${styles.profileSegmentedTab} ${isActive ? styles.profileSegmentedTabActive : ""}`}
                >
                  <span>{profileTab.label}</span>
                  {profileTab.count !== undefined ? (
                    <span className={isActive ? styles.profileTabCountActive : styles.profileTabCountMuted}>
                      {profileTab.count}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </nav>

          {/* TAB 1: SERVICES & WORKFORCE PACKAGES */}
          {activeTab === "services" ? (
            <div className={styles.profileServicesContainer}>
              <section className={styles.profileServicesGrid}>
                {tradePackages.map((pkg, idx) => {
                  const isSelected = (packageId || "std-gang") === pkg.id;

                  return (
                    <article className={styles.servicePackageCard} key={pkg.id}>
                      <div className={styles.serviceCardHeader}>
                        <div className={styles.serviceCardTitleGroup}>
                          <h2 className={styles.serviceCardTitle}>{pkg.title}</h2>
                          <div className={styles.servicePriceBlock}>
                            <span className={styles.servicePriceMain}>
                              ₹{pkg.startingPrice.toLocaleString("en-IN")}
                            </span>
                            <span className={styles.servicePriceSub}>{pkg.pricingModelText}</span>
                          </div>
                        </div>

                        <div className={styles.serviceCardArtWrap} aria-hidden="true">
                          {pkg.iconType === "sakura" ? <SakuraBonsaiTree /> : <AutumnBonsaiTree />}
                        </div>
                      </div>

                      <div className={styles.serviceScopeDescription}>
                        Coordinated professional {crew.trade.toLowerCase()} gang with defined deliverables, site foreman supervision, and muster log reports.
                      </div>

                      <ul className={styles.serviceFeatureList}>
                        {pkg.features.map((feature, fIdx) => (
                          <li key={fIdx} className={styles.serviceFeatureItem}>
                            <DiamondBulletIcon />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>

                      <Link
                        className={isSelected ? styles.serviceActionButtonActive : styles.serviceActionButtonSecondary}
                        href={`/hands/trades/${crew.id}/request?packageId=${encodeURIComponent(pkg.id)}${
                          projectId ? `&projectId=${projectId}` : ""
                        }`}
                      >
                        {isSelected ? "Selected ✓" : "Request Gang"}
                      </Link>
                    </article>
                  );
                })}
              </section>

              {/* Unique Request Banner Card */}
              <article className={styles.uniqueRequestCard}>
                <h3 className={styles.uniqueRequestTitle}>Custom Workforce Scope</h3>
                <p className={styles.uniqueRequestDesc}>
                  Need a specialized trade squad, multi-shift deployment, or custom gang scale? Talk with our workforce deployment desk.
                </p>
                <button
                  type="button"
                  className={styles.uniqueRequestButton}
                  onClick={() => setDrawerOpen(true)}
                >
                  Configure Gang
                </button>
              </article>
            </div>
          ) : null}

          {/* TAB 2: OVERVIEW (STRUCTURED PROPERTY TABLES) */}
          {activeTab === "overview" ? (
            <div className={styles.profileOverviewStack}>
              {/* Expertise & Project Fit Table Card */}
              <section className={styles.profileDetailCard}>
                <div className={styles.profileDetailCardHeader}>
                  <h2 className={styles.profileDetailCardTitle}>
                    <Briefcase size={16} className={styles.profileSectionIcon} />
                    Trade Specializations & Crew Composition
                  </h2>
                </div>
                <div className={styles.profileTableWrap}>
                  <table className={styles.profilePropertyTable}>
                    <tbody>
                      <tr>
                        <th scope="row">Primary Trade</th>
                        <td>{crew.trade} · {crew.category}</td>
                      </tr>
                      <tr>
                        <th scope="row">Crew Lead</th>
                        <td>{crew.leadName} ({crew.leadRole})</td>
                      </tr>
                      <tr>
                        <th scope="row">Workforce Capacity</th>
                        <td>
                          {crew.crewSizeMin} to {crew.crewSizeMax} Tradesmen & Helpers per shift
                        </td>
                      </tr>
                      <tr>
                        <th scope="row">Specialized Skills</th>
                        <td>{crew.skills.join(", ")}</td>
                      </tr>
                      <tr>
                        <th scope="row">Mobilization Locations</th>
                        <td>
                          {crew.location}, {crew.state} (Up to 45 km radius)
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Software, Tools & Standards Table */}
              <section className={styles.profileDetailCard}>
                <div className={styles.profileDetailCardHeader}>
                  <h2 className={styles.profileDetailCardTitle}>
                    <ShieldCheck size={16} className={styles.profileSectionIcon} />
                    Equipment, Tools & Safety Standards
                  </h2>
                </div>
                <div className={styles.profileTableWrap}>
                  <table className={styles.profilePropertyTable}>
                    <tbody>
                      <tr>
                        <th scope="row">Compliance Standards</th>
                        <td>IS Standards, NBC 2016, OSHA Site Safety Standards</td>
                      </tr>
                      <tr>
                        <th scope="row">Certifications</th>
                        <td>{crew.certifications.join(", ")}</td>
                      </tr>
                      <tr>
                        <th scope="row">Muster Roll Tracking</th>
                        <td>Daily digital attendance & shift activity verification</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          ) : null}

          {/* TAB 3: EXPERIENCE & CREDENTIALS */}
          {activeTab === "experience" ? (
            <div className={styles.profileOverviewStack}>
              <section className={styles.profileDetailCard}>
                <div className={styles.profileDetailCardHeader}>
                  <h2 className={styles.profileDetailCardTitle}>
                    <GraduationCap size={16} className={styles.profileSectionIcon} />
                    Trade Accreditations & Verification Status
                  </h2>
                </div>
                <div className={styles.profileCardBody}>
                  <div className={styles.profileCredentialsGrid}>
                    {crew.certifications.map((cert, cIdx) => (
                      <div key={cIdx} className={styles.profileCredentialCard}>
                        <div className={styles.profileCredentialHeader}>
                          <span className={styles.profileCredentialKind}>Trade Certification</span>
                          <span className={styles.profileCredentialVerifiedBadge}>
                            <CheckCircle2 size={11} aria-hidden="true" />
                            Verified
                          </span>
                        </div>
                        <h3 className={styles.profileCredentialTitle}>{cert}</h3>
                        <p className={styles.profileCredentialIssuer}>
                          Kallisto Hands Field Verification Desk
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
                    Track Record & Deployment History
                  </h2>
                </div>
                <div className={styles.profileTableWrap}>
                  <table className={styles.profilePropertyTable}>
                    <tbody>
                      <tr>
                        <th scope="row">Years on Site</th>
                        <td>{crew.experienceYears} Years</td>
                      </tr>
                      <tr>
                        <th scope="row">Completed Deployments</th>
                        <td>{crew.completedJobs} Site Jobs Delivered</td>
                      </tr>
                      <tr>
                        <th scope="row">Next Available Date</th>
                        <td>{crew.availabilitySchedule?.nextAvailableDate || "Immediate Dispatch"}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          ) : null}

          {/* TAB 4: REVIEWS */}
          {activeTab === "reviews" ? (
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
                    <span className={styles.modernStatBigNum}>{crew.reviewCount}</span>
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
                    <span className={styles.modernStatBigNum}>{crew.rating.toFixed(1)}</span>
                    <div className={styles.modernStarsCluster}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={14}
                          fill={star <= Math.round(crew.rating) ? "#f59e0b" : "#e2e8f0"}
                          color={star <= Math.round(crew.rating) ? "#f59e0b" : "#e2e8f0"}
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
                      <div className={styles.modernDistBarFill} style={{ width: "84%", background: "#10b981" }} />
                    </div>
                    <span className={styles.modernDistCount}>1.8k</span>
                  </div>
                  <div className={styles.modernDistRow}>
                    <span className={styles.modernDistStarLabel}>4</span>
                    <div className={styles.modernDistBarTrack}>
                      <div className={styles.modernDistBarFill} style={{ width: "42%", background: "#06b6d4" }} />
                    </div>
                    <span className={styles.modernDistCount}>850</span>
                  </div>
                  <div className={styles.modernDistRow}>
                    <span className={styles.modernDistStarLabel}>3</span>
                    <div className={styles.modernDistBarTrack}>
                      <div className={styles.modernDistBarFill} style={{ width: "20%", background: "#f59e0b" }} />
                    </div>
                    <span className={styles.modernDistCount}>340</span>
                  </div>
                  <div className={styles.modernDistRow}>
                    <span className={styles.modernDistStarLabel}>2</span>
                    <div className={styles.modernDistBarTrack}>
                      <div className={styles.modernDistBarFill} style={{ width: "8%", background: "#3b82f6" }} />
                    </div>
                    <span className={styles.modernDistCount}>120</span>
                  </div>
                  <div className={styles.modernDistRow}>
                    <span className={styles.modernDistStarLabel}>1</span>
                    <div className={styles.modernDistBarTrack}>
                      <div className={styles.modernDistBarFill} style={{ width: "2%", background: "#ef4444" }} />
                    </div>
                    <span className={styles.modernDistCount}>0k</span>
                  </div>
                </div>
              </div>

              {/* 3. Review Items Feed */}
              <div className={styles.modernReviewsFeed}>
                {(
                  crew.reviewsBreakdown?.testimonials || [
                    {
                      id: "rev-1",
                      author: "Horizon Infra Builders",
                      projectType: "Commercial Complex",
                      date: "14 Jan 2026",
                      rating: 5,
                      comment:
                        "Excellent workforce discipline and zero downtime during reinforcement concrete pours. Lead foreman kept safety standards top-notch.",
                      location: "Kochi, Kerala",
                      verifiedClient: true,
                    },
                    {
                      id: "rev-2",
                      author: "Ar. Manoj Varma",
                      projectType: "Luxury Villa",
                      date: "02 Feb 2026",
                      rating: 5,
                      comment:
                        "Prompt mobilization within 48 hours. The crew followed architectural drawings precisely with clean finishes.",
                      location: "Ernakulam, Kerala",
                      verifiedClient: true,
                    },
                  ]
                ).map((rev) => (
                  <article className={styles.modernReviewRow} key={rev.id}>
                    <div className={styles.modernReviewUserMeta}>
                      <div className={styles.modernReviewUserAvatar}>
                        {rev.author.charAt(0)}
                      </div>
                      <div className={styles.modernReviewUserInfo}>
                        <h3 className={styles.modernReviewUserName}>{rev.author}</h3>
                        <span className={styles.modernReviewUserSpend}>
                          Total Spend: <strong>₹{(crew.dailyRate * (crew.crewSizeMin || 4) * 12).toLocaleString("en-IN")}</strong>
                        </span>
                        <span className={styles.modernReviewUserCount}>
                          Total Review: <strong>14</strong>
                        </span>
                      </div>
                    </div>

                    <div className={styles.modernReviewContent}>
                      <div className={styles.modernReviewContentHeader}>
                        <div className={styles.modernReviewContentStars}>
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              size={13}
                              fill={s <= rev.rating ? "#f59e0b" : "#e2e8f0"}
                              color={s <= rev.rating ? "#f59e0b" : "#e2e8f0"}
                            />
                          ))}
                        </div>
                        <span className={styles.modernReviewDate}>{rev.date}</span>
                      </div>

                      <p className={styles.modernReviewBodyText}>{rev.comment}</p>

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

        {/* RIGHT SECTION: ODIN CONVERSATIONAL BOOKING & DEPLOYMENT PANEL */}
        <TradeCrewOrderPanel
          crew={crew}
          projectId={projectId}
          initialPackageId={packageId}
          onOpenDrawer={() => setDrawerOpen(true)}
        />
      </div>

      {/* Interactive Workforce Request Drawer Modal */}
      {drawerOpen && (
        <WorkforceRequestDrawer
          initialTrade={crew.trade as any}
          initialWorkerCount={crew.crewSizeMin || 4}
          initialStartDate="2026-09-12"
          initialDuration="12 days"
          onClose={() => setDrawerOpen(false)}
        />
      )}
    </div>
  );
}
