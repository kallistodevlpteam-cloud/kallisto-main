"use client";

import React, { useState } from "react";
import { FolderPlus, Sparkles, X, ArrowRight, MessageSquare } from "lucide-react";
import { StudioProjectOption } from "@/types/domain/studio";
import styles from "./studio-modal.module.css";

export interface AddProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddProject: (newProject: StudioProjectOption, initialPrompt?: string) => void;
  onSetupInChat?: (promptText: string) => void;
}

const PROJECT_TYPES = [
  "Residential Architecture",
  "Luxury Villa Design",
  "Interior Fit-out & Renovation",
  "Commercial Architecture",
  "Hospitality & Resort Design",
  "Landscape & Exterior",
  "Mixed-use Development",
];

export function AddProjectModal({
  isOpen,
  onClose,
  onAddProject,
  onSetupInChat,
}: AddProjectModalProps) {
  const [name, setName] = useState("");
  const [clientName, setClientName] = useState("");
  const [projectType, setProjectType] = useState(PROJECT_TYPES[0]);
  const [location, setLocation] = useState("");
  const [scope, setScope] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    const now = new Date();
    const year = now.getFullYear();
    const randomCode = Math.floor(100 + Math.random() * 900);
    const code = `PRJ-${year}-${randomCode}`;
    const id = `proj-${Date.now()}`;

    const newProject: StudioProjectOption = {
      id,
      workspaceId: "ws-kallisto-01",
      code,
      name: name.trim(),
      projectType,
      phase: "Briefing & Onboarding",
      location: location.trim() || "Kochi, Kerala",
      status: "active",
      lastActivityAt: now.toISOString(),
    };

    const initialPrompt = `Initialize project workspace for ${newProject.name} (${newProject.projectType})${
      location.trim() ? ` in ${location.trim()}` : ""
    }${clientName.trim() ? ` for client ${clientName.trim()}` : ""}.${
      scope.trim() ? ` Scope: ${scope.trim()}.` : ""
    } Please guide me through establishing the project brief, milestone schedule, and preliminary estimate.`;

    onAddProject(newProject, initialPrompt);
    setIsSubmitting(false);
    onClose();
  };

  const handleStartInChatDirectly = () => {
    const promptText = name.trim()
      ? `Add a new project: I want to onboard "${name.trim()}" (${projectType})${
          location.trim() ? ` located in ${location.trim()}` : ""
        }${clientName.trim() ? ` for client ${clientName.trim()}` : ""}. Help me set up the project brief, key deliverables, and preliminary BOQ.`
      : "Add a new project: Help me onboard a new project for my practice. Guide me through defining the project name, client requirements, site specifications, and initial deliverables step-by-step.";

    if (onSetupInChat) {
      onSetupInChat(promptText);
    }
    onClose();
  };

  return (
    <div className={styles.modalBackdrop} role="dialog" aria-modal="true" aria-labelledby="add-project-modal-title">
      <div className={styles.modalContent} style={{ maxWidth: "36rem" }}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <div className={styles.agentTitleBadgeWrap}>
            <div
              className={styles.agentSparkleIcon}
              style={{ background: "linear-gradient(135deg, #ea580c 0%, #c2410c 100%)" }}
            >
              <FolderPlus size={18} />
            </div>
            <div>
              <h2 id="add-project-modal-title" className={styles.modalTitle}>
                Add New Project
              </h2>
              <p className={styles.modalSubtitle}>
                Initialize a project workspace and kickoff drafting in Hive Studio
              </p>
            </div>
          </div>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close add project modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", flex: 1 }}>
          <div style={{ padding: "1.25rem 1.5rem", display: "flex", flexDirection: "column", gap: "14px" }}>
            {/* Project Name */}
            <div>
              <label
                htmlFor="new-project-name"
                style={{
                  display: "block",
                  fontSize: "12.5px",
                  fontWeight: 650,
                  color: "#0f172a",
                  marginBottom: "5px",
                }}
              >
                Project Name <span style={{ color: "#dc2626" }}>*</span>
              </label>
              <input
                id="new-project-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Emerald Heights Penthouse"
                style={{
                  width: "100%",
                  height: "38px",
                  padding: "0 12px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "13.5px",
                  color: "#0f172a",
                  outline: "none",
                  boxSizing: "border-box",
                  background: "#ffffff",
                }}
                autoFocus
              />
            </div>

            {/* Client Name & Project Type */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div>
                <label
                  htmlFor="new-project-client"
                  style={{
                    display: "block",
                    fontSize: "12.5px",
                    fontWeight: 650,
                    color: "#0f172a",
                    marginBottom: "5px",
                  }}
                >
                  Client Name / Entity
                </label>
                <input
                  id="new-project-client"
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="e.g. Rajiv Menon"
                  style={{
                    width: "100%",
                    height: "38px",
                    padding: "0 12px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    fontSize: "13.5px",
                    color: "#0f172a",
                    outline: "none",
                    boxSizing: "border-box",
                    background: "#ffffff",
                  }}
                />
              </div>

              <div>
                <label
                  htmlFor="new-project-type"
                  style={{
                    display: "block",
                    fontSize: "12.5px",
                    fontWeight: 650,
                    color: "#0f172a",
                    marginBottom: "5px",
                  }}
                >
                  Project Type
                </label>
                <select
                  id="new-project-type"
                  value={projectType}
                  onChange={(e) => setProjectType(e.target.value)}
                  style={{
                    width: "100%",
                    height: "38px",
                    padding: "0 12px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    fontSize: "13px",
                    color: "#0f172a",
                    outline: "none",
                    boxSizing: "border-box",
                    background: "#ffffff",
                    cursor: "pointer",
                  }}
                >
                  {PROJECT_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Location */}
            <div>
              <label
                htmlFor="new-project-location"
                style={{
                  display: "block",
                  fontSize: "12.5px",
                  fontWeight: 650,
                  color: "#0f172a",
                  marginBottom: "5px",
                }}
              >
                Site Location
              </label>
              <input
                id="new-project-location"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Kochi, Kerala"
                style={{
                  width: "100%",
                  height: "38px",
                  padding: "0 12px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "13.5px",
                  color: "#0f172a",
                  outline: "none",
                  boxSizing: "border-box",
                  background: "#ffffff",
                }}
              />
            </div>

            {/* Initial Scope & Notes */}
            <div>
              <label
                htmlFor="new-project-scope"
                style={{
                  display: "block",
                  fontSize: "12.5px",
                  fontWeight: 650,
                  color: "#0f172a",
                  marginBottom: "5px",
                }}
              >
                Initial Scope &amp; Brief (Optional)
              </label>
              <textarea
                id="new-project-scope"
                rows={2}
                value={scope}
                onChange={(e) => setScope(e.target.value)}
                placeholder="e.g. 4BHK luxury interior architecture, Italian marble flooring, teak fluted wall paneling, and modular kitchen..."
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "13px",
                  color: "#0f172a",
                  outline: "none",
                  resize: "vertical",
                  boxSizing: "border-box",
                  fontFamily: "inherit",
                }}
              />
            </div>

            {/* AI Assistant Quick Prompt Box */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "8px 12px",
                background: "#f8fafc",
                border: "1px dashed #cbd5e1",
                borderRadius: "8px",
                gap: "8px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#475569" }}>
                <Sparkles size={13} style={{ color: "#7c3aed" }} />
                <span>Want Odin AI to interview you for details instead?</span>
              </div>
              <button
                type="button"
                onClick={handleStartInChatDirectly}
                style={{
                  appearance: "none",
                  background: "transparent",
                  border: "none",
                  color: "#2563eb",
                  fontSize: "12px",
                  fontWeight: 650,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "3px",
                  padding: "2px 6px",
                }}
              >
                <span>Setup in Chat</span>
                <MessageSquare size={12} />
              </button>
            </div>
          </div>

          {/* Footer Actions */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: "10px",
              padding: "1rem 1.5rem",
              background: "#f8fafc",
              borderTop: "1px solid #e2e8f0",
            }}
          >
            <button
              type="button"
              onClick={onClose}
              style={{
                appearance: "none",
                background: "#ffffff",
                border: "1px solid #cbd5e1",
                color: "#475569",
                fontSize: "13px",
                fontWeight: 600,
                padding: "8px 14px",
                borderRadius: "8px",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() || isSubmitting}
              style={{
                appearance: "none",
                background: name.trim() ? "#0f172a" : "#94a3b8",
                border: "none",
                color: "#ffffff",
                fontSize: "13px",
                fontWeight: 600,
                padding: "8px 16px",
                borderRadius: "8px",
                cursor: name.trim() ? "pointer" : "not-allowed",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                boxShadow: name.trim() ? "0 1px 3px rgba(15, 23, 42, 0.12)" : "none",
              }}
            >
              <span>Add Project &amp; Start in Hive Chat</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
