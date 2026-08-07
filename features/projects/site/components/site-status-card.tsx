import {
  ClipboardCheck,
  HardHat,
  ShieldCheck,
  UserRoundCheck,
} from "lucide-react";
import { SiteDay } from "../types/site.types";
import styles from "./project-site-workspace.module.css";

interface SiteStatusCardProps {
  siteDay: SiteDay;
}

export function SiteStatusCard({ siteDay }: SiteStatusCardProps) {
  const { attendance, safety, nextControlPoint } = siteDay;

  return (
    <article className={`${styles.card} ${styles.siteStatusCard}`}>
      <div className={styles.cardHeader}>
        <div>
          <h3>Site Status</h3>
          <p>Current field conditions</p>
        </div>
        <span className={styles.siteOpenBadge}>
          <i aria-hidden="true" />
          Site open
        </span>
      </div>

      <div className={styles.siteStatusGroups}>
        <section className={styles.siteStatusGroup}>
          <span className={styles.statusGroupIcon}>
            <UserRoundCheck size={15} aria-hidden="true" />
          </span>
          <div>
            <span className={styles.statusGroupLabel}>Current status</span>
            <strong>Site open</strong>
            <p>Last check-in: {attendance.lastCheckInTime}</p>
          </div>
        </section>

        <section className={styles.siteStatusGroup}>
          <span className={styles.statusGroupIcon}>
            <HardHat size={15} aria-hidden="true" />
          </span>
          <div>
            <span className={styles.statusGroupLabel}>Workforce</span>
            <strong>{attendance.peopleOnSite} people on site</strong>
            <p>
              {attendance.supervisors} supervisors · {attendance.contractors}{" "}
              contractors
            </p>
          </div>
        </section>

        <section className={styles.siteStatusGroup}>
          <span className={styles.statusGroupIcon}>
            <ShieldCheck size={15} aria-hidden="true" />
          </span>
          <div>
            <span className={styles.statusGroupLabel}>Safety</span>
            <strong>{safety.activeIncidentCount} active incidents</strong>
            <p>Last toolbox talk: {safety.lastToolboxTalk}</p>
          </div>
        </section>

        <section className={styles.siteStatusGroup}>
          <span className={styles.statusGroupIcon}>
            <ClipboardCheck size={15} aria-hidden="true" />
          </span>
          <div>
            <span className={styles.statusGroupLabel}>Next control point</span>
            <strong>{nextControlPoint.title}</strong>
            <p>
              {nextControlPoint.scheduledTime} ·{" "}
              {nextControlPoint.assignmentStatus}
            </p>
          </div>
        </section>
      </div>
    </article>
  );
}
