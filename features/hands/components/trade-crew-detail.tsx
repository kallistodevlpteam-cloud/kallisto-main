"use client";

import React, { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BadgeCheck,
  Bookmark,
  Briefcase,
  Building2,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  Columns3,
  Compass,
  Droplets,
  Grid3X3,
  IndianRupee,
  Layers,
  MapPin,
  Minus,
  Plus,
  Radar,
  Send,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
  Zap,
} from "lucide-react";
import { getTradeCrewById, type TradeCrew } from "../services/trade-crews.mock";
import { WorkforceRequestDrawer } from "./workforce-request-drawer";
import styles from "./trade-crew-detail.module.css";

interface TradeCrewDetailProps {
  crewId: string;
  projectId?: string;
}

function getBrandInfo(crew: TradeCrew): { name: string; icon: React.ElementType; color: string } {
  const tradeLower = crew.trade.toLowerCase() + " " + crew.category.toLowerCase();

  if (tradeLower.includes("electric") || tradeLower.includes("mep")) {
    return { name: "circuit", icon: Zap, color: "#06b6d4" };
  }
  if (tradeLower.includes("plumb") || tradeLower.includes("sanitary")) {
    return { name: "hydro", icon: Droplets, color: "#38bdf8" };
  }
  if (tradeLower.includes("wood") || tradeLower.includes("carpenter") || tradeLower.includes("formwork")) {
    return { name: "forma", icon: Layers, color: "#10b981" };
  }
  if (tradeLower.includes("steel") || tradeLower.includes("rebar") || tradeLower.includes("reinforce")) {
    return { name: "struct", icon: Grid3X3, color: "#a855f7" };
  }
  if (tradeLower.includes("paint") || tradeLower.includes("finish") || tradeLower.includes("coat")) {
    return { name: "chroma", icon: Sparkles, color: "#f43f5e" };
  }
  if (tradeLower.includes("supervisor") || tradeLower.includes("qa") || tradeLower.includes("manage")) {
    return { name: "siteguard", icon: ShieldCheck, color: "#eab308" };
  }
  if (tradeLower.includes("survey") || tradeLower.includes("qs")) {
    return { name: "geoscan", icon: Compass, color: "#818cf8" };
  }

  // Default Civil / Masonry
  return { name: "apex", icon: Building2, color: "#f97316" };
}

const SECTION_TABS = [
  { id: "overview", label: "Overview" },
  { id: "capabilities", label: "Capabilities" },
  { id: "reviews", label: "Reviews" },
  { id: "availability", label: "Availability" },
];

const SAVED_CREWS_STORAGE_KEY = "kallisto_hands_saved_crews";

function formatDateRange(startStr: string, days: number): string {
  try {
    const start = new Date(startStr);
    if (isNaN(start.getTime())) return `${days} Working Days`;
    const end = new Date(start);
    end.setDate(start.getDate() + Math.max(1, days) - 1);
    const opt: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" };
    return `${start.toLocaleDateString("en-GB", opt)} → ${end.toLocaleDateString("en-GB", opt)} (${days} Working Days)`;
  } catch {
    return `${days} Working Days`;
  }
}

export function TradeCrewDetail({ crewId, projectId }: TradeCrewDetailProps) {
  const crew: TradeCrew | null = useMemo(() => getTradeCrewById(crewId), [crewId]);
  const brand = useMemo(() => (crew ? getBrandInfo(crew) : null), [crew]);
  const BrandIcon = brand?.icon || Building2;

  // Section nav state
  const [activeTab, setActiveTab] = useState<string>("overview");

  // Sticky Request Panel state
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projectId || "project-villa-01");
  const [startDate, setStartDate] = useState<string>("2026-09-12");
  const [durationDays, setDurationDays] = useState<number>(15);
  const [workerCount, setWorkerCount] = useState<number>(crew?.crewComposition?.totalWorkforce || 8);

  // Saved / Bookmark state
  const [isSaved, setIsSaved] = useState<boolean>(false);

  // Workforce Request Drawer modal state
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);

  // Load saved state from storage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(SAVED_CREWS_STORAGE_KEY);
      if (raw) {
        const ids: string[] = JSON.parse(raw);
        setIsSaved(ids.includes(crewId));
      }
    } catch {
      // ignore
    }
  }, [crewId]);

  // Toggle save
  const handleToggleSave = () => {
    try {
      const raw = localStorage.getItem(SAVED_CREWS_STORAGE_KEY);
      const ids: string[] = raw ? JSON.parse(raw) : [];
      let updated: string[];
      if (ids.includes(crewId)) {
        updated = ids.filter((id) => id !== crewId);
        setIsSaved(false);
      } else {
        updated = [...ids, crewId];
        setIsSaved(true);
      }
      localStorage.setItem(SAVED_CREWS_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      setIsSaved((prev) => !prev);
    }
  };

  const scrollToSection = (sectionId: string) => {
    setActiveTab(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      const yOffset = -70; // offset for sticky section nav
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  if (!crew) {
    return (
      <div className={styles.detailContainer}>
        <div className={styles.backNavRow}>
          <Link href="/hands/trades" className={styles.backLink}>
            <ArrowLeft size={16} />
            <span>Back to Find Trades</span>
          </Link>
        </div>
        <div className={styles.identityCard} style={{ textAlign: "center", padding: "40px" }}>
          <h2>Crew Profile Not Found</h2>
          <p style={{ color: "#64748b" }}>
            The requested trade crew record could not be retrieved from the Kallisto Hands registry.
          </p>
          <div style={{ marginTop: "16px" }}>
            <Link href="/hands/trades" className={styles.dominantCtaBtn}>
              Return to Trade Directory
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Calculate live estimate
  const estimatedCost = workerCount * crew.dailyRate * durationDays;

  return (
    <div className={styles.detailContainer}>
      {/* Two Primary Sections Layout: Left Section & Right Section */}
      <div className={styles.twoColLayout}>
        {/* ─── LEFT SECTION: Review the Provider (Hero, Tabs & Details) ─── */}
        <main className={styles.leftStack}>
          {/* 1. Professional Workforce Procurement Profile Header */}
          <section className={styles.workforceHeroSection} aria-label="Team Profile Overview">
            {/* Top Row: Identity Block + Action CTAs */}
            <div className={styles.heroMainRow}>
              <div className={styles.heroIdentityGroup}>
                {/* Compact Team Identity Visual Block */}
                <div className={styles.teamVisualBlock} aria-hidden="true">
                  <div className={styles.teamVisualGrid} />
                  <div className={styles.teamVisualBrand}>
                    <div
                      className={styles.teamVisualIconWrap}
                      style={{
                        color: brand?.color || "#06b6d4",
                        filter: `drop-shadow(0 0 8px ${brand?.color || "#06b6d4"}66)`,
                      }}
                    >
                      <BrandIcon size={20} strokeWidth={2.4} />
                    </div>
                    <span className={styles.teamVisualName}>
                      {brand?.name}
                      <span className={styles.teamVisualDot}>°</span>
                    </span>
                  </div>
                </div>

                {/* Identity Details */}
                <div className={styles.identityDetails}>
                  {/* Title + Verified Badge */}
                  <div className={styles.titleRow}>
                    <h1 className={styles.teamName}>{crew.name}</h1>
                    {crew.verified && (
                      <BadgeCheck
                        size={19}
                        className={styles.verifiedBlueIcon}
                        aria-label="Verified Kallisto Trade Crew"
                      />
                    )}
                  </div>

                  {/* Specialization Line */}
                  <div className={styles.specializationRow}>
                    <span className={styles.categoryText}>{crew.category}</span>
                    <span className={styles.bulletSeparator}>·</span>
                    <span className={styles.skillsText}>
                      {crew.skills?.slice(0, 2).join(" & ") || "RCC Brickwork & Plastering"}
                    </span>
                  </div>
                </div>
              </div>

                {/* Rate Block on Right Side of Title Section */}
                <div className={styles.heroRateBlock}>
                  <div className={styles.heroRateValue}>
                    <IndianRupee size={20} strokeWidth={2.8} className={styles.heroRupeeIcon} aria-hidden="true" />
                    <span>{crew.dailyRate.toLocaleString("en-IN")}</span>
                  </div>
                  <span className={styles.heroRateLabel}>/DAY / WORKER</span>
                </div>
            </div>

            {/* Service Area, Radius & Quick Actions Strip */}
            <div className={styles.serviceAreaSubRow}>
              <div className={styles.serviceAreaWrapper}>
                <MapPin size={15} className={styles.locationPinIcon} aria-hidden="true" />
                <span>
                  Service Area: <strong className={styles.serviceAreaText}>{crew.location}</strong>
                </span>
              </div>

              <div className={styles.serviceAreaRightActions}>
                <div className={styles.serviceRadiusBadge}>
                  <Radar size={13} className={styles.radiusIcon} aria-hidden="true" />
                  <span>45 km service radius</span>
                </div>

                <button
                  type="button"
                  className={`${styles.iconActionButton} ${isSaved ? styles.iconActionButtonActive : ""}`}
                  onClick={handleToggleSave}
                  aria-label={isSaved ? "Remove from shortlist" : "Add to shortlist"}
                  title={isSaved ? "Remove from shortlist" : "Add to shortlist"}
                >
                  <Bookmark size={13} strokeWidth={2.2} fill={isSaved ? "currentColor" : "none"} aria-hidden="true" />
                </button>

                <Link
                  href={`/hands/trades?compare=${crew.id}`}
                  className={styles.iconActionButton}
                  aria-label="Compare with other trade crews"
                  title="Compare with other trade crews"
                >
                  <Columns3 size={13} strokeWidth={2.2} aria-hidden="true" />
                </Link>
              </div>
            </div>

            {/* 3. Strong Scannable Metrics Row */}
            <div className={styles.proofMetricsGrid}>
              <div className={styles.metricTile}>
                <div className={styles.metricTileHeader}>
                  <Briefcase size={15} className={styles.metricCardIcon} aria-hidden="true" />
                  <span className={styles.metricSubLabel}>Experience</span>
                </div>
                <span className={styles.metricBigValue}>{crew.experienceYears} yrs</span>
              </div>

              <div className={styles.metricTile}>
                <div className={styles.metricTileHeader}>
                  <Star size={15} fill="#eab308" color="#eab308" className={styles.metricCardIcon} aria-hidden="true" />
                  <span className={styles.metricSubLabel}>{crew.reviewCount} Reviews</span>
                </div>
                <span className={styles.metricBigValue}>{crew.rating.toFixed(1)}</span>
              </div>

              <div className={styles.metricTile}>
                <div className={styles.metricTileHeader}>
                  <Building2 size={15} className={styles.metricCardIcon} aria-hidden="true" />
                  <span className={styles.metricSubLabel}>Projects Completed</span>
                </div>
                <span className={styles.metricBigValue}>{crew.completedJobs}+</span>
              </div>

              <div className={styles.metricTile}>
                <div className={styles.metricTileHeader}>
                  <Users size={15} className={styles.metricCardIcon} aria-hidden="true" />
                  <span className={styles.metricSubLabel}>Deployable Crew / Site</span>
                </div>
                <span className={styles.metricBigValue}>{crew.crewSizeMin}–{crew.crewSizeMax}</span>
              </div>
            </div>

          </section>

          {/* 2. Horizontal Section Navigation Tabs */}
          <nav className={styles.profileTabs} aria-label="Crew profile sections">
            {SECTION_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={activeTab === tab.id}
                className={`${styles.profileTab} ${activeTab === tab.id ? styles.profileTabActive : ""}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          {/* 3. Section: Overview */}
          {activeTab === "overview" && (
            <section id="overview" className={styles.sectionCard} aria-labelledby="heading-overview">
              <div className={styles.sectionHeaderRow}>
                <h2 id="heading-overview" className={styles.sectionTitle}>Overview</h2>
                <span className={styles.sectionSubtitle}>About the crew & capabilities</span>
              </div>

              <p className={styles.aboutParagraph}>{crew.about}</p>

              <h3 className={styles.bulletListTitle}>Core capabilities</h3>
              <ul className={styles.coreCapabilitiesList}>
                {crew.coreCapabilities?.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </section>
          )}

          {/* 4. Section: Technical Capabilities */}
          {activeTab === "capabilities" && (
            <section id="capabilities" className={styles.sectionCard} aria-labelledby="heading-capabilities">
              <div className={styles.capabilitiesStepGrid}>
                {crew.capabilityRatings?.map((cap, idx) => (
                  <article key={cap.name} className={styles.capabilityStepCard}>
                    <div className={styles.capCardTopRow}>
                      <span className={styles.capMetricTimeline}>
                        {cap.timelineOrMetric || (cap.verifiedSites ? `${cap.verifiedSites} verified sites` : "Standard shift")}
                      </span>
                      <span className={styles.capStepBadge}>{cap.step || `STEP ${idx + 1}`}</span>
                    </div>

                    <h3 className={styles.capStepTitle}>{cap.name}</h3>

                    {cap.description && (
                      <p className={styles.capStepDescription}>{cap.description}</p>
                    )}
                  </article>
                ))}
              </div>
            </section>
          )}

          {/* 5. Section: Client Reviews */}
          {activeTab === "reviews" && (
            <section id="reviews" className={styles.sectionCard} aria-labelledby="heading-reviews">
              <div className={styles.sectionHeaderRow}>
                <h2 id="heading-reviews" className={styles.sectionTitle}>Our Customer Reviews</h2>
                <span className={styles.sectionSubtitle}>Audited ratings from verified clients & contractors</span>
              </div>

              {/* Top Overview: Score Hero Card (Left) + Star Breakdown (Right) */}
              <div className={styles.reviewsHeroContainer}>
                {/* Left Card: 4.3 / 4.9 Score + 5 Stars + Total Ratings */}
                <div className={styles.scoreHeroCard}>
                  <span className={styles.scoreHeroValue}>
                    {crew.reviewsBreakdown?.overallScore.toFixed(1) || "4.9"}
                  </span>
                  <div className={styles.scoreHeroStars} aria-label={`${crew.reviewsBreakdown?.overallScore || 4.9} out of 5 stars`}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} size={18} fill="#6366f1" color="#6366f1" />
                    ))}
                  </div>
                  <span className={styles.scoreHeroCount}>
                    {crew.reviewsBreakdown?.totalRatings || crew.reviewCount || 42} Ratings
                  </span>
                </div>

                {/* Right Breakdown: 5.0, 4.0, 3.0, 2.0, 1.0 */}
                <div className={styles.starDistributionList}>
                  {crew.reviewsBreakdown?.starDistribution?.map((item) => (
                    <div key={item.starLabel} className={styles.starDistRow}>
                      <span className={styles.starDistLabel}>{item.starLabel}</span>
                      <div className={styles.starDistTrack} aria-hidden="true">
                        <div
                          className={styles.starDistFill}
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                      <span className={styles.starDistCount}>{item.countLabel}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Customer Reviews List */}
              <div className={styles.customerReviewsList}>
                {crew.reviewsBreakdown?.testimonials.map((t) => (
                  <article key={t.id} className={styles.customerReviewItem}>
                    <div className={styles.reviewHeaderRow}>
                      <div className={styles.reviewUserWrap}>
                        <div className={styles.reviewAvatar} aria-hidden="true">
                          {t.author.charAt(0)}
                        </div>
                        <div className={styles.reviewUserMeta}>
                          <h3 className={styles.reviewUserName}>{t.author}</h3>
                          <span className={styles.reviewDate}>{t.date}</span>
                        </div>
                      </div>

                      <div className={styles.reviewStarsRow} aria-label={`${t.rating} out of 5 stars`}>
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            size={14}
                            fill={s <= t.rating ? "#6366f1" : "none"}
                            color={s <= t.rating ? "#6366f1" : "#cbd5e1"}
                            strokeWidth={s <= t.rating ? 0 : 2}
                            aria-hidden="true"
                          />
                        ))}
                      </div>
                    </div>

                    <p className={styles.reviewComment}>{t.comment}</p>

                    {t.photos && t.photos.length > 0 && (
                      <div className={styles.reviewPhotosRow}>
                        {t.photos.map((photo, pIdx) => (
                          <img
                            key={pIdx}
                            src={photo}
                            alt={`Site work photo ${pIdx + 1} by ${t.author}`}
                            className={styles.reviewThumbPhoto}
                            loading="lazy"
                          />
                        ))}
                      </div>
                    )}
                  </article>
                ))}
              </div>
            </section>
          )}

          {/* 7. Section: Availability */}
          {activeTab === "availability" && (
            <section id="availability" className={styles.sectionCard} aria-labelledby="heading-availability">
              <div className={styles.sectionHeaderRow}>
                <h2 id="heading-availability" className={styles.sectionTitle}>Availability</h2>
                <span className={styles.sectionSubtitle}>Current deployment calendar</span>
              </div>

              <div className={styles.availabilityCardContent}>
                <h3 className={styles.calendarMonthTitle}>
                  {crew.availabilitySchedule?.monthName} {crew.availabilitySchedule?.year}
                </h3>

                <div className={styles.calendarGrid}>
                  {crew.availabilitySchedule?.days.map((day, idx) => (
                    <div key={idx} className={styles.calendarDayCell}>
                      <span className={styles.calendarWeekday}>{day.weekday}</span>
                      <span className={styles.calendarDayNum}>{day.day}</span>
                      <span
                        className={
                          day.status === "available"
                            ? styles.statusDotAvailable
                            : day.status === "partially_available"
                            ? styles.statusDotPartial
                            : styles.statusDotDeployed
                        }
                        title={day.status}
                        aria-label={`Day ${day.day}: ${day.status}`}
                      />
                    </div>
                  ))}
                </div>

                <div className={styles.legendRow}>
                  <div className={styles.legendItem}>
                    <span className={styles.statusDotAvailable} aria-hidden="true" />
                    <span>Available</span>
                  </div>
                  <div className={styles.legendItem}>
                    <span className={styles.statusDotPartial} aria-hidden="true" />
                    <span>Partially available</span>
                  </div>
                  <div className={styles.legendItem}>
                    <span className={styles.statusDotDeployed} aria-hidden="true" />
                    <span>Deployed</span>
                  </div>
                </div>

                <div className={styles.availabilityStatusBanner}>
                  <div>
                    <div className={styles.bannerLabel}>Next available:</div>
                    <div className={styles.bannerValue}>
                      {crew.availabilitySchedule?.nextAvailableDate || "Immediate"}
                    </div>
                  </div>
                  <div>
                    <div className={styles.bannerLabel}>Current deployment:</div>
                    <div className={styles.bannerValue}>
                      {crew.availabilitySchedule?.currentDeploymentText || "None (Ready for site dispatch)"}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}
        </main>

        {/* ─── RIGHT SECTION: Sticky Deployment Request Panel ─── */}
        <aside className={styles.stickyPanelWrap} aria-label="Deployment Request Calculator">
          <div className={styles.stickyRequestPanel}>
            <h2 className={styles.requestPanelTitle}>Request This Crew</h2>

            {/* Project Selector */}
            <div className={styles.fieldGroup}>
              <label htmlFor="req-project" className={styles.fieldLabel}>
                Your Project
              </label>
              <select
                id="req-project"
                className={styles.selectInput}
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
              >
                <option value="project-villa-01">Green Valley Residence (Kochi)</option>
                <option value="project-apt-02">Skyline Heights Phase 1 (Ernakulam)</option>
                <option value="project-comm-03">Metro Commercial Hub (Kakkanad)</option>
              </select>
            </div>

            {/* Deployment Timeline */}
            <div className={styles.fieldGroup}>
              <div className={styles.fieldLabelRow}>
                <label htmlFor="req-start-date" className={styles.fieldLabel}>
                  Deployment Timeline
                </label>
                <button
                  type="button"
                  className={styles.quickPresetLink}
                  onClick={() => setStartDate("2026-08-28")}
                >
                  Earliest: 28 Aug
                </button>
              </div>
              <div className={styles.dateRangePickerWrap}>
                <input
                  id="req-start-date"
                  type="date"
                  className={styles.dateInput}
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
                <div className={styles.dateRangeResultBadge}>
                  <span>{formatDateRange(startDate, durationDays)}</span>
                </div>
              </div>
            </div>

            {/* Duration Selector with Input & Quick Presets */}
            <div className={styles.fieldGroup}>
              <div className={styles.fieldLabelRow}>
                <label htmlFor="req-duration-input" className={styles.fieldLabel}>
                  Duration (Days)
                </label>
                <span className={styles.fieldHelperHint}>Standard 8h Shift</span>
              </div>
              <div className={styles.stepperRow}>
                <button
                  type="button"
                  className={styles.stepperBtn}
                  onClick={() => setDurationDays((prev) => Math.max(1, prev - 1))}
                  aria-label="Decrease duration by 1 day"
                >
                  <Minus size={14} />
                </button>
                <div className={styles.stepperInputWrap}>
                  <input
                    id="req-duration-input"
                    type="number"
                    min="1"
                    max="180"
                    className={styles.stepperNumberInput}
                    value={durationDays}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      setDurationDays(isNaN(val) ? 1 : Math.max(1, Math.min(180, val)));
                    }}
                    aria-label="Duration in days"
                  />
                  <span className={styles.stepperUnitLabel}>days</span>
                </div>
                <button
                  type="button"
                  className={styles.stepperBtn}
                  onClick={() => setDurationDays((prev) => prev + 1)}
                  aria-label="Increase duration by 1 day"
                >
                  <Plus size={14} />
                </button>
              </div>
              <div className={styles.quickPresetsRow} role="group" aria-label="Duration quick presets">
                {[
                  { days: 6, label: "6d (1 Wk)" },
                  { days: 12, label: "12d (2 Wks)" },
                  { days: 15, label: "15d" },
                  { days: 24, label: "24d (1 Mo)" },
                ].map((item) => (
                  <button
                    key={item.days}
                    type="button"
                    className={`${styles.presetChip} ${durationDays === item.days ? styles.presetChipActive : ""}`}
                    onClick={() => setDurationDays(item.days)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Crew Size Selector with Input & Gang Presets */}
            <div className={styles.fieldGroup}>
              <div className={styles.fieldLabelRow}>
                <label htmlFor="req-crew-size-input" className={styles.fieldLabel}>
                  Crew Size
                </label>
                <span className={styles.fieldHelperHint}>Min {crew.crewSizeMin} · Max {crew.crewSizeMax}</span>
              </div>
              <div className={styles.stepperRow}>
                <button
                  type="button"
                  className={styles.stepperBtn}
                  onClick={() => setWorkerCount((prev) => Math.max(crew.crewSizeMin, prev - 1))}
                  aria-label="Decrease crew size by 1 worker"
                >
                  <Minus size={14} />
                </button>
                <div className={styles.stepperInputWrap}>
                  <input
                    id="req-crew-size-input"
                    type="number"
                    min={crew.crewSizeMin}
                    max={crew.crewSizeMax}
                    className={styles.stepperNumberInput}
                    value={workerCount}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      setWorkerCount(isNaN(val) ? crew.crewSizeMin : Math.max(crew.crewSizeMin, Math.min(crew.crewSizeMax, val)));
                    }}
                    aria-label="Crew size in workers"
                  />
                  <span className={styles.stepperUnitLabel}>workers</span>
                </div>
                <button
                  type="button"
                  className={styles.stepperBtn}
                  onClick={() => setWorkerCount((prev) => Math.min(crew.crewSizeMax, prev + 1))}
                  aria-label="Increase crew size by 1 worker"
                >
                  <Plus size={14} />
                </button>
              </div>
              <div className={styles.quickPresetsRow} role="group" aria-label="Crew size quick presets">
                {[
                  { count: 4, label: "4 (Min)" },
                  { count: 8, label: "8 (Std Gang)" },
                  { count: 12, label: "12 (Squad)" },
                  { count: 16, label: "16 (Double)" },
                ].map((item) => (
                  <button
                    key={item.count}
                    type="button"
                    className={`${styles.presetChip} ${workerCount === item.count ? styles.presetChipActive : ""}`}
                    onClick={() => setWorkerCount(item.count)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              <span className={styles.fieldSubHelper}>
                Minimum gang: {crew.crewSizeMin} masons/helpers · Scalable up to {crew.crewSizeMax} workers per shift
              </span>
            </div>

            {/* Live Cost Calculation Summary Box */}
            <div className={styles.costSummaryBox}>
              <div className={styles.costCalcFormula}>
                {workerCount} Workers × ₹{crew.dailyRate.toLocaleString("en-IN")} / Day × {durationDays} Days
              </div>
              <div className={styles.costTotalRow}>
                <span className={styles.costTotalLabel}>Estimated Cost</span>
                <span className={styles.costTotalAmount}>
                  ₹{estimatedCost.toLocaleString("en-IN")}
                </span>
              </div>
              <p className={styles.costDisclaimerSubtext}>
                *Standard 8-hour shift rate. Excludes GST (18%), site accommodation allowances, scaffolding, and raw materials.
              </p>
            </div>

            {/* Submit Action */}
            <button
              type="button"
              className={styles.submitDeploymentBtn}
              onClick={() => setDrawerOpen(true)}
            >
              <span>Request Deployment</span>
              <ChevronRight size={16} aria-hidden="true" />
            </button>

            {/* Authoritative Trust Guarantees */}
            <div className={styles.trustList}>
              <div className={styles.trustItem}>
                <Check size={14} className={styles.trustCheckIcon} aria-hidden="true" />
                <div className={styles.trustItemContent}>
                  <strong className={styles.trustItemTitle}>Government ID & KYC Verified Roster</strong>
                  <span className={styles.trustItemDesc}>100% skill-certified & background-checked</span>
                </div>
              </div>
              <div className={styles.trustItem}>
                <Check size={14} className={styles.trustCheckIcon} aria-hidden="true" />
                <div className={styles.trustItemContent}>
                  <strong className={styles.trustItemTitle}>Kallisto GPS & Digital Muster Roll</strong>
                  <span className={styles.trustItemDesc}>Biometric check-in with verified shift logs</span>
                </div>
              </div>
              <div className={styles.trustItem}>
                <Check size={14} className={styles.trustCheckIcon} aria-hidden="true" />
                <div className={styles.trustItemContent}>
                  <strong className={styles.trustItemTitle}>Guaranteed Capacity Lock</strong>
                  <span className={styles.trustItemDesc}>Real-time booking with zero double-booking</span>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Interactive Workforce Request Drawer Modal */}
      {drawerOpen && (
        <WorkforceRequestDrawer
          initialTrade={crew.trade as any}
          initialWorkerCount={workerCount}
          initialStartDate={startDate}
          initialDuration={`${durationDays} days`}
          onClose={() => setDrawerOpen(false)}
        />
      )}
    </div>
  );
}
