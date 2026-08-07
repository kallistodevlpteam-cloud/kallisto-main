import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { createMockProjectBoq } from "@/features/projects/boq/data/mock-project-boq";
import { ProjectBoqWorkspace } from "@/features/projects/boq/components/project-boq-workspace";
import { MemoryProjectBoqRepository } from "@/features/projects/boq/repositories/memory-project-boq.repository";
import { createProjectBoqService } from "@/features/projects/boq/services/project-boq.service";
import { Project } from "@/types/domain/project";

const project: Project = {
  id: "proj-001",
  workspaceId: "ws-default",
  clientId: "client-001",
  name: "Nila Residence",
  projectCode: "KAL-2024-001",
  projectType: "Luxury Residential Villa",
  status: "active",
  phase: "Construction",
  ownerId: "user-current",
  ownerName: "Arjun Mehta",
  location: "Kochi, Kerala",
  nextRequiredAction: "Review BOQ",
  createdAt: "2026-06-01T10:00:00.000Z",
  updatedAt: "2026-07-26T09:30:00.000Z",
};

function renderWorkspace() {
  const snapshot = createMockProjectBoq(
    project.id,
    project.name,
    project.projectCode
  );
  const service = createProjectBoqService(
    new MemoryProjectBoqRepository(snapshot)
  );

  return render(<ProjectBoqWorkspace project={project} service={service} />);
}

afterEach(() => {
  cleanup();
  window.history.replaceState({}, "", "/");
});

describe("ProjectBoqWorkspace (3-Level View-Only Inspection SVG Matching)", () => {
  it("renders SVG title line and Hive Studio button without View Only pill or Add Item button", async () => {
    renderWorkspace();

    expect(await screen.findByText("Draft")).toBeInTheDocument();
    expect(screen.queryByText("View only")).not.toBeInTheDocument();

    const hiveStudioLink = screen.getByRole("link", {
      name: "Open this BOQ in Hive Studio",
    });
    expect(hiveStudioLink).toBeInTheDocument();
    expect(hiveStudioLink).toHaveAttribute(
      "href",
      "/studio?projectId=proj-001&intent=build-boq&versionId=version-1-2"
    );

    expect(screen.queryByRole("button", { name: "Add Item" })).not.toBeInTheDocument();
  });

  it("renders 3-level hierarchy: major section lavender row, neutral subsection row, work items, and table footer", async () => {
    renderWorkspace();
    await screen.findByText("Bathroom Demolition of Existing Fixtures & Finishes");

    // Major Section Phase 1
    expect(screen.getByText("Phase 1")).toBeInTheDocument();
    expect(screen.getByText("DEMOLITION & REMOVAL WORKS (Pre-Fit-Out Stage)")).toBeInTheDocument();

    // Subsection P1.01
    expect(screen.getByText("P1.01")).toBeInTheDocument();
    expect(screen.getByText("Bathroom Demolition of Existing Fixtures & Finishes")).toBeInTheDocument();

    // Item code in subsection
    const row = document.querySelector('tr[data-item-code="P1.01.01"]');
    expect(row).not.toBeNull();
    expect(within(row as HTMLElement).getByText("P1.01.01")).toBeInTheDocument();

    // Footer counts
    const footer = document.querySelector("footer");
    expect(footer?.textContent).toContain("Showing 16 loaded items across 4 sections and 5 subsections");
    expect(screen.getByText("No items selected")).toBeInTheDocument();
  });

  it("renders non-interactive quantities and rates without inline editing", async () => {
    renderWorkspace();
    await screen.findByText("Bathroom Demolition of Existing Fixtures & Finishes");

    expect(screen.queryByRole("button", { name: "Edit quantity for P1.01.01" })).not.toBeInTheDocument();

    const row = document.querySelector('tr[data-item-code="P1.01.01"]');
    expect(row).not.toBeNull();
    fireEvent.click(within(row as HTMLElement).getByText("750"));

    expect(screen.queryByRole("textbox", { name: /Edit/i })).not.toBeInTheDocument();
  });

  it("renders workspace items and export action", async () => {
    renderWorkspace();
    await screen.findByText("Bathroom Demolition of Existing Fixtures & Finishes");

    expect(screen.getByRole("button", { name: "Export" })).toBeInTheDocument();
    expect(screen.getByText("No items selected")).toBeInTheDocument();
  });

  it("opens staged import preview modal without mutating BOQ data", async () => {
    renderWorkspace();
    await screen.findByText("Bathroom Demolition of Existing Fixtures & Finishes");

    const file = new File(
      ["Section Code,Section Title,Subsection Code,Subsection Title,Item Code,Description,Unit,Quantity,Rate\nPhase 1,Demo,P1.01,Bath,P1.01.01,test,m²,1,100"],
      "boq-sample.csv",
      { type: "text/csv" }
    );

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(fileInput, { target: { files: [file] } });

    expect(
      await screen.findByRole("heading", { name: "Import BOQ Staging Preview" })
    ).toBeInTheDocument();
    expect(screen.getByText("boq-sample.csv")).toBeInTheDocument();

    const continueLink = screen.getByRole("link", { name: /Continue in Hive Studio/i });
    expect(continueLink).toHaveAttribute(
      "href",
      "/studio?projectId=proj-001&intent=import-boq&versionId=version-1-2"
    );

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(screen.queryByRole("heading", { name: "Import BOQ Staging Preview" })).not.toBeInTheDocument();
  });

  it("supports filtering using real item code, inspector context, and versions view", async () => {
    renderWorkspace();
    await screen.findByText("Bathroom Demolition of Existing Fixtures & Finishes");

    // Search by real item code P1.01.01
    fireEvent.change(
      screen.getByRole("searchbox", { name: "Search BOQ items" }),
      { target: { value: "P1.01.01" } }
    );
    expect(screen.getByText(/Demolish & remove existing wall tile \/ dado/i)).toBeInTheDocument();

    fireEvent.change(
      screen.getByRole("searchbox", { name: "Search BOQ items" }),
      { target: { value: "" } }
    );

    // Toggle Item Details by clicking item description
    fireEvent.click(screen.getAllByText(/Demolish & remove existing wall tile \/ dado/i)[0]);
    expect(screen.getByText(/Carefully Break And Remove Existing Ceramic\/Vitrified Wall Tile Dado/i)).toBeInTheDocument();

    // Versions View
    fireEvent.click(screen.getByRole("button", { name: "Versions" }));
    expect(
      screen.getByRole("heading", { name: "Version Governance" })
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "View version" })).toBeInTheDocument();
  });

  it("renders tableScroller as internal scroll owner with viewArea container", async () => {
    renderWorkspace();
    await screen.findByText("Bathroom Demolition of Existing Fixtures & Finishes");

    const scroller = document.querySelector('[class*="tableScroller"]');
    expect(scroller).not.toBeNull();

    const viewArea = document.querySelector('[class*="viewArea"]');
    expect(viewArea).not.toBeNull();

    const sectionRow = document.querySelector('[class*="sectionHierarchyRow"]');
    expect(sectionRow).not.toBeNull();
    // Verify inline CSS variable for dynamic trailing column alignment
    expect((sectionRow as HTMLElement).style.getPropertyValue("--boq-trailing-width")).toBe("388px");
  });

  it("supports collapsing and expanding sections smoothly", async () => {
    renderWorkspace();
    await screen.findByText("Bathroom Demolition of Existing Fixtures & Finishes");

    // Collapse Phase 1
    const collapseBtn = screen.getByRole("button", { name: "Collapse Phase 1" });
    fireEvent.click(collapseBtn);

    // Section item should not be visible when collapsed
    expect(screen.queryByText("P1.01.01")).not.toBeInTheDocument();

    // Expand Phase 1
    const expandBtn = screen.getByRole("button", { name: "Expand Phase 1" });
    fireEvent.click(expandBtn);

    // Section item visible again
    expect(screen.getByText("P1.01.01")).toBeInTheDocument();
  });
});

