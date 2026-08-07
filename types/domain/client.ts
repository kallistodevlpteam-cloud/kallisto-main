export type ClientType = "individual" | "organisation";

export interface ContactPerson {
  id?: string;
  name: string;
  role?: string;
  email: string;
  phone: string;
}

export interface BillingDetails {
  taxId?: string;
  billingAddress: string;
  paymentTerms?: string;
  currency?: string;
}

export interface ClientAddress {
  label: string;
  address: string;
}

export interface ClientApprovalRecord {
  id: string;
  deliverableName: string;
  version: string;
  decision: "approved" | "rejected" | "pending";
  actorName: string;
  actorRole: string;
  timestamp: string;
  comments?: string;
}

export interface ClientDecisionRecord {
  id: string;
  title: string;
  decisionDate: string;
  status: "pending" | "confirmed";
  summary: string;
}

export interface Client {
  id: string;
  workspaceId: string;
  type: ClientType;
  name: string;
  organisationName?: string;
  primaryContact: ContactPerson;
  additionalContacts?: ContactPerson[];
  contactDetails: {
    phone: string;
    email: string;
  };
  billingDetails: BillingDetails;
  siteAddresses: ClientAddress[];
  billingAddress: string;
  communicationPreference?: "email" | "phone" | "whatsapp";
  clientNotes?: string;
  clientApprovals?: ClientApprovalRecord[];
  clientDecisions?: ClientDecisionRecord[];
  createdAt: string;
  updatedAt: string;
}
