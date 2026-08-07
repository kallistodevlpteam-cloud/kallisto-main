import { describe, expect, it } from "vitest";
import { BASICS_SERVICE_CATALOGUE, getAllBasicsServices } from "@/features/basics/constants/service-catalogue";
import {
  MOCK_BASICS_ENGAGEMENTS,
  MOCK_BASICS_PROPOSALS,
  MOCK_BASICS_PROVIDERS,
  MOCK_BASICS_REQUIREMENTS,
} from "@/features/basics/data/mock-basics-data";
import {
  basicsProviderRepository,
} from "@/features/basics/repositories/basics-repositories";
import {
  approveDeliverable,
  calculateVerifiedRating,
  canEditProposal,
  canReceiveProposals,
  canReviewEngagement,
  canViewRequirement,
  createDeliverableRevision,
  requestDeliverableRevision,
  validateEngagementCompletion,
  validateProposalSubmission,
} from "@/features/basics/services/basics-domain-service";

describe("Basics marketplace foundation", () => {
  it("keeps the service catalogue centralised and unique", () => {
    const services = getAllBasicsServices();

    expect(BASICS_SERVICE_CATALOGUE).toHaveLength(5);
    expect(services.length).toBeGreaterThanOrEqual(12);
    expect(new Set(services).size).toBe(services.length);
    expect(services).toContain("Structural Engineering");
    expect(services).toContain("BIM Coordination");
    expect(services).toContain("Quantity Surveying");
  });

  it("provides the required construction-specific fixture coverage", () => {
    expect(MOCK_BASICS_PROVIDERS.length).toBeGreaterThanOrEqual(20);
    expect(MOCK_BASICS_REQUIREMENTS.length).toBeGreaterThanOrEqual(8);
    expect(MOCK_BASICS_PROPOSALS.length).toBeGreaterThanOrEqual(15);
    expect(
      MOCK_BASICS_ENGAGEMENTS.filter((item) => item.status !== "completed").length,
    ).toBeGreaterThanOrEqual(6);
    expect(
      MOCK_BASICS_ENGAGEMENTS.filter((item) => item.status === "completed").length,
    ).toBeGreaterThanOrEqual(8);
    expect(
      MOCK_BASICS_PROVIDERS.flatMap((provider) => provider.reviews).length,
    ).toBeGreaterThanOrEqual(20);
  });

  it("filters providers using evidence fields", async () => {
    const results = await basicsProviderRepository.listProviders({
      q: "ETABS",
      verified: true,
      minimumRating: 4,
      software: "ETABS",
    });

    expect(results.length).toBeGreaterThan(0);
    expect(
      results.every(
        (provider) =>
          provider.verified &&
          provider.rating >= 4 &&
          provider.softwareSkills.includes("ETABS"),
      ),
    ).toBe(true);
  });
});

describe("Basics business rules", () => {
  it("allows proposals only for open requirements and prevents duplicates", () => {
    const openRequirement = {
      ...MOCK_BASICS_REQUIREMENTS[1],
      status: "open" as const,
    };
    const existing = {
      ...MOCK_BASICS_PROPOSALS[0],
      requirementId: openRequirement.id,
      providerId: "provider-001",
      status: "submitted" as const,
    };

    expect(canReceiveProposals(openRequirement)).toBe(true);
    expect(
      validateProposalSubmission(openRequirement, [existing], "provider-001"),
    ).toContain(
      "A provider cannot submit multiple active proposals to one requirement.",
    );
    expect(
      validateProposalSubmission(
        { ...openRequirement, status: "reviewing" },
        [],
        "provider-002",
      ),
    ).toContain("Only open requirements may receive proposals.");
  });

  it("keeps accepted proposals immutable", () => {
    expect(
      canEditProposal({ ...MOCK_BASICS_PROPOSALS[0], status: "accepted" }),
    ).toBe(false);
    expect(
      canEditProposal({ ...MOCK_BASICS_PROPOSALS[0], status: "draft" }),
    ).toBe(true);
  });

  it("enforces private and draft requirement visibility", () => {
    const privateRequirement = {
      ...MOCK_BASICS_REQUIREMENTS[0],
      ownerId: "owner-1",
      visibility: "private" as const,
      invitedProviderIds: ["provider-001"],
      status: "open" as const,
    };

    expect(canViewRequirement(privateRequirement, "owner-1")).toBe(true);
    expect(
      canViewRequirement(privateRequirement, "other-user", "provider-001"),
    ).toBe(true);
    expect(
      canViewRequirement(privateRequirement, "other-user", "provider-002"),
    ).toBe(false);
    expect(
      canViewRequirement(
        { ...privateRequirement, status: "draft" },
        "other-user",
        "provider-001",
      ),
    ).toBe(false);
  });

  it("calculates public ratings only from verified engagement reviews", () => {
    const reviews = [
      {
        ...MOCK_BASICS_PROVIDERS[0].reviews[0],
        id: "verified",
        rating: 4.8,
        verifiedEngagement: true,
      },
      {
        ...MOCK_BASICS_PROVIDERS[0].reviews[0],
        id: "unverified",
        rating: 1,
        verifiedEngagement: false,
      },
    ];

    expect(calculateVerifiedRating(reviews)).toBe(4.8);
    expect(canReviewEngagement(MOCK_BASICS_ENGAGEMENTS[0])).toBe(false);
    expect(
      canReviewEngagement({ ...MOCK_BASICS_ENGAGEMENTS[0], status: "completed" }),
    ).toBe(true);
  });

  it("preserves approved deliverable versions and creates revisions", () => {
    const source = MOCK_BASICS_ENGAGEMENTS[0].deliverables[0];
    const submitted = createDeliverableRevision(
      { ...source, versions: [] },
      "Structural package Rev 01.pdf",
      "mock://deliverable/v1",
      "Axis Structures",
    );
    const approved = approveDeliverable(submitted, "Arjun Mehta");

    expect(approved.status).toBe("approved");
    expect(approved.versions[0].status).toBe("approved");
    expect(() =>
      requestDeliverableRevision(approved, "Change the column grid."),
    ).toThrow("Approved versions are immutable");

    const revision = createDeliverableRevision(
      approved,
      "Structural package Rev 02.pdf",
      "mock://deliverable/v2",
      "Axis Structures",
    );
    expect(revision.versions).toHaveLength(2);
    expect(revision.versions[0].status).toBe("approved");
    expect(revision.versions[1].version).toBe(2);
  });

  it("blocks completion until deliverables and milestones are approved", () => {
    const active = MOCK_BASICS_ENGAGEMENTS[0];
    expect(validateEngagementCompletion(active)).toContain(
      "All required deliverables must be approved.",
    );

    const complete = {
      ...active,
      deliverables: active.deliverables.map((deliverable) => ({
        ...deliverable,
        status: "approved" as const,
      })),
      milestones: active.milestones.map((milestone) => ({
        ...milestone,
        completionStatus: "completed" as const,
        approvalStatus: "approved" as const,
      })),
      paymentStatus: "paid" as const,
      paymentEvidenceReferences: ["payment-evidence-1"],
    };
    expect(validateEngagementCompletion(complete)).toEqual([]);
  });
});

