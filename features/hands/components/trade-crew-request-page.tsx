"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BadgeCheck,
  Calendar,
  Check,
  ChevronDown,
  ChevronRight,
  HardHat,
  MapPin,
  Minus,
  Plus,
  ShieldCheck,
  Users,
} from "lucide-react";
import { RupeeIcon } from "@/components/layout/sidebar-icons";
import { getTradeCrewById } from "@/features/hands/services/trade-crews.mock";
import { WorkforceRequestDrawer } from "@/features/hands/components/workforce-request-drawer";
import styles from "./trade-crew-request-page.module.css";

interface TradeCrewRequestPageProps {
  crewId: string;
  projectId?: string;
}

export function TradeCrewRequestPage({
  crewId,
  projectId = "project-villa-01",
}: TradeCrewRequestPageProps) {
  const crew = useMemo(() => getTradeCrewById(crewId), [crewId]);

  // Request Form States
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projectId);
  const [startDate, setStartDate] = useState<string>("2026-08-28");
  const [durationDays, setDurationDays] = useState<number>(15);
  const [workerCount, setWorkerCount] = useState<number>(
    crew ? Math.min(crew.crewSizeMax, Math.max(crew.crewSizeMin, 8)) : 8
  );
  const [siteNotes, setSiteNotes] = useState<string>("");
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);

  if (!crew) {
    return (
      <div className={styles.requestPageContainer}>
        <div className={styles.backNavRow}>
          <Link href="/hands/trades" className={styles.backLink}>
            <ArrowLeft size={14} aria-hidden="true" />
            <span>Return to Trade Directory</span>
          </Link>
        </div>
        <div className={styles.headerSection}>
          <h1 className={styles.pageTitle}>Crew Not Found</h1>
          <p className={styles.pageSubtitle}>
            The trade crew profile could not be located.
          </p>
        </div>
      </div>
    );
  }

  // Cost calculation
  const estimatedCost = workerCount * crew.dailyRate * durationDays;

  // Format date range text
  const formatDateRange = (start: string, days: number) => {
    try {
      const d1 = new Date(start);
      if (isNaN(d1.getTime())) return `${start} (${days} Working Days)`;
      const d2 = new Date(d1);
      d2.setDate(d1.getDate() + Math.max(1, days - 1));
      const opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" };
      return `${d1.toLocaleDateString("en-GB", opts)} — ${d2.toLocaleDateString("en-GB", opts)} (${days} Working Days)`;
    } catch {
      return `${start} (${days} Working Days)`;
    }
  };

  return (
    <div className={styles.requestPageContainer}>
      {/* 1. Back Nav */}
      <div className={styles.backNavRow}>
        <Link href={`/hands/trades/${crew.id}`} className={styles.backLink}>
          <ArrowLeft size={14} aria-hidden="true" />
          <span>Back to {crew.name}</span>
        </Link>
      </div>

      {/* 2. Page Header */}
      <header className={styles.headerSection}>
        <h1 className={styles.pageTitle}>Request Workforce Deployment</h1>
        <p className={styles.pageSubtitle}>
          Configure your deployment timeline, squad sizing, and verified mobilization schedule.
        </p>
      </header>

      {/* 3. Crew Summary Banner */}
      <div className={styles.crewSummaryBanner}>
        <div className={styles.crewSummaryLeft}>
          <div className={styles.crewVisualBadge}>
            <HardHat size={22} strokeWidth={2.2} />
          </div>
          <div className={styles.crewInfoCol}>
            <div className={styles.crewNameRow}>
              <h2 className={styles.crewName}>{crew.name}</h2>
              {crew.verified && (
                <BadgeCheck
                  size={17}
                  className={styles.verifiedBlueIcon}
                  aria-label="Verified Kallisto Trade Crew"
                />
              )}
            </div>
            <div className={styles.crewMetaRow}>
              <span>{crew.category}</span>
              <span className={styles.crewMetaSeparator}>·</span>
              <span className={styles.locationWrapper}>
                <MapPin size={12} style={{ display: "inline", verticalAlign: "middle", marginRight: 2 }} />
                {crew.location}
              </span>
              <span className={styles.crewMetaSeparator}>·</span>
              <span>⭐ {crew.rating.toFixed(1)} ({crew.completedJobs} verified sites)</span>
            </div>
          </div>
        </div>

        <div className={styles.crewSummaryRight}>
          <div className={styles.rateBlock}>
            <div className={styles.rateValue}>
              <RupeeIcon size={16} aria-hidden="true" />
              <span>{crew.dailyRate.toLocaleString("en-IN")}</span>
            </div>
            <span className={styles.rateLabel}>/DAY / WORKER</span>
          </div>
        </div>
      </div>

      {/* 4. Main Request Configuration & Summary Grid */}
      <div className={styles.mainGrid}>
        {/* Left Form Card */}
        <div className={styles.configCard}>
          {/* Project Selector */}
          <div className={styles.fieldGroup}>
            <label htmlFor="req-project-select" className={styles.fieldLabel}>
              Select Project
            </label>
            <div className={styles.selectWrapper}>
              <select
                id="req-project-select"
                className={styles.selectInput}
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
              >
                <option value="project-villa-01">Green Valley Residence (Kochi)</option>
                <option value="project-apt-02">Skyline Heights Phase 1 (Ernakulam)</option>
                <option value="project-comm-03">Metro Commercial Hub (Kakkanad)</option>
              </select>
              <ChevronDown size={14} className={styles.selectChevron} aria-hidden="true" />
            </div>
          </div>

          {/* Deployment Timeline */}
          <div className={styles.fieldGroup}>
            <div className={styles.fieldLabelRow}>
              <label htmlFor="req-start-date-input" className={styles.fieldLabel}>
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
                id="req-start-date-input"
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

          {/* Duration Selector */}
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

          {/* Crew Size Selector */}
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

          {/* Site Notes / Special Instructions */}
          <div className={styles.fieldGroup}>
            <label htmlFor="req-site-notes" className={styles.fieldLabel}>
              Site Requirements & Instructions (Optional)
            </label>
            <textarea
              id="req-site-notes"
              className={styles.notesInput}
              placeholder="e.g. Scaffolding provided on-site, safety helmets required, specific supervisor contact..."
              value={siteNotes}
              onChange={(e) => setSiteNotes(e.target.value)}
            />
          </div>
        </div>

        {/* Right Summary Card */}
        <aside className={styles.summaryCard} aria-label="Cost and Mobilization Summary">
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
