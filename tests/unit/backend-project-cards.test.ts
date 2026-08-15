import { describe, expect, it } from "vitest";
import {
  ACCEPTED_PROJECT_PHASE_LABEL,
  PROJECT_CHARACTER_PR,
  buildProjectCardsFromBackend,
} from "@/features/projects/utils/backend-project-cards";
import type { BackendProject } from "@/types/domain/backend-project";

function makeProject(overrides: Partial<BackendProject> = {}): BackendProject {
  return {
    id: 6,
    projectName: "Skyline Heights Phase II",
    projectType: "Residential",
    buildingType: null,
    projectCharacter: PROJECT_CHARACTER_PR,
    newConstructionOrRenovation: null,
    purposeOfProject: null,
    briefDescription: null,
    coverImageUrl: null,
    sqArea: null,
    clientExpectedTimeline: null,
    clientName: "Rajan & Preethi Pillai",
    place: "Thiruvananthapuram",
    estimatedOverallBudget: null,
    createdAt: 1750000000,
    updatedAt: 1750000000,
    viewed: false,
    inspirationImages: [],
    projectDocuments: [],
    siteImages: [],
    projectScopes: [],
    requirements: [],
    ...overrides,
  };
}

describe("buildProjectCardsFromBackend", () => {
  it("maps backend 'pr' projects to cards using only backend fields", () => {
    const cards = buildProjectCardsFromBackend([
      makeProject({
        id: 6,
        siteImages: ["/assets/nila-thumb1.jpg"],
      }),
    ]);

    expect(cards).toHaveLength(1);
    expect(cards[0]).toMatchObject({
      id: "prj-6",
      name: "Skyline Heights Phase II",
      type: "Residential",
      location: "Thiruvananthapuram",
      clientDisplayName: "Rajan & Preethi Pillai",
      phase: ACCEPTED_PROJECT_PHASE_LABEL,
      status: "UPCOMING",
      image: "/assets/nila-thumb1.jpg",
    });
    // Health, progress, due-date and next-action have no backend source:
    // the card must not fabricate claims for them.
    expect(cards[0].health).toBeUndefined();
    expect(cards[0].phaseProgress).toBeUndefined();
    expect(cards[0].dueLabel).toBeNull();
    expect(cards[0].nextActionTitle).toBeNull();
  });

  it("uses the backend cover_image_url first, then falls back through site and inspiration images", () => {
    const viaCover = buildProjectCardsFromBackend([
      makeProject({
        coverImageUrl: "https://images.unsplash.com/photo-1777115470083-950377731c61?q=80",
        siteImages: ["/assets/project-banner.jpg"],
      }),
    ]);
    expect(viaCover[0].image).toBe("https://images.unsplash.com/photo-1777115470083-950377731c61?q=80");

    const viaSite = buildProjectCardsFromBackend([
      makeProject({
        coverImageUrl: null,
        siteImages: ["/assets/project-banner.jpg"],
      }),
    ]);
    expect(viaSite[0].image).toBe("/assets/project-banner.jpg");

    const viaInspiration = buildProjectCardsFromBackend([
      makeProject({
        inspirationImages: [{ url: "https://images.pexels.com/photos/1/x.jpeg", alt: "Villa concept 1" }],
      }),
    ]);
    expect(viaInspiration[0].image).toBe("https://images.pexels.com/photos/1/x.jpeg");

    const noMedia = buildProjectCardsFromBackend([makeProject()]);
    expect(noMedia[0].image).toBe("");
  });

  it("derives the phase pill label only for the accepted character", () => {
    const prCard = buildProjectCardsFromBackend([makeProject()]);
    expect(prCard[0].phase).toBe(ACCEPTED_PROJECT_PHASE_LABEL);

    const nonPrCard = buildProjectCardsFromBackend([
      makeProject({ projectCharacter: "enq" }),
    ]);
    expect(nonPrCard[0].phase).toBeNull();
  });
});
