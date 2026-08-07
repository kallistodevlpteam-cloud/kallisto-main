import { ChevronDown } from "lucide-react";

import type {
  HubProjectFilter,
  ProcurementMetric,
  ProjectOption,
} from "../types/hub.types";
import styles from "./hub-workspace.module.css";

interface ProcurementOverviewProps {
  projects: ReadonlyArray<ProjectOption>;
  metrics: ReadonlyArray<ProcurementMetric>;
  selectedProject: HubProjectFilter;
  onProjectChange: (project: HubProjectFilter) => void;
}

export function ProcurementOverview({
  projects,
  metrics,
  selectedProject,
  onProjectChange,
}: ProcurementOverviewProps) {
  return (
    <section
      className={styles.overview}
      aria-labelledby="procurement-overview-title"
    >
      <div className={styles.overviewCopy}>
        <p className={styles.eyebrow}>Project procurement</p>
        <h2 id="procurement-overview-title">
          Plan and manage material requirements
        </h2>
        <p className={styles.overviewDescription}>
          Create requests from project requirements or BOQs and manage
          quotations, orders and deliveries.
        </p>
        <label className={styles.projectSelector}>
          <span className="sr-only">Select procurement project</span>
          <select
            aria-label="Select procurement project"
            value={selectedProject}
            onChange={(event) =>
              onProjectChange(event.target.value as HubProjectFilter)
            }
          >
            <option value="all">All projects</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
          <ChevronDown size={14} aria-hidden="true" />
        </label>
      </div>
      <dl className={styles.metrics}>
        {metrics.map((metric) => (
          <div className={styles.metric} key={metric.label}>
            <dt>{metric.label}</dt>
            <dd
              className={
                metric.tone === "warning" ? styles.metricWarning : undefined
              }
            >
              {metric.value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
