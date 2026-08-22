"use client";

import { CheckCircle2, LoaderCircle, X } from "lucide-react";
import { useRef, useState, type FormEvent } from "react";
import {
  saveWorkforceRequestDraft,
  submitWorkforceRequest,
} from "../services/hands.mock";
import type {
  WorkerTrade,
  WorkforceRequestDraft,
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
      base.projectId = initialProjectId;
      const matched = PROJECTS.find((p) => p.id === initialProjectId);
      if (matched) base.siteLocation = matched.location;
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

    if (
      !values.projectId ||
      !values.trade ||
      !values.startDate ||
      !values.expectedDuration
    ) {
      return;
    }

    setSubmissionState("submitting");
    setStatusMessage("");

    try {
      await submitWorkforceRequest({
        projectId: values.projectId,
        siteLocation: values.siteLocation,
        trade: values.trade,
        workerCount: Number(values.workerCount),
        skillLevel: values.skillLevel,
        startDate: values.startDate,
        expectedDuration: values.expectedDuration,
        shiftTiming: values.shiftTiming,
        requiredToolsOrCertifications:
          values.requiredToolsOrCertifications,
        siteContact: values.siteContact,
        notes: values.notes,
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

              <label
                className={`${styles.formField} ${styles.formFieldWide}`}
              >
                <span>Required tools or certifications</span>
                <input
                  type="text"
                  value={values.requiredToolsOrCertifications}
                  onChange={(event) =>
                    updateField(
                      "requiredToolsOrCertifications",
                      event.target.value,
                    )
                  }
                  placeholder="Safety card, licence, or specialist tools"
                  disabled={isBusy}
                />
              </label>

              <label className={styles.formField}>
                <span>Site contact</span>
                <input
                  type="text"
                  value={values.siteContact}
                  onChange={(event) =>
                    updateField("siteContact", event.target.value)
                  }
                  placeholder="Name and phone"
                  disabled={isBusy}
                />
              </label>

              <label
                className={`${styles.formField} ${styles.formFieldWide}`}
              >
                <span>Notes</span>
                <textarea
                  value={values.notes}
                  onChange={(event) =>
                    updateField("notes", event.target.value)
                  }
                  rows={4}
                  placeholder="Access instructions, scope details, or site constraints"
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
