import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import {
  EnquiryDocumentsSummary,
  type EnquiryDocumentSummaryItem,
} from "../../features/enquiries/detail/components/enquiry-documents-summary";

describe("EnquiryDocumentsSummary", () => {
  const sampleDocs: EnquiryDocumentSummaryItem[] = [
    { id: "doc-1", label: "Client requirements", required: true, uploaded: true },
    { id: "doc-2", label: "Site photographs", required: true, uploaded: true },
    { id: "doc-3", label: "Reference images", required: false, uploaded: true },
    { id: "doc-4", label: "Existing floor plan", required: true, uploaded: false },
    { id: "doc-5", label: "Brand guidelines", required: true, uploaded: false },
  ];

  it("renders derived counts and missing required files correctly", () => {
    const handleViewAll = vi.fn();
    render(
      <EnquiryDocumentsSummary
        documents={sampleDocs}
        onViewAllFiles={handleViewAll}
      />
    );

    // Check summary line (3 uploaded, 2 missing)
    expect(screen.getByText("3 uploaded")).toBeInTheDocument();
    expect(screen.getByText("2 missing")).toBeInTheDocument();

    // Check missing items list
    expect(screen.getByText("Existing floor plan")).toBeInTheDocument();
    expect(screen.getByText("Brand guidelines")).toBeInTheDocument();

    // Check footer action click
    const viewAllBtn = screen.getByRole("button", {
      name: /View all enquiry files/i,
    });
    fireEvent.click(viewAllBtn);
    expect(handleViewAll).toHaveBeenCalledTimes(1);
  });

  it("renders complete state when all required files are uploaded", () => {
    const completeDocs: EnquiryDocumentSummaryItem[] = [
      { id: "doc-1", label: "Client requirements", required: true, uploaded: true },
      { id: "doc-2", label: "Site photographs", required: true, uploaded: true },
    ];
    render(
      <EnquiryDocumentsSummary
        documents={completeDocs}
        onViewAllFiles={() => {}}
      />
    );

    expect(screen.getByText("2 uploaded")).toBeInTheDocument();
    expect(screen.getByText("Complete")).toBeInTheDocument();
    expect(
      screen.getByText("All required documents received")
    ).toBeInTheDocument();
  });

  it("renders +N overflow indicator when more than 3 required files are missing", () => {
    const manyMissingDocs: EnquiryDocumentSummaryItem[] = [
      { id: "d1", label: "Req 1", required: true, uploaded: false },
      { id: "d2", label: "Req 2", required: true, uploaded: false },
      { id: "d3", label: "Req 3", required: true, uploaded: false },
      { id: "d4", label: "Req 4", required: true, uploaded: false },
      { id: "d5", label: "Req 5", required: true, uploaded: false },
    ];

    render(
      <EnquiryDocumentsSummary
        documents={manyMissingDocs}
        onViewAllFiles={() => {}}
      />
    );

    expect(screen.getByText("5 missing")).toBeInTheDocument();
    expect(screen.getByText("Req 1")).toBeInTheDocument();
    expect(screen.getByText("Req 2")).toBeInTheDocument();
    expect(screen.getByText("Req 3")).toBeInTheDocument();
    expect(
      screen.getByText("+2 more required documents")
    ).toBeInTheDocument();
  });
});
