import {
  ConfirmImportInput,
  ImportValidationResult,
  PreviewClientCandidate,
  Project,
  ProjectListItem,
  ProjectPhase,
  UserSecurityContext,
} from "../types/project.types";
import { checkUserPermission } from "./project-authorization";
import { projectsRepository } from "./projects.repository";
import { DEV_CLIENTS } from "@/services/repositories/development-project-adapter";

interface StoredValidationSessionData {
  projectName: string;
  projectCode: string;
  projectType: string;
  clientSelection: {
    mode: "use_existing" | "create_new";
    clientName?: string;
    organisationName?: string;
    email?: string;
    phone?: string;
  };
  siteLocation?: string;
  phase: ProjectPhase;
  startDate?: string;
  expectedCompletionDate?: string;
  ownerId?: string;
  ownerName?: string;
  contractValue?: number;
  sourceSystem?: string;
  notes?: string;
}

export const projectImportService = {
  async validateAndPreviewImport(
    context: UserSecurityContext,
    rawInput: {
      projectName: string;
      projectCode: string;
      projectType?: string;
      clientName?: string;
      organisationName?: string;
      email?: string;
      phone?: string;
      siteLocation?: string;
      phase?: string;
      startDate?: string;
      expectedCompletionDate?: string;
      ownerId?: string;
      ownerName?: string;
      contractValue?: number;
      sourceSystem?: string;
      notes?: string;
    }
  ): Promise<ImportValidationResult> {
    if (!checkUserPermission(context, "projects.import")) {
      throw new Error("Access Denied: User lacks 'projects.import' permission.");
    }

    const errors: string[] = [];
    const warnings: string[] = [];

    if (!rawInput.projectName || !rawInput.projectName.trim()) {
      errors.push("Project name is required.");
    }
    if (!rawInput.projectCode || !rawInput.projectCode.trim()) {
      errors.push("Project code is required.");
    }

    const normCode = (rawInput.projectCode || "").trim();
    const exactCodeDuplicate = await projectsRepository.isProjectCodeExists(
      context.workspaceId,
      normCode
    );

    if (exactCodeDuplicate) {
      errors.push(`Project code '${normCode}' already exists in this workspace.`);
    }

    const matchingClientCandidates: PreviewClientCandidate[] = [];
    const searchClientName = (rawInput.clientName || "").toLowerCase().trim();
    const searchEmail = (rawInput.email || "").toLowerCase().trim();

    DEV_CLIENTS.forEach((c) => {
      let score = 0;
      const reasons: string[] = [];

      if (searchEmail && c.contactDetails.email.toLowerCase() === searchEmail) {
        score += 90;
        reasons.push("Exact email match");
      }

      if (searchClientName && c.name.toLowerCase().includes(searchClientName)) {
        score += 60;
        reasons.push("Name match");
      }

      if (
        searchClientName &&
        c.organisationName &&
        c.organisationName.toLowerCase().includes(searchClientName)
      ) {
        score += 50;
        reasons.push("Organisation name match");
      }

      if (score > 40) {
        matchingClientCandidates.push({
          id: c.id,
          name: c.name,
          organisationName: c.organisationName,
          email: c.contactDetails.email,
          phone: c.contactDetails.phone,
          matchScore: score,
          matchReason: reasons.join(", "),
        });
      }
    });

    if (matchingClientCandidates.length > 0) {
      warnings.push(`Found ${matchingClientCandidates.length} existing client(s) matching your input details.`);
    }

    const validationId = `val-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    const dataPreview: StoredValidationSessionData = {
      projectName: rawInput.projectName.trim(),
      projectCode: normCode,
      projectType: rawInput.projectType || "General Construction",
      clientSelection: {
        mode: "use_existing" as const,
        clientName: rawInput.clientName,
        organisationName: rawInput.organisationName,
        email: rawInput.email,
        phone: rawInput.phone,
      },
      siteLocation: rawInput.siteLocation,
      phase: (rawInput.phase as ProjectPhase) || "Briefing",
      startDate: rawInput.startDate,
      expectedCompletionDate: rawInput.expectedCompletionDate,
      ownerId: rawInput.ownerId || context.userId,
      ownerName: rawInput.ownerName || "Arjun",
      contractValue: rawInput.contractValue,
      sourceSystem: rawInput.sourceSystem,
      notes: rawInput.notes,
    };

    await projectsRepository.saveValidationSession(validationId, dataPreview);

    return {
      validationId,
      expiresAt,
      isValid: errors.length === 0,
      errors,
      warnings,
      dataPreview,
      matchingClientCandidates,
      exactCodeDuplicate,
    };
  },

  async confirmImport(
    context: UserSecurityContext,
    input: ConfirmImportInput
  ): Promise<{ success: boolean; project: ProjectListItem }> {
    if (!checkUserPermission(context, "projects.import")) {
      throw new Error("Access Denied: User lacks 'projects.import' permission.");
    }

    if (await projectsRepository.isIdempotencyKeyUsed(input.idempotencyKey)) {
      throw new Error("Duplicate Submission: This import request has already been processed.");
    }

    const rawSession = await projectsRepository.getValidationSession(input.validationId);
    if (!rawSession) {
      throw new Error("Validation Expired: The preview validation session is missing or expired. Please validate again.");
    }

    const session = rawSession as StoredValidationSessionData;

    const codeExists = await projectsRepository.isProjectCodeExists(
      context.workspaceId,
      session.projectCode
    );
    if (codeExists) {
      throw new Error(`Project code '${session.projectCode}' is already registered in the datastore.`);
    }

    await projectsRepository.markIdempotencyKeyUsed(input.idempotencyKey);

    const now = new Date().toISOString();
    let finalClientId = "cli-101";
    let clientDisplayName = "Anoop Menon";

    if (input.clientSelection.mode === "use_existing" && input.clientSelection.selectedClientId) {
      finalClientId = input.clientSelection.selectedClientId;
      const existingClient = DEV_CLIENTS.find((c) => c.id === finalClientId);
      if (existingClient) {
        clientDisplayName = existingClient.name;
      }
    } else if (input.clientSelection.newClientDetails) {
      finalClientId = `cli-imp-${Date.now()}`;
      clientDisplayName = input.clientSelection.newClientDetails.name;
      DEV_CLIENTS.unshift({
        id: finalClientId,
        workspaceId: context.workspaceId,
        type: input.clientSelection.newClientDetails.organisationName ? "organisation" : "individual",
        name: input.clientSelection.newClientDetails.name,
        organisationName: input.clientSelection.newClientDetails.organisationName,
        primaryContact: {
          name: input.clientSelection.newClientDetails.name,
          email: input.clientSelection.newClientDetails.email || "",
          phone: input.clientSelection.newClientDetails.phone || "",
        },
        contactDetails: {
          email: input.clientSelection.newClientDetails.email || "",
          phone: input.clientSelection.newClientDetails.phone || "",
        },
        billingDetails: {
          billingAddress: session.siteLocation || "Site Location",
        },
        siteAddresses: [{ label: "Site", address: session.siteLocation || "" }],
        billingAddress: session.siteLocation || "",
        createdAt: now,
        updatedAt: now,
      });
    }

    const newProjectId = `proj-imp-${Date.now()}`;
    const newProject: Project = {
      id: newProjectId,
      workspaceId: context.workspaceId,
      clientId: finalClientId,
      name: session.projectName,
      code: session.projectCode,
      type: session.projectType,
      status: "UPCOMING",
      health: "ON_TRACK",
      phase: session.phase,
      ownerId: session.ownerId || context.userId,
      ownerName: session.ownerName || "Arjun",
      siteLocation: session.siteLocation,
      startDate: session.startDate || now.slice(0, 10),
      targetCompletionDate: session.expectedCompletionDate,
      contractValue: session.contractValue,
      notes: input.notes || session.notes,
      importedAt: now,
      importedBy: context.userId,
      createdAt: now,
      createdBy: context.userId,
      updatedAt: now,
      nextAction: {
        id: `act-${newProjectId}`,
        projectId: newProjectId,
        title: "Setup imported project kick-off schedule & requirements",
        type: "GENERAL",
        ownerId: session.ownerId || context.userId,
        ownerName: session.ownerName || "Arjun",
        dueAt: new Date(Date.now() + 5 * 24 * 3600 * 1000).toISOString(),
        status: "PENDING",
        createdAt: now,
        updatedAt: now,
      },
    };

    await projectsRepository.insertProject(newProject);

    const projectListItem: ProjectListItem = {
      id: newProject.id,
      name: newProject.name,
      code: newProject.code,
      type: newProject.type,
      clientId: newProject.clientId,
      clientDisplayName,
      phase: newProject.phase,
      nextAction: {
        id: newProject.nextAction!.id,
        title: newProject.nextAction!.title,
        context: `Assigned to ${newProject.ownerName}`,
        ownerName: newProject.ownerName || undefined,
        dueAt: newProject.nextAction!.dueAt,
        dueState: "due_soon",
        dueLabel: "In 5 days",
        isOverdue: false,
        isBlocked: false,
      },
      owner: {
        id: newProject.ownerId,
        name: newProject.ownerName || "Lead",
        initials: "AR",
      },
      status: "UPCOMING",
      health: "ON_TRACK",
      updatedAt: now,
      allowedActions: ["open", "edit", "change_owner", "put_on_hold"],
    };

    return {
      success: true,
      project: projectListItem,
    };
  },
};
