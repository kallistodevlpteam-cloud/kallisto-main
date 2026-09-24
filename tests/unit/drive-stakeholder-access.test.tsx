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
    } as unknown as MediaQueryList;
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
  mockMatchMedia(1024);
});

afterEach(cleanup);

async function renderWorkspace() {
  const result = render(
    <ProjectDocumentsWorkspace projectId="proj-001" projectCode="KAL-2024-001" />,
  );
  await screen.findByRole("heading", { level: 1, name: "Docs" });
  await screen.findByRole("heading", { level: 2, name: "All Documents" });
  return result;
}

describe("Drive Stakeholder Access (Hands & Basics)", () => {
  it("shows Hands (Contractor) and Basics (Specialist) access options when clicking 3-dot menu", async () => {
    await renderWorkspace();

    const table = screen.getByRole("table");
    const moreBtn = within(table).getByLabelText(
      "Actions for Ground Floor Plan.pdf",
    );
    expect(moreBtn).toBeInTheDocument();

    fireEvent.click(moreBtn);

    expect(within(table).getByText("Give Access")).toBeInTheDocument();
    expect(within(table).getByText("Hands (Contractor)")).toBeInTheDocument();
    expect(within(table).getByText("Ramesh Kumar (Civil)")).toBeInTheDocument();
    expect(within(table).getByText("Basics (Project Worker)")).toBeInTheDocument();
    expect(within(table).getByText("Axis Structures (Engg)")).toBeInTheDocument();
    expect(within(table).getByText("Manage all access...")).toBeInTheDocument();
  });

  it("allows giving access to Hands contractor directly from 3-dot menu", async () => {
    await renderWorkspace();

    const table = screen.getByRole("table");
    const moreBtn = within(table).getByLabelText(
      "Actions for Ground Floor Plan.pdf",
    );
    fireEvent.click(moreBtn);

    const giveHandsBtn = within(table).getByLabelText("Give access to Ramesh Kumar");
    expect(giveHandsBtn).toBeInTheDocument();
    fireEvent.click(giveHandsBtn);

    await waitFor(() => {
      expect(within(table).getByLabelText("Revoke access from Ramesh Kumar")).toBeInTheDocument();
    });
  });

  it("opens DocumentAccessDialog when clicking 'Manage all access...' in 3-dot menu", async () => {
    await renderWorkspace();

    const table = screen.getByRole("table");
    const moreBtn = within(table).getByLabelText(
      "Actions for Ground Floor Plan.pdf",
    );
    fireEvent.click(moreBtn);

    const manageAllBtn = within(table).getByText("Manage all access...");
    fireEvent.click(manageAllBtn);

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
      expect(screen.getByText("Manage Document Access")).toBeInTheDocument();
    });

    expect(screen.getByText("Hands (Contractor)")).toBeInTheDocument();
    expect(screen.getByText("Kochi Civil & Masonry Works · Civil & Structural Contractor Lead")).toBeInTheDocument();
    expect(screen.getByText("Biju Varghese")).toBeInTheDocument();

    expect(screen.getByText("Basics (Person who work in the project)")).toBeInTheDocument();
    expect(screen.getByText("Axis Structures Consulting · Structural Engineering Specialist")).toBeInTheDocument();
    expect(screen.getByText("Studio Elemental")).toBeInTheDocument();
    expect(screen.getByText("Volt & Wire Consultants")).toBeInTheDocument();

    const doneBtn = screen.getByRole("button", { name: "Done" });
    fireEvent.click(doneBtn);

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  it("allows granting and revoking access inside DocumentAccessDialog", async () => {
    await renderWorkspace();

    const table = screen.getByRole("table");
    const moreBtn = within(table).getByLabelText(
      "Actions for Ground Floor Plan.pdf",
    );
    fireEvent.click(moreBtn);

    fireEvent.click(within(table).getByText("Manage all access..."));

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    // Find Give Access for Studio Elemental
    const giveStudioBtn = screen.getByLabelText("Give access to Studio Elemental");
    expect(giveStudioBtn).toBeInTheDocument();
    fireEvent.click(giveStudioBtn);

    // Now it should show Revoke Access
    await waitFor(() => {
      expect(screen.getByLabelText("Revoke access for Studio Elemental")).toBeInTheDocument();
    });

    // Click Revoke Access
    fireEvent.click(screen.getByLabelText("Revoke access for Studio Elemental"));

    // Should return to Give Access
    await waitFor(() => {
      expect(screen.getByLabelText("Give access to Studio Elemental")).toBeInTheDocument();
    });
  });

  it("shows 'Who can view and download' section in Document Details drawer and allows granting access", async () => {
    await renderWorkspace();

    const table = screen.getByRole("table");
    const docRow = within(table).getByText("Ground Floor Plan.pdf");
    fireEvent.click(docRow);

    // Document Details drawer should open
    await waitFor(() => {
      expect(screen.getByRole("dialog", { name: /Document details for Ground Floor Plan.pdf/i })).toBeInTheDocument();
    });

    const drawer = screen.getByRole("dialog", { name: /Document details for Ground Floor Plan.pdf/i });

    // Verify Action Bar has Give Access and Download file buttons
    expect(within(drawer).getByRole("button", { name: /^Give Access$/i })).toBeInTheDocument();
    expect(within(drawer).getByRole("button", { name: /^Download file$/i })).toBeInTheDocument();

    // Verify Who can view and download section heading
    expect(within(drawer).getByRole("heading", { name: /Who can view and download/i })).toBeInTheDocument();

    // Verify Owner is listed
    expect(within(drawer).getAllByText("Arjun Mehta").length).toBeGreaterThan(0);
    expect(within(drawer).getByText("Document Owner · Full access")).toBeInTheDocument();

    // Verify Hands and Basics stakeholders are listed
    expect(within(drawer).getByText("Ramesh Kumar")).toBeInTheDocument();
    expect(within(drawer).getByText("Biju Varghese")).toBeInTheDocument();
    expect(within(drawer).getByText("Axis Structures")).toBeInTheDocument();

    // Ramesh Kumar already has access from earlier test
    expect(within(drawer).getByLabelText("Revoke access for Ramesh Kumar")).toBeInTheDocument();

    // Grant access to Biju Varghese directly from the drawer
    const giveBijuBtn = within(drawer).getByLabelText("Give access to Biju Varghese");
    expect(giveBijuBtn).toBeInTheDocument();
    fireEvent.click(giveBijuBtn);

    // Should now show Revoke for Biju Varghese
    await waitFor(() => {
      expect(within(drawer).getByLabelText("Revoke access for Biju Varghese")).toBeInTheDocument();
      expect(within(drawer).getAllByText("✓ Can view & download").length).toBeGreaterThan(1);
    });

    // Revoke access
    fireEvent.click(within(drawer).getByLabelText("Revoke access for Biju Varghese"));

    await waitFor(() => {
      expect(within(drawer).getByLabelText("Give access to Biju Varghese")).toBeInTheDocument();
    });
  });
});
