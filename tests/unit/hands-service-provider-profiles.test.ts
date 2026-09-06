import { describe, it, expect } from "vitest";
import {
  findServiceProvider,
  getServiceProviderPortfolioData,
  getServiceProviderDetailedProject,
  getProviderDisplayDetails,
  SERVICE_PROVIDER_RECORDS,
} from "@/partner-app/hands/mock/provider-profiles-mock-data";

describe("Hands Service Provider Profiles & Portfolio Integration", () => {
  it("resolves Skyline Builders & Developers profile when requested via requestId KH-R-1025", () => {
    const data = getServiceProviderPortfolioData({
      requestId: "KH-R-1025",
      isOwner: false,
    });

    expect(data.profile.name).toBe("Skyline Builders & Developers");
    expect(data.profile.location).toBe("Trivandrum, Kerala");
    expect(data.profile.profession).toContain("Civil Contractor");
    expect(data.profile.verified).toBe(true);
    expect(data.projects.length).toBeGreaterThanOrEqual(3);
    expect(data.projects.some((p) => p.title === "Skyline Apartments")).toBe(true);
    expect(data.projects.some((p) => p.title === "Skyline Waterfront Towers")).toBe(true);
  });

  it("resolves Greenwood Infra Projects Ltd profile when requested by provider query", () => {
    const data = getServiceProviderPortfolioData({
      providerQuery: "Greenwood Infra Projects Ltd",
      isOwner: false,
    });

    expect(data.profile.name).toBe("Greenwood Infra Projects Ltd");
    expect(data.profile.location).toBe("Kazhakkoottam, Kerala");
    expect(data.projects.some((p) => p.title === "Greenwood Residency")).toBe(true);
  });

  it("resolves Sobha Developers Kerala when requested by alias Sobha", () => {
    const provider = findServiceProvider({
      providerQuery: "Sobha",
    });

    expect(provider).not.toBeNull();
    expect(provider?.name).toBe("Sobha Developers Kerala");
    expect(provider?.location).toBe("Thrissur City, Kerala");
  });

  it("dynamically generates a robust profile with related projects for an arbitrary provider", () => {
    const data = getServiceProviderPortfolioData({
      providerQuery: "Calicut Apex Constructions",
      isOwner: false,
    });

    expect(data.profile.name).toBe("Calicut Apex Constructions");
    expect(data.profile.websiteLabel).toBe("calicutapexconstructions.com");
    expect(data.projects.length).toBe(1);
    expect(data.projects[0].description).toBeDefined();
    expect(data.projects[0].tags.length).toBeGreaterThan(0);
  });

  it("retrieves detailed project for service provider projects without returning null", () => {
    const project = getServiceProviderDetailedProject("skyline-apartments");

    expect(project).not.toBeNull();
    expect(project?.title).toBe("Skyline Apartments");
    expect(project?.builtUpArea?.value).toBe(145000);
    expect(project?.description).toBeDefined();
    expect(project?.tags).toBeDefined();
    expect(project?.gallery.length).toBeGreaterThan(0);
  });

  it("ensures all service provider projects satisfy PortfolioProject contracts", () => {
    for (const record of SERVICE_PROVIDER_RECORDS) {
      expect(record.name).toBeTruthy();
      expect(record.projects.length).toBeGreaterThan(0);
      for (const project of record.projects) {
        expect(project.id).toBeTruthy();
        expect(project.title).toBeTruthy();
        expect(project.description).toBeTruthy();
        expect(Array.isArray(project.tags)).toBe(true);
        expect(Array.isArray(project.gallery)).toBe(true);
        expect(typeof project.featured).toBe("boolean");
        expect(["public", "private"]).toContain(project.visibility);
      }
    }
  });

  it("extracts clean display details (name and concise profession) via getProviderDisplayDetails", () => {
    const greenwood = getProviderDisplayDetails("Greenwood Infra Projects Ltd", "Mason");
    expect(greenwood.name).toBe("Greenwood Infra Projects Ltd");
    expect(greenwood.profession).toBe("General Building Contractor");

    const skyline = getProviderDisplayDetails("Skyline Builders & Developers", "Carpenter");
    expect(skyline.name).toBe("Skyline Builders & Developers");
    expect(skyline.profession).toBe("Civil Contractor & Infrastructure Developers");

    const azure = getProviderDisplayDetails("Azure Ocean Properties", "Electrician");
    expect(azure.name).toBe("Azure Ocean Properties");
    expect(azure.profession).toBe("Waterfront Luxury Developments");

    const hilite = getProviderDisplayDetails("Hilite Urban Living", "Steel Fixer");
    expect(hilite.name).toBe("Hilite Urban Living");
    expect(hilite.profession).toBe("Commercial & Mixed-Use Infrastructure");

    const sobha = getProviderDisplayDetails("Sobha Developers Kerala", "Tile Worker");
    expect(sobha.name).toBe("Sobha Developers Kerala");
    expect(sobha.profession).toBe("Premium Residential & Commercial Contractor");

    const pranavam = getProviderDisplayDetails("Pranavam Convention Hospitality", "Painter");
    expect(pranavam.name).toBe("Pranavam Convention Hospitality");
    expect(pranavam.profession).toBe("Large-Span Institutional & Event Venues");
  });

  it("resolves all active requisition requests to their exact provider profile", () => {
    const r1 = getServiceProviderPortfolioData({ requestId: "KH-R-1024" });
    expect(r1.profile.name).toBe("Greenwood Infra Projects Ltd");

    const r2 = getServiceProviderPortfolioData({ requestId: "KH-R-1025" });
    expect(r2.profile.name).toBe("Skyline Builders & Developers");

    const r3 = getServiceProviderPortfolioData({ requestId: "KH-R-1026" });
    expect(r3.profile.name).toBe("Azure Ocean Properties");

    const r4 = getServiceProviderPortfolioData({ requestId: "KH-R-1027" });
    expect(r4.profile.name).toBe("Hilite Urban Living");

    const r5 = getServiceProviderPortfolioData({ requestId: "KH-R-1018" });
    expect(r5.profile.name).toBe("Sobha Developers Kerala");

    const r6 = getServiceProviderPortfolioData({ requestId: "KH-R-1019" });
    expect(r6.profile.name).toBe("Pranavam Convention Hospitality");
  });

  it("defaults to a verified service provider when visiting /partner/hands/profile without query params", () => {
    const defaultData = getServiceProviderPortfolioData({});
    expect(defaultData.profile.name).toBe("Skyline Builders & Developers");
    expect(defaultData.profile.profession).toContain("Civil Contractor");
    expect(defaultData.projects.length).toBeGreaterThanOrEqual(1);
  });
});
