export type ProgressStateKey = "critical" | "low" | "progress" | "good" | "strong" | "complete";
export type ProgressColorKey = "red" | "orange" | "amber" | "blue" | "green" | "emerald";

export interface ProgressStateResolution {
  state: ProgressStateKey;
  colour: ProgressColorKey;
  label: string;
}

export function resolveProgressState(completionPercentage: number): ProgressStateResolution {
  const pct = Math.min(100, Math.max(0, completionPercentage));
  if (pct === 100) return { state: "complete", colour: "emerald", label: "Complete" };
  if (pct >= 80) return { state: "strong", colour: "green", label: "Final steps" };
  if (pct >= 60) return { state: "good", colour: "blue", label: "Almost ready" };
  if (pct >= 40) return { state: "progress", colour: "amber", label: "In progress" };
  if (pct >= 20) return { state: "low", colour: "orange", label: "Needs attention" };
  return { state: "critical", colour: "red", label: "Action required" };
}

export interface PracticeSetupState {
  accountSetup: {
    name: string;
    phone: string;
    email: string;
    profession: string;
  };
  businessProfile: {
    companyName: string;
    category: string;
    location: string;
    services: string[];
    contactDetails: string;
  };
  portfolio: {
    completedWorksCount: number;
    hasCoverImage: boolean;
    hasProjectCategory: boolean;
    hasShortDescription: boolean;
  };
  verification: {
    hasIdentityDoc: boolean;
    hasBusinessProof: boolean;
    hasBankInfo: boolean;
    isSubmitted: boolean;
    status: "not_started" | "in_review" | "approved" | "requires_attention";
    attentionReason?: string;
  };
  isAcknowledged?: boolean;
}

export interface SetupStage {
  id: "account" | "business" | "portfolio" | "verification";
  stepNumber: number;
  title: string;
  weight: number;
  percentage: number;
  isCompleted: boolean;
  isCurrent: boolean;
  missingRequirement: string;
  route: string;
}

export interface PracticeSetupProgress {
  totalPercentage: number;
  stages: SetupStage[];
  nextStepTitle: string;
  nextStepRequirement: string;
  nextStepRoute: string;
  remainingStepsCount: number;
  verificationStatus: PracticeSetupState["verification"]["status"];
  attentionReason?: string;
  displayMode: "full_card" | "compact_banner" | "in_review_banner" | "attention_card" | "hidden";
  progressState: ProgressStateResolution;
  isComplete: boolean;
}

// Initial mock state for newly onboarded service provider (e.g. 15% complete)
const INITIAL_DEMO_STATE: PracticeSetupState = {
  accountSetup: {
    name: "Arjun Menon",
    phone: "+91 98470 12345",
    email: "arjun@arjunarchitects.com",
    profession: "Lead Architect",
  },
  businessProfile: {
    companyName: "Arjun Architects",
    category: "Architecture & Interior Design",
    location: "", // Missing
    services: [], // Missing
    contactDetails: "", // Missing
  },
  portfolio: {
    completedWorksCount: 1, // Minimum 3 required
    hasCoverImage: true,
    hasProjectCategory: true,
    hasShortDescription: false,
  },
  verification: {
    hasIdentityDoc: false,
    hasBusinessProof: false,
    hasBankInfo: false,
    isSubmitted: false,
    status: "not_started",
  },
  isAcknowledged: false,
};

export class PracticeSetupService {
  private state: PracticeSetupState = { ...INITIAL_DEMO_STATE };

  public getState(): PracticeSetupState {
    return this.state;
  }

  public updateState(partial: Partial<PracticeSetupState>): PracticeSetupProgress {
    this.state = {
      ...this.state,
      ...partial,
    };
    return this.getProgress();
  }

  public acknowledgeCompletion(): PracticeSetupProgress {
    this.state.isAcknowledged = true;
    return this.getProgress();
  }

  public getProgress(): PracticeSetupProgress {
    const s = this.state;

    // 1. Account Setup (15% weight)
    const accMet = [
      Boolean(s.accountSetup.name),
      Boolean(s.accountSetup.phone),
      Boolean(s.accountSetup.email),
      Boolean(s.accountSetup.profession),
    ].filter(Boolean).length;
    const accPercent = Math.round((accMet / 4) * 15);
    const accComplete = accMet === 4;

    // 2. Business Profile (30% weight)
    const bizMet = [
      Boolean(s.businessProfile.companyName),
      Boolean(s.businessProfile.category),
      Boolean(s.businessProfile.location),
      s.businessProfile.services.length > 0,
      Boolean(s.businessProfile.contactDetails),
    ].filter(Boolean).length;
    const bizPercent = Math.round((bizMet / 5) * 30);
    const bizComplete = bizMet === 5;

    // 3. Portfolio (30% weight)
    const portMet = [
      s.portfolio.completedWorksCount >= 3,
      s.portfolio.hasCoverImage,
      s.portfolio.hasProjectCategory,
      s.portfolio.hasShortDescription,
    ].filter(Boolean).length;
    const portPercent = Math.round((portMet / 4) * 30);
    const portComplete = portMet === 4;

    // 4. Verification (25% weight)
    const verMet = [
      s.verification.hasIdentityDoc,
      s.verification.hasBusinessProof,
      s.verification.hasBankInfo,
      s.verification.isSubmitted,
    ].filter(Boolean).length;
    const verApproved = s.verification.status === "approved";
    const verPercent = verApproved ? 25 : Math.round((verMet / 4) * 20); // max 20 until approved
    const verComplete = verApproved;

    // Find current active incomplete stage
    const stagesList: Array<{
      id: "account" | "business" | "portfolio" | "verification";
      title: string;
      weight: number;
      percent: number;
      isComp: boolean;
      missing: string;
      route: string;
    }> = [
      {
        id: "account",
        title: "Account Setup",
        weight: 15,
        percent: accPercent,
        isComp: accComplete,
        missing: "Complete account details (name, email, phone & profession)",
        route: "/settings/account",
      },
      {
        id: "business",
        title: "Business Profile",
        weight: 30,
        percent: bizPercent,
        isComp: bizComplete,
        missing: "Add practice location, services & contact details",
        route: "/settings/business-profile",
      },
      {
        id: "portfolio",
        title: "Portfolio",
        weight: 30,
        percent: portPercent,
        isComp: portComplete,
        missing: "Upload minimum 3 portfolio projects with descriptions",
        route: "/portfolio",
      },
      {
        id: "verification",
        title: "Verification",
        weight: 25,
        percent: verPercent,
        isComp: verComplete,
        missing: "Submit identity, business proof & bank details for verification",
        route: "/settings/workspace",
      },
    ];

    const firstIncomplete = stagesList.find((st) => !st.isComp);

    const stages: SetupStage[] = stagesList.map((st, idx) => ({
      id: st.id,
      stepNumber: idx + 1,
      title: st.title,
      weight: st.weight,
      percentage: st.percent,
      isCompleted: st.isComp,
      isCurrent: firstIncomplete ? firstIncomplete.id === st.id : false,
      missingRequirement: st.missing,
      route: st.route,
    }));

    // Calculate raw weighted sum
    let rawTotal = accPercent + bizPercent + portPercent + verPercent;

    // Operational rule: Do not allow low-value personal fields alone to push completion above 75%
    if (!verApproved && rawTotal >= 75) {
      rawTotal = 74;
    }

    const totalPercentage = Math.min(100, Math.max(0, rawTotal));
    const remainingStepsCount = stages.filter((st) => !st.isCompleted).length;

    const isComplete = totalPercentage === 100;

    // Next step information
    const nextStepTitle = firstIncomplete
      ? firstIncomplete.title
      : "Practice Setup Complete";
    const nextStepRequirement = firstIncomplete
      ? firstIncomplete.missing
      : "All required setup steps are completed and verified.";
    const nextStepRoute = firstIncomplete
      ? firstIncomplete.route
      : "/settings/business-profile";

    // Progress state resolution based on completion percentage
    const progressState = resolveProgressState(totalPercentage);

    // Determine visibility display mode:
    // - Below 75%: Prominent full card
    // - 75–99%: Reduced visual prominence, keeping next required step visible
    // - 100%: Complete state. Removed after user acknowledgment.
    let displayMode: PracticeSetupProgress["displayMode"] = "full_card";

    if (s.isAcknowledged && (isComplete || totalPercentage >= 95)) {
      displayMode = "hidden";
    } else if (s.verification.status === "requires_attention") {
      displayMode = "attention_card";
    } else if (s.verification.status === "in_review") {
      displayMode = "in_review_banner";
    } else if (totalPercentage >= 75 && !isComplete) {
      displayMode = "compact_banner";
    } else {
      displayMode = "full_card";
    }

    return {
      totalPercentage,
      stages,
      nextStepTitle,
      nextStepRequirement,
      nextStepRoute,
      remainingStepsCount,
      verificationStatus: s.verification.status,
      attentionReason: s.verification.attentionReason,
      displayMode,
      progressState,
      isComplete,
    };
  }
}

export const practiceSetupService = new PracticeSetupService();
