"use client";

import { CheckCircle2, Layers3, LoaderCircle, Plus, Trash2, Users, X } from "lucide-react";
import { useRef, useState, type FormEvent } from "react";
import {
  saveWorkforceRequestDraft,
  submitWorkforceRequest,
} from "../services/hands.mock";
import type {
  RequestTradeItem,
  WorkerTrade,
  WorkforceRequestDraft,
  WorkforceRequestDraftItem,
  WorkforceRequestErrors,
} from "../types/hands.types";
import { validateWorkforceRequest } from "../utils/hands-validation";
import { useDrawerBehaviour } from "./use-drawer-behaviour";
import styles from "./hands-overview.module.css";

const PROJECTS = [
  {
    id: "proj-001",
    name: "Nila Residence",
    location: "Thiruvananthapuram",
  },
  { id: "proj-002", name: "Arjun Villa", location: "Kochi" },
  { id: "proj-003", name: "Marina Office", location: "Kozhikode" },
  { id: "proj-004", name: "Green Courtyard", location: "Thrissur" },
] as const;

const TRADES: readonly WorkerTrade[] = [
  "Masons",
  "Helpers",
  "Painters",
  "Electricians",
  "Carpenters",
  "Plumbers",
  "Welders",
  "Tile workers",
];

const CONTRACTORS = [
  { name: "Apex Integrated Civil & Finishing Crew", trade: "Civil & Masonry" },
  { name: "Forma MEP & Woodworks Contractor", trade: "MEP & Woodworks" },
  { name: "Circuit MEP Solutions", trade: "Electrical & MEP" },
  { name: "Chroma Finishes & Paint Crew", trade: "Painting & Finishing" },
  { name: "Master Masons & Brickwork Team", trade: "Masonry & Brickwork" },
  { name: "Malabar Site Crew", trade: "Helpers & General Labour" },
  { name: "Heritage Joinery Gang", trade: "Carpentry & Joinery" },
] as const;

const INITIAL_VALUES: WorkforceRequestDraft = {
  projectId: "",
  siteLocation: "",
  trade: "",
  workerCount: "",
  skillLevel: "",
  startDate: "",
  expectedDuration: "",
  shiftTiming: "",
  requiredToolsOrCertifications: "",
  siteContact: "",
  notes: "",
  contractorName: "",
  isMultiTrade: false,
  tradesBreakdown: [
    { trade: "Masons", workerCount: "4", skillLevel: "skilled" },
    { trade: "Helpers", workerCount: "4", skillLevel: "helper" },
  ],
};

type SubmissionState =
  | "idle"
  | "saving-draft"
  | "submitting"
  | "success"
  | "error";

interface WorkforceRequestDrawerProps {
  onClose: () => void;
  initialTrade?: WorkerTrade | string;
  initialWorkerCount?: number | string;
  initialStartDate?: string;
  initialDuration?: string;
  initialProjectId?: string;
  initialValues?: Partial<WorkforceRequestDraft>;
}

export function WorkforceRequestDrawer({
  onClose,
  initialTrade,
  initialWorkerCount,
  initialStartDate,
  initialDuration,
  initialProjectId,
  initialValues,
}: WorkforceRequestDrawerProps) {
  const panelRef = useRef<HTMLElement>(null);
  const [values, setValues] = useState<WorkforceRequestDraft>(() => {
    const base = { ...INITIAL_VALUES, ...(initialValues || {}) };
    if (initialTrade) {
      base.trade = (TRADES.includes(initialTrade as WorkerTrade)
        ? (initialTrade as WorkerTrade)
        : "") as WorkerTrade | "";
    }
    if (initialWorkerCount) {
      base.workerCount = String(initialWorkerCount);
    }
    if (initialStartDate) {
      base.startDate = initialStartDate;
    }
    if (initialDuration) {
      base.expectedDuration = initialDuration;
    }
    if (initialProjectId) {
      const matched = PROJECTS.find(
        (p) =>
          p.id === initialProjectId ||
          p.name.toLowerCase() === initialProjectId.toLowerCase(),
      );
      if (matched) {
        base.projectId = matched.id;
        if (!base.siteLocation) {
          base.siteLocation = matched.location;
        }
      } else {
        base.projectId = initialProjectId;
      }
    }
    return base;
  });
  const [errors, setErrors] = useState<WorkforceRequestErrors>({});
  const [submissionState, setSubmissionState] =
    useState<SubmissionState>("idle");
  const [statusMessage, setStatusMessage] = useState("");
  const isBusy =
    submissionState === "saving-draft" || submissionState === "submitting";

  useDrawerBehaviour(panelRef, onClose, !isBusy);

  function updateField<Key extends keyof WorkforceRequestDraft>(
    field: Key,
    value: WorkforceRequestDraft[Key],
  ) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));

    if (submissionState === "error" || submissionState === "success") {
      setSubmissionState("idle");
      setStatusMessage("");
    }
  }

  function handleProjectChange(projectId: string) {
    const project = PROJECTS.find((item) => item.id === projectId);
    setValues((current) => ({
      ...current,
      projectId,
      siteLocation: project?.location ?? current.siteLocation,
    }));
    setErrors((current) => ({ ...current, projectId: undefined }));
  }

  function handleAddTradeRow() {
    setValues((current) => ({
      ...current,
      tradesBreakdown: [
        ...(current.tradesBreakdown || []),
        { trade: "Electricians", workerCount: "2", skillLevel: "skilled" },
      ],
    }));
  }

  function handleRemoveTradeRow(index: number) {
    setValues((current) => ({
      ...current,
      tradesBreakdown: (current.tradesBreakdown || []).filter(
        (_, idx) => idx !== index,
      ),
    }));
  }

  function handleUpdateTradeRow(
    index: number,
    field: keyof WorkforceRequestDraftItem,
    value: string,
  ) {
    setValues((current) => {
      const updated = [...(current.tradesBreakdown || [])];
      if (updated[index]) {
        updated[index] = { ...updated[index], [field]: value };
      }
      return { ...current, tradesBreakdown: updated };
    });
  }

  const multiTradeTotalWorkers = (values.tradesBreakdown || []).reduce(
    (acc, row) => acc + (Number(row.workerCount) || 0),
    0,
  );

  async function handleSaveDraft() {
    setSubmissionState("saving-draft");
    setStatusMessage("");

    try {
      await saveWorkforceRequestDraft(values);
      setSubmissionState("success");
      setStatusMessage("Workforce request saved as a draft.");
    } catch (error: unknown) {
      setSubmissionState("error");
      setStatusMessage(
        error instanceof Error
          ? error.message
          : "The draft could not be saved. Try again.",
      );
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validateWorkforceRequest(values);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setSubmissionState("error");
      setStatusMessage("Review the required fields and submit again.");
      return;
    }

    if (!values.projectId || !values.startDate || !values.expectedDuration) {
      return;
    }

    if (!values.isMultiTrade && !values.trade) {
      return;
    }

    setSubmissionState("submitting");
    setStatusMessage("");

    const isMulti = Boolean(values.isMultiTrade);
    const formattedTradesBreakdown: RequestTradeItem[] | undefined = isMulti
      ? (values.tradesBreakdown || [])
          .filter((t) => Boolean(t.trade) && Number(t.workerCount) > 0)
          .map((t) => ({
            trade: t.trade as WorkerTrade,
            quantity: Number(t.workerCount),
            fulfilled: 0,
            skillLevel: t.skillLevel || "Skilled",
          }))
      : undefined;

    const totalWorkerCount = isMulti
      ? multiTradeTotalWorkers
      : Number(values.workerCount);

    try {
      await submitWorkforceRequest({
        projectId: values.projectId,
        siteLocation: values.siteLocation,
        trade: isMulti ? "Multi-Trade Squad" : (values.trade as WorkerTrade),
        workerCount: totalWorkerCount,
        skillLevel: values.skillLevel,
        startDate: values.startDate,
        expectedDuration: values.expectedDuration,
        shiftTiming: values.shiftTiming,
        requiredToolsOrCertifications:
          values.requiredToolsOrCertifications,
        siteContact: values.siteContact,
        notes: values.notes,
        contractorName: values.contractorName,
        isMultiTrade: isMulti,
        tradesBreakdown: formattedTradesBreakdown,
      });
      setSubmissionState("success");
      setStatusMessage(
        "Workforce request submitted. Matching can now begin.",
      );
    } catch (error: unknown) {
      setSubmissionState("error");
      setStatusMessage(
        error instanceof Error
          ? error.message
          : "The request could not be submitted. Try again.",
      );
    }
  }


  return (
    <div
      className={styles.drawerBackdrop}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isBusy) {
          onClose();
        }
      }}
    >
      <aside
        ref={panelRef}
        className={`${styles.drawer} ${styles.requestDrawer}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="workforce-request-title"
        aria-describedby="workforce-request-description"
        aria-busy={isBusy}
        tabIndex={-1}
      >
        <header className={styles.drawerHeader}>
          <div>
            <p>Hands workforce</p>
            <h2 id="workforce-request-title">Request workforce</h2>
            <span id="workforce-request-description">
              Define the site requirement for workforce matching.
            </span>
          </div>
          <button
            type="button"
            className={styles.drawerCloseButton}
            aria-label="Close workforce request"
            onClick={onClose}
            disabled={isBusy}
          >
            <X size={18} aria-hidden="true" />
          </button>
        </header>

        <form
          id="workforce-request-form"
          className={styles.drawerForm}
          onSubmit={handleSubmit}
          noValidate
        >
          <div className={styles.drawerBody}>
            {statusMessage ? (
              <div
                className={`${styles.formStatus} ${
                  submissionState === "success"
                    ? styles.formStatusSuccess
                    : styles.formStatusError
                }`}
                role={submissionState === "error" ? "alert" : "status"}
              >
                {submissionState === "success" ? (
                  <CheckCircle2 size={16} aria-hidden="true" />
                ) : null}
                <span>{statusMessage}</span>
              </div>
            ) : null}

            <div className={styles.requestModeToggleWrap}>
              <span className={styles.requestModeToggleLabel}>Request mode</span>
              <div
                className={styles.requestModeSegmentedControl}
                role="radiogroup"
                aria-label="Request mode"
              >
                <button
                  type="button"
                  className={`${styles.requestModeBtn} ${
                    !values.isMultiTrade ? styles.requestModeBtnActive : ""
                  }`}
                  onClick={() => updateField("isMultiTrade", false)}
                  aria-checked={!values.isMultiTrade}
                  role="radio"
                >
                  <Users size={13} aria-hidden="true" />
                  <span>Single trade</span>
                </button>
                <button
                  type="button"
                  className={`${styles.requestModeBtn} ${
                    values.isMultiTrade ? styles.requestModeBtnActive : ""
                  }`}
                  onClick={() => updateField("isMultiTrade", true)}
                  aria-checked={Boolean(values.isMultiTrade)}
                  role="radio"
                >
                  <Layers3 size={13} aria-hidden="true" />
                  <span>Multi-trade gang (multiple labour types)</span>
                </button>
              </div>
            </div>

            <div className={styles.formGrid}>
              <label className={styles.formField}>
                <span>
                  Project <em aria-hidden="true">*</em>
                </span>
                <select
                  value={values.projectId}
                  onChange={(event) =>
                    handleProjectChange(event.target.value)
                  }
                  aria-invalid={Boolean(errors.projectId)}
                  aria-describedby={
                    errors.projectId ? "project-error" : undefined
                  }
                  disabled={isBusy}
                >
                  <option value="">Select project</option>
                  {PROJECTS.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
                {errors.projectId ? (
                  <small id="project-error" className={styles.fieldError}>
                    {errors.projectId}
                  </small>
                ) : null}
              </label>

              <label className={styles.formField}>
                <span>Site / location</span>
                <input
                  type="text"
                  value={values.siteLocation}
                  onChange={(event) =>
                    updateField("siteLocation", event.target.value)
                  }
                  placeholder="Site city or address"
                  disabled={isBusy}
                />
              </label>

              <label className={styles.formField}>
                <span>Preferred contractor</span>
                <select
                  value={values.contractorName || ""}
                  onChange={(event) =>
                    updateField("contractorName", event.target.value)
                  }
                  disabled={isBusy}
                >
                  <option value="">Auto-match verified contractor (Recommended)</option>
                  {CONTRACTORS.map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.name} ({c.trade})
                    </option>
                  ))}
                </select>
              </label>

              {!values.isMultiTrade ? (
                <>
                  <label className={styles.formField}>
                    <span>
                      Trade / category <em aria-hidden="true">*</em>
                    </span>
                    <select
                      value={values.trade}
                      onChange={(event) =>
                        updateField(
                          "trade",
                          event.target.value as WorkerTrade | "",
                        )
                      }
                      aria-invalid={Boolean(errors.trade)}
                      aria-describedby={errors.trade ? "trade-error" : undefined}
                      disabled={isBusy}
                    >
                      <option value="">Select trade</option>
                      {TRADES.map((trade) => (
                        <option key={trade} value={trade}>
                          {trade}
                        </option>
                      ))}
                    </select>
                    {errors.trade ? (
                      <small id="trade-error" className={styles.fieldError}>
                        {errors.trade}
                      </small>
                    ) : null}
                  </label>

                  <label className={styles.formField}>
                    <span>
                      Number of workers <em aria-hidden="true">*</em>
                    </span>
                    <input
                      type="number"
                      min="1"
                      inputMode="numeric"
                      value={values.workerCount}
                      onChange={(event) =>
                        updateField("workerCount", event.target.value)
                      }
                      placeholder="0"
                      aria-invalid={Boolean(errors.workerCount)}
                      aria-describedby={
                        errors.workerCount ? "worker-count-error" : undefined
                      }
                      disabled={isBusy}
                    />
                    {errors.workerCount ? (
                      <small
                        id="worker-count-error"
                        className={styles.fieldError}
                      >
                        {errors.workerCount}
                      </small>
                    ) : null}
                  </label>

                  <label className={styles.formField}>
                    <span>Skill level</span>
                    <select
                      value={values.skillLevel}
                      onChange={(event) =>
                        updateField("skillLevel", event.target.value)
                      }
                      disabled={isBusy}
                    >
                      <option value="">Any suitable level</option>
                      <option value="helper">Helper</option>
                      <option value="skilled">Skilled</option>
                      <option value="senior">Senior / lead</option>
                    </select>
                  </label>
                </>
              ) : (
                <div
                  className={`${styles.formFieldWide} ${styles.multiTradeBuilderSection}`}
                >
                  <div className={styles.multiTradeBuilderHeader}>
                    <div>
                      <h4 className={styles.multiTradeBuilderTitle}>
                        Contractor labour trades breakdown
                      </h4>
                      <span className={styles.multiTradeBuilderSub}>
                        Configure multiple trade types (e.g. Masons, Electricians, Helpers) under this contractor
                      </span>
                    </div>
                    <span className={styles.multiTradeCrewSummaryBadge}>
                      {multiTradeTotalWorkers} workers · {values.tradesBreakdown?.length || 0} trades
                    </span>
                  </div>

                  <div className={styles.multiTradeRowsList}>
                    {(values.tradesBreakdown || []).map((row, idx) => (
                      <div key={idx} className={styles.multiTradeRow}>
                        <div className={styles.multiTradeRowColTrade}>
                          <label className={styles.formFieldCompact}>
                            <span>Trade {idx + 1}</span>
                            <select
                              value={row.trade}
                              onChange={(e) =>
                                handleUpdateTradeRow(idx, "trade", e.target.value)
                              }
                              disabled={isBusy}
                            >
                              <option value="">Select trade</option>
                              {TRADES.map((trade) => (
                                <option key={trade} value={trade}>
                                  {trade}
                                </option>
                              ))}
                            </select>
                          </label>
                        </div>

                        <div className={styles.multiTradeRowColCount}>
                          <label className={styles.formFieldCompact}>
                            <span>Workers</span>
                            <input
                              type="number"
                              min="1"
                              value={row.workerCount}
                              onChange={(e) =>
                                handleUpdateTradeRow(
                                  idx,
                                  "workerCount",
                                  e.target.value,
                                )
                              }
                              placeholder="0"
                              disabled={isBusy}
                            />
                          </label>
                        </div>

                        <div className={styles.multiTradeRowColSkill}>
                          <label className={styles.formFieldCompact}>
                            <span>Skill level</span>
                            <select
                              value={row.skillLevel || "skilled"}
                              onChange={(e) =>
                                handleUpdateTradeRow(
                                  idx,
                                  "skillLevel",
                                  e.target.value,
                                )
                              }
                              disabled={isBusy}
                            >
                              <option value="helper">Helper</option>
                              <option value="skilled">Skilled</option>
                              <option value="senior">Senior / lead</option>
                            </select>
                          </label>
                        </div>

                        {(values.tradesBreakdown || []).length > 1 ? (
                          <button
                            type="button"
                            className={styles.multiTradeRemoveRowBtn}
                            onClick={() => handleRemoveTradeRow(idx)}
                            aria-label={`Remove trade ${row.trade || idx + 1}`}
                            title="Remove trade"
                            disabled={isBusy}
                          >
                            <Trash2 size={14} aria-hidden="true" />
                          </button>
                        ) : null}
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    className={styles.addTradeRowBtn}
                    onClick={handleAddTradeRow}
                    disabled={isBusy}
                  >
                    <Plus size={14} aria-hidden="true" />
                    <span>
                      Add another labour type (e.g. Electrician, Carpenter, Helper)
                    </span>
                  </button>

                  {errors.trade ? (
                    <small className={styles.fieldError}>
                      {errors.trade}
                    </small>
                  ) : null}
                </div>
              )}


              <label className={styles.formField}>
                <span>
                  Start date <em aria-hidden="true">*</em>
                </span>
                <input
                  type="date"
                  min="2026-07-27"
                  value={values.startDate}
                  onChange={(event) =>
                    updateField("startDate", event.target.value)
                  }
                  aria-invalid={Boolean(errors.startDate)}
                  aria-describedby={
                    errors.startDate ? "start-date-error" : undefined
                  }
                  disabled={isBusy}
                />
                {errors.startDate ? (
                  <small id="start-date-error" className={styles.fieldError}>
                    {errors.startDate}
                  </small>
                ) : null}
              </label>

              <label className={styles.formField}>
                <span>
                  Expected duration <em aria-hidden="true">*</em>
                </span>
                <input
                  type="text"
                  value={values.expectedDuration}
                  onChange={(event) =>
                    updateField("expectedDuration", event.target.value)
                  }
                  placeholder="Example: 2 weeks"
                  aria-invalid={Boolean(errors.expectedDuration)}
                  aria-describedby={
                    errors.expectedDuration ? "duration-error" : undefined
                  }
                  disabled={isBusy}
                />
                {errors.expectedDuration ? (
                  <small id="duration-error" className={styles.fieldError}>
                    {errors.expectedDuration}
                  </small>
                ) : null}
              </label>

              <label className={styles.formField}>
                <span>Shift timing</span>
                <input
                  type="text"
                  value={values.shiftTiming}
                  onChange={(event) =>
                    updateField("shiftTiming", event.target.value)
                  }
                  placeholder="8:00 AM – 5:00 PM"
                  disabled={isBusy}
                />
              </label>
            </div>
          </div>

          <footer className={styles.drawerFooter}>
            <button
              type="button"
              className={styles.tertiaryButton}
              onClick={onClose}
              disabled={isBusy}
            >
              Cancel
            </button>
            <div className={styles.drawerFooterActions}>
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={() => void handleSaveDraft()}
                disabled={isBusy}
              >
                {submissionState === "saving-draft" ? (
                  <LoaderCircle
                    className={styles.loadingIcon}
                    size={15}
                    aria-hidden="true"
                  />
                ) : null}
                Save draft
              </button>
              <button
                type="submit"
                className={styles.primaryButton}
                disabled={isBusy}
              >
                {submissionState === "submitting" ? (
                  <LoaderCircle
                    className={styles.loadingIcon}
                    size={15}
                    aria-hidden="true"
                  />
                ) : null}
                Submit request
              </button>
            </div>
          </footer>
        </form>
      </aside>
    </div>
  );
}
