import type {
  PipelineStageSummary,
  ProcurementStage,
} from "../types/hub.types";
import styles from "./hub-workspace.module.css";

interface ProcurementPipelineProps {
  stages: ReadonlyArray<PipelineStageSummary>;
  activeStage: ProcurementStage;
  onSelect: (stage: ProcurementStage) => void;
}

export function ProcurementPipeline({
  stages,
  activeStage,
  onSelect,
}: ProcurementPipelineProps) {
  return (
    <section aria-labelledby="procurement-pipeline-title">
      <div className={styles.sectionHeading}>
        <h2 id="procurement-pipeline-title">Procurement pipeline</h2>
        <p>Requirements includes all active requests for the selected project.</p>
      </div>
      <div
        className={styles.pipelineScroller}
        role="tablist"
        aria-label="Procurement pipeline stages"
      >
        {stages.map((stage, index) => {
          const isActive = activeStage === stage.id;
          return (
            <button
              key={stage.id}
              className={`${styles.pipelineStage}${
                isActive ? ` ${styles.pipelineStageActive}` : ""
              }`}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onSelect(stage.id)}
            >
              <span className={styles.pipelineIndex}>
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className={styles.pipelineContent}>
                <strong>{stage.label}</strong>
                <span>{stage.countLabel}</span>
              </span>
              <span className={styles.pipelineValue}>{stage.valueLabel}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
