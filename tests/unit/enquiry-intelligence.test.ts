import { describe, it, expect } from "vitest";
import { EnquiryRecord, EnquiryRequirement } from "../../features/enquiries/types/enquiry.types";
import {
  isRequirementBlocking,
  deriveRequirementStrength,
  deriveOpportunityFit,
  deriveProposalReadiness,
  deriveRecommendedAction,
  deriveEnquiryIntelligence,
  deriveContextualOdinInsights,
} from "../../features/enquiries/services/enquiry-intelligence";
import { buildEnquiryDetailViewModel } from "../../features/enquiries/detail/services/enquiry-detail-view-model";

const BASE_ENQUIRY: EnquiryRecord = {
  id: "enq-test-1",
  title: "Commercial Office Design",
  requirementSummary: "Office fitout requirement",
  clientName: "Greenleaf Spaces",
  location: "Bengaluru",
  thumbnailUrl: "/assets/projects/greenfield-villa.png",
  source: "website",
  status: "active",
  stage: "new",
  projectType: "commercial",
  budgetMin: 4000000,
  budgetMax: 6000000,
  receivedAt: "2026-07-23T10:00:00.000Z",
  nextAction: { type: "review_enquiry", label: "Review enquiry" },
};

describe("Enquiry Intelligence Selectors & Policy Rules", () => {
  describe("isRequirementBlocking policy selector", () => {
    it("returns true for P1 requirement in needs_clarification state", () => {
      const req: EnquiryRequirement = {
        id: "r1",
        category: "budget",
        label: "Execution budget",
        state: "needs_clarification",
        source: "client",
        priority: "p1",
      };
      expect(isRequirementBlocking(req)).toBe(true);
    });

    it("returns true for P1 requirement in partial or needs_verification state", () => {
      const reqPartial: EnquiryRequirement = {
        id: "r2",
        category: "technical",
        label: "MEP load",
        state: "partial",
        source: "document",
        priority: "p1",
      };
      const reqVerify: EnquiryRequirement = {
        id: "r3",
        category: "site",
        label: "Floor plan DWG",
        state: "needs_verification",
        source: "document",
        priority: "p1",
      };
      expect(isRequirementBlocking(reqPartial)).toBe(true);
      expect(isRequirementBlocking(reqVerify)).toBe(true);
    });

    it("returns false for P1 requirement in confirmed or odin_inferred state", () => {
      const reqConfirmed: EnquiryRequirement = {
        id: "r4",
        category: "space",
        label: "Workstation count",
        state: "confirmed",
        source: "client",
        priority: "p1",
      };
      const reqInferred: EnquiryRequirement = {
        id: "r5",
        category: "vision",
        label: "Modern aesthetic",
        state: "odin_inferred",
        source: "odin",
        priority: "p1",
      };
      expect(isRequirementBlocking(reqConfirmed)).toBe(false);
      expect(isRequirementBlocking(reqInferred)).toBe(false);
    });

    it("returns false for not_applicable requirements regardless of priority", () => {
      const req: EnquiryRequirement = {
        id: "r6",
        category: "outdoor",
        label: "Landscaping",
        state: "not_applicable",
        source: "service_provider",
        priority: "p0",
      };
      expect(isRequirementBlocking(req)).toBe(false);
    });

    it("returns false for P2 requirements even if not_provided", () => {
      const req: EnquiryRequirement = {
        id: "r7",
        category: "style",
        label: "Preferred accent color",
        state: "not_provided",
        source: "client",
        priority: "p2",
      };
      expect(isRequirementBlocking(req)).toBe(false);
    });
  });

  describe("deriveRequirementStrength (Weighted calculation)", () => {
    it("excludes not_applicable items from denominator", () => {
      const enquiryWithNA: EnquiryRecord = {
        ...BASE_ENQUIRY,
        requirements: [
          { id: "1", category: "space", label: "Area", state: "confirmed", source: "client", priority: "p1" },
          { id: "2", category: "outdoor", label: "Pool", state: "not_applicable", source: "service_provider", priority: "p1" },
        ],
      };
      const result = deriveRequirementStrength(enquiryWithNA);
      expect(result.score).toBe(100);
      expect(result.totalSignals).toBe(1);
    });

    it("calculates priority-weighted strength correctly", () => {
      const enquiry: EnquiryRecord = {
        ...BASE_ENQUIRY,
        requirements: [
          // p0 (weight 3), confirmed (1.0) -> earned 3.0
          { id: "1", category: "space", label: "Scope", state: "confirmed", source: "client", priority: "p0" },
          // p1 (weight 2), partial (0.5) -> earned 1.0
          { id: "2", category: "budget", label: "Budget", state: "partial", source: "client", priority: "p1" },
        ],
      };
      // Total weight = 3 + 2 = 5. Earned weight = 3.0 + 1.0 = 4.0. 4/5 = 80%.
      const result = deriveRequirementStrength(enquiry);
      expect(result.score).toBe(80);
      expect(result.label).toBe("High Confidence");
    });
  });

  describe("deriveOpportunityFit (Missing Provider Context Fallbacks)", () => {
    it("handles missing providerContext gracefully with 'Not enough data' for availability", () => {
      const fit = deriveOpportunityFit(BASE_ENQUIRY);
      expect(fit.factors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            key: "availability",
            status: "unknown",
            reason: "Not enough data",
          }),
        ])
      );
      expect(fit.confidence).toBe("medium");
    });

    it("evaluates team availability when providerContext is supplied", () => {
      const fit = deriveOpportunityFit(BASE_ENQUIRY, {
        teamAvailability: "available",
      });
      expect(fit.factors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            key: "availability",
            status: "match",
            reason: "Field team is available for target start date",
          }),
        ])
      );
      expect(fit.confidence).toBe("high");
    });
  });

  describe("deriveProposalReadiness", () => {
    it("returns PARTIAL when P1 blockers exist", () => {
      const enquiryWithBlocker: EnquiryRecord = {
        ...BASE_ENQUIRY,
        requirements: [
          { id: "1", category: "budget", label: "Execution budget", state: "needs_clarification", source: "client", priority: "p1" },
        ],
      };
      const readiness = deriveProposalReadiness(enquiryWithBlocker);
      expect(readiness.state).toBe("PARTIAL");
      expect(readiness.criticalGapCount).toBe(1);
    });

    it("returns READY when all P1 requirements are confirmed or non-blocking", () => {
      const enquiryReady: EnquiryRecord = {
        ...BASE_ENQUIRY,
        requirements: [
          { id: "1", category: "budget", label: "Execution budget", state: "confirmed", source: "client", priority: "p1" },
          { id: "2", category: "style", label: "Color theme", state: "not_provided", source: "client", priority: "p2" },
        ],
      };
      const readiness = deriveProposalReadiness(enquiryReady);
      expect(readiness.state).toBe("READY");
      expect(readiness.criticalGapCount).toBe(0);
    });
  });

  describe("deriveRecommendedAction (Deterministic Mapping)", () => {
    it("recommends Request Clarification for Review + PARTIAL readiness", () => {
      const action = deriveRecommendedAction(BASE_ENQUIRY, "PARTIAL");
      expect(action.primaryAction.type).toBe("request_clarification");
      expect(action.secondaryActions.map((a) => a.type)).toContain("accept_enquiry");
    });

    it("recommends Accept Enquiry for Review + READY readiness", () => {
      const action = deriveRecommendedAction(BASE_ENQUIRY, "READY");
      expect(action.primaryAction.type).toBe("accept_enquiry");
    });

    it("recommends Create Proposal when stage is accepted and proposalStatus is none", () => {
      const acceptedEnquiry: EnquiryRecord = {
        ...BASE_ENQUIRY,
        stage: "accepted",
        proposalStatus: "none",
      };
      const action = deriveRecommendedAction(acceptedEnquiry, "READY");
      expect(action.primaryAction.type).toBe("create_proposal");
    });

    it("recommends View Proposal when stage is accepted and proposal is created", () => {
      const acceptedWithProposal: EnquiryRecord = {
        ...BASE_ENQUIRY,
        stage: "accepted",
        proposalStatus: "sent",
      };
      const action = deriveRecommendedAction(acceptedWithProposal, "READY");
      expect(action.primaryAction.type).toBe("open_proposal");
    });
  });

  describe("deriveContextualOdinInsights (Tab-specific contextual synthesis)", () => {
    it("returns requirements-focused insights for requirements scope", () => {
      const insights = deriveContextualOdinInsights(BASE_ENQUIRY, "requirements");
      expect(insights.length).toBeGreaterThanOrEqual(4);
      expect(insights.some((i) => i.severity === "blocker")).toBe(true);
      expect(insights.some((i) => i.action?.label === "Add question")).toBe(true);
    });

    it("returns evidence-focused insights for evidence scope", () => {
      const insights = deriveContextualOdinInsights(BASE_ENQUIRY, "evidence");
      expect(insights.length).toBeGreaterThanOrEqual(4);
      expect(insights.some((i) => i.text.toLowerCase().includes("dwg") || i.text.toLowerCase().includes("site"))).toBe(true);
    });

    it("returns client-focused insights for client scope", () => {
      const insights = deriveContextualOdinInsights(BASE_ENQUIRY, "client");
      expect(insights.length).toBeGreaterThanOrEqual(4);
      expect(insights.some((i) => i.text.toLowerCase().includes("client") || i.text.toLowerCase().includes("budget"))).toBe(true);
    });

    it("returns decision summary insights for intelligence scope", () => {
      const insights = deriveContextualOdinInsights(BASE_ENQUIRY, "intelligence");
      expect(insights.length).toBeGreaterThanOrEqual(4);
      expect(insights.some((i) => i.text.toLowerCase().includes("proposal") || i.text.toLowerCase().includes("opportunity fit"))).toBe(true);
    });

    it("returns activity and lifecycle insights for activity scope", () => {
      const insights = deriveContextualOdinInsights(BASE_ENQUIRY, "activity");
      expect(insights.length).toBeGreaterThanOrEqual(4);
      expect(insights.some((i) => i.text.toLowerCase().includes("clarification") || i.text.toLowerCase().includes("requirement strength"))).toBe(true);
    });
  });

  describe("buildEnquiryDetailViewModel", () => {
    it("constructs full view model without mutating EnquiryRecord", () => {
      const originalRecord: EnquiryRecord = { ...BASE_ENQUIRY };
      const vm = buildEnquiryDetailViewModel({ enquiry: originalRecord });

      expect(vm.enquiryId).toBe("enq-test-1");
      expect(vm.header.title).toBe("Commercial Office Design");
      expect(vm.intelligence.requirementStrength.score).toBeGreaterThan(0);
      expect(vm.intelligence.opportunityFit.score).toBeGreaterThan(0);
      expect(originalRecord).toEqual(BASE_ENQUIRY); // Intact source of truth
    });
  });
});
