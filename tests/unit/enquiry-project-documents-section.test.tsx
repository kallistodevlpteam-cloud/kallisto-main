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
    expect(
      screen.getByText((content, element) => {
        const node = element as HTMLElement | null;
        return Boolean(node?.className?.toString().includes("statusBadge") && content === "Missing");
      })
    ).toBeInTheDocument();
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

  it("renders backend-provided doc_name and doc_img_url without fabricating fallbacks", () => {
    const { container } = render(
      <EnquiryProjectDocumentsSection
        documents={[
          {
            id: "306",
            name: "Feasibility Study.pdf",
            docImageUrl: "/assets/nila-thumb1.jpg",
            discipline: "Drawings",
            uploaded: true,
          },
          {
            id: "229",
            name: "Electrical Layout.dwg",
            docImageUrl: undefined,
            discipline: "Drawings",
            uploaded: true,
          },
        ]}
      />
    );

    const firstRow = container.querySelectorAll("tbody tr")[0];
    expect(firstRow.textContent).toContain("Feasibility Study.pdf");
    const preview = firstRow.querySelector("img[src*='nila-thumb1.jpg']");
    expect(preview).not.toBeNull();
    expect(firstRow.textContent).not.toContain("Client Requirements.pdf");
  });

  it("shows an empty state when the backend provides no document rows", () => {
    const { container } = render(
      <EnquiryProjectDocumentsSection documents={[]} />
    );

    expect(container.querySelector("p[aria-label='No documents available']")).toHaveTextContent(
      "No documents have been shared yet."
    );
    expect(container.querySelectorAll("tbody tr")).toHaveLength(1);
  });
});
