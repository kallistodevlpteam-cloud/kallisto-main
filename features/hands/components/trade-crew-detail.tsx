"use client";

import React, { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Bookmark,
  Building2,
  Check,
  CheckCircle2,
  ChevronRight,
  Columns3,
  Compass,
  Droplets,
  Grid3X3,
  Layers,
  MapPin,
  Minus,
  Plus,
  Send,
  ShieldCheck,
  Sparkles,
  Star,
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
  { id: "crew", label: "Crew" },
  { id: "deployments", label: "Deployments" },
  { id: "reviews", label: "Reviews" },
  { id: "availability", label: "Availability" },
  { id: "documents", label: "Documents" },
];

const SAVED_CREWS_STORAGE_KEY = "kallisto_hands_saved_crews";

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
      {/* Back Navigation & Breadcrumbs */}
      <nav className={styles.backNavRow} aria-label="Breadcrumb navigation">
        <Link href="/hands/trades" className={styles.backLink}>
          <ArrowLeft size={16} aria-hidden="true" />
          <span>Back to Find Trades</span>
        </Link>
        <span className={styles.breadcrumbCategory}>
          Hands / {crew.category}
        </span>
      </nav>

      {/* Two Primary Sections Layout: Left Section & Right Section */}
      <div className={styles.twoColLayout}>
        {/* ─── LEFT SECTION: Identity, Tabs & Detailed Profiles ─── */}
        <div className={styles.leftStack}>
          {/* 1. Crew Identity Header Card */}
          <header className={styles.identityCard} aria-label={`${crew.name} identity overview`}>
            <div className={styles.identityMainRow}>
              <div className={styles.identityLeft}>
                {/* Wide Horizontal Dark Brand Emblem Card */}
                <div className={styles.brandEmblemBox} aria-hidden="true">
                  <div className={styles.brandCoverGrid} />
                  <div className={styles.brandMarkContent}>
                    <div
                      className={styles.brandIconWrap}
                      style={{
                        color: brand?.color || "#06b6d4",
                        filter: `drop-shadow(0 0 8px ${brand?.color || "#06b6d4"}66)`,
                      }}
                    >
                      <BrandIcon size={20} strokeWidth={2.4} />
                    </div>
                    <span className={styles.brandText}>
                      {brand?.name}
                      <span className={styles.brandDot}>°</span>
                    </span>
                  </div>
                </div>

                <div className={styles.identityInfo}>
                  <div className={styles.crewTitleRow}>
                    <h1 className={styles.crewName}>{crew.name}</h1>
                    <div className={styles.ratingBadge}>
                      <Star size={13} fill="#eab308" color="#eab308" aria-hidden="true" />
                      <span>{crew.rating.toFixed(1)}</span>
                    </div>
                    {crew.verified && (
                      <div className={styles.verifiedBadge}>
                        <CheckCircle2 size={13} aria-hidden="true" />
                        <span>Verified</span>
                      </div>
                    )}
                  </div>

                  <div className={styles.crewSubtitleRow}>
                    <span>{crew.category}</span>
                    <span className={styles.subtitleDot}>•</span>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 3 }}>
                      <MapPin size={13} aria-hidden="true" />
                      {crew.location}
                    </span>
                  </div>

                  {/* 3-metric strip */}
                  <div className={styles.metricsStrip}>
                    <div className={styles.metricItem}>
                      <strong>{crew.experienceYears} yrs</strong> experience
                    </div>
                    <div className={styles.metricDivider} aria-hidden="true" />
                    <div className={styles.metricItem}>
                      <strong>{crew.completedJobs}+</strong> deployments
                    </div>
                    <div className={styles.metricDivider} aria-hidden="true" />
                    <div className={styles.metricItem}>
                      <strong>{crew.crewSizeMin}–{crew.crewSizeMax}</strong> workers
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Rate & Action Buttons inside Header */}
              <div className={styles.identityRight}>
                <div className={styles.rateBlock}>
                  <div className={styles.ratePrice}>
                    ₹{crew.dailyRate.toLocaleString("en-IN")}
                  </div>
                  <div className={styles.rateUnit}>/ day / worker</div>
                </div>

                <div className={styles.actionButtonsRow}>
                  <button
                    type="button"
                    className={`${styles.secondaryActionBtn} ${isSaved ? styles.secondaryActionBtnActive : ""}`}
                    onClick={handleToggleSave}
                    aria-pressed={isSaved}
                    title={isSaved ? "Remove from shortlist" : "Add to shortlist"}
                  >
                    <Bookmark size={15} fill={isSaved ? "currentColor" : "none"} aria-hidden="true" />
                    <span>{isSaved ? "Shortlisted" : "Add to Shortlist"}</span>
                  </button>

                  <Link
                    href={`/hands/trades?compare=${crew.id}`}
                    className={styles.secondaryActionBtn}
                    title="Compare with other trade crews"
                  >
                    <Columns3 size={15} aria-hidden="true" />
                    <span>Compare</span>
                  </Link>
                </div>
              </div>
            </div>
          </header>

          {/* 2. Horizontal Sticky Section Navigation Tab Strip */}
          <nav className={styles.sectionNavWrapper} aria-label="Profile section navigation">
            <div className={styles.sectionNavList} role="tablist">
              {SECTION_TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  className={`${styles.navTabBtn} ${activeTab === tab.id ? styles.navTabBtnActive : ""}`}
                  onClick={() => scrollToSection(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </nav>

          {/* 3. Section: Overview */}
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

          {/* 4. Section: Capabilities */}
          <section id="capabilities" className={styles.sectionCard} aria-labelledby="heading-capabilities">
            <div className={styles.sectionHeaderRow}>
              <h2 id="heading-capabilities" className={styles.sectionTitle}>Capabilities</h2>
              <span className={styles.sectionSubtitle}>{crew.category}</span>
            </div>

            <div className={styles.capabilitiesGrid}>
              {crew.capabilityRatings?.map((cap) => (
                <div key={cap.name} className={styles.capabilityRow}>
                  <span className={styles.capabilityName}>{cap.name}</span>
                  <div className={styles.dotRatingWrap} aria-label={`${cap.rating} out of 5 stars`}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        className={star <= cap.rating ? styles.dotFilled : styles.dotEmpty}
                        aria-hidden="true"
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <h3 className={styles.bulletListTitle}>Specializations</h3>
            <div className={styles.specializationsWrap}>
              {crew.specializations?.map((spec) => (
                <span key={spec} className={styles.specBadge}>
                  {spec}
                </span>
              ))}
            </div>
          </section>

          {/* 5. Section: Crew Composition */}
          <section id="crew" className={styles.sectionCard} aria-labelledby="heading-crew">
            <div className={styles.sectionHeaderRow}>
              <h2 id="heading-crew" className={styles.sectionTitle}>Crew Composition</h2>
              <span className={styles.sectionSubtitle}>Structured workforce distribution</span>
            </div>

            <div className={styles.crewCompositionWrap}>
              <div className={styles.crewBigStatBox}>
                <span className={styles.crewBigCount}>
                  {crew.crewComposition?.totalWorkforce || 8}
                </span>
                <span className={styles.crewBigLabel}>Total Workforce</span>
              </div>

              <div className={styles.rolesGrid}>
                {crew.crewComposition?.roles.map((role) => (
                  <div key={role.role} className={styles.roleCard}>
                    <span className={styles.roleCount}>{role.count}</span>
                    <span className={styles.roleName}>{role.role}</span>
                  </div>
                ))}
              </div>

              <div className={styles.deploymentSpecsStrip}>
                <div className={styles.depSpecItem}>
                  <span className={styles.depSpecLabel}>Typical deployment</span>
                  <span className={styles.depSpecValue}>
                    {crew.crewComposition?.typicalDeployment || "8–12 workers"}
                  </span>
                </div>
                <div className={styles.depSpecItem}>
                  <span className={styles.depSpecLabel}>Maximum deployment</span>
                  <span className={styles.depSpecValue}>
                    {crew.crewComposition?.maxDeployment || 24} workers
                  </span>
                </div>
                <div className={styles.depSpecItem}>
                  <span className={styles.depSpecLabel}>Crew lead</span>
                  <span className={styles.depSpecValue}>
                    {crew.crewComposition?.crewLeadTitle || "Verified Site Supervisor"}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* 6. Section: Recent Deployments */}
          <section id="deployments" className={styles.sectionCard} aria-labelledby="heading-deployments">
            <div className={styles.sectionHeaderRow}>
              <h2 id="heading-deployments" className={styles.sectionTitle}>Recent Deployments</h2>
              <span className={styles.sectionSubtitle}>Verified project delivery record</span>
            </div>

            <div className={styles.deploymentsList}>
              {crew.recentDeployments?.map((dep) => (
                <div key={dep.id} className={styles.deploymentCard}>
                  <div className={styles.deploymentTopRow}>
                    <h3 className={styles.deploymentProjectName}>{dep.projectName}</h3>
                    <div className={styles.deploymentRating}>
                      <Star size={11} fill="#eab308" color="#eab308" aria-hidden="true" />
                      <span>{dep.rating.toFixed(1)}</span>
                    </div>
                  </div>

                  <div className={styles.deploymentScopeRow}>
                    {dep.scopeTags.map((tag) => (
                      <span key={tag} className={styles.scopeTag}>{tag}</span>
                    ))}
                  </div>

                  <div className={styles.deploymentMetaRow}>
                    <span>{dep.workerCount} workers</span>
                    <span>•</span>
                    <span>{dep.durationDays} days</span>
                    <span>•</span>
                    <span style={{ color: "#15803d", fontWeight: 600 }}>{dep.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 7. Section: Client Reviews */}
          <section id="reviews" className={styles.sectionCard} aria-labelledby="heading-reviews">
            <div className={styles.sectionHeaderRow}>
              <h2 id="heading-reviews" className={styles.sectionTitle}>Client Reviews</h2>
              <span className={styles.sectionSubtitle}>Audited ratings from verified contractors</span>
            </div>

            <div className={styles.reviewsOverviewBox}>
              <div className={styles.overallScoreBox}>
                <span className={styles.overallScoreValue}>
                  {crew.reviewsBreakdown?.overallScore.toFixed(1) || "4.9"}
                </span>
                <span style={{ fontSize: 13, color: "#64748b", fontWeight: 600 }}>out of 5</span>
                <div className={styles.overallScoreStars} aria-hidden="true">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} size={14} fill="#eab308" color="#eab308" />
                  ))}
                </div>
              </div>

              <div className={styles.metricsBarsList}>
                {crew.reviewsBreakdown?.metrics.map((metric) => (
                  <div key={metric.label} className={styles.metricBarRow}>
                    <span className={styles.metricBarLabel}>{metric.label}</span>
                    <div className={styles.barTrack} aria-hidden="true">
                      <div
                        className={styles.barFill}
                        style={{ width: `${(metric.score / 5) * 100}%` }}
                      />
                    </div>
                    <span className={styles.metricBarScore}>{metric.score.toFixed(1)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.testimonialsList}>
              {crew.reviewsBreakdown?.testimonials.map((t) => (
                <div key={t.id} className={styles.testimonialCard}>
                  <p className={styles.testimonialComment}>"{t.comment}"</p>
                  <div className={styles.testimonialAuthorRow}>
                    <strong style={{ color: "#0f172a" }}>— {t.author}</strong>
                    <span>•</span>
                    <span>{t.location}</span>
                    <span>•</span>
                    <span>{t.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 8. Section: Availability */}
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

          {/* 9. Section: Kallisto Verification & Documents */}
          <section id="documents" className={styles.sectionCard} aria-labelledby="heading-documents">
            <div className={styles.sectionHeaderRow}>
              <h2 id="heading-documents" className={styles.sectionTitle}>Kallisto Verification</h2>
              <span className={styles.sectionSubtitle}>Trust & safety credential checks</span>
            </div>

            <div className={styles.verificationList}>
              <div className={styles.verificationItem}>
                <Check size={16} className={styles.checkIcon} aria-hidden="true" />
                <span>Identity verified</span>
              </div>
              <div className={styles.verificationItem}>
                <Check size={16} className={styles.checkIcon} aria-hidden="true" />
                <span>Crew lead verified</span>
              </div>
              <div className={styles.verificationItem}>
                <Check size={16} className={styles.checkIcon} aria-hidden="true" />
                <span>Experience verified</span>
              </div>
              <div className={styles.verificationItem}>
                <Check size={16} className={styles.checkIcon} aria-hidden="true" />
                <span>Previous deployments verified</span>
              </div>
              <div className={styles.verificationItem}>
                <Check size={16} className={styles.checkIcon} aria-hidden="true" />
                <span>Skill assessment completed</span>
              </div>
              <div className={styles.verificationItem}>
                <Check size={16} className={styles.checkIcon} aria-hidden="true" />
                <span>Documents verified</span>
              </div>
            </div>

            <div className={styles.verificationFooterRow}>
              <span className={styles.lastVerifiedText}>
                Last verification: {crew.verification?.lastVerificationDate || "18 Aug 2026"}
              </span>
              <button
                type="button"
                className={styles.secondaryActionBtn}
                onClick={() => setDrawerOpen(true)}
              >
                <ShieldCheck size={14} aria-hidden="true" />
                <span>View Verification Details</span>
              </button>
            </div>
          </section>
        </div>

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

            {/* Start Date */}
            <div className={styles.fieldGroup}>
              <label htmlFor="req-start-date" className={styles.fieldLabel}>
                Start date
              </label>
              <input
                id="req-start-date"
                type="date"
                className={styles.dateInput}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            {/* Duration Stepper */}
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>
                Duration (Days)
              </label>
              <div className={styles.stepperRow}>
                <button
                  type="button"
                  className={styles.stepperBtn}
                  onClick={() => setDurationDays((prev) => Math.max(1, prev - 1))}
                  aria-label="Decrease duration by 1 day"
                >
                  <Minus size={14} />
                </button>
                <div className={styles.stepperDisplay}>{durationDays} days</div>
                <button
                  type="button"
                  className={styles.stepperBtn}
                  onClick={() => setDurationDays((prev) => prev + 1)}
                  aria-label="Increase duration by 1 day"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>

            {/* Crew Size Stepper */}
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>
                Crew size
              </label>
              <div className={styles.stepperRow}>
                <button
                  type="button"
                  className={styles.stepperBtn}
                  onClick={() => setWorkerCount((prev) => Math.max(crew.crewSizeMin, prev - 1))}
                  aria-label="Decrease crew size by 1 worker"
                >
                  <Minus size={14} />
                </button>
                <div className={styles.stepperDisplay}>{workerCount} workers</div>
                <button
                  type="button"
                  className={styles.stepperBtn}
                  onClick={() => setWorkerCount((prev) => Math.min(crew.crewSizeMax, prev + 1))}
                  aria-label="Increase crew size by 1 worker"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>

            {/* Live Cost Calculation Summary Box */}
            <div className={styles.costSummaryBox}>
              <div className={styles.costCalcFormula}>
                {workerCount} workers × ₹{crew.dailyRate.toLocaleString("en-IN")} × {durationDays} days
              </div>
              <div className={styles.costTotalRow}>
                <span className={styles.costTotalLabel}>Estimated Cost</span>
                <span className={styles.costTotalAmount}>
                  ₹{estimatedCost.toLocaleString("en-IN")}
                </span>
              </div>
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

            {/* Trust Badges */}
            <div className={styles.trustList}>
              <div className={styles.trustItem}>
                <Check size={14} aria-hidden="true" />
                <span>Verified crew</span>
              </div>
              <div className={styles.trustItem}>
                <Check size={14} aria-hidden="true" />
                <span>Kallisto tracked</span>
              </div>
              <div className={styles.trustItem}>
                <Check size={14} aria-hidden="true" />
                <span>Availability checked</span>
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
