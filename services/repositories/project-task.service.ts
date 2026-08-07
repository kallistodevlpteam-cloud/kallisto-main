import {
  ProjectTask,
  ProjectTaskAuthorization,
  TaskAuthorizationInput,
} from "@/types/domain/project-task";
import { projectTaskMockRepository } from "./project-task.mock-repository";
import {
  ChangeProjectTaskStatusInput,
  ChangeProjectTaskVisibilityCommand,
  CreateProjectTaskCommand,
  DeleteProjectTaskCommand,
  ListProjectTasksInput,
  ProjectTaskPage,
  UpdateProjectTaskCommand,
} from "./project-task.repository";
import { mockProjectUpdateRepository } from "./mock-project-update-repository";

export class DefaultProjectTaskAuthorization implements ProjectTaskAuthorization {
  async canViewTask(input: TaskAuthorizationInput): Promise<boolean> {
    if (!input.task) return true;
    if (input.task.visibility === "internal" && input.userRole === "client") {
      return false;
    }
    return true;
  }

  async canCreateTask(): Promise<boolean> {
    return true;
  }

  async canEditTask(): Promise<boolean> {
    return true;
  }

  async canDeleteTask(): Promise<boolean> {
    return true;
  }

  async canChangeStatus(): Promise<boolean> {
    return true;
  }

  async canChangeVisibility(): Promise<boolean> {
    return true;
  }

  async canViewAttachment(): Promise<boolean> {
    return true;
  }
}

export class ProjectTaskService {
  constructor(
    private repository = projectTaskMockRepository,
    private authorization: ProjectTaskAuthorization = new DefaultProjectTaskAuthorization()
  ) {}

  async listTasks(input: ListProjectTasksInput, userId = "user-arjun", userRole = "lead_architect"): Promise<ProjectTaskPage> {
    const page = await this.repository.list(input);
    
    // Filter tasks by authorization
    const filteredGroups = await Promise.all(
      page.groups.map(async (group) => {
        const allowedTasks: ProjectTask[] = [];
        for (const task of group.tasks) {
          const allowed = await this.authorization.canViewTask({
            workspaceId: input.workspaceId,
            projectId: input.projectId,
            userId,
            userRole,
            task,
          });
          if (allowed) allowedTasks.push(task);
        }
        return {
          ...group,
          tasks: allowedTasks,
          totalCount: allowedTasks.length,
        };
      })
    );

    return {
      ...page,
      groups: filteredGroups,
      totalCount: filteredGroups.reduce((acc, g) => acc + g.tasks.length, 0),
    };
  }

  async getTaskById(workspaceId: string, projectId: string, taskId: string): Promise<ProjectTask | null> {
    return this.repository.getById({ workspaceId, projectId, taskId });
  }

  async createTask(command: CreateProjectTaskCommand, actorName = "Arjun Menon"): Promise<ProjectTask> {
    const task = await this.repository.create(command);

    // Atomic outbox event -> Updates feed projection
    await mockProjectUpdateRepository.create({
      projectId: command.projectId,
      authorId: command.actorId,
      authorName: actorName,
      authorRole: "Lead Architect",
      type: "milestone",
      title: `Task Created: ${task.title}`,
      body: `New task added to work package. Target due date: ${task.dueDate || "TBD"}.`,
      visibility: command.visibility === "client_visible" ? "client_visible" : "project_team",
      linkedEntity: {
        type: "task",
        id: task.id,
        title: task.title,
        status: task.status,
      },
    });

    return task;
  }

  async updateTask(command: UpdateProjectTaskCommand): Promise<ProjectTask> {
    return this.repository.update(command);
  }

  async changeTaskStatus(input: ChangeProjectTaskStatusInput, actorName = "Arjun Menon"): Promise<ProjectTask> {
    const updated = await this.repository.changeStatus(input);

    // Event projection for key status changes
    if (input.status === "blocked" || input.status === "completed") {
      await mockProjectUpdateRepository.create({
        projectId: input.projectId,
        authorId: input.actorId,
        authorName: actorName,
        authorRole: "Lead Architect",
        type: input.status === "completed" ? "task_completed" : "issue",
        title: input.status === "completed" ? `Task Completed: ${updated.title}` : `Task Blocked: ${updated.title}`,
        body:
          input.status === "completed"
            ? `Task marked as 100% completed by ${actorName}.`
            : `Task marked as blocked. Reason: ${input.blockerReason}`,
        visibility: updated.visibility === "client_visible" ? "client_visible" : "project_team",
        linkedEntity: {
          type: "task",
          id: updated.id,
          title: updated.title,
          status: updated.status,
        },
      });
    }

    return updated;
  }

  async changeTaskVisibility(command: ChangeProjectTaskVisibilityCommand): Promise<ProjectTask> {
    return this.repository.changeVisibility(command);
  }

  async deleteTask(command: DeleteProjectTaskCommand): Promise<void> {
    return this.repository.delete(command);
  }

  async addChecklistItem(input: Parameters<typeof projectTaskMockRepository.addChecklistItem>[0]) {
    return this.repository.addChecklistItem(input);
  }

  async updateChecklistItem(input: Parameters<typeof projectTaskMockRepository.updateChecklistItem>[0]) {
    return this.repository.updateChecklistItem(input);
  }

  async deleteChecklistItem(input: Parameters<typeof projectTaskMockRepository.deleteChecklistItem>[0]) {
    return this.repository.deleteChecklistItem(input);
  }

  async attachFile(input: Parameters<typeof projectTaskMockRepository.attachFile>[0]) {
    return this.repository.attachFile(input);
  }

  async removeAttachment(input: Parameters<typeof projectTaskMockRepository.removeAttachment>[0]) {
    return this.repository.removeAttachment(input);
  }

  async addDependency(input: Parameters<typeof projectTaskMockRepository.addDependency>[0]) {
    return this.repository.addDependency(input);
  }

  async removeDependency(input: Parameters<typeof projectTaskMockRepository.removeDependency>[0]) {
    return this.repository.removeDependency(input);
  }

  async getWorkPackages(workspaceId: string, projectId: string) {
    return this.repository.getWorkPackages(workspaceId, projectId);
  }
}

export const projectTaskService = new ProjectTaskService();
