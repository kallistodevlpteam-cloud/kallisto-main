import {
  CalendarClock,
  ChevronRight,
  MapPin,
  UserRound,
  UsersRound,
} from "lucide-react";
import type { Deployment } from "../types/hands.types";
import {
  formatAttendance,
  formatInr,
} from "../utils/hands-formatters";
import styles from "./hands-overview.module.css";

interface DeploymentMobileCardProps {
  deployment: Deployment;
  onSelect: (deployment: Deployment) => void;
}

export function DeploymentMobileCard({
  deployment,
  onSelect,
}: DeploymentMobileCardProps) {
  const statusClass =
    deployment.status === "Active"
      ? styles.statusActive
      : deployment.status === "Needs attention"
        ? styles.statusAttention
        : styles.statusWaiting;

  return (
    <article className={styles.deploymentMobileCard}>
      <button
        type="button"
        className={styles.mobileCardButton}
        onClick={() => onSelect(deployment)}
        aria-label={`Open ${deployment.projectName} deployment`}
      >
        <div className={styles.mobileCardTop}>
          <div>
            <strong>{deployment.projectName}</strong>
            <span>
              <MapPin size={12} aria-hidden="true" />
              {deployment.location}
            </span>
          </div>
          <ChevronRight size={16} aria-hidden="true" />
        </div>

        <div className={styles.mobileCardWorkforce}>
          <UsersRound size={14} aria-hidden="true" />
          {deployment.workforce}
        </div>

        <dl className={styles.mobileCardMeta}>
          <div>
            <dt>
              <CalendarClock size={13} aria-hidden="true" />
              Shift
            </dt>
            <dd>{deployment.shift}</dd>
          </div>
          <div>
            <dt>Attendance</dt>
            <dd>{formatAttendance(deployment.attendance)}</dd>
          </div>
          <div>
            <dt>
              <UserRound size={13} aria-hidden="true" />
              Supervisor
            </dt>
            <dd>{deployment.supervisor}</dd>
          </div>
          <div>
            <dt>Daily cost</dt>
            <dd>{formatInr(deployment.dailyCost)}</dd>
          </div>
        </dl>

        <div className={styles.mobileCardFooter}>
          <span className={`${styles.statusBadge} ${statusClass}`}>
            <span className={styles.statusDot} aria-hidden="true" />
            {deployment.status}
          </span>
          <span className={styles.textAction}>Open deployment</span>
        </div>
      </button>
    </article>
  );
}
