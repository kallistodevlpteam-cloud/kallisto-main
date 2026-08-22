import type { BackendProject } from "@/types/domain/backend-project";
import type { SampleProjectCard } from "../components/projects-cards-grid";
import type { ProjectStatus } from "../types/project.types";

/** Accepted project character: the enquiry was accepted and the project
 * entered the provider project pipeline (projects.project_character). */
export const PROJECT_CHARACTER_PR = "pr";

/** Phase label shown for upcoming / accepted projects awaiting kickoff. */
export const ACCEPTED_PROJECT_PHASE_LABEL = "Accepted — awaiting kickoff";

/** Backend project_status values mapped to frontend ProjectStatus tabs. */
function mapBackendStatusToTab(backendStatus: string | null | undefined): ProjectStatus {
  const status = (backendStatus ?? "").toLowerCase().trim();
  switch (status) {
    case "active":
    case "converted":
      return "ACTIVE";
    case "on-hold":
    case "paused":
      return "ON_HOLD";
    case "completed":
    case "done":
    case "closed":
      return "COMPLETED";
    case "upcoming":
    default:
      return "UPCOMING";
  }
}

/**
 * Builds project cards purely from the backend project list
 * (project_character = 'pr').
 *
 * Maps the authoritative backend project_status to the correct frontend tab
 * (ACTIVE / UPCOMING / ON_HOLD / COMPLETED) so accepted projects progress
 * through the pipeline as their real status changes.
 */
export function buildProjectCardsFromBackend(
  projects: BackendProject[]
): SampleProjectCard[] {
  return projects.map((project) => {
    const tabStatus = mapBackendStatusToTab(project.projectStatus);
    const phaseLabel = tabStatus === "ACTIVE"
      ? "In progress"
      : tabStatus === "COMPLETED"
        ? "Completed"
        : tabStatus === "ON_HOLD"
          ? "On hold"
          : "Accepted — awaiting kickoff";

    return {
      id: `prj-${project.id}`,
      name: project.projectName.trim(),
      code: "",
      type: project.projectType ?? "Project",
      location: project.place ?? "—",
      clientDisplayName: project.clientName ?? "Client",
      phase: phaseLabel,
      status: tabStatus,
      health: undefined,
      phaseProgress: project.completionPercent ?? undefined,
      nextActionTitle: null,
      dueLabel: null,
      dueState: "no_due_date",
      image:
        project.coverImageUrl ??
        project.siteImages[0] ??
        project.inspirationImages[0]?.url ??
        "",
      images: [
        ...(project.coverImageUrl ? [project.coverImageUrl] : []),
        ...(project.siteImages ?? []),
        ...(project.inspirationImages ?? []).slice(0, 2).map((img) => img.url),
      ],
    };
  });
}
