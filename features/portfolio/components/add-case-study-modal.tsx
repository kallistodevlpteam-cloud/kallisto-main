"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  AlertCircle,
  BookOpen,
  Camera,
  Check,
  Pencil,
  Plus,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";
import type {
  ConstructionProjectType,
  PortfolioCaseStudy,
  PortfolioProject,
} from "@/features/portfolio/types/portfolio.types";
import styles from "./add-case-study-modal.module.css";

const CATEGORY_OPTIONS: { type: ConstructionProjectType; label: string }[] = [
  { type: "residential", label: "Residential" },
  { type: "commercial", label: "Commercial" },
  { type: "interior", label: "Interior Design" },
  { type: "renovation", label: "Renovation" },
  { type: "hospitality", label: "Hospitality" },
  { type: "retail", label: "Retail & Showroom" },
  { type: "institutional", label: "Institutional" },
  { type: "landscape", label: "Landscape" },
  { type: "multi_residential", label: "Multi-Residential" },
];

export interface AddCaseStudyModalProps {
  isOpen: boolean;
  initialCaseStudy?: PortfolioCaseStudy | null;
  onClose: () => void;
  onAddCaseStudy: (caseStudy: PortfolioCaseStudy) => void;
  availableProjects?: PortfolioProject[];
}

function CaseStudyFormDialog({
  initialCaseStudy,
  onClose,
  onAddCaseStudy,
  availableProjects,
}: {
  initialCaseStudy?: PortfolioCaseStudy | null;
  onClose: () => void;
  onAddCaseStudy: (caseStudy: PortfolioCaseStudy) => void;
  availableProjects: PortfolioProject[];
}) {
  const isEditing = Boolean(initialCaseStudy);

  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    initialCaseStudy?.projectId ?? "",
  );
  const [title, setTitle] = useState(initialCaseStudy?.title ?? "");
  const [projectType, setProjectType] = useState<ConstructionProjectType>(
    initialCaseStudy?.projectType ?? "residential",
  );
  const [completionYear, setCompletionYear] = useState<number>(
    initialCaseStudy?.completionYear ?? new Date().getFullYear(),
  );
  const [coverImageUrl, setCoverImageUrl] = useState<string>(
    initialCaseStudy?.coverImageUrl ?? "",
  );
  const [clientBrief, setClientBrief] = useState(
    initialCaseStudy?.clientBrief ?? "",
  );
  const [designResponse, setDesignResponse] = useState(
    initialCaseStudy?.designResponse ?? "",
  );
  const [scopeOfServices, setScopeOfServices] = useState(
    initialCaseStudy?.scopeOfServices ?? "",
  );
  const [projectOutcome, setProjectOutcome] = useState(
    initialCaseStudy?.projectOutcome ?? "",
  );
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const createdBlobUrlsRef = useRef<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);

  const handleClose = useCallback(() => {
    createdBlobUrlsRef.current.forEach((url) => {
      URL.revokeObjectURL(url);
    });
    createdBlobUrlsRef.current = [];
    onClose();
  }, [onClose]);

  // Close on Escape key and autofocus title input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    const timer = setTimeout(() => {
      titleInputRef.current?.focus();
    }, 50);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      clearTimeout(timer);
    };
  }, [handleClose]);

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      createdBlobUrlsRef.current.forEach((url) => {
        URL.revokeObjectURL(url);
      });
    };
  }, []);

  // When project dropdown changes, auto-fill relevant fields
  const handleProjectSelect = (projectId: string) => {
    setSelectedProjectId(projectId);
    setError(null);

    if (!projectId) return;

    const matched = availableProjects.find((p) => p.id === projectId);
    if (!matched) return;

    if (!title || title.trim() === "") {
      setTitle(`${matched.title} — Architectural Narrative`);
    }
    if (matched.projectType) {
      setProjectType(matched.projectType);
    }
    if (matched.completionYear) {
      setCompletionYear(matched.completionYear);
    }
    if (matched.coverImage && !coverImageUrl) {
      setCoverImageUrl(matched.coverImage);
    }
    if (matched.description && !clientBrief) {
      setClientBrief(matched.description);
    }
  };

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file (PNG, JPG, or WEBP).");
      return;
    }
    setError(null);
    const url = URL.createObjectURL(file);
    createdBlobUrlsRef.current.push(url);
    setCoverImageUrl(url);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setError("Please enter a case study title.");
      titleInputRef.current?.focus();
      return;
    }

    if (!coverImageUrl) {
      setError("Please upload or select a cover image for this case study.");
      return;
    }

    const yearNum = Number(completionYear) || new Date().getFullYear();

    const savedCaseStudy: PortfolioCaseStudy = {
      id: initialCaseStudy ? initialCaseStudy.id : `case-study-${Date.now()}`,
      projectId:
        selectedProjectId || (initialCaseStudy?.projectId ?? `project-${Date.now()}`),
      projectType,
      title: title.trim(),
      coverImageUrl,
      clientBrief: clientBrief.trim(),
      designResponse: designResponse.trim(),
      scopeOfServices: scopeOfServices.trim(),
      projectOutcome: projectOutcome.trim(),
      completionYear: yearNum,
    };

    onAddCaseStudy(savedCaseStudy);
    handleClose();
  };

  const linkedProject = availableProjects.find((p) => p.id === selectedProjectId);
  const projectGallery = linkedProject?.gallery ?? [];

  return (
    <div
      className={styles.modalOverlay}
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="case-study-modal-title"
    >
      <div
        className={styles.modalDialog}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={styles.modalHeader}>
          <div className={styles.headerLeft}>
            <div className={styles.iconBadge}>
              {isEditing ? <Pencil size={20} /> : <BookOpen size={20} />}
            </div>
            <div>
              <h2 id="case-study-modal-title" className={styles.modalTitle}>
                {isEditing ? "Edit Case Study" : "Add Case Study"}
              </h2>
              <p className={styles.modalSubtitle}>
                {isEditing
                  ? "Update the architectural narrative and details for this case study"
                  : "Present an architectural narrative of your project's brief, response, and outcome"}
              </p>
            </div>
          </div>
          <button
            type="button"
            className={styles.closeButton}
            onClick={handleClose}
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className={styles.modalForm}>
          <div className={styles.modalScrollBody}>
            {error && (
              <div className={styles.errorBanner} role="alert">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            {/* Associate Project (Optional) */}
            <div className={styles.formGroup}>
              <label htmlFor="case-study-project" className={styles.fieldLabel}>
                Associated Project
              </label>
              <select
                id="case-study-project"
                className={styles.selectInput}
                value={selectedProjectId}
                onChange={(e) => handleProjectSelect(e.target.value)}
              >
                <option value="">-- Standalone Case Study (No linked project) --</option>
                {availableProjects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.title}
                  </option>
                ))}
              </select>
              <span className={styles.fieldHint}>
                Linking a project auto-fills details and allows visitors to view the full project gallery.
              </span>
            </div>

            {/* Title */}
            <div className={styles.formGroup}>
              <label htmlFor="case-study-title" className={styles.fieldLabel}>
                Case Study Title <span className={styles.requiredStar}>*</span>
              </label>
              <input
                ref={titleInputRef}
                id="case-study-title"
                type="text"
                className={styles.textInput}
                placeholder="e.g. A Climate-Responsive Courtyard Home For A Growing Family"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (error) setError(null);
                }}
              />
            </div>

            {/* Category & Year in Grid */}
            <div className={styles.formGrid2}>
              <div className={styles.formGroup}>
                <label htmlFor="case-study-category" className={styles.fieldLabel}>
                  Project Category
                </label>
                <select
                  id="case-study-category"
                  className={styles.selectInput}
                  value={projectType}
                  onChange={(e) =>
                    setProjectType(e.target.value as ConstructionProjectType)
                  }
                >
                  {CATEGORY_OPTIONS.map((cat) => (
                    <option key={cat.type} value={cat.type}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="case-study-year" className={styles.fieldLabel}>
                  Completion Year
                </label>
                <input
                  id="case-study-year"
                  type="number"
                  min={1990}
                  max={2100}
                  className={styles.textInput}
                  value={completionYear}
                  onChange={(e) => setCompletionYear(Number(e.target.value))}
                />
              </div>
            </div>

            {/* Cover Image Upload / Selection */}
            <div className={styles.formGroup}>
              <label className={styles.fieldLabel}>
                Cover Image <span className={styles.requiredStar}>*</span>
              </label>

              {coverImageUrl ? (
                <div className={styles.coverPreviewWrapper}>
                  <Image
                    src={coverImageUrl}
                    alt="Case study cover preview"
                    fill
                    unoptimized={coverImageUrl.startsWith("blob:") || coverImageUrl.startsWith("data:")}
                    className={styles.coverImage}
                  />
                  <div className={styles.coverOverlayActions}>
                    <button
                      type="button"
                      className={styles.coverActionBtn}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Camera size={13} />
                      <span>Change</span>
                    </button>
                    <button
                      type="button"
                      className={`${styles.coverActionBtn} ${styles.coverRemoveBtn}`}
                      onClick={() => setCoverImageUrl("")}
                      aria-label="Remove cover image"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  className={`${styles.dropzone} ${
                    isDragging ? styles.dropzoneActive : ""
                  }`}
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      fileInputRef.current?.click();
                    }
                  }}
                >
                  <div className={styles.uploadIconWrap}>
                    <UploadCloud size={24} />
                  </div>
                  <p className={styles.dropzoneTitle}>
                    Click or drag &amp; drop cover photo here
                  </p>
                  <p className={styles.dropzoneSub}>
                    High-resolution landscape photo recommended (PNG, JPG, WEBP)
                  </p>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/jpg"
                className={styles.visuallyHiddenInput}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFile(file);
                  e.target.value = "";
                }}
              />

              {/* Quick image picker from linked project */}
              {linkedProject && (linkedProject.coverImage || projectGallery.length > 0) && (
                <div className={styles.quickPickerContainer}>
                  <span className={styles.quickPickerLabel}>
                    Or choose an image from {linkedProject.title}:
                  </span>
                  <div className={styles.quickPickerRow}>
                    {linkedProject.coverImage && (
                      <button
                        type="button"
                        className={`${styles.quickThumbBtn} ${
                          coverImageUrl === linkedProject.coverImage
                            ? styles.quickThumbBtnSelected
                            : ""
                        }`}
                        onClick={() => setCoverImageUrl(linkedProject.coverImage)}
                        title="Project Cover"
                      >
                        <Image
                          src={linkedProject.coverImage}
                          alt="Project Cover"
                          fill
                          className={styles.quickThumbImage}
                          sizes="54px"
                        />
                      </button>
                    )}
                    {projectGallery.map((img, i) => (
                      <button
                        key={img + i}
                        type="button"
                        className={`${styles.quickThumbBtn} ${
                          coverImageUrl === img ? styles.quickThumbBtnSelected : ""
                        }`}
                        onClick={() => setCoverImageUrl(img)}
                        title={`Gallery image ${i + 1}`}
                      >
                        <Image
                          src={img}
                          alt=""
                          fill
                          className={styles.quickThumbImage}
                          sizes="54px"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className={styles.sectionDivider} />
            <h3 className={styles.sectionHeading}>Architectural Narrative</h3>

            {/* Client Brief */}
            <div className={styles.formGroup}>
              <label htmlFor="case-study-brief" className={styles.fieldLabel}>
                Client Brief
              </label>
              <textarea
                id="case-study-brief"
                rows={3}
                className={styles.textareaInput}
                placeholder="What were the client's requirements, lifestyle needs, or site constraints?"
                value={clientBrief}
                onChange={(e) => setClientBrief(e.target.value)}
              />
            </div>

            {/* Design Response */}
            <div className={styles.formGroup}>
              <label htmlFor="case-study-response" className={styles.fieldLabel}>
                Design Response
              </label>
              <textarea
                id="case-study-response"
                rows={3}
                className={styles.textareaInput}
                placeholder="How did the architectural scheme solve the brief? (e.g. courtyard orientation, light wells, thermal mass)"
                value={designResponse}
                onChange={(e) => setDesignResponse(e.target.value)}
              />
            </div>

            {/* Scope of Services */}
            <div className={styles.formGroup}>
              <label htmlFor="case-study-scope" className={styles.fieldLabel}>
                Scope of Services
              </label>
              <textarea
                id="case-study-scope"
                rows={2}
                className={styles.textareaInput}
                placeholder="e.g. Architecture, interior planning, working drawings and project coordination"
                value={scopeOfServices}
                onChange={(e) => setScopeOfServices(e.target.value)}
              />
            </div>

            {/* Project Outcome */}
            <div className={styles.formGroup}>
              <label htmlFor="case-study-outcome" className={styles.fieldLabel}>
                Project Outcome
              </label>
              <textarea
                id="case-study-outcome"
                rows={2}
                className={styles.textareaInput}
                placeholder="e.g. A calm, naturally ventilated residence with 35% lower cooling demand and connected family spaces"
                value={projectOutcome}
                onChange={(e) => setProjectOutcome(e.target.value)}
              />
            </div>
          </div>

          {/* Footer */}
          <div className={styles.modalFooter}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={handleClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.submitButton}
            >
              {isEditing ? <Check size={16} /> : <Plus size={16} />}
              <span>{isEditing ? "Save Changes" : "Create Case Study"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function AddCaseStudyModal({
  isOpen,
  initialCaseStudy,
  onClose,
  onAddCaseStudy,
  availableProjects = [],
}: AddCaseStudyModalProps) {
  if (!isOpen) return null;

  return (
    <CaseStudyFormDialog
      key={initialCaseStudy?.id ?? "new-case-study"}
      initialCaseStudy={initialCaseStudy}
      onClose={onClose}
      onAddCaseStudy={onAddCaseStudy}
      availableProjects={availableProjects}
    />
  );
}
