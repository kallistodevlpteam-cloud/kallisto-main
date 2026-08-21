import React from "react";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { describe, it, expect, afterEach } from "vitest";
import { ApplyAccessForm } from "@/features/onboarding";

describe("ApplyAccessForm Component (Multi-Step Provider Onboarding Journey)", () => {
  afterEach(() => {
    cleanup();
  });

  it("Step 1: renders account creation with email, password, and Google SSO option", () => {
    render(<ApplyAccessForm />);

    expect(screen.getByText("Create your Workspace Account")).toBeInTheDocument();
    expect(
      screen.getByText("Set up your provider credentials to begin practice verification and project allocation.")
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Work Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Continue to Email Verification/i })).toBeInTheDocument();
    expect(screen.getByText("Google Single Sign-On")).toBeInTheDocument();
  });

  it("Step 1 & 2: validates credentials, advances to Email OTP verification, and verifies OTP", async () => {
    render(<ApplyAccessForm />);

    // Attempt empty submit
    fireEvent.click(screen.getByRole("button", { name: /Continue to Email Verification/i }));
    expect(await screen.findByText("Work email is required")).toBeInTheDocument();
    expect(await screen.findByText("Password is required")).toBeInTheDocument();

    // Fill valid credentials
    fireEvent.change(screen.getByLabelText("Work Email"), {
      target: { value: "arjun@studio-menon.in" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "SecurePass123!" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Continue to Email Verification/i }));

    // Wait for transition to Step 2: Email Verification
    await waitFor(
      () => {
        expect(screen.getByText("Verify your work email")).toBeInTheDocument();
      },
      { timeout: 2000 }
    );

    expect(screen.getByText("arjun@studio-menon.in")).toBeInTheDocument();

    // Enter 6 digit OTP
    const digit1 = screen.getByLabelText("Digit 1");
    fireEvent.change(digit1, { target: { value: "123456" } });

    fireEvent.click(screen.getByRole("button", { name: /Verify Email & Continue/i }));

    // Advances to Step 3: Practice selection
    await waitFor(
      () => {
        expect(screen.getByText("Tell us about your practice")).toBeInTheDocument();
      },
      { timeout: 2000 }
    );

    expect(screen.getByText("Who are you joining as?")).toBeInTheDocument();
    expect(screen.getByText("Independent professional")).toBeInTheDocument();
    expect(screen.getByText("Firm or company")).toBeInTheDocument();
  });

  it("completes the full flow for Independent Professional through 3 sub-steps with Virtual Office ID", async () => {
    render(<ApplyAccessForm />);

    // Step 1: Account Creation
    fireEvent.change(screen.getByLabelText("Work Email"), {
      target: { value: "vikram@arch.in" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "SecretPassword99!" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Continue to Email Verification/i }));

    // Step 2: OTP
    await waitFor(() => expect(screen.getByText("Verify your work email")).toBeInTheDocument());
    fireEvent.change(screen.getByLabelText("Digit 1"), { target: { value: "654321" } });
    fireEvent.click(screen.getByRole("button", { name: /Verify Email & Continue/i }));

    // Step 3: Practice selection
    await waitFor(() => expect(screen.getByText("Tell us about your practice")).toBeInTheDocument());
    fireEvent.click(screen.getByText("Independent professional"));
    fireEvent.click(screen.getByRole("button", { name: /Continue to application form/i }));

    // Step 4 Sub-Step 1: Contact Details (No redundant email)
    await waitFor(() => expect(screen.getByText(/Step 1 of 3: Contact Details/i)).toBeInTheDocument());
    expect(screen.queryByLabelText("Professional Work Email")).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Full Name"), { target: { value: "Vikram Seth" } });
    fireEvent.change(screen.getByLabelText("Mobile / WhatsApp"), { target: { value: "+91 98450 11223" } });
    fireEvent.click(screen.getByRole("button", { name: /Continue to Professional Details/i }));

    // Step 4 Sub-Step 2: Professional Details
    await waitFor(() => expect(screen.getByText(/Step 2 of 3: Professional Details/i)).toBeInTheDocument());
    fireEvent.change(screen.getByLabelText("Primary Practice Discipline"), { target: { value: "Architects" } });
    fireEvent.change(screen.getByLabelText("Primary Operating City"), { target: { value: "Bengaluru" } });
    fireEvent.click(screen.getByRole("button", { name: /Continue to Virtual Office Setup/i }));

    // Step 4 Sub-Step 3: Virtual Office ID Selection & Practice Verification
    await waitFor(() => expect(screen.getByText(/Step 3 of 3: Virtual Office ID & Verification/i)).toBeInTheDocument());
    expect(screen.getByText("Virtual Office ID")).toBeInTheDocument();
    expect(screen.getByText("Available on Kallisto")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Virtual Office ID Handle"), { target: { value: "vikram-seth-arch" } });
    fireEvent.change(screen.getByLabelText(/Studio \/ Practice Display Name/i), { target: { value: "Studio Seth" } });
    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.click(screen.getByRole("button", { name: /Reserve & Submit for Verification/i }));

    // Step 5: Confirmation
    await waitFor(
      () => {
        expect(screen.getByText("Application Received")).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    expect(screen.getByText(/Independent Professional/i)).toBeInTheDocument();
    expect(screen.getByText(/Vikram Seth/i)).toBeInTheDocument();
    expect(screen.getByText("vikram-seth-arch")).toBeInTheDocument();
    expect(screen.getByText(/KAL-APP-/i)).toBeInTheDocument();
  });

  it("completes the full flow for Firm or Company through 3 sub-steps with Virtual Office ID", async () => {
    render(<ApplyAccessForm />);

    // Step 1: Account Creation
    fireEvent.change(screen.getByLabelText("Work Email"), {
      target: { value: "priya@kallistostudio.in" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "CorporatePass99!" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Continue to Email Verification/i }));

    // Step 2: OTP
    await waitFor(() => expect(screen.getByText("Verify your work email")).toBeInTheDocument());
    fireEvent.change(screen.getByLabelText("Digit 1"), { target: { value: "112233" } });
    fireEvent.click(screen.getByRole("button", { name: /Verify Email & Continue/i }));

    // Step 3: Practice selection
    await waitFor(() => expect(screen.getByText("Tell us about your practice")).toBeInTheDocument());
    fireEvent.click(screen.getByText("Firm or company"));
    fireEvent.click(screen.getByRole("button", { name: /Continue to application form/i }));

    // Step 4 Sub-Step 1: Organisation Profile
    await waitFor(() => expect(screen.getByText(/Step 1 of 3: Organisation Profile/i)).toBeInTheDocument());
    fireEvent.change(screen.getByLabelText("Firm / Company Name"), {
      target: { value: "Kallisto Design Studio Pvt Ltd" },
    });
    fireEvent.change(screen.getByLabelText("Organisation Type"), {
      target: { value: "Architecture or design studio" },
    });
    fireEvent.change(screen.getByLabelText("Primary Discipline / Service"), {
      target: { value: "Architecture or design studio" },
    });
    fireEvent.change(screen.getByLabelText("Primary Operating City"), {
      target: { value: "Kochi" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Continue to Authorised Contact/i }));

    // Step 4 Sub-Step 2: Authorised Contact
    await waitFor(() => expect(screen.getByText(/Step 2 of 3: Authorised Contact/i)).toBeInTheDocument());
    fireEvent.change(screen.getByLabelText("Contact Person Name"), {
      target: { value: "Priya Nair" },
    });
    fireEvent.change(screen.getByLabelText("Role / Designation"), {
      target: { value: "Managing Director" },
    });
    fireEvent.change(screen.getByLabelText("Mobile / WhatsApp"), {
      target: { value: "+91 98450 44556" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Continue to Virtual Office Setup/i }));

    // Step 4 Sub-Step 3: Virtual Office ID Selection & Operations
    await waitFor(() => expect(screen.getByText(/Step 3 of 3: Virtual Office ID & Verification/i)).toBeInTheDocument());
    expect(screen.getByText("Firm Virtual Office ID")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Firm Virtual Office ID Handle"), {
      target: { value: "kallisto-design-studio" },
    });
    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.click(screen.getByRole("button", { name: /Reserve & Submit for Verification/i }));

    // Step 5: Confirmation
    await waitFor(
      () => {
        expect(screen.getByText("Application Received")).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    expect(screen.getByText(/Organisation \/ Firm/i)).toBeInTheDocument();
    expect(screen.getByText(/Kallisto Design Studio Pvt Ltd/i)).toBeInTheDocument();
    expect(screen.getByText("kallisto-design-studio")).toBeInTheDocument();
  });
});
