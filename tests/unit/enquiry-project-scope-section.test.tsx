import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { EnquiryProjectScopeSection } from "../../features/enquiries/detail/components/enquiry-project-scope-section";

describe("EnquiryProjectScopeSection", () => {
  it("renders section header eyebrow and default scope categories", () => {
    render(<EnquiryProjectScopeSection />);

    expect(screen.getByText("PROJECT SCOPE")).toBeInTheDocument();
    expect(screen.getByText("Space Planning & Layout")).toBeInTheDocument();
    expect(screen.getByText("Civil & Interior Fit-out")).toBeInTheDocument();
    expect(screen.getByText("MEP & Infrastructure")).toBeInTheDocument();
  });

  it("toggles collapse state when clicking header button", () => {
    render(<EnquiryProjectScopeSection />);

    const headerBtn = screen.getAllByRole("button", { name: /PROJECT SCOPE/i })[0];
    expect(headerBtn).toHaveAttribute("aria-expanded", "true");

    fireEvent.click(headerBtn);
    expect(headerBtn).toHaveAttribute("aria-expanded", "false");
  });
});
