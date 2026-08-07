import { describe, expect, it } from "vitest";
import { getPortfolioPageData } from "@/features/portfolio/data/portfolio.mock";
import { buildPortfolioEnquiryHref } from "@/features/portfolio/utils/portfolio-enquiry-state";
import {
  buildPortfolioQuery,
  getPortfolioTabs,
  parsePortfolioTab,
} from "@/features/portfolio/utils/portfolio-query-state";

describe("portfolio visibility and query state", () => {
  it("keeps owner statistics and drafts available to the owner", () => {
    const data = getPortfolioPageData(true);

    expect(data.mode).toBe("owner");
    expect(data.statistics.map((statistic) => statistic.value)).toEqual([
      "24+",
      "8+",
      "4.8",
      "98%",
      "156",
    ]);
    expect(data.drafts).toHaveLength(3);
    expect(
      data.projects.every(
        (project) =>
          project.visibility === "public" &&
          project.status !== "draft" &&
          project.status !== "archived",
      ),
    ).toBe(true);
    expect(data.projects[0]).toMatchObject({
      title: "Nila Residence",
      slug: "nila-residence",
      projectType: "residential",
      status: "completed",
      builtUpArea: { value: 3200, unit: "sq_ft" },
      siteArea: { value: 8.5, unit: "cent" },
    });
    expect(getPortfolioTabs(true)).toContain("pricing");
  });

  it("does not serialize draft, private or archived projects for public visitors", () => {
    const data = getPortfolioPageData(false);

    expect(data.mode).toBe("public");
    expect(data.drafts).toEqual([]);
    expect(
      data.projects.every(
        (project) =>
          project.visibility === "public" &&
          project.status !== "draft" &&
          project.status !== "archived",
      ),
    ).toBe(true);
    expect(
      data.drawings.every(
        (drawing) =>
          drawing.visibility === "public" &&
          drawing.issueStatus === "Published",
      ),
    ).toBe(true);
    expect(
      data.siteProgress.every((update) => update.visibility === "public"),
    ).toBe(true);
    expect(data.statistics.map((statistic) => statistic.label)).toEqual([
      "Projects Completed",
      "Years Experience",
      "(32 Reviews)",
      "Client Satisfaction",
      "Followers",
    ]);
    expect(JSON.stringify(data)).not.toMatch(
      /software|saas|react|frontend|product platform|digital product/i,
    );
    expect(getPortfolioTabs(false)).toEqual([
      "projects",
      "case-studies",
      "tagged",
      "reviews",
      "pricing",
    ]);
  });

  it("rejects invalid tabs in public mode and preserves other URL state", () => {
    expect(parsePortfolioTab("invalid", false)).toBe("projects");
    expect(parsePortfolioTab("pricing", true)).toBe("pricing");
    expect(parsePortfolioTab("unknown", true)).toBe("projects");

    const query = buildPortfolioQuery(
      new URLSearchParams("view=public&project=nila-residence"),
      "reviews",
    );
    expect(query).toContain("view=public");
    expect(query).toContain("portfolioTab=reviews");
    expect(query).not.toContain("project=");
  });

  it("retains provider and project context when entering the enquiry workflow", () => {
    const data = getPortfolioPageData(false);
    const project = data.projects[0];
    const href = buildPortfolioEnquiryHref(
      data.profile,
      "consultation",
      project,
    );
    const query = new URL(href, "https://kallisto.local").searchParams;

    expect(query.get("providerId")).toBe("arjun-architects");
    expect(query.get("intent")).toBe("consultation");
    expect(query.get("source")).toBe("portfolio");
    expect(query.get("projectReference")).toBe(project.id);
    expect(query.get("projectType")).toBe(project.projectType);
    expect(query.get("projectLocation")).toBe("Kochi, Kerala");
    expect(query.get("servicesViewed")).toContain("Architecture");
  });
});
