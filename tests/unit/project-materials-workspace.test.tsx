import { describe, it, expect, vi, afterEach } from "vitest";
import React from "react";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { ProjectMaterialsWorkspace } from "@/features/projects/components/materials/project-materials-workspace";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => "/projects/prj-1",
  useSearchParams: () => new URLSearchParams(),
}));

afterEach(() => {
  cleanup();
});

describe("ProjectMaterialsWorkspace", () => {
  it("renders KPI metrics and initial BOQ material items", () => {
    render(<ProjectMaterialsWorkspace projectId="prj-1" projectName="Nila Residence" />);

    // KPI summary
    expect(screen.getByText("Total Spent")).toBeInTheDocument();
    expect(screen.getByText("Available Value")).toBeInTheDocument();
    expect(screen.getByText("BOQ Required")).toBeInTheDocument();
    expect(screen.getByText("Total Budget")).toBeInTheDocument();

    // Material names
    expect(screen.getByText("Italian Marble Flooring")).toBeInTheDocument();
    expect(screen.getByText("Structural Cement (53 Grade)")).toBeInTheDocument();
    expect(screen.getByText("Teak Wood Framing & Joinery")).toBeInTheDocument();
    expect(screen.getByText("Conduit & Electrical Wiring")).toBeInTheDocument();
    expect(screen.getByText("Vitrified Porcelain Tiles")).toBeInTheDocument();
    expect(screen.getByText("Structural Steel TMT Rebars (Fe 500D)")).toBeInTheDocument();
  });

  it("filters materials via search input", () => {
    render(<ProjectMaterialsWorkspace projectId="prj-1" projectName="Nila Residence" />);

    const searchInput = screen.getByPlaceholderText(/search material, boq code/i);
    fireEvent.change(searchInput, { target: { value: "Marble" } });

    expect(screen.getByText("Italian Marble Flooring")).toBeInTheDocument();
    expect(screen.queryByText("Structural Cement (53 Grade)")).not.toBeInTheDocument();
  });

  it("toggles to Matrix tabular view", () => {
    render(<ProjectMaterialsWorkspace projectId="prj-1" projectName="Nila Residence" />);

    const matrixToggleBtn = screen.getByRole("button", { name: /matrix/i });
    fireEvent.click(matrixToggleBtn);

    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(screen.getByText("BOQ Code")).toBeInTheDocument();
    expect(screen.getByText("Material & Scope")).toBeInTheDocument();
    expect(screen.getByText("Stock on Site")).toBeInTheDocument();
  });

  it("opens purchase modal and records material inward", () => {
    render(<ProjectMaterialsWorkspace projectId="prj-1" projectName="Nila Residence" />);

    const recordPurchaseBtn = screen.getByRole("button", { name: /record purchase/i });
    fireEvent.click(recordPurchaseBtn);

    expect(screen.getByText(/Record Material Purchase \/ Inward/i)).toBeInTheDocument();

    const qtyInput = screen.getByPlaceholderText(/e\.g\. 50/i);
    fireEvent.change(qtyInput, { target: { value: "100" } });

    const submitBtn = screen.getByRole("button", { name: /confirm inward/i });
    fireEvent.click(submitBtn);

    expect(screen.getByText(/Recorded purchase of 100 sq ft for Italian Marble Flooring/i)).toBeInTheDocument();
  });

  it("opens log usage modal and logs material consumption", () => {
    render(<ProjectMaterialsWorkspace projectId="prj-1" projectName="Nila Residence" />);

    const logUsageBtn = screen.getByRole("button", { name: /log usage/i });
    fireEvent.click(logUsageBtn);

    expect(screen.getByText(/Log Site Material Consumption/i)).toBeInTheDocument();

    const qtyInput = screen.getByPlaceholderText(/e\.g\. 10/i);
    fireEvent.change(qtyInput, { target: { value: "20" } });

    const submitBtn = screen.getByRole("button", { name: /log consumption/i });
    fireEvent.click(submitBtn);

    expect(screen.getByText(/Logged usage of 20 sq ft for Italian Marble Flooring/i)).toBeInTheDocument();
  });
});
