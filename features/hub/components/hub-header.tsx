import { ExternalLink } from "lucide-react";

import styles from "./hub-workspace.module.css";

interface HubHeaderProps {
  onCreateRequest: () => void;
  onExploreHub: () => void;
}

export function HubHeader({
  onCreateRequest,
  onExploreHub,
}: HubHeaderProps) {
  return (
    <header className={styles.pageHeader}>
      <div className={styles.pageTitleGroup}>
        <h1>Hub</h1>
        <p>
          Source materials, compare supplier quotations, and track project
          deliveries.
        </p>
      </div>
      <div className={styles.headerActions}>
        <button
          className={styles.secondaryButton}
          type="button"
          onClick={onExploreHub}
        >
          <ExternalLink size={15} aria-hidden="true" />
          Explore Hub
        </button>
        <button
          className={styles.primaryButton}
          type="button"
          onClick={onCreateRequest}
        >
          + Create material request
        </button>
      </div>
    </header>
  );
}
