import type {
  PortfolioPageData,
  PortfolioProject,
  PortfolioProfile,
  PortfolioCollection,
  ConstructionProjectType,
  ConstructionProjectStatus,
} from "@/features/portfolio/types/portfolio.types";
import { getPortfolioPageData } from "@/features/portfolio/data/portfolio.mock";
import { INITIAL_LABOUR_REQUESTS } from "./requests-mock-data";
import { INITIAL_ASSIGNMENTS } from "./assignments-mock-data";

export interface RawProviderProject extends Partial<PortfolioProject> {
  id: string;
  title: string;
  slug: string;
  projectType: ConstructionProjectType;
  status: ConstructionProjectStatus;
  location: { city: string; district?: string; state: string; country: string };
  coverImage: string;
  clientQuote?: { quote: string; author: string };
  highlights?: Array<{ label: string; value: string }>;
  [key: string]: unknown;
}

export function normalizeProject(p: RawProviderProject): PortfolioProject {
  return {
    description:
      p.description ||
      `${p.title} is a landmark development featuring modern engineering, quality structural standards, and professional execution.`,
    tags: p.tags || ["Civil Engineering", "Infrastructure", "Kerala Projects"],
    gallery: p.gallery || [p.coverImage, "/assets/hero-architecture-banner.webp"],
    featured: p.featured ?? true,
    visibility: p.visibility || "public",
    services: p.services || ["Civil Construction", "Site Supervision"],
    ...p,
  } as PortfolioProject;
}

export interface ServiceProviderRecord {
  id: string;
  slug: string;
  name: string;
  aliases: string[];
  profession: string;
  location: string;
  bio: string;
  websiteLabel: string;
  websiteUrl: string;
  skills: string[];
  verified: boolean;
  avatarUrl: string;
  coverImageUrl: string;
  projects: PortfolioProject[];
}

export interface RawServiceProviderRecord extends Omit<ServiceProviderRecord, "projects" | "slug"> {
  slug?: string;
  projects: RawProviderProject[];
}

const RAW_SERVICE_PROVIDER_RECORDS: RawServiceProviderRecord[] = [
  {
    id: "provider-skyline-builders",
    name: "Skyline Builders & Developers",
    aliases: ["Skyline Builders & Developers", "Skyline Builders", "Skyline", "Skyline Apartments"],
    profession: "Civil Contractor & Infrastructure Developers • High-Rise Residential",
    location: "Trivandrum, Kerala",
    bio: "Skyline Builders & Developers is a premier infrastructure and building firm in Kerala with over 35 years of engineering excellence, delivering luxury high-rise apartments, gated villas, and commercial complexes.",
    websiteLabel: "skylinebuilders.com",
    websiteUrl: "https://www.skylinebuilders.com",
    skills: ["Civil Construction", "Mivan Aluminum Formwork", "High-Rise Engineering", "RCC Framework", "Turnkey Handover"],
    verified: true,
    avatarUrl: "/assets/buildpro_logo.png",
    coverImageUrl: "/assets/hero-architecture-banner.webp",
    projects: [
      {
        id: "skyline-apartments",
        title: "Skyline Apartments",
        slug: "skyline-apartments",
        projectType: "multi_residential",
        status: "ongoing",
        location: { city: "Trivandrum", district: "Thiruvananthapuram", state: "Kerala", country: "India" },
        builtUpArea: { value: 145000, unit: "sq_ft" },
        siteArea: { value: 2.2, unit: "acre" },
        floors: "18 Floors",
        bedrooms: "3 & 4 BHK",
        completionYear: 2026,
        duration: "24 months",
        constructionStage: "Superstructure - Slab Shuttering",
        services: ["Civil Construction", "Formwork Assembly", "Structural Casting", "Site Supervision"],
        coverImage: "/assets/hero-architecture-banner.webp",
        clientQuote: {
          quote: "Precision shuttering and stage quality checks are critical for our 18-floor residential wing.",
          author: "Sanjay Menon, Structural Contractor Lead",
        },
        highlights: [
          { label: "Total Units", value: "96 Luxury Units" },
          { label: "Tower Height", value: "62 Metres" },
          { label: "Active Stage", value: "Floor 4 Slab Shuttering" },
        ],
      },
      {
        id: "skyline-waterfront-towers",
        title: "Skyline Waterfront Towers",
        slug: "skyline-waterfront-towers",
        projectType: "multi_residential",
        status: "ongoing",
        location: { city: "Kochi", district: "Ernakulam", state: "Kerala", country: "India" },
        builtUpArea: { value: 220000, unit: "sq_ft" },
        siteArea: { value: 3.5, unit: "acre" },
        floors: "24 Floors",
        bedrooms: "4 BHK",
        completionYear: 2026,
        duration: "30 months",
        constructionStage: "MEP & Electrical Stage",
        services: ["Electrical Infrastructure", "Plumbing & Piping", "MEP Coordination"],
        coverImage: "/assets/projects/greenfield-villa.png",
        clientQuote: {
          quote: "Marine Drive's flagship residential high-rise with dedicated smart grid electrical distribution.",
          author: "Skyline Engineering Cell",
        },
        highlights: [
          { label: "Units", value: "140 Waterfront Suites" },
          { label: "MEP Status", value: "Active Deployment" },
        ],
      },
      {
        id: "skyline-oasis-heights",
        title: "Skyline Oasis Heights",
        slug: "skyline-oasis-heights",
        projectType: "residential",
        status: "completed",
        location: { city: "Kochi", district: "Ernakulam", state: "Kerala", country: "India" },
        builtUpArea: { value: 98000, unit: "sq_ft" },
        floors: "14 Floors",
        completionYear: 2025,
        duration: "18 months",
        constructionStage: "Completed",
        services: ["Civil Contracting", "Finishing Works", "Quality Handover"],
        coverImage: "/assets/nila-hero-modern.jpg",
        highlights: [
          { label: "Status", value: "Handed Over" },
          { label: "Certification", value: "IGBC Gold Certified" },
        ],
      },
      {
        id: "skyline-riverdale",
        title: "Skyline Riverdale Tower",
        slug: "skyline-riverdale",
        projectType: "multi_residential",
        status: "completed",
        location: { city: "Trivandrum", district: "Thiruvananthapuram", state: "Kerala", country: "India" },
        builtUpArea: { value: 112000, unit: "sq_ft" },
        floors: "16 Floors",
        completionYear: 2024,
        duration: "20 months",
        constructionStage: "Completed",
        services: ["Civil Works", "Carpentry & Formwork", "Site Delivery"],
        coverImage: "/assets/projects/oak-house.png",
      },
    ],
  },
  {
    id: "provider-greenwood-infra",
    name: "Greenwood Infra Projects Ltd",
    aliases: ["Greenwood Infra Projects Ltd", "Greenwood Residency", "Greenwood Infra", "Greenwood"],
    profession: "General Building Contractor • Residential Complexes & Gated Communities",
    location: "Kazhakkoottam, Kerala",
    bio: "Greenwood Infra Projects Ltd specializes in premium residential developments, boundary civil infrastructure, and integrated community planning across Kerala.",
    websiteLabel: "greenwoodinfra.in",
    websiteUrl: "https://greenwoodinfra.in",
    skills: ["Solid Block Masonry", "RCC Foundations", "Community Infrastructure", "Lintel & Slab Casting"],
    verified: true,
    avatarUrl: "/assets/projects/greenfield-villa.png",
    coverImageUrl: "/assets/projects/greenfield-villa.png",
    projects: [
      {
        id: "greenwood-residency",
        title: "Greenwood Residency",
        slug: "greenwood-residency",
        projectType: "residential",
        status: "ongoing",
        location: { city: "Kazhakkoottam", district: "Trivandrum", state: "Kerala", country: "India" },
        builtUpArea: { value: 85000, unit: "sq_ft" },
        floors: "4 Floors",
        completionYear: 2026,
        duration: "14 months",
        constructionStage: "Block Masonry & Boundary Wall",
        services: ["Solid Block Masonry", "Brickwork", "Lintel Casting", "Stage Scaffolding"],
        coverImage: "/assets/projects/greenfield-villa.png",
      },
      {
        id: "greenfield-villa-enclave",
        title: "Greenfield Villa Enclave",
        slug: "greenfield-villa-enclave",
        projectType: "residential",
        status: "completed",
        location: { city: "Kazhakkoottam", district: "Trivandrum", state: "Kerala", country: "India" },
        builtUpArea: { value: 42000, unit: "sq_ft" },
        completionYear: 2025,
        duration: "12 months",
        constructionStage: "Completed",
        services: ["Turnkey Civil", "Landscaping", "Villa Construction"],
        coverImage: "/assets/projects/greenfield_villa.png",
      },
      {
        id: "greenwood-horizon",
        title: "Greenwood Horizon Commercial",
        slug: "greenwood-horizon",
        projectType: "commercial",
        status: "completed",
        location: { city: "Trivandrum", district: "Thiruvananthapuram", state: "Kerala", country: "India" },
        builtUpArea: { value: 65000, unit: "sq_ft" },
        completionYear: 2024,
        duration: "16 months",
        constructionStage: "Completed",
        services: ["Commercial Civil", "Structural Glazing", "MEP Oversight"],
        coverImage: "/assets/projects/residence-24.png",
      },
    ],
  },
  {
    id: "provider-sobha-developers",
    name: "Sobha Developers Kerala",
    aliases: ["Sobha Developers Kerala", "Sobha Signature Projects", "Sobha", "Sobha Silver Estate"],
    profession: "Premium Residential & Commercial Contractor • Turnkey Construction",
    location: "Thrissur City, Kerala",
    bio: "Sobha Developers Kerala delivers luxury residential projects with in-house craftsmanship, precision finishing, and international quality benchmarks.",
    websiteLabel: "sobha.com",
    websiteUrl: "https://www.sobha.com",
    skills: ["Vitrified Tile Laying", "Precision Finishing", "Structural Engineering", "Turnkey Execution"],
    verified: true,
    avatarUrl: "/assets/projects/residence-24.png",
    coverImageUrl: "/assets/hero-architecture-banner.webp",
    projects: [
      {
        id: "sobha-silver-estate",
        title: "Sobha Silver Estate Phase 2",
        slug: "sobha-silver-estate",
        projectType: "residential",
        status: "ongoing",
        location: { city: "Thrissur", district: "Thrissur", state: "Kerala", country: "India" },
        builtUpArea: { value: 160000, unit: "sq_ft" },
        floors: "12 Duplex Towers",
        completionYear: 2026,
        duration: "20 months",
        constructionStage: "Large Format Tile Laying",
        services: ["Tile Laying", "Epoxy Grouting", "Finishing Works"],
        coverImage: "/assets/projects/residence-24.png",
      },
      {
        id: "sobha-riverdale-villas",
        title: "Sobha Riverdale Villas",
        slug: "sobha-riverdale-villas",
        projectType: "residential",
        status: "completed",
        location: { city: "Aluva", district: "Ernakulam", state: "Kerala", country: "India" },
        builtUpArea: { value: 92000, unit: "sq_ft" },
        completionYear: 2025,
        duration: "18 months",
        constructionStage: "Completed",
        services: ["Civil Contracting", "Luxury Finishing", "Landscaping"],
        coverImage: "/assets/nila-hero-modern.jpg",
      },
      {
        id: "sobha-silicon-oasis",
        title: "Sobha Silicon Oasis",
        slug: "sobha-silicon-oasis",
        projectType: "commercial",
        status: "ongoing",
        location: { city: "Kochi", district: "Ernakulam", state: "Kerala", country: "India" },
        builtUpArea: { value: 185000, unit: "sq_ft" },
        completionYear: 2026,
        duration: "22 months",
        constructionStage: "Civil Core & Shell",
        services: ["Commercial Civil", "Structural Framework", "Glazing"],
        coverImage: "/assets/hero-architecture-banner.webp",
      },
    ],
  },
  {
    id: "provider-azure-properties",
    name: "Azure Ocean Properties",
    aliases: ["Azure Ocean Properties", "Azure Luxury Villa", "Azure Waterfront Towers", "Azure"],
    profession: "Waterfront Luxury Developments • High-End Residential & Coastal Engineering",
    location: "Marine Drive, Kochi",
    bio: "Azure Ocean Properties creates bespoke waterfront residences and coastal towers with maritime durability and premium finishes.",
    websiteLabel: "azureproperties.in",
    websiteUrl: "https://azureproperties.in",
    skills: ["Waterfront Construction", "MEP Engineering", "Coastal Foundations", "Luxury Interiors"],
    verified: true,
    avatarUrl: "/assets/projects/oak-house.png",
    coverImageUrl: "/assets/nila-hero-modern.jpg",
    projects: [
      {
        id: "azure-waterfront-towers",
        title: "Azure Waterfront Towers",
        slug: "azure-waterfront-towers",
        projectType: "multi_residential",
        status: "ongoing",
        location: { city: "Kochi", district: "Ernakulam", state: "Kerala", country: "India" },
        builtUpArea: { value: 130000, unit: "sq_ft" },
        floors: "16 Floors",
        completionYear: 2026,
        duration: "20 months",
        constructionStage: "MEP Conduit Wiring & Hydro-Testing",
        services: ["Electrical Cabling", "Pressure Piping", "MEP Testing"],
        coverImage: "/assets/nila-hero-modern.jpg",
      },
      {
        id: "azure-luxury-villa",
        title: "Azure Luxury Villa",
        slug: "azure-luxury-villa",
        projectType: "residential",
        status: "completed",
        location: { city: "Kakkanad", district: "Ernakulam", state: "Kerala", country: "India" },
        builtUpArea: { value: 6800, unit: "sq_ft" },
        completionYear: 2025,
        duration: "10 months",
        constructionStage: "Completed",
        services: ["Tile Work", "Interior Painting", "Smart Home Automation"],
        coverImage: "/assets/projects/oak-house.png",
      },
    ],
  },
  {
    id: "provider-asset-homes",
    name: "Asset Homes Contracting",
    aliases: ["Asset Homes Contracting", "Asset Homes", "Asset Signature Residency", "Nila Horizon Villas"],
    profession: "Sustainable Residential Communities • Gated Enclaves & Multi-Family Villas",
    location: "Kottayam Central, Kerala",
    bio: "Asset Homes Contracting builds award-winning residential communities, focusing on green certifications, lifetime warranty quality, and timely milestone handovers.",
    websiteLabel: "assethomes.in",
    websiteUrl: "https://assethomes.in",
    skills: ["Carpentry & Joinery", "Painting & Texturing", "Green Building", "Civil Works"],
    verified: true,
    avatarUrl: "/assets/nila-hero-modern.jpg",
    coverImageUrl: "/assets/nila-hero-modern.jpg",
    projects: [
      {
        id: "asset-signature-residency",
        title: "Asset Signature Residency",
        slug: "asset-signature-residency",
        projectType: "residential",
        status: "ongoing",
        location: { city: "Kottayam", district: "Kottayam", state: "Kerala", country: "India" },
        builtUpArea: { value: 74000, unit: "sq_ft" },
        completionYear: 2026,
        duration: "18 months",
        constructionStage: "Interior Carpentry & Finishing",
        services: ["Carpentry", "Door & Window Joinery", "Wall Painting"],
        coverImage: "/assets/projects/greenfield-villa.png",
      },
      {
        id: "nila-horizon-villas",
        title: "Nila Horizon Villas",
        slug: "nila-horizon-villas",
        projectType: "residential",
        status: "ongoing",
        location: { city: "Aluva", district: "Ernakulam", state: "Kerala", country: "India" },
        builtUpArea: { value: 52000, unit: "sq_ft" },
        completionYear: 2026,
        duration: "14 months",
        constructionStage: "Carpentry & Exterior Painting",
        services: ["Carpentry", "Weatherproof Painting", "Civil Finishing"],
        coverImage: "/assets/nila-hero-modern.jpg",
      },
    ],
  },
  {
    id: "provider-malabar-infrastructure",
    name: "Malabar Infrastructure Ltd",
    aliases: ["Malabar Infrastructure Ltd", "Malabar Hospitality Group", "Malabar Marine Promenade", "Malabar Heritage Resort", "Malabar"],
    profession: "Heritage Construction & Coastal Hospitality Developers",
    location: "Calicut Beach Road, Kozhikode",
    bio: "Malabar Infrastructure specializes in seaside hospitality developments, traditional laterite craftsmanship, and structural civil projects across North Kerala.",
    websiteLabel: "malabarinfrastructure.com",
    websiteUrl: "https://malabarinfrastructure.com",
    skills: ["Steel Fixing", "Laterite Masonry", "Hospitality Fit-Outs", "Monsoon Proofing"],
    verified: true,
    avatarUrl: "/assets/projects/residence-24.png",
    coverImageUrl: "/assets/projects/residence-24.png",
    projects: [
      {
        id: "malabar-marine-promenade",
        title: "Malabar Marine Promenade",
        slug: "malabar-marine-promenade",
        projectType: "commercial",
        status: "ongoing",
        location: { city: "Kozhikode", district: "Kozhikode", state: "Kerala", country: "India" },
        builtUpArea: { value: 110000, unit: "sq_ft" },
        completionYear: 2026,
        duration: "24 months",
        constructionStage: "Rebar Steel Fixing & Retaining Wall",
        services: ["Heavy Steel Fixing", "Marine Concrete", "Piling"],
        coverImage: "/assets/projects/residence-24.png",
      },
      {
        id: "malabar-heritage-resort",
        title: "Malabar Heritage Resort",
        slug: "malabar-heritage-resort",
        projectType: "hospitality",
        status: "ongoing",
        location: { city: "Kozhikode", district: "Kozhikode", state: "Kerala", country: "India" },
        builtUpArea: { value: 88000, unit: "sq_ft" },
        completionYear: 2026,
        duration: "20 months",
        constructionStage: "Structural Frame & Masons",
        services: ["Steel Fixing", "Solid Masonry", "Heritage Joinery"],
        coverImage: "/assets/projects/residence_24.png",
      },
    ],
  },
  {
    id: "provider-hilite-urban",
    name: "Hilite Urban Living",
    aliases: ["Hilite Urban Living", "Hilite CyberPark Extension", "Hilite Business Tower", "Hilite"],
    profession: "Commercial & Mixed-Use Infrastructure • IT Parks & Retail Spaces",
    location: "Kozhikode Bypass, Kerala",
    bio: "Hilite Urban Living is renowned for mixed-use commercial developments, high-density IT parks, and integrated urban lifestyle complexes across Kerala.",
    websiteLabel: "hilitebuilders.com",
    websiteUrl: "https://hilitebuilders.com",
    skills: ["Heavy Foundations", "Rebar & Steel Fixing", "Commercial Execution", "Large-Scale Concrete"],
    verified: true,
    avatarUrl: "/assets/projects/anitha-menon-residence.png",
    coverImageUrl: "/assets/projects/anitha-menon-residence.png",
    projects: [
      {
        id: "hilite-cyberpark-extension",
        title: "Hilite CyberPark Extension",
        slug: "hilite-cyberpark-extension",
        projectType: "commercial",
        status: "ongoing",
        location: { city: "Kozhikode", district: "Kozhikode", state: "Kerala", country: "India" },
        builtUpArea: { value: 240000, unit: "sq_ft" },
        completionYear: 2026,
        duration: "28 months",
        constructionStage: "Foundation Raft Rebar Tying",
        services: ["Heavy Rebar Bending", "Raft Mat Mesh Tying", "Starter Columns"],
        coverImage: "/assets/projects/anitha-menon-residence.png",
      },
      {
        id: "hilite-business-tower-2",
        title: "Hilite Business Tower 2",
        slug: "hilite-business-tower-2",
        projectType: "commercial",
        status: "completed",
        location: { city: "Kozhikode", district: "Kozhikode", state: "Kerala", country: "India" },
        builtUpArea: { value: 160000, unit: "sq_ft" },
        completionYear: 2025,
        duration: "22 months",
        constructionStage: "Completed",
        services: ["Commercial Civil", "Post-Tension Slabs", "Curtain Walls"],
        coverImage: "/assets/projects/residence-24.png",
      },
    ],
  },
  {
    id: "provider-prestige-group",
    name: "Prestige Group South",
    aliases: ["Prestige Group South", "Prestige CyberGreen Phase 1", "Prestige Tech Cloud", "Prestige"],
    profession: "Grade-A Commercial & Corporate Tech Parks",
    location: "Kakkanad InfoPark, Kochi",
    bio: "Prestige Group South is a pioneer in institutional-grade commercial IT infrastructure, tech parks, and premium corporate campuses in Kerala.",
    websiteLabel: "prestigeconstructions.com",
    websiteUrl: "https://prestigeconstructions.com",
    skills: ["MEP Coordination", "Commercial Civil", "Precast Technology", "LEED Certification"],
    verified: true,
    avatarUrl: "/assets/hero-architecture-banner.webp",
    coverImageUrl: "/assets/hero-architecture-banner.webp",
    projects: [
      {
        id: "prestige-cybergreen",
        title: "Prestige CyberGreen Phase 1",
        slug: "prestige-cybergreen",
        projectType: "commercial",
        status: "ongoing",
        location: { city: "Kochi", district: "Ernakulam", state: "Kerala", country: "India" },
        builtUpArea: { value: 310000, unit: "sq_ft" },
        completionYear: 2026,
        duration: "32 months",
        constructionStage: "Structure & MEP Installation",
        services: ["Precast Erection", "HVAC Infrastructure", "Commercial Civil"],
        coverImage: "/assets/hero-architecture-banner.webp",
      },
    ],
  },
  {
    id: "provider-tata-realty",
    name: "Tata Realty Kochi",
    aliases: ["Tata Realty Kochi", "Tata Promontory Luxury Apts", "Tata Realty", "Tata"],
    profession: "National Real Estate Developer • Luxury High-Rise Living",
    location: "Marine Drive, Kochi",
    bio: "Tata Realty brings trusted engineering excellence, safety leadership, and transparent delivery to signature residential addresses in Kerala.",
    websiteLabel: "tatarealty.in",
    websiteUrl: "https://tatarealty.in",
    skills: ["High-Rise Construction", "Earthquake Resistance", "Quality Assurance", "Turnkey Project Management"],
    verified: true,
    avatarUrl: "/assets/projects/greenfield-villa.png",
    coverImageUrl: "/assets/projects/greenfield-villa.png",
    projects: [
      {
        id: "tata-promontory",
        title: "Tata Promontory Luxury Apts",
        slug: "tata-promontory",
        projectType: "multi_residential",
        status: "completed",
        location: { city: "Kochi", district: "Ernakulam", state: "Kerala", country: "India" },
        builtUpArea: { value: 175000, unit: "sq_ft" },
        completionYear: 2025,
        duration: "24 months",
        constructionStage: "Completed",
        services: ["Civil Construction", "Luxury Amenities", "Turnkey Handover"],
        coverImage: "/assets/projects/greenfield-villa.png",
      },
    ],
  },
  {
    id: "provider-pranavam-hospitality",
    name: "Pranavam Convention Hospitality",
    aliases: ["Pranavam Convention Hospitality", "Grand Kerala Convention Centre", "Pranavam", "Pranavom Convention Hospitality", "Pranavom"],
    profession: "Large-Span Institutional & Event Venues",
    location: "Kollam Bypass, Kerala",
    bio: "Specializes in acoustic auditorium structures, convention halls, and monumental public venues with high-specification architectural coatings.",
    websiteLabel: "pranavamhospitality.in",
    websiteUrl: "https://pranavamhospitality.in",
    skills: ["Acoustic Design", "Airless Texture Coating", "Large Span Trusses", "Interior Fit-Outs"],
    verified: true,
    avatarUrl: "/assets/nila-hero-modern.jpg",
    coverImageUrl: "/assets/nila-hero-modern.jpg",
    projects: [
      {
        id: "grand-kerala-convention-centre",
        title: "Grand Kerala Convention Centre",
        slug: "grand-kerala-convention-centre",
        projectType: "commercial",
        status: "ongoing",
        location: { city: "Kollam", district: "Kollam", state: "Kerala", country: "India" },
        builtUpArea: { value: 125000, unit: "sq_ft" },
        completionYear: 2026,
        duration: "18 months",
        constructionStage: "Acoustic Wall Putty & Texture Finish",
        services: ["Airless Primer", "Acoustic Texture Spray", "Two-Coat Emulsion"],
        coverImage: "/assets/nila-hero-modern.jpg",
      },
    ],
  },
  {
    id: "provider-lulu-infrastructure",
    name: "Lulu IT Infrastructure",
    aliases: ["Lulu IT Infrastructure", "Lulu Cyber Park Interior", "Lulu Group", "Lulu"],
    profession: "Commercial IT Campuses & Turnkey Interiors",
    location: "Infopark Phase 2, Kochi",
    bio: "Lulu IT Infrastructure manages world-class commercial campus constructions, corporate fit-outs, and mission-critical MEP infrastructure in South India.",
    websiteLabel: "lulugroup.com",
    websiteUrl: "https://lulugroup.com",
    skills: ["Corporate Fit-Out", "Electrical Infrastructure", "HVAC Systems", "Turnkey Delivery"],
    verified: true,
    avatarUrl: "/assets/projects/anitha-menon-residence.png",
    coverImageUrl: "/assets/projects/anitha-menon-residence.png",
    projects: [
      {
        id: "lulu-cyber-park",
        title: "Lulu Cyber Park Interior",
        slug: "lulu-cyber-park",
        projectType: "commercial",
        status: "ongoing",
        location: { city: "Kochi", district: "Ernakulam", state: "Kerala", country: "India" },
        builtUpArea: { value: 190000, unit: "sq_ft" },
        completionYear: 2026,
        duration: "16 months",
        constructionStage: "HVAC & High-Density Electrical Dressing",
        services: ["Commercial Electrical", "HVAC Chiller Distribution", "Fit-Out Handover"],
        coverImage: "/assets/projects/anitha-menon-residence.png",
      },
    ],
  },
];

export const SERVICE_PROVIDER_RECORDS: ServiceProviderRecord[] = RAW_SERVICE_PROVIDER_RECORDS.map((rec) => ({
  slug: rec.slug || rec.id.replace(/^provider-/, ""),
  ...rec,
  projects: rec.projects.map(normalizeProject),
}));

export interface GetServiceProviderDataParams {
  providerQuery?: string;
  requestId?: string;
  assignmentId?: string;
  isOwner?: boolean;
}

export function findServiceProvider(params: GetServiceProviderDataParams): ServiceProviderRecord | null {
  const { providerQuery, requestId, assignmentId } = params;

  // 1. Try finding via requestId
  if (requestId) {
    const req = INITIAL_LABOUR_REQUESTS.find((r) => r.id === requestId);
    if (req) {
      const match = SERVICE_PROVIDER_RECORDS.find((p) =>
        p.aliases.some(
          (a) =>
            a.toLowerCase() === req.clientName.toLowerCase() ||
            req.clientName.toLowerCase().includes(a.toLowerCase()) ||
            a.toLowerCase().includes(req.clientName.toLowerCase())
        )
      );
      if (match) return match;
    }
  }

  // 2. Try finding via assignmentId
  if (assignmentId) {
    const asg = INITIAL_ASSIGNMENTS.find((a) => a.id === assignmentId);
    if (asg) {
      const match = SERVICE_PROVIDER_RECORDS.find((p) =>
        p.aliases.some(
          (a) =>
            a.toLowerCase() === asg.clientName.toLowerCase() ||
            asg.clientName.toLowerCase().includes(a.toLowerCase()) ||
            a.toLowerCase().includes(asg.clientName.toLowerCase())
        )
      );
      if (match) return match;
    }
  }

  // 3. Try finding via providerQuery string (supports slug, providerId, business name, or aliases)
  if (providerQuery) {
    const cleanQuery = providerQuery.trim().toLowerCase();
    const exactMatch = SERVICE_PROVIDER_RECORDS.find(
      (p) =>
        p.id.toLowerCase() === cleanQuery ||
        p.slug.toLowerCase() === cleanQuery ||
        p.id.toLowerCase() === `provider-${cleanQuery}` ||
        `provider-${p.slug.toLowerCase()}` === cleanQuery ||
        p.name.toLowerCase() === cleanQuery ||
        p.aliases.some((a) => a.toLowerCase() === cleanQuery)
    );
    if (exactMatch) return exactMatch;

    const partialMatch = SERVICE_PROVIDER_RECORDS.find(
      (p) =>
        p.name.toLowerCase().includes(cleanQuery) ||
        cleanQuery.includes(p.name.toLowerCase()) ||
        p.slug.toLowerCase().includes(cleanQuery) ||
        cleanQuery.includes(p.slug.toLowerCase()) ||
        p.aliases.some(
          (a) => a.toLowerCase().includes(cleanQuery) || cleanQuery.includes(a.toLowerCase())
        )
    );
    if (partialMatch) return partialMatch;
  }

  return null;
}

export function getProviderDisplayDetails(
  clientName: string,
  primaryTrade?: string,
): { name: string; profession: string; slug: string; providerId: string } {
  const provider = findServiceProvider({ providerQuery: clientName });
  if (provider) {
    const shortProfession = provider.profession.split("•")[0]?.trim() || provider.profession;
    return {
      name: provider.name,
      profession: shortProfession,
      slug: provider.slug || provider.id.replace(/^provider-/, ""),
      providerId: provider.id,
    };
  }
  const fallbackSlug = clientName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return {
    name: clientName,
    profession: primaryTrade ? `${primaryTrade} Requisition` : "Verified Service Provider",
    slug: fallbackSlug || "service-provider",
    providerId: `provider-${fallbackSlug}`,
  };
}

export function buildProviderCollections(
  allProjectIds: string[],
  projects: PortfolioProject[]
): PortfolioCollection[] {
  const residentialIds = projects
    .filter((p) => p.projectType === "residential" || p.projectType === "multi_residential")
    .map((p) => p.id);
  const commercialIds = projects
    .filter((p) => p.projectType === "commercial")
    .map((p) => p.id);
  const ongoingIds = projects
    .filter((p) => p.status === "ongoing")
    .map((p) => p.id);
  const completedIds = projects
    .filter((p) => p.status === "completed")
    .map((p) => p.id);

  return [
    {
      id: "all",
      label: "Featured",
      imageUrl: "/assets/studio/drawing-analysis.jpg",
      hasGradientRing: true,
      projectIds: allProjectIds,
    },
    {
      id: "residential",
      label: "Residences",
      imageUrl: "/assets/projects/oak_house.png",
      hasGradientRing: true,
      projectIds: residentialIds.length > 0 ? residentialIds : allProjectIds,
    },
    {
      id: "commercial",
      label: "Commercial",
      imageUrl: "/assets/hero-architecture-banner.webp",
      hasGradientRing: true,
      projectIds: commercialIds.length > 0 ? commercialIds : allProjectIds,
    },
    {
      id: "interiors",
      label: "Interiors",
      imageUrl: "/assets/projects/anitha_menon.png",
      hasGradientRing: true,
      projectIds: allProjectIds,
    },
    {
      id: "renovations",
      label: "Renovation",
      imageUrl: "/assets/projects/greenfield-villa.png",
      hasGradientRing: true,
      projectIds: completedIds.length > 0 ? completedIds : allProjectIds,
    },
    {
      id: "site-progress",
      label: "Site Progress",
      imageUrl: "/assets/projects/oak-house.png",
      hasGradientRing: false,
      projectIds: ongoingIds.length > 0 ? ongoingIds : allProjectIds,
    },
    {
      id: "drawings",
      label: "Drawings",
      imageUrl: "/assets/projects/anitha-menon-residence.png",
      hasGradientRing: false,
      projectIds: allProjectIds,
    },
    {
      id: "awards",
      label: "Awards",
      imageUrl: "/assets/feed-coffee.jpg",
      hasGradientRing: false,
      projectIds: allProjectIds,
    },
    {
      id: "about",
      label: "About",
      imageUrl: "",
      hasGradientRing: false,
      projectIds: allProjectIds,
    },
  ];
}

export function getServiceProviderPortfolioData(
  params: GetServiceProviderDataParams
): PortfolioPageData {
  const baseData = getPortfolioPageData(params.isOwner ?? false);
  const matchedProvider = findServiceProvider(params);

  // If matched a curated provider record
  if (matchedProvider) {
    const profile: PortfolioProfile = {
      providerId: matchedProvider.id,
      name: matchedProvider.name,
      profession: matchedProvider.profession,
      location: matchedProvider.location,
      bio: matchedProvider.bio,
      websiteLabel: matchedProvider.websiteLabel,
      websiteUrl: matchedProvider.websiteUrl,
      skills: matchedProvider.skills,
      availability: "Active on Kallisto Network",
      verified: matchedProvider.verified,
      avatarUrl: matchedProvider.avatarUrl,
      coverImageUrl: matchedProvider.coverImageUrl,
    };

    const projectIds = matchedProvider.projects.map((p) => p.id);
    const collections = buildProviderCollections(projectIds, matchedProvider.projects);

    return {
      ...baseData,
      mode: params.isOwner ? "owner" : "public",
      profile,
      projects: matchedProvider.projects,
      collections,
    };
  }

  // Dynamic fallback for any arbitrary client/provider name
  if (params.providerQuery) {
    const cleanName = params.providerQuery.trim();
    const dynamicSlug = cleanName.toLowerCase().replace(/[^a-z0-9]/g, "-");
    const domainLabel = `${cleanName.toLowerCase().replace(/[^a-z0-9]/g, "")}.com`;

    let relatedProjectName = "Flagship Infrastructure Site";
    let relatedLocation = "Kerala, India";
    if (params.requestId) {
      const r = INITIAL_LABOUR_REQUESTS.find((req) => req.id === params.requestId);
      if (r) {
        relatedProjectName = r.projectName;
        relatedLocation = r.location;
      }
    } else if (params.assignmentId) {
      const a = INITIAL_ASSIGNMENTS.find((asg) => asg.id === params.assignmentId);
      if (a) {
        relatedProjectName = a.projectName;
        relatedLocation = a.location;
      }
    }

    const dynamicProject: PortfolioProject = normalizeProject({
      id: `proj-${dynamicSlug}`,
      title: relatedProjectName,
      slug: dynamicSlug,
      projectType: "commercial",
      status: "ongoing",
      location: {
        city: relatedLocation.split(",")[0]?.trim() || "Kochi",
        state: "Kerala",
        country: "India",
      },
      builtUpArea: { value: 75000, unit: "sq_ft" },
      floors: "Multi-Storey",
      completionYear: 2026,
      duration: "18 months",
      constructionStage: "Active Construction",
      services: ["Civil Contracting", "Site Workforce Management", "Turnkey Delivery"],
      coverImage: "/assets/hero-architecture-banner.webp",
    });

    const profile: PortfolioProfile = {
      providerId: `provider-${dynamicSlug}`,
      name: cleanName,
      profession: "Licensed Civil Contractor & Infrastructure Developers",
      location: relatedLocation,
      bio: `${cleanName} is an approved and verified service provider operating across Kerala in residential, commercial, and turnkey construction.`,
      websiteLabel: domainLabel,
      websiteUrl: `https://${domainLabel}`,
      skills: ["Civil Contracting", "Site Supervision", "Structural Concrete", "Turnkey Handover"],
      availability: "Active on Kallisto Network",
      verified: true,
      avatarUrl: "/assets/buildpro_logo.png",
      coverImageUrl: "/assets/hero-architecture-banner.webp",
    };

    return {
      ...baseData,
      mode: params.isOwner ? "owner" : "public",
      profile,
      projects: [dynamicProject],
      collections: buildProviderCollections([dynamicProject.id], [dynamicProject]),
    };
  }

  // Default fallback if no provider param passed: provide first verified contractor
  if (SERVICE_PROVIDER_RECORDS.length > 0) {
    const defaultProvider = SERVICE_PROVIDER_RECORDS[0];
    const projectIds = defaultProvider.projects.map((p) => p.id);
    return {
      ...baseData,
      mode: params.isOwner ? "owner" : "public",
      profile: {
        providerId: defaultProvider.id,
        name: defaultProvider.name,
        profession: defaultProvider.profession,
        location: defaultProvider.location,
        bio: defaultProvider.bio,
        websiteLabel: defaultProvider.websiteLabel,
        websiteUrl: defaultProvider.websiteUrl,
        skills: defaultProvider.skills,
        availability: "Active on Kallisto Network",
        verified: defaultProvider.verified,
        avatarUrl: defaultProvider.avatarUrl,
        coverImageUrl: defaultProvider.coverImageUrl,
      },
      projects: defaultProvider.projects,
      collections: buildProviderCollections(projectIds, defaultProvider.projects),
    };
  }

  return baseData;
}

export function getServiceProviderDetailedProject(projectId: string): PortfolioProject | null {
  for (const provider of SERVICE_PROVIDER_RECORDS) {
    const project = provider.projects.find((p) => p.id === projectId || p.slug === projectId);
    if (project) return project;
  }
  return null;
}
