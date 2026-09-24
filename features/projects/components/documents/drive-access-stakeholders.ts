import { ProjectDocumentOwner } from "@/types/domain/project-document";

export interface ProjectStakeholder {
  id: string;
  name: string;
  role: string;
  organization: string;
  category: "hands" | "basics" | "team";
  avatarUrl?: string;
  trade: string;
}

export const PROJECT_STAKEHOLDERS: ProjectStakeholder[] = [
  // Hands (Contractor & Site Teams / Workers in Hands)
  {
    id: "hands-ramesh-kumar",
    name: "Ramesh Kumar",
    role: "Civil & Structural Contractor Lead",
    organization: "Kochi Civil & Masonry Works",
    category: "hands",
    trade: "Civil & Masonry",
  },
  {
    id: "hands-biju-varghese",
    name: "Biju Varghese",
    role: "MEP & Joinery Contractor Lead",
    organization: "Apex MEP & Finishing Solutions",
    category: "hands",
    trade: "MEP & Finishing",
  },
  {
    id: "hands-suresh-nair",
    name: "Suresh Nair",
    role: "Site Operations & Execution Foreman",
    organization: "Kerala BuildTech Hands",
    category: "hands",
    trade: "Site Operations",
  },
  // Team (Project Team Members)
  {
    id: "team-arjun-mehta",
    name: "Arjun Mehta",
    role: "Project Lead & Manager",
    organization: "Kallisto Project Team",
    category: "team",
    trade: "Project Management",
  },
  {
    id: "team-neha-rao",
    name: "Neha Rao",
    role: "Site Architect & Design Coordinator",
    organization: "Kallisto Project Team",
    category: "team",
    trade: "Architecture & Coordination",
  },
  {
    id: "team-priya-nair",
    name: "Priya Nair",
    role: "Structural & Quality Engineer",
    organization: "Kallisto Technical Team",
    category: "team",
    trade: "Quality & Structural",
  },
  // Basics (Other Teams & Specialists)
  {
    id: "basics-axis-structures",
    name: "Axis Structures",
    role: "Structural Engineering Specialist",
    organization: "Axis Structures Consulting",
    category: "basics",
    trade: "Structural Design",
  },
  {
    id: "basics-studio-elemental",
    name: "Studio Elemental",
    role: "Architectural Design Specialist",
    organization: "Studio Elemental Architecture",
    category: "basics",
    trade: "Architecture",
  },
  {
    id: "basics-volt-wire",
    name: "Volt & Wire Consultants",
    role: "MEP Engineering Consultant",
    organization: "Volt & Wire Engineering",
    category: "basics",
    trade: "MEP & Services",
  },
];

export function stakeholderToDocumentOwner(stakeholder: ProjectStakeholder): ProjectDocumentOwner {
  return {
    id: stakeholder.id,
    name: stakeholder.name,
    role: stakeholder.role,
    organization: stakeholder.organization,
    type: stakeholder.category,
    avatarUrl: stakeholder.avatarUrl,
  };
}
