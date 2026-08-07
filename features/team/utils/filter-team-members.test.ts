import { describe, expect, it } from "vitest";
import { getTeamWorkspaceMock } from "../services/team.mock";
import { filterTeamMembers } from "./filter-team-members";

describe("filterTeamMembers", () => {
  const workspace = getTeamWorkspaceMock();

  it("matches member name, email, and role case-insensitively", () => {
    const byName = filterTeamMembers(workspace.members, {
      query: "rahul",
      role: "all",
      projectId: "all",
      status: "all",
    });
    const byEmail = filterTeamMembers(workspace.members, {
      query: "NEHA@ARJUNARCHITECTS.IN",
      role: "all",
      projectId: "all",
      status: "all",
    });
    const byRole = filterTeamMembers(workspace.members, {
      query: "quantity surveyor",
      role: "all",
      projectId: "all",
      status: "all",
    });

    expect(byName.map((member) => member.id)).toEqual(["rahul-krishnan"]);
    expect(byEmail.map((member) => member.id)).toEqual(["neha-menon"]);
    expect(byRole.map((member) => member.id)).toEqual(["nikhil-raj"]);
  });

  it("combines role, project, and status filters", () => {
    const filtered = filterTeamMembers(workspace.members, {
      query: "",
      role: "Finance",
      projectId: "nila-residence",
      status: "inactive",
    });

    expect(filtered.map((member) => member.id)).toEqual(["anjali-s"]);
  });

  it("returns no results when filters do not match", () => {
    const filtered = filterTeamMembers(workspace.members, {
      query: "missing person",
      role: "all",
      projectId: "all",
      status: "all",
    });

    expect(filtered).toHaveLength(0);
  });
});
