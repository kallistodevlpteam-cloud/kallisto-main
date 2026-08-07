"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { StudioProjectOption } from "@/types/domain/studio";
import { StudioMockRepository } from "@/services/repositories/studio-mock-repository";

import { MOCK_ENQUIRIES } from "@/features/enquiries/services/enquiries.mock";

export interface UseStudioProjectContextReturn {
  projects: StudioProjectOption[];
  selectedProjectId: string | null;
  selectedProject: StudioProjectOption | null;
  projectLoading: boolean;
  selectProject: (projectId: string) => void;
}

export function useStudioProjectContext(): UseStudioProjectContextReturn {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [projects, setProjects] = useState<StudioProjectOption[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [projectLoading, setProjectLoading] = useState<boolean>(true);

  // Load available projects
  useEffect(() => {
    let isMounted = true;

    const enquiryId = searchParams.get("enquiryId");
    if (enquiryId) {
      const enquiry = MOCK_ENQUIRIES.find((e) => e.id === enquiryId) || MOCK_ENQUIRIES[0];
      const enquiryProject: StudioProjectOption = {
        id: enquiry.id,
        workspaceId: "ws-enquiry",
        code: enquiry.enquiryRef || "ENQ-2026-01",
        name: enquiry.title || "Villa Design Consultation",
        projectType: enquiry.projectType === "residential" ? "Residential Interior" : "Commercial Interior",
        phase: "Proposal",
        location: enquiry.location || "Kochi",
        status: "active",
      };

      if (isMounted) {
        setProjects((prev) => {
          const filtered = prev.filter((p) => p.id !== enquiryProject.id);
          return [enquiryProject, ...filtered];
        });
        setSelectedProjectId(enquiryProject.id);
        setProjectLoading(false);
      }
      return () => {
        isMounted = false;
      };
    }

    const repository = new StudioMockRepository();
    repository
      .getProjects()
      .then((data) => {
        if (isMounted) {
          setProjects(data);
          // Check URL param first
          const urlProject = searchParams.get("project");
          if (urlProject && data.some((p) => p.id === urlProject)) {
            setSelectedProjectId(urlProject);
          } else if (data.length > 0 && !selectedProjectId) {
            // Default to first project if available
            setSelectedProjectId(data[0].id);
          }
          setProjectLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setProjectLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [searchParams]);

  const selectProject = useCallback(
    (projectId: string) => {
      setSelectedProjectId(projectId);

      // Sync URL selectively
      const current = new URLSearchParams(Array.from(searchParams.entries()));
      if (projectId) {
        current.set("project", projectId);
      } else {
        current.delete("project");
      }
      const search = current.toString();
      const query = search ? `?${search}` : "";
      router.replace(`${pathname}${query}`, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  const selectedProject = projects.find((p) => p.id === selectedProjectId) || null;

  return {
    projects,
    selectedProjectId,
    selectedProject,
    projectLoading,
    selectProject,
  };
}
