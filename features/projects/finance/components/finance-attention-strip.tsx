import { AlertCircle, Clock3, MoveRight } from "lucide-react";
import {
  FinanceAttentionItem,
  FinanceView,
} from "../types/project-finance.types";
import styles from "./project-finance-workspace.module.css";

interface FinanceAttentionStripProps {
  items: FinanceAttentionItem[];
  onSelect: (view: FinanceView) => void;
}

export function FinanceAttentionStrip({
  items,
  onSelect,
}: FinanceAttentionStripProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section
      className={styles.attentionStrip}
      aria-label="Finance items needing attention"
    >
      <div className={styles.attentionItems}>
        {items.map((item) => {
          const Icon = item.tone === "danger" ? AlertCircle : Clock3;
          return (
            <button
              key={item.id}
              type="button"
              className={styles.attentionItem}
              onClick={() => onSelect(item.targetView)}
            >
              <span
                className={
                  item.tone === "danger"
                    ? styles.attentionIndicatorDanger
                    : styles.attentionIndicatorWarning
                }
              >
                <Icon size={14} aria-hidden="true" />
              </span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
      <button
        type="button"
        className={styles.inlineAction}
        onClick={() => onSelect(items[0].targetView)}
      >
        View all
        <MoveRight size={14} aria-hidden="true" />
      </button>
    </section>
  );
}
