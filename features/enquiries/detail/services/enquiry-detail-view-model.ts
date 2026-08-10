import {
  EnquiryRecord,
  EnquiryRequirement,
  ClientPriority,
} from "../../types/enquiry.types";
import {
  deriveEnquiryIntelligence,
  EnquiryIntelligence,
  ServiceProviderContext,
  DEFAULT_ENQUIRY_REQUIREMENTS,
  DEFAULT_CLIENT_PRIORITIES,
  DEFAULT_UNCONFIRMED_SCOPE,
  getClientPriorities,
  getUnconfirmedScope,
} from "../../services/enquiry-intelligence";

export interface ProjectHeaderViewModel {
  title: string;
  projectType: string;
  stage: string;
  status: string;
  clientName: string;
  location: string;
  receivedDate: string;
  source: string;
  enquiryRef?: string;
}

export interface OdinBriefViewModel {
  summary: string;
  statusChips: Array<{
    label: string;
    variant: "neutral" | "positive" | "warning" | "purple";
  }>;
}

export interface ProjectSnapshotViewModel {
  projectType: string;
  duration: string;
  builtUpArea: string;
  budget: string;
  client: string;
  budgetCoverageStatus: string;
  areaCoverageStatus: string;
}

export interface ScopeGroupViewModel {
  title: string;
  items: Array<{ label: string; confirmed: boolean }>;
}

export interface EnquiryDetailViewModel {
  enquiryId: string;
  header: ProjectHeaderViewModel;
  brief: OdinBriefViewModel;
  snapshot: ProjectSnapshotViewModel;
  priorities: ClientPriority[];
  requirements: EnquiryRequirement[];
  scopeGroups: ScopeGroupViewModel[];
  unconfirmedScope: string[];
  intelligence: EnquiryIntelligence;
}

export function buildEnquiryDetailViewModel({
  enquiry,
  providerContext,
}: {
  enquiry: EnquiryRecord;
  providerContext?: ServiceProviderContext;
}): EnquiryDetailViewModel {
  const intelligence = deriveEnquiryIntelligence(enquiry, providerContext);

  const formattedDate = enquiry.receivedAt
    ? new Date(enquiry.receivedAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Recently";

  const projectTypeLabel =
    enquiry.projectType === "commercial"
      ? "Commercial Interior"
      : enquiry.projectType === "residential"
      ? "Residential Design"
      : enquiry.projectType === "hospitality"
      ? "Hospitality Fit-out"
      : enquiry.projectType === "multi_family"
      ? "Multi-family Planning"
      : enquiry.projectType === "landscape"
      ? "Landscape Architecture"
      : enquiry.projectType === "retail"
      ? "Retail Store Design"
      : "Interior Project";

  const header: ProjectHeaderViewModel = {
    title: enquiry.title || "Villa Design Consultation",
    projectType: projectTypeLabel,
    stage: enquiry.stage || "new",
    status: enquiry.status || "active",
    clientName: enquiry.clientName || "Client",
    location: enquiry.location || "Bengaluru",
    receivedDate: formattedDate,
    source: enquiry.source || "website",
    enquiryRef: enquiry.enquiryRef || "ENQ-2026-0486",
  };

  const snapshot: ProjectSnapshotViewModel = {
    projectType: projectTypeLabel,
    duration: enquiry.duration || enquiry.timeline || "Within 6 Months",
    builtUpArea: enquiry.builtUpArea || "2,800 – 3,200 sq ft",
    budget: enquiry.budget || "₹40L – ₹60L",
    client: enquiry.clientName || "Ananya Builders",
    budgetCoverageStatus: enquiry.budgetCoverageStatus || "Coverage partially defined",
    areaCoverageStatus: enquiry.areaCoverageStatus || "Client supplied",
  };

  const requirements = enquiry.requirements || DEFAULT_ENQUIRY_REQUIREMENTS;
  const priorities = enquiry.clientPriorities || getClientPriorities(enquiry);
  const unconfirmedScope = enquiry.unconfirmedScope || getUnconfirmedScope(enquiry);

  const isCommercial = enquiry.projectType === "commercial";

  const scopeGroups: ScopeGroupViewModel[] = isCommercial
    ? [
        {
          title: "Space Planning & Layout",
          items: [
            { label: "Open-plan workstation arrangement (50+ capacity)", confirmed: true },
            { label: "2 Executive Cabins & 1 Conference Room", confirmed: true },
            { label: "Reception Area & Visitor Lounge", confirmed: true },
            { label: "Pantry & Breakout Zone", confirmed: true },
          ],
        },
        {
          title: "Civil & Interior Fit-out",
          items: [
            { label: "Glass acoustic partition walls", confirmed: true },
            { label: "Custom reception desk & credenza storage", confirmed: true },
            { label: "Gypsum & grid false ceiling works", confirmed: true },
            { label: "Commercial grade carpet & vinyl flooring", confirmed: true },
          ],
        },
        {
          title: "MEP & Infrastructure",
          items: [
            { label: "Electrical wiring & floor raceways for workstations", confirmed: true },
            { label: "Modular LED ceiling lighting fixture installation", confirmed: true },
            { label: "HVAC duct relocation & diffuser fitting", confirmed: true },
            { label: "Data cabling & server room trunking", confirmed: true },
          ],
        },
      ]
    : [
        {
          title: "Space & Room Planning",
          items: [
            { label: "Formal Living Room & Dining Suite", confirmed: true },
            { label: "Master Bedroom Suite with Walk-in Closet", confirmed: true },
            { label: "Dedicated Home Office & Study Suite", confirmed: true },
            { label: "Courtyard cutout for daylight & cross ventilation", confirmed: true },
          ],
        },
        {
          title: "Architecture & Interior Fit-out",
          items: [
            { label: "Custom teak joinery & fixed wardrobe units", confirmed: true },
            { label: "Microcement wall finishes & natural stone flooring", confirmed: true },
            { label: "Acoustic insulation for master & study suites", confirmed: true },
            { label: "Terrace pergola & outdoor lounge landscaping", confirmed: true },
          ],
        },
        {
          title: "MEP & Infrastructure",
          items: [
            { label: "3-Phase electrical distribution & smart scene lighting", confirmed: true },
            { label: "High-efficiency VRF HVAC air conditioning layout", confirmed: true },
            { label: "Plumbing layout for master bath & powder room", confirmed: true },
            { label: "5kW Rooftop solar PV & rainwater harvesting", confirmed: false },
          ],
        },
      ];

  return {
    enquiryId: enquiry.id,
    header,
    brief: intelligence.odinBrief,
    snapshot,
    priorities,
    requirements,
    scopeGroups,
    unconfirmedScope,
    intelligence,
  };
}
