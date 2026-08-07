export interface PhaseColorTheme {
  primary: string;
  lightBg: string;
  text: string;
  progressFill: string;
}

const SPECIFIC_PHASE_COLORS: Record<string, PhaseColorTheme> = {
  "phase-1": { primary: "#2563eb", lightBg: "#dbeafe", text: "#1d4ed8", progressFill: "#93c5fd" }, // Blue - Pre-design
  "phase-2": { primary: "#8b5cf6", lightBg: "#ede9fe", text: "#6d28d9", progressFill: "#c4b5fd" }, // Purple - Approvals / Design
  "phase-3": { primary: "#7c3aed", lightBg: "#ede9fe", text: "#5b21b6", progressFill: "#ddd6fe" }, // Violet - Documentation & BOQ
  "phase-4": { primary: "#ea580c", lightBg: "#fef3c7", text: "#c2410c", progressFill: "#fde68a" }, // Orange - Procurement
  "phase-5": { primary: "#059669", lightBg: "#d1fae5", text: "#047857", progressFill: "#a7f3d0" }, // Green - Structure / Construction
  "phase-6": { primary: "#10b981", lightBg: "#d1fae5", text: "#047857", progressFill: "#a7f3d0" }, // Emerald - Site Execution
  "phase-7": { primary: "#0284c7", lightBg: "#e0f2fe", text: "#0369a1", progressFill: "#bae6fd" }, // Sky - MEP
  "phase-8": { primary: "#d97706", lightBg: "#fef3c7", text: "#b45309", progressFill: "#fde68a" }, // Amber - Handover
};

const WORKSTREAM_COLORS: Record<string, PhaseColorTheme> = {
  "Structure": { primary: "#059669", lightBg: "#d1fae5", text: "#047857", progressFill: "#a7f3d0" },
  "MEP": { primary: "#0284c7", lightBg: "#e0f2fe", text: "#0369a1", progressFill: "#bae6fd" },
  "Architecture": { primary: "#8b5cf6", lightBg: "#ede9fe", text: "#6d28d9", progressFill: "#c4b5fd" },
  "Procurement": { primary: "#ea580c", lightBg: "#fef3c7", text: "#c2410c", progressFill: "#fde68a" },
  "Site execution": { primary: "#059669", lightBg: "#d1fae5", text: "#047857", progressFill: "#a7f3d0" },
  "Client approvals": { primary: "#2563eb", lightBg: "#dbeafe", text: "#1d4ed8", progressFill: "#93c5fd" },
};

const PALETTE: PhaseColorTheme[] = [
  { primary: "#2563eb", lightBg: "#eff6ff", text: "#1e40af", progressFill: "#bfdbfe" },
  { primary: "#8b5cf6", lightBg: "#f5f3ff", text: "#6d28d9", progressFill: "#c4b5fd" },
  { primary: "#7c3aed", lightBg: "#f3e8ff", text: "#5b21b6", progressFill: "#ddd6fe" },
  { primary: "#ea580c", lightBg: "#fff7ed", text: "#c2410c", progressFill: "#ffedd5" },
  { primary: "#10b981", lightBg: "#ecfdf5", text: "#047857", progressFill: "#a7f3d0" },
  { primary: "#0284c7", lightBg: "#f0f9ff", text: "#0369a1", progressFill: "#bae6fd" },
  { primary: "#d97706", lightBg: "#fffbeb", text: "#b45309", progressFill: "#fef3c7" },
];

export function getPhaseColorTheme(phaseId: string, orderIndex: number = 0): PhaseColorTheme {
  if (SPECIFIC_PHASE_COLORS[phaseId]) {
    return SPECIFIC_PHASE_COLORS[phaseId];
  }
  return PALETTE[orderIndex % PALETTE.length];
}

export function getWorkstreamColorTheme(workstream: string, orderIndex: number = 0): PhaseColorTheme {
  if (WORKSTREAM_COLORS[workstream]) {
    return WORKSTREAM_COLORS[workstream];
  }
  return PALETTE[orderIndex % PALETTE.length];
}
