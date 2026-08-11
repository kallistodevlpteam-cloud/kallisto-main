import React from "react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { EnquiryProjectDocumentsSection } from "../../features/enquiries/detail/components/enquiry-project-documents-section";

const BACKEND_DOCUMENTS = [
  {
    id: "doc-1",
    name: "Client Requirements.pdf",
    docImageUrl: "/assets/manual.webp",
  },
  {
    id: "doc-2",
    name: "Site Inspection Report.pdf",
    docImageUrl: "/assets/projectbg.webp",
  },
  {
    id: "doc-3",
    name: "Existing Floor Plan.dwg",
    docImageUrl: "/assets/kallisto-drawing-approval-record.png",
  },
  {
    id: "doc-4",
    name: "Brand Guidelines.pdf",
    docImageUrl: null,
  },
  {
    id: "doc-5",
    name: "BOQ Estimate.xlsx",
    docImageUrl: "/assets/quotation-retyping-workflow.png",
  },
];

describe("EnquiryProjectDocumentsSection", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders Project Documents title and document list from the backend", () => {
    render(<EnquiryProjectDocumentsSection documents={BACKEND_DOCUMENTS} />);

    expect(screen.getByText("Project Documents")).toBeInTheDocument();
    expect(screen.getAllByText("Client Requirements.pdf").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Site Inspection Report.pdf").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Existing Floor Plan.dwg").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Brand Guidelines.pdf").length).toBeGreaterThan(0);
    expect(screen.getByText("MISSING")).toBeInTheDocument();
  });

  it("renders the doc image URL from the backend as the document preview", () => {
    render(<EnquiryProjectDocumentsSection documents={BACKEND_DOCUMENTS} />);

    expect(
      screen.getAllByRole("img", { name: "Client Requirements.pdf" }).length
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByRole("img", { name: "Site Inspection Report.pdf" }).length
    ).toBeGreaterThan(0);
  });

  it("shows the overflow card derived from the backend document count", () => {
    render(<EnquiryProjectDocumentsSection documents={BACKEND_DOCUMENTS} />);

    expect(screen.getAllByText("+1 More").length).toBeGreaterThan(0);
    expect(
      screen.getAllByRole("button", { name: "View 1 more project documents" }).length
    ).toBeGreaterThan(0);
  });

  it("does not show an overflow card when there are four or fewer documents", () => {
    render(<EnquiryProjectDocumentsSection documents={BACKEND_DOCUMENTS.slice(0, 4)} />);

    expect(screen.queryByText("+More")).not.toBeInTheDocument();
  });

  it("renders an empty state when the backend has no documents", () => {
    render(<EnquiryProjectDocumentsSection documents={[]} />);

    expect(
      screen.getAllByText("No project documents have been shared yet.").length
    ).toBeGreaterThan(0);
    expect(screen.queryAllByRole("button").length).toBe(0);
  });

  it("handles document download click", () => {
    const handleDownload = vi.fn();
    const { container } = render(
      <EnquiryProjectDocumentsSection
        documents={BACKEND_DOCUMENTS.slice(0, 1)}
        onDownload={handleDownload}
      />
    );

    const downloadBtn = screen.getAllByRole("button", {
      name: "View or download Client Requirements.pdf",
    })[0];
    fireEvent.click(downloadBtn);
    expect(handleDownload).toHaveBeenCalledWith("doc-1");
    expect(container).toBeTruthy();
  });
});