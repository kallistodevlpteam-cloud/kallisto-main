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

function readStore(): CreatedProject[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CreatedProject[]) : [];
  } catch {
    return [];
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
