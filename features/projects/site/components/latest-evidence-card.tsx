import {
  Camera,
  ClipboardCheck,
  MoveRight,
  Ruler,
  Truck,
} from "lucide-react";
import { SiteEvidence } from "../types/site.types";
import { formatEvidenceType } from "../utils/site-formatters";
import styles from "./project-site-workspace.module.css";

interface LatestEvidenceCardProps {
  evidence: SiteEvidence[];
  onViewAll: () => void;
}

function evidenceIcon(evidence: SiteEvidence) {
  if (evidence.evidenceType === "inspection_evidence") {
    return ClipboardCheck;
  }

  if (evidence.evidenceType === "delivery_proof") {
    return Truck;
  }

  if (evidence.evidenceType === "measurement_evidence") {
    return Ruler;
  }

  return Camera;
}

function thumbnailClassName(evidence: SiteEvidence): string {
  const toneClasses = {
    structure: styles.evidenceStructure,
    electrical: styles.evidenceElectrical,
    inspection: styles.evidenceInspection,
    delivery: styles.evidenceDelivery,
  };

  return `${styles.evidenceThumbnail} ${toneClasses[evidence.visualTone]}`;
}

export function LatestEvidenceCard({
  evidence,
  onViewAll,
}: LatestEvidenceCardProps) {
  return (
    <article className={`${styles.card} ${styles.evidenceCard}`}>
      <div className={styles.cardHeader}>
        <div>
          <h3>Latest Evidence</h3>
          <p>Newest project-linked field records</p>
        </div>
      </div>

      <div className={styles.evidenceGrid}>
        {evidence.slice(0, 4).map((item) => {
          const Icon = evidenceIcon(item);
          return (
            <article className={styles.evidenceItem} key={item.id}>
              <div
                className={thumbnailClassName(item)}
                role="img"
                aria-label={`${formatEvidenceType(item.evidenceType)} placeholder for ${item.activityTitle}`}
              >
                <span>
                  <Icon size={20} aria-hidden="true" />
                </span>
                <small>{item.id.replace("evidence-", "EV · ")}</small>
              </div>
              <div className={styles.evidenceMeta}>
                <div>
                  <strong>{item.activityTitle}</strong>
                  <time>{item.capturedAt}</time>
                </div>
                <span>{formatEvidenceType(item.evidenceType)}</span>
                <p>Uploaded by {item.uploadedBy}</p>
              </div>
            </article>
          );
        })}
      </div>

      <button
        type="button"
        className={styles.cardFooterAction}
        onClick={onViewAll}
      >
        View all evidence
        <MoveRight size={14} aria-hidden="true" />
      </button>
    </article>
  );
}
