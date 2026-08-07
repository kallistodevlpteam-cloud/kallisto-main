import { AlertCircle, Clock3, MoveRight } from "lucide-react";
import { SiteAlert, SiteView } from "../types/site.types";
import styles from "./project-site-workspace.module.css";

interface SiteAttentionStripProps {
  alerts: SiteAlert[];
  onSelect: (view: SiteView) => void;
}

export function SiteAttentionStrip({
  alerts,
  onSelect,
}: SiteAttentionStripProps) {
  if (alerts.length === 0) {
    return null;
  }

  return (
    <section
      className={styles.attentionStrip}
      aria-label="Site items needing attention"
    >
      <div className={styles.attentionItems}>
        {alerts.map((alert) => {
          const Icon = alert.tone === "danger" ? AlertCircle : Clock3;
          return (
            <button
              key={alert.id}
              type="button"
              className={styles.attentionItem}
              onClick={() => onSelect(alert.targetView)}
            >
              <span
                className={
                  alert.tone === "danger"
                    ? styles.attentionIndicatorDanger
                    : styles.attentionIndicatorWarning
                }
              >
                <Icon size={14} aria-hidden="true" />
              </span>
              <span>{alert.label}</span>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        className={styles.inlineAction}
        onClick={() => onSelect("issues")}
      >
        View all
        <MoveRight size={14} aria-hidden="true" />
      </button>
    </section>
  );
}
