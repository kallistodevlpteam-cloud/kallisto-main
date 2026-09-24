/**
 * Lightweight browser-only store for projects created from accepted proposals.
 * Uses sessionStorage so entries persist across navigation within the same tab session
 * but are cleared when the tab is closed (appropriate for demo/mock data).
 *
 * In production this would be replaced by a Firestore write at proposal-acceptance time.
 */

const STORAGE_KEY = "kallisto_created_projects";

export interface CreatedProject {
  /** Enquiry/project ID from the mock record */
  id: string;
  title: string;
  clientName: string;
  location: string;
  budget: string;
  projectType: string;
  /** ISO timestamp when the proposal was accepted */
  acceptedAt: string;
  thumbnailUrl?: string;
  providerName?: string;
}

export const DEFAULT_CREATED_PROJECTS: CreatedProject[] = [
  {
    id: "proj-skyline-heights",
    title: "Skyline Heights Villa",
    clientName: "Ananya Builders",
    location: "Marine Drive, Kochi",
    budget: "₹1,45,00,000",
    projectType: "Luxury Residential",
    acceptedAt: "2026-09-20T10:00:00.000Z",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=900&auto=format&fit=crop&q=80",
    providerName: "Greenfield Architects",
  },
  {
    id: "proj-verona-residence",
    title: "Verona Luxury Residence",
    clientName: "Ananya Builders",
    location: "Vyttila, Kochi",
    budget: "₹98,00,000",
    projectType: "Contemporary Architecture",
    acceptedAt: "2026-09-22T14:30:00.000Z",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=900&auto=format&fit=crop&q=80",
    providerName: "Studio Nila",
  },
];

function readStore(): CreatedProject[] {
  if (typeof window === "undefined") return DEFAULT_CREATED_PROJECTS;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_CREATED_PROJECTS));
      return DEFAULT_CREATED_PROJECTS;
    }
    const parsed = JSON.parse(raw) as CreatedProject[];
    if (!Array.isArray(parsed) || parsed.length === 0) {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_CREATED_PROJECTS));
      return DEFAULT_CREATED_PROJECTS;
    }
    const missingDefaults = DEFAULT_CREATED_PROJECTS.filter(
      (def) => !parsed.some((p) => p.id === def.id)
    );
    if (missingDefaults.length > 0) {
      const merged = [...parsed, ...missingDefaults];
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      return merged;
    }
    return parsed;
  } catch {
    return DEFAULT_CREATED_PROJECTS;
  }
}

function writeStore(projects: CreatedProject[]): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  } catch {
    // ignore storage quota errors
  }
}

/** Persist an accepted proposal as a created project entry. Idempotent by id. */
export function recordAcceptedProject(project: CreatedProject): void {
  const existing = readStore();
  const already = existing.some((p) => p.id === project.id);
  if (!already) {
    writeStore([project, ...existing]);
  }
}

/** Return all created projects in newest-first order. */
export function getCreatedProjects(): CreatedProject[] {
  return readStore();
}

/** Subscribe to storage changes (cross-component within same tab via custom event). */
export function subscribeToCreatedProjects(
  callback: (projects: CreatedProject[]) => void
): () => void {
  const handler = () => callback(readStore());
  window.addEventListener("kallisto_projects_updated", handler);
  return () => window.removeEventListener("kallisto_projects_updated", handler);
}

/** Emit change event so subscribers re-render. */
export function notifyCreatedProjectsChanged(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event("kallisto_projects_updated"));
}
