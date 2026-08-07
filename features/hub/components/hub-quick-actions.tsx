import {
  ClipboardPlus,
  GitCompareArrows,
  PackageSearch,
  Truck,
  type LucideIcon,
} from "lucide-react";

import styles from "./hub-workspace.module.css";

export type HubQuickActionId = "create" | "browse" | "compare" | "track";

interface QuickAction {
  id: HubQuickActionId;
  title: string;
  description: string;
  icon: LucideIcon;
}

const QUICK_ACTIONS: ReadonlyArray<QuickAction> = [
  {
    id: "create",
    title: "Create material request",
    description: "Prepare an RFQ from a project requirement or BOQ.",
    icon: ClipboardPlus,
  },
  {
    id: "browse",
    title: "Browse materials",
    description: "Search verified products, brands and suppliers.",
    icon: PackageSearch,
  },
  {
    id: "compare",
    title: "Compare quotations",
    description: "Compare rates, taxes, delivery dates and payment terms.",
    icon: GitCompareArrows,
  },
  {
    id: "track",
    title: "Track deliveries",
    description: "Monitor dispatched, delayed and delivered orders.",
    icon: Truck,
  },
];

interface HubQuickActionsProps {
  activeAction: HubQuickActionId | null;
  onSelect: (action: HubQuickActionId) => void;
}

export function HubQuickActions({
  activeAction,
  onSelect,
}: HubQuickActionsProps) {
  return (
    <section aria-labelledby="quick-actions-title">
      <div className={styles.sectionHeading}>
        <h2 id="quick-actions-title">Quick actions</h2>
      </div>
      <div className={styles.quickActionGrid}>
        {QUICK_ACTIONS.map((action) => {
          const Icon = action.icon;
          const isActive = activeAction === action.id;

          return (
            <button
              className={`${styles.quickAction}${
                isActive ? ` ${styles.quickActionActive}` : ""
              }`}
              key={action.id}
              type="button"
              aria-pressed={isActive}
              onClick={() => onSelect(action.id)}
            >
              <span className={styles.quickActionIcon}>
                <Icon size={17} strokeWidth={1.8} aria-hidden="true" />
              </span>
              <span className={styles.quickActionText}>
                <strong>{action.title}</strong>
                <span>{action.description}</span>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
