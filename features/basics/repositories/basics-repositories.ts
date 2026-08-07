import {
  MOCK_BASICS_ENGAGEMENTS,
  MOCK_BASICS_PROJECT_CONTEXTS,
  MOCK_BASICS_PROPOSALS,
  MOCK_BASICS_PROVIDERS,
  MOCK_BASICS_REQUIREMENTS,
} from "../data/mock-basics-data";
import type {
  BasicsEngagement,
  BasicsEngagementStatus,
  BasicsProjectContext,
  BasicsProposal,
  BasicsProposalStatus,
  BasicsProvider,
  BasicsRequirement,
  CreateRequirementInput,
  EngagementFilters,
  ProposalFilters,
  ProviderFilters,
  RequirementFilters,
  SubmitProposalInput,
  UpdateRequirementInput,
} from "../types/basics.types";

export interface BasicsProviderRepository {
  listProviders(filters?: ProviderFilters): Promise<BasicsProvider[]>;
  getProvider(providerId: string): Promise<BasicsProvider | null>;
  saveProvider(providerId: string): Promise<void>;
}

export interface BasicsRequirementRepository {
  listRequirements(filters?: RequirementFilters): Promise<BasicsRequirement[]>;
  getRequirement(requirementId: string): Promise<BasicsRequirement | null>;
  createRequirement(input: CreateRequirementInput): Promise<BasicsRequirement>;
  updateRequirement(
    requirementId: string,
    input: UpdateRequirementInput,
  ): Promise<BasicsRequirement>;
  deleteDraft(requirementId: string): Promise<void>;
}

export interface BasicsProposalRepository {
  listProposals(filters?: ProposalFilters): Promise<BasicsProposal[]>;
  getProposal(proposalId: string): Promise<BasicsProposal | null>;
  submitProposal(input: SubmitProposalInput): Promise<BasicsProposal>;
  updateProposalStatus(
    proposalId: string,
    status: BasicsProposalStatus,
  ): Promise<BasicsProposal>;
  updateProposal(
    proposalId: string,
    input: Partial<
      Pick<
        BasicsProposal,
        | "coverNote"
        | "scopeSummary"
        | "includedDeliverables"
        | "excludedDeliverables"
        | "fee"
        | "estimatedStartDate"
        | "estimatedCompletionDate"
        | "status"
      >
    >,
  ): Promise<BasicsProposal>;
}

export interface BasicsEngagementRepository {
  listEngagements(filters?: EngagementFilters): Promise<BasicsEngagement[]>;
  getEngagement(engagementId: string): Promise<BasicsEngagement | null>;
  createFromProposal(proposalId: string): Promise<BasicsEngagement>;
  updateStatus(
    engagementId: string,
    status: BasicsEngagementStatus,
  ): Promise<BasicsEngagement>;
  updateDeliverable(
    engagementId: string,
    deliverable: BasicsEngagement["deliverables"][number],
  ): Promise<BasicsEngagement>;
}

const providersStore = MOCK_BASICS_PROVIDERS.map((provider) => ({ ...provider }));
const requirementsStore = MOCK_BASICS_REQUIREMENTS.map((requirement) => ({
  ...requirement,
}));
const proposalsStore = MOCK_BASICS_PROPOSALS.map((proposal) => ({ ...proposal }));
const engagementsStore = MOCK_BASICS_ENGAGEMENTS.map((engagement) => ({
  ...engagement,
}));
const savedProviderIds = new Set<string>();

function normalise(value: string): string {
  return value.trim().toLowerCase();
}

export const basicsProviderRepository: BasicsProviderRepository = {
  async listProviders(filters = {}) {
    let result = providersStore.filter((provider) => {
      const searchable = [
        provider.name,
        provider.companyName,
        provider.headline,
        ...provider.specializations,
        ...provider.projectTypes,
        ...provider.softwareSkills,
        ...provider.codeKnowledge,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      if (filters.q && !searchable.includes(normalise(filters.q))) return false;
      if (filters.category && provider.primaryCategory !== filters.category) return false;
      if (
        filters.specialization &&
        !provider.specializations.some((value) =>
          normalise(value).includes(normalise(filters.specialization ?? "")),
        )
      ) return false;
      if (filters.projectType && !provider.projectTypes.includes(filters.projectType)) return false;
      if (filters.city && !normalise(provider.location.city).includes(normalise(filters.city))) return false;
      if (filters.state && !normalise(provider.location.state).includes(normalise(filters.state))) return false;
      if (filters.remote && !provider.remoteAvailable) return false;
      if (filters.onsite && !provider.onsiteAvailable) return false;
      if (filters.verified && !provider.verified) return false;
      if (filters.minimumRating && provider.rating < filters.minimumRating) return false;
      if (filters.minimumExperience && provider.yearsOfExperience < filters.minimumExperience) return false;
      if (filters.availability && provider.availability !== filters.availability) return false;
      if (filters.pricingModel && provider.pricing.model !== filters.pricingModel) return false;
      if (filters.software && !provider.softwareSkills.includes(filters.software)) return false;
      if (filters.code && !provider.codeKnowledge.includes(filters.code)) return false;
      if (filters.language && !provider.languages.includes(filters.language)) return false;
      return true;
    });

    const sorters: Record<string, (a: BasicsProvider, b: BasicsProvider) => number> = {
      rating: (a, b) => b.rating - a.rating,
      experience: (a, b) => b.yearsOfExperience - a.yearsOfExperience,
      completed: (a, b) => b.completedEngagements - a.completedEngagements,
      availability: (a, b) => a.availability.localeCompare(b.availability),
      price_low: (a, b) => (a.pricing.startingFrom ?? Infinity) - (b.pricing.startingFrom ?? Infinity),
      price_high: (a, b) => (b.pricing.startingFrom ?? 0) - (a.pricing.startingFrom ?? 0),
      recommended: (a, b) => (Number(b.verified) * 2 + b.rating) - (Number(a.verified) * 2 + a.rating),
    };
    result = [...result].sort(sorters[filters.sort ?? "recommended"]);
    return result;
  },
  async getProvider(providerId) {
    return (
      providersStore.find(
        (provider) =>
          provider.id === providerId || provider.slug === providerId,
      ) ?? null
    );
  },
  async saveProvider(providerId) {
    const provider = providersStore.find((item) => item.id === providerId);
    if (!provider) throw new Error("Provider not found.");
    if (savedProviderIds.has(providerId)) savedProviderIds.delete(providerId);
    else savedProviderIds.add(providerId);
  },
};

export const basicsRequirementRepository: BasicsRequirementRepository = {
  async listRequirements(filters = {}) {
    return requirementsStore.filter((requirement) => {
      if (filters.status && requirement.status !== filters.status) return false;
      if (filters.ownerId && requirement.ownerId !== filters.ownerId) return false;
      if (filters.projectId && requirement.projectId !== filters.projectId) return false;
      return true;
    });
  },
  async getRequirement(requirementId) {
    return requirementsStore.find((requirement) => requirement.id === requirementId) ?? null;
  },
  async createRequirement(input) {
    const timestamp = new Date().toISOString();
    const requirement: BasicsRequirement = {
      ...input,
      id: `requirement-${Date.now()}`,
      proposalCount: 0,
      shortlistedProposalIds: [],
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    requirementsStore.unshift(requirement);
    return requirement;
  },
  async updateRequirement(requirementId, input) {
    const index = requirementsStore.findIndex((item) => item.id === requirementId);
    if (index < 0) throw new Error("Requirement not found.");
    const current = requirementsStore[index];
    if (current.status === "awarded" && input.status && input.status !== "awarded") {
      throw new Error("Awarded requirements cannot be reopened from this workflow.");
    }
    requirementsStore[index] = {
      ...current,
      ...input,
      id: current.id,
      ownerId: current.ownerId,
      createdAt: current.createdAt,
      updatedAt: new Date().toISOString(),
    };
    return requirementsStore[index];
  },
  async deleteDraft(requirementId) {
    const index = requirementsStore.findIndex((item) => item.id === requirementId);
    if (index < 0) throw new Error("Requirement not found.");
    if (requirementsStore[index].status !== "draft") {
      throw new Error("Only draft requirements may be deleted.");
    }
    requirementsStore.splice(index, 1);
  },
};

export const basicsProposalRepository: BasicsProposalRepository = {
  async listProposals(filters = {}) {
    return proposalsStore.filter((proposal) => {
      if (filters.view && proposal.ownerPerspective !== (filters.view === "received" ? "buyer" : "provider")) return false;
      if (filters.status && proposal.status !== filters.status) return false;
      if (filters.requirementId && proposal.requirementId !== filters.requirementId) return false;
      return true;
    });
  },
  async getProposal(proposalId) {
    return proposalsStore.find((proposal) => proposal.id === proposalId) ?? null;
  },
  async submitProposal(input) {
    const requirement = requirementsStore.find(
      (item) => item.id === input.requirementId,
    );
    if (!requirement) throw new Error("Requirement not found.");
    if (requirement.status !== "open") {
      throw new Error("Only open requirements may receive proposals.");
    }
    const existing = proposalsStore.find(
      (proposal) =>
        proposal.requirementId === input.requirementId &&
        proposal.providerId === input.providerId &&
        !["rejected", "withdrawn"].includes(proposal.status),
    );
    if (existing) throw new Error("This provider already has an active proposal for the requirement.");
    const timestamp = new Date().toISOString();
    const proposal: BasicsProposal = {
      ...input,
      id: `proposal-${Date.now()}`,
      status: "submitted",
      submittedAt: timestamp,
      updatedAt: timestamp,
    };
    proposalsStore.unshift(proposal);
    return proposal;
  },
  async updateProposalStatus(proposalId, status) {
    const index = proposalsStore.findIndex((proposal) => proposal.id === proposalId);
    if (index < 0) throw new Error("Proposal not found.");
    if (proposalsStore[index].status === "accepted" && status !== "accepted") {
      throw new Error("Accepted proposals are immutable.");
    }
    proposalsStore[index] = {
      ...proposalsStore[index],
      status,
      updatedAt: new Date().toISOString(),
    };
    return proposalsStore[index];
  },
  async updateProposal(proposalId, input) {
    const index = proposalsStore.findIndex((proposal) => proposal.id === proposalId);
    if (index < 0) throw new Error("Proposal not found.");
    if (proposalsStore[index].status === "accepted") {
      throw new Error("Accepted proposals are immutable.");
    }
    proposalsStore[index] = {
      ...proposalsStore[index],
      ...input,
      id: proposalsStore[index].id,
      requirementId: proposalsStore[index].requirementId,
      providerId: proposalsStore[index].providerId,
      updatedAt: new Date().toISOString(),
    };
    return proposalsStore[index];
  },
};

export const basicsEngagementRepository: BasicsEngagementRepository = {
  async listEngagements(filters = {}) {
    return engagementsStore.filter((engagement) => {
      if (filters.status && engagement.status !== filters.status) return false;
      if (filters.projectId && engagement.projectId !== filters.projectId) return false;
      return true;
    });
  },
  async getEngagement(engagementId) {
    return engagementsStore.find((engagement) => engagement.id === engagementId) ?? null;
  },
  async createFromProposal(proposalId) {
    const existing = engagementsStore.find((engagement) => engagement.acceptedProposalId === proposalId);
    if (existing) return existing;
    const proposal = proposalsStore.find((item) => item.id === proposalId);
    if (!proposal) throw new Error("Proposal not found.");
    const requirement = requirementsStore.find((item) => item.id === proposal.requirementId);
    if (!requirement) throw new Error("Requirement not found.");
    const provider = providersStore.find((item) => item.id === proposal.providerId);
    if (!provider) throw new Error("Provider not found.");
    const timestamp = new Date().toISOString();
    const engagement: BasicsEngagement = {
      id: `engagement-from-${proposal.id}`,
      projectId: requirement.projectId ?? "unbound",
      projectName: requirement.projectName ?? "Unbound professional service",
      requirementId: requirement.id,
      acceptedProposalId: proposal.id,
      providerId: provider.id,
      clientId: requirement.ownerId,
      title: `${requirement.specialization} engagement`,
      category: requirement.category,
      scope: proposal.includedDeliverables,
      exclusions: proposal.excludedDeliverables,
      deliverables: proposal.includedDeliverables.map((name, index) => ({
        id: `deliverable-${proposal.id}-${index + 1}`,
        name,
        description: "Deliverable created from the confirmed proposal scope.",
        owner: provider.name,
        dueDate: proposal.estimatedCompletionDate ?? requirement.expectedCompletionDate ?? timestamp.slice(0, 10),
        status: "not_started",
        versions: [],
      })),
      milestones: proposal.milestones,
      agreedFee: proposal.fee,
      currency: proposal.currency,
      startDate: proposal.estimatedStartDate ?? timestamp.slice(0, 10),
      expectedCompletionDate: proposal.estimatedCompletionDate ?? requirement.expectedCompletionDate ?? timestamp.slice(0, 10),
      revisionLimit: proposal.revisionCount,
      revisionsUsed: 0,
      status: "not_started",
      paymentStatus: "not_started",
      paymentEvidenceReferences: [],
      progress: 0,
      activity: [
        {
          id: `activity-${proposal.id}-accepted`,
          actor: "Arjun Mehta",
          actorRole: "Virtual Office owner",
          action: "Proposal accepted",
          detail: "Scope, commercial terms and milestones were confirmed.",
          timestamp,
        },
      ],
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    engagementsStore.unshift(engagement);
    return engagement;
  },
  async updateStatus(engagementId, status) {
    const index = engagementsStore.findIndex((engagement) => engagement.id === engagementId);
    if (index < 0) throw new Error("Engagement not found.");
    engagementsStore[index] = {
      ...engagementsStore[index],
      status,
      updatedAt: new Date().toISOString(),
    };
    return engagementsStore[index];
  },
  async updateDeliverable(engagementId, deliverable) {
    const index = engagementsStore.findIndex((engagement) => engagement.id === engagementId);
    if (index < 0) throw new Error("Engagement not found.");
    const current = engagementsStore[index];
    const deliverableIndex = current.deliverables.findIndex((item) => item.id === deliverable.id);
    if (deliverableIndex < 0) throw new Error("Deliverable not found.");
    const deliverables = current.deliverables.map((item) =>
      item.id === deliverable.id ? deliverable : item,
    );
    engagementsStore[index] = {
      ...current,
      deliverables,
      updatedAt: new Date().toISOString(),
    };
    return engagementsStore[index];
  },
};

export async function listBasicsProjectContexts(): Promise<BasicsProjectContext[]> {
  return MOCK_BASICS_PROJECT_CONTEXTS.map((project) => ({ ...project }));
}
