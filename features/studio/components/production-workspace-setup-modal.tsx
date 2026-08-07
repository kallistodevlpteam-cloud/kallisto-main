"use client";

import { Check, ChevronRight, FileCode, Layers, Search, Wrench, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import {
  StudioProjectOption,
  StudioStartMethod,
  StudioTaskConfiguration,
  StudioUseCase,
  StudioUseCaseDefinition,
  StudioWorkspaceType,
} from "@/types/domain/studio";
import { StudioMockRepository } from "@/services/repositories/studio-mock-repository";
import styles from "./studio-modal.module.css";

export interface ProductionWorkspaceSetupModalProps {
  workspaceType: StudioWorkspaceType;
  isOpen: boolean;
  onClose: () => void;
  initialProjectId?: string;
  onLaunchWorkspace: (
    workspaceType: StudioWorkspaceType,
    useCase: StudioUseCase,
    projectId: string,
    startMethod: StudioStartMethod,
    configuration: StudioTaskConfiguration
  ) => void;
}

const repository = new StudioMockRepository();

export function ProductionWorkspaceSetupModal({
  workspaceType,
  isOpen,
  onClose,
  initialProjectId,
  onLaunchWorkspace,
}: ProductionWorkspaceSetupModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [useCases, setUseCases] = useState<StudioUseCaseDefinition[]>([]);
  const [selectedUseCaseId, setSelectedUseCaseId] = useState<StudioUseCase | "">("");
  const [projects, setProjects] = useState<StudioProjectOption[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [selectedStartMethod, setSelectedStartMethod] = useState<StudioStartMethod>("scratch");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      const allDefs = repository.getUseCaseDefinitions();
      const filtered = allDefs.filter((d) => d.workspaceType === workspaceType);
      setUseCases(filtered);
      if (filtered.length > 0) {
        setSelectedUseCaseId(filtered[0].id);
      }

      repository.getAvailableProjects().then((projs) => {
        setProjects(projs);
        if (initialProjectId && projs.some((p) => p.id === initialProjectId)) {
          setSelectedProjectId(initialProjectId);
        } else if (projs.length > 0) {
          setSelectedProjectId(projs[0].id);
        }
      });
    }
  }, [isOpen, workspaceType, initialProjectId]);

  if (!isOpen) return null;

  const currentUseCaseDef = useCases.find((u) => u.id === selectedUseCaseId);
  const selectedProject = projects.find((p) => p.id === selectedProjectId);

  const filteredProjects = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.projectType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const workspaceTitleMap: Record<StudioWorkspaceType, string> = {
    boq: "BOQs & Rate Analysis Workspace Setup",
    estimate: "Project Estimates Workspace Setup",
    visualisation: "Interior & Exterior Visualisations Workspace Setup",
    proposal: "Proposals & Presentations Workspace Setup",
    specification: "Material & Workmanship Specifications Setup",
    site_report: "Site Visit Progress Reports Setup",
    specification_report: "Specifications & Reports Workspace Setup",
  };

  const startMethodLabels: Record<StudioStartMethod, { title: string; desc: string }> = {
    scratch: {
      title: "Start from Scratch",
      desc: "Initialize a clean, unpopulated production structure.",
    },
    template: {
      title: "Use a Studio Template",
      desc: "Apply an approved Kallisto preset template and rates.",
    },
    import: {
      title: "Import Existing File",
      desc: "Upload Excel, PDF drawings or notes to auto-map data.",
    },
    duplicate: {
      title: "Duplicate Previous Output",
      desc: "Copy structure and items from an existing project output.",
    },
    draft: {
      title: "Continue Existing Draft",
      desc: "Resume work on an un-submitted local draft version.",
    },
  };

  const handleFinishSetup = () => {
    if (!selectedUseCaseId || !selectedProjectId) return;

    let configuration: StudioTaskConfiguration;

    if (workspaceType === "boq") {
      configuration = {
        workspaceType: "boq",
        packageType: "Civil & Interior Finishes",
        measurementStandard: "IS 1200",
        drawingRevisionIds: [],
        costLocation: "Hyderabad, India",
        includeTaxes: true,
      };
    } else if (workspaceType === "estimate") {
      configuration = {
        workspaceType: "estimate",
        estimateStage: "Detailed Estimate",
        totalAreaSqFt: 5000,
        qualityTier: "premium",
        costLocation: "Hyderabad, India",
        includedPackages: ["Civil", "Interior", "MEP"],
        contingencyPercentage: 5,
      };
    } else if (workspaceType === "visualisation") {
      configuration = {
        workspaceType: "visualisation",
        visualType: "interior",
        referenceFileIds: [],
        designDirection: "Contemporary Luxury",
        aspectRatio: "16:9",
        outputQuality: "4K Render",
      };
    } else if (workspaceType === "proposal") {
      configuration = {
        workspaceType: "proposal",
        documentType: "Project Proposal & Pitch",
        targetAudience: "Client Executive Board",
        includedSections: ["Scope", "Fees", "Milestones"],
        milestoneFeeStructure: true,
        applyWorkspaceBranding: true,
      };
    } else {
      configuration = {
        workspaceType: "specification_report",
        reportCategory: "material",
        observations: ["Site progress review on schedule."],
        attachedPhotoIds: [],
        assignedPartyIds: [],
      };
    }

    onLaunchWorkspace(
      workspaceType,
      selectedUseCaseId as StudioUseCase,
      selectedProjectId,
      selectedStartMethod,
      configuration
    );
    onClose();
  };

  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <div>
            <h3 className={styles.modalTitle}>{workspaceTitleMap[workspaceType]}</h3>
            <p className={styles.modalSubtitle}>Direct Structured Production Setup</p>
          </div>
          <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Close setup modal">
            <X size={18} />
          </button>
        </div>

        {/* Wizard Steps */}
        <div className={styles.wizardStepsBar}>
          <div className={`${styles.wizardStepItem} ${step >= 1 ? styles.stepActive : ""}`}>
            <span>1. What do you want to do?</span>
          </div>
          <ChevronRight size={14} className={styles.stepChevron} />
          <div className={`${styles.wizardStepItem} ${step >= 2 ? styles.stepActive : ""}`}>
            <span>2. Select Project</span>
          </div>
          <ChevronRight size={14} className={styles.stepChevron} />
          <div className={`${styles.wizardStepItem} ${step >= 3 ? styles.stepActive : ""}`}>
            <span>3. How to Start?</span>
          </div>
        </div>

        {/* Step 1: Use Case Selector */}
        {step === 1 && (
          <div className={styles.stepBody}>
            <h4 className={styles.stepHeading}>Select Production Use Case</h4>
            <p className={styles.stepSubheading}>
              Choose the specific professional workflow you wish to execute.
            </p>

            <div className={styles.useCaseGrid}>
              {useCases.map((uc) => (
                <div
                  key={uc.id}
                  className={`${styles.useCaseOptionCard} ${
                    selectedUseCaseId === uc.id ? styles.useCaseSelected : ""
                  }`}
                  onClick={() => setSelectedUseCaseId(uc.id)}
                >
                  <div className={styles.useCaseHeader}>
                    <h5 className={styles.useCaseLabel}>{uc.label}</h5>
                    {selectedUseCaseId === uc.id && <Check size={16} className={styles.checkBlue} />}
                  </div>
                  <p className={styles.useCaseDesc}>{uc.description}</p>
                </div>
              ))}
            </div>

            <div className={styles.modalFooter}>
              <button type="button" className={styles.secondaryBtn} onClick={onClose}>
                Cancel
              </button>
              <button
                type="button"
                className={styles.primaryBtn}
                disabled={!selectedUseCaseId}
                onClick={() => setStep(2)}
              >
                Next: Select Project <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Project Selection */}
        {step === 2 && (
          <div className={styles.stepBody}>
            <h4 className={styles.stepHeading}>Select Target Project</h4>
            <p className={styles.stepSubheading}>
              Bind this production workspace to an authorized project.
            </p>

            <div className={styles.searchBarWrap}>
              <Search size={16} className={styles.searchIcon} />
              <input
                type="text"
                className={styles.searchInput}
                placeholder="Search by project name, code or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className={styles.projectsListGrid}>
              {filteredProjects.map((proj) => (
                <div
                  key={proj.id}
                  className={`${styles.projectCardOption} ${
                    selectedProjectId === proj.id ? styles.projectCardSelected : ""
                  }`}
                  onClick={() => setSelectedProjectId(proj.id)}
                >
                  <div className={styles.projHeaderRow}>
                    <span className={styles.projCodeBadge}>{proj.code}</span>
                    <span className={styles.projPhaseBadge}>{proj.phase}</span>
                  </div>
                  <h5 className={styles.projName}>{proj.name}</h5>
                  <p className={styles.projMeta}>
                    {proj.projectType} &bull; {proj.location}
                  </p>
                </div>
              ))}
            </div>

            <div className={styles.modalFooter}>
              <button type="button" className={styles.secondaryBtn} onClick={() => setStep(1)}>
                Back
              </button>
              <button
                type="button"
                className={styles.primaryBtn}
                disabled={!selectedProjectId}
                onClick={() => setStep(3)}
              >
                Next: Choose Start Method <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Start Method Choice */}
        {step === 3 && (
          <div className={styles.stepBody}>
            <h4 className={styles.stepHeading}>How would you like to start?</h4>
            <p className={styles.stepSubheading}>
              Available entry methods for {currentUseCaseDef?.label || "this use case"}:
            </p>

            <div className={styles.startMethodsGrid}>
              {(currentUseCaseDef?.availableStartMethods || ["scratch", "template"]).map((sm) => {
                const info = startMethodLabels[sm];
                return (
                  <div
                    key={sm}
                    className={`${styles.startMethodCard} ${
                      selectedStartMethod === sm ? styles.startMethodSelected : ""
                    }`}
                    onClick={() => setSelectedStartMethod(sm)}
                  >
                    <div className={styles.startMethodHeader}>
                      <h5 className={styles.startMethodTitle}>{info.title}</h5>
                      {selectedStartMethod === sm && <Check size={16} className={styles.checkBlue} />}
                    </div>
                    <p className={styles.startMethodDesc}>{info.desc}</p>
                  </div>
                );
              })}
            </div>

            <div className={styles.modalFooter}>
              <button type="button" className={styles.secondaryBtn} onClick={() => setStep(2)}>
                Back
              </button>
              <button type="button" className={styles.primaryBtn} onClick={handleFinishSetup}>
                <Wrench size={16} />
                Open Production Workspace
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
