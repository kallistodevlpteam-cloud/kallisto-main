import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { ProjectFinanceWorkspace } from "@/features/projects/finance/components/project-finance-workspace";
import { createMockProjectFinanceRecord } from "@/features/projects/finance/services/project-finance.mock";
import { MemoryProjectFinanceService } from "@/features/projects/finance/services/project-finance.service";
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
  location: "Trivandrum, Kerala",
  nextRequiredAction: "Review roof slab milestone",
  createdAt: "2025-08-01T00:00:00.000Z",
  updatedAt: "2026-07-27T08:30:00.000Z",
};

function renderWorkspace() {
  const service = new MemoryProjectFinanceService([
    createMockProjectFinanceRecord(
      project.id,
      project.name,
      project.projectCode
    ),
  ]);

  return render(<ProjectFinanceWorkspace project={project} service={service} />);
}

afterEach(() => {
  cleanup();
  window.history.replaceState({}, "", "/");
});

describe("ProjectFinanceWorkspace", () => {
  it("renders the project-scoped finance overview and derived totals", async () => {
    renderWorkspace();

    expect(
      await screen.findByRole("heading", { name: "Finance" })
    ).toBeInTheDocument();
    expect(screen.getAllByText("₹50,00,000").length).toBeGreaterThan(0);
    expect(screen.getAllByText("₹24,00,000").length).toBeGreaterThan(0);
    expect(screen.getByText("₹31,40,000")).toBeInTheDocument();
    expect(screen.getAllByText("₹18,60,000").length).toBeGreaterThan(0);
    expect(
      screen.getByRole("heading", { name: "Budget Performance" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Payment Milestones" })
    ).toBeInTheDocument();
    expect(screen.getByText("1 overdue client invoice")).toBeInTheDocument();
  });

  it("preserves finance subview selection in the URL", async () => {
    renderWorkspace();
    await screen.findByRole("heading", { name: "Finance" });

    fireEvent.click(screen.getByRole("tab", { name: "Transactions" }));

    expect(
      screen.getByRole("heading", { name: "Project Transactions" })
    ).toBeInTheDocument();
    expect(window.location.search).toContain("tab=finance");
    expect(window.location.search).toContain("financeView=transactions");
  });

  it("validates and saves a pending expense without a full reload", async () => {
    renderWorkspace();
    await screen.findByRole("heading", { name: "Finance" });

    fireEvent.click(screen.getByRole("button", { name: "Add transaction" }));
    expect(
      screen.getByRole("heading", { name: "Add transaction" })
    ).toBeInTheDocument();
    const drawer = screen.getByRole("dialog", { name: "Add transaction" });

    fireEvent.change(within(drawer).getByLabelText("Transaction type"), {
      target: { value: "expense" },
    });
    fireEvent.change(within(drawer).getByLabelText("Amount (INR)"), {
      target: { value: "12500" },
    });
    fireEvent.change(within(drawer).getByLabelText("Description"), {
      target: { value: "Test site equipment expense" },
    });
    fireEvent.click(within(drawer).getByRole("button", { name: "Save transaction" }));

    expect(
      screen.getByText(
        "Counterparty is required for expenses and commitments."
      )
    ).toBeInTheDocument();

    fireEvent.change(within(drawer).getByLabelText(/Counterparty/), {
      target: { value: "Test Equipment Vendor" },
    });
    fireEvent.click(within(drawer).getByRole("button", { name: "Save transaction" }));

    await waitFor(() => {
      expect(
        screen.queryByRole("heading", { name: "Add transaction" })
      ).not.toBeInTheDocument();
    });
    expect(
      screen.getByText(/Test site equipment expense saved as pending/i)
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: "Transactions" }));
    expect(
      screen.getByText("Test site equipment expense")
    ).toBeInTheDocument();
    expect(screen.getByText("Test Equipment Vendor")).toBeInTheDocument();
  });
});
