export type PortfolioMode = "owner" | "public";

export type PortfolioTab =
  | "projects"
  | "case-studies"
  | "tagged"
  | "reviews"
  | "pricing";

export type ConstructionProjectType =
  | "residential"
  | "commercial"
  | "interior"
  | "renovation"
  | "hospitality"
  | "retail"
  | "institutional"
  | "landscape"
  | "multi_residential";

export type ConstructionProjectStatus =
  | "draft"
  | "concept"
  | "design_development"
  | "approval"
  | "tender"
  | "ongoing"
  | "completed"
  | "on_hold"
  | "archived";

export type ConstructionAreaUnit = "sq_ft" | "sq_m";
export type ConstructionSiteAreaUnit =
  | "cent"
  | "acre"
  | "sq_ft"
  | "sq_m";

export type ConstructionProject = {
  id: string;
  title: string;
  slug: string;
  projectType: ConstructionProjectType;
  status: ConstructionProjectStatus;
  location: {
    city: string;
    district?: string;
    state: string;
    country: string;
  };
  builtUpArea?: {
    value: number;
    unit: ConstructionAreaUnit;
  };
  siteArea?: {
    value: number;
    unit: ConstructionSiteAreaUnit;
  };
  completionYear?: number;
  expectedCompletionYear?: number;
  services: string[];
  description: string;
  designHighlights?: string[];
  materials?: string[];
  duration?: string;
  constructionStage?: string;
  collaborators?: string[];
  tags: string[];
  coverImage: string;
  gallery: string[];
  featured: boolean;
  visibility: "public" | "private";
};

export interface PortfolioProject extends ConstructionProject {
  lastEditedAt?: string;
  completionPercent?: number;
}

export interface PortfolioProfile {
  providerId: string;
  name: string;
  profession: string;
  location: string;
  bio: string;
  websiteLabel: string;
  websiteUrl: string;
  skills: string[];
  availability: string;
  verified: boolean;
  avatarUrl: string;
  coverImageUrl?: string;
}

export interface PortfolioStatistic {
  id: string;
  label: string;
  value: string;
  href: string;
  ownerOnly?: boolean;
  hasStar?: boolean;
}

export interface PortfolioCollection {
  id: string;
  label: string;
  projectIds: string[];
  imageUrl?: string;
  hasGradientRing?: boolean;
}

export type PortfolioDrawingCategory =
  | "Concept plan"
  | "Floor plan"
  | "Elevation"
  | "Section"
  | "Working drawing"
  | "Approval drawing"
  | "Detail drawing"
  | "Services coordination";

export interface PortfolioDrawing {
  id: string;
  projectId: string;
  title: string;
  category: PortfolioDrawingCategory;
  previewImageUrl: string;
  revision: string;
  issueStatus: "Published" | "Superseded" | "Internal";
  issueDate: string;
  visibility: "public" | "private";
}

export interface PortfolioSiteProgressUpdate {
  id: string;
  projectId: string;
  projectName: string;
  stage: string;
  updateDate: string;
  note: string;
  primaryImageUrl: string;
  supportingImageUrls?: string[];
  visibility: "public" | "private";
}

export interface PortfolioCaseStudy {
  id: string;
  projectId: string;
  projectType: ConstructionProjectType;
  title: string;
  coverImageUrl: string;
  clientBrief: string;
  designResponse: string;
  scopeOfServices: string;
  projectOutcome: string;
  completionYear: number;
}

export type TaggedPortfolioStatus = "Approved" | "Pending" | "Hidden";

export interface TaggedPortfolioItem {
  id: string;
  projectId: string;
  projectName: string;
  coverImageUrl: string;
  collaborator: string;
  role: string;
  originalOwner: string;
  status: TaggedPortfolioStatus;
}

export interface PortfolioPageData {
  mode: PortfolioMode;
  profile: PortfolioProfile;
  statistics: PortfolioStatistic[];
  collections: PortfolioCollection[];
  projects: PortfolioProject[];
  caseStudies: PortfolioCaseStudy[];
  drawings: PortfolioDrawing[];
  siteProgress: PortfolioSiteProgressUpdate[];
  taggedItems: TaggedPortfolioItem[];
  drafts: PortfolioProject[];
}
