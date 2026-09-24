import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { BusinessProfileSettings } from "@/components/settings/business-profile-settings";

afterEach(cleanup);

describe("BusinessProfileSettings", () => {
  it("renders business profile and default company statutory fields", () => {
    render(<BusinessProfileSettings />);

    expect(screen.getByRole("heading", { name: "Business Profile & Statutory Identity" })).toBeInTheDocument();
    expect(screen.getByText("Registered Firm / Studio / Company")).toBeInTheDocument();
    expect(screen.getByText("Individual Professional / Sole Practitioner")).toBeInTheDocument();

    // Default provider type is company -> CIN/LLPIN and Company PAN visible
    expect(screen.getByText("Business Registration No. (CIN / LLPIN / Udyam)")).toBeInTheDocument();
    expect(screen.getByText("Company PAN")).toBeInTheDocument();
    expect(screen.getByText("Entity Legal Structure")).toBeInTheDocument();
  });

  it("switches to individual practitioner and updates statutory fields dynamically", () => {
    render(<BusinessProfileSettings />);

    const individualRadio = screen.getByLabelText(/Individual Professional \/ Sole Practitioner/i);
    fireEvent.click(individualRadio);

    // Dynamic fields for individual professional
    expect(screen.getByText("Professional License / Registration No.")).toBeInTheDocument();
    expect(screen.getByText("Professional Council / Association")).toBeInTheDocument();
    expect(screen.getByText("Individual PAN")).toBeInTheDocument();
    expect(screen.getByText("Years of Professional Practice")).toBeInTheDocument();

    // Company specific fields should not be present
    expect(screen.queryByText("Business Registration No. (CIN / LLPIN / Udyam)")).not.toBeInTheDocument();
    expect(screen.queryByText("Company PAN")).not.toBeInTheDocument();
  });

  it("toggles GSTIN applicable field correctly", () => {
    render(<BusinessProfileSettings />);

    // Initially checked
    const gstCheckbox = screen.getByRole("checkbox", {
      name: /GST Registered \(GSTIN applicable for billing & invoicing on Kallisto\)/i,
    });
    expect(gstCheckbox).toBeChecked();
    expect(screen.getByText("GSTIN (Goods and Services Tax Identification Number)")).toBeInTheDocument();

    // Uncheck GST
    fireEvent.click(gstCheckbox);
    expect(gstCheckbox).not.toBeChecked();
    expect(screen.queryByText("GSTIN (Goods and Services Tax Identification Number)")).not.toBeInTheDocument();

    // Check back
    fireEvent.click(gstCheckbox);
    expect(gstCheckbox).toBeChecked();
    expect(screen.getByText("GSTIN (Goods and Services Tax Identification Number)")).toBeInTheDocument();
  });

  it("does NOT make verified a default status simply because documents are uploaded", () => {
    render(<BusinessProfileSettings />);

    // Documents are present
    expect(screen.getByText("Certificate of Incorporation / Registration Proof")).toBeInTheDocument();

    // Default status MUST be Pending, NOT Verified
    expect(screen.getByRole("heading", { name: "Pending Submission" })).toBeInTheDocument();
    expect(screen.getByText("Submit for Verification")).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Verified Practice" })).not.toBeInTheDocument();
  });

  it("transitions from Pending to Under Review upon submitting for verification", () => {
    render(<BusinessProfileSettings />);

    const submitBtn = screen.getByRole("button", { name: /Submit for Verification/i });
    expect(submitBtn).toBeInTheDocument();

    fireEvent.click(submitBtn);

    // Should transition to Under Compliance Review
    expect(screen.getByRole("heading", { name: "Under Compliance Review" })).toBeInTheDocument();
    expect(screen.getByText("Under Review")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Submit for Verification/i })).not.toBeInTheDocument();
  });

  it("supports lifecycle state simulation across Pending, Under Review, Verified, and Rejected", () => {
    render(<BusinessProfileSettings />);

    // Switch to Verified
    const verifiedSimBtn = screen.getByRole("button", { name: "3. Verified" });
    fireEvent.click(verifiedSimBtn);

    expect(screen.getByRole("heading", { name: /Verified Practice/i })).toBeInTheDocument();
    expect(screen.getByText("Active Service Provider • Authorized for Client Contracting")).toBeInTheDocument();

    // Switch to Rejected
    const rejectedSimBtn = screen.getByRole("button", { name: "4. Rejected" });
    fireEvent.click(rejectedSimBtn);

    expect(screen.getByRole("heading", { name: "Verification Action Required" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Re-submit for Verification/i })).toBeInTheDocument();

    // Click Re-submit moves back to Under Review
    fireEvent.click(screen.getByRole("button", { name: /Re-submit for Verification/i }));
    expect(screen.getByRole("heading", { name: "Under Compliance Review" })).toBeInTheDocument();

    // Switch back to Pending
    const pendingSimBtn = screen.getByRole("button", { name: "1. Pending" });
    fireEvent.click(pendingSimBtn);
    expect(screen.getByRole("heading", { name: "Pending Submission" })).toBeInTheDocument();
  });

  it("allows removing an uploaded document and updates status to Pending Upload", () => {
    render(<BusinessProfileSettings />);

    // Initially Arjun_PAN_Statutory.pdf is uploaded
    expect(screen.getByText("Arjun_PAN_Statutory.pdf • 620 KB • Uploaded 12 Mar 2026")).toBeInTheDocument();

    const removePanBtn = screen.getByRole("button", { name: /Remove Company \/ Individual PAN Card/i });
    fireEvent.click(removePanBtn);

    // Now it should show Pending Upload
    expect(screen.queryByText("Arjun_PAN_Statutory.pdf • 620 KB • Uploaded 12 Mar 2026")).not.toBeInTheDocument();
  });
});
