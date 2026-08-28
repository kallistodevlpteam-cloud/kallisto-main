"use client";

import React, { useCallback, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { StudioAgentType, StudioWorkspaceType } from "@/types/domain/studio";
import { useStudioWorkspace } from "../hooks/use-studio-workspace";
import { StudioIntent } from "../types/studio-source";
import { StudioIdleView } from "./studio-idle-view";
import { StudioChatView } from "./studio-chat-view";
import { StudioActiveTaskCanvas } from "./studio-active-task-canvas";
import { OutputSelectorModal } from "./output-selector-modal";
import { ProposalCreationModal } from "./proposal-creation-modal";
import { MOCK_ENQUIRIES } from "@/features/enquiries/services/enquiries.mock";
import styles from "./studio-template-explorer.module.css";

export interface ProductionCardItem {
  id: string;
  workspaceType: StudioWorkspaceType;
  title: string;
  description: string;
  badge: string;
  image: string;
}

export interface PopularAgentItem {
  id: string;
  agentType: StudioAgentType;
  title: string;
  oneLineCapability: string;
  category: string;
  status: "Ready" | "Beta" | "Processing" | "Coming soon";
  avatarBg: string;
  icon: React.ElementType;
}

export function StudioCreatePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isOutputSelectorOpen, setIsOutputSelectorOpen] = useState(false);
  const { project, composer, taskSession, actions } = useStudioWorkspace();

  const intent = searchParams.get("intent");
  const enquiryId = searchParams.get("enquiryId");
  const isProposalIntent = intent === "create_proposal" && !!enquiryId;

  const enquiry = isProposalIntent ? MOCK_ENQUIRIES.find((e) => e.id === enquiryId) || MOCK_ENQUIRIES[0] : null;

  // Check if an existing task session / draft exists for this enquiryId
  const existingTask = isProposalIntent
    ? taskSession.recentTasks.find(
        (t) => (t as unknown as { enquiryId?: string }).enquiryId === enquiryId || t.projectName === (enquiry?.title || "Villa Design Consultation")
      )
    : null;

  const existingDraftExists = !!existingTask;

  const [showProposalModal, setShowProposalModal] = useState(isProposalIntent);

  const promptParam = searchParams.get("prompt") || searchParams.get("q");

  useEffect(() => {
    if (isProposalIntent) {
      setShowProposalModal(true);
    } else if (promptParam && taskSession.messages.length === 0) {
      composer.setPrompt(promptParam);
      taskSession.submitTask({
        prompt: promptParam,
        sources: [],
        selectedProjectId: project.selectedProjectId,
        projectName: "Consultation & Package Enquiry",
        selectedIntent: "create",
        selectedAgent: "proposal",
        selectedOutputType: "proposal",
        composerVersion: composer.version,
        clearComposer: () => composer.setPrompt(""),
        clearAttachments: () => composer.clearAttachments(),
        restoreDraft: () => {},
        getCurrentComposerState: () => ({ prompt: "", attachments: [], version: composer.version }),
      });
    }
  }, [isProposalIntent, promptParam]);

  const handleCancelProposal = useCallback(() => {
    setShowProposalModal(false);
    if (enquiryId) {
      router.push(`/enquiries/${enquiryId}`);
    } else {
      router.push("/enquiries");
    }
  }, [enquiryId, router]);

  const handleContinueProposalDrafting = useCallback(async () => {
    setShowProposalModal(false);
    if (existingTask) {
      await actions.reopenDraft(existingTask.id);
    } else {
      const enquiryTitle = enquiry?.title || "Villa Design Consultation";
      const budget =
        enquiry?.budget ||
        (enquiry?.budgetMin && enquiry?.budgetMax
          ? `₹${Math.round(enquiry.budgetMin / 100000)}L – ₹${Math.round(enquiry.budgetMax / 100000)}L`
          : "₹18L – ₹25L");
      const promptText = `Create a professional proposal for ${enquiryTitle} using the enquiry details, scope, budget (${budget}) and uploaded documents.`;

      composer.setSelectedAgent("proposal");
      composer.setSelectedOutputType("proposal");
      composer.setSelectedIntent("create");
      composer.setPrompt(promptText);

      await taskSession.submitTask({
        prompt: promptText,
        sources: [],
        selectedProjectId: project.selectedProjectId,
        projectName: enquiryTitle,
        selectedIntent: "create",
        selectedAgent: "proposal",
        selectedOutputType: "proposal",
        composerVersion: composer.version,
        clearComposer: () => composer.setPrompt(""),
        clearAttachments: () => composer.clearAttachments(),
        restoreDraft: () => {},
        getCurrentComposerState: () => ({ prompt: "", attachments: [], version: composer.version }),
      });
    }
  }, [actions, composer, enquiry, existingTask, project.selectedProjectId, taskSession]);

  // Active chat canvas mode is active when taskSession has messages
  const isChatMode = taskSession.messages.length > 0;

  const handleSubmit = useCallback(async () => {
    await actions.submitTask();
  }, [actions]);

  const handleStartNewTask = useCallback(() => {
    actions.startNewTask();
  }, [actions]);

  const [outputsOpen, setOutputsOpen] = useState(false);

  const selectedProject = project.projects.find((p) => p.id === project.selectedProjectId) || {
    id: project.selectedProjectId || "proj-default",
    workspaceId: "ws-default",
    name: "Kallisto Virtual Office",
    code: "KVO-01",
    projectType: "Commercial",
    phase: "Design",
    status: "active",
  };

  const handleActionSelect = (action: { suggestedPrompt: string; intent?: StudioIntent }) => {
    composer.setPrompt(action.suggestedPrompt);
    if (action.intent) composer.setSelectedAgent(composer.selectedAgent);
  };

  const handleOutputTypeSelect = (type: StudioWorkspaceType) => {
    const defaultPrompts: Record<string, string> = {
      boq: "Prepare a BOQ for this project",
      estimate: "Create a cost estimate for this project",
      proposal: "Draft a client proposal for this project",
      visualisation: "Generate a 3D visualisation render",
      specification: "Prepare material specifications for this project",
      site_report: "Create a site visit progress report",
    };
    composer.setPrompt(defaultPrompts[type] || `Prepare ${type} for this project`);
  };

  return (
    <div className={styles.container}>
      <StudioActiveTaskCanvas
        task={taskSession.activeTask}
        project={selectedProject}
        projects={project.projects}
        onSelectProject={project.selectProject}
        messages={taskSession.messages}
        recentTasks={taskSession.recentTasks}
        onSelectIntent={actions.selectIntent}
        onReopenTask={actions.reopenDraft}
        outputs={[]}
        taskStatus={taskSession.workspaceMode}
        outputsOpen={outputsOpen}
        isSubmitting={taskSession.workspaceMode === "validating" || taskSession.workspaceMode === "generating"}
        prompt={composer.prompt}
        onPromptChange={composer.setPrompt}
        attachments={composer.attachments}
        onAddAttachment={composer.addAttachment}
        onRemoveAttachment={composer.removeAttachment}
        selectedIntent={composer.selectedIntent}
        selectedAgent={composer.selectedAgent}
        onAgentChange={composer.setSelectedAgent}
        selectedOutputType={null}
        onOutputTypeSelect={handleOutputTypeSelect}
        onActionSelect={handleActionSelect}
        onOutputsOpenChange={setOutputsOpen}
        onRetryMessage={taskSession.retryMessage}
        onSubmit={handleSubmit}
        onStartNewTask={handleStartNewTask}
      />

      {/* Proposal Creation Context Modal Overlay */}
      {isProposalIntent && (
        <ProposalCreationModal
          isOpen={showProposalModal}
          enquiry={enquiry}
          existingDraftExists={existingDraftExists}
          onContinueDrafting={handleContinueProposalDrafting}
          onCancel={handleCancelProposal}
        />
      )}

      {/* Output Selector Modal */}
      <OutputSelectorModal
        isOpen={isOutputSelectorOpen}
        onClose={() => setIsOutputSelectorOpen(false)}
        onSelectOutput={(workspaceType) => {
          composer.setSelectedOutputType(workspaceType);
          setIsOutputSelectorOpen(false);
        }}
      />
    </div>
  );
}

// Retain alias export for backwards compatibility
export { StudioCreatePage as StudioTemplateExplorer };
