import Image from "next/image";
import { Calendar, Clock } from "lucide-react";
import {
  ProjectHeaderManager,
  ProjectHeaderMilestone,
  ProjectHeaderTeamMember,
} from "./project-header.types";
import styles from "./project-header.module.css";

interface ProjectMetricsStripProps {
  manager: ProjectHeaderManager;
  milestone: ProjectHeaderMilestone;
  progressPercent: number;
  teamAdditionalCount: number;
  teamMembers: ProjectHeaderTeamMember[];
  onViewTeam?: () => void;
}

export function ProjectMetricsStrip({
  manager,
  milestone,
  progressPercent,
  teamAdditionalCount,
  teamMembers,
  onViewTeam,
}: ProjectMetricsStripProps) {
  const boundedProgress = Math.min(100, Math.max(0, progressPercent));

  return (
    <dl className={styles.metricsStrip} aria-label="Project metrics">
      <div className={styles.metric}>
        <dt className={styles.metricLabel}>Project progress</dt>
        <dd className={styles.metricValue}>{boundedProgress}% Complete</dd>
        <div
          className={styles.progressTrack}
          role="progressbar"
          aria-label="Project progress"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={boundedProgress}
        >
          <span className={styles.progressFill} style={{ width: `${boundedProgress}%` }} />
        </div>
      </div>

      <div className={styles.metric}>
        <dt className={styles.metricLabel}>Next milestone</dt>
        <dd className={styles.metricValueRow}>
          <Calendar size={15} aria-hidden="true" />
          <span>{milestone.title}</span>
        </dd>
        <span className={styles.metricSupporting}>
          <Clock size={13} aria-hidden="true" />
          {milestone.supportingText}
        </span>
      </div>

      <div className={styles.metric}>
        <dt className={styles.metricLabel}>Project manager</dt>
        <dd className={styles.managerValue}>
          {manager.avatarUrl ? (
            <Image
              src={manager.avatarUrl}
              alt=""
              width={32}
              height={32}
              className={styles.managerAvatar}
              unoptimized
            />
          ) : (
            <span className={styles.managerAvatarFallback} aria-hidden="true">
              {manager.name
                .split(" ")
                .map((part) => part[0])
                .join("")
                .slice(0, 2)}
            </span>
          )}
          <span>{manager.name}</span>
        </dd>
      </div>

      <div className={styles.metric}>
        <dt className={styles.metricLabel}>Project team</dt>
        <dd className={styles.teamValue}>
          <div className={styles.teamAvatars} aria-label={`${teamMembers.length + teamAdditionalCount} project team members`}>
            {teamMembers.map((member, index) => (
              <span
                key={member.id}
                className={`${styles.teamAvatar} ${styles[`teamAvatar${(index % 4) + 1}`]}`}
                title={member.name}
              >
                {member.initials}
              </span>
            ))}
            {teamAdditionalCount > 0 ? (
              <span className={`${styles.teamAvatar} ${styles.teamAvatarMore}`}>
                +{teamAdditionalCount}
              </span>
            ) : null}
          </div>
          <button type="button" className={styles.viewTeamButton} onClick={onViewTeam}>
            View Team
          </button>
        </dd>
      </div>
    </dl>
  );
}
