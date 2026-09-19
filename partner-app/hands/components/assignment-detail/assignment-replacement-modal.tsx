"use client";

import React, { useState } from "react";
import { X, Search, Calendar as CalendarIcon, ArrowRightLeft, Check, ChevronLeft, ChevronRight, UserCheck, Sparkles } from "lucide-react";
import { AssignedWorkerRecord } from "../../types/assignment-domain";
import styles from "./assignment-detail.module.css";

export interface ReplacementCandidate {
  id: string;
  name: string;
  trade: string;
  level: string;
  experienceYears: number;
  dailyRate: number;
  initials: string;
  phone: string;
  status: "Ready for assignment";
}

export interface ReplacementPair {
  worker: AssignedWorkerRecord;
  candidate: ReplacementCandidate | null;
}


const CANDIDATES_POOL: ReplacementCandidate[] = [
  // Masons
  {
    id: "KH-W-1042",
    name: "Ravi Patel",
    trade: "Mason",
    level: "Senior",
    experienceYears: 8,
    dailyRate: 950,
    initials: "RP",
    phone: "+91 98471 20455",
    status: "Ready for assignment",
  },
  {
    id: "KH-W-1050",
    name: "Tyler Grant",
    trade: "Mason",
    level: "Senior",
    experienceYears: 8,
    dailyRate: 1050,
    initials: "TG",
    phone: "+91 98470 74747",
    status: "Ready for assignment",
  },
  {
    id: "KH-W-1055",
    name: "Ramesh Babu",
    trade: "Mason",
    level: "Senior",
    experienceYears: 8,
    dailyRate: 1050,
    initials: "RB",
    phone: "+91 98470 74747",
    status: "Ready for assignment",
  },
  {
    id: "CAND-1136",
    name: "Candidate 1136",
    trade: "Mason",
    level: "Skilled",
    experienceYears: 5,
    dailyRate: 850,
    initials: "C1",
    phone: "+91 98470 11360",
    status: "Ready for assignment",
  },

  // Helpers
  {
    id: "KH-W-1099",
    name: "Vipin Das",
    trade: "Helper",
    level: "Senior",
    experienceYears: 7,
    dailyRate: 1000,
    initials: "VD",
    phone: "+91 98470 20202",
    status: "Ready for assignment",
  },
  {
    id: "KH-W-201",
    name: "Sunil Thomas",
    trade: "Helper",
    level: "Skilled",
    experienceYears: 4,
    dailyRate: 800,
    initials: "ST",
    phone: "+91 98470 30101",
    status: "Ready for assignment",
  },
  {
    id: "KH-W-202",
    name: "Anil Kumar",
    trade: "Helper",
    level: "Skilled",
    experienceYears: 3,
    dailyRate: 800,
    initials: "AK",
    phone: "+91 98470 30202",
    status: "Ready for assignment",
  },

  // HVAC / Electrician / Pipefitter / Welder
  {
    id: "KH-W-301",
    name: "Karan Sharma",
    trade: "Electrician",
    level: "Senior",
    experienceYears: 9,
    dailyRate: 1100,
    initials: "KS",
    phone: "+91 98470 40101",
    status: "Ready for assignment",
  },
  {
    id: "KH-W-302",
    name: "David Miller",
    trade: "Pipefitter",
    level: "Senior",
    experienceYears: 7,
    dailyRate: 1050,
    initials: "DM",
    phone: "+91 98470 40202",
    status: "Ready for assignment",
  },
  {
    id: "KH-W-303",
    name: "Alex Vance",
    trade: "Welder",
    level: "Skilled",
    experienceYears: 6,
    dailyRate: 980,
    initials: "AV",
    phone: "+91 98470 40303",
    status: "Ready for assignment",
  },
];

export interface AssignmentReplacementModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectName: string;
  assignmentDates: string;
  absentWorker: AssignedWorkerRecord | null;
  absentWorkersList?: AssignedWorkerRecord[];
  onAssign: (
    candidate: ReplacementCandidate,
    timePeriodLabel?: string,
    targetWorker?: AssignedWorkerRecord | null
  ) => void;
}

const DEFAULT_ASSIGNED_WORKERS: AssignedWorkerRecord[] = [
  { id: "W-101", name: "Rajesh Kumar", trade: "Mason", level: "Senior", status: "Present", phone: "+91 98470 10101" },
  { id: "W-102", name: "Biju K", trade: "Mason", level: "Senior", status: "Present", phone: "+91 98470 10202" },
  { id: "W-103", name: "Anand M", trade: "Mason", level: "Master", status: "Present", phone: "+91 98470 10303" },
  { id: "W-104", name: "Shyam Sundar", trade: "Helper", level: "Helper", status: "Present", phone: "+91 98470 10404" },
  { id: "W-105", name: "Mohan Lal", trade: "Helper", level: "Helper", status: "Present", phone: "+91 98470 10505" },
  { id: "W-106", name: "Gireesh P", trade: "Helper", level: "Helper", status: "Present", phone: "+91 98470 10606" },
  { id: "W-107", name: "Manoj Varma", trade: "Mason", level: "Lead", status: "Present", phone: "+91 98470 10707" },
  { id: "W-108", name: "Sreejith V", trade: "Mason", level: "Senior", status: "Present", phone: "+91 98470 10808" },
  { id: "W-109", name: "Dinesh K", trade: "Mason", level: "Skilled", status: "Present", phone: "+91 98470 10909" },
  { id: "W11", name: "Vishnu Das", trade: "Helper", level: "Senior", status: "Absent", phone: "+91 98470 20202" },
  { id: "W12", name: "Ramesh C", trade: "Mason", level: "Senior", status: "Absent", phone: "+91 98470 30303" },
];

export function AssignmentReplacementModal(props: AssignmentReplacementModalProps) {
  if (!props.isOpen) return null;

  if (props.absentWorker !== null) {
    return <SingleWorkerReplacementModal {...props} absentWorker={props.absentWorker} />;
  }

  return <MultiLaborReplacementModal {...props} />;
}

function SingleWorkerReplacementModal({
  onClose,
  projectName,
  assignmentDates,
  absentWorker,
  onAssign,
}: AssignmentReplacementModalProps & { absentWorker: AssignedWorkerRecord }) {
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const targetTrade = absentWorker.trade.toLowerCase();

  const candidateList = CANDIDATES_POOL.filter((c) => {
    const cTrade = c.trade.toLowerCase();
    const isTradeMatch =
      cTrade.includes(targetTrade) ||
      targetTrade.includes(cTrade) ||
      (targetTrade.includes("mason") && cTrade.includes("mason")) ||
      (targetTrade.includes("helper") && cTrade.includes("helper"));

    if (!isTradeMatch) return false;

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.level.toLowerCase().includes(q) ||
      c.trade.toLowerCase().includes(q)
    );
  });

  const selectedCandidate = CANDIDATES_POOL.find((c) => c.id === selectedCandidateId) || null;

  const handleConfirm = () => {
    if (!selectedCandidate) return;
    onAssign(selectedCandidate, "Today (Sep 19)", absentWorker);
    onClose();
  };

  return (
    <div className={styles.replacementModalOverlay} role="dialog" aria-modal="true" aria-label="Assign Replacement Labor">
      <div className={styles.singleModalCard}>
        {/* Header */}
        <div className={styles.singleModalHeader}>
          <div className={styles.headerTitleGroup}>
            <h3 className={styles.singleModalTitle}>Assign Replacement Labor</h3>
            <p className={styles.singleModalSubtitle}>
              {projectName} · {assignmentDates}
            </p>
          </div>
          <button
            type="button"
            className={styles.singleCloseBtn}
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        <div className={styles.singleModalBody}>
          {/* Absent Worker Red Banner Card */}
          <div className={styles.singleAbsentBanner}>
            <div className={styles.singleAbsentBannerLeft}>
              <span className={styles.singleAbsentBadge}>
                <X size={12} strokeWidth={3} color="#ffffff" /> Absent Worker
              </span>
              <span className={styles.singleAbsentText}>
                Replacing <strong className={styles.singleAbsentName}>{absentWorker.name}</strong> ({absentWorker.trade} · {absentWorker.level})
              </span>
            </div>
            <span className={styles.singleAbsentPhone}>
              {absentWorker.phone || "+91 98470 30303"}
            </span>
          </div>

          {/* Search Input */}
          <div className={styles.singleSearchBox}>
            <Search size={15} className={styles.singleSearchIcon} />
            <input
              type="text"
              className={styles.singleSearchInput}
              placeholder={`Search ${absentWorker.trade} candidates by name or level...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Candidate Items List */}
          <div className={styles.singleCandidateList}>
            {candidateList.map((candidate) => {
              const isSelected = selectedCandidateId === candidate.id;
              return (
                <div
                  key={candidate.id}
                  className={`${styles.singleCandidateCard} ${isSelected ? styles.singleCandidateCardSelected : ""}`}
                  onClick={() => setSelectedCandidateId(candidate.id)}
                  role="button"
                  tabIndex={0}
                >
                  <div className={styles.singleCandidateCardLeft}>
                    <div className={`${styles.singleCheckbox} ${isSelected ? styles.singleCheckboxChecked : ""}`}>
                      {isSelected && <Check size={13} strokeWidth={2.5} color="#0f172a" />}
                    </div>

                    <div className={styles.singleAvatar}>
                      {candidate.initials}
                    </div>

                    <div className={styles.singleCandidateMeta}>
                      <span className={styles.singleCandidateName}>{candidate.name}</span>
                      <span className={styles.singleCandidateSub}>
                        {candidate.trade} ({candidate.level}) · {candidate.experienceYears} Yrs Exp · ₹{candidate.dailyRate}/day
                      </span>
                    </div>
                  </div>

                  {isSelected ? (
                    <span className={styles.singleReadyBadge}>
                      Ready for assignment
                    </span>
                  ) : (
                    <span className={styles.singleBenchBadge}>
                      Available on bench
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className={styles.singleModalFooter}>
          <button
            type="button"
            className={styles.singleBackBtn}
            onClick={onClose}
          >
            ← Back
          </button>

          <button
            type="button"
            className={`${styles.singleAssignBtn} ${selectedCandidate ? styles.singleAssignBtnActive : ""}`}
            disabled={!selectedCandidate}
            onClick={handleConfirm}
          >
            <Sparkles size={14} color="#ffffff" className={styles.singleAssignBtnIcon} />
            <span>Assign Candidate →</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function MultiLaborReplacementModal({
  onClose,
  projectName,
  assignmentDates,
  absentWorker,
  absentWorkersList = [],
  onAssign,
}: AssignmentReplacementModalProps) {
  // Full roster of assigned workers
  const fullAssignedWorkers = absentWorkersList.length > 0
    ? absentWorkersList
    : absentWorker
    ? [absentWorker, ...DEFAULT_ASSIGNED_WORKERS.filter((w) => w.id !== absentWorker.id)]
    : DEFAULT_ASSIGNED_WORKERS;

  // Replacement pairs (completed or in-progress)
  const [pairs, setPairs] = useState<ReplacementPair[]>(
    absentWorker ? [{ worker: absentWorker, candidate: null }] : []
  );

  // Active worker ID currently being selected on left column (checked [✓])
  const [activeWorkerId, setActiveWorkerId] = useState<string | null>(
    absentWorker?.id || null
  );

  // Pair date selections: workerId -> dateStrings[]
  const [pairDates, setPairDates] = useState<Record<string, string[]>>({});
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  const [activeCandidatePopoverId, setActiveCandidatePopoverId] = useState<string | null>(null);
  const [tempCandidateDates, setTempCandidateDates] = useState<string[]>([]);
  const [leftSearchQuery, setLeftSearchQuery] = useState("");
  const [rightSearchQuery, setRightSearchQuery] = useState("");

  // Active worker object currently selected for replacement on left side
  const activeWorker = fullAssignedWorkers.find((w) => w.id === activeWorkerId) || null;
  const targetTrade = activeWorker?.trade || "";

  // Candidate IDs already assigned in completed pairs
  const assignedCandidateIds = pairs
    .filter((p) => p.candidate !== null)
    .map((p) => p.candidate!.id);

  const filteredAssignedWorkers = fullAssignedWorkers.filter((w) => {
    if (!leftSearchQuery.trim()) return true;
    const q = leftSearchQuery.toLowerCase();
    return (
      w.name.toLowerCase().includes(q) ||
      w.trade.toLowerCase().includes(q) ||
      w.level.toLowerCase().includes(q)
    );
  });

  // Candidate list for current active worker (excludes candidates already assigned in completed pairs)
  const filteredCandidates = !activeWorker
    ? []
    : CANDIDATES_POOL.filter((c) => {
        if (assignedCandidateIds.includes(c.id)) {
          return false;
        }

        if (targetTrade) {
          const workerTradeLower = targetTrade.toLowerCase();
          const candidateTradeLower = c.trade.toLowerCase();
          const isTradeMatch =
            candidateTradeLower.includes(workerTradeLower) ||
            workerTradeLower.includes(candidateTradeLower) ||
            (workerTradeLower.includes("hvac") && (candidateTradeLower.includes("hvac") || candidateTradeLower.includes("tech"))) ||
            (workerTradeLower.includes("electric") && candidateTradeLower.includes("electric")) ||
            (workerTradeLower.includes("pipe") && candidateTradeLower.includes("pipe")) ||
            (workerTradeLower.includes("weld") && candidateTradeLower.includes("weld")) ||
            (workerTradeLower.includes("helper") && candidateTradeLower.includes("helper")) ||
            (workerTradeLower.includes("mason") && candidateTradeLower.includes("mason"));

          if (!isTradeMatch) {
            return false;
          }
        }

        if (!rightSearchQuery.trim()) return true;
        const q = rightSearchQuery.toLowerCase();
        return (
          c.name.toLowerCase().includes(q) ||
          c.trade.toLowerCase().includes(q) ||
          c.level.toLowerCase().includes(q)
        );
      });

  const handleSelectWorker = (worker: AssignedWorkerRecord) => {
    const isAlreadyCompleted = pairs.some((p) => p.worker.id === worker.id && p.candidate !== null);
    if (isAlreadyCompleted) return;

    setActiveWorkerId(worker.id);
    setSelectedCandidateId(null);
    setActiveCandidatePopoverId(null);
    setTempCandidateDates([]);

    setPairs((prev) => {
      const hasDraft = prev.some((p) => p.candidate === null);
      if (hasDraft) {
        return prev.map((p) => (p.candidate === null ? { worker, candidate: null } : p));
      }
      return [...prev, { worker, candidate: null }];
    });
  };

  const handleToggleCandidateDate = (dateStr: string) => {
    setTempCandidateDates((prev) =>
      prev.includes(dateStr)
        ? prev.filter((d) => d !== dateStr)
        : [...prev, dateStr]
    );
  };

  const handleApplyCandidateDates = (candidate: ReplacementCandidate) => {
    if (!activeWorker) return;
    if (tempCandidateDates.length === 0) return;

    const worker = activeWorker;
    const dates = [...tempCandidateDates];

    setPairs((prev) => {
      const filtered = prev.filter((p) => p.worker.id !== worker.id);
      return [...filtered, { worker, candidate }];
    });

    setPairDates((prev) => ({
      ...prev,
      [worker.id]: dates,
    }));

    setActiveWorkerId(null);
    setSelectedCandidateId(null);
    setActiveCandidatePopoverId(null);
    setTempCandidateDates([]);
  };

  const handleRemovePair = (workerId: string) => {
    setPairs((prev) => prev.filter((p) => p.worker.id !== workerId));
    if (activeWorkerId === workerId) {
      setActiveWorkerId(null);
      setSelectedCandidateId(null);
      setActiveCandidatePopoverId(null);
      setTempCandidateDates([]);
    }
  };

  const handleClearAll = () => {
    setPairs([]);
    setActiveWorkerId(null);
    setSelectedCandidateId(null);
    setPairDates({});
    setActiveCandidatePopoverId(null);
    setTempCandidateDates([]);
  };

  const removeDateFromPair = (workerId: string, dateStr: string) => {
    setPairDates((prev) => ({
      ...prev,
      [workerId]: (prev[workerId] || []).filter((d) => d !== dateStr),
    }));
  };

  const completedPairs = pairs.filter((p) => p.candidate !== null);

  const handleConfirmAssignment = () => {
    if (completedPairs.length === 0) return;
    completedPairs.forEach((pair) => {
      const dates = pairDates[pair.worker.id] || [];
      const dateLabel = dates.length > 0
        ? dates.map((d) => `Sep ${d.split("-")[2]}`).join(", ")
        : "Default Shift";
      onAssign(pair.candidate!, dateLabel, pair.worker);
    });
    onClose();
  };

  // Scheduled date range constraints (September 19 to September 26, 2026)
  const scheduledStartDay = 19;
  const scheduledEndDay = 26;
  const currentMonthYear = "September 2026";
  const daysOfWeek = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  // Sept 1, 2026 is Tuesday -> 2 blank offset cells
  const blankOffsetCells = Array.from({ length: 2 });
  const septemberDays = Array.from({ length: 30 }, (_, i) => i + 1);

  const activeCandidateObj = CANDIDATES_POOL.find(
    (c) => c.id === activeCandidatePopoverId
  ) || null;

  return (
    <div className={styles.replacementModalOverlay} role="dialog" aria-modal="true" aria-label="Replace Labor Assignment">
      <div className={styles.modalCard}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <div className={styles.headerTitleGroup}>
            <h3 className={styles.modalTitle}>Replace Labor Assignment</h3>
            <p className={styles.modalSubtitle}>Select the assigned worker, then choose a replacement</p>
          </div>
          <button
            type="button"
            className={styles.modalCloseBtn}
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Top Summary Bar: Replacement pair units ([Worker] -> [Candidate] [Sep 19]) */}
        {pairs.length > 0 && (
          <div className={styles.topSummaryBar}>
            <div className={styles.topSummaryContent}>
              {pairs.map((pair) => {
                const datesForThisPair = pairDates[pair.worker.id] || [];

                return (
                  <div key={pair.worker.id} className={styles.replacementPairUnit}>
                    <span className={styles.greySummaryPill}>
                      <span className={styles.pillTextName}>{pair.worker.name}</span>
                      <button
                        type="button"
                        className={styles.pillCloseXBtn}
                        onClick={() => handleRemovePair(pair.worker.id)}
                        aria-label={`Remove ${pair.worker.name}`}
                      >
                        <X size={11} />
                      </button>
                    </span>

                    <span className={styles.summaryRightArrow}>→</span>

                    {pair.candidate ? (
                      <span className={styles.greySummaryPill}>
                        <span className={styles.pillTextName}>{pair.candidate.name}</span>
                        <button
                          type="button"
                          className={styles.pillCloseXBtn}
                          onClick={() => handleRemovePair(pair.worker.id)}
                          aria-label={`Remove replacement for ${pair.worker.name}`}
                        >
                          <X size={11} />
                        </button>
                      </span>
                    ) : (
                      <span className={styles.greySummaryPillPlaceholder}>Select candidate...</span>
                    )}

                    {/* Picked Date Pills for this pair */}
                    {datesForThisPair.map((dVal) => {
                      const dayNum = dVal.split("-")[2];
                      const labelText = `Sep ${dayNum}`;
                      return (
                        <span key={dVal} className={styles.greySummaryPill}>
                          <span className={styles.pillTextName}>{labelText}</span>
                          <button
                            type="button"
                            className={styles.pillCloseXBtn}
                            onClick={() => removeDateFromPair(pair.worker.id, dVal)}
                            aria-label={`Remove date ${labelText}`}
                          >
                            <X size={11} />
                          </button>
                        </span>
                      );
                    })}
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              className={styles.summaryClearAllBtn}
              onClick={handleClearAll}
            >
              Clear all
            </button>
          </div>
        )}

        {/* Dual Workspace Grid with Middle Transfer Track */}
        <div className={styles.dualWorkspaceGrid}>
          {/* Left Column: Assigned Labor */}
          <div className={styles.leftColumn}>
            <div className={styles.columnSectionHeader}>
              <span className={styles.columnTitle}>ASSIGNED LABOR</span>
            </div>

            <div className={styles.searchBox}>
              <Search size={14} className={styles.searchIcon} />
              <input
                type="text"
                className={styles.searchInput}
                placeholder="Search by name, role, or dept..."
                value={leftSearchQuery}
                onChange={(e) => setLeftSearchQuery(e.target.value)}
              />
            </div>

            {/* List constrained to exactly 6 items visible, overflow on scroll */}
            <div className={styles.rosterItemsListConstrained}>
              {filteredAssignedWorkers.map((worker) => {
                const isActive = activeWorkerId === worker.id;
                const isCompleted = pairs.some((p) => p.worker.id === worker.id && p.candidate !== null);
                const initials = worker.name.split(" ").map((n) => n[0]).join("");

                return (
                  <div
                    key={worker.id}
                    className={`${styles.previousCardStyle} ${isActive ? styles.previousCardStyleSelected : ""}`}
                    onClick={() => handleSelectWorker(worker)}
                    role="button"
                    tabIndex={0}
                  >
                    <div className={`${styles.cardCheckbox} ${isActive ? styles.cardCheckboxChecked : ""}`}>
                      {isActive && <Check size={12} strokeWidth={2.5} />}
                    </div>

                    <div className={styles.cardNavyAvatar}>
                      {initials}
                    </div>

                    <div className={styles.cardTextMeta}>
                      <span className={styles.cardPrimaryName}>
                        {worker.name}
                        {isCompleted && <span style={{ fontSize: "11px", color: "#059669", marginLeft: "4px" }}>(Replaced)</span>}
                      </span>
                      <span className={styles.cardSubtitleMeta}>
                        {worker.trade} ({worker.level}) · 5 Yrs Exp · ₹850/day
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Middle Transfer Track - Swap Button centered between Searchbars */}
          <div className={styles.middleTransferTrack} aria-hidden="true">
            <div className={styles.searchAlignedSwapBubble}>
              <ArrowRightLeft size={16} />
            </div>
          </div>

          {/* Right Column: Available Replacements matched to Selected Labor */}
          <div className={styles.rightColumn}>
            <div className={styles.columnSectionHeader}>
              <span className={styles.columnTitle}>
                AVAILABLE REPLACEMENTS
              </span>
            </div>

            <div className={styles.searchBox}>
              <Search size={14} className={styles.searchIcon} />
              <input
                type="text"
                className={styles.searchInput}
                placeholder="Filter replacements..."
                value={rightSearchQuery}
                onChange={(e) => setRightSearchQuery(e.target.value)}
              />
            </div>

            {/* Calendar Popover displayed ABOVE the list when a candidate is selected */}
            {activeCandidateObj && activeCandidatePopoverId && (
              <div className={styles.topCandidateCalendarPopover}>
                <div className={styles.calendarNavHeader}>
                  <div className={styles.calendarNavHeaderLeft}>
                    <button type="button" className={styles.calendarChevronBtn} aria-label="Previous Month">
                      <ChevronLeft size={16} />
                    </button>
                    <span className={styles.calendarMonthTitle}>{currentMonthYear}</span>
                    <button type="button" className={styles.calendarChevronBtn} aria-label="Next Month">
                      <ChevronRight size={16} />
                    </button>
                  </div>

                  <button
                    type="button"
                    className={styles.calendarPopoverCloseX}
                    onClick={() => {
                      setActiveCandidatePopoverId(null);
                      setTempCandidateDates([]);
                    }}
                    aria-label="Close calendar"
                  >
                    <X size={14} />
                  </button>
                </div>

                <div className={styles.calendarWeekRow}>
                  {daysOfWeek.map((day) => (
                    <span key={day} className={styles.calendarWeekDayName}>
                      {day}
                    </span>
                  ))}
                </div>

                <div className={styles.calendarDaysGrid}>
                  {blankOffsetCells.map((_, idx) => (
                    <div key={`blank-${idx}`} className={styles.calendarBlankCell} />
                  ))}

                  {septemberDays.map((dayNum) => {
                    const dateStr = `2026-09-${String(dayNum).padStart(2, "0")}`;
                    const isScheduledRange = dayNum >= scheduledStartDay && dayNum <= scheduledEndDay;
                    const isToday = dayNum === 19;
                    const isSelected = tempCandidateDates.includes(dateStr);

                    if (!isScheduledRange) {
                      return (
                        <div key={dateStr} className={styles.calendarDayDisabled}>
                          {dayNum}
                        </div>
                      );
                    }

                    return (
                      <button
                        key={dateStr}
                        type="button"
                        className={`
                          ${styles.calendarDayCell} 
                          ${isToday ? styles.calendarDayToday : ""}
                          ${isSelected ? styles.calendarDaySelected : ""}
                        `}
                        onClick={() => handleToggleCandidateDate(dateStr)}
                      >
                        {dayNum}
                      </button>
                    );
                  })}
                </div>

                <div className={styles.calendarFooterRow}>
                  <span className={styles.calendarFooterStatus}>
                    {tempCandidateDates.length === 0
                      ? "Select date(s)"
                      : `${tempCandidateDates.length} date${tempCandidateDates.length > 1 ? "s" : ""} selected`}
                  </span>

                  <button
                    type="button"
                    className={styles.calendarApplyBtn}
                    disabled={tempCandidateDates.length === 0}
                    onClick={() => handleApplyCandidateDates(activeCandidateObj)}
                  >
                    Confirm Date{tempCandidateDates.length > 1 ? "s" : ""}
                  </button>
                </div>
              </div>
            )}

            {/* Empty state initially until labor is selected */}
            {!activeWorker ? (
              <div className={styles.emptyReplacementsBox}>
                <UserCheck size={28} className={styles.emptyIcon} />
                <span className={styles.emptyTextTitle}>No Worker Selected</span>
                <span className={styles.emptyTextSub}>
                  Select an assigned worker on the left to view available replacement candidates.
                </span>
              </div>
            ) : (
              <div className={styles.candidateItemsListConstrained}>
                {filteredCandidates.map((candidate) => {
                  const isSelectedCandidate = selectedCandidateId === candidate.id;
                  const isPopoverOpen = activeCandidatePopoverId === candidate.id;

                  return (
                    <div key={candidate.id} className={styles.candidateCardWrap}>
                      <div className={styles.candidateCardRowOutside}>
                        {/* Main Labor Section */}
                        <div
                          className={`${styles.previousCardStyle} ${isSelectedCandidate ? styles.previousCardStyleSelected : ""}`}
                          onClick={() => {
                            setSelectedCandidateId(candidate.id);
                            setActiveCandidatePopoverId(candidate.id);
                          }}
                          role="button"
                          tabIndex={0}
                        >
                          <div className={`${styles.cardCheckbox} ${isSelectedCandidate ? styles.cardCheckboxChecked : ""}`}>
                            {isSelectedCandidate && <Check size={12} strokeWidth={2.5} />}
                          </div>

                          <div className={styles.cardNavyAvatar}>
                            {candidate.initials}
                          </div>

                          <div className={styles.cardTextMeta}>
                            <span className={styles.cardPrimaryName}>{candidate.name}</span>
                            <span className={styles.cardSubtitleMeta}>
                              {candidate.trade} ({candidate.level}) · {candidate.experienceYears} Yrs Exp · ₹{candidate.dailyRate}/day
                            </span>
                          </div>
                        </div>

                        {/* Calendar Icon Button: Display ONLY for the selected labor */}
                        {isSelectedCandidate && (
                          <button
                            type="button"
                            className={`${styles.candidateCalendarBtnOutside} ${isPopoverOpen ? styles.candidateCalendarBtnActive : ""}`}
                            onClick={() => setActiveCandidatePopoverId(isPopoverOpen ? null : candidate.id)}
                            title="Pick replacement date"
                            aria-label={`Select replacement date for ${candidate.name}`}
                          >
                            <CalendarIcon size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className={styles.modalFooter}>
          <span className={styles.footerPromptText}>
            {completedPairs.length > 0
              ? `Replacing ${completedPairs.length} worker${completedPairs.length > 1 ? "s" : ""}`
              : activeWorker
              ? `Select candidate to replace ${activeWorker.name}`
              : "Choose an assigned worker to replace"}
          </span>

          <div className={styles.footerBtnGroup}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={onClose}
            >
              Cancel
            </button>

            <button
              type="button"
              className={styles.confirmBtn}
              disabled={completedPairs.length === 0}
              onClick={handleConfirmAssignment}
            >
              Confirm Replacement
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

