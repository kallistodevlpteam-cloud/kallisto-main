import type {
  PortfolioCaseStudy,
  PortfolioCollection,
  PortfolioDrawing,
  PortfolioPageData,
  PortfolioProfile,
  PortfolioProject,
  PortfolioSiteProgressUpdate,
  PortfolioStatistic,
  TaggedPortfolioItem,
} from "@/features/portfolio/types/portfolio.types";

const PROFILE: PortfolioProfile = {
  providerId: "arjun-architects",
  name: "Arjun Architects",
  profession: "Architect • Residential Designer • 3D Visualization Expert",
  location: "Kochi, Kerala",
  bio: "Residential and commercial architecture studio specialising in climate-responsive design, interior planning and coordinated project delivery.",
  websiteLabel: "arjunarchitects.in",
  websiteUrl: "https://arjunarchitects.in",
  skills: [
    "Architecture",
    "Interior Design",
    "Project Coordination",
    "Residential",
    "Commercial",
  ],
  availability: "Available for selected projects",
  verified: true,
  avatarUrl: "/assets/profile_avatar.png",
  coverImageUrl: "/assets/hero-architecture-banner.webp",
};

const PROJECTS: PortfolioProject[] = [
  {
    id: "nila-residence",
    title: "Nila Residence",
    slug: "nila-residence",
    projectType: "residential",
    status: "completed",
    location: {
      city: "Kochi",
      district: "Ernakulam",
      state: "Kerala",
      country: "India",
    },
    builtUpArea: { value: 3200, unit: "sq_ft" },
    siteArea: { value: 8.5, unit: "cent" },
    floors: "2 Floors",
    bedrooms: "4 BHK",
    completionYear: 2026,
    duration: "18 months",
    constructionStage: "Completed",
    collaborators: ["Frame Structural Consultants", "Verdant Landscapes"],
    services: [
      "Architecture",
      "Interior Design",
      "Working Drawings",
      "Project Coordination",
    ],
    description:
      "A climate-responsive family residence organised around a shaded internal courtyard, cross-ventilated living spaces and a restrained material palette suited to Kerala’s tropical conditions.",
    designHighlights: [
      "Central landscaped courtyard",
      "Passive cross ventilation",
      "Deep shaded openings",
      "Locally sourced materials",
      "Integrated interior planning",
      "Natural daylight optimization",
    ],
    materials: ["Laterite", "Natural stone", "Timber", "Lime plaster"],
    materialItems: [
      {
        name: "Laterite",
        application: "Exterior thermal mass walls & courtyard masonry",
        colorSwatch: "#a0522d",
        image: "/assets/projects/oak-house.png",
      },
      {
        name: "Natural Stone",
        application: "Courtyard paving, veranda copings & thresholds",
        colorSwatch: "#708090",
        image: "/assets/hero-architecture-banner.webp",
      },
      {
        name: "Timber",
        application: "Teak joinery, louvers, windows & acoustic ceilings",
        colorSwatch: "#8b5a2b",
        image: "/assets/projects/anitha_menon.png",
      },
      {
        name: "Lime Plaster",
        application: "Breathable moisture-regulating wall finishes",
        colorSwatch: "#f5f5dc",
        image: "/assets/studio/visualisations.jpg",
      },
    ],
    tags: [
      "Tropical Architecture",
      "Courtyard House",
      "Residential",
      "Kerala",
      "Climate Responsive",
    ],
    coverImage: "/assets/hero-architecture-banner.webp",
    gallery: [
      "/assets/hero-architecture-banner.webp",
      "/assets/projects/anitha_menon.png",
      "/assets/studio/visualisations.jpg",
      "/assets/studio/floor-plans.jpg",
      "/assets/projects/greenfield-villa.png",
      "/assets/projects/oak-house.png",
      "/assets/studio/concept-plans.jpg",
      "/assets/studio/drawing-analysis.jpg",
    ],
    detailedGallery: [
      {
        id: "gal-1",
        url: "/assets/hero-architecture-banner.webp",
        category: "Exterior",
        caption: "Courtyard Entrance & Tropical Landscaped Facade",
        featured: true,
      },
      {
        id: "gal-2",
        url: "/assets/projects/anitha_menon.png",
        category: "Interior",
        caption: "Double-Height Living Room Overlooking Internal Court",
      },
      {
        id: "gal-3",
        url: "/assets/studio/visualisations.jpg",
        category: "3D Visuals",
        caption: "Twilight Ambient Lighting & Cross-Ventilation Concept",
      },
      {
        id: "gal-4",
        url: "/assets/studio/floor-plans.jpg",
        category: "Floor Plans",
        caption: "Ground Floor Architectural Plan & Spatial Flow",
      },
      {
        id: "gal-5",
        url: "/assets/projects/greenfield-villa.png",
        category: "Exterior",
        caption: "North Garden Verandah & Water Feature Integration",
      },
      {
        id: "gal-6",
        url: "/assets/projects/oak-house.png",
        category: "Interior",
        caption: "Family Dining Area with Reclaimed Teak Joinery",
      },
      {
        id: "gal-7",
        url: "/assets/studio/concept-plans.jpg",
        category: "Floor Plans",
        caption: "Upper Level Bedroom Zoning & Shaded Terrace Layout",
      },
      {
        id: "gal-8",
        url: "/assets/studio/drawing-analysis.jpg",
        category: "Construction Progress",
        caption: "Exposed Laterite Block Masonry & RCC Frame Erection",
      },
    ],
    editorialSummary: {
      vision:
        "Nila Residence was designed as a climate-responsive family home that balances privacy, natural light and passive ventilation. The planning is organised around a central landscaped courtyard that acts as the heart of the residence.",
      approach:
        "Deep shaded verandahs, high-volume cross-ventilated living zones, and porous laterite walls provide thermal comfort throughout Kerala's tropical monsoon and summer cycles without heavy reliance on artificial cooling.",
      context:
        "Located in a quiet residential enclave in Kochi, the home respects neighborhood setbacks while maximizing internal garden views, preserving mature tropical trees and harvesting rainwater through permeable courtyard paving.",
    },
    milestones: [
      {
        id: "m-01",
        stepNumber: "01",
        title: "Project Initiated",
        date: "January 2025",
        status: "Completed",
        description: "Initial client brief, site inspection, and zoning feasibility clearance.",
      },
      {
        id: "m-02",
        stepNumber: "02",
        title: "Site Study & Requirements",
        date: "February 2025",
        status: "Completed",
        description: "Topographic survey, sun-path analysis, and structured requirement sign-off.",
      },
      {
        id: "m-03",
        stepNumber: "03",
        title: "Concept Design",
        date: "March 2025",
        status: "Completed",
        description: "Courtyard spatial layout, 3D volumetric massing, and client presentation.",
      },
      {
        id: "m-04",
        stepNumber: "04",
        title: "Design Development",
        date: "May 2025",
        status: "Completed",
        description: "Structural grid alignment, MEP schematics, and material specifications.",
      },
      {
        id: "m-05",
        stepNumber: "05",
        title: "Working Drawings",
        date: "July 2025",
        status: "Completed",
        description: "GFC drawing pack, joinery details, and BOQ contractor tendering.",
      },
      {
        id: "m-06",
        stepNumber: "06",
        title: "Construction Started",
        date: "August 2025",
        status: "Completed",
        description: "Groundbreaking, laterite foundation, and RCC frame erection.",
      },
      {
        id: "m-07",
        stepNumber: "07",
        title: "Interior & Finishing",
        date: "June 2026",
        status: "Completed",
        description: "Custom teak carpentry, lime plaster application, and sanitary fittings.",
      },
      {
        id: "m-08",
        stepNumber: "08",
        title: "Project Completed",
        date: "July 2026",
        status: "Completed",
        description: "Final site audit, snag list clearance, and client handover.",
      },
    ],
    progressStages: [
      { stage: "Planning", percent: 100 },
      { stage: "Architecture", percent: 100 },
      { stage: "Documentation", percent: 100 },
      { stage: "Construction", percent: 100 },
      { stage: "Interior", percent: 100 },
      { stage: "Handover", percent: 100 },
    ],
    serviceScopes: [
      {
        name: "Architecture",
        description:
          "Full architectural design services from conceptual development through schematic design and approvals.",
        deliverables: [
          "Concept design and massing models",
          "Space planning and master layout",
          "Design development package",
          "Architectural statutory approval sets",
        ],
        status: "Delivered",
      },
      {
        name: "Interior Design",
        description:
          "Bespoke interior design and spatial coordination rooted in natural materials and ergonomic lighting.",
        deliverables: [
          "Interior space planning and zoning",
          "Material selection and finishes schedule",
          "Custom teak joinery & cabinetry details",
          "Lighting design and fixture selection",
        ],
        status: "Delivered",
      },
      {
        name: "Working Drawings",
        description:
          "Comprehensive technical documentation and Good-For-Construction (GFC) sets for contractor execution.",
        deliverables: [
          "Detailed architectural construction drawings",
          "Door, window, and louvers schedule",
          "Toilet and kitchen layout sheets",
          "Structural and MEP coordination drawings",
        ],
        status: "Delivered",
      },
      {
        name: "Project Coordination",
        description:
          "On-site monitoring, consultant integration, and strict quality assurance throughout construction.",
        deliverables: [
          "Structural and MEP consultant coordination",
          "Periodic site inspection and progress audits",
          "BOQ compliance and material verification",
          "Snagging management and handover sign-off",
        ],
        status: "Delivered",
      },
    ],
    teamMembers: [
      {
        role: "Lead Architect",
        name: "Arjun K.",
        organization: "Arjun Architects",
        service: "Architecture & Concept Planning",
        status: "Verified",
        isKallistoProvider: true,
        providerId: "arjun-architects",
      },
      {
        role: "Interior Designer",
        name: "Maya Nair",
        organization: "Arjun Architects",
        service: "Interior Architecture & Joinery",
        status: "Verified",
        isKallistoProvider: true,
        providerId: "arjun-architects",
      },
      {
        role: "Structural Engineer",
        name: "K. R. Varma",
        organization: "Frame Structural Consultants",
        service: "Structural Engineering & Grid Analysis",
        status: "Partner",
      },
      {
        role: "General Contractor",
        name: "Paulson Thomas",
        organization: "Greenfield Construction Ltd.",
        service: "Civil Construction & Execution",
        status: "Verified",
        isKallistoProvider: true,
      },
    ],
    updates: [
      {
        id: "upd-1",
        date: "12 Jun 2026",
        title: "Interior Work — 85% Complete",
        description:
          "Flooring and ceiling work completed across the living and dining areas. Custom teak joinery installation underway.",
        images: [
          "/assets/projects/anitha_menon.png",
          "/assets/studio/visualisations.jpg",
        ],
        addedBy: "Arjun K. (Lead Architect)",
        milestone: "Milestone 07: Interior & Finishing",
      },
      {
        id: "upd-2",
        date: "28 Apr 2026",
        title: "Courtyard Landscaping & Paving",
        description:
          "Natural stone paving laid in central courtyard with rainwater percolation wells and indigenous planting installed.",
        images: ["/assets/hero-architecture-banner.webp"],
        addedBy: "Maya Nair (Interior Team)",
        milestone: "Milestone 07: Interior & Finishing",
      },
      {
        id: "upd-3",
        date: "15 Jan 2026",
        title: "Structural Frame & Roof Slab Concreted",
        description:
          "Upper floor roof slab casting completed with double-curing cycle inspected and certified by structural consultant.",
        images: ["/assets/studio/drawing-analysis.jpg"],
        addedBy: "Paulson Thomas (Contractor)",
        milestone: "Milestone 06: Construction Started",
      },
    ],
    documents: [
      {
        id: "doc-1",
        name: "Project Brief & Requirements Sign-off",
        fileType: "PDF",
        size: "2.4 MB",
        updatedDate: "Jan 2025",
        version: "v1.0",
        url: "#",
      },
      {
        id: "doc-2",
        name: "Architectural Drawings & 3D Massing",
        fileType: "PDF",
        size: "14.8 MB",
        updatedDate: "Mar 2025",
        version: "v2.1",
        url: "#",
      },
      {
        id: "doc-3",
        name: "Floor Plans & Zoning Diagrams",
        fileType: "PDF",
        size: "8.2 MB",
        updatedDate: "May 2025",
        version: "v2.0",
        url: "#",
      },
      {
        id: "doc-4",
        name: "Elevations & Sectional Details",
        fileType: "PDF",
        size: "11.5 MB",
        updatedDate: "May 2025",
        version: "v1.8",
        url: "#",
      },
      {
        id: "doc-5",
        name: "GFC Working Drawing Package",
        fileType: "PDF",
        size: "22.0 MB",
        updatedDate: "Jul 2025",
        version: "v3.0",
        url: "#",
      },
      {
        id: "doc-6",
        name: "Approved Bill of Quantities (BOQ)",
        fileType: "XLSX",
        size: "1.6 MB",
        updatedDate: "Aug 2025",
        version: "v2.4",
        url: "#",
      },
      {
        id: "doc-7",
        name: "Technical Specifications Document",
        fileType: "PDF",
        size: "4.1 MB",
        updatedDate: "Aug 2025",
        version: "v1.2",
        url: "#",
      },
      {
        id: "doc-8",
        name: "Final Handover & Completion Certificate",
        fileType: "PDF",
        size: "3.5 MB",
        updatedDate: "Jul 2026",
        version: "Final",
        url: "#",
      },
    ],
    outcomesSummary:
      "Delivered within 18 months on budget with zero variation disputes. The passive ventilation strategy successfully reduced daytime interior temperatures by 4°C relative to outdoor ambient levels.",
    clientFeedback: {
      rating: 5,
      quote:
        "The entire process was well coordinated, from the initial design through completion. The central courtyard brings incredible light and airflow throughout the house, and Arjun's team managed every contractor seamlessly.",
      clientName: "Anitha & Rajesh Menon",
      projectContext: "Nila Residence, Kochi",
      date: "August 2026",
    },
    relatedProjectIds: ["courtyard-house", "fern-office", "sera-villa-renovation"],
    featured: true,
    visibility: "public",
  },
  {
    id: "courtyard-house",
    title: "Courtyard House",
    slug: "courtyard-house",
    projectType: "residential",
    status: "completed",
    location: {
      city: "Thrissur",
      district: "Thrissur",
      state: "Kerala",
      country: "India",
    },
    builtUpArea: { value: 2850, unit: "sq_ft" },
    siteArea: { value: 10.2, unit: "cent" },
    completionYear: 2025,
    duration: "16 months",
    constructionStage: "Completed",
    services: ["Architecture", "Working Drawings", "Landscape Coordination"],
    description:
      "A compact urban residence shaped around a light court that brings daylight, planting and ventilation deep into a constrained plot.",
    designHighlights: [
      "Double-height light court",
      "Layered privacy",
      "Shaded west façade",
      "Connected family spaces",
    ],
    materials: ["Exposed concrete", "Terracotta", "Timber screens"],
    tags: ["Urban House", "Courtyard", "Passive Design", "Thrissur"],
    coverImage: "/assets/projects/greenfield-villa.png",
    gallery: [
      "/assets/projects/greenfield-villa.png",
      "/assets/studio/visualisations.jpg",
      "/assets/studio/concept-plans.jpg",
    ],
    featured: true,
    visibility: "public",
  },
  {
    id: "fern-office",
    title: "The Fern Office",
    slug: "the-fern-office",
    projectType: "commercial",
    status: "completed",
    location: {
      city: "Kozhikode",
      district: "Kozhikode",
      state: "Kerala",
      country: "India",
    },
    builtUpArea: { value: 5400, unit: "sq_ft" },
    siteArea: { value: 14, unit: "cent" },
    completionYear: 2026,
    duration: "11 months",
    constructionStage: "Completed",
    collaborators: ["Gridline MEP Consultants"],
    services: ["Architecture", "Interior Design", "MEP Coordination"],
    description:
      "A flexible workplace for a growing design team, with daylight-led work zones, shared project tables and quieter rooms arranged around an internal garden.",
    designHighlights: [
      "Flexible team neighbourhoods",
      "Internal planted court",
      "Acoustic meeting rooms",
      "Integrated lighting strategy",
    ],
    materials: ["Oak veneer", "Acoustic felt", "Terrazzo", "Blackened steel"],
    tags: ["Workplace", "Commercial", "Interior Design", "Kozhikode"],
    coverImage: "/assets/studio/visualisations.jpg",
    gallery: [
      "/assets/studio/visualisations.jpg",
      "/assets/studio/drawing-analysis.jpg",
      "/assets/studio/concept-plans.jpg",
    ],
    featured: true,
    visibility: "public",
  },
  {
    id: "sera-villa-renovation",
    title: "Sera Villa Renovation",
    slug: "sera-villa-renovation",
    projectType: "renovation",
    status: "completed",
    location: {
      city: "Thiruvananthapuram",
      district: "Thiruvananthapuram",
      state: "Kerala",
      country: "India",
    },
    builtUpArea: { value: 2400, unit: "sq_ft" },
    siteArea: { value: 7.5, unit: "cent" },
    completionYear: 2025,
    duration: "9 months",
    constructionStage: "Completed",
    services: ["Renovation Design", "Interior Design", "Site Coordination"],
    description:
      "A careful renewal of an ageing family home that improves daylight, circulation and everyday comfort while retaining its original timber character.",
    designHighlights: [
      "Retained original timber structure",
      "Replanned family living spaces",
      "Improved natural light",
      "Low-waste material reuse",
    ],
    materials: ["Reclaimed timber", "Lime plaster", "Handmade tile"],
    tags: ["Renovation", "Adaptive Reuse", "Family Home", "Kerala"],
    coverImage: "/assets/projects/oak-house.png",
    gallery: [
      "/assets/projects/oak-house.png",
      "/assets/projects/oak_house.png",
      "/assets/projects/anitha-menon-residence.png",
    ],
    featured: true,
    visibility: "public",
  },
  {
    id: "terra-cafe",
    title: "Terra Café",
    slug: "terra-cafe",
    projectType: "hospitality",
    status: "completed",
    location: {
      city: "Kochi",
      district: "Ernakulam",
      state: "Kerala",
      country: "India",
    },
    builtUpArea: { value: 1800, unit: "sq_ft" },
    completionYear: 2026,
    duration: "5 months",
    constructionStage: "Completed",
    services: ["Interior Design", "Lighting Coordination", "Brand Coordination"],
    description:
      "A warm neighbourhood café with tactile natural finishes, layered lighting and flexible seating designed for quick visits and longer gatherings.",
    designHighlights: [
      "Flexible seating mix",
      "Open preparation counter",
      "Layered ambient lighting",
      "Locally made furniture",
    ],
    materials: ["Natural stone", "Rattan", "Solid wood", "Textured plaster"],
    tags: ["Hospitality", "Café Interior", "Kochi", "Natural Materials"],
    coverImage: "/assets/projects/anitha_menon.png",
    gallery: [
      "/assets/projects/anitha_menon.png",
      "/assets/studio/visualisations.jpg",
      "/assets/project-banner.jpg",
    ],
    featured: false,
    visibility: "public",
  },
  {
    id: "grove-apartments",
    title: "Grove Apartments",
    slug: "grove-apartments",
    projectType: "multi_residential",
    status: "ongoing",
    location: {
      city: "Kottayam",
      district: "Kottayam",
      state: "Kerala",
      country: "India",
    },
    builtUpArea: { value: 28000, unit: "sq_ft" },
    siteArea: { value: 1.4, unit: "acre" },
    expectedCompletionYear: 2027,
    duration: "30 months",
    constructionStage: "Superstructure",
    services: ["Architecture", "Approval Drawings", "Project Coordination"],
    description:
      "A low-rise apartment community planned around mature trees, shaded common spaces and naturally ventilated circulation.",
    designHighlights: [
      "Tree-retentive site planning",
      "Naturally ventilated corridors",
      "Shared shaded court",
      "Rainwater management",
    ],
    materials: ["Exposed brick", "Concrete", "Terracotta screens"],
    tags: ["Apartments", "Multi-residential", "Site Progress", "Kottayam"],
    coverImage: "/assets/projects/oak_house.png",
    gallery: [
      "/assets/projects/oak_house.png",
      "/assets/studio/drawing-analysis.jpg",
      "/assets/studio/floor-plans.jpg",
    ],
    featured: false,
    visibility: "public",
  },
  {
    id: "lumen-showroom",
    title: "Lumen Showroom",
    slug: "lumen-showroom",
    projectType: "retail",
    status: "completed",
    location: {
      city: "Kannur",
      district: "Kannur",
      state: "Kerala",
      country: "India",
    },
    builtUpArea: { value: 3600, unit: "sq_ft" },
    completionYear: 2025,
    duration: "7 months",
    constructionStage: "Completed",
    services: ["Interior Design", "Lighting Coordination", "Working Drawings"],
    description:
      "A calm retail interior that uses controlled lighting, modular display walls and durable finishes to give changing collections a consistent setting.",
    designHighlights: [
      "Modular display system",
      "High colour-rendering lighting",
      "Integrated storage",
      "Durable customer circulation",
    ],
    materials: ["Microcement", "Oak veneer", "Brushed brass", "Linen"],
    tags: ["Retail", "Showroom", "Lighting", "Kannur"],
    coverImage: "/assets/projects/anitha-menon-residence.png",
    gallery: [
      "/assets/projects/anitha-menon-residence.png",
      "/assets/projects/anitha_menon.png",
      "/assets/studio/visualisations.jpg",
    ],
    featured: false,
    visibility: "public",
  },
  {
    id: "hillview-retreat",
    title: "Hillview Retreat",
    slug: "hillview-retreat",
    projectType: "hospitality",
    status: "ongoing",
    location: {
      city: "Wayanad",
      district: "Wayanad",
      state: "Kerala",
      country: "India",
    },
    builtUpArea: { value: 12500, unit: "sq_ft" },
    siteArea: { value: 3.2, unit: "acre" },
    expectedCompletionYear: 2027,
    duration: "24 months",
    constructionStage: "Foundation",
    services: ["Master Planning", "Architecture", "Landscape Coordination"],
    description:
      "A hillside hospitality retreat planned as a series of low-impact pavilions connected by shaded paths and framed views across the valley.",
    designHighlights: [
      "Contour-responsive planning",
      "Minimal cut and fill",
      "Native landscape strategy",
      "Rainwater-fed planting",
    ],
    materials: ["Local stone", "Timber", "Clay tile", "Lime render"],
    tags: ["Hospitality", "Retreat", "Wayanad", "Landscape"],
    coverImage: "/assets/projects/greenfield_villa.png",
    gallery: [
      "/assets/projects/greenfield_villa.png",
      "/assets/projects/residence_24.png",
      "/assets/studio/concept-plans.jpg",
    ],
    featured: false,
    visibility: "public",
  },
  {
    id: "riverstone-clinic",
    title: "Riverstone Clinic",
    slug: "riverstone-clinic",
    projectType: "institutional",
    status: "completed",
    location: {
      city: "Palakkad",
      district: "Palakkad",
      state: "Kerala",
      country: "India",
    },
    builtUpArea: { value: 7200, unit: "sq_ft" },
    siteArea: { value: 32, unit: "cent" },
    completionYear: 2025,
    services: ["Architecture", "Approval Drawings", "MEP Coordination"],
    description:
      "A compact outpatient clinic organised for intuitive movement, privacy and glare-free daylight across consulting and waiting areas.",
    designHighlights: [
      "Clear patient circulation",
      "Daylit waiting spaces",
      "Universal access",
      "Efficient clinical services",
    ],
    materials: ["Kota stone", "Terracotta screen", "Washable plaster"],
    tags: ["Healthcare", "Institutional", "Universal Design", "Palakkad"],
    coverImage: "/assets/studio/concept-plans.jpg",
    gallery: [
      "/assets/studio/concept-plans.jpg",
      "/assets/studio/drawing-analysis.jpg",
      "/assets/studio/floor-plans.jpg",
    ],
    featured: false,
    visibility: "public",
  },
  {
    id: "mangrove-learning-centre",
    title: "Mangrove Learning Centre",
    slug: "mangrove-learning-centre",
    projectType: "institutional",
    status: "ongoing",
    location: {
      city: "Alappuzha",
      district: "Alappuzha",
      state: "Kerala",
      country: "India",
    },
    builtUpArea: { value: 9800, unit: "sq_ft" },
    siteArea: { value: 1.8, unit: "acre" },
    expectedCompletionYear: 2027,
    services: ["Architecture", "Working Drawings", "Project Coordination"],
    description:
      "A community learning centre with shaded classrooms, covered outdoor teaching spaces and a landscape strategy adapted to a water-sensitive site.",
    designHighlights: [
      "Covered outdoor classrooms",
      "Flood-resilient plinth",
      "Cross-ventilated learning spaces",
      "Water-sensitive landscape",
    ],
    materials: ["Compressed earth block", "Bamboo", "Clay tile"],
    tags: ["Education", "Community", "Climate Responsive", "Alappuzha"],
    coverImage: "/assets/studio/drawing-analysis.jpg",
    gallery: [
      "/assets/studio/drawing-analysis.jpg",
      "/assets/studio/concept-plans.jpg",
      "/assets/projects/oak_house.png",
    ],
    featured: false,
    visibility: "public",
  },
  {
    id: "canal-edge-home",
    title: "Canal Edge Home",
    slug: "canal-edge-home",
    projectType: "residential",
    status: "completed",
    location: {
      city: "Alappuzha",
      district: "Alappuzha",
      state: "Kerala",
      country: "India",
    },
    builtUpArea: { value: 2600, unit: "sq_ft" },
    siteArea: { value: 11, unit: "cent" },
    completionYear: 2024,
    services: ["Architecture", "Interior Planning", "Landscape Coordination"],
    description:
      "A waterfront home with raised living spaces, shaded verandahs and a sequence of framed views toward the canal and garden.",
    designHighlights: [
      "Raised flood-conscious plinth",
      "Deep verandahs",
      "Framed water views",
      "Native planting",
    ],
    materials: ["Laterite", "Timber", "Athangudi tile"],
    tags: ["Waterfront", "Residential", "Alappuzha", "Tropical"],
    coverImage: "/assets/projects/residence-24.png",
    gallery: [
      "/assets/projects/residence-24.png",
      "/assets/projects/anitha-menon-residence.png",
      "/assets/studio/floor-plans.jpg",
    ],
    featured: false,
    visibility: "public",
  },
  {
    id: "atelier-workspace",
    title: "Atelier Workspace",
    slug: "atelier-workspace",
    projectType: "interior",
    status: "completed",
    location: {
      city: "Kochi",
      district: "Ernakulam",
      state: "Kerala",
      country: "India",
    },
    builtUpArea: { value: 4200, unit: "sq_ft" },
    completionYear: 2024,
    services: ["Interior Design", "Working Drawings", "Lighting Coordination"],
    description:
      "A collaborative studio interior with long shared worktables, pin-up walls, a compact material library and quiet rooms for focused work.",
    designHighlights: [
      "Shared project tables",
      "Material library",
      "Flexible review wall",
      "Daylight-led work zones",
    ],
    materials: ["Birch plywood", "Linoleum", "Powder-coated steel"],
    tags: ["Workspace", "Interior", "Studio", "Kochi"],
    coverImage: "/assets/studio/floor-plans.jpg",
    gallery: [
      "/assets/studio/floor-plans.jpg",
      "/assets/studio/visualisations.jpg",
      "/assets/project-banner.jpg",
    ],
    featured: false,
    visibility: "public",
  },
  {
    id: "lakefront-residence-concept",
    title: "Lakefront Residence Concept",
    slug: "lakefront-residence-concept",
    projectType: "residential",
    status: "draft",
    location: {
      city: "Kumarakom",
      district: "Kottayam",
      state: "Kerala",
      country: "India",
    },
    builtUpArea: { value: 3800, unit: "sq_ft" },
    services: ["Architecture", "Concept Design"],
    description:
      "Early concept development for a waterfront family residence.",
    tags: ["Draft", "Residential"],
    coverImage: "/assets/projects/residence-24.png",
    gallery: ["/assets/projects/residence-24.png"],
    featured: false,
    visibility: "private",
    lastEditedAt: "Today, 10:42 AM",
    completionPercent: 72,
  },
  {
    id: "coastal-retail-fitout",
    title: "Coastal Retail Fit-out",
    slug: "coastal-retail-fitout",
    projectType: "retail",
    status: "draft",
    location: {
      city: "Kozhikode",
      district: "Kozhikode",
      state: "Kerala",
      country: "India",
    },
    builtUpArea: { value: 2200, unit: "sq_ft" },
    services: ["Interior Design", "Lighting Coordination"],
    description: "A developing retail interior with modular display planning.",
    tags: ["Draft", "Retail"],
    coverImage: "/assets/projects/anitha_menon.png",
    gallery: ["/assets/projects/anitha_menon.png"],
    featured: false,
    visibility: "private",
    lastEditedAt: "Yesterday, 4:18 PM",
    completionPercent: 48,
  },
  {
    id: "heritage-bungalow-restoration",
    title: "Heritage Bungalow Restoration",
    slug: "heritage-bungalow-restoration",
    projectType: "renovation",
    status: "draft",
    location: {
      city: "Fort Kochi",
      district: "Ernakulam",
      state: "Kerala",
      country: "India",
    },
    builtUpArea: { value: 3100, unit: "sq_ft" },
    services: ["Conservation Planning", "Interior Design"],
    description: "A draft restoration study for a century-old coastal bungalow.",
    tags: ["Draft", "Restoration"],
    coverImage: "/assets/projects/oak-house.png",
    gallery: ["/assets/projects/oak-house.png"],
    featured: false,
    visibility: "private",
    lastEditedAt: "24 Jul 2026",
    completionPercent: 31,
  },
  {
    id: "seafront-estate",
    title: "Seafront Estate",
    slug: "seafront-estate",
    projectType: "residential",
    status: "design_development",
    location: {
      city: "Varkala",
      district: "Thiruvananthapuram",
      state: "Kerala",
      country: "India",
    },
    services: ["Architecture", "Interior Design"],
    description: "A confidential coastal residence in design development.",
    tags: ["Private", "Residential"],
    coverImage: "/assets/projects/greenfield_villa.png",
    gallery: ["/assets/projects/greenfield_villa.png"],
    featured: false,
    visibility: "private",
  },
  {
    id: "pepper-house-extension",
    title: "Pepper House Extension",
    slug: "pepper-house-extension",
    projectType: "renovation",
    status: "archived",
    location: {
      city: "Idukki",
      district: "Idukki",
      state: "Kerala",
      country: "India",
    },
    services: ["Architecture"],
    description: "An archived extension study retained for studio records.",
    tags: ["Archived", "Renovation"],
    coverImage: "/assets/projects/oak_house.png",
    gallery: ["/assets/projects/oak_house.png"],
    featured: false,
    visibility: "private",
  },
];

const OWNER_STATISTICS: PortfolioStatistic[] = [
  {
    id: "completed",
    label: "Projects Completed",
    value: "24+",
    href: "/portfolio?portfolioTab=projects",
  },
  {
    id: "experience",
    label: "Years Experience",
    value: "8+",
    href: "/portfolio?portfolioTab=case-studies",
  },
  {
    id: "reviews",
    label: "(32 Reviews)",
    value: "4.8",
    hasStar: true,
    href: "/portfolio?portfolioTab=case-studies",
  },
  {
    id: "satisfaction",
    label: "Client Satisfaction",
    value: "98%",
    href: "/portfolio?portfolioTab=projects",
  },
  {
    id: "followers",
    label: "Followers",
    value: "156",
    href: "/portfolio?portfolioTab=projects",
  },
];

const PUBLIC_STATISTICS: PortfolioStatistic[] = [
  {
    id: "completed",
    label: "Projects Completed",
    value: "24+",
    href: "/portfolio?view=public&portfolioTab=projects",
  },
  {
    id: "experience",
    label: "Years Experience",
    value: "8+",
    href: "/portfolio?view=public&portfolioTab=case-studies",
  },
  {
    id: "reviews",
    label: "(32 Reviews)",
    value: "4.8",
    hasStar: true,
    href: "/portfolio?view=public&portfolioTab=case-studies",
  },
  {
    id: "satisfaction",
    label: "Client Satisfaction",
    value: "98%",
    href: "/portfolio?view=public&portfolioTab=projects",
  },
  {
    id: "followers",
    label: "Followers",
    value: "156",
    href: "/portfolio?view=public&portfolioTab=projects",
  },
];

const COLLECTIONS: PortfolioCollection[] = [
  {
    id: "all",
    label: "Featured",
    imageUrl: "/assets/studio/drawing-analysis.jpg",
    hasGradientRing: true,
    projectIds: PROJECTS.filter(isPublicProject).map((project) => project.id),
  },
  {
    id: "residential",
    label: "Residences",
    imageUrl: "/assets/projects/oak_house.png",
    hasGradientRing: true,
    projectIds: ["nila-residence", "courtyard-house", "canal-edge-home"],
  },
  {
    id: "commercial",
    label: "Commercial",
    imageUrl: "/assets/hero-architecture-banner.webp",
    hasGradientRing: true,
    projectIds: ["fern-office", "riverstone-clinic", "atelier-workspace"],
  },
  {
    id: "interiors",
    label: "Interiors",
    imageUrl: "/assets/projects/anitha_menon.png",
    hasGradientRing: true,
    projectIds: ["fern-office", "terra-cafe", "lumen-showroom"],
  },
  {
    id: "renovations",
    label: "Renovation",
    imageUrl: "/assets/projects/greenfield-villa.png",
    hasGradientRing: true,
    projectIds: ["sera-villa-renovation"],
  },
  {
    id: "site-progress",
    label: "Site Progress",
    imageUrl: "/assets/projects/oak-house.png",
    hasGradientRing: false,
    projectIds: PROJECTS.filter(isPublicProject).map((project) => project.id),
  },
  {
    id: "drawings",
    label: "Drawings",
    imageUrl: "/assets/projects/anitha-menon-residence.png",
    hasGradientRing: false,
    projectIds: PROJECTS.filter(isPublicProject).map((project) => project.id),
  },
  {
    id: "awards",
    label: "Awards",
    imageUrl: "/assets/feed-coffee.jpg",
    hasGradientRing: false,
    projectIds: PROJECTS.filter(isPublicProject).map((project) => project.id),
  },
  {
    id: "about",
    label: "About",
    imageUrl: "",
    hasGradientRing: false,
    projectIds: PROJECTS.filter(isPublicProject).map((project) => project.id),
  },
];

const CASE_STUDIES: PortfolioCaseStudy[] = [
  {
    id: "case-study-nila-residence",
    projectId: "nila-residence",
    projectType: "residential",
    title: "A Climate-Responsive Courtyard Home For A Growing Family",
    coverImageUrl: "/assets/hero-architecture-banner.webp",
    clientBrief:
      "Designed for a growing family, this residence embraces climate-responsive architecture to create naturally comfortable living spaces throughout the year. Thoughtful orientation, a central courtyard, cross ventilation, and abundant daylight reduce energy consumption while fostering a seamless connection between indoor and outdoor environments.",
    designResponse:
      "The home is organised around a central courtyard that connects living spaces while improving daylight and passive ventilation.",
    scopeOfServices:
      "Architecture, interior planning, working drawings and project coordination.",
    projectOutcome:
      "A naturally ventilated residence with reduced heat gain, connected family spaces and a clear indoor-outdoor relationship.",
    completionYear: 2026,
  },
  {
    id: "case-study-courtyard-house",
    projectId: "courtyard-house",
    projectType: "residential",
    title: "A Climate-Responsive Courtyard Home For A Growing Family",
    coverImageUrl: "/assets/projects/greenfield-villa.png",
    clientBrief:
      "Designed for a growing family, this residence embraces climate-responsive architecture to create naturally comfortable living spaces throughout the year. Thoughtful orientation, a central courtyard, cross ventilation, and abundant daylight reduce energy consumption while fostering a seamless connection between indoor and outdoor environments.",
    designResponse:
      "A compact light court, split-level volumes and screened openings bring daylight into the centre while protecting privacy from neighbouring plots.",
    scopeOfServices:
      "Architecture, working drawings, landscape coordination and periodic site review.",
    projectOutcome:
      "A bright, naturally ventilated home that makes a constrained site feel calm, generous and connected to planting.",
    completionYear: 2026,
  },
  {
    id: "case-study-fern-office",
    projectId: "fern-office",
    projectType: "residential",
    title: "A Climate-Responsive Courtyard Home For A Growing Family",
    coverImageUrl: "/assets/studio/visualisations.jpg",
    clientBrief:
      "Designed for a growing family, this residence embraces climate-responsive architecture to create naturally comfortable living spaces throughout the year. Thoughtful orientation, a central courtyard, cross ventilation, and abundant daylight reduce energy consumption while fostering a seamless connection between indoor and outdoor environments.",
    designResponse:
      "Shared work zones are arranged around an internal garden, with acoustic rooms and adaptable project tables supporting different working modes.",
    scopeOfServices:
      "Architecture, interior design, lighting design and MEP coordination.",
    projectOutcome:
      "A flexible, daylit office that improves team interaction while providing quieter settings for concentrated work.",
    completionYear: 2026,
  },
  {
    id: "case-study-sera-villa",
    projectId: "sera-villa-renovation",
    projectType: "renovation",
    title: "Renovating an ageing home without erasing its original character",
    coverImageUrl: "/assets/projects/oak-house.png",
    clientBrief:
      "Update a long-held family home for contemporary living while retaining its recognisable timber structure and familiar room proportions.",
    designResponse:
      "Selective openings, a replanned kitchen and carefully repaired timber elements improve daily use without replacing the house’s defining character.",
    scopeOfServices:
      "Renovation design, interior design, material specification and site coordination.",
    projectOutcome:
      "A more comfortable and light-filled home that preserves its original identity while supporting a new generation of family life.",
    completionYear: 2025,
  },
];

const DRAWINGS: PortfolioDrawing[] = [
  {
    id: "drawing-nila-ground-floor",
    projectId: "nila-residence",
    title: "Ground floor courtyard plan",
    category: "Floor plan",
    previewImageUrl: "/assets/studio/floor-plans.jpg",
    revision: "R04",
    issueStatus: "Published",
    issueDate: "12 June 2026",
    visibility: "public",
  },
  {
    id: "drawing-nila-courtyard-section",
    projectId: "nila-residence",
    title: "Courtyard ventilation section",
    category: "Section",
    previewImageUrl: "/assets/studio/drawing-analysis.jpg",
    revision: "R03",
    issueStatus: "Published",
    issueDate: "28 May 2026",
    visibility: "public",
  },
  {
    id: "drawing-fern-services",
    projectId: "fern-office",
    title: "Reflected ceiling and services plan",
    category: "Services coordination",
    previewImageUrl: "/assets/studio/concept-plans.jpg",
    revision: "R05",
    issueStatus: "Published",
    issueDate: "19 April 2026",
    visibility: "public",
  },
  {
    id: "drawing-riverstone-elevation",
    projectId: "riverstone-clinic",
    title: "Shaded west elevation",
    category: "Elevation",
    previewImageUrl: "/assets/studio/drawing-analysis.jpg",
    revision: "R02",
    issueStatus: "Published",
    issueDate: "07 February 2025",
    visibility: "public",
  },
  {
    id: "drawing-grove-tender",
    projectId: "grove-apartments",
    title: "Typical apartment working plan",
    category: "Working drawing",
    previewImageUrl: "/assets/studio/floor-plans.jpg",
    revision: "R01",
    issueStatus: "Internal",
    issueDate: "22 July 2026",
    visibility: "private",
  },
];

const SITE_PROGRESS: PortfolioSiteProgressUpdate[] = [
  {
    id: "progress-nila-roof-slab",
    projectId: "nila-residence",
    projectName: "Nila Residence",
    stage: "Roof slab completed",
    updateDate: "18 July 2026",
    note: "Electrical conduit installation and internal blockwork are currently in progress.",
    primaryImageUrl: "/assets/projects/anitha_menon.png",
    supportingImageUrls: ["/assets/projects/residence_24.png"],
    visibility: "public",
  },
  {
    id: "progress-grove-structure",
    projectId: "grove-apartments",
    projectName: "Grove Apartments",
    stage: "Third-floor structure",
    updateDate: "11 July 2026",
    note: "Third-floor columns are complete and slab reinforcement checks are under way with the structural consultant.",
    primaryImageUrl: "/assets/projects/oak_house.png",
    supportingImageUrls: ["/assets/studio/drawing-analysis.jpg"],
    visibility: "public",
  },
  {
    id: "progress-hillview-site",
    projectId: "hillview-retreat",
    projectName: "Hillview Retreat",
    stage: "Guest pavilion foundations",
    updateDate: "04 July 2026",
    note: "Foundation work is progressing in the first pavilion cluster while contour drainage is being formed.",
    primaryImageUrl: "/assets/projects/greenfield_villa.png",
    visibility: "public",
  },
  {
    id: "progress-mangrove-plinth",
    projectId: "mangrove-learning-centre",
    projectName: "Mangrove Learning Centre",
    stage: "Raised plinth construction",
    updateDate: "26 June 2026",
    note: "The flood-resilient plinth is nearing completion before the classroom structural frame begins.",
    primaryImageUrl: "/assets/studio/visualisations.jpg",
    visibility: "public",
  },
  {
    id: "progress-private-review",
    projectId: "private-seafront-estate",
    projectName: "Seafront Estate",
    stage: "Client review",
    updateDate: "21 July 2026",
    note: "Private client review record.",
    primaryImageUrl: "/assets/project-banner.jpg",
    visibility: "private",
  },
];

const TAGGED_ITEMS: TaggedPortfolioItem[] = [
  {
    id: "tagged-terra-cafe",
    projectId: "terra-cafe",
    projectName: "Terra Café",
    coverImageUrl: "/assets/projects/anitha_menon.png",
    collaborator: "Verde Hospitality",
    role: "Interior design and site coordination",
    originalOwner: "Terra Hospitality",
    status: "Approved",
    projectType: "hospitality",
    category: "Hospitality",
  },
  {
    id: "tagged-hillview-retreat",
    projectId: "hillview-retreat",
    projectName: "Hillview Retreat",
    coverImageUrl: "/assets/projects/greenfield_villa.png",
    collaborator: "Western Ghats Landscape Collective",
    role: "Lead architect",
    originalOwner: "Hillview Resorts",
    status: "Approved",
    projectType: "residential",
    category: "Residential",
  },
  {
    id: "tagged-fern-office",
    projectId: "fern-office",
    projectName: "The Fern Office",
    coverImageUrl: "/assets/studio/visualisations.jpg",
    collaborator: "Gridline MEP Consultants",
    role: "Architecture and interior coordination",
    originalOwner: "Fern Creative",
    status: "Pending",
    projectType: "commercial",
    category: "Commercial",
  },
  {
    id: "tagged-grove-apartments",
    projectId: "grove-apartments",
    projectName: "Grove Apartments",
    coverImageUrl: "/assets/projects/oak_house.png",
    collaborator: "Structural Matrix",
    role: "Design architect",
    originalOwner: "Grove Living",
    status: "Hidden",
    projectType: "multi_residential",
    category: "Multi-residential",
  },
];
function isPublicProject(project: PortfolioProject): boolean {
  return (
    project.visibility === "public" &&
    project.status !== "draft" &&
    project.status !== "archived"
  );
}

export function getPortfolioPageData(isOwner: boolean): PortfolioPageData {
  const publicProjects = PROJECTS.filter(isPublicProject);

  return {
    mode: isOwner ? "owner" : "public",
    profile: PROFILE,
    statistics: isOwner ? OWNER_STATISTICS : PUBLIC_STATISTICS,
    collections: COLLECTIONS,
    projects: publicProjects,
    caseStudies: CASE_STUDIES,
    drawings: isOwner
      ? DRAWINGS
      : DRAWINGS.filter(
          (drawing) =>
            drawing.visibility === "public" &&
            drawing.issueStatus === "Published",
        ),
    siteProgress: isOwner
      ? SITE_PROGRESS
      : SITE_PROGRESS.filter((update) => update.visibility === "public"),
    taggedItems: isOwner
      ? TAGGED_ITEMS
      : TAGGED_ITEMS.filter((item) => item.status === "Approved"),
    drafts: isOwner
      ? PROJECTS.filter((project) => project.status === "draft")
      : [],
  };
}

export function getPortfolioProjects(): PortfolioProject[] {
  return PROJECTS;
}

export function addPortfolioProject(newProject: PortfolioProject): PortfolioProject {
  const existingIndex = PROJECTS.findIndex((p) => p.id === newProject.id);
  if (existingIndex >= 0) {
    PROJECTS[existingIndex] = newProject;
  } else {
    PROJECTS.unshift(newProject);
    if (COLLECTIONS[0] && !COLLECTIONS[0].projectIds.includes(newProject.id)) {
      COLLECTIONS[0].projectIds.unshift(newProject.id);
    }
  }
  return newProject;
}

export function getDetailedPortfolioProject(
  projectId: string,
): PortfolioProject | null {
  const project = PROJECTS.find(
    (p) => p.id === projectId || p.slug === projectId,
  );
  if (!project) {
    return null;
  }

  // Ensure default full-depth data structure for any project in portfolio
  const isCompleted = project.status === "completed";
  const progressPercent = isCompleted ? 100 : (project.completionPercent ?? 65);

  const fallbackGallery = (project.gallery && project.gallery.length > 0
    ? project.gallery
    : [project.coverImage]
  ).map((url, idx) => ({
    id: `gal-${idx + 1}`,
    url,
    category: (idx % 4 === 0
      ? "Exterior"
      : idx % 4 === 1
        ? "Interior"
        : idx % 4 === 2
          ? "Floor Plans"
          : "3D Visuals") as
      | "Exterior"
      | "Interior"
      | "Floor Plans"
      | "3D Visuals",
    caption: `${project.title} — View ${idx + 1}`,
    featured: idx === 0,
  }));

  const fallbackEditorial = {
    vision: `${project.title} was designed as a bespoke ${project.projectType} space that emphasizes climate sensitivity, efficient spatial planning, and high-quality material execution.`,
    approach: `The design balances contextual responsiveness with durable construction techniques suited to Kerala's environmental conditions.`,
    context: `Located in ${project.location.city}, ${project.location.state}, the project harmonizes with local zoning while maximizing natural light and ventilation.`,
  };

  const fallbackMilestones = [
    {
      id: "m-1",
      stepNumber: "01",
      title: "Project Initiated",
      date: "Jan 2025",
      status: "Completed" as const,
      description: "Brief formulation and preliminary site analysis.",
    },
    {
      id: "m-2",
      stepNumber: "02",
      title: "Concept Design",
      date: "Mar 2025",
      status: "Completed" as const,
      description: "Schematic layouts and 3D volumetric study.",
    },
    {
      id: "m-3",
      stepNumber: "03",
      title: "Working Drawings",
      date: "Jun 2025",
      status: "Completed" as const,
      description: "Good-For-Construction technical package.",
    },
    {
      id: "m-4",
      stepNumber: "04",
      title: "Construction Phase",
      date: "Nov 2025",
      status: isCompleted ? ("Completed" as const) : ("In Progress" as const),
      description: "On-site structural execution and trade coordination.",
    },
    {
      id: "m-5",
      stepNumber: "05",
      title: isCompleted ? "Project Completed" : "Final Handover",
      date: String(project.completionYear ?? "2026"),
      status: isCompleted ? ("Completed" as const) : ("Upcoming" as const),
      description: isCompleted
        ? "Client handover and documentation closure."
        : "Pending completion and snag list resolution.",
    },
  ];

  const fallbackProgressStages = [
    { stage: "Planning", percent: 100 },
    { stage: "Architecture", percent: 100 },
    { stage: "Documentation", percent: 100 },
    { stage: "Construction", percent: isCompleted ? 100 : 75 },
    { stage: "Interior", percent: isCompleted ? 100 : 50 },
    { stage: "Handover", percent: isCompleted ? 100 : 20 },
  ];

  const fallbackServices = project.services.map((svc) => ({
    name: svc,
    description: `Comprehensive ${svc.toLowerCase()} deliverables customized for ${project.title}.`,
    deliverables: [
      "Conceptual & detailed layouts",
      "Coordination & review packages",
      "Statutory & GFC specifications",
    ],
    status: isCompleted ? ("Delivered" as const) : ("In Progress" as const),
  }));

  const fallbackMaterials = (project.materials && project.materials.length > 0
    ? project.materials
    : ["Laterite", "Natural Stone", "Timber", "Lime Plaster"]
  ).map((mat) => ({
    name: mat,
    application: `Primary finish for ${project.title}`,
    colorSwatch: "#8b5a2b",
  }));

  const fallbackTeam = [
    {
      role: "Lead Architect",
      name: "Arjun K.",
      organization: "Arjun Architects",
      service: "Architecture",
      status: "Verified" as const,
      isKallistoProvider: true,
      providerId: "arjun-architects",
    },
    {
      role: "Interior Designer",
      name: "Maya Nair",
      organization: "Arjun Architects",
      service: "Interior Design",
      status: "Verified" as const,
      isKallistoProvider: true,
      providerId: "arjun-architects",
    },
    {
      role: "Structural Consultant",
      name: "K. R. Varma",
      organization: "Frame Structural Consultants",
      service: "Structural Engineering",
      status: "Partner" as const,
    },
  ];

  const fallbackDocuments = [
    {
      id: "doc-1",
      name: "Project Brief & Requirements",
      fileType: "PDF",
      size: "2.1 MB",
      updatedDate: "Jan 2025",
      version: "v1.0",
      url: "#",
    },
    {
      id: "doc-2",
      name: "Architectural Drawings Package",
      fileType: "PDF",
      size: "12.4 MB",
      updatedDate: "May 2025",
      version: "v2.0",
      url: "#",
    },
    {
      id: "doc-3",
      name: "GFC Working Drawing Set",
      fileType: "PDF",
      size: "18.6 MB",
      updatedDate: "Jul 2025",
      version: "v3.0",
      url: "#",
    },
    {
      id: "doc-4",
      name: "Bill of Quantities (BOQ)",
      fileType: "XLSX",
      size: "1.4 MB",
      updatedDate: "Aug 2025",
      version: "v2.2",
      url: "#",
    },
  ];

  const fallbackRelated = PROJECTS.filter((p) => p.id !== project.id)
    .slice(0, 3)
    .map((p) => p.id);

  return {
    ...project,
    floors: project.floors || "2 Floors",
    bedrooms: project.bedrooms || "4 BHK",
    detailedGallery:
      project.detailedGallery && project.detailedGallery.length > 0
        ? project.detailedGallery
        : fallbackGallery,
    editorialSummary: project.editorialSummary || fallbackEditorial,
    milestones:
      project.milestones && project.milestones.length > 0
        ? project.milestones
        : fallbackMilestones,
    progressStages:
      project.progressStages && project.progressStages.length > 0
        ? project.progressStages
        : fallbackProgressStages,
    serviceScopes:
      project.serviceScopes && project.serviceScopes.length > 0
        ? project.serviceScopes
        : fallbackServices,
    materialItems:
      project.materialItems && project.materialItems.length > 0
        ? project.materialItems
        : fallbackMaterials,
    teamMembers:
      project.teamMembers && project.teamMembers.length > 0
        ? project.teamMembers
        : fallbackTeam,
    updates: project.updates || [],
    documents:
      project.documents && project.documents.length > 0
        ? project.documents
        : fallbackDocuments,
    outcomesSummary:
      project.outcomesSummary ||
      `Delivered on schedule with comprehensive architectural coordination and strict material standards.`,
    clientFeedback: project.clientFeedback || undefined,
    relatedProjectIds:
      project.relatedProjectIds && project.relatedProjectIds.length > 0
        ? project.relatedProjectIds
        : fallbackRelated,
    completionPercent: progressPercent,
  };
}
