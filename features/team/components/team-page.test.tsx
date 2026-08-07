import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { TeamPage } from "./team-page";

describe("TeamPage", () => {
  afterEach(() => cleanup());

  it("renders the operational Team workspace", () => {
    render(<TeamPage />);

    expect(screen.getByRole("heading", { name: "Team", level: 1 })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Team members" })).toBeInTheDocument();
    expect(screen.getByText("8 members")).toBeInTheDocument();
    expect(screen.getByText("farhan@studio.in")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Project access" })).toBeInTheDocument();
  });

  it("shows a compact empty state after a search with no matches", () => {
    render(<TeamPage />);

    fireEvent.change(screen.getByPlaceholderText("Search team members"), {
      target: { value: "missing member" },
    });

    expect(screen.getByText("No members found")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Clear filters" }));
    expect(screen.getAllByText("Arjun Nair").length).toBeGreaterThan(0);
  });

  it(
    "validates and submits a member invitation",
    () => {
      render(<TeamPage />);

      fireEvent.click(screen.getByRole("button", { name: "Invite member" }));
      fireEvent.click(screen.getByRole("button", { name: "Send invitation" }));

      expect(screen.getByText("Enter an email address.")).toBeInTheDocument();
      expect(screen.getByText("Select a workspace role.")).toBeInTheDocument();

      fireEvent.change(screen.getByLabelText("Email address"), {
        target: { value: "new.architect@studio.in" },
      });
      fireEvent.change(screen.getByLabelText("Workspace role"), {
        target: { value: "Architect" },
      });
      fireEvent.click(screen.getByRole("button", { name: "Send invitation" }));

      expect(
        screen.getByText("Invitation sent to new.architect@studio.in."),
      ).toBeInTheDocument();
      expect(screen.getByText("new.architect@studio.in")).toBeInTheDocument();
    },
    15000,
  );
});
