import React from "react";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { describe, it, expect, afterEach } from "vitest";
import { AccountSettings } from "@/components/settings/account-settings";

describe("AccountSettings Component (Minimal Reference Style)", () => {
  const mockUser = {
    uid: "test-user-123",
    role: "provider",
  };

  afterEach(() => {
    cleanup();
  });

  it("renders Profile section header, subtitle and profile photo details", () => {
    render(<AccountSettings user={mockUser} />);
    expect(screen.getByText("Profile")).toBeInTheDocument();
    expect(
      screen.getByText("Manage your information, preferences, and connected data.")
    ).toBeInTheDocument();
    expect(screen.getByText("Profile photo")).toBeInTheDocument();
    expect(screen.getByText("PNG, JPEG, SVG (Less than 5MB)")).toBeInTheDocument();
  });

  it("renders Profile form fields for First/Last name, Username, Email and Website", () => {
    render(<AccountSettings user={mockUser} />);
    expect(screen.getByText("First Name")).toBeInTheDocument();
    expect(screen.getByText("Last Name")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter last name")).toBeInTheDocument();
    expect(screen.getByText("Username")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter username")).toBeInTheDocument();
    expect(screen.getByText("Email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter email")).toBeInTheDocument();
    expect(screen.getByText("Website")).toBeInTheDocument();
    expect(screen.getByText("https://")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("company.com")).toBeInTheDocument();
  });

  it("renders Preferences section with dropdown selectors and toggles", () => {
    render(<AccountSettings user={mockUser} />);
    expect(screen.getByText("Preferences")).toBeInTheDocument();
    expect(screen.getByText("Manage your application preferences")).toBeInTheDocument();

    expect(screen.getByText("Timezone")).toBeInTheDocument();
    expect(screen.getByText("Select timezone")).toBeInTheDocument();
    expect(screen.getByText("Language")).toBeInTheDocument();
    expect(screen.getByText("Select language")).toBeInTheDocument();
    expect(screen.getByText("Start of the week")).toBeInTheDocument();
    expect(screen.getByText("Select date")).toBeInTheDocument();
    expect(screen.getByText("Date format")).toBeInTheDocument();
    expect(screen.getByText("Select format")).toBeInTheDocument();

    expect(screen.getByText("24 hour time format")).toBeInTheDocument();
    expect(screen.getByText("Example: 20:00 PM, 12-hour format if switch off")).toBeInTheDocument();
    expect(screen.getByText("Show active dot")).toBeInTheDocument();
    expect(screen.getByText("Display a green dot next to your picture if you're online")).toBeInTheDocument();
  });

  it("handles form inputs and toggle switches interactive state updates", () => {
    render(<AccountSettings user={mockUser} />);

    const firstNameInput = screen.getByPlaceholderText("") as HTMLInputElement;
    fireEvent.change(firstNameInput, { target: { value: "Saran" } });
    expect(firstNameInput.value).toBe("Saran");

    const lastNameInput = screen.getByPlaceholderText("Enter last name") as HTMLInputElement;
    fireEvent.change(lastNameInput, { target: { value: "Kumar" } });
    expect(lastNameInput.value).toBe("Kumar");

    const activeDotLabel = screen.getByText("Show active dot");
    fireEvent.click(activeDotLabel);
  });
});
