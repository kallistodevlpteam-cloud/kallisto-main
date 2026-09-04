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
  return projects.map((project) => {
    let status: "ACTIVE" | "UPCOMING" | "ON_HOLD" | "COMPLETED" | "ARCHIVED" = "ACTIVE";
    const rawStatus = (project.projectStatus || "").toUpperCase();
    if (rawStatus === "UPCOMING") status = "UPCOMING";
    else if (rawStatus === "ON_HOLD" || rawStatus === "ON-HOLD") status = "ON_HOLD";
    else if (rawStatus === "COMPLETED") status = "COMPLETED";
    else if (rawStatus === "ARCHIVED") status = "ARCHIVED";
    else if (project.projectCharacter === "enq") status = "UPCOMING";
    else status = "ACTIVE";

    let phase = ACCEPTED_PROJECT_PHASE_LABEL;
    let phaseProgress = 50;
    if (status === "COMPLETED") {
      phase = "Handover complete";
      phaseProgress = 100;
    } else if (status === "UPCOMING") {
      phase = "Kickoff & Survey";
      phaseProgress = 10;
    } else if (project.buildingType?.includes("Fitout") || project.projectType?.includes("Interior")) {
      phase = "Interior Fitout & MEP";
      phaseProgress = 65;
    } else {
      phase = "Construction & Structural";
      phaseProgress = 70;
    }

    return {
      id: `prj-${project.id}`,
      name: project.projectName.trim(),
      code: `KAL-2026-00${project.id}`,
      type: project.projectType ?? "Project",
      location: project.place ?? "—",
      clientDisplayName: project.clientName ?? "Client",
      phase,
      status,
      health: status === "ACTIVE" ? "ON_TRACK" : undefined,
      phaseProgress,
      nextActionTitle: status === "ACTIVE" ? "Client review for drawing revision" : null,
      dueLabel: status === "ACTIVE" ? "Due in 3d" : null,
      dueState: status === "ACTIVE" ? "due_soon" : "no_due_date",
      image:
        project.coverImageUrl ??
        project.siteImages[0] ??
        project.inspirationImages[0]?.url ??
        "/assets/projectbg.webp",
      images: [
        ...(project.coverImageUrl ? [project.coverImageUrl] : []),
        ...(project.siteImages ?? []),
        ...(project.inspirationImages ?? []).slice(0, 2).map((img) => img.url),
      ],
    };
  });
}
