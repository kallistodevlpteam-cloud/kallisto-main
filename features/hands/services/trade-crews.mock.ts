import {
  BuildingDuotoneIcon,
  DrawingsDuotoneIcon,
  EnergyDuotoneIcon,
  ExploreDuotoneIcon,
  LayersDuotoneIcon,
  ResolveDuotoneIcon,
  SiteDuotoneIcon,
  UserDuotoneIcon,
} from "@/components/layout/sidebar-icons";

export interface CapabilityRating {
  name: string;
  rating: number; // 1-5
  levelLabel?: string;
  verifiedSites?: number;
  description?: string;
}

export interface CrewRoleBreakdown {
  count: number;
  role: string;
}

export interface CrewComposition {
  totalWorkforce: number;
  typicalDeployment: string;
  maxDeployment: number;
  crewLeadTitle: string;
  roles: CrewRoleBreakdown[];
}

export interface DeploymentEvidence {
  id: string;
  projectName: string;
  location: string;
  scopeTags: string[];
  workerCount: number;
  durationDays: number;
  year: number;
  status: "Completed" | "In Progress";
  rating: number;
  evidenceReference?: string;
}

export interface ReviewMetric {
  label: string;
  score: number;
}

export interface StarRatingBreakdown {
  starLabel: string;
  starValue: number;
  count: number;
  countLabel: string;
  percentage: number;
}

export interface ClientReviewItem {
  id: string;
  author: string;
  avatarUrl?: string;
  projectType: string;
  location: string;
  date: string;
  rating: number;
  comment: string;
  verifiedClient: boolean;
  photos?: string[];
}

export interface ReviewsBreakdown {
  overallScore: number;
  totalRatings?: number;
  starDistribution?: StarRatingBreakdown[];
  metrics: ReviewMetric[];
  testimonials: ClientReviewItem[];
}

export interface CalendarDayStatus {
  day: number;
  month: string;
  year: number;
  weekday: string;
  status: "available" | "partially_available" | "deployed";
}

export interface AvailabilitySchedule {
  monthName: string;
  year: number;
  days: CalendarDayStatus[];
  nextAvailableDate: string;
  currentDeploymentText: string;
}

export interface VerificationChecklist {
  identityVerified: boolean;
  crewLeadVerified: boolean;
  experienceVerified: boolean;
  previousDeploymentsVerified: boolean;
  skillAssessmentCompleted: boolean;
  documentsVerified: boolean;
  lastVerificationDate: string;
}

export interface RateCardItem {
  id: string;
  title: string;
  rate: number;
  unit: string;
  description: string;
  shiftHours?: number;
  highlight?: boolean;
}

export interface TradeCrew {
  id: string;
  name: string;
  trade: string;
  category: string;
  leadName: string;
  leadRole: string;
  verified: boolean;
  rating: number;
  reviewCount: number;
  completedJobs: number;
  experienceYears: number;
  crewSizeMin: number;
  crewSizeMax: number;
  dailyRate: number; // in INR
  rateUnit: string;
  availability: "immediate" | "this_week" | "next_week";
  availabilityLabel: string;
  location: string;
  state: string;
  skills: string[];
  certifications: string[];
  safetyCompliant: boolean;
  icon: typeof BuildingDuotoneIcon;
  accentColor: string;
  bgTint: string;

  // Rich Detail Profile fields
  about?: string;
  rateCards?: RateCardItem[];
  coreCapabilities?: string[];
  capabilityRatings?: CapabilityRating[];
  specializations?: string[];
  crewComposition?: CrewComposition;
  recentDeployments?: DeploymentEvidence[];
  reviewsBreakdown?: ReviewsBreakdown;
  availabilitySchedule?: AvailabilitySchedule;
  verification?: VerificationChecklist;
}

export const MOCK_TRADE_CREWS: TradeCrew[] = [
  {
    id: "crew-masons-01",
    name: "Master Masons & Brickwork Team",
    trade: "Masons",
    category: "Civil & Masonry",
    leadName: "Rajan K.",
    leadRole: "Master Mason & Site Lead",
    verified: true,
    rating: 4.9,
    reviewCount: 42,
    completedJobs: 64,
    experienceYears: 14,
    crewSizeMin: 4,
    crewSizeMax: 24,
    dailyRate: 950,
    rateUnit: "per worker / day",
    availability: "immediate",
    availabilityLabel: "Available Tomorrow",
    location: "Kochi, Ernakulam",
    state: "Kerala",
    skills: ["RCC Brickwork", "Plastering", "Foundation", "AAC Block Work", "Stone Masonry"],
    certifications: ["Kallisto Certified Civil Guild", "Site Safety Level 2"],
    safetyCompliant: true,
    icon: BuildingDuotoneIcon,
    accentColor: "#16a34a",
    bgTint: "#f0fdf4",
    about: "Experienced masonry crew specializing in high-tolerance structural brickwork, precision block masonry, and multi-coat sand-faced plastering. Tracked across 64+ commercial and premium residential developments across central Kerala with zero safety incidents.",
    rateCards: [
      {
        id: "rate-mason-lead",
        title: "Master Mason / Lead",
        rate: 950,
        unit: "/ day / worker",
        description: "8-hour shift · Structural alignment, beam infills & precision corner setting",
        shiftHours: 8,
        highlight: true,
      },
      {
        id: "rate-mason-skilled",
        title: "Skilled Block & Brick Mason",
        rate: 850,
        unit: "/ day / worker",
        description: "8-hour shift · High-speed AAC blockwork, fly-ash brickwork & joint mortar",
        shiftHours: 8,
      },
      {
        id: "rate-helper",
        title: "Civil Helper / Labourer",
        rate: 650,
        unit: "/ day / worker",
        description: "8-hour shift · Mortar mixing, block staging, curing & site cleanup",
        shiftHours: 8,
      },
      {
        id: "rate-squad-8",
        title: "Standard 8-Worker Gang",
        rate: 6400,
        unit: "/ day / squad",
        description: "1 Master + 4 Skilled + 3 Helpers · Optimal for 1,200–1,500 sq.ft daily masonry",
        shiftHours: 8,
      },
    ],
    coreCapabilities: [
      "Structural brickwork & load-bearing masonry",
      "Autoclaved Aerated Concrete (AAC) & concrete block laying",
      "External & internal single/double coat plastering",
      "RCC masonry support, beam infill, and lintel casting",
      "Foundation random rubble (RR) masonry & coping",
    ],
    capabilityRatings: [
      {
        name: "Structural RCC Masonry",
        rating: 5,
        levelLabel: "Mastery (5/5)",
        verifiedSites: 48,
        description: "Engineered shear wall infill, lintel casting, and tie-column integration to IS 456 standards",
      },
      {
        name: "AAC & Solid Concrete Blockwork",
        rating: 5,
        levelLabel: "Mastery (5/5)",
        verifiedSites: 52,
        description: "Precision laying (±2mm tolerance) with polymer thin-bed adhesive and bond-beam seismic ties",
      },
      {
        name: "Multi-Coat Plastering & Stucco",
        rating: 4,
        levelLabel: "Advanced (4/5)",
        verifiedSites: 38,
        description: "Smooth sponge float, troweled exterior stucco, and water-repellent plastering to IS 1661",
      },
      {
        name: "Architectural Exposed Brickwork",
        rating: 5,
        levelLabel: "Specialist (5/5)",
        verifiedSites: 24,
        description: "Precision English and Flemish bond with uniform 10mm recessed pointing",
      },
      {
        name: "Random Rubble (RR) Stone Masonry",
        rating: 4,
        levelLabel: "Advanced (4/5)",
        verifiedSites: 31,
        description: "Heavy retaining foundation masonry with weep-hole integration and cement coping",
      },
    ],
    specializations: [
      "Residential",
      "Commercial",
      "High-rise",
      "Villa",
      "Renovation",
      "Structural",
    ],
    crewComposition: {
      totalWorkforce: 8,
      typicalDeployment: "8–12 workers",
      maxDeployment: 24,
      crewLeadTitle: "Verified Site Supervisor",
      roles: [
        { count: 1, role: "Site Lead" },
        { count: 5, role: "Masons" },
        { count: 2, role: "Helpers" },
      ],
    },
    recentDeployments: [
      {
        id: "dep-mason-01",
        projectName: "Residential Villa — Kakkanad",
        location: "Kakkanad, Kochi",
        scopeTags: ["Masonry", "Plastering"],
        workerCount: 12,
        durationDays: 28,
        year: 2026,
        status: "Completed",
        rating: 4.9,
      },
      {
        id: "dep-mason-02",
        projectName: "Commercial Building — Kochi",
        location: "MG Road, Kochi",
        scopeTags: ["Blockwork", "Lintels"],
        workerCount: 18,
        durationDays: 42,
        year: 2026,
        status: "Completed",
        rating: 5.0,
      },
      {
        id: "dep-mason-03",
        projectName: "Skyline Residency Phase 2",
        location: "Edappally, Kochi",
        scopeTags: ["AAC Blocks", "Brick Infill"],
        workerCount: 16,
        durationDays: 21,
        year: 2025,
        status: "Completed",
        rating: 4.8,
      },
    ],
    reviewsBreakdown: {
      overallScore: 4.9,
      totalRatings: 42,
      starDistribution: [
        { starLabel: "5.0", starValue: 5, count: 36, countLabel: "36 Reviews", percentage: 86 },
        { starLabel: "4.0", starValue: 4, count: 5, countLabel: "5 Reviews", percentage: 12 },
        { starLabel: "3.0", starValue: 3, count: 1, countLabel: "1 Reviews", percentage: 2 },
        { starLabel: "2.0", starValue: 2, count: 0, countLabel: "0 Reviews", percentage: 0 },
        { starLabel: "1.0", starValue: 1, count: 0, countLabel: "0 Reviews", percentage: 0 },
      ],
      metrics: [
        { label: "Reliability", score: 4.9 },
        { label: "Quality", score: 4.9 },
        { label: "Timeliness", score: 4.7 },
        { label: "Communication", score: 4.9 },
      ],
      testimonials: [
        {
          id: "rev-m-01",
          author: "Marco MacGyver",
          projectType: "Residential Villa Project",
          location: "Kakkanad",
          date: "Aug 12, 2026",
          rating: 5,
          comment: "Experienced masonry crew specializing in high-tolerance structural brickwork and multi-coat plastering. Rajan managed the site coordination diligently with daily DPR logs and zero rework.",
          verifiedClient: true,
          photos: [
            "https://images.unsplash.com/photo-1541888946425-d0fbb180c5f5?w=150&auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?w=150&auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=150&auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1504307651554-6691fc9d0554?w=150&auto=format&fit=crop&q=80",
          ],
        },
        {
          id: "rev-m-02",
          author: "Robert Karmazov",
          projectType: "Commercial Office Block",
          location: "Kochi",
          date: "Jul 28, 2026",
          rating: 4,
          comment: "Flawless AAC blockwork line and plumb. Mortar mix consistency and joint packing passed structural audit on first inspection with rigorous safety compliance.",
          verifiedClient: true,
          photos: [
            "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=150&auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=150&auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=150&auto=format&fit=crop&q=80",
          ],
        },
      ],
    },
    availabilitySchedule: {
      monthName: "August",
      year: 2026,
      days: [
        { day: 24, month: "Aug", year: 2026, weekday: "Mon", status: "deployed" },
        { day: 25, month: "Aug", year: 2026, weekday: "Tue", status: "deployed" },
        { day: 26, month: "Aug", year: 2026, weekday: "Wed", status: "deployed" },
        { day: 27, month: "Aug", year: 2026, weekday: "Thu", status: "deployed" },
        { day: 28, month: "Aug", year: 2026, weekday: "Fri", status: "available" },
        { day: 29, month: "Aug", year: 2026, weekday: "Sat", status: "available" },
        { day: 30, month: "Aug", year: 2026, weekday: "Sun", status: "partially_available" },
        { day: 31, month: "Aug", year: 2026, weekday: "Mon", status: "available" },
        { day: 1, month: "Sep", year: 2026, weekday: "Tue", status: "available" },
        { day: 2, month: "Sep", year: 2026, weekday: "Wed", status: "available" },
      ],
      nextAvailableDate: "28 August 2026",
      currentDeploymentText: "Kochi • Until 27 Aug",
    },
    verification: {
      identityVerified: true,
      crewLeadVerified: true,
      experienceVerified: true,
      previousDeploymentsVerified: true,
      skillAssessmentCompleted: true,
      documentsVerified: true,
      lastVerificationDate: "18 Aug 2026",
    },
  },
  {
    id: "crew-electricians-01",
    name: "Certified MEP & Electrical Gang",
    trade: "Electricians",
    category: "Electrical & MEP",
    leadName: "Shaji Mathew",
    leadRole: "Licensed Electrical Supervisor",
    verified: true,
    rating: 4.95,
    reviewCount: 58,
    completedJobs: 89,
    experienceYears: 12,
    crewSizeMin: 2,
    crewSizeMax: 16,
    dailyRate: 1100,
    rateUnit: "per worker / day",
    availability: "immediate",
    availabilityLabel: "Available Today",
    location: "Trivandrum",
    state: "Kerala",
    skills: ["Conduit Piping", "DB Dressing", "HT/LT Cabling", "Earthing Grid", "Smart Automation"],
    certifications: ["Kerala Wireman / Supervisor License B", "Kallisto Verified MEP"],
    safetyCompliant: true,
    icon: EnergyDuotoneIcon,
    accentColor: "#0284c7",
    bgTint: "#f0f9ff",
    about: "Licensed electrical gang with Kerala Electrical Inspectorate Class-B supervisor certification. Experts in slab conduit rough-in, distribution board dressing, three-phase power routing, and smart home automation bus wiring.",
    coreCapabilities: [
      "Slab conduit laying & box casting inspection",
      "Complete DB dressing with RCCB/MCB discrimination",
      "Armoured cable pulling & HT/LT switchgear terminations",
      "Chemical earthing pits & lightning protection grid",
      "KNX / DALI automation and architectural lighting circuits",
    ],
    capabilityRatings: [
      { name: "Conduit & Piping", rating: 5 },
      { name: "DB Dressing", rating: 5 },
      { name: "Cable Routing", rating: 5 },
      { name: "Earthing Grid", rating: 4 },
      { name: "Automation Bus", rating: 4 },
    ],
    specializations: [
      "Commercial MEP",
      "Luxury Residential",
      "Hospital & Lab",
      "High-rise",
      "Industrial Wiring",
    ],
    crewComposition: {
      totalWorkforce: 6,
      typicalDeployment: "4–8 workers",
      maxDeployment: 16,
      crewLeadTitle: "Class-B Electrical Supervisor",
      roles: [
        { count: 1, role: "Supervisor" },
        { count: 3, role: "Licensed Electricians" },
        { count: 2, role: "Wiremen Helpers" },
      ],
    },
    recentDeployments: [
      {
        id: "dep-elec-01",
        projectName: "Technopark Phase 3 Fitout",
        location: "Trivandrum",
        scopeTags: ["DB Dressing", "Cable Trays"],
        workerCount: 8,
        durationDays: 35,
        year: 2026,
        status: "Completed",
        rating: 5.0,
      },
      {
        id: "dep-elec-02",
        projectName: "Palm Grove Luxury Bungalows",
        location: "Kovalam",
        scopeTags: ["Automation", "Conduit"],
        workerCount: 6,
        durationDays: 24,
        year: 2026,
        status: "Completed",
        rating: 4.9,
      },
    ],
    reviewsBreakdown: {
      overallScore: 4.95,
      metrics: [
        { label: "Reliability", score: 5.0 },
        { label: "Quality", score: 4.9 },
        { label: "Timeliness", score: 4.9 },
        { label: "Communication", score: 4.9 },
      ],
      testimonials: [
        {
          id: "rev-e-01",
          author: "Project Lead — Trivandrum IT Park",
          projectType: "Corporate Office",
          location: "Trivandrum",
          date: "Jul 2026",
          rating: 5.0,
          comment: "Shaji and team executed 4 floors of electrical fitout with meticulous DB tagging and zero insulation resistance faults.",
          verifiedClient: true,
        },
      ],
    },
    availabilitySchedule: {
      monthName: "August",
      year: 2026,
      days: [
        { day: 24, month: "Aug", year: 2026, weekday: "Mon", status: "available" },
        { day: 25, month: "Aug", year: 2026, weekday: "Tue", status: "available" },
        { day: 26, month: "Aug", year: 2026, weekday: "Wed", status: "available" },
        { day: 27, month: "Aug", year: 2026, weekday: "Thu", status: "partially_available" },
        { day: 28, month: "Aug", year: 2026, weekday: "Fri", status: "available" },
        { day: 29, month: "Aug", year: 2026, weekday: "Sat", status: "available" },
        { day: 30, month: "Aug", year: 2026, weekday: "Sun", status: "available" },
      ],
      nextAvailableDate: "Immediate (Today)",
      currentDeploymentText: "Standby in Trivandrum",
    },
    verification: {
      identityVerified: true,
      crewLeadVerified: true,
      experienceVerified: true,
      previousDeploymentsVerified: true,
      skillAssessmentCompleted: true,
      documentsVerified: true,
      lastVerificationDate: "15 Aug 2026",
    },
  },
  {
    id: "crew-plumbers-01",
    name: "Plumbing & Drainage Specialists",
    trade: "Plumbers",
    category: "Plumbing & Sanitary",
    leadName: "Sudheesh P.",
    leadRole: "Master Sanitary Technician",
    verified: true,
    rating: 4.85,
    reviewCount: 36,
    completedJobs: 52,
    experienceYears: 9,
    crewSizeMin: 2,
    crewSizeMax: 12,
    dailyRate: 1050,
    rateUnit: "per worker / day",
    availability: "immediate",
    availabilityLabel: "Immediate Deployment",
    location: "Ernakulam",
    state: "Kerala",
    skills: ["CPVC/UPVC Piping", "Pressure Testing", "Overhead Tank Piping", "Sanitary Ware Fitting", "Sewage Lines"],
    certifications: ["Kallisto Plumbing Guild Certificate"],
    safetyCompliant: true,
    icon: ResolveDuotoneIcon,
    accentColor: "#0891b2",
    bgTint: "#ecfeff",
  },
  {
    id: "crew-carpenters-01",
    name: "Formwork & Shuttering Carpenters",
    trade: "Carpenters",
    category: "Woodwork & Formwork",
    leadName: "Manoj V.",
    leadRole: "Senior Formwork Foreman",
    verified: true,
    rating: 4.9,
    reviewCount: 48,
    completedJobs: 71,
    experienceYears: 13,
    crewSizeMin: 4,
    crewSizeMax: 20,
    dailyRate: 1150,
    rateUnit: "per worker / day",
    availability: "this_week",
    availabilityLabel: "Available in 2 days",
    location: "Kochi, Ernakulam",
    state: "Kerala",
    skills: ["Mivan Formwork", "Plywood Shuttering", "Scaffolding Rigging", "Deck Leveling", "Column Boxes"],
    certifications: ["Structural Formwork Safety Certified"],
    safetyCompliant: true,
    icon: LayersDuotoneIcon,
    accentColor: "#d97706",
    bgTint: "#fffbeb",
  },
  {
    id: "crew-steel-01",
    name: "Rebar & Structural Steel Fixers",
    trade: "Steel Fixers",
    category: "Reinforcement & Steel",
    leadName: "Azeez Rahman",
    leadRole: "BBS & Rebar Foreman",
    verified: true,
    rating: 4.88,
    reviewCount: 39,
    completedJobs: 63,
    experienceYears: 10,
    crewSizeMin: 4,
    crewSizeMax: 24,
    dailyRate: 1000,
    rateUnit: "per worker / day",
    availability: "immediate",
    availabilityLabel: "Available Tomorrow",
    location: "Calicut",
    state: "Kerala",
    skills: ["Bar Bending Schedule (BBS)", "Footing Reinforcement", "Column Rings / Ties", "Slab Mesh Binding", "Coupler Fitting"],
    certifications: ["IS 2502 Rebar Standards Certified"],
    safetyCompliant: true,
    icon: SiteDuotoneIcon,
    accentColor: "#64748b",
    bgTint: "#f8fafc",
  },
  {
    id: "crew-painters-01",
    name: "Commercial Painting & Finishers",
    trade: "Painters",
    category: "Finishing & Coating",
    leadName: "Binoy George",
    leadRole: "Finishing Supervisor",
    verified: true,
    rating: 4.82,
    reviewCount: 31,
    completedJobs: 46,
    experienceYears: 8,
    crewSizeMin: 3,
    crewSizeMax: 16,
    dailyRate: 900,
    rateUnit: "per worker / day",
    availability: "immediate",
    availabilityLabel: "Instant Booking",
    location: "Kottayam",
    state: "Kerala",
    skills: ["Putty Application", "Airless Spray Painting", "Texture Wall Finishes", "Exterior Weatherproof", "PU Wood Polishing"],
    certifications: ["Asian Paints / Berger Certified Applicator"],
    safetyCompliant: true,
    icon: DrawingsDuotoneIcon,
    accentColor: "#e11d48",
    bgTint: "#fff1f2",
  },
  {
    id: "crew-supervisors-01",
    name: "Site QA & Daily Shift Supervisors",
    trade: "Supervisors",
    category: "Site Management & QA",
    leadName: "K. N. Sreekumar",
    leadRole: "Civil Site Engineer & Inspector",
    verified: true,
    rating: 4.96,
    reviewCount: 64,
    completedJobs: 112,
    experienceYears: 16,
    crewSizeMin: 1,
    crewSizeMax: 4,
    dailyRate: 1600,
    rateUnit: "per supervisor / day",
    availability: "immediate",
    availabilityLabel: "Available Tomorrow",
    location: "Kochi, Ernakulam",
    state: "Kerala",
    skills: ["Daily Shift DPR", "Material Inward QA", "Concrete Cube Testing", "Safety Compliance", "Labour Log Management"],
    certifications: ["B.Tech Civil", "Kallisto Verified Site Inspector", "NEBOSH IGC"],
    safetyCompliant: true,
    icon: UserDuotoneIcon,
    accentColor: "#9333ea",
    bgTint: "#faf5ff",
  },
  {
    id: "crew-surveyors-01",
    name: "Total Station Land Surveyors & QS",
    trade: "Surveyors",
    category: "Surveying & QS",
    leadName: "Vipin Das",
    leadRole: "Senior Geodetic Surveyor",
    verified: true,
    rating: 4.92,
    reviewCount: 29,
    completedJobs: 48,
    experienceYears: 11,
    crewSizeMin: 2,
    crewSizeMax: 6,
    dailyRate: 1800,
    rateUnit: "per surveyor / day",
    availability: "immediate",
    availabilityLabel: "Available Tomorrow",
    location: "Thrissur",
    state: "Kerala",
    skills: ["Total Station Survey", "AutoCAD Plotting", "Topographical Mapping", "Boundary Demarcation", "Earthwork Cut & Fill"],
    certifications: ["Diploma in Civil / Surveying", "Kallisto Certified Field Surveyor"],
    safetyCompliant: true,
    icon: ExploreDuotoneIcon,
    accentColor: "#ea580c",
    bgTint: "#fff7ed",
  },
  {
    id: "crew-tiles-01",
    name: "Precision Tile & Granite Craftsmen",
    trade: "Tile Layers",
    category: "Civil & Masonry",
    leadName: "Pradeep Menon",
    leadRole: "Master Tile Artisan",
    verified: true,
    rating: 4.9,
    reviewCount: 45,
    completedJobs: 73,
    experienceYears: 13,
    crewSizeMin: 3,
    crewSizeMax: 12,
    dailyRate: 1100,
    rateUnit: "per worker / day",
    availability: "this_week",
    availabilityLabel: "Available in 3 days",
    location: "Kochi, Ernakulam",
    state: "Kerala",
    skills: ["Vitrified Tile Laying", "Italian Marble Polishing", "Epoxy Grouting", "Granite Steps & Cladding", "Laser Level Alignment"],
    certifications: ["Kallisto Fine Finishing Guild"],
    safetyCompliant: true,
    icon: BuildingDuotoneIcon,
    accentColor: "#16a34a",
    bgTint: "#f0fdf4",
  },
  {
    id: "crew-welders-01",
    name: "Structural Welders & Fabricators",
    trade: "Welders",
    category: "Reinforcement & Steel",
    leadName: "Antony Varghese",
    leadRole: "Certified Structural Fabricator",
    verified: true,
    rating: 4.86,
    reviewCount: 28,
    completedJobs: 41,
    experienceYears: 11,
    crewSizeMin: 2,
    crewSizeMax: 8,
    dailyRate: 1250,
    rateUnit: "per worker / day",
    availability: "immediate",
    availabilityLabel: "Available Tomorrow",
    location: "Alappuzha",
    state: "Kerala",
    skills: ["MIG/TIG Welding", "Truss Fabrication", "MS Staircase & Railing", "Canopy Structure", "On-site Rigging"],
    certifications: ["ASME Section IX Welder Qualification"],
    safetyCompliant: true,
    icon: SiteDuotoneIcon,
    accentColor: "#64748b",
    bgTint: "#f8fafc",
  },
  {
    id: "crew-helpers-01",
    name: "Site Helpers & Labourers Pool",
    trade: "Helpers",
    category: "General Site Labour",
    leadName: "Gireesh Kumar",
    leadRole: "Labour Supervisor",
    verified: true,
    rating: 4.78,
    reviewCount: 54,
    completedJobs: 95,
    experienceYears: 7,
    crewSizeMin: 5,
    crewSizeMax: 30,
    dailyRate: 800,
    rateUnit: "per worker / day",
    availability: "immediate",
    availabilityLabel: "Instant Deployment",
    location: "Kochi, Ernakulam",
    state: "Kerala",
    skills: ["Concrete Mixing Support", "Material Handling", "Site Cleaning & Debris Removal", "Curing Water Spray", "Excavation Assistance"],
    certifications: ["Verified Identity & Background Checked"],
    safetyCompliant: true,
    icon: UserDuotoneIcon,
    accentColor: "#9333ea",
    bgTint: "#faf5ff",
  },
];

export function getTradeCrewById(id: string): TradeCrew | null {
  const crew = MOCK_TRADE_CREWS.find((c) => c.id === id);
  if (!crew) return null;

  // Hydrate defaults for any missing rich details
  const hydrated: TradeCrew = {
    ...crew,
    about:
      crew.about ||
      `Professional ${crew.trade.toLowerCase()} team operating across ${crew.location} with ${crew.experienceYears} years of verified construction experience and ${crew.completedJobs}+ completed deployments. Kallisto safety certified with verified site lead oversight.`,
    coreCapabilities: crew.coreCapabilities || [
      `${crew.trade} site package execution`,
      "Material handling and quality verification",
      "Daily shift reporting and supervisor oversight",
      "Safety and equipment standards compliance",
    ],
    capabilityRatings:
      crew.capabilityRatings ||
      crew.skills.slice(0, 5).map((skill, index) => ({
        name: skill,
        rating: 5 - (index % 2),
      })),
    specializations: crew.specializations || [
      "Residential",
      "Commercial",
      "Villa",
      "Structural",
      "Renovation",
    ],
    crewComposition: crew.crewComposition || {
      totalWorkforce: crew.crewSizeMin + 4,
      typicalDeployment: `${crew.crewSizeMin}–${crew.crewSizeMin + 6} workers`,
      maxDeployment: crew.crewSizeMax,
      crewLeadTitle: crew.leadRole || "Verified Site Supervisor",
      roles: [
        { count: 1, role: "Site Lead" },
        { count: Math.max(1, crew.crewSizeMin - 1), role: crew.trade },
        { count: 2, role: "Helpers" },
      ],
    },
    recentDeployments: crew.recentDeployments || [
      {
        id: `dep-${crew.id}-01`,
        projectName: `Premium Project — ${crew.location.split(",")[0]}`,
        location: crew.location,
        scopeTags: [crew.trade, "General Scope"],
        workerCount: crew.crewSizeMin + 2,
        durationDays: 30,
        year: 2026,
        status: "Completed",
        rating: Number(crew.rating.toFixed(1)),
      },
      {
        id: `dep-${crew.id}-02`,
        projectName: `Commercial Facility — Central Kerala`,
        location: "Kochi, Kerala",
        scopeTags: [crew.trade, "Phase 1"],
        workerCount: crew.crewSizeMin + 4,
        durationDays: 20,
        year: 2025,
        status: "Completed",
        rating: 4.8,
      },
    ],
    reviewsBreakdown: crew.reviewsBreakdown || {
      overallScore: Number(crew.rating.toFixed(1)),
      metrics: [
        { label: "Reliability", score: Number(crew.rating.toFixed(1)) },
        { label: "Quality", score: Number(crew.rating.toFixed(1)) },
        { label: "Timeliness", score: Math.max(4.5, Number((crew.rating - 0.2).toFixed(1))) },
        { label: "Communication", score: Number(crew.rating.toFixed(1)) },
      ],
      testimonials: [
        {
          id: `rev-${crew.id}-01`,
          author: "Verified Project Client",
          projectType: "Construction Project",
          location: crew.location.split(",")[0],
          date: "Jul 2026",
          rating: Number(crew.rating.toFixed(1)),
          comment: `Punctual and highly capable ${crew.trade.toLowerCase()} team. All daily targets and safety protocols were met meticulously.`,
          verifiedClient: true,
        },
      ],
    },
    availabilitySchedule: crew.availabilitySchedule || {
      monthName: "August",
      year: 2026,
      days: [
        { day: 24, month: "Aug", year: 2026, weekday: "Mon", status: "available" },
        { day: 25, month: "Aug", year: 2026, weekday: "Tue", status: "available" },
        { day: 26, month: "Aug", year: 2026, weekday: "Wed", status: "available" },
        { day: 27, month: "Aug", year: 2026, weekday: "Thu", status: "deployed" },
        { day: 28, month: "Aug", year: 2026, weekday: "Fri", status: "available" },
        { day: 29, month: "Aug", year: 2026, weekday: "Sat", status: "available" },
        { day: 30, month: "Aug", year: 2026, weekday: "Sun", status: "available" },
      ],
      nextAvailableDate: crew.availabilityLabel || "Available Tomorrow",
      currentDeploymentText: `${crew.location.split(",")[0]} • Active Standby`,
    },
    verification: crew.verification || {
      identityVerified: true,
      crewLeadVerified: true,
      experienceVerified: true,
      previousDeploymentsVerified: true,
      skillAssessmentCompleted: true,
      documentsVerified: true,
      lastVerificationDate: "18 Aug 2026",
    },
  };

  return hydrated;
}
