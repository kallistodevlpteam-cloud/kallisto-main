export type BasicsServiceCategory =
  | "design_architecture"
  | "engineering"
  | "specialist_consulting"
  | "digital_production"
  | "commercial_compliance";

export type BasicsVerificationLevel =
  | "unverified"
  | "identity_verified"
  | "professional_verified"
  | "business_verified";

export type BasicsAvailability =
  | "available_now"
  | "available_this_week"
  | "limited"
  | "unavailable";

export type BasicsPricingModel =
  | "fixed"
  | "hourly"
  | "per_sq_ft"
  | "per_drawing"
  | "per_deliverable"
  | "custom";

export type BasicsProviderService = {
  id: string;
  title: string;
  category: BasicsServiceCategory;
  description: string;
  deliverables: string[];
  pricingModel: BasicsPricingModel;
  startingPrice?: number;
  estimatedDuration?: string;
};

export type BasicsPortfolioItem = {
  id: string;
  title: string;
  projectType: string;
  location: string;
  scope: string;
  contribution: string;
  projectScale: string;
  completionYear: number;
  imageUrls: string[];
  relatedService: string;
};

export type BasicsCredential = {
  id: string;
  kind: "qualification" | "registration" | "certification" | "work_history";
  title: string;
  issuer: string;
  issuedYear?: number;
  expiresAt?: string;
  verified: boolean;
};

export type BasicsReview = {
  id: string;
  engagementId: string;
  reviewerName: string;
  projectName: string;
  service: string;
  rating: number;
  review: string;
  completionDate: string;
  verifiedEngagement: boolean;
};

export type BasicsProvider = {
  id: string;
  slug: string;
  providerType: "individual" | "company";
  name: string;
  companyName?: string;
  avatarUrl?: string;
  logoUrl?: string;
  headline: string;
  primaryCategory: BasicsServiceCategory;
  specializations: string[];
  verified: boolean;
  verificationLevel: BasicsVerificationLevel;
  location: {
    city: string;
    state: string;
    country: string;
  };
  remoteAvailable: boolean;
  onsiteAvailable: boolean;
  yearsOfExperience: number;
  completedEngagements: number;
  rating: number;
  reviewCount: number;
  responseTimeHours?: number;
  availability: BasicsAvailability;
  pricing: {
    model: BasicsPricingModel;
    startingFrom?: number;
    currency: string;
  };
  softwareSkills: string[];
  codeKnowledge: string[];
  projectTypes: string[];
  languages: string[];
  bio: string;
  services: BasicsProviderService[];
  portfolio: BasicsPortfolioItem[];
  credentials: BasicsCredential[];
  reviews: BasicsReview[];
};

export type BasicsRequirementStatus =
  | "draft"
  | "open"
  | "reviewing"
  | "awarded"
  | "closed"
  | "cancelled";

export type BasicsRequirement = {
  id: string;
  projectId?: string;
  projectName?: string;
  title: string;
  category: BasicsServiceCategory;
  specialization: string;
  description: string;
  deliverables: string[];
  projectType?: string;
  location?: string;
  builtUpArea?: number;
  numberOfFloors?: number;
  projectStage?: string;
  engagementMode:
    | "fixed_fee"
    | "request_quote"
    | "per_area"
    | "consultation"
    | "milestone_based";
  budgetMin?: number;
  budgetMax?: number;
  currency: string;
  expectedStartDate?: string;
  expectedCompletionDate?: string;
  visibility: "public_to_matched_providers" | "invited_only" | "private";
  status: BasicsRequirementStatus;
  ownerId: string;
  invitedProviderIds: string[];
  proposalCount: number;
  shortlistedProposalIds: string[];
  attachments: string[];
  createdAt: string;
  updatedAt: string;
  closesAt?: string;
};

export type BasicsMilestone = {
  id: string;
  title: string;
  deliverableIds: string[];
  amount: number;
  currency: string;
  dueDate: string;
  completionStatus: "not_started" | "in_progress" | "completed";
  approvalStatus: "not_required" | "pending" | "approved" | "rejected";
  paymentStatus: "not_due" | "due" | "processing" | "paid" | "on_hold";
  paymentEvidenceReference?: string;
};

export type BasicsProposalStatus =
  | "draft"
  | "submitted"
  | "viewed"
  | "shortlisted"
  | "clarification_requested"
  | "negotiating"
  | "accepted"
  | "rejected"
  | "withdrawn";

export type BasicsProposal = {
  id: string;
  requirementId: string;
  providerId: string;
  ownerPerspective: "buyer" | "provider";
  coverNote: string;
  scopeSummary: string;
  includedDeliverables: string[];
  excludedDeliverables: string[];
  fee: number;
  currency: string;
  pricingModel: BasicsPricingModel;
  estimatedStartDate?: string;
  estimatedCompletionDate?: string;
  estimatedDurationDays?: number;
  revisionCount: number;
  siteVisitCount: number;
  milestones: BasicsMilestone[];
  attachments: string[];
  status: BasicsProposalStatus;
  submittedAt?: string;
  updatedAt: string;
};

export type BasicsDeliverableVersion = {
  version: number;
  fileName: string;
  fileReference: string;
  submittedAt: string;
  submittedBy: string;
  status:
    | "submitted"
    | "under_review"
    | "revision_requested"
    | "approved"
    | "rejected";
  reviewComments?: string;
  approvalActor?: string;
  approvalTimestamp?: string;
};

export type BasicsDeliverable = {
  id: string;
  name: string;
  description: string;
  owner: string;
  dueDate: string;
  status:
    | "not_started"
    | "in_progress"
    | "submitted"
    | "under_review"
    | "revision_requested"
    | "approved"
    | "rejected";
  versions: BasicsDeliverableVersion[];
};

export type BasicsEngagementStatus =
  | "not_started"
  | "active"
  | "awaiting_review"
  | "revision_requested"
  | "completed"
  | "paused"
  | "cancelled"
  | "disputed";

export type BasicsEngagement = {
  id: string;
  projectId: string;
  projectName: string;
  requirementId: string;
  acceptedProposalId: string;
  providerId: string;
  clientId: string;
  title: string;
  category: BasicsServiceCategory;
  scope: string[];
  exclusions: string[];
  deliverables: BasicsDeliverable[];
  milestones: BasicsMilestone[];
  agreedFee: number;
  currency: string;
  startDate: string;
  expectedCompletionDate: string;
  revisionLimit?: number;
  revisionsUsed?: number;
  status: BasicsEngagementStatus;
  paymentStatus:
    | "not_started"
    | "partially_paid"
    | "paid"
    | "payment_due"
    | "on_hold";
  paymentEvidenceReferences: string[];
  progress: number;
  activity: BasicsActivityItem[];
  createdAt: string;
  updatedAt: string;
};

export type BasicsActivityItem = {
  id: string;
  actor: string;
  actorRole: string;
  action: string;
  detail?: string;
  timestamp: string;
};

export type BasicsNotification = {
  id: string;
  type:
    | "proposal_received"
    | "clarification_requested"
    | "proposal_accepted"
    | "deliverable_due"
    | "deliverable_submitted"
    | "revision_requested"
    | "deliverable_approved"
    | "payment_status_changed";
  title: string;
  body: string;
  href: string;
  read: boolean;
  createdAt: string;
};

export type BasicsProjectContext = {
  id: string;
  name: string;
  projectType: string;
  location: string;
  projectStage: string;
  builtUpArea?: number;
  numberOfFloors?: number;
};

export type ProviderFilters = {
  q?: string;
  category?: BasicsServiceCategory;
  specialization?: string;
  projectType?: string;
  city?: string;
  state?: string;
  remote?: boolean;
  onsite?: boolean;
  verified?: boolean;
  minimumRating?: number;
  minimumExperience?: number;
  availability?: BasicsAvailability;
  pricingModel?: BasicsPricingModel;
  software?: string;
  code?: string;
  language?: string;
  sort?: string;
};

export type RequirementFilters = {
  status?: BasicsRequirementStatus;
  ownerId?: string;
  projectId?: string;
};

export type ProposalFilters = {
  view?: "received" | "submitted";
  status?: BasicsProposalStatus;
  requirementId?: string;
};

export type EngagementFilters = {
  status?: BasicsEngagementStatus;
  projectId?: string;
};

export type CreateRequirementInput = Omit<
  BasicsRequirement,
  "id" | "proposalCount" | "shortlistedProposalIds" | "createdAt" | "updatedAt"
>;

export type UpdateRequirementInput = Partial<
  Omit<BasicsRequirement, "id" | "ownerId" | "createdAt">
>;

export type SubmitProposalInput = Omit<
  BasicsProposal,
  "id" | "status" | "submittedAt" | "updatedAt"
>;

