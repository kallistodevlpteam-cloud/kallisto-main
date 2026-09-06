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

import { WorkerTrade } from "../types/hands.types";

type HandsProfileTab = "services" | "overview" | "experience" | "reviews";

function getTradePackageIcon(trade: string): React.ElementType {
  const t = trade.toLowerCase();
  if (t.includes("electric") || t.includes("mep")) return Zap;
  if (t.includes("plumb") || t.includes("drain") || t.includes("sanitary")) return Droplets;
  if (t.includes("carpent") || t.includes("wood") || t.includes("join")) return Layers;
  if (t.includes("paint") || t.includes("finish")) return Sparkles;
  if (t.includes("mason") || t.includes("brick") || t.includes("civil")) return Building2;
  if (t.includes("steel") || t.includes("rebar") || t.includes("weld")) return Grid3X3;
  return Users;
}

function TradeCrewLogoTile({ name }: { name: string; trade?: string }) {
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
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(packageId || null);

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
      pricingModelText: "12-day gang shift package",
      features: [
        `Verified squad of ${crew.crewSizeMin || 4} tradesmen & helpers`,
        "Daily shift progress reporting",
        "Lead supervisor coordination",
        "12 working days typical turnaround",
        "2 site inspection checkpoints included",
      ],
      iconType: "standard",
    },
    {
      id: "scaled-squad",
      title: `${crew.trade} Fast-Track Squad`,
      startingPrice: crew.dailyRate * Math.min(crew.crewSizeMax || 16, (crew.crewSizeMin || 4) * 2) * 6,
      durationText: "6 working days",
      pricingModelText: "6-day fast-track deployment",
      features: [
        `High-capacity squad of ${Math.min(crew.crewSizeMax || 16, (crew.crewSizeMin || 4) * 2)} workers`,
        "Rapid mobilization in 48 hours",
        "Dedicated foreman & QA inspections",
        "6 working days fast-track execution",
        "Daily productivity sign-offs",
      ],
      iconType: "fast",
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
                  role="tab"
                  aria-selected={isActive}
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
                {tradePackages.map((pkg) => {
                  const isSelected = selectedPackageId === pkg.id;
                  const PkgIcon = getTradePackageIcon(crew.trade);

                  return (
                    <article
                      className={`${styles.servicePackageCard} ${
                        isSelected ? styles.servicePackageCardSelected : ""
                      }`}
                      key={pkg.id}
                    >
                      <div className={styles.serviceCardHeader}>
                        <div className={styles.serviceCardTitleGroup}>
                          <h2 className={styles.serviceCardTitle}>{pkg.title}</h2>
                          <div className={styles.servicePriceBlock}>
                            <span className={styles.servicePriceMain}>
                              ₹{pkg.startingPrice.toLocaleString("en-IN")}
                            </span>
                            <span className={styles.servicePriceSub}>
                              {pkg.pricingModelText}
                            </span>
                          </div>
                        </div>

                        <div
                          className={styles.serviceCardBadgeWrap}
                          aria-hidden="true"
                        >
                          <div className={styles.serviceCardIconBadge}>
                            <PkgIcon size={20} />
                          </div>
                        </div>
                      </div>

                      <div className={styles.serviceScopeDescription}>
                        Coordinated professional {crew.trade.toLowerCase()} gang with
                        defined deliverables, site foreman supervision, and muster log
                        reports.
                      </div>

                      <ul className={styles.serviceFeatureList}>
                        {pkg.features.map((feature, fIdx) => (
                          <li key={fIdx} className={styles.serviceFeatureItem}>
                            <CheckCircle2
                              size={15}
                              className={styles.serviceCheckIcon}
                              aria-hidden="true"
                            />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>

                      <Link
                        className={styles.serviceActionButtonActive}
                        href={`/hands/trades/${crew.id}/request?packageId=${encodeURIComponent(
                          pkg.id,
                        )}${projectId ? `&projectId=${projectId}` : ""}`}
                        onClick={() => setSelectedPackageId(pkg.id)}
                      >
                        {isSelected ? "Selected ✓" : "Select Plan"}
                      </Link>
                    </article>
                  );
                })}
              </section>

              {/* Unique Request Banner Card */}
              <article className={styles.uniqueRequestCard}>
                <div className={styles.uniqueRequestTextGroup}>
                  <h3 className={styles.uniqueRequestTitle}>
                    Custom Workforce Scope
                  </h3>
                  <p className={styles.uniqueRequestDesc}>
                    Need a specialized trade squad, multi-shift deployment, or
                    custom gang scale? Talk with our workforce deployment desk.
                  </p>
                </div>
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
          initialPackageId={selectedPackageId || undefined}
          onOpenDrawer={() => setDrawerOpen(true)}
        />
      </div>

      {/* Interactive Workforce Request Drawer Modal */}
      {drawerOpen && (
        <WorkforceRequestDrawer
          initialTrade={crew.trade as WorkerTrade}
          initialWorkerCount={crew.crewSizeMin || 4}
          initialStartDate="2026-09-12"
          initialDuration="12 days"
          onClose={() => setDrawerOpen(false)}
        />
      )}
    </div>
  );
}
