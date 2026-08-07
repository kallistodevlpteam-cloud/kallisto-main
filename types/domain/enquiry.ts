export type EnquiryStatus = "new" | "qualified" | "converted" | "declined";

export interface Enquiry {
  id: string;
  workspaceId: string;
  title: string;
  code: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  organisationName?: string;
  projectType: string;
  location: string;
  budget?: string;
  requirementsSummary: string;
  status: EnquiryStatus;
  convertedProjectId?: string;
  convertedClientId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ConvertEnquiryInput {
  enquiryId: string;
  clientSelection:
    | { mode: "create_new"; clientName?: string; organisationName?: string }
    | { mode: "use_existing"; clientId: string };
  projectName: string;
  projectCode?: string;
  projectType: string;
  ownerId: string;
  ownerName: string;
  location: string;
}
