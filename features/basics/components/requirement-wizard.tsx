"use client";

import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  Building2,
  CalendarClock,
  Check,
  ChevronDown,
  Clock,
  FileCheck,
  FileText,
  FolderKanban,
  Globe,
  Layers,
  Lock,
  MapPin,
  Maximize2,
  Plus,
  Save,
  Search,
  Send,
  Sparkles,
  Upload,
  UserCheck,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { WORKSPACE_CONFIG } from "@/lib/config/workspace-config";
import {
  BASICS_SERVICE_CATALOGUE,
} from "../constants/service-catalogue";
import {
  basicsProviderRepository,
  basicsRequirementRepository,
} from "../repositories/basics-repositories";
import { matchProvidersToRequirement } from "../lib/basics-search-matcher";
import type {
  BasicsProjectContext,
  BasicsProvider,
  BasicsRequirement,
  BasicsServiceCategory,
  CreateRequirementInput,
} from "../types/basics.types";
import styles from "./basics-workspace.module.css";

const STEPS = [
  ["Project", "Bind project context"],
  ["Service", "Choose specialist scope"],
  ["Deliverables", "Define required outputs"],
  ["Details", "Set project information"],
  ["Commercials", "Budget and schedule"],
  ["Publish", "Review and visibility"],
] as const;

const STEP_ICONS = [
  Building2,
  Layers,
  FileCheck,
  FileText,
  CalendarClock,
  Send,
];

const STRUCTURAL_DELIVERABLES = [
  "Structural design",
  "Design calculations",
  "Foundation drawings",
  "Column layout",
  "Beam layout",
  "Slab reinforcement drawings",
  "Staircase details",
  "Bar bending schedule",
  "Site consultation",
  "Revision support",
];

type WizardForm = {
  projectId: string;
  projectName: string;
  category: BasicsServiceCategory;
  specialization: string;
  title: string;
  description: string;
  deliverables: string[];
  projectType: string;
  location: string;
  builtUpArea: string;
  numberOfFloors: string;
  projectStage: string;
  constructionSystem: string;
  siteConditions: string;
  expectedStartDate: string;
  expectedCompletionDate: string;
  engagementMode: BasicsRequirement["engagementMode"];
  budgetMin: string;
  budgetMax: string;
  currency: string;
  closesAt: string;
  visibility: BasicsRequirement["visibility"];
  requestRecommendations: boolean;
  attachments: string[];
};

const INITIAL_FORM: WizardForm = {
  projectId: "",
  projectName: "",
  category: "engineering",
  specialization: "Structural Engineering",
  title: "",
  description: "",
  deliverables: [],
  projectType: "",
  location: "",
  builtUpArea: "",
  numberOfFloors: "",
  projectStage: "",
  constructionSystem: "",
  siteConditions: "",
  expectedStartDate: "",
  expectedCompletionDate: "",
  engagementMode: "request_quote",
  budgetMin: "",
  budgetMax: "",
  currency: WORKSPACE_CONFIG.currency,
  closesAt: "",
  visibility: "public_to_matched_providers",
  requestRecommendations: false,
  attachments: [],
};

export function RequirementWizard({
  projects,
}: {
  projects: BasicsProjectContext[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<WizardForm>(() => {
    const projectId = searchParams.get("projectId") ?? "";
    const selected = projects.find((project) => project.id === projectId);
    return selected
      ? {
          ...INITIAL_FORM,
          projectId: selected.id,
          projectName: selected.name,
          projectType: selected.projectType,
          location: selected.location,
          builtUpArea: selected.builtUpArea ? String(selected.builtUpArea) : "",
          numberOfFloors: selected.numberOfFloors ? String(selected.numberOfFloors) : "",
          projectStage: selected.projectStage,
        }
      : INITIAL_FORM;
  });
  const [customDeliverable, setCustomDeliverable] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitState, setSubmitState] = useState<"idle" | "saving" | "error">("idle");
  const [projectMode, setProjectMode] = useState<"existing" | "standalone">(() => {
    const projectId = searchParams.get("projectId");
    return projectId ? "existing" : "standalone";
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [providers, setProviders] = useState<BasicsProvider[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [matchViewFilter, setMatchViewFilter] = useState<"all" | "saved">("all");

  useEffect(() => {
    void Promise.all([
      basicsProviderRepository.listProviders(),
      basicsProviderRepository.getSavedProviderIds(),
    ]).then(([provs, saved]) => {
      setProviders(provs);
      setSavedIds(saved);
    });
  }, []);

  const matchedProviders = useMemo(() => {
    return matchProvidersToRequirement(
      {
        category: form.category,
        specialization: form.specialization,
        location: form.location,
        projectType: form.projectType,
      },
      providers,
    );
  }, [form.category, form.specialization, form.location, form.projectType, providers]);

  const savedMatchingProviders = useMemo(() => {
    return matchedProviders.filter(({ provider }) => savedIds.includes(provider.id));
  }, [matchedProviders, savedIds]);

  const displayedWizardMatches =
    matchViewFilter === "saved" ? savedMatchingProviders : matchedProviders;

  const selectedProject = useMemo(
    () => projects.find((project) => project.id === form.projectId),
    [projects, form.projectId],
  );

  const editId = searchParams.get("edit");
  const invitedProviderId = searchParams.get("providerId");

  useEffect(() => {
    if (!editId) return;
    let cancelled = false;
    void basicsRequirementRepository.getRequirement(editId).then((requirement) => {
      if (cancelled || !requirement) return;
      if (requirement.projectId) {
        setProjectMode("existing");
      }
      setForm({
        projectId: requirement.projectId ?? "",
        projectName: requirement.projectName ?? "",
        category: requirement.category,
        specialization: requirement.specialization,
        title: requirement.title,
        description: requirement.description,
        deliverables: requirement.deliverables,
        projectType: requirement.projectType ?? "",
        location: requirement.location ?? "",
        builtUpArea: requirement.builtUpArea ? String(requirement.builtUpArea) : "",
        numberOfFloors: requirement.numberOfFloors ? String(requirement.numberOfFloors) : "",
        projectStage: requirement.projectStage ?? "",
        constructionSystem: "",
        siteConditions: "",
        expectedStartDate: requirement.expectedStartDate ?? "",
        expectedCompletionDate: requirement.expectedCompletionDate ?? "",
        engagementMode: requirement.engagementMode,
        budgetMin: requirement.budgetMin ? String(requirement.budgetMin) : "",
        budgetMax: requirement.budgetMax ? String(requirement.budgetMax) : "",
        currency: requirement.currency,
        closesAt: requirement.closesAt?.slice(0, 10) ?? "",
        visibility: requirement.visibility,
        requestRecommendations: false,
        attachments: requirement.attachments,
      });
    });
    return () => {
      cancelled = true;
    };
  }, [editId]);

  const serviceOptions = useMemo(
    () =>
      BASICS_SERVICE_CATALOGUE.find((group) => group.id === form.category)
        ?.services ?? [],
    [form.category],
  );

  function update<K extends keyof WizardForm>(key: K, value: WizardForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => {
      const next = { ...current };
      delete next[key];
      return next;
    });
  }

  function selectProject(projectId: string) {
    const selected = projects.find((project) => project.id === projectId);
    if (!selected) {
      setForm((current) => ({
        ...current,
        projectId: "",
        projectName: "",
        projectType: "",
        location: "",
        builtUpArea: "",
        numberOfFloors: "",
        projectStage: "",
      }));
      return;
    }
    setForm((current) => ({
      ...current,
      projectId: selected.id,
      projectName: selected.name,
      projectType: selected.projectType,
      location: selected.location,
      builtUpArea: selected.builtUpArea ? String(selected.builtUpArea) : "",
      numberOfFloors: selected.numberOfFloors ? String(selected.numberOfFloors) : "",
      projectStage: selected.projectStage,
    }));
  }

  function validateStep(targetStep: number): boolean {
    const nextErrors: Record<string, string> = {};
    if (targetStep === 2 && !form.specialization) {
      nextErrors.specialization = "Choose a required service.";
    }
    if (targetStep === 3 && form.deliverables.length === 0) {
      nextErrors.deliverables = "Select at least one deliverable.";
    }
    if (targetStep === 4) {
      if (!form.title.trim()) nextErrors.title = "Enter a requirement title.";
      if (!form.description.trim()) nextErrors.description = "Describe the specialist scope.";
      if (!form.location.trim()) nextErrors.location = "Enter the project or service location.";
    }
    if (targetStep === 5) {
      if (!form.expectedStartDate) nextErrors.expectedStartDate = "Set an expected start date.";
      if (!form.closesAt) nextErrors.closesAt = "Set a proposal deadline.";
      if (
        form.budgetMin &&
        form.budgetMax &&
        Number(form.budgetMin) > Number(form.budgetMax)
      ) {
        nextErrors.budgetMax = "Maximum budget must be greater than the minimum.";
      }
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function goNext() {
    if (!validateStep(step)) return;
    setStep((current) => Math.min(6, current + 1));
  }

  function toInput(status: "draft" | "open"): CreateRequirementInput {
    return {
      projectId: form.projectId || undefined,
      projectName: form.projectName || undefined,
      title:
        form.title.trim() ||
        `${form.specialization} for ${form.projectName || "professional service requirement"}`,
      category: form.category,
      specialization: form.specialization,
      description:
        form.description.trim() ||
        "Draft specialist scope. Complete project details before publishing.",
      deliverables: form.deliverables,
      projectType: form.projectType || undefined,
      location: form.location || undefined,
      builtUpArea: form.builtUpArea ? Number(form.builtUpArea) : undefined,
      numberOfFloors: form.numberOfFloors ? Number(form.numberOfFloors) : undefined,
      projectStage: form.projectStage || undefined,
      engagementMode: form.engagementMode,
      budgetMin: form.budgetMin ? Number(form.budgetMin) : undefined,
      budgetMax: form.budgetMax ? Number(form.budgetMax) : undefined,
      currency: form.currency,
      expectedStartDate: form.expectedStartDate || undefined,
      expectedCompletionDate: form.expectedCompletionDate || undefined,
      visibility: form.visibility,
      status,
      ownerId: "user-current",
      invitedProviderIds: invitedProviderId ? [invitedProviderId] : [],
      attachments: form.attachments,
      closesAt: form.closesAt ? `${form.closesAt}T17:30:00.000Z` : undefined,
    };
  }

  async function save(status: "draft" | "open") {
    if (status === "open" && ![2, 3, 4, 5].every(validateStep)) {
      setStep(2);
      return;
    }
    setSubmitState("saving");
    try {
      const input = toInput(
        form.visibility === "private" ? "draft" : status,
      );
      const requirement = editId
        ? await basicsRequirementRepository.updateRequirement(editId, input)
        : await basicsRequirementRepository.createRequirement(input);
      router.push(
        `/basics/requirements/${requirement.id}?saved=${status}${
          status === "open" ? "&findMatches=true" : ""
        }`,
      );
    } catch {
      setSubmitState("error");
    }
  }

  async function findMatchingProfiles(targetSaved = false) {
    setSubmitState("saving");
    try {
      const input = toInput("draft");
      const requirement = editId
        ? await basicsRequirementRepository.updateRequirement(editId, input)
        : await basicsRequirementRepository.createRequirement(input);
      const params = new URLSearchParams();
      params.set("requirementId", requirement.id);
      if (form.category) params.set("category", form.category);
      if (form.location) {
        const primaryCity = form.location.split(",")[0].trim();
        if (primaryCity) params.set("city", primaryCity);
      }
      if (targetSaved) params.set("saved", "true");
      router.push(`/basics/experts?${params.toString()}`);
    } catch {
      setSubmitState("error");
    }
  }

  return (
    <div className={styles.wizardShell}>
      <nav className={styles.wizardSteps} aria-label="Requirement steps">
        {STEPS.map(([label, description], index) => {
          const number = index + 1;
          const StepIcon = STEP_ICONS[index];
          return (
            <button
              type="button"
              key={label}
              className={`${styles.wizardStepButton} ${
                number === step ? styles.wizardStepButtonActive : ""
              }`}
              aria-current={number === step ? "step" : undefined}
              onClick={() => {
                if (number <= step || validateStep(step)) setStep(number);
              }}
            >
              <span className={styles.stepNumber}>
                {number < step ? (
                  <Check size={11} strokeWidth={2.5} aria-hidden="true" />
                ) : (
                  <StepIcon size={12} strokeWidth={2} aria-hidden="true" />
                )}
              </span>
              <span className={styles.wizardStepCopy}>
                <strong>{label}</strong>
                <span>{description}</span>
              </span>
            </button>
          );
        })}
      </nav>

      <section className={`${styles.wizardPanel} ${styles.wizardFormPanel}`}>
        <header className={styles.wizardPanelHeader}>
          <span>Step {step} of 6</span>
          <h2>{STEPS[step - 1][0]}</h2>
          <p>{STEPS[step - 1][1]}</p>
        </header>

        <div className={styles.wizardBody}>
          {step === 1 ? (
          <div className={styles.projectSelectionWrap}>
            {/* Minimal Mode Cards with Icons */}
            <div className={styles.projectModeCardsGrid}>
              {/* Option 1: Existing Project */}
              <div
                className={`${styles.projectModeCard} ${
                  projectMode === "existing" ? styles.projectModeCardActive : ""
                }`}
                onClick={() => {
                  setProjectMode("existing");
                  if (!form.projectId && projects.length > 0) {
                    selectProject(projects[0].id);
                  }
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    setProjectMode("existing");
                    if (!form.projectId && projects.length > 0) {
                      selectProject(projects[0].id);
                    }
                  }
                }}
              >
                <div className={styles.projectModeTop}>
                  <div className={styles.projectModeIconBox}>
                    <Building2 size={18} aria-hidden="true" />
                  </div>
                  <div className={styles.projectModeRadio}>
                    <span
                      className={`${styles.radioIndicator} ${
                        projectMode === "existing" ? styles.radioIndicatorActive : ""
                      }`}
                    />
                  </div>
                </div>
                <div className={styles.projectModeCopy}>
                  <strong>Link to an existing project</strong>
                  <p>
                    Attach this requirement to an active project for coordinated scopes & deliverables.
                  </p>
                </div>
              </div>

              {/* Option 2: Continue without a project */}
              <div
                className={`${styles.projectModeCard} ${
                  projectMode === "standalone" ? styles.projectModeCardActive : ""
                }`}
                onClick={() => {
                  setProjectMode("standalone");
                  selectProject("");
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    setProjectMode("standalone");
                    selectProject("");
                  }
                }}
              >
                <div className={styles.projectModeTop}>
                  <div className={styles.projectModeIconBox} style={{ background: "#f8fafc", color: "#64748b" }}>
                    <Sparkles size={18} aria-hidden="true" />
                  </div>
                  <div className={styles.projectModeRadio}>
                    <span
                      className={`${styles.radioIndicator} ${
                        projectMode === "standalone" ? styles.radioIndicatorActive : ""
                      }`}
                    />
                  </div>
                </div>
                <div className={styles.projectModeCopy}>
                  <strong>Continue without a project</strong>
                  <p>
                    Publish as an independent scope. You can bind it to a project anytime later.
                  </p>
                </div>
              </div>
            </div>

            {/* Dynamic Content based on selected mode */}
            {projectMode === "existing" ? (
              <div className={styles.projectDropdownSection}>
                <div className={styles.projectDropdownHeader}>
                  <label htmlFor="existing-project-dropdown" className={styles.projectDropdownLabel}>
                    <FolderKanban size={14} aria-hidden="true" />
                    <span>Choose Project</span>
                    <span className={styles.projectCountBadge}>{projects.length} available</span>
                  </label>
                  <Link href="/projects?create=true" className={styles.createProjectInlineLink}>
                    <Plus size={13} aria-hidden="true" />
                    <span>Create new project</span>
                  </Link>
                </div>

                <div className={styles.projectDropdownControlWrap}>
                  <Building2 size={16} className={styles.projectDropdownLeadIcon} aria-hidden="true" />
                  <select
                    id="existing-project-dropdown"
                    className={styles.projectDropdownSelect}
                    value={form.projectId}
                    onChange={(e) => selectProject(e.target.value)}
                    aria-label="Select existing project"
                  >
                    <option value="" disabled>
                      Select a project from your workspace...
                    </option>
                    {projects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.name} — {project.projectType} ({project.location})
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={15} className={styles.projectDropdownArrowIcon} aria-hidden="true" />
                </div>

                {/* Minimal preview card when a project is chosen */}
                {selectedProject ? (
                  <div className={styles.selectedProjectSummary}>
                    <div className={styles.selectedProjectHeader}>
                      <div className={styles.selectedProjectTitleGroup}>
                        <Building2 size={16} color="#0284c7" aria-hidden="true" />
                        <h4>{selectedProject.name}</h4>
                        {selectedProject.projectStage ? (
                          <span className={styles.projectStageTag}>{selectedProject.projectStage}</span>
                        ) : null}
                      </div>
                    </div>
                    <div className={styles.selectedProjectMetaGrid}>
                      <div className={styles.selectedProjectMetaItem}>
                        <MapPin size={12} aria-hidden="true" />
                        <span>{selectedProject.location}</span>
                      </div>
                      <div className={styles.selectedProjectMetaItem}>
                        <Layers size={12} aria-hidden="true" />
                        <span>{selectedProject.projectType}</span>
                      </div>
                      {selectedProject.builtUpArea ? (
                        <div className={styles.selectedProjectMetaItem}>
                          <Maximize2 size={12} aria-hidden="true" />
                          <span>{selectedProject.builtUpArea.toLocaleString()} sq ft</span>
                        </div>
                      ) : null}
                      {selectedProject.numberOfFloors ? (
                        <div className={styles.selectedProjectMetaItem}>
                          <Clock size={12} aria-hidden="true" />
                          <span>{selectedProject.numberOfFloors} floors</span>
                        </div>
                      ) : null}
                    </div>
                  </div>
                ) : null}
              </div>
            ) : (
              <div className={styles.standaloneNoticeCard}>
                <Sparkles size={16} color="#64748b" aria-hidden="true" />
                <div>
                  <strong>Independent Requirement Scope</strong>
                  <p>
                    This requirement will be posted without being tied to a specific project. You will define the specialization, technical deliverables, and commercial budget in the upcoming steps.
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : null}

        {step === 2 ? (
          <div className={styles.formGrid}>
            <label className={styles.field}>
              <span>Service category</span>
              <select
                className={styles.select}
                value={form.category}
                onChange={(event) => {
                  const category = event.target.value as BasicsServiceCategory;
                  const firstService =
                    BASICS_SERVICE_CATALOGUE.find((group) => group.id === category)
                      ?.services[0] ?? "";
                  setForm((current) => ({
                    ...current,
                    category,
                    specialization: firstService,
                  }));
                }}
              >
                {BASICS_SERVICE_CATALOGUE.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.label}
                  </option>
                ))}
              </select>
            </label>
            <label className={styles.field}>
              <span>Specialization</span>
              <select
                className={styles.select}
                value={form.specialization}
                aria-invalid={Boolean(errors.specialization)}
                onChange={(event) => update("specialization", event.target.value)}
              >
                {serviceOptions.map((service) => (
                  <option key={service} value={service}>
                    {service}
                  </option>
                ))}
              </select>
              {errors.specialization ? (
                <span className={styles.fieldError}>{errors.specialization}</span>
              ) : null}
            </label>
            <div className={`${styles.notice} ${styles.fieldWide}`}>
              Suggested related services: BIM Coordination, BOQ Preparation and
              Permit Consulting. These remain separate scopes unless selected.
            </div>
          </div>
        ) : null}

        {step === 3 ? (
          <>
            <div className={styles.deliverableChoices}>
              {STRUCTURAL_DELIVERABLES.map((deliverable) => (
                <label className={styles.checkRow} key={deliverable}>
                  <input
                    type="checkbox"
                    checked={form.deliverables.includes(deliverable)}
                    onChange={(event) =>
                      update(
                        "deliverables",
                        event.target.checked
                          ? [...form.deliverables, deliverable]
                          : form.deliverables.filter((item) => item !== deliverable),
                      )
                    }
                  />
                  {deliverable}
                </label>
              ))}
            </div>
            <div className={styles.formGrid}>
              <label className={`${styles.field} ${styles.fieldWide}`}>
                <span>Custom deliverable</span>
                <div className={styles.inlineActions}>
                  <input
                    className={styles.input}
                    value={customDeliverable}
                    placeholder="Add a project-specific output"
                    onChange={(event) => setCustomDeliverable(event.target.value)}
                  />
                  <button
                    type="button"
                    className={styles.secondaryButton}
                    onClick={() => {
                      if (!customDeliverable.trim()) return;
                      update("deliverables", [...form.deliverables, customDeliverable.trim()]);
                      setCustomDeliverable("");
                    }}
                  >
                    <Plus size={13} aria-hidden="true" />
                    Add
                  </button>
                </div>
                {errors.deliverables ? (
                  <span className={styles.fieldError}>{errors.deliverables}</span>
                ) : null}
              </label>
            </div>
          </>
        ) : null}

        {step === 4 ? (
          <div className={styles.formGrid}>
            <label className={`${styles.field} ${styles.fieldWide}`}>
              <span>Requirement title</span>
              <input
                className={styles.input}
                value={form.title}
                aria-invalid={Boolean(errors.title)}
                placeholder={`${form.specialization} for ${form.projectName || "project"}`}
                onChange={(event) => update("title", event.target.value)}
              />
              {errors.title ? <span className={styles.fieldError}>{errors.title}</span> : null}
            </label>
            <label className={styles.field}>
              <span>Project type</span>
              <input className={styles.input} value={form.projectType} onChange={(event) => update("projectType", event.target.value)} />
            </label>
            <label className={styles.field}>
              <span>Location</span>
              <input className={styles.input} value={form.location} aria-invalid={Boolean(errors.location)} onChange={(event) => update("location", event.target.value)} />
              {errors.location ? <span className={styles.fieldError}>{errors.location}</span> : null}
            </label>
            <label className={styles.field}>
              <span>Built-up area (sq ft)</span>
              <input className={styles.input} type="number" min="0" value={form.builtUpArea} onChange={(event) => update("builtUpArea", event.target.value)} />
            </label>
            <label className={styles.field}>
              <span>Number of floors</span>
              <input className={styles.input} type="number" min="0" value={form.numberOfFloors} onChange={(event) => update("numberOfFloors", event.target.value)} />
            </label>
            <label className={styles.field}>
              <span>Construction system</span>
              <input className={styles.input} value={form.constructionSystem} placeholder="RCC framed structure" onChange={(event) => update("constructionSystem", event.target.value)} />
            </label>
            <label className={styles.field}>
              <span>Current project stage</span>
              <input className={styles.input} value={form.projectStage} onChange={(event) => update("projectStage", event.target.value)} />
            </label>
            <label className={`${styles.field} ${styles.fieldWide}`}>
              <span>Description</span>
              <textarea className={styles.textarea} value={form.description} aria-invalid={Boolean(errors.description)} onChange={(event) => update("description", event.target.value)} />
              {errors.description ? <span className={styles.fieldError}>{errors.description}</span> : null}
            </label>
            <label className={`${styles.field} ${styles.fieldWide}`}>
              <span>Site conditions</span>
              <textarea className={styles.textarea} value={form.siteConditions} placeholder="Access, soil, neighbouring structures and known constraints" onChange={(event) => update("siteConditions", event.target.value)} />
            </label>
            <div className={`${styles.field} ${styles.fieldWide}`}>
              <div className={styles.fieldHeaderRow}>
                <span>Attachments</span>
                {form.attachments.length > 0 && (
                  <span className={styles.fileCountBadge}>
                    {form.attachments.length} file{form.attachments.length > 1 ? "s" : ""} selected
                  </span>
                )}
              </div>
              <div
                className={`${styles.dropZone} ${isDragging ? styles.dropZoneActive : ""}`}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  const files = Array.from(e.dataTransfer.files ?? []).map((f) => f.name);
                  if (files.length > 0) {
                    update("attachments", Array.from(new Set([...form.attachments, ...files])));
                  }
                }}
                tabIndex={0}
                role="button"
                aria-label="Upload attachments"
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    fileInputRef.current?.click();
                  }
                }}
              >
                <div className={styles.dropZoneIconWrap}>
                  <Upload size={18} strokeWidth={2} aria-hidden="true" />
                </div>
                <div className={styles.dropZoneText}>
                  <div className={styles.dropZoneTitle}>
                    <span className={styles.dropZoneHighlight}>Click to upload</span> or drag and drop
                  </div>
                  <div className={styles.dropZoneSubtitle}>
                    CAD drawings, BIM models, surveys, specifications, or site photos (PDF, DWG, IFC, JPG)
                  </div>
                </div>
                <button
                  type="button"
                  className={styles.dropZoneBrowseBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                >
                  Browse files
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  className={styles.hiddenFileInput}
                  onChange={(event) => {
                    const files = Array.from(event.target.files ?? []).map((f) => f.name);
                    if (files.length > 0) {
                      update("attachments", Array.from(new Set([...form.attachments, ...files])));
                    }
                    event.target.value = "";
                  }}
                />
              </div>

              {form.attachments.length > 0 && (
                <div className={styles.attachmentChipsList}>
                  {form.attachments.map((fileName, index) => (
                    <div key={`${fileName}-${index}`} className={styles.attachmentChip}>
                      <FileText size={13} className={styles.attachmentChipIcon} aria-hidden="true" />
                      <span className={styles.attachmentChipName} title={fileName}>
                        {fileName}
                      </span>
                      <button
                        type="button"
                        className={styles.attachmentChipRemove}
                        onClick={(e) => {
                          e.stopPropagation();
                          update(
                            "attachments",
                            form.attachments.filter((_, i) => i !== index),
                          );
                        }}
                        aria-label={`Remove attachment ${fileName}`}
                      >
                        <X size={12} aria-hidden="true" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : null}

        {step === 5 ? (
          <div className={styles.formGrid}>
            <label className={styles.field}>
              <span>Engagement model</span>
              <select className={styles.select} value={form.engagementMode} onChange={(event) => update("engagementMode", event.target.value as BasicsRequirement["engagementMode"])}>
                <option value="fixed_fee">Fixed budget</option>
                <option value="request_quote">Request quotation</option>
                <option value="per_area">Rate per area</option>
                <option value="consultation">Consultation only</option>
                <option value="milestone_based">Milestone-based</option>
              </select>
            </label>
            <label className={styles.field}>
              <span>Currency</span>
              <select className={styles.select} value={form.currency} onChange={(event) => update("currency", event.target.value)}>
                {[WORKSPACE_CONFIG.currency, "USD", "AED"].map((currency) => (
                  <option key={currency} value={currency}>{currency}</option>
                ))}
              </select>
            </label>
            <label className={styles.field}>
              <span>Minimum budget</span>
              <input className={styles.input} type="number" min="0" value={form.budgetMin} onChange={(event) => update("budgetMin", event.target.value)} />
            </label>
            <label className={styles.field}>
              <span>Maximum budget</span>
              <input className={styles.input} type="number" min="0" value={form.budgetMax} aria-invalid={Boolean(errors.budgetMax)} onChange={(event) => update("budgetMax", event.target.value)} />
              {errors.budgetMax ? <span className={styles.fieldError}>{errors.budgetMax}</span> : null}
            </label>
            <label className={styles.field}>
              <span>Proposal deadline</span>
              <input className={styles.input} type="date" value={form.closesAt} aria-invalid={Boolean(errors.closesAt)} onChange={(event) => update("closesAt", event.target.value)} />
              {errors.closesAt ? <span className={styles.fieldError}>{errors.closesAt}</span> : null}
            </label>
            <label className={styles.field}>
              <span>Expected provider start</span>
              <input className={styles.input} type="date" value={form.expectedStartDate} aria-invalid={Boolean(errors.expectedStartDate)} onChange={(event) => update("expectedStartDate", event.target.value)} />
              {errors.expectedStartDate ? <span className={styles.fieldError}>{errors.expectedStartDate}</span> : null}
            </label>
            <label className={styles.field}>
              <span>Expected completion</span>
              <input className={styles.input} type="date" value={form.expectedCompletionDate} onChange={(event) => update("expectedCompletionDate", event.target.value)} />
            </label>
          </div>
        ) : null}

        {step === 6 ? (
          <>
            <div className={styles.choiceGrid}>
              {[
                {
                  value: "public_to_matched_providers",
                  label: "Publish to matched providers",
                  description: "Eligible verified specialists can discover this requirement.",
                  icon: Globe,
                  iconClass: styles.choiceIcon_globe,
                },
                {
                  value: "invited_only",
                  label: "Invite selected providers only",
                  description: "Only providers invited from Basics may respond.",
                  icon: UserCheck,
                  iconClass: styles.choiceIcon_invite,
                },
                {
                  value: "private",
                  label: "Keep private draft",
                  description: "Save the scope without publishing it to providers.",
                  icon: Lock,
                  iconClass: styles.choiceIcon_private,
                },
              ].map(({ value, label, description, icon: CardIcon, iconClass }) => (
                <label
                  key={value}
                  className={`${styles.choiceCard} ${
                    form.visibility === value ? styles.choiceCardSelected : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="visibility"
                    checked={form.visibility === value}
                    onChange={() => update("visibility", value as BasicsRequirement["visibility"])}
                  />
                  <div className={`${styles.choiceIconBox} ${iconClass}`}>
                    <CardIcon size={16} strokeWidth={2} aria-hidden="true" />
                  </div>
                  <span className={styles.choiceCopy}>
                    <strong>{label}</strong>
                    <span>{description}</span>
                  </span>
                </label>
              ))}
              <label
                className={`${styles.choiceCard} ${
                  form.requestRecommendations ? styles.choiceCardSelected : ""
                }`}
              >
                <input
                  type="checkbox"
                  checked={form.requestRecommendations}
                  onChange={(event) => update("requestRecommendations", event.target.checked)}
                />
                <div className={`${styles.choiceIconBox} ${styles.choiceIcon_sparkles}`}>
                  <Sparkles size={16} strokeWidth={2} aria-hidden="true" />
                </div>
                <span className={styles.choiceCopy}>
                  <strong>Request Kallisto recommendations</strong>
                  <span>Flag the published scope for assisted provider matching.</span>
                </span>
              </label>
            </div>
            <div className={styles.reviewSummary}>
              <div className={styles.reviewBlock}><span>Project</span><strong>{form.projectName || "No project"}</strong><p>{form.location || "Location not set"}</p></div>
              <div className={styles.reviewBlock}><span>Service</span><strong>{form.specialization}</strong><p>{form.deliverables.length} deliverables</p></div>
              <div className={styles.reviewBlock}><span>Commercials</span><strong>{form.engagementMode.replaceAll("_", " ")}</strong><p>{form.currency} {form.budgetMin || "Open"} to {form.budgetMax || "Open"}</p></div>
              <div className={styles.reviewBlock}><span>Publishing</span><strong>{form.visibility.replaceAll("_", " ")}</strong><p>{invitedProviderId ? "One provider preselected" : "No providers preselected"}</p></div>
            </div>

            {matchedProviders.length > 0 ? (
              <div className={styles.wizardMatchBanner}>
                <div className={styles.wizardMatchHeader}>
                  <div className={styles.wizardMatchIconBadge}>
                    <Sparkles size={16} aria-hidden="true" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
                      <strong>{matchedProviders.length} matching specialist{matchedProviders.length > 1 ? "s" : ""} in Basics</strong>
                      {savedMatchingProviders.length > 0 ? (
                        <div className={styles.wizardMatchTabs}>
                          <button
                            type="button"
                            className={`${styles.wizardMatchTabBtn} ${matchViewFilter === "all" ? styles.wizardMatchTabBtnActive : ""}`}
                            onClick={() => setMatchViewFilter("all")}
                          >
                            All ({matchedProviders.length})
                          </button>
                          <button
                            type="button"
                            className={`${styles.wizardMatchTabBtn} ${matchViewFilter === "saved" ? styles.wizardMatchTabBtnActive : ""}`}
                            onClick={() => setMatchViewFilter("saved")}
                          >
                            <Bookmark size={11} fill="currentColor" aria-hidden="true" />
                            Saved Profiles ({savedMatchingProviders.length})
                          </button>
                        </div>
                      ) : null}
                    </div>
                    <p>
                      Verified professionals matching {form.specialization || "your scope"}
                      {form.location ? ` in ${form.location}` : ""}. Review matching and saved profiles directly without publishing publicly.
                    </p>
                  </div>
                </div>

                <div className={styles.wizardMatchAvatarsRow}>
                  {displayedWizardMatches.slice(0, 4).map(({ provider, matchScore }) => {
                    const isSaved = savedIds.includes(provider.id);
                    return (
                      <div
                        key={provider.id}
                        className={styles.wizardMatchPill}
                        onClick={() => void findMatchingProfiles(isSaved && matchViewFilter === "saved")}
                        role="button"
                        tabIndex={0}
                        style={{ cursor: "pointer" }}
                        title="Click to view specialist profile"
                      >
                        <span className={styles.wizardMatchScore}>{matchScore}% match</span>
                        <strong>{provider.name}</strong>
                        <span className={styles.wizardMatchReason}>
                          {provider.specializations[0]} · {provider.location.city}
                        </span>
                        {isSaved ? (
                          <span className={styles.wizardSavedTag} title="In your saved profiles">
                            <Bookmark size={10} fill="currentColor" aria-hidden="true" />
                            Saved
                          </span>
                        ) : null}
                      </div>
                    );
                  })}
                  {displayedWizardMatches.length > 4 ? (
                    <button
                      type="button"
                      className={styles.wizardMatchMoreBtn}
                      onClick={() => void findMatchingProfiles(matchViewFilter === "saved")}
                    >
                      +{displayedWizardMatches.length - 4} more
                    </button>
                  ) : null}
                </div>

                <div className={styles.wizardMatchFooterActions}>
                  <button
                    type="button"
                    className={styles.secondaryButton}
                    style={{ height: "30px", fontSize: "12px", padding: "0 12px" }}
                    onClick={() => void findMatchingProfiles(false)}
                  >
                    <Search size={12} aria-hidden="true" />
                    Browse all {matchedProviders.length} matching profiles
                  </button>
                  {savedMatchingProviders.length > 0 ? (
                    <button
                      type="button"
                      className={styles.tertiaryButton}
                      style={{ height: "30px", fontSize: "12px" }}
                      onClick={() => void findMatchingProfiles(true)}
                    >
                      <Bookmark size={12} fill="currentColor" aria-hidden="true" />
                      View saved profiles ({savedMatchingProviders.length})
                    </button>
                  ) : null}
                </div>
              </div>
            ) : null}
          </>
        ) : null}

        {submitState === "error" ? (
          <div className={`${styles.notice} ${styles.noticeDanger}`} role="alert">
            The requirement could not be saved. Review the current step and try again.
          </div>
        ) : null}
        </div>

        <footer className={styles.wizardFooter}>
          <button
            type="button"
            className={styles.tertiaryButton}
            disabled={submitState === "saving"}
            onClick={() => void save("draft")}
          >
            <Save size={13} aria-hidden="true" />
            Save draft
          </button>
          <div className={styles.inlineActions}>
            <button
              type="button"
              className={styles.secondaryButton}
              disabled={step === 1 || submitState === "saving"}
              onClick={() => setStep((current) => Math.max(1, current - 1))}
            >
              <ArrowLeft size={13} aria-hidden="true" />
              Back
            </button>
            {step < 6 ? (
              <button type="button" className={styles.primaryButton} onClick={goNext}>
                Continue
                <ArrowRight size={13} aria-hidden="true" />
              </button>
            ) : (
              <>
                <button
                  type="button"
                  className={styles.secondaryButton}
                  disabled={submitState === "saving"}
                  onClick={() => void save("open")}
                  title="Publish requirement live to all eligible providers"
                >
                  <Send size={13} aria-hidden="true" />
                  Publish requirement
                </button>
                <button
                  type="button"
                  className={styles.primaryButton}
                  disabled={submitState === "saving"}
                  onClick={() => void findMatchingProfiles(false)}
                  title="Find matching specialist profiles without publishing"
                >
                  <Search size={13} aria-hidden="true" />
                  {submitState === "saving" ? "Finding..." : "Find Matching Profiles"}
                </button>
              </>
            )}
          </div>
        </footer>
      </section>
    </div>
  );
}
