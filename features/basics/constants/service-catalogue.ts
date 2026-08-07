import type { BasicsServiceCategory } from "../types/basics.types";

export type BasicsServiceCatalogueGroup = {
  id: BasicsServiceCategory;
  label: string;
  services: readonly string[];
};

export const BASICS_SERVICE_CATALOGUE: readonly BasicsServiceCatalogueGroup[] = [
  {
    id: "design_architecture",
    label: "Design and Architecture",
    services: [
      "Architecture",
      "Interior Design",
      "Landscape Design",
      "Urban Design",
      "Space Planning",
      "Lighting Design",
    ],
  },
  {
    id: "engineering",
    label: "Engineering",
    services: [
      "Structural Engineering",
      "Civil Engineering",
      "MEP Engineering",
      "HVAC Design",
      "Electrical Design",
      "Plumbing and Drainage",
      "Fire and Life Safety",
      "Geotechnical Engineering",
    ],
  },
  {
    id: "specialist_consulting",
    label: "Specialist Consulting",
    services: [
      "Facade Engineering",
      "Acoustics",
      "Sustainability Consulting",
      "Energy Modelling",
      "Waterproofing Consulting",
      "Building Automation",
      "Vertical Transportation",
    ],
  },
  {
    id: "digital_production",
    label: "Digital Production",
    services: [
      "BIM Modelling",
      "BIM Coordination",
      "CAD Drafting",
      "Quantity Take-Off",
      "BOQ Preparation",
      "Visualization",
      "Working Drawings",
      "Shop Drawings",
      "Specifications",
    ],
  },
  {
    id: "commercial_compliance",
    label: "Commercial and Compliance",
    services: [
      "Quantity Surveying",
      "Cost Consulting",
      "Contract Administration",
      "Project Management",
      "Permit Consulting",
      "Legal Documentation",
      "Property Valuation",
      "Land Surveying",
    ],
  },
] as const;

export const BASICS_SOFTWARE_SKILLS = [
  "AutoCAD",
  "Revit",
  "STAAD.Pro",
  "ETABS",
  "Tekla",
  "Navisworks",
  "SketchUp",
  "3ds Max",
  "Lumion",
  "Primavera",
  "MS Project",
] as const;

export const BASICS_CODE_KNOWLEDGE = [
  "NBC",
  "Kerala Municipality Building Rules",
  "Kerala Panchayat Building Rules",
  "IS 456",
  "IS 875",
  "IS 1893",
  "NFPA",
  "ASHRAE",
] as const;

export const BASICS_PROJECT_TYPES = [
  "Residential Villa",
  "Apartment",
  "Commercial",
  "Healthcare",
  "Hospitality",
  "Retail",
  "Institutional",
  "Industrial",
] as const;

export function getCategoryLabel(category: BasicsServiceCategory): string {
  return (
    BASICS_SERVICE_CATALOGUE.find((group) => group.id === category)?.label ??
    "Professional Services"
  );
}

export function getAllBasicsServices(): string[] {
  return BASICS_SERVICE_CATALOGUE.flatMap((group) => [...group.services]);
}

export function getCategoryForService(
  service: string,
): BasicsServiceCategory | undefined {
  return BASICS_SERVICE_CATALOGUE.find((group) =>
    group.services.includes(service),
  )?.id;
}

