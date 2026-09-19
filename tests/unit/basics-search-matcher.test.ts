import { describe, expect, it } from "vitest";
import { matchesFuzzyQuery, stemToken, levenshtein } from "@/features/basics/lib/basics-search-matcher";
import { basicsProviderRepository } from "@/features/basics/repositories/basics-repositories";

describe("Basics Intelligent Search & Spell-tolerance", () => {
  it("correctly matches architectural keywords when searching 'Architecture'", async () => {
    const results = await basicsProviderRepository.listProviders({ q: "Architecture" });
    expect(results.length).toBeGreaterThan(0);
    const names = results.map((r) => r.name);
    // Should match RenderField Studio (Architectural Visualization), Studio Canopy (Landscape Design / design_architecture), Echo Acoustic Lab (Architectural Acoustics)
    expect(names).toContain("RenderField Studio");
    expect(names).toContain("Echo Acoustic Lab");
    expect(names).toContain("Studio Canopy");
  });

  it("handles spelling mistakes and typos with fuzzy matching", async () => {
    // Typos: "architechture", "archtecture"
    const resultsTypo1 = await basicsProviderRepository.listProviders({ q: "architechture" });
    expect(resultsTypo1.length).toBeGreaterThan(0);
    expect(resultsTypo1.some((r) => r.name === "RenderField Studio")).toBe(true);

    // Typo: "sturctural" -> matches Axis Structures, BeamWorks Structural
    const resultsTypo2 = await basicsProviderRepository.listProviders({ q: "sturctural" });
    expect(resultsTypo2.length).toBeGreaterThan(0);
    expect(resultsTypo2.some((r) => r.name.includes("Structural") || r.name.includes("Structures"))).toBe(true);

    // Typo: "electical" -> matches Circuit MEP Design
    const resultsTypo3 = await basicsProviderRepository.listProviders({ q: "electical" });
    expect(resultsTypo3.length).toBeGreaterThan(0);
    expect(resultsTypo3.some((r) => r.name === "Circuit MEP Design")).toBe(true);
  });

  it("stems and computes Levenshtein distance properly", () => {
    expect(stemToken("architectural")).toBe("architect");
    expect(stemToken("architecture")).toBe("architect");
    expect(stemToken("structural")).toBe("structur");
    expect(levenshtein("architechture", "architecture")).toBeLessThanOrEqual(2);
    expect(levenshtein("sturctural", "structural")).toBeLessThanOrEqual(2);
  });

  it("matches providers to a requirement based on category, specialization, and location", async () => {
    const { matchProvidersToRequirement } = await import("@/features/basics/lib/basics-search-matcher");
    const providers = await basicsProviderRepository.listProviders();
    const matches = matchProvidersToRequirement(
      {
        category: "engineering",
        specialization: "Structural Engineering",
        location: "Trivandrum, Kerala",
        projectType: "residential",
      },
      providers,
    );

    expect(matches.length).toBeGreaterThan(0);
    // Gridline Engineering is in Thiruvananthapuram (Trivandrum) with Structural Peer Review
    // Axis Structures is in Kochi with RCC Structural Design
    // BeamWorks is in Kottayam with Steel and RCC Structures
    const topMatches = matches.slice(0, 3).map((m) => m.provider.name);
    expect(topMatches.some((name) => name.includes("Gridline") || name.includes("Axis") || name.includes("BeamWorks"))).toBe(true);
    expect(matches[0].matchScore).toBeGreaterThanOrEqual(70);
    expect(matches[0].matchReasons.length).toBeGreaterThan(0);
  });
});

