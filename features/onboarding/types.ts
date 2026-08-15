export type ProviderType = "individual" | "company";

export type IndividualProfession =
  | "Architects"
  | "Interior designers"
  | "Civil engineer"
  | "Structural engineer"
  | "Project Management Consultant"
  | "Turnkey Professionals"
  | "Builders"
  | "Other";

export type FirmDiscipline =
  | "Architecture or design studio"
  | "Interior design Firm"
  | "Engineering consultancy"
  | "Construction company"
  | "Design & Building firms"
  | "Project Management Consultancy"
  | "Turnkey contractors"
  | "Builder or Developer"
  | "Other";

export type PracticeDiscipline = IndividualProfession | FirmDiscipline | string;

export type OrganisationType = FirmDiscipline;

export type OnboardingStep =
  | "account_creation"
  | "email_verification"
  | "practice_type_selection"
  | "application_form"
  | "confirmation";

export interface ProviderApplicationFormData {
  // Step 1: Account Credentials
  accountEmail: string;
  password?: string;
  isEmailVerified?: boolean;

  // Step 3: Provider Type Selection
  providerType: ProviderType | null;

  // Contact / Individual Profile
  fullName: string;
  phone: string;
  email: string;

  // Professional Credentials
  discipline: PracticeDiscipline | "";
  city: string;
  additionalCities?: string;
  experienceYears: string;
  portfolioUrl?: string;
  licenseNumber?: string;
  studioName?: string;

  // Virtual Office ID Selection
  virtualOfficeId?: string;

  // Firm / Company Profile
  companyName?: string;
  organisationType?: OrganisationType | "";
  companyWebsite?: string;
  yearsInOperation?: string;
  contactPersonName?: string;
  contactRole?: string;
  gstin?: string;
  companyRegNumber?: string;

  // Consent
  agreedToTerms: boolean;
}

export interface ProviderApplicationResult {
  applicationId: string;
  submittedAt: string;
  providerType: ProviderType;
  primaryIdentifier: string;
  applicantEmail: string;
  virtualOfficeId?: string;
}
