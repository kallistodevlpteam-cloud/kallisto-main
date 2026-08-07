import {
  CreateStudioTaskCommand,
  StudioApproval,
  StudioAuditEvent,
  StudioComment,
  StudioOutputVersion,
  StudioProjectOption,
  StudioPublishRecord,
  StudioTask,
  StudioTaskStatus,
  StudioValidationIssue,
} from "@/types/domain/studio";
import { IStudioRepository } from "@/services/repositories/studio-repository";
import { StudioPermissions } from "./studio-permissions";
import { StudioPublishingService } from "./studio-publishing";
import { StudioStatusMachine } from "./studio-status-machine";
import { StudioValidationService } from "./studio-validation";
import { StudioVersionService } from "./studio-version-service";

export class StudioService {
  private repository: IStudioRepository;
  private idempotencyCache: Map<string, { task: StudioTask; version: StudioOutputVersion }> = new Map();

  constructor(repository: IStudioRepository) {
    this.repository = repository;
  }

  async createStudioTask(
    command: CreateStudioTaskCommand,
    userRole: string = "architect",
    userName: string = "Lead Architect"
  ): Promise<{ task: StudioTask; version: StudioOutputVersion }> {
    // 1. Permission check
    StudioPermissions.assertPermission(userRole, "create", command.workspaceType);

    // 2. Idempotency check
    if (command.idempotencyKey) {
      const cached = this.idempotencyCache.get(command.idempotencyKey);
      if (cached) {
        return cached;
      }
    }

    // 3. Resolve project snapshot from backend
    const project: StudioProjectOption | null = await this.repository.getProjectById(command.projectId);
    if (!project) {
      throw new Error(`Project with ID '${command.projectId}' not found.`);
    }

    // 4. System-generated task metadata (never trust UI)
    const now = new Date().toISOString();
    const taskId = `stask-${command.workspaceType}-${Date.now()}`;
    const initialStatus: StudioTaskStatus = "draft";

    const task: StudioTask = {
      id: taskId,
      workspaceId: command.workspaceId,
      projectId: project.id,
      projectCode: project.code,
      projectName: project.name,
      workspaceType: command.workspaceType,
      useCase: command.useCase,
      startMethod: command.startMethod,
      status: initialStatus,
      ownerId: command.createdByUserId,
      ownerName: userName,
      createdByAgent: command.createdByAgent,
      createdAt: now,
      updatedAt: now,
    };

    // 5. System-generated initial version V01
    const version: StudioOutputVersion = StudioVersionService.createNewVersion(
      taskId,
      project.id,
      1,
      command.configuration,
      command.sourceInputs,
      command.createdByUserId
    );

    task.currentVersionId = version.id;

    // 6. Persist task & version via repository
    await this.repository.saveTask(task, version);

    // 7. Audit record
    const auditEvent: StudioAuditEvent = {
      id: `audit-${taskId}-created`,
      taskId,
      action: "TASK_CREATED",
      actorId: command.createdByUserId,
      actorName: userName,
      timestamp: now,
      details: `Created ${command.workspaceType} task for ${project.name} via ${command.createdByAgent ? "agent guidance" : "direct workspace setup"}.`,
    };
    await this.repository.addAuditEvent(auditEvent);

    const result = { task, version };
    if (command.idempotencyKey) {
      this.idempotencyCache.set(command.idempotencyKey, result);
    }
    return result;
  }

  async transitionTaskStatus(
    taskId: string,
    targetStatus: StudioTaskStatus,
    userId: string,
    userRole: string,
    userName: string
  ): Promise<StudioTask> {
    const task = await this.repository.getTaskById(taskId);
    if (!task) {
      throw new Error(`Task '${taskId}' not found.`);
    }

    // Check transition validity
    StudioStatusMachine.validateTransition(task.status, targetStatus);

    // Permission checks
    if (targetStatus === "approved" || targetStatus === "changes_requested") {
      StudioPermissions.assertPermission(userRole, "approve", task.workspaceType);
    } else if (targetStatus === "published") {
      StudioPermissions.assertPermission(userRole, "publish", task.workspaceType);
    }

    const previousStatus = task.status;
    task.status = targetStatus;
    task.updatedAt = new Date().toISOString();

    await this.repository.updateTask(task);

    // Audit transition
    await this.repository.addAuditEvent({
      id: `audit-${taskId}-status-${Date.now()}`,
      taskId,
      action: "STATUS_TRANSITION",
      actorId: userId,
      actorName: userName,
      timestamp: task.updatedAt,
      details: `Status transitioned from '${previousStatus}' to '${targetStatus}'.`,
    });

    return task;
  }

  async createNewRevision(
    taskId: string,
    userId: string,
    userRole: string,
    userName: string
  ): Promise<StudioOutputVersion> {
    StudioPermissions.assertPermission(userRole, "create_revisions");

    const task = await this.repository.getTaskById(taskId);
    if (!task) {
      throw new Error(`Task '${taskId}' not found.`);
    }

    const currentVersion = await this.repository.getLatestTaskVersion(taskId);
    if (!currentVersion) {
      throw new Error(`No existing version found for task '${taskId}'.`);
    }

    const newVersionNumber = currentVersion.versionNumber + 1;
    const newVersion = StudioVersionService.createNewVersion(
      taskId,
      task.projectId,
      newVersionNumber,
      currentVersion.configurationSnapshot,
      [],
      userId,
      currentVersion.id
    );

    // Mark previous as superseded if published
    if (currentVersion.publishRecord) {
      currentVersion.supersededByVersionId = newVersion.id;
      await this.repository.saveVersion(currentVersion);
    }

    await this.repository.saveVersion(newVersion);

    task.currentVersionId = newVersion.id;
    task.status = "draft";
    task.updatedAt = new Date().toISOString();
    await this.repository.updateTask(task);

    await this.repository.addAuditEvent({
      id: `audit-${taskId}-rev-${Date.now()}`,
      taskId,
      action: "REVISION_CREATED",
      actorId: userId,
      actorName: userName,
      timestamp: task.updatedAt,
      details: `Spawned new revision ${newVersion.versionLabel} from ${currentVersion.versionLabel}.`,
    });

    return newVersion;
  }

  async publishTaskOutput(
    taskId: string,
    userId: string,
    userRole: string,
    userName: string,
    idempotencyKey: string
  ): Promise<StudioPublishRecord> {
    StudioPermissions.assertPermission(userRole, "publish");

    const task = await this.repository.getTaskById(taskId);
    if (!task) {
      throw new Error(`Task '${taskId}' not found.`);
    }

    const version = await this.repository.getLatestTaskVersion(taskId);
    if (!version) {
      throw new Error(`Version not found for task '${taskId}'.`);
    }

    const publishRecord = StudioPublishingService.publishVersion(
      version,
      task.projectId,
      userId,
      userName,
      idempotencyKey
    );

    version.publishRecord = publishRecord;
    await this.repository.saveVersion(version);

    if (task.status !== "published") {
      task.status = "published";
      task.updatedAt = new Date().toISOString();
      await this.repository.updateTask(task);
    }

    await this.repository.addAuditEvent({
      id: `audit-${taskId}-pub-${Date.now()}`,
      taskId,
      action: "OUTPUT_PUBLISHED",
      actorId: userId,
      actorName: userName,
      timestamp: new Date().toISOString(),
      details: `Published version ${version.versionLabel} to project ${task.projectCode}. Document ref: ${publishRecord.documentRef}.`,
    });

    return publishRecord;
  }

  async validateTask(taskId: string): Promise<StudioValidationIssue[]> {
    const version = await this.repository.getLatestTaskVersion(taskId);
    if (!version) {
      return [];
    }
    return StudioValidationService.validateTaskConfiguration(version.configurationSnapshot);
  }
}
