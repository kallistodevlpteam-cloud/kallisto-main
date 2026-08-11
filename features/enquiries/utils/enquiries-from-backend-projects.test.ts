import { describe, it, expect } from "vitest";
import type { BackendProject } from "@/types/domain/backend-project";
import { buildEnquiriesFromProjects, mapBackendProjectType } from "./enquiries-from-backend-projects";

const project = (partial: Partial<BackendProject>): BackendProject => ({
  id: 2,
  projectName: "Sunrise Villa",
  projectType: "Residential",
  buildingType: "Villa",
  projectCharacter: "enq",
  newConstructionOrRenovation: null,
  purposeOfProject: null,
  briefDescription: null,
  coverImageUrl: null,
  sqArea: null,
  clientExpectedTimeline: null,
  clientName: null,
  place: null,
  estimatedOverallBudget: null,
  createdAt: "2026-07-01T00:00:00.000Z",
  updatedAt: "2026-07-01T00:00:00.000Z",
  viewed: false,
  inspirationImages: [],
  projectDocuments: [],
  siteImages: [],
  projectScopes: [],
  ...partial,
});

describe("buildEnquiriesFromProjects", () => {
  const projects = [
    project({ id: 2, projectName: "Sunrise Villa" }),
    project({ id: 3, projectName: "Lakeview Residence", projectType: "Commercial" }),
  ];

  const records = buildEnquiriesFromProjects(projects);

  it("creates exactly one record per backend project", () => {
    expect(records).toHaveLength(2);
  });

  it("uses the backend project name as the enquiry title", () => {
    expect(records.map((r) => r.title)).toEqual(["Sunrise Villa", "Lakeview Residence"]);
  });

  it("keeps earliest-listed fields defaulted when the backend provides none", () => {
    for (const record of records) {
      expect(record.clientName).toBe("—");
      expect(record.location).toBe("—");
      expect(record.source).toBe("website");
      expect(record.status).toBe("active");
      expect(record.stage).toBe("new");
      expect(record.budgetMin).toBe(0);
      expect(record.budgetMax).toBe(0);
      expect(record.nextAction.type).toBe("review_enquiry");
    }
  });

  it("uses created_at as the received date", () => {
    expect(records[0].receivedAt).toBe("2026-07-01T00:00:00.000Z");
  });

  it("uses a fallback thumbnail when the backend has no cover image", () => {
    expect(records[0].thumbnailUrl).toBe("/assets/projects/greenfield-villa.png");
  });

  it("maps the linked client name and site place from the backend", () => {
    const withClient = buildEnquiriesFromProjects([
      project({ clientName: "Rahul Menon", place: "Kochi" }),
    ]);
    expect(withClient[0].clientName).toBe("Rahul Menon");
    expect(withClient[0].location).toBe("Kochi");
  });

  it("defaults client and place to em-dashes when the backend provides none", () => {
    const missing = buildEnquiriesFromProjects([project({ clientName: null, place: null })]);
    expect(missing[0].clientName).toBe("—");
    expect(missing[0].location).toBe("—");
  });

  it("passes through the backend site image URL list untouched", () => {
    const withImages = buildEnquiriesFromProjects([
      project({
        siteImages: ["/assets/nila-thumb1.jpg", "/assets/scattered.webp"],
      }),
    ]);
    expect(withImages[0].siteImages).toEqual(["/assets/nila-thumb1.jpg", "/assets/scattered.webp"]);
  });

  it("keeps site images empty when the backend provides none", () => {
    const withoutImages = buildEnquiriesFromProjects([project({ siteImages: [] })]);
    expect(withoutImages[0].siteImages).toEqual([]);
  });

  it("passes through backend project documents with name and doc_img_url", () => {
    const withDocs = buildEnquiriesFromProjects([
      project({
        projectDocuments: [
          { id: 306, name: "Feasibility Study.pdf", docImageUrl: "/assets/nila-thumb1.jpg" },
          { id: 307, name: "Concept Proposal.pdf", docImageUrl: null },
        ],
      }),
    ]);
    expect(withDocs[0].projectDocuments).toEqual([
      { id: 306, name: "Feasibility Study.pdf", docImageUrl: "/assets/nila-thumb1.jpg" },
      { id: 307, name: "Concept Proposal.pdf", docImageUrl: null },
    ]);
  });
});

describe("mapBackendProjectType", () => {
  it("maps residential project types", () => {
    expect(mapBackendProjectType(project({ projectType: "Residential" }))).toBe("residential");
  });

  it("maps commercial-type projects", () => {
    expect(mapBackendProjectType(project({ projectType: "Office" }))).toBe("commercial");
    expect(mapBackendProjectType(project({ projectType: "Industrial" }))).toBe("commercial");
  });

  it("defaults to residential for unknown or missing types", () => {
    expect(mapBackendProjectType(project({ projectType: "Hut" }))).toBe("residential");
    expect(mapBackendProjectType(project({ projectType: null }))).toBe("residential");
  });
});