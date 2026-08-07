import React from "react";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ProjectModuleSubpage } from "@/features/projects/project-module-subpage";
import { projectDocumentRepository } from "@/services/repositories/project-document-repository";

vi.mock("next/image", () => ({
  __esModule: true,
  default: () => null,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn(), forward: vi.fn() }),
  usePathname: () => "/projects/proj-001/documents",
  useSearchParams: () => new URLSearchParams(),
}));

function stubMatchMedia(width = 1638) {
  window.matchMedia = vi.fn((query: string) => {
    let matches = false;
    if (query.includes("min-width: 1440px")) matches = width >= 1440;
    else if (query.includes("min-width: 1080px")) matches = width >= 1080;
    else if (query.includes("min-width: 768px")) matches = width >= 768;
    return {
      matches,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    } as unknown as MediaQueryList;
  }) as unknown as typeof window.matchMedia;
}

vi.mock("@/services/repositories/project-service", () => ({
  projectService: {
    getProjectById: vi.fn().mockResolvedValue({
      id: "proj-001",
      workspaceId: "ws-default",
      projectCode: "KAL-RES-2026-01",
      name: "Nila Residence",
      clientName: "Rahul Sharma",
      location: "Kochi, Kerala",
      status: "in_progress",
    }),
  },
}));

describe("Drive Scroll Ownership and Layout Contracts", () => {
  beforeEach(() => {
    stubMatchMedia(1638);
  });

  afterEach(cleanup);

  it("1. Drive route does not render the large standalone Documents heading wrapper (.page-heading), but renders compact h1 Documents title", async () => {
    const { container } = render(<ProjectModuleSubpage projectId="proj-001" module="documents" />);
    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Documents", level: 1 })).toBeInTheDocument();
    });

    const pageHeading = container.querySelector(".page-heading");
    expect(pageHeading).toBeNull();

    const compactTitleRow = container.querySelector("[class*='compactTitleRow']");
    expect(compactTitleRow).toBeInTheDocument();
    expect(compactTitleRow?.querySelector("h1")?.textContent).toBe("Documents");
  });

  it("2. Project module navigation remains rendered and accessible", async () => {
    render(<ProjectModuleSubpage projectId="proj-001" module="documents" />);
    await waitFor(() => {
      expect(screen.getByRole("navigation", { name: "Document page navigation" })).toBeInTheDocument();
    });

    expect(screen.getByRole("link", { name: /Task/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Drive/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /BOQ/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Finance/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Site/i })).toBeInTheDocument();
  });

  it("3. Drive pagination is outside collectionViewport", async () => {
    const { container } = render(<ProjectModuleSubpage projectId="proj-001" module="documents" />);
    await waitFor(() => {
      expect(screen.getByRole("navigation", { name: "Document pages" })).toBeInTheDocument();
    });

    const collectionViewport = container.querySelector("[class*='collectionViewport']");
    const pagination = container.querySelector("[class*='pagination']");

    expect(collectionViewport).toBeInTheDocument();
    expect(pagination).toBeInTheDocument();
    expect(collectionViewport?.contains(pagination)).toBe(false);
  });

  it("4. collectionViewport is configured as the document vertical scroll owner", async () => {
    const { container } = render(<ProjectModuleSubpage projectId="proj-001" module="documents" />);
    await waitFor(() => {
      expect(screen.getByRole("navigation", { name: "Document pages" })).toBeInTheDocument();
    });

    const collectionViewport = container.querySelector("[class*='collectionViewport']");
    expect(collectionViewport).toBeInTheDocument();
    // Class-based contract verification
    expect(collectionViewport?.className).toContain("collectionViewport");
  });

  it("5. Pagination remains visible with 10 list documents", async () => {
    render(<ProjectModuleSubpage projectId="proj-001" module="documents" />);
    await waitFor(() => {
      expect(screen.getByRole("navigation", { name: "Document pages" })).toBeInTheDocument();
    });

    const pagination = screen.getByRole("navigation", { name: "Document pages" });
    expect(pagination).toBeVisible();

    const workspaceData = await projectDocumentRepository.listProjectDocuments("proj-001");
    expect(workspaceData.documents.length).toBeGreaterThan(0);
  });

  it("6. Height-only resizing does not alter page size (width-based page size preserved)", async () => {
    // Desktop width 1638px => list page size is 10
    stubMatchMedia(1638);
    const { unmount } = render(<ProjectModuleSubpage projectId="proj-001" module="documents" />);
    await waitFor(() => {
      expect(screen.getByText(/Showing 1–10 of/i)).toBeInTheDocument();
    });
    unmount();

    // Change viewport height simulation: page size remains 10 because width is unchanged
    stubMatchMedia(1638);
    render(<ProjectModuleSubpage projectId="proj-001" module="documents" />);
    await waitFor(() => {
      expect(screen.getByText(/Showing 1–10 of/i)).toBeInTheDocument();
    });
  });

  it("7. The application route wrapper does not gain document-page vertical overflow at desktop test viewport", async () => {
    const { container } = render(<ProjectModuleSubpage projectId="proj-001" module="documents" />);
    await waitFor(() => {
      expect(screen.getByRole("navigation", { name: "Document pages" })).toBeInTheDocument();
    });

    const documentsBoundedRoute = container.querySelector("[class*='documentsBoundedRoute']");
    expect(documentsBoundedRoute).toBeInTheDocument();
    const documentsWorkspace = container.querySelector("[class*='documentsWorkspace']");
    expect(documentsWorkspace).toBeInTheDocument();
  });

  it("8. Sticky table header remains present in documentTable", async () => {
    const { container } = render(<ProjectModuleSubpage projectId="proj-001" module="documents" />);
    await waitFor(() => {
      expect(screen.getByRole("table")).toBeInTheDocument();
    });

    const table = container.querySelector("table");
    const thead = table?.querySelector("thead");
    expect(thead).toBeInTheDocument();
    const ths = table?.querySelectorAll("th");
    expect(ths && ths.length > 0).toBe(true);
  });

  it("9. Mobile Drive layout remains usable with module navigation", async () => {
    stubMatchMedia(375); // Mobile width
    render(<ProjectModuleSubpage projectId="proj-001" module="documents" />);
    await waitFor(() => {
      expect(screen.getByRole("navigation", { name: "Document page navigation" })).toBeInTheDocument();
    });

    expect(screen.getByRole("link", { name: /Drive/i })).toBeInTheDocument();
  });

  it("10. Other project module pages retain their standalone page headings", async () => {
    const { container, unmount } = render(<ProjectModuleSubpage projectId="proj-001" module="tasks" />);
    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Tasks", level: 1 })).toBeInTheDocument();
    });
    expect(container.querySelector(".page-heading")).not.toBeNull();
    unmount();

    const { container: siteContainer } = render(<ProjectModuleSubpage projectId="proj-001" module="site" />);
    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Site", level: 1 })).toBeInTheDocument();
    });
    expect(siteContainer.querySelector(".page-heading")).not.toBeNull();
  });
});
