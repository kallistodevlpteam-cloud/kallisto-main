import type { BackendProject } from "@/types/domain/backend-project";
import type { SampleProjectCard } from "../components/projects-cards-grid";

/** Accepted project character: the enquiry was accepted and the project
 * entered the provider project pipeline (projects.project_character). */
export const PROJECT_CHARACTER_PR = "pr";

/** Backend projects have no recorded phase yet; the pill label is derived
 * from the authoritative project_character value ('pr' = accepted and in
 * the provider pipeline), not from any client-provided or mocked value. */
export const ACCEPTED_PROJECT_PHASE_LABEL = "In progress";

/** Accepted projects have no recorded status yet; the tab placement is
 * derived from the authoritative project_character value ('pr' = enquiry
 * accepted, queued for kickoff) and renders under the Upcoming tab, like
 * the approved reference card. */
export const ACCEPTED_PROJECT_STATUS = "UPCOMING" as const;

/**
 * Builds project cards purely from the backend project list
 * (project_character = 'pr').
 *
 * Only fields the projects query returns are mapped onto the card: project
 * name, project type, site place (project_site), linked client name
 * (client_details) and media (cover image first from projects.cover_image_url,
 * then site images, then inspiration images). Health, progress, due-date and
 * next-action fields have no backend source and are left unset so the card
 * never fabricates "On track", "0%" or due/next-action claims.
 */
export function buildProjectCardsFromBackend(
  projects: BackendProject[]
): SampleProjectCard[] {
  return projects.map((project) => ({
    id: `prj-${project.id}`,
    name: project.projectName.trim(),
    code: "",
    type: project.projectType ?? "Project",
    location: project.place ?? "—",
    clientDisplayName: project.clientName ?? "Client",
    phase:
      project.projectCharacter === PROJECT_CHARACTER_PR
        ? ACCEPTED_PROJECT_PHASE_LABEL
        : null,
    status: project.projectStatus
      ? (() => {
          const s = project.projectStatus.toUpperCase();
          if (s === "ACTIVE") return "ACTIVE";
          if (s === "UPCOMING") return "UPCOMING";
          if (s === "ON_HOLD" || s === "ON-HOLD") return "ON_HOLD";
          if (s === "COMPLETED") return "COMPLETED";
          return ACCEPTED_PROJECT_STATUS;
        })()
      : ACCEPTED_PROJECT_STATUS,
    health: undefined,
    phaseProgress: undefined,
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
  }));
}
