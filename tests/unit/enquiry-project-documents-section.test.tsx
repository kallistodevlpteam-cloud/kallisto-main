import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { EnquiryProjectDocumentsSection } from "../../features/enquiries/detail/components/enquiry-project-documents-section";

describe("EnquiryProjectDocumentsSection", () => {
  it("renders Project Documents title and document list items", () => {
    render(<EnquiryProjectDocumentsSection />);

    expect(screen.getByText("Project Documents")).toBeInTheDocument();
    expect(screen.getAllByText("Client Requirements.pdf").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Site Inspection Report.pdf").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Existing Floor Plan.dwg").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Brand Guidelines.pdf").length).toBeGreaterThan(0);
    expect(screen.getByText("MISSING")).toBeInTheDocument();
  });

  it("handles document download click", () => {
    const handleDownload = vi.fn();
    const { container } = render(
      <EnquiryProjectDocumentsSection onDownload={handleDownload} />
    );

    const downloadBtns = container.querySelectorAll("button");
    expect(downloadBtns.length).toBeGreaterThan(0);

    fireEvent.click(downloadBtns[0]);
    expect(handleDownload).toHaveBeenCalledWith("doc-1");
  });
});
