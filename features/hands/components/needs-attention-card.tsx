import {
  AlertTriangle,
  ChevronRight,
} from "lucide-react";
import {
  ClockDuotoneIcon,
  ResolveDuotoneIcon,
} from "@/components/layout/sidebar-icons";
import type { AttentionItem, HandsTab } from "../types/hands.types";
import styles from "./hands-overview.module.css";

interface NeedsAttentionCardProps {
  items: AttentionItem[];
  onNavigateTab: (tab: HandsTab) => void;
}

const SEVERITY_ICONS = {
  critical: ResolveDuotoneIcon,
  warning: AlertTriangle,
  info: ClockDuotoneIcon,
} as const;

export function NeedsAttentionCard({
  items,
  onNavigateTab,
}: NeedsAttentionCardProps) {
  return (
    <section
      className={styles.sectionCard}
      aria-labelledby="needs-attention-title"
    >
      <div className={styles.cardHeader}>
        <div>
          <h2 id="needs-attention-title">Needs attention</h2>
          <p>Workforce issues requiring action</p>
        </div>
        <span className={styles.itemCount}>{items.length} open</span>
      </div>

      <div className={styles.attentionList}>
        {items.map((item) => {
          const Icon = SEVERITY_ICONS[item.severity];

          return (
            <div key={item.id} className={styles.attentionItem}>
              <span
                className={`${styles.severityIcon} ${
                  styles[`severity${item.severity}`]
                }`}
              >
                <Icon size={16} aria-hidden="true" />
              </span>
              <div className={styles.attentionCopy}>
                <strong>{item.title}</strong>
                <span>{item.detail}</span>
              </div>
              <button
                type="button"
                className={styles.attentionAction}
                onClick={() => onNavigateTab(item.actionTab)}
              >
                {item.actionLabel}
                <ChevronRight size={14} aria-hidden="true" />
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
