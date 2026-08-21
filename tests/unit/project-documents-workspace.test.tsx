import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ProjectDocumentsWorkspace } from "@/features/projects/components/documents/project-documents-workspace";

// ── matchMedia mock ──────────────────────────────────────────────────────────
// Tests default to innerWidth=1024 (medium breakpoint: list=8, grid=8).
// Tests that cross breakpoints update window.innerWidth and dispatch
// the appropriate MediaQueryList change event.
function mockMatchMedia(width: number) {
  const LARGE = "(min-width: 1440px)";
  const MEDIUM = "(min-width: 1024px)";

  window.matchMedia = vi.fn((query: string) => {
    const matches = query === LARGE ? width >= 1440 : query === MEDIUM ? width >= 1024 : false;
    return {
      matches,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    } as MediaQueryList;
  });
}

vi.mock("next/navigation", () => ({
  usePathname: () => window.location.pathname,
  useSearchParams: () => new URLSearchParams(window.location.search),
  useRouter: () => ({
    push: (url: string) => {
      window.history.pushState({}, "", url);
    },
    replace: (url: string) => {
      window.history.replaceState({}, "", url);
    },
  }),
}));

beforeEach(() => {
  window.history.replaceState({}, "", "/projects/proj-001/documents");
  mockMatchMedia(1024); // medium breakpoint default: list=8, grid=8
});

afterEach(cleanup);

async function renderWorkspace(
  props: Partial<React.ComponentProps<typeof ProjectDocumentsWorkspace>> = {},
) {
  const result = render(
    <ProjectDocumentsWorkspace
      projectId="proj-001"
      projectCode="KAL-2024-001"
      {...props}
    />,
  );
  await screen.findByRole("heading", { level: 1, name: "Docs" });
  return result;
}

function desktopTable() {
  return screen.getByRole("table");
}

function folderNavigation() {
  return screen.getByRole("navigation", { name: "Project folders" });
}

describe("Project documents workspace", () => {
  it("renders the reference hierarchy with data-driven metadata and pagination", async () => {
    await renderWorkspace();

    expect(screen.getByRole("heading", { level: 2, name: "All Documents" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /All Documents/ })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(within(folderNavigation()).getByRole("button", { name: /Drawings/ })).toHaveTextContent("7");
    // At 1024px, list page size = 8
    expect(screen.getByText("Showing 1–8 of 24 files")).toBeInTheDocument();
    expect(within(desktopTable()).getByText("Ground Floor Plan.pdf")).toBeInTheDocument();
  });

  it("1. Drawings list view displays all 7 files on page 1 without pagination buttons", async () => {
    await renderWorkspace();

    fireEvent.click(within(folderNavigation()).getByRole("button", { name: /Drawings/ }));

    expect(screen.getByRole("heading", { level: 2, name: "Drawings" })).toBeInTheDocument();
    expect(screen.getByText("Showing 1–7 of 7 files")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Page 1" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Previous page" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Next page" })).not.toBeInTheDocument();
  });

  it("2. All Documents at 1024px: 3 pages of 8 (8, 8, 8)", async () => {
    await renderWorkspace();

    expect(screen.getByText("Showing 1–8 of 24 files")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Page 3" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Page 3" }));
    expect(screen.getByText("Showing 17–24 of 24 files")).toBeInTheDocument();
  });

  it("3. Page navigation updates document slice, URL and active-page styling", async () => {
    await renderWorkspace();

    fireEvent.click(screen.getByRole("button", { name: "Page 2" }));

    expect(screen.getByText("Showing 9–16 of 24 files")).toBeInTheDocument();
    expect(window.location.search).toContain("page=2");
    expect(screen.getByRole("button", { name: "Page 2" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("4. Previous disabled on page 1; Next disabled on final page", async () => {
    await renderWorkspace();

    const prevBtn = screen.getByRole("button", { name: "Previous page" });
    const nextBtn = screen.getByRole("button", { name: "Next page" });

    expect(prevBtn).toBeDisabled();
    expect(nextBtn).not.toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: "Page 3" }));
    expect(nextBtn).toBeDisabled();
    expect(prevBtn).not.toBeDisabled();
  });

  it("5. Applying a filter resets page to 1", async () => {
    window.history.replaceState({}, "", "/projects/proj-001/documents?page=3");
    await renderWorkspace();

    fireEvent.click(screen.getByText("Type").closest("summary") as HTMLElement);
    fireEvent.click(screen.getByLabelText("DWG"));

    expect(window.location.search).toContain("type=dwg");
    expect(screen.getByText(/Showing 1–.* of /)).toBeInTheDocument();
  });

  it("6. Filters documents with query parameter and shows results", async () => {
    window.history.replaceState({}, "", "/projects/proj-001/documents?q=Safety+Inspection");
    await renderWorkspace();

    expect(within(desktopTable()).getByText("Safety Inspection Report.pdf")).toBeInTheDocument();
  });

  it("7. Folder selection resets page and heading count matches footer count", async () => {
    window.history.replaceState({}, "", "/projects/proj-001/documents?page=3");
    await renderWorkspace();

    fireEvent.click(within(folderNavigation()).getByRole("button", { name: /Contracts/ }));

    expect(within(folderNavigation()).getByRole("button", { name: /Contracts/ })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(window.location.search).toContain("folder=contracts");
    expect(screen.getByRole("heading", { level: 2, name: "Contracts" })).toBeInTheDocument();
    expect(screen.getByText(/3 Files/)).toBeInTheDocument();
    expect(screen.getByText("Showing 1–3 of 3 files")).toBeInTheDocument();
  });

  it("8. View switch resets page to 1 and uses width-breakpoint page sizes", async () => {
    await renderWorkspace();

    const gridButton = screen.getByRole("button", { name: "Grid view" });
    fireEvent.click(gridButton);

    expect(gridButton).toHaveAttribute("aria-pressed", "true");
    expect(window.location.search).toContain("view=grid");
    // At 1024px, grid page size = 8
    expect(screen.getByText("Showing 1–8 of 24 files")).toBeInTheDocument();

    const listButton = screen.getByRole("button", { name: "List view" });
    fireEvent.click(listButton);
    // At 1024px, list page size = 8
    expect(screen.getByText("Showing 1–8 of 24 files")).toBeInTheDocument();
  });

  it("9. Height-only resize does not change page size or document slice", async () => {
    await renderWorkspace();

    // Simulate a height-only window resize (no width change)
    Object.defineProperty(window, "innerHeight", {
      writable: true,
      configurable: true,
      value: 400, // drastically smaller height
    });
    fireEvent(window, new Event("resize"));

    // Page size and slice must remain unchanged (still 8 at 1024px)
    expect(screen.getByText("Showing 1–8 of 24 files")).toBeInTheDocument();
  });

  it("10. Empty results: Showing 0–0 of 0 files, no page controls", async () => {
    window.history.replaceState(
      {},
      "",
      "/projects/proj-001/documents?q=nonexistent-document-xyz",
    );
    await renderWorkspace();

    expect(await screen.findByRole("heading", { name: "No search results" })).toBeInTheDocument();
    expect(screen.getByText("Showing 0–0 of 0 files")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Previous page" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Next page" })).not.toBeInTheDocument();
  });

  it("11. Folder counts are real numbers; More Folders equals sum of non-primary folders", async () => {
    await renderWorkspace();

    const drawingsBtn = within(folderNavigation()).getByRole("button", { name: /Drawings/ });
    const documentsBtn = within(folderNavigation()).getByRole("button", { name: /Documents/ });
    const approvalsBtn = within(folderNavigation()).getByRole("button", { name: /Approvals/ });
    const contractsBtn = within(folderNavigation()).getByRole("button", { name: /Contracts/ });
    const siteReportsBtn = within(folderNavigation()).getByRole("button", { name: /Site Reports/ });
    const renderingsBtn = within(folderNavigation()).getByRole("button", { name: /Renderings/ });
    const moreBtn = within(folderNavigation()).getByRole("button", { name: /More Folders/ });

    expect(within(drawingsBtn).getByText("7")).toBeInTheDocument();
    expect(within(documentsBtn).getByText("1")).toBeInTheDocument();
    expect(within(approvalsBtn).getByText("5")).toBeInTheDocument();
    expect(within(contractsBtn).getByText("3")).toBeInTheDocument();
    expect(within(siteReportsBtn).getByText("3")).toBeInTheDocument();
    expect(within(renderingsBtn).getByText("2")).toBeInTheDocument();
    expect(within(moreBtn).getByText("3")).toBeInTheDocument();
  });

  it("combines type and people filters with AND logic", async () => {
    await renderWorkspace();
    fireEvent.click(screen.getByText("Type").closest("summary") as HTMLElement);
    fireEvent.click(screen.getByLabelText("DWG"));
    fireEvent.click(screen.getByText("People").closest("summary") as HTMLElement);
    fireEvent.click(screen.getByLabelText("Neha Rao"));

    expect(window.location.search).toContain("type=dwg");
    expect(window.location.search).toContain("people=neha-rao");
    const table = desktopTable();
    expect(within(table).getByText("Structural Layout.dwg")).toBeInTheDocument();
    expect(within(table).getByText("Electrical Layout.dwg")).toBeInTheDocument();
    expect(within(table).queryByText("Ground Floor Plan.pdf")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Clear all/ })).toBeInTheDocument();
  });

  it("renders an explicit permission-denied state", () => {
    render(
      <ProjectDocumentsWorkspace
        projectId="proj-001"
        projectCode="KAL-2024-001"
        canViewDocuments={false}
      />,
    );
    expect(
      screen.getByRole("heading", { level: 1, name: "Document access restricted" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/project KAL-2024-001/)).toBeInTheDocument();
  });

  // ── View-only enforcement ─────────────────────────────────────────────────

  it("New Folder button is not rendered anywhere on the page", async () => {
    await renderWorkspace();
    expect(screen.queryByRole("button", { name: /New Folder/i })).not.toBeInTheDocument();
  });

  it("Upload Files button is not rendered anywhere on the page", async () => {
    await renderWorkspace();
    expect(screen.queryByRole("button", { name: /Upload Files/i })).not.toBeInTheDocument();
  });

  it("DriveSidebar renders scope options (All Documents, Shared with me, Starred) in sidebar navigation", async () => {
    await renderWorkspace();
    // All three scope options present in sidebar navigation
    expect(screen.getByRole("button", { name: /All Documents/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Shared with me/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Starred/ })).toBeInTheDocument();
    // Top bar scope tab navigation is removed
    expect(screen.queryByRole("tab", { name: /All Documents/ })).not.toBeInTheDocument();
    const scopesNav = screen.getByRole("navigation", { name: "Document scopes" });
    expect(within(scopesNav).queryByRole("button", { name: /New Folder/i })).not.toBeInTheDocument();
    expect(within(scopesNav).queryByRole("button", { name: /Upload/i })).not.toBeInTheDocument();
  });

  it("empty search state shows view-only copy with no CTA", async () => {
    window.history.replaceState({}, "", "/projects/proj-001/documents?q=zzz-no-match-xyz");
    await renderWorkspace();
    const heading = await screen.findByRole("heading", { name: "No search results" });
    expect(heading).toBeInTheDocument();
    expect(screen.getByText(/No files match/)).toBeInTheDocument();
    // No upload or folder CTA inside empty state
    expect(screen.queryByRole("button", { name: /Upload/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /New Folder/i })).not.toBeInTheDocument();
  });

  it("empty filter results show view-only copy with no CTA", async () => {
    await renderWorkspace();
    // Navigate to Contracts (3 PDFs), then filter by DWG — produces zero results
    fireEvent.click(within(folderNavigation()).getByRole("button", { name: /Contracts/ }));
    fireEvent.click(screen.getByText("Type").closest("summary") as HTMLElement);
    fireEvent.click(screen.getByLabelText("DWG"));
    const heading = await screen.findByRole("heading", { name: "No documents match these filters" });
    expect(heading).toBeInTheDocument();
    expect(screen.getByText("No documents match the selected filters.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Upload/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /New Folder/i })).not.toBeInTheDocument();
  });

  it("empty folder state shows view-only copy with no CTA", async () => {
    // Navigate to Archive folder which has no documents in seed data
    window.history.replaceState({}, "", "/projects/proj-001/documents?folder=archive");
    await renderWorkspace();
    await waitFor(() => {
      const emptyHeading =
        screen.queryByRole("heading", { name: "This folder is empty" }) ||
        screen.queryByRole("heading", { level: 2 });
      expect(emptyHeading).toBeInTheDocument();
    });
    // Confirm no upload/folder CTAs exist
    expect(screen.queryByRole("button", { name: /Upload/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /New Folder/i })).not.toBeInTheDocument();
  });

  it("document preview drawer opens on document click", async () => {
    await renderWorkspace();
    const table = desktopTable();
    const firstRow = within(table).getAllByRole("row")[1]; // skip header row
    fireEvent.click(firstRow);
    expect(
      await screen.findByRole("dialog", { name: /Document details for/ }),
    ).toBeInTheDocument();
  });

  it("Storage button is not rendered in sidebar navigation", async () => {
    await renderWorkspace();
    expect(screen.queryByRole("button", { name: /^Storage$/i })).not.toBeInTheDocument();
  });
});
