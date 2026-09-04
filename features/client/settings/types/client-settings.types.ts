export type ClientPreferredContactMethod = "whatsapp" | "phone" | "email" | "in_app";

export type ClientProviderContactPermission = "in_app_only" | "allow_phone" | "allow_whatsapp";

export interface ClientProfileData {
  fullName: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  preferredContactMethod: ClientPreferredContactMethod;
  preferredCommunicationTime: string;
}

export interface ClientSecurityData {
  email: string;
  phone: string;
  twoFactorEnabled: boolean;
  passwordLastChanged: string;
  activeSessions: Array<{
    id: string;
    device: string;
    browser: string;
    location: string;
    lastActive: string;
    isCurrent: boolean;
  }>;
}

export interface ClientProjectPreferencesData {
  defaultProjectId: string;
  defaultView: "overview" | "tasks" | "boq" | "finance" | "documents";
  currency: "INR" | "USD" | "EUR" | "AED";
  measurementSystem: "metric" | "imperial";
  defaultDocumentView: "latest" | "all_versions";
  projectActivityLevel: "important_only" | "all_updates";
}

export interface ClientProjectAccessMember {
  id: string;
  name: string;
  email: string;
  role: "Owner" | "Architect" | "Project Manager" | "Family Member" | "Contractor" | "Consultant";
  projectId: string;
  projectName: string;
  accessLevel: "Full Access" | "View & Approve" | "View Only" | "Restricted";
  status: "Active" | "Pending Invite" | "Suspended";
  permissions: {
    overview: boolean;
    documents: boolean;
    financial: boolean;
    enquiries: boolean;
    approvals: boolean;
    payments: boolean;
  };
}

export interface ClientNotificationPreferences {
  project: {
    projectUpdates: boolean;
    taskUpdates: boolean;
    approvalRequests: boolean;
    documentUpdates: boolean;
  };
  enquiries: {
    providerResponses: boolean;
    newQuotations: boolean;
    enquiryStatusChanges: boolean;
  };
  payments: {
    paymentReminders: boolean;
    paymentConfirmations: boolean;
    paymentFailures: boolean;
  };
  schedule: {
    meetings: boolean;
    siteVisits: boolean;
    upcomingDeadlines: boolean;
  };
  channels: {
    inApp: boolean;
    email: boolean;
    whatsapp: boolean;
    sms: boolean;
  };
}

export interface ClientCommunicationPreferences {
  preferredContactMethod: ClientPreferredContactMethod;
  providerCommunication: ClientProviderContactPermission;
  marketing: {
    productUpdates: boolean;
    offersAndRecommendations: boolean;
  };
}

export interface ClientPaymentMethod {
  id: string;
  type: "upi" | "card" | "bank_account";
  label: string;
  details: string;
  isDefault: boolean;
  expiryDate?: string;
  brand?: string;
}

export interface ClientInvoiceItem {
  id: string;
  invoiceNumber: string;
  projectId: string;
  projectName: string;
  milestoneDescription: string;
  date: string;
  amount: number;
  status: "paid" | "pending" | "processing";
  pdfUrl?: string;
}

export interface ClientAppearancePreferences {
  theme: "light" | "dark" | "system";
  density: "comfortable" | "compact";
}

export interface ClientLanguageRegionPreferences {
  language: string;
  country: string;
  currency: string;
  dateFormat: string;
  timeZone: string;
}

export interface ClientPrivacyDataPreferences {
  projectDataAccess: boolean;
  connectedServices: boolean;
  odinDataUsage: {
    useProjectContext: boolean;
    allowDocumentIndexing: boolean;
    conversationRetention: "30_days" | "90_days" | "indefinite";
  };
}
