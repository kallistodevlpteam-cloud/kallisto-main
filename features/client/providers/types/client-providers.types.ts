export type ProviderCategory =
  | "architecture"
  | "interior_design"
  | "structural_engineering"
  | "general_contracting"
  | "mep_engineering"
  | "landscape_architecture";

export interface ProviderProjectPreview {
  id: string;
  title: string;
  location: string;
  coverImage: string;
  budget: string;
  year: number;
}

export interface ProviderTeamMember {
  name: string;
  role: string;
  avatar: string;
}

export interface ProviderReview {
  id: string;
  clientName: string;
  projectName: string;
  rating: number;
  date: string;
  comment: string;
}

export interface RegisteredServiceProvider {
  id: string;
  name: string;
  tagline: string;
  category: ProviderCategory;
  categoryLabel: string;
  rankBadge: string;
  isFeatured: boolean;
  featuredRank?: number;
  verificationBadge: string;
  coaRegistrationNumber?: string;
  gstin?: string;
  leadConsultant: {
    name: string;
    role: string;
    avatar: string;
  };
  rating: number;
  reviewCount: number;
  experienceYears: number;
  completedProjectsCount: number;
  activeProjectsCount: number;
  location: string;
  city: string;
  baseFee: string;
  baseFeeUnit: string;
  bio: string;
  philosophy: string;
  skills: string[];
  servicesOffered: string[];
  bannerGradient: string;
  coverImage: string;
  avatarColor: string;
  discArtworkGradient: string;
  team: ProviderTeamMember[];
  featuredProjects: ProviderProjectPreview[];
  reviews: ProviderReview[];
}
