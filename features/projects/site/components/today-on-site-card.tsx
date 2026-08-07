import {
  Camera,
  Clock3,
  HardHat,
  MapPin,
  Users,
} from "lucide-react";
import { SiteActivity } from "../types/site.types";
import {
  formatActivityStatus,
  formatEvidenceCount,
  formatWorkerCount,
} from "../utils/site-formatters";
import { getActivityStatusTone } from "../utils/site-status";
import styles from "./project-site-workspace.module.css";

interface TodayOnSiteCardProps {
  activities: SiteActivity[];
  onActivitySelect: (activity: SiteActivity) => void;
}

function statusClassName(activity: SiteActivity): string {
  const tone = getActivityStatusTone(activity.status);
  const toneClasses = {
    neutral: styles.statusNeutral,
    active: styles.statusActive,
    warning: styles.statusWarning,
    danger: styles.statusDanger,
    success: styles.statusSuccess,
  };

  return `${styles.statusBadge} ${toneClasses[tone]}`;
}

export function TodayOnSiteCard({
  activities,
  onActivitySelect,
}: TodayOnSiteCardProps) {
  return (
    <article className={`${styles.card} ${styles.todayCard}`}>
      <div className={styles.cardHeader}>
        <div>
          <h3>Today on Site</h3>
          <p>{activities.length} scheduled activities</p>
        </div>
        <span className={styles.cardHeaderMeta}>
          <Clock3 size={14} aria-hidden="true" />
          Live sequence
        </span>
      </div>

      <div className={styles.activityList}>
        {activities.map((activity) => (
          <button
            key={activity.id}
            type="button"
            className={styles.activityRow}
            aria-label={`Open ${activity.title} details`}
            onClick={() => onActivitySelect(activity)}
          >
            <span className={styles.activityTime}>
              <strong>{activity.startTime}</strong>
              <span>{activity.endTime}</span>
            </span>

            <span className={styles.activityIdentity}>
              <span className={styles.activityTitle}>{activity.title}</span>
              <span className={styles.activityZone}>
                <MapPin size={13} aria-hidden="true" />
                {activity.zone}
              </span>
              <span className={styles.activityMeta}>
                <span>
                  <HardHat size={13} aria-hidden="true" />
                  {activity.crew}
                </span>
                <span>
                  <Users size={13} aria-hidden="true" />
                  {formatWorkerCount(activity.workerCount)}
                </span>
                <span>
                  <Camera size={13} aria-hidden="true" />
                  {formatEvidenceCount(activity.evidenceCount)}
                </span>
              </span>
            </span>

            <span className={styles.activityProgressCell}>
              <span className={styles.activityStatusLine}>
                <span className={statusClassName(activity)}>
                  {formatActivityStatus(activity.status)}
                </span>
                <strong>{activity.progressPercent}%</strong>
              </span>
              <span
                className={styles.activityProgress}
                role="progressbar"
                aria-label={`${activity.title} progress`}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={activity.progressPercent}
              >
                <span style={{ width: `${activity.progressPercent}%` }} />
              </span>
              <span className={styles.activityUpdated}>
                Updated {activity.lastUpdatedTime}
              </span>
            </span>
          </button>
        ))}
      </div>
    </article>
  );
}
