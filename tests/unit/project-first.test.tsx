import { cleanup } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { SIDEBAR_NAVIGATION } from "@/components/layout/sidebar-navigation";
import { projectService } from "@/services/repositories/project-service";

afterEach(cleanup);

describe("Project-First Information Architecture — Spec Validation", () => {
  it("removes Clients from primary sidebar navigation while preserving WORK section", () => {
    const workItems = SIDEBAR_NAVIGATION.filter((item) => item.section === "work");
    expect(workItems.map((item) => item.label)).toEqual([
      "Enquiries",
      "Projects",
      "Hive Studio",
      "Calendar",
      "Team",
    ]);

    expect(SIDEBAR_NAVIGATION.find((item) => item.label === "Clients")).toBeUndefined();
  });

  it("queries projects from repository data layer and excludes unconverted enquiries from upcoming", async () => {
    const upcomingProjects = await projectService.getProjects("ws-default", { status: "upcoming" });
    expect(upcomingProjects.length).toBeGreaterThan(0);
    
    // Check that every upcoming project has a valid project status and ID
    upcomingProjects.forEach((p) => {
      expect(p.status).toBe("upcoming");
      expect(p.id).toMatch(/^proj-/);
    });

    // Verify unconverted enquiries remain in enquiries store and are not in upcoming projects
    const unconvertedEnquiries = await projectService.getUnconvertedEnquiries("ws-default");
    expect(unconvertedEnquiries.length).toBeGreaterThan(0);
    unconvertedEnquiries.forEach((e) => {
      expect(e.status).not.toBe("converted");
      expect(upcomingProjects.some((p) => p.enquiryId === e.id)).toBe(false);
    });
  });

  it("filters projects by search query matching project name, client name, code, location, and owner", async () => {
    const byName = await projectService.getProjects("ws-default", { searchQuery: "Residence 24" });
    expect(byName.length).toBe(1);
    expect(byName[0].name).toBe("Residence 24");

    const byClient = await projectService.getProjects("ws-default", { searchQuery: "Anoop Menon" });
    expect(byClient.length).toBe(1);
    expect(byClient[0].name).toBe("Residence 24");

    const byCode = await projectService.getProjects("ws-default", { searchQuery: "PRJ-GFV-02" });
    expect(byCode.length).toBe(1);
    expect(byCode[0].name).toBe("Greenfield Villa");

    const byLocation = await projectService.getProjects("ws-default", { searchQuery: "Hyderabad" });
    expect(byLocation.length).toBe(1);
    expect(byLocation[0].name).toBe("Palm Springs Suite");

    const byOwner = await projectService.getProjects("ws-default", { searchQuery: "Rohit" });
    expect(byOwner.length).toBe(1);
    expect(byOwner[0].name).toBe("Greenfield Villa");
  });

  it("masks sensitive client billing and contact info for unauthorized roles (field-team)", async () => {
    const rawClient = await projectService.getClientById("ws-default", "cli-101", "admin");
    expect(rawClient).not.toBeNull();
    expect(rawClient?.billingDetails.billingAddress).toContain("Kochi");
    expect(rawClient?.contactDetails.email).toBe("anoop@menongroup.com");

    const maskedClient = await projectService.getClientById("ws-default", "cli-101", "field-team");
    expect(maskedClient).not.toBeNull();
    expect(maskedClient?.billingDetails.billingAddress).toContain("[Restricted");
    expect(maskedClient?.contactDetails.email).toBe("[Restricted]");
  });

  it("converts an enquiry to a project atomically and prevents duplicate conversions", async () => {
    const unconverted = await projectService.getUnconvertedEnquiries("ws-default");
    const targetEnquiry = unconverted[0];

    const result = await projectService.convertEnquiryToProject("ws-default", {
      enquiryId: targetEnquiry.id,
      clientSelection: { mode: "use_existing", clientId: "cli-101" },
      projectName: "Converted Test Villa Project",
      projectType: "Villa",
      ownerId: "user-current",
      ownerName: "Arjun",
      location: "Calicut",
    });

    expect(result.project.id).toMatch(/^proj-/);
    expect(result.project.name).toBe("Converted Test Villa Project");
    expect(result.enquiry.status).toBe("converted");
    expect(result.enquiry.convertedProjectId).toBe(result.project.id);

    // Duplicate submission attempt must throw error
    await expect(
      projectService.convertEnquiryToProject("ws-default", {
        enquiryId: targetEnquiry.id,
        clientSelection: { mode: "use_existing", clientId: "cli-101" },
        projectName: "Duplicate Attempt",
        projectType: "Villa",
        ownerId: "user-current",
        ownerName: "Arjun",
        location: "Calicut",
      })
    ).rejects.toThrow(/already been converted/i);
  });

  it("supports global search across Clients and Projects entities", async () => {
    const searchRes = await projectService.searchEntities("ws-default", "Anoop");
    expect(searchRes.clients.length).toBeGreaterThan(0);
    expect(searchRes.clients[0].name).toBe("Anoop Menon");
    expect(searchRes.clients[0].linkedProjectsCount).toBeGreaterThan(0);

    const searchProjRes = await projectService.searchEntities("ws-default", "Greenfield");
    expect(searchProjRes.projects.length).toBeGreaterThan(0);
    expect(searchProjRes.projects[0].name).toBe("Greenfield Villa");
  });
});
