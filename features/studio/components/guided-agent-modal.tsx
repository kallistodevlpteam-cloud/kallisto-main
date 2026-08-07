"use client";

import { Check, ChevronRight, FileText, FolderPlus, Info, Search, Sparkles, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import { StudioAgentType, StudioProjectOption, StudioTaskConfiguration, StudioWorkspaceType } from "@/types/domain/studio";
import { StudioMockRepository } from "@/services/repositories/studio-mock-repository";
import styles from "./studio-modal.module.css";

export interface GuidedAgentModalProps {
  agentType: StudioAgentType;
  isOpen: boolean;
  onClose: () => void;
  initialProjectId?: string;
  onOpenWorkspace: (
    workspaceType: StudioWorkspaceType,
    useCase: any,
    projectId: string,
    configuration: StudioTaskConfiguration
  ) => void;
}

interface AgentDetails {
  title: string;
  category: string;
  workspaceType: StudioWorkspaceType;
  defaultUseCase: any;
  capabilities: string[];
  questionPrompt: string;
  outputName: string;
}

const AGENT_MAP: Record<StudioAgentType, AgentDetails> = {
  boq_builder: {
    title: "BOQ Builder Agent",
    category: "Cost & Estimation",
    workspaceType: "boq",
    defaultUseCase: "create_detailed_boq",
    capabilities: [
      "Identify BOQ structure (Trade-wise vs Package-wise)",
      "Select relevant Architectural & Structural drawings",
      "Check measurement standards (IS 1200 / SMM7)",
      "Detect missing item quantities & unpriced line items",
      "Recommend regional market rates & labour multipliers",
    ],
    questionPrompt: "What type of Bill of Quantities or rate analysis do you need for this project?",
    outputName: "Detailed Commercial BOQ & Rate Analysis",
  },
  project_estimate: {
    title: "Project Estimate Agent",
    category: "Cost & Estimation",
    workspaceType: "estimate",
    defaultUseCase: "detailed_estimate",
    capabilities: [
      "Identify estimation stage (Quick, Preliminary or Detailed)",
      "Calculate cost per sq ft based on quality tier",
      "Apply location-based pricing adjustments",
      "Compare standard, premium and luxury cost scenarios",
      "Detect missing site allowances and contingency budgets",
    ],
    questionPrompt: "What stage of cost estimation or budget planning are you preparing?",
    outputName: "Project Cost Plan & Package Estimate",
  },
  specification_report: {
    title: "Specification & Report Agent",
    category: "Documentation",
    workspaceType: "specification_report",
    defaultUseCase: "material_spec",
    capabilities: [
      "Determine specification vs site progress report requirements",
      "Compile material finish schedules & approved-makes lists",
      "Organize site inspection notes & captioned photographs",
      "Identify open quality, safety or progress issues",
      "Format approved Kallisto report templates",
    ],
    questionPrompt: "Are you drafting technical specifications or a formal site progress report?",
    outputName: "Technical Material Specification & Report",
  },
  visualisation: {
    title: "Visualisation Agent",
    category: "Visualisation",
    workspaceType: "visualisation",
    defaultUseCase: "interior_vis",
    capabilities: [
      "Select interior space vs exterior façade view requirements",
      "Collect reference mood board images & texture references",
      "Define aspect ratio, lighting (day/night) and render quality",
      "Generate material & colour variation comparisons",
      "Prepare presentation-ready visual briefs",
    ],
    questionPrompt: "What visual outputs or presentation renders do you want to create?",
    outputName: "Project Visualisation Brief & Presentation Views",
  },
  proposal: {
    title: "Proposal Agent",
    category: "Documents",
    workspaceType: "proposal",
    defaultUseCase: "project_proposal",
    capabilities: [
      "Structure fee proposals, scopes of work and milestone payments",
      "Inject practice profiles, team credentials and client data",
      "Define deliverable schedules & explicit exclusion boundaries",
      "Apply workspace branding and reusable content blocks",
      "Format executive client pitch decks and narratives",
    ],
    questionPrompt: "What client-facing proposal or presentation deck are you preparing?",
    outputName: "Client Architectural Proposal & Presentation Deck",
  },
  site_report: {
    title: "Site Report Agent",
    category: "Site & Construction",
    workspaceType: "specification_report",
    defaultUseCase: "site_visit_report",
    capabilities: [
      "Organize site inspection notes and timestamped photos",
      "Track safety, quality and construction progress issues",
      "Assign responsible contractors and completion deadlines",
      "Generate formal site visit inspection logs",
      "Attach photographic evidence for client review",
    ],
    questionPrompt: "Which site visit notes or progress updates would you like to process?",
    outputName: "Site Inspection & Weekly Progress Report",
  },
};

const repository = new StudioMockRepository();

export function GuidedAgentModal({
  agentType,
  isOpen,
  onClose,
  initialProjectId,
  onOpenWorkspace,
}: GuidedAgentModalProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [projects, setProjects] = useState<StudioProjectOption[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [userIntentNotes, setUserIntentNotes] = useState("");
  const [selectedQuality, setSelectedQuality] = useState<"standard" | "premium" | "luxury">("premium");
  const [costLocation, setCostLocation] = useState("Hyderabad, India");

  const agent = AGENT_MAP[agentType] || AGENT_MAP.boq_builder;

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setUserIntentNotes("");
      repository.getAvailableProjects().then((projs) => {
        setProjects(projs);
        if (initialProjectId && projs.some((p) => p.id === initialProjectId)) {
          setSelectedProjectId(initialProjectId);
        } else if (projs.length > 0) {
          setSelectedProjectId(projs[0].id);
        }
      });
    }
  }, [isOpen, initialProjectId]);

  if (!isOpen) return null;

  const filteredProjects = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.projectType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedProject = projects.find((p) => p.id === selectedProjectId);

  const handleLaunchWorkspace = () => {
    if (!selectedProject) return;

    let configuration: StudioTaskConfiguration;

    if (agent.workspaceType === "boq") {
      configuration = {
        workspaceType: "boq",
        packageType: "Civil & Interior Finishes",
        measurementStandard: "IS 1200",
        drawingRevisionIds: ["dwg-01"],
        costLocation,
        includeTaxes: true,
        notes: userIntentNotes || "Guided BOQ created via Agent Assistance",
      };
    } else if (agent.workspaceType === "estimate") {
      configuration = {
        workspaceType: "estimate",
        estimateStage: "Detailed Design Estimate",
        totalAreaSqFt: 4500,
        qualityTier: selectedQuality,
        costLocation,
        includedPackages: ["Civil", "Interior", "MEP", "HVAC"],
        contingencyPercentage: 5,
        notes: userIntentNotes || "Guided Estimate created via Agent Assistance",
      };
    } else if (agent.workspaceType === "visualisation") {
      configuration = {
        workspaceType: "visualisation",
        visualType: "interior",
        referenceFileIds: [],
        designDirection: userIntentNotes || "Modern Contemporary Luxury",
        aspectRatio: "16:9",
        outputQuality: "4K Render",
      };
    } else if (agent.workspaceType === "proposal") {
      configuration = {
        workspaceType: "proposal",
        documentType: "Full Service Architectural & Interior Proposal",
        targetAudience: "Private Residential Client",
        includedSections: ["Scope", "Deliverables", "Fee Schedule", "Milestones"],
        milestoneFeeStructure: true,
        applyWorkspaceBranding: true,
        notes: userIntentNotes,
      };
    } else {
      configuration = {
        workspaceType: "specification_report",
        reportCategory: "material",
        siteVisitDate: "2026-07-22",
        observations: [userIntentNotes || "Site inspection conducted; progress on schedule."],
        attachedPhotoIds: ["img-01", "img-02"],
        assignedPartyIds: ["contractor-civil-01"],
      };
    }

    onOpenWorkspace(
      agent.workspaceType,
      agent.defaultUseCase,
      selectedProject.id,
      configuration
    );
    onClose();
  };

  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <div className={styles.agentTitleBadgeWrap}>
            <div className={styles.agentSparkleIcon}>
              <Sparkles size={18} />
            </div>
            <div>
              <h3 className={styles.modalTitle}>{agent.title}</h3>
              <p className={styles.modalSubtitle}>{agent.category} &bull; Guided Assistant</p>
            </div>
          </div>
          <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        {/* Wizard Steps Bar */}
        <div className={styles.wizardStepsBar}>
          <div className={`${styles.wizardStepItem} ${step >= 1 ? styles.stepActive : ""}`}>
            <span>1. Requirements</span>
          </div>
          <ChevronRight size={14} className={styles.stepChevron} />
          <div className={`${styles.wizardStepItem} ${step >= 2 ? styles.stepActive : ""}`}>
            <span>2. Select Project</span>
          </div>
          <ChevronRight size={14} className={styles.stepChevron} />
          <div className={`${styles.wizardStepItem} ${step >= 3 ? styles.stepActive : ""}`}>
            <span>3. Configuration</span>
          </div>
          <ChevronRight size={14} className={styles.stepChevron} />
          <div className={`${styles.wizardStepItem} ${step >= 4 ? styles.stepActive : ""}`}>
            <span>4. Handoff</span>
          </div>
        </div>

        {/* Step 1: Requirements & Agent Capabilities */}
        {step === 1 && (
          <div className={styles.stepBody}>
            <div className={styles.promptBox}>
              <p className={styles.promptText}>{agent.questionPrompt}</p>
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Describe your requirements or design direction:</label>
              <textarea
                className={styles.textAreaInput}
                rows={3}
                placeholder="e.g. 4,500 sq ft luxury residential villa; require detailed rate analysis for marble flooring, woodwork and HVAC packages..."
                value={userIntentNotes}
                onChange={(e) => setUserIntentNotes(e.target.value)}
              />
            </div>

            <div className={styles.capabilitiesBox}>
              <h4 className={styles.capabilitiesTitle}>Agent Guided Assistance Includes:</h4>
              <ul className={styles.capabilitiesList}>
                {agent.capabilities.map((cap, i) => (
                  <li key={i}>
                    <Check size={14} className={styles.checkIcon} />
                    <span>{cap}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className={styles.modalFooter}>
              <button type="button" className={styles.secondaryBtn} onClick={onClose}>
                Cancel
              </button>
              <button type="button" className={styles.primaryBtn} onClick={() => setStep(2)}>
                Next: Select Project <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Searchable Project Selection */}
        {step === 2 && (
          <div className={styles.stepBody}>
            <h4 className={styles.stepHeading}>Select Target Project</h4>
            <p className={styles.stepSubheading}>
              Select the active project where this Studio output will be bound and published.
            </p>

            <div className={styles.searchBarWrap}>
              <Search size={16} className={styles.searchIcon} />
              <input
                type="text"
                className={styles.searchInput}
                placeholder="Search projects by name, code, type, or location..."
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
                Next: Configure Inputs <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Source Inputs & Quality Parameters */}
        {step === 3 && (
          <div className={styles.stepBody}>
            <h4 className={styles.stepHeading}>Source Inputs &amp; Parameters</h4>
            <p className={styles.stepSubheading}>
              Specify cost location, quality tier, and optional source drawing attachments.
            </p>

            <div className={styles.twoColFields}>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Cost Location:</label>
                <input
                  type="text"
                  className={styles.textInput}
                  value={costLocation}
                  onChange={(e) => setCostLocation(e.target.value)}
                />
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Quality Specification Tier:</label>
                <select
                  className={styles.selectInput}
                  value={selectedQuality}
                  onChange={(e) => setSelectedQuality(e.target.value as any)}
                >
                  <option value="standard">Standard Execution Tier</option>
                  <option value="premium">Premium Specification Tier</option>
                  <option value="luxury">Luxury Custom Design Tier</option>
                </select>
              </div>
            </div>

            <div className={styles.infoBanner}>
              <Info size={16} />
              <span>
                Agent will automatically link available project drawings &amp; specs from {selectedProject?.code}.
              </span>
            </div>

            <div className={styles.modalFooter}>
              <button type="button" className={styles.secondaryBtn} onClick={() => setStep(2)}>
                Back
              </button>
              <button type="button" className={styles.primaryBtn} onClick={() => setStep(4)}>
                Review Handoff Summary <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Agent Handoff Confirmation Summary */}
        {step === 4 && (
          <div className={styles.stepBody}>
            <div className={styles.handoffCard}>
              <div className={styles.handoffHeader}>
                <Sparkles size={20} className={styles.sparkleGold} />
                <div>
                  <h4 className={styles.handoffTitle}>Agent Guided Handoff Summary</h4>
                  <p className={styles.handoffSubtitle}>
                    All required specifications collected. Ready to prefill production workspace.
                  </p>
                </div>
              </div>

              <div className={styles.summaryGrid}>
                <div className={styles.summaryItem}>
                  <span className={styles.summaryLabel}>Selected Output:</span>
                  <span className={styles.summaryVal}>{agent.outputName}</span>
                </div>
                <div className={styles.summaryItem}>
                  <span className={styles.summaryLabel}>Bound Project:</span>
                  <span className={styles.summaryVal}>{selectedProject?.name} ({selectedProject?.code})</span>
                </div>
                <div className={styles.summaryItem}>
                  <span className={styles.summaryLabel}>Cost Location:</span>
                  <span className={styles.summaryVal}>{costLocation}</span>
                </div>
                <div className={styles.summaryItem}>
                  <span className={styles.summaryLabel}>Quality Tier:</span>
                  <span className={styles.summaryVal}>{selectedQuality.toUpperCase()}</span>
                </div>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button type="button" className={styles.secondaryBtn} onClick={() => setStep(3)}>
                Back
              </button>
              <button type="button" className={styles.primaryBtn} onClick={handleLaunchWorkspace}>
                <FolderPlus size={16} />
                Open Production Workspace
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
