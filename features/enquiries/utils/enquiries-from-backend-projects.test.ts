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
  sqArea: 3100,
  clientExpectedTimeline: "6-9 months",
  clientName: null,
  place: null,
  estimatedOverallBudget: null,
  createdAt: 1782864000,
  updatedAt: 1782864000,
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

  it("maps the backend viewed flag onto the enquiry record", () => {
    const unviewed = buildEnquiriesFromProjects([
      project({ id: 7, viewed: false }),
    ]);
    expect(unviewed[0].viewed).toBe(false);

    const viewed = buildEnquiriesFromProjects([
      project({ id: 8, viewed: true }),
    ]);
    expect(viewed[0].viewed).toBe(true);

    // Strictly backend-sourced: an absent flag must never render as viewed.
    const absent = buildEnquiriesFromProjects([
      project({ id: 9, viewed: undefined as unknown as boolean }),
    ]);
    expect(absent[0].viewed).toBe(false);
  });

  it("uses created_at as the received date, never updated_at", () => {
    expect(records[0].receivedAt).toBe("2026-07-01T00:00:00.000Z");

    const stale = buildEnquiriesFromProjects([
      // created_at differs from updated_at: receivedAt must come from
      // created_at only.
      project({ createdAt: 1782864000, updatedAt: 1785024000 }),
    ]);
    expect(stale[0].receivedAt).toBe("2026-07-01T00:00:00.000Z");
  });

  it("uses a fallback thumbnail when the backend has no cover image", () => {
    expect(records[0].thumbnailUrl).toBe("/assets/projects/greenfield-villa.png");
  });

  it("maps the backend sq_area onto the enquiry record", () => {
    const withArea = buildEnquiriesFromProjects([
      project({ sqArea: 3100 }),
    ]);
    expect(withArea[0].sqArea).toBe("3,100 sq ft");

    const withoutArea = buildEnquiriesFromProjects([project({ sqArea: null })]);
    expect(withoutArea[0].sqArea).toBeUndefined();
  });

  it("maps the backend project scopes with nested sub-lists", () => {
    const withScopes = buildEnquiriesFromProjects([
      project({
        projectScopes: [
          { id: 11, scope_name: "Architecture", items: ["Concept design", "Working drawings"] },
          { id: 12, scope_name: "Interiors", items: ["Space planning"] },
        ],
      }),
    ]);
    expect(withScopes[0].projectScopes).toEqual([
      { id: 11, scope_name: "Architecture", items: ["Concept design", "Working drawings"] },
      { id: 12, scope_name: "Interiors", items: ["Space planning"] },
    ]);

    const withoutScopes = buildEnquiriesFromProjects([project({ projectScopes: [] })]);
    expect(withoutScopes[0].projectScopes).toEqual([]);
  });

  it("maps client_expected_timeline onto the enquiry record", () => {
    const withTimeline = buildEnquiriesFromProjects([
      project({ clientExpectedTimeline: "6-9 months" }),
    ]);
    expect(withTimeline[0].timeline).toBe("6-9 months");

    const withoutTimeline = buildEnquiriesFromProjects([
      project({ clientExpectedTimeline: null }),
    ]);
    expect(withoutTimeline[0].timeline).toBeUndefined();
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

  it("maps estimated overall budget from project_budget into a pre-formatted value", () => {
    const withBudget = buildEnquiriesFromProjects([
      project({ estimatedOverallBudget: 25_000_000 }),
    ]);
    expect(withBudget[0].budget).toBe("₹2.5Cr");
    expect(withBudget[0].budgetMin).toBe(0);
    expect(withBudget[0].budgetMax).toBe(0);

    const withoutBudget = buildEnquiriesFromProjects([project({ estimatedOverallBudget: null })]);
    expect(withoutBudget[0].budget).toBeUndefined();
  });

  it("accepts a numeric-string budget value from the text column", () => {
    const withStringBudget = buildEnquiriesFromProjects([
      // The database column is TEXT, so the backend may deliver a string.
      project({ estimatedOverallBudget: "2500000" as unknown as number }),
    ]);
    expect(withStringBudget[0].budget).toBe("₹25L");
  });

  it("maps the backend inspiration gallery onto the enquiry record", () => {
    const withImages = buildEnquiriesFromProjects([
      project({
        inspirationImages: [
          { url: "/assets/projectbg.webp", alt: "Modern Architectural Structure" },
          { url: "/assets/nila-thumb1.jpg", alt: "Entrance Facade Architecture" },
        ],
      }),
    ]);
    expect(withImages[0].inspirationImages).toEqual([
      { url: "/assets/projectbg.webp", alt: "Modern Architectural Structure" },
      { url: "/assets/nila-thumb1.jpg", alt: "Entrance Facade Architecture" },
    ]);
  });

  it("maps an empty inspiration gallery as an empty list (strictly backend-sourced)", () => {
    const records = buildEnquiriesFromProjects([project({ inspirationImages: [] })]);
    expect(records[0].inspirationImages).toEqual([]);
  });

  it("maps the backend project documents onto the enquiry record", () => {
    const withDocs = buildEnquiriesFromProjects([
      project({
        projectDocuments: [
          { id: 11, name: "Client Requirements.pdf", docImageUrl: "/assets/manual.webp" },
          { id: 12, name: "Brand Guidelines.pdf", docImageUrl: null },
        ],
      }),
    ]);
    expect(withDocs[0].documents).toEqual([
      { id: 11, name: "Client Requirements.pdf", docImageUrl: "/assets/manual.webp" },
      { id: 12, name: "Brand Guidelines.pdf", docImageUrl: null },
    ]);
  });

  it("maps an absent document list as an empty list (strictly backend-sourced)", () => {
    const records = buildEnquiriesFromProjects([
      project({ projectDocuments: [] }),
    ]);
    expect(records[0].documents).toEqual([]);
  });

  it("maps the backend site images list onto the enquiry record", () => {
    const withImages = buildEnquiriesFromProjects([
      project({
        siteImages: [
          "/assets/nila-thumb1.jpg",
          "/assets/nila-thumb2.jpg",
          "/assets/nila-thumb3.jpg",
        ],
      }),
    ]);
    expect(withImages[0].siteImages).toEqual([
      "/assets/nila-thumb1.jpg",
      "/assets/nila-thumb2.jpg",
      "/assets/nila-thumb3.jpg",
    ]);
  });

  it("maps an empty site image list as an empty list (strictly backend-sourced)", () => {
    const records = buildEnquiriesFromProjects([project({ siteImages: [] })]);
    expect(records[0].siteImages).toEqual([]);
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