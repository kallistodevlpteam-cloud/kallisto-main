"use client";

import React, { useState, useEffect } from "react";
import {
  AlertCircle,
  Building2,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  Compass,
  MapPin,
  Pencil,
  Plus,
  RotateCcw,
  Sparkles,
  Trash2,
  User,
  X,
} from "lucide-react";
import type {
  ConstructionProjectType,
  ConstructionProjectStatus,
  PortfolioProject,
} from "@/features/portfolio/types/portfolio.types";
import styles from "./portfolio-project-overview.module.css";

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

const STATUS_OPTIONS: { status: ConstructionProjectStatus; label: string }[] = [
  { status: "completed", label: "Completed" },
  { status: "ongoing", label: "In Progress / Ongoing" },
  { status: "design_development", label: "Design Development" },
  { status: "concept", label: "Concept & Scheme" },
  { status: "approval", label: "Statutory Approval" },
  { status: "tender", label: "Tender Stage" },
  { status: "draft", label: "Draft" },
];

const DEFAULT_HIGHLIGHTS = [
  "Central landscaped courtyard",
  "Passive cross ventilation",
  "Deep shaded openings",
  "Locally sourced materials",
  "Integrated interior planning",
  "Natural daylight optimization",
];

export interface EditProjectModalProps {
  isOpen: boolean;
  project: PortfolioProject;
  onClose: () => void;
  onSave: (updatedProject: Partial<PortfolioProject>) => void;
}

type EditTab = "general" | "editorial" | "highlights" | "location";

function EditProjectDialog({
  project,
  onClose,
  onSave,
}: Omit<EditProjectModalProps, "isOpen">) {
  const [activeTab, setActiveTab] = useState<EditTab>("general");

  // General & Specs state
  const [title, setTitle] = useState(project.title);
  const [projectType, setProjectType] = useState<ConstructionProjectType>(project.projectType);
  const [status, setStatus] = useState<ConstructionProjectStatus>(project.status);
  const [completionYear, setCompletionYear] = useState<number>(
    project.completionYear || new Date().getFullYear()
  );
  const [clientName, setClientName] = useState(
    project.clientFeedback?.clientName || ""
  );
  const [builtUpArea, setBuiltUpArea] = useState<string>(
    project.builtUpArea?.value ? String(project.builtUpArea.value) : "3200"
  );
  const [siteArea, setSiteArea] = useState<string>(
    project.siteArea?.value ? String(project.siteArea.value) : "8.5"
  );
  const [bedrooms, setBedrooms] = useState<string>(project.bedrooms || "4 BHK");
  const [floors, setFloors] = useState<string>(project.floors || "2 Floors");
  const [description, setDescription] = useState(project.description || "");

  // Editorial Overview state
  const [vision, setVision] = useState(
    project.editorialSummary?.vision ||
      `${project.title} was envisioned as a responsive architectural sanctuary that balances privacy, natural light and spatial flow for multi-generational living.`
  );
  const [approach, setApproach] = useState(
    project.editorialSummary?.approach ||
      `The design balances climate-responsive passive principles with locally sourced materials suited to tropical conditions.`
  );
  const [context, setContext] = useState(
    project.editorialSummary?.context ||
      `Located in ${project.location.city}, ${project.location.state}, the project respects site boundaries while integrating indoor and outdoor living through central courtyards.`
  );

  // Design Highlights state
  const [highlights, setHighlights] = useState<string[]>(
    project.designHighlights && project.designHighlights.length > 0
      ? [...project.designHighlights]
      : DEFAULT_HIGHLIGHTS
  );
  const [newHighlightInput, setNewHighlightInput] = useState("");

  // Location & Climate state
  const [city, setCity] = useState(project.location.city || "");
  const [state, setState] = useState(project.location.state || "");
  const [district, setDistrict] = useState(project.location.district || "Ernakulam");
  const [country, setCountry] = useState(project.location.country || "India");
  const [bioClimaticZone, setBioClimaticZone] = useState(
    project.location.bioClimaticZone ||
      "Tropical Coastal Zone · Warm-Humid with Southwest & Northeast Monsoon cycles."
  );
  const [coordinates, setCoordinates] = useState(
    project.location.coordinates ||
      "Latitude 9.9312° N · Longitude 76.2673° E"
  );

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleAddHighlight = () => {
    const trimmed = newHighlightInput.trim();
    if (!trimmed) return;
    setHighlights((prev) => [...prev, trimmed]);
    setNewHighlightInput("");
  };

  const handleUpdateHighlight = (index: number, val: string) => {
    setHighlights((prev) => {
      const next = [...prev];
      next[index] = val;
      return next;
    });
  };

  const handleRemoveHighlight = (index: number) => {
    setHighlights((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRestoreDefaults = () => {
    setHighlights(DEFAULT_HIGHLIGHTS);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Project title is required.");
      setActiveTab("general");
      return;
    }

    onSave({
      title: title.trim(),
      projectType,
      status,
      completionYear: Number(completionYear) || undefined,
      location: {
        ...project.location,
        city: city.trim(),
        state: state.trim(),
        district: district.trim(),
        country: country.trim(),
        bioClimaticZone: bioClimaticZone.trim(),
        coordinates: coordinates.trim(),
      },
      editorialSummary: {
        vision: vision.trim(),
        approach: approach.trim(),
        context: context.trim(),
      },
      designHighlights: highlights.map((h) => h.trim()).filter(Boolean),
      clientFeedback: project.clientFeedback
        ? {
            ...project.clientFeedback,
            clientName: clientName.trim() || project.clientFeedback.clientName,
          }
        : clientName.trim()
          ? {
              clientName: clientName.trim(),
              quote: "",
              rating: 5,
              projectContext: "",
            }
          : undefined,
      builtUpArea: {
        value: Number(builtUpArea) || 0,
        unit: project.builtUpArea?.unit || "sq_ft",
      },
      siteArea: {
        value: Number(siteArea) || 0,
        unit: project.siteArea?.unit || "cent",
      },
      bedrooms: bedrooms.trim(),
      floors: floors.trim(),
      description: description.trim(),
    });

    onClose();
  };

  return (
    <div
      className={styles.editModalOverlay}
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-project-dialog-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={styles.editModalDialog}>
        {/* Header */}
        <div className={styles.editModalHeader}>
          <div className={styles.editModalTitleGroup}>
            <div className={styles.editModalIconBadge}>
              <Pencil size={18} aria-hidden="true" />
            </div>
            <div>
              <h2 id="edit-project-dialog-title" className={styles.editModalTitle}>
                Edit Project Details
              </h2>
              <p className={styles.editModalSubtitle}>
                Update project specifications, editorial overview, highlights, and bio-climatic zone
              </p>
            </div>
          </div>
          <button
            type="button"
            className={styles.editModalCloseBtn}
            onClick={onClose}
            aria-label="Close edit project modal"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className={styles.modalTabBar} role="tablist" aria-label="Edit project sections">
          <button
            type="button"
            role="tab"
            id="tab-general"
            aria-selected={activeTab === "general"}
            aria-controls="panel-general"
            className={`${styles.modalTabBtn} ${activeTab === "general" ? styles.modalTabBtnActive : ""}`}
            onClick={() => setActiveTab("general")}
          >
            <Building2 size={14} aria-hidden="true" />
            <span>General & Specs</span>
          </button>

          <button
            type="button"
            role="tab"
            id="tab-editorial"
            aria-selected={activeTab === "editorial"}
            aria-controls="panel-editorial"
            className={`${styles.modalTabBtn} ${activeTab === "editorial" ? styles.modalTabBtnActive : ""}`}
            onClick={() => setActiveTab("editorial")}
          >
            <Sparkles size={14} aria-hidden="true" />
            <span>Editorial Overview</span>
          </button>

          <button
            type="button"
            role="tab"
            id="tab-highlights"
            aria-selected={activeTab === "highlights"}
            aria-controls="panel-highlights"
            className={`${styles.modalTabBtn} ${activeTab === "highlights" ? styles.modalTabBtnActive : ""}`}
            onClick={() => setActiveTab("highlights")}
          >
            <CheckCircle2 size={14} aria-hidden="true" />
            <span>Design Highlights</span>
            <span className={styles.modalTabBadge}>{highlights.length}</span>
          </button>

          <button
            type="button"
            role="tab"
            id="tab-location"
            aria-selected={activeTab === "location"}
            aria-controls="panel-location"
            className={`${styles.modalTabBtn} ${activeTab === "location" ? styles.modalTabBtnActive : ""}`}
            onClick={() => setActiveTab("location")}
          >
            <MapPin size={14} aria-hidden="true" />
            <span>Location & Climate</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className={styles.editModalForm}>
          <div className={styles.editModalScrollableBody}>
            {error && (
              <div className={styles.editModalAlert} role="alert">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            {/* TAB 1: General & Specs */}
            {activeTab === "general" && (
              <div
                id="panel-general"
                role="tabpanel"
                aria-labelledby="tab-general"
                style={{ display: "flex", flexDirection: "column", gap: 16 }}
              >
                {/* Title */}
                <div className={styles.editFormField}>
                  <label htmlFor="edit-project-title" className={styles.editFormLabel}>
                    Project Title <span className={styles.requiredAsterisk}>*</span>
                  </label>
                  <input
                    id="edit-project-title"
                    type="text"
                    className={styles.editFormInput}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Nila Residence"
                    required
                  />
                </div>

                {/* Row: Category & Status */}
                <div className={styles.editFormRow}>
                  <div className={styles.editFormField}>
                    <label htmlFor="edit-project-type" className={styles.editFormLabel}>
                      <Building2 size={13} aria-hidden="true" />
                      <span>Category</span>
                    </label>
                    <div className={styles.selectWrapper}>
                      <select
                        id="edit-project-type"
                        className={styles.editFormSelect}
                        value={projectType}
                        onChange={(e) => setProjectType(e.target.value as ConstructionProjectType)}
                      >
                        {CATEGORY_OPTIONS.map((cat) => (
                          <option key={cat.type} value={cat.type}>
                            {cat.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown size={15} className={styles.selectChevron} aria-hidden="true" />
                    </div>
                  </div>

                  <div className={styles.editFormField}>
                    <label htmlFor="edit-project-status" className={styles.editFormLabel}>
                      <Sparkles size={13} aria-hidden="true" />
                      <span>Project Status</span>
                    </label>
                    <div className={styles.selectWrapper}>
                      <select
                        id="edit-project-status"
                        className={styles.editFormSelect}
                        value={status}
                        onChange={(e) => setStatus(e.target.value as ConstructionProjectStatus)}
                      >
                        {STATUS_OPTIONS.map((st) => (
                          <option key={st.status} value={st.status}>
                            {st.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown size={15} className={styles.selectChevron} aria-hidden="true" />
                    </div>
                  </div>
                </div>

                {/* Row: Client Name & Completion Year */}
                <div className={styles.editFormRow}>
                  <div className={styles.editFormField}>
                    <label htmlFor="edit-client-name" className={styles.editFormLabel}>
                      <User size={13} aria-hidden="true" />
                      <span>Client Name</span>
                    </label>
                    <input
                      id="edit-client-name"
                      type="text"
                      className={styles.editFormInput}
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="e.g. Anitha & Rajesh Menon"
                    />
                  </div>

                  <div className={styles.editFormField}>
                    <label htmlFor="edit-project-year" className={styles.editFormLabel}>
                      <Calendar size={13} aria-hidden="true" />
                      <span>Year</span>
                    </label>
                    <input
                      id="edit-project-year"
                      type="number"
                      className={styles.editFormInput}
                      value={completionYear}
                      onChange={(e) => setCompletionYear(Number(e.target.value))}
                      min={1990}
                      max={2040}
                    />
                  </div>
                </div>

                {/* Specifications Grid */}
                <div className={styles.editFormSpecsGroup}>
                  <div className={styles.editFormField}>
                    <label htmlFor="edit-built-up-area" className={styles.editFormLabel}>
                      Built-up Area (sq.ft)
                    </label>
                    <input
                      id="edit-built-up-area"
                      type="text"
                      className={styles.editFormInput}
                      value={builtUpArea}
                      onChange={(e) => setBuiltUpArea(e.target.value)}
                      placeholder="3,200"
                    />
                  </div>

                  <div className={styles.editFormField}>
                    <label htmlFor="edit-site-area" className={styles.editFormLabel}>
                      Site Area (cents)
                    </label>
                    <input
                      id="edit-site-area"
                      type="text"
                      className={styles.editFormInput}
                      value={siteArea}
                      onChange={(e) => setSiteArea(e.target.value)}
                      placeholder="8.5"
                    />
                  </div>

                  <div className={styles.editFormField}>
                    <label htmlFor="edit-bedrooms" className={styles.editFormLabel}>
                      Bedrooms
                    </label>
                    <input
                      id="edit-bedrooms"
                      type="text"
                      className={styles.editFormInput}
                      value={bedrooms}
                      onChange={(e) => setBedrooms(e.target.value)}
                      placeholder="4 BHK"
                    />
                  </div>

                  <div className={styles.editFormField}>
                    <label htmlFor="edit-floors" className={styles.editFormLabel}>
                      Floors
                    </label>
                    <input
                      id="edit-floors"
                      type="text"
                      className={styles.editFormInput}
                      value={floors}
                      onChange={(e) => setFloors(e.target.value)}
                      placeholder="2 Floors"
                    />
                  </div>
                </div>

                {/* Description */}
                <div className={styles.editFormField}>
                  <label htmlFor="edit-project-desc" className={styles.editFormLabel}>
                    Project Summary / Overview
                  </label>
                  <textarea
                    id="edit-project-desc"
                    className={styles.editFormTextarea}
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Briefly describe key architectural features and space planning..."
                  />
                </div>
              </div>
            )}

            {/* TAB 2: Editorial Overview */}
            {activeTab === "editorial" && (
              <div
                id="panel-editorial"
                role="tabpanel"
                aria-labelledby="tab-editorial"
                style={{ display: "flex", flexDirection: "column", gap: 16 }}
              >
                <div className={styles.editSectionIntro}>
                  <Sparkles size={16} className={styles.editSectionIntroIcon} aria-hidden="true" />
                  <span>
                    Curate the architectural narrative, design philosophy, and context narrative displayed on the project page.
                  </span>
                </div>

                {/* Vision */}
                <div className={styles.editFormField}>
                  <label htmlFor="edit-project-vision" className={styles.editFormLabel}>
                    Project Vision
                  </label>
                  <textarea
                    id="edit-project-vision"
                    className={styles.editFormTextarea}
                    rows={3}
                    value={vision}
                    onChange={(e) => setVision(e.target.value)}
                    placeholder="Envisioned as a responsive architectural sanctuary that balances privacy, natural light and spatial flow..."
                  />
                </div>

                {/* Design Approach */}
                <div className={styles.editFormField}>
                  <label htmlFor="edit-project-approach" className={styles.editFormLabel}>
                    Design Approach
                  </label>
                  <textarea
                    id="edit-project-approach"
                    className={styles.editFormTextarea}
                    rows={3}
                    value={approach}
                    onChange={(e) => setApproach(e.target.value)}
                    placeholder="The design balances climate-responsive passive principles with locally sourced materials..."
                  />
                </div>

                {/* Project Context */}
                <div className={styles.editFormField}>
                  <label htmlFor="edit-project-context" className={styles.editFormLabel}>
                    Project Context
                  </label>
                  <textarea
                    id="edit-project-context"
                    className={styles.editFormTextarea}
                    rows={3}
                    value={context}
                    onChange={(e) => setContext(e.target.value)}
                    placeholder="Located in Kochi, Kerala, the project respects site boundaries while integrating indoor and outdoor living..."
                  />
                </div>
              </div>
            )}

            {/* TAB 3: Design Highlights */}
            {activeTab === "highlights" && (
              <div
                id="panel-highlights"
                role="tabpanel"
                aria-labelledby="tab-highlights"
                style={{ display: "flex", flexDirection: "column", gap: 16 }}
              >
                <div className={styles.editSectionIntro}>
                  <CheckCircle2 size={16} className={styles.editSectionIntroIcon} aria-hidden="true" />
                  <span>
                    Manage architectural highlights and climate-responsive design solutions featured in the Highlights grid.
                  </span>
                </div>

                {/* Highlights List */}
                <div className={styles.highlightsEditList}>
                  {highlights.map((hl, idx) => (
                    <div key={idx} className={styles.highlightEditItem}>
                      <span className={styles.highlightItemIndex}>{idx + 1}.</span>
                      <input
                        type="text"
                        value={hl}
                        onChange={(e) => handleUpdateHighlight(idx, e.target.value)}
                        className={styles.highlightItemInput}
                        placeholder="Feature name..."
                        aria-label={`Highlight ${idx + 1}`}
                      />
                      <button
                        type="button"
                        className={styles.highlightRemoveBtn}
                        onClick={() => handleRemoveHighlight(idx)}
                        aria-label={`Remove highlight ${idx + 1}`}
                      >
                        <Trash2 size={14} aria-hidden="true" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add new highlight */}
                <div className={styles.highlightAddRow}>
                  <input
                    type="text"
                    value={newHighlightInput}
                    onChange={(e) => setNewHighlightInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddHighlight();
                      }
                    }}
                    placeholder="Add architectural feature (e.g. Central landscaped courtyard)..."
                    className={styles.highlightAddInput}
                  />
                  <button
                    type="button"
                    className={styles.highlightAddBtn}
                    onClick={handleAddHighlight}
                  >
                    <Plus size={14} aria-hidden="true" />
                    <span>Add</span>
                  </button>
                </div>

                {highlights.length < DEFAULT_HIGHLIGHTS.length && (
                  <button
                    type="button"
                    className={styles.restoreDefaultsBtn}
                    onClick={handleRestoreDefaults}
                  >
                    <RotateCcw size={12} style={{ display: "inline", marginRight: 4 }} />
                    Reset to default highlights
                  </button>
                )}
              </div>
            )}

            {/* TAB 4: Location & Climate */}
            {activeTab === "location" && (
              <div
                id="panel-location"
                role="tabpanel"
                aria-labelledby="tab-location"
                style={{ display: "flex", flexDirection: "column", gap: 16 }}
              >
                <div className={styles.editSectionIntro}>
                  <Compass size={16} className={styles.editSectionIntroIcon} aria-hidden="true" />
                  <span>
                    Specify geographic location, bio-climatic zoning, and coordinates for environmental orientation.
                  </span>
                </div>

                {/* City & State */}
                <div className={styles.editFormRow}>
                  <div className={styles.editFormField}>
                    <label htmlFor="edit-project-city" className={styles.editFormLabel}>
                      <MapPin size={13} aria-hidden="true" />
                      <span>City</span>
                    </label>
                    <input
                      id="edit-project-city"
                      type="text"
                      className={styles.editFormInput}
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Kochi"
                    />
                  </div>

                  <div className={styles.editFormField}>
                    <label htmlFor="edit-project-state" className={styles.editFormLabel}>
                      <span>State</span>
                    </label>
                    <input
                      id="edit-project-state"
                      type="text"
                      className={styles.editFormInput}
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="e.g. Kerala"
                    />
                  </div>
                </div>

                {/* District & Country */}
                <div className={styles.editFormRow}>
                  <div className={styles.editFormField}>
                    <label htmlFor="edit-project-district" className={styles.editFormLabel}>
                      <span>District</span>
                    </label>
                    <input
                      id="edit-project-district"
                      type="text"
                      className={styles.editFormInput}
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      placeholder="e.g. Ernakulam"
                    />
                  </div>

                  <div className={styles.editFormField}>
                    <label htmlFor="edit-project-country" className={styles.editFormLabel}>
                      <span>Country</span>
                    </label>
                    <input
                      id="edit-project-country"
                      type="text"
                      className={styles.editFormInput}
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      placeholder="e.g. India"
                    />
                  </div>
                </div>

                {/* Bio-Climatic Zone */}
                <div className={styles.editFormField}>
                  <label htmlFor="edit-bioclimatic-zone" className={styles.editFormLabel}>
                    <Compass size={13} aria-hidden="true" />
                    <span>Bio-Climatic Zone</span>
                  </label>
                  <input
                    id="edit-bioclimatic-zone"
                    type="text"
                    className={styles.editFormInput}
                    value={bioClimaticZone}
                    onChange={(e) => setBioClimaticZone(e.target.value)}
                    placeholder="e.g. Tropical Coastal Zone · Warm-Humid with Southwest & Northeast Monsoon cycles."
                  />
                </div>

                {/* Coordinates */}
                <div className={styles.editFormField}>
                  <label htmlFor="edit-project-coordinates" className={styles.editFormLabel}>
                    <span>Map Coordinates</span>
                  </label>
                  <input
                    id="edit-project-coordinates"
                    type="text"
                    className={styles.editFormInput}
                    value={coordinates}
                    onChange={(e) => setCoordinates(e.target.value)}
                    placeholder="e.g. Latitude 9.9312° N · Longitude 76.2673° E"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className={styles.editModalFooter}>
            <button
              type="button"
              className={styles.editModalCancelBtn}
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.editModalSubmitBtn}
            >
              <Check size={16} aria-hidden="true" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function EditProjectModal({
  isOpen,
  project,
  onClose,
  onSave,
}: EditProjectModalProps) {
  if (!isOpen) return null;

  return (
    <EditProjectDialog
      project={project}
      onClose={onClose}
      onSave={onSave}
    />
  );
}
