import { describe, expect, it } from "vitest";
import { getTeamWorkspaceMock } from "../services/team.mock";
import type { InviteMemberInput } from "../types/team.types";
import { validateInviteMember } from "./invite-member-validation";

describe("validateInviteMember", () => {
  const workspace = getTeamWorkspaceMock();
  const validInput: InviteMemberInput = {
    email: "new.member@studio.in",
    role: "Architect",
    projectAccess: "all",
    selectedProjectIds: [],
    message: "",
  };

  it("rejects invalid email and a missing role", () => {
    const errors = validateInviteMember(
      { ...validInput, email: "invalid", role: "" },
      workspace.members,
      workspace.invitations,
    );

    expect(errors.email).toBe("Enter a valid email address.");
    expect(errors.role).toBe("Select a workspace role.");
  });

  it("rejects existing members and already invited emails", () => {
    const memberErrors = validateInviteMember(
      { ...validInput, email: "ARJUN@ARJUNARCHITECTS.IN" },
      workspace.members,
      workspace.invitations,
    );
    const inviteErrors = validateInviteMember(
      { ...validInput, email: "farhan@studio.in" },
      workspace.members,
      workspace.invitations,
    );

    expect(memberErrors.email).toBe(
      "This person is already a workspace member.",
    );
    expect(inviteErrors.email).toBe(
      "An invitation has already been sent to this email.",
    );
  });

  it("requires at least one selected project", () => {
    const errors = validateInviteMember(
      { ...validInput, projectAccess: "selected", selectedProjectIds: [] },
      workspace.members,
      workspace.invitations,
    );

    expect(errors.projectAccess).toBe("Select at least one project.");
  });

  it("accepts a complete invitation", () => {
    expect(
      validateInviteMember(
        validInput,
        workspace.members,
        workspace.invitations,
      ),
    ).toEqual({});
  });
});
