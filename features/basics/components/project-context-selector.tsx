"use client";

import { Building2, Plus } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { BasicsProjectContext } from "../types/basics.types";
import styles from "./basics-workspace.module.css";

export function ProjectContextSelector({
  projects,
}: {
  projects: BasicsProjectContext[];
}) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = searchParams.get("projectId") ?? "";
  const selected = projects.find((project) => project.id === projectId);

  function updateProject(nextProjectId: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (nextProjectId) params.set("projectId", nextProjectId);
    else params.delete("projectId");
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  return (
    <div className={styles.contextRow}>
      <span className={styles.contextIcon}>
        <Building2 size={15} aria-hidden="true" />
      </span>
      <span className={styles.contextCopy}>
        <span>Hiring for</span>
        <strong>{selected?.name ?? "No project selected"}</strong>
      </span>
      <label>
        <span className="sr-only">Select project context</span>
        <select
          className={styles.contextSelect}
          value={projectId}
          onChange={(event) => updateProject(event.target.value)}
        >
          <option value="">Continue without a project</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
      </label>
      <Link className={styles.tertiaryButton} href="/projects?create=true">
        <Plus size={13} aria-hidden="true" />
        Create project
      </Link>
    </div>
  );
}
