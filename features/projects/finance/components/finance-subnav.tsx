import { FinanceView } from "../types/project-finance.types";
import { FINANCE_VIEWS } from "../utils/finance-query-state";
import styles from "./project-finance-workspace.module.css";

interface FinanceSubnavProps {
  activeView: FinanceView;
  onViewChange: (view: FinanceView) => void;
}

export function FinanceSubnav({
  activeView,
  onViewChange,
}: FinanceSubnavProps) {
  return (
    <nav className={styles.subnav} aria-label="Finance workspace views">
      <div role="tablist" aria-label="Finance views">
        {FINANCE_VIEWS.map((view) => (
          <button
            key={view.id}
            type="button"
            role="tab"
            aria-selected={activeView === view.id}
            className={
              activeView === view.id
                ? styles.subnavTabActive
                : styles.subnavTab
            }
            onClick={() => onViewChange(view.id)}
          >
            {view.label}
          </button>
        ))}
      </div>
    </nav>
  );
}
