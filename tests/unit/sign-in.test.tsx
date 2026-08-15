import React from "react";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { SignInCard } from "@/features/authentication";

// Mock Next.js router
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

describe("SignInCard Component", () => {
  beforeEach(() => {
    mockPush.mockClear();
    // Clear cookies
    document.cookie = "kallisto_simulated_role=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        status: "ok",
        token: "test-token-123",
        sp_id: "SP-001",
      }),
    } as unknown as Response);
  });

  afterEach(() => {
    cleanup();
  });

  it("renders header, branding, inputs, and actions", () => {
    render(<SignInCard />);

    expect(screen.getByText("Sign in to your Workspace")).toBeInTheDocument();
    expect(screen.getByLabelText("Work Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Sign in to Workspace/i })).toBeInTheDocument();
    expect(screen.getByText("Google Single Sign-On")).toBeInTheDocument();
  });

  it("validates empty email and password on submit", async () => {
    render(<SignInCard />);

    const submitButton = screen.getByRole("button", { name: /Sign in to Workspace/i });
    fireEvent.click(submitButton);

    expect(await screen.findByText("Email is required")).toBeInTheDocument();
    expect(await screen.findByText("Password is required")).toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("validates invalid email format", async () => {
    render(<SignInCard />);

    const emailInput = screen.getByLabelText("Work Email");
    fireEvent.change(emailInput, { target: { value: "invalid-email" } });

    const submitButton = screen.getByRole("button", { name: /Sign in to Workspace/i });
    fireEvent.click(submitButton);

    expect(await screen.findByText("Please enter a valid email address")).toBeInTheDocument();
  });

  it("toggles password visibility", () => {
    render(<SignInCard />);

    const passwordInput = screen.getByLabelText("Password") as HTMLInputElement;
    expect(passwordInput.type).toBe("password");

    const toggleButton = screen.getByLabelText("Show password");
    fireEvent.click(toggleButton);

    expect(passwordInput.type).toBe("text");
    expect(screen.getByLabelText("Hide password")).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText("Hide password"));
    expect(passwordInput.type).toBe("password");
  });

  it("submits form successfully and sets simulated role cookie and navigates to home", async () => {
    render(<SignInCard />);

    const emailInput = screen.getByLabelText("Work Email") as HTMLInputElement;
    const passwordInput = screen.getByLabelText("Password") as HTMLInputElement;

    fireEvent.change(emailInput, { target: { value: "arjun@arjunarchitects.com" } });
    fireEvent.change(passwordInput, { target: { value: "kallisto2026" } });

    const submitButton = screen.getByRole("button", { name: /Sign in to Workspace/i });
    fireEvent.click(submitButton);

    await waitFor(
      () => {
        expect(mockPush).toHaveBeenCalledWith("/");
      },
      { timeout: 2000 }
    );

    expect(document.cookie).toContain("kallisto_simulated_role=developer");
  });

  it("triggers forgot password notice when valid email is provided", () => {
    render(<SignInCard />);

    const emailInput = screen.getByLabelText("Work Email");
    fireEvent.change(emailInput, { target: { value: "provider@kallisto.build" } });

    const forgotBtn = screen.getByText("Forgot password?");
    fireEvent.click(forgotBtn);

    expect(
      screen.getByText(/Password reset instructions sent to/i)
    ).toBeInTheDocument();
  });
});
