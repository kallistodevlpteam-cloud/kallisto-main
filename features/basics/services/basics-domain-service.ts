import type {
  BasicsDeliverable,
  BasicsDeliverableVersion,
  BasicsEngagement,
  BasicsProposal,
  BasicsProposalStatus,
  BasicsRequirement,
  BasicsReview,
} from "../types/basics.types";
import {
  basicsEngagementRepository,
  basicsProposalRepository,
  basicsRequirementRepository,
} from "../repositories/basics-repositories";

const TERMINAL_PROPOSAL_STATUSES: BasicsProposalStatus[] = [
  "accepted",
  "rejected",
  "withdrawn",
];

export function canReceiveProposals(requirement: BasicsRequirement): boolean {
  return requirement.status === "open";
}

export function validateProposalSubmission(
  requirement: BasicsRequirement,
  existingProposals: BasicsProposal[],
  providerId: string,
): string[] {
  const errors: string[] = [];
  if (!canReceiveProposals(requirement)) {
    errors.push("Only open requirements may receive proposals.");
  }
  if (
    existingProposals.some(
      (proposal) =>
        proposal.providerId === providerId &&
        !TERMINAL_PROPOSAL_STATUSES.includes(proposal.status),
    )
  ) {
    errors.push("A provider cannot submit multiple active proposals to one requirement.");
  }
  return errors;
}

export function canEditProposal(proposal: BasicsProposal): boolean {
  return proposal.status === "draft" || proposal.status === "clarification_requested";
}

export function canViewRequirement(
  requirement: BasicsRequirement,
  userId: string,
  providerId?: string,
): boolean {
  if (requirement.ownerId === userId) return true;
  if (requirement.status === "draft") return false;
  if (requirement.visibility === "private") {
    return Boolean(providerId && requirement.invitedProviderIds.includes(providerId));
  }
  if (requirement.visibility === "invited_only") {
    return Boolean(providerId && requirement.invitedProviderIds.includes(providerId));
  }
  return true;
}

export function calculateVerifiedRating(reviews: BasicsReview[]): number | null {
  const verified = reviews.filter((review) => review.verifiedEngagement);
  if (verified.length === 0) return null;
  const total = verified.reduce((sum, review) => sum + review.rating, 0);
  return Math.round((total / verified.length) * 10) / 10;
}

export function canReviewEngagement(engagement: BasicsEngagement): boolean {
  return engagement.status === "completed";
}

export function createDeliverableRevision(
  deliverable: BasicsDeliverable,
  fileName: string,
  fileReference: string,
  submittedBy: string,
): BasicsDeliverable {
  const latest = deliverable.versions.at(-1);
  const newVersion: BasicsDeliverableVersion = {
    version: (latest?.version ?? 0) + 1,
    fileName,
    fileReference,
    submittedAt: new Date().toISOString(),
    submittedBy,
    status: "submitted",
  };
  return {
    ...deliverable,
    status: "submitted",
    versions: [...deliverable.versions, newVersion],
  };
}

export function approveDeliverable(
  deliverable: BasicsDeliverable,
  actor: string,
): BasicsDeliverable {
  const latest = deliverable.versions.at(-1);
  if (!latest) throw new Error("A deliverable must have a submitted version before approval.");
  if (latest.status === "approved") return deliverable;
  return {
    ...deliverable,
    status: "approved",
    versions: deliverable.versions.map((version) =>
      version.version === latest.version
        ? {
            ...version,
            status: "approved",
            approvalActor: actor,
            approvalTimestamp: new Date().toISOString(),
          }
        : version,
    ),
  };
}

export function requestDeliverableRevision(
  deliverable: BasicsDeliverable,
  comments: string,
): BasicsDeliverable {
  const latest = deliverable.versions.at(-1);
  if (!latest) throw new Error("A deliverable must be submitted before a revision can be requested.");
  if (latest.status === "approved") {
    throw new Error("Approved versions are immutable. Upload a new revision instead.");
  }
  return {
    ...deliverable,
    status: "revision_requested",
    versions: deliverable.versions.map((version) =>
      version.version === latest.version
        ? { ...version, status: "revision_requested", reviewComments: comments }
        : version,
    ),
  };
}

export function validateEngagementCompletion(
  engagement: BasicsEngagement,
): string[] {
  const errors: string[] = [];
  if (engagement.deliverables.some((deliverable) => deliverable.status !== "approved")) {
    errors.push("All required deliverables must be approved.");
  }
  if (
    engagement.milestones.some(
      (milestone) =>
        milestone.completionStatus !== "completed" ||
        milestone.approvalStatus !== "approved",
    )
  ) {
    errors.push("All milestones must be completed and approved.");
  }
  if (
    engagement.paymentStatus === "paid" &&
    engagement.paymentEvidenceReferences.length === 0
  ) {
    errors.push("Paid status requires a verified payment evidence reference.");
  }
  return errors;
}

export async function acceptProposalAndCreateEngagement(
  proposalId: string,
): Promise<BasicsEngagement> {
  const proposal = await basicsProposalRepository.getProposal(proposalId);
  if (!proposal) throw new Error("Proposal not found.");
  if (proposal.status === "rejected" || proposal.status === "withdrawn") {
    throw new Error("This proposal is no longer available for acceptance.");
  }
  const requirement = await basicsRequirementRepository.getRequirement(
    proposal.requirementId,
  );
  if (!requirement) throw new Error("Requirement not found.");
  const proposals = await basicsProposalRepository.listProposals({
    requirementId: requirement.id,
  });
  const anotherAccepted = proposals.find(
    (item) => item.status === "accepted" && item.id !== proposal.id,
  );
  if (anotherAccepted) {
    throw new Error("This requirement already has an accepted proposal.");
  }
  await basicsProposalRepository.updateProposalStatus(proposal.id, "accepted");
  await basicsRequirementRepository.updateRequirement(requirement.id, {
    status: "awarded",
  });
  return basicsEngagementRepository.createFromProposal(proposal.id);
}
