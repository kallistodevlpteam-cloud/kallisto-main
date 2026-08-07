import {
  CreateProjectUpdateInput,
  ProjectUpdate,
  ProjectUpdateAttachment,
  ProjectUpdateDocumentPublication,
} from "@/types/domain/project-update";
import {
  ProjectDocument,
  ProjectDocumentOwner,
} from "@/types/domain/project-document";
import { mockProjectUpdateRepository } from "@/services/repositories/mock-project-update-repository";
import { projectDocumentRepository } from "@/services/repositories/project-document-repository";
import { mockProjectFileStorage } from "@/services/storage/mock-project-file-storage";

export interface ProjectUpdateActor {
  userId: string;
  workspaceId: string;
  role: string;
  name: string;
  avatarUrl?: string;
}

export interface CreateAndPublishProjectUpdateInput {
  update: CreateProjectUpdateInput;
  actor: ProjectUpdateActor;
}

export interface CreateAndPublishProjectUpdateResult {
  update: ProjectUpdate;
  documents: ProjectDocument[];
  failures: Array<{
    attachmentId: string;
    fileName: string;
    error: string;
  }>;
}

class ProjectUpdatePublishingService {
  async createAndPublish(
    input: CreateAndPublishProjectUpdateInput,
  ): Promise<CreateAndPublishProjectUpdateResult> {
    const { update: updateInput, actor } = input;

    // 1. Permission & Actor Enforcement
    if (!actor || !actor.userId || !actor.workspaceId) {
      throw new Error("Unauthorized update creation attempt.");
    }
    if (actor.role === "restricted" || actor.role === "unauthorized") {
      throw new Error("User does not have permission to publish project updates.");
    }

    // 2. Validate attachment revision targets
    if (updateInput.attachments && updateInput.attachments.length > 0) {
      for (const att of updateInput.attachments) {
        if (att.revisesDocumentId) {
          const allDocs = await projectDocumentRepository.listProjectDocuments("proj-001");
          const targetDoc = allDocs.documents.find((d) => d.id === att.revisesDocumentId);
          if (targetDoc && targetDoc.projectId !== updateInput.projectId) {
            throw new Error("Revision of a document from another project is rejected.");
          }
        }
      }
    }

    // 3. Process attachments with durable mock file storage
    const durableAttachments: ProjectUpdateAttachment[] = [];
    if (updateInput.attachments && updateInput.attachments.length > 0) {
      for (const att of updateInput.attachments) {
        const storageResult = await mockProjectFileStorage.uploadAttachment(
          updateInput.projectId,
          att,
        );
        durableAttachments.push({
          ...att,
          storageObjectId: att.storageObjectId || storageResult.storageObjectId,
          downloadUrl: att.downloadUrl || storageResult.downloadUrl,
        });
      }
    }

    // 4. Create update record first (commit phase)
    const update = await mockProjectUpdateRepository.create({
      ...updateInput,
      attachments: durableAttachments,
    });

    if (!durableAttachments || durableAttachments.length === 0) {
      const updatedNoAtt = await this.updatePublicationStatus(update.id, {
        status: "not_required",
        publishedDocumentIds: [],
        failedAttachments: [],
        lastAttemptedAt: new Date().toISOString(),
      });
      return {
        update: updatedNoAtt ?? update,
        documents: [],
        failures: [],
      };
    }

    // 5. Initial publication state: pending
    await this.updatePublicationStatus(update.id, {
      status: "pending",
      publishedDocumentIds: [],
      failedAttachments: [],
      lastAttemptedAt: new Date().toISOString(),
    });

    // 6. Publish attachments to Drive repository
    const publisherOwner: ProjectDocumentOwner = {
      id: actor.userId,
      name: actor.name,
      avatarUrl: actor.avatarUrl,
    };

    if (!projectDocumentRepository.publishUpdateAttachments) {
      throw new Error("projectDocumentRepository.publishUpdateAttachments is not implemented.");
    }

    const pubResult = await projectDocumentRepository.publishUpdateAttachments({
      projectId: update.projectId,
      updateId: update.id,
      updateType: update.type,
      attachments: durableAttachments,
      publishedBy: publisherOwner,
    });

    const publishedIds = pubResult.documents.map((d) => d.id);
    const totalCount = durableAttachments.length;
    const successCount = pubResult.documents.length;
    const failCount = pubResult.failures.length;

    let pubStatus: ProjectUpdateDocumentPublication["status"] = "pending";
    if (totalCount === 0) {
      pubStatus = "not_required";
    } else if (failCount === 0 && successCount > 0) {
      pubStatus = "published";
    } else if (successCount > 0 && failCount > 0) {
      pubStatus = "partial";
    } else if (successCount === 0 && failCount > 0) {
      pubStatus = "failed";
    }

    const finalUpdate = await this.updatePublicationStatus(update.id, {
      status: pubStatus,
      publishedDocumentIds: publishedIds,
      failedAttachments: pubResult.failures,
      lastAttemptedAt: new Date().toISOString(),
    });

    return {
      update: finalUpdate ?? update,
      documents: pubResult.documents,
      failures: pubResult.failures,
    };
  }

  async retryUpdatePublication(
    updateId: string,
    actor: ProjectUpdateActor,
  ): Promise<CreateAndPublishProjectUpdateResult> {
    if (!actor || !actor.userId) {
      throw new Error("Unauthorized retry attempt.");
    }

    const update = await mockProjectUpdateRepository.getById(updateId);
    if (!update) {
      throw new Error(`Update ${updateId} not found.`);
    }

    const alreadyPublishedIds = update.publishedDocumentIds || [];
    const attachmentsToRetry = (update.attachments || []).filter((att) => {
      // Find if this attachment produced a published document
      return !alreadyPublishedIds.some((pubId) => pubId.includes(att.id));
    });

    if (attachmentsToRetry.length === 0) {
      return {
        update,
        documents: [],
        failures: [],
      };
    }

    const publisherOwner: ProjectDocumentOwner = {
      id: actor.userId,
      name: actor.name,
      avatarUrl: actor.avatarUrl,
    };

    if (!projectDocumentRepository.publishUpdateAttachments) {
      throw new Error("publishUpdateAttachments not available.");
    }

    const pubResult = await projectDocumentRepository.publishUpdateAttachments({
      projectId: update.projectId,
      updateId: update.id,
      updateType: update.type,
      attachments: attachmentsToRetry,
      publishedBy: publisherOwner,
    });

    const newPublishedIds = pubResult.documents.map((d) => d.id);
    const combinedPublishedIds = Array.from(new Set([...alreadyPublishedIds, ...newPublishedIds]));

    const totalCount = (update.attachments || []).length;
    const successCount = combinedPublishedIds.length;
    const failCount = pubResult.failures.length;

    let pubStatus: ProjectUpdateDocumentPublication["status"] = "pending";
    if (totalCount === 0) {
      pubStatus = "not_required";
    } else if (failCount === 0 && successCount === totalCount) {
      pubStatus = "published";
    } else if (successCount > 0) {
      pubStatus = "partial";
    } else if (failCount > 0) {
      pubStatus = "failed";
    }

    const updated = await this.updatePublicationStatus(update.id, {
      status: pubStatus,
      publishedDocumentIds: combinedPublishedIds,
      failedAttachments: pubResult.failures,
      lastAttemptedAt: new Date().toISOString(),
    });

    return {
      update: updated ?? update,
      documents: pubResult.documents,
      failures: pubResult.failures,
    };
  }

  private async updatePublicationStatus(
    updateId: string,
    publication: ProjectUpdateDocumentPublication,
  ): Promise<ProjectUpdate | null> {
    const update = await mockProjectUpdateRepository.getById(updateId);
    if (!update) return null;

    const updated: ProjectUpdate = {
      ...update,
      publishedDocumentIds: publication.publishedDocumentIds,
      documentPublication: publication,
      updatedAt: new Date().toISOString(),
    };

    // Update in mock repository store
    const store = (mockProjectUpdateRepository as unknown as { updatesStore: ProjectUpdate[] }).updatesStore;
    if (store) {
      const idx = store.findIndex((u) => u.id === updateId);
      if (idx !== -1) {
        store[idx] = updated;
      }
    }

    return updated;
  }
}

export const projectUpdatePublishingService = new ProjectUpdatePublishingService();
