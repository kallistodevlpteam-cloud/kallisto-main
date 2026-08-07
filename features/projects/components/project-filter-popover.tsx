import React, { useState } from "react";
import { X } from "lucide-react";
import { ProjectFilterParams, ProjectPhase } from "../types/project.types";
import styles from "../projects.module.css";

interface ProjectFilterPopoverProps {
  filters: ProjectFilterParams;
  onApply: (updated: Partial<ProjectFilterParams>) => void;
  onClear: () => void;
  onClose: () => void;
}

const PHASES: ProjectPhase[] = [
  "Briefing",
  "Site verification",
  "Concept",
  "Design development",
  "Approvals",
  "BOQ and procurement",
  "Construction",
  "Handover",
  "Post-handover",
];

export function ProjectFilterPopover({
  filters,
  onApply,
  onClear,
  onClose,
}: ProjectFilterPopoverProps) {
  const [localOwnership, setLocalOwnership] = useState(filters.ownership || "all_projects");
  const [selectedPhases, setSelectedPhases] = useState<ProjectPhase[]>(filters.phase || []);
  const [selectedAttention, setSelectedAttention] = useState<NonNullable<ProjectFilterParams["attention"]>>(
    filters.attention || []
  );
  const [locationInput, setLocationInput] = useState(filters.location || "");
  const [selectedLifecycle, setSelectedLifecycle] = useState<NonNullable<ProjectFilterParams["lifecycle"]>>(
    filters.lifecycle || []
  );

  const togglePhase = (phase: ProjectPhase) => {
    setSelectedPhases((prev) =>
      prev.includes(phase) ? prev.filter((p) => p !== phase) : [...prev, phase]
    );
  };

  const toggleAttention = (item: NonNullable<ProjectFilterParams["attention"]>[number]) => {
    setSelectedAttention((prev) =>
      prev.includes(item) ? prev.filter((a) => a !== item) : [...prev, item]
    );
  };

  const toggleLifecycle = (item: NonNullable<ProjectFilterParams["lifecycle"]>[number]) => {
    setSelectedLifecycle((prev) =>
      prev.includes(item) ? prev.filter((l) => l !== item) : [...prev, item]
    );
  };

  const handleApply = () => {
    onApply({
      ownership: localOwnership !== "all_projects" ? localOwnership : undefined,
      phase: selectedPhases.length ? selectedPhases : undefined,
      attention: selectedAttention.length ? selectedAttention : undefined,
      location: locationInput.trim() || undefined,
      lifecycle: selectedLifecycle.length ? selectedLifecycle : undefined,
    });
    onClose();
  };

  return (
    <div className={styles.filterPopover}>
      <div className={styles.popoverHeader}>
        <h3>Filter Projects</h3>
        <button type="button" onClick={onClose} className={styles.closeBtn}>
          <X size={15} />
        </button>
      </div>

      <div className={styles.popoverBody}>
        {/* Ownership Section */}
        <div className={styles.filterSection}>
          <label className={styles.sectionTitle}>Ownership</label>
          <div className={styles.radioGroup}>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                name="ownership"
                checked={localOwnership === "all_projects"}
                onChange={() => setLocalOwnership("all_projects")}
              />
              <span>All projects</span>
            </label>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                name="ownership"
                checked={localOwnership === "my_projects"}
                onChange={() => setLocalOwnership("my_projects")}
              />
              <span>My projects</span>
            </label>
          </div>
        </div>

        {/* Project Phase Section */}
        <div className={styles.filterSection}>
          <label className={styles.sectionTitle}>Project Phase</label>
          <div className={styles.checkboxGrid}>
            {PHASES.map((p) => (
              <label key={p} className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={selectedPhases.includes(p)}
                  onChange={() => togglePhase(p)}
                />
                <span>{p}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Attention Section */}
        <div className={styles.filterSection}>
          <label className={styles.sectionTitle}>Needs Attention</label>
          <div className={styles.checkboxGrid}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={selectedAttention.includes("overdue")}
                onChange={() => toggleAttention("overdue")}
              />
              <span>Overdue action</span>
            </label>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={selectedAttention.includes("blocked")}
                onChange={() => toggleAttention("blocked")}
              />
              <span>Blocked</span>
            </label>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={selectedAttention.includes("awaiting_client")}
                onChange={() => toggleAttention("awaiting_client")}
              />
              <span>Awaiting client</span>
            </label>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={selectedAttention.includes("missing_owner")}
                onChange={() => toggleAttention("missing_owner")}
              />
              <span>Missing owner</span>
            </label>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={selectedAttention.includes("missing_next_action")}
                onChange={() => toggleAttention("missing_next_action")}
              />
              <span>Missing next action</span>
            </label>
          </div>
        </div>

        {/* Lifecycle Status Section (Requirement #4) */}
        <div className={styles.filterSection}>
          <label className={styles.sectionTitle}>Lifecycle Records</label>
          <div className={styles.checkboxGrid}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={selectedLifecycle.includes("CANCELLED")}
                onChange={() => toggleLifecycle("CANCELLED")}
              />
              <span>Include Cancelled</span>
            </label>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={selectedLifecycle.includes("ARCHIVED")}
                onChange={() => toggleLifecycle("ARCHIVED")}
              />
              <span>Include Archived</span>
            </label>
          </div>
        </div>

        {/* Location Section */}
        <div className={styles.filterSection}>
          <label className={styles.sectionTitle}>Location</label>
          <input
            type="text"
            className={styles.textInput}
            placeholder="City or district (e.g. Kochi, Hyderabad)"
            value={locationInput}
            onChange={(e) => setLocationInput(e.target.value)}
          />
        </div>
      </div>

      <div className={styles.popoverFooter}>
        <button type="button" className={styles.clearBtn} onClick={onClear}>
          Clear all
        </button>
        <button type="button" className={styles.applyBtn} onClick={handleApply}>
          Apply filters
        </button>
      </div>
    </div>
  );
}
