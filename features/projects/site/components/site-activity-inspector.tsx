"use client";

import { useEffect, useRef } from "react";
import {
  Boxes,
  Camera,
  Clock3,
  History,
  Link2,
  MessageSquare,
  Route,
  Users,
  X,
} from "lucide-react";
import { SiteActivity } from "../types/site.types";
import {
  formatActivityStatus,
  formatEvidenceCount,
  formatWorkerCount,
} from "../utils/site-formatters";
import styles from "./project-site-workspace.module.css";

interface SiteActivityInspectorProps {
  activity: SiteActivity;
  onClose: () => void;
}

export function SiteActivityInspector({
  activity,
  onClose,
}: SiteActivityInspectorProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    headingRef.current?.focus();

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  return (
    <div className={styles.inspectorLayer}>
      <button
        type="button"
        className={styles.inspectorBackdrop}
        aria-label="Close activity inspector"
        onClick={onClose}
      />
      <aside
        className={styles.activityInspector}
        role="dialog"
        aria-modal="true"
        aria-labelledby="activity-inspector-title"
      >
        <header className={styles.inspectorHeader}>
          <div>
            <span>Site activity</span>
            <h2
              id="activity-inspector-title"
              ref={headingRef}
              tabIndex={-1}
            >
              {activity.title}
            </h2>
            <p>
              {activity.startTime}–{activity.endTime} · {activity.zone}
            </p>
          </div>
          <button
            type="button"
            className={styles.iconButton}
            aria-label="Close activity details"
            onClick={onClose}
          >
            <X size={17} aria-hidden="true" />
          </button>
        </header>

        <div className={styles.inspectorBody}>
          <section className={styles.inspectorSummary}>
            <div>
              <span>Status</span>
              <strong>{formatActivityStatus(activity.status)}</strong>
            </div>
            <div>
              <span>Progress</span>
              <strong>{activity.progressPercent}%</strong>
            </div>
            <div>
              <span>Evidence</span>
              <strong>{formatEvidenceCount(activity.evidenceCount)}</strong>
            </div>
          </section>

          <section className={styles.inspectorSection}>
            <h3>Activity description</h3>
            <p>{activity.description}</p>
          </section>

          <section className={styles.inspectorDetailGrid}>
            <div>
              <span className={styles.inspectorDetailIcon}>
                <Users size={15} aria-hidden="true" />
              </span>
              <span>
                <small>Crew</small>
                <strong>{activity.crew}</strong>
                <p>{formatWorkerCount(activity.workerCount)}</p>
              </span>
            </div>
            <div>
              <span className={styles.inspectorDetailIcon}>
                <Clock3 size={15} aria-hidden="true" />
              </span>
              <span>
                <small>Duration</small>
                <strong>{activity.plannedDuration} planned</strong>
                <p>{activity.actualDuration || "Not started"}</p>
              </span>
            </div>
          </section>

          <section className={styles.inspectorSection}>
            <h3>
              <Boxes size={15} aria-hidden="true" />
              Dependencies
            </h3>
            <ul className={styles.dependencyList}>
              {activity.dependencies.map((dependency) => (
                <li key={dependency}>{dependency}</li>
              ))}
            </ul>
          </section>

          <section className={styles.inspectorSection}>
            <h3>
              <Link2 size={15} aria-hidden="true" />
              Project references
            </h3>
            <div className={styles.referenceList}>
              <div>
                <span className={styles.referenceIcon}>
                  <Route size={15} aria-hidden="true" />
                </span>
                <span>
                  <small>Timeline task</small>
                  <strong>{activity.linkedTimelineTaskLabel}</strong>
                  <p>{activity.linkedTimelineTaskId}</p>
                </span>
              </div>
              <div>
                <span className={styles.referenceIcon}>
                  <Boxes size={15} aria-hidden="true" />
                </span>
                <span>
                  <small>BOQ item</small>
                  <strong>{activity.linkedBoqItemLabel}</strong>
                  <p>{activity.linkedBoqItemId}</p>
                </span>
              </div>
            </div>
          </section>

          <section className={styles.inspectorSection}>
            <h3>
              <Camera size={15} aria-hidden="true" />
              Evidence
            </h3>
            <p>
              {activity.evidenceCount > 0
                ? `${formatEvidenceCount(activity.evidenceCount)} linked to this exact activity record.`
                : "No evidence has been linked to this activity yet."}
            </p>
          </section>

          <section className={styles.inspectorSection}>
            <h3>
              <MessageSquare size={15} aria-hidden="true" />
              Comments
            </h3>
            {activity.comments.length > 0 ? (
              <div className={styles.inspectorTimeline}>
                {activity.comments.map((comment) => (
                  <div key={comment.id}>
                    <strong>{comment.author}</strong>
                    <time>{comment.createdAt}</time>
                    <p>{comment.message}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p>No comments have been recorded.</p>
            )}
          </section>

          <section className={styles.inspectorSection}>
            <h3>
              <History size={15} aria-hidden="true" />
              Audit history
            </h3>
            <div className={styles.inspectorTimeline}>
              {activity.auditHistory.map((event) => (
                <div key={event.id}>
                  <strong>{event.action}</strong>
                  <time>{event.createdAt}</time>
                  <p>{event.actor}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </aside>
    </div>
  );
}
