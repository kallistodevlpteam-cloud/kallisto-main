import type {
  HandsOverviewData,
  WorkforceRequest,
  WorkforceRequestDraft,
  WorkforceRequestSubmission,
} from "../types/hands.types";

const overviewData: HandsOverviewData = {
  metrics: [
    {
      id: "workers-today",
      label: "Workers on site today",
      value: 34,
      valueFormat: "number",
      supportingText: "Across 4 active sites",
      tone: "neutral",
      icon: "workers",
    },
    {
      id: "active-deployments",
      label: "Active deployments",
      value: 4,
      valueFormat: "number",
      supportingText: "1 ending this week",
      tone: "warning",
      icon: "deployments",
    },
    {
      id: "open-positions",
      label: "Open positions",
      value: 8,
      valueFormat: "number",
      supportingText: "Across 3 requests",
      tone: "neutral",
      icon: "positions",
    },
    {
      id: "weekly-cost",
      label: "Labour cost this week",
      value: 182400,
      valueFormat: "currency",
      supportingText: "12% above last week",
      tone: "warning",
      icon: "cost",
    },
  ],
  deployments: [
    {
      id: "deployment-nila",
      projectId: "proj-001",
      projectName: "Nila Residence",
      location: "Thiruvananthapuram",
      workforce: "8 masons · 10 helpers",
      shift: "8:00 AM – 5:00 PM",
      attendance: { state: "recorded", present: 16, total: 18 },
      supervisor: "Rajeev K.",
      dailyCost: 19800,
      status: "Needs attention",
      startDate: "22 Jul 2026",
      endDate: "08 Aug 2026",
    },
    {
      id: "deployment-arjun",
      projectId: "proj-002",
      projectName: "Arjun Villa",
      location: "Kochi",
      workforce: "6 painters",
      shift: "8:30 AM – 5:30 PM",
      attendance: { state: "recorded", present: 6, total: 6 },
      supervisor: "Manoj P.",
      dailyCost: 7200,
      status: "Active",
      startDate: "24 Jul 2026",
      endDate: "31 Jul 2026",
    },
    {
      id: "deployment-marina",
      projectId: "proj-003",
      projectName: "Marina Office",
      location: "Kozhikode",
      workforce: "4 electricians",
      shift: "9:00 AM – 6:00 PM",
      attendance: { state: "recorded", present: 4, total: 4 },
      supervisor: "Shafeeq M.",
      dailyCost: 6000,
      status: "Active",
      startDate: "21 Jul 2026",
      endDate: "28 Jul 2026",
    },
    {
      id: "deployment-green",
      projectId: "proj-004",
      projectName: "Green Courtyard",
      location: "Thrissur",
      workforce: "5 carpenters",
      shift: "8:00 AM – 5:00 PM",
      attendance: { state: "pending" },
      supervisor: "Arun S.",
      dailyCost: 7500,
      status: "Awaiting check-in",
      startDate: "27 Jul 2026",
      endDate: "04 Aug 2026",
    },
  ],
  requests: [
    {
      id: "request-carpenters",
      projectId: "proj-001",
      projectName: "Nila Residence",
      trade: "Carpenters",
      requiredDate: "Tomorrow",
      quantity: 5,
      fulfilled: 3,
      status: "Partially assigned",
    },
    {
      id: "request-electricians",
      projectId: "proj-004",
      projectName: "Green Courtyard",
      trade: "Electricians",
      requiredDate: "30 Jul",
      quantity: 3,
      fulfilled: 0,
      status: "Matching workers",
    },
    {
      id: "request-helpers",
      projectId: "proj-003",
      projectName: "Marina Office",
      trade: "Helpers",
      requiredDate: "02 Aug",
      quantity: 8,
      fulfilled: 6,
      status: "Partially assigned",
    },
  ],
  attentionItems: [
    {
      id: "attention-nila-absence",
      title: "Two workers are absent at Nila Residence",
      detail: "Today · 16 of 18 workers checked in",
      actionLabel: "Review attendance",
      actionTab: "attendance",
      severity: "critical",
    },
    {
      id: "attention-carpenter-shortfall",
      title: "Carpenter request is short by two workers",
      detail: "Nila Residence · Required tomorrow",
      actionLabel: "Update request",
      actionTab: "requests",
      severity: "warning",
    },
    {
      id: "attention-green-approval",
      title: "Attendance approval is pending for Green Courtyard",
      detail: "Today · Supervisor check-in not confirmed",
      actionLabel: "Approve attendance",
      actionTab: "attendance",
      severity: "warning",
    },
    {
      id: "attention-marina-ending",
      title: "Marina Office deployment ends tomorrow",
      detail: "4 electricians · Review extension or completion",
      actionLabel: "Review deployment",
      actionTab: "deployments",
      severity: "info",
    },
  ],
  demand: [
    {
      id: "demand-today",
      dateLabel: "Today",
      projectName: "Nila Residence",
      trade: "Masons",
      quantity: 8,
      state: "Confirmed",
    },
    {
      id: "demand-tomorrow",
      dateLabel: "Tomorrow",
      projectName: "Nila Residence",
      trade: "Carpenters",
      quantity: 5,
      state: "Request pending",
    },
    {
      id: "demand-30-jul",
      dateLabel: "30 Jul",
      projectName: "Green Courtyard",
      trade: "Electricians",
      quantity: 3,
      state: "Request pending",
    },
    {
      id: "demand-31-jul",
      dateLabel: "31 Jul",
      projectName: "Arjun Villa",
      trade: "Painters",
      quantity: 6,
      state: "Confirmed",
    },
    {
      id: "demand-01-aug",
      dateLabel: "01 Aug",
      projectName: "Green Courtyard",
      trade: "Carpenters",
      quantity: 5,
      state: "Confirmed",
    },
    {
      id: "demand-02-aug",
      dateLabel: "02 Aug",
      projectName: "Marina Office",
      trade: "Helpers",
      quantity: 8,
      state: "Request pending",
    },
    {
      id: "demand-03-aug",
      dateLabel: "03 Aug",
      projectName: "Nila Residence",
      trade: "Tile workers",
      quantity: 4,
      state: "Not requested",
    },
  ],
};

function wait(duration: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, duration));
}

export async function loadHandsOverview(): Promise<HandsOverviewData> {
  await wait(320);
  return overviewData;
}

export async function saveWorkforceRequestDraft(
  draft: WorkforceRequestDraft,
): Promise<{ draftId: string }> {
  await wait(450);

  if (draft.notes.trim().toLowerCase() === "simulate error") {
    throw new Error("The draft could not be saved. Try again.");
  }

  return { draftId: `hands-draft-${Date.now()}` };
}

export async function submitWorkforceRequest(
  submission: WorkforceRequestSubmission,
): Promise<WorkforceRequest> {
  await wait(700);

  if (submission.notes.trim().toLowerCase() === "simulate error") {
    throw new Error("The request could not be submitted. Try again.");
  }

  return {
    id: `hands-request-${Date.now()}`,
    projectId: submission.projectId,
    projectName: "Selected project",
    trade: submission.trade,
    requiredDate: submission.startDate,
    quantity: submission.workerCount,
    fulfilled: 0,
    status: "Open",
  };
}
