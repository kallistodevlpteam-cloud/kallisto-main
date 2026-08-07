import {
  ProjectTask,
  ProjectTaskDomainError,
  ProjectTaskPriority,
  ProjectTaskStatus,
  ProjectTaskVisibility,
  TaskChecklistItem,
  WorkPackage,
  validateTaskDependencies,
} from "@/types/domain/project-task";
import {
  AddTaskChecklistItemInput,
  AddTaskDependencyInput,
  AttachTaskFileInput,
  ChangeProjectTaskStatusInput,
  ChangeProjectTaskVisibilityCommand,
  CreateProjectTaskCommand,
  DeleteProjectTaskCommand,
  DeleteTaskChecklistItemInput,
  ListProjectTasksInput,
  ProjectTaskCursor,
  ProjectTaskMutationResult,
  ProjectTaskPage,
  ProjectTaskRepository,
  RemoveTaskAttachmentInput,
  RemoveTaskDependencyInput,
  UpdateProjectTaskCommand,
  UpdateTaskChecklistItemInput,
} from "./project-task.repository";

// Work Packages Data
export const MOCK_WORK_PACKAGES: WorkPackage[] = [
  {
    id: "wp-1",
    workspaceId: "ws-default",
    projectId: "proj-1",
    name: "Structural Works",
    order: 1,
    phaseId: "phase-2",
    milestoneId: "ms-1",
    isArchived: false,
    createdAt: "2026-07-01T00:00:00Z",
    updatedAt: "2026-07-01T00:00:00Z",
  },
  {
    id: "wp-2",
    workspaceId: "ws-default",
    projectId: "proj-1",
    name: "Architectural Drawings",
    order: 2,
    phaseId: "phase-2",
    milestoneId: "ms-2",
    isArchived: false,
    createdAt: "2026-07-01T00:00:00Z",
    updatedAt: "2026-07-01T00:00:00Z",
  },
  {
    id: "wp-3",
    workspaceId: "ws-default",
    projectId: "proj-1",
    name: "MEP Coordination",
    order: 3,
    phaseId: "phase-2",
    milestoneId: "ms-3",
    isArchived: false,
    createdAt: "2026-07-01T00:00:00Z",
    updatedAt: "2026-07-01T00:00:00Z",
  },
  {
    id: "wp-4",
    workspaceId: "ws-default",
    projectId: "proj-1",
    name: "Procurement",
    order: 4,
    phaseId: "phase-1",
    milestoneId: "ms-4",
    isArchived: false,
    createdAt: "2026-07-01T00:00:00Z",
    updatedAt: "2026-07-01T00:00:00Z",
  },
  {
    id: "wp-5",
    workspaceId: "ws-default",
    projectId: "proj-1",
    name: "Site Execution",
    order: 5,
    phaseId: "phase-2",
    milestoneId: "ms-5",
    isArchived: false,
    createdAt: "2026-07-01T00:00:00Z",
    updatedAt: "2026-07-01T00:00:00Z",
  },
  {
    id: "wp-6",
    workspaceId: "ws-default",
    projectId: "proj-1",
    name: "Client Approvals",
    order: 6,
    phaseId: "phase-1",
    milestoneId: "ms-6",
    isArchived: false,
    createdAt: "2026-07-01T00:00:00Z",
    updatedAt: "2026-07-01T00:00:00Z",
  },
];

// Initial 24 Realistic Tasks for Nila Residence (proj-1)
export const INITIAL_TASKS: ProjectTask[] = [
  // 1. Structural Works (5 tasks)
  {
    id: "task-102",
    workspaceId: "ws-default",
    projectId: "proj-1",
    version: 1,
    title: "Upload concrete cube test results",
    description: "Submit 7-day and 28-day compressive strength test reports from NABL accredited testing laboratory.",
    workPackageId: "wp-1",
    phaseId: "Phase 2: Superstructure",
    milestoneId: "Quality Assurance",
    siteZoneId: "Zone B",
    status: "blocked",
    priority: "critical",
    assigneeIds: ["user-rahul"],
    reporterId: "user-arjun",
    startDate: "2026-07-18",
    dueDate: "2026-07-22",
    blockerReason: "Waiting for lab report verification certificate from third-party auditor",
    progress: 30,
    visibility: "project_team",
    checklistItemIds: [],
    dependencyIds: [],
    attachmentIds: [],
    commentCount: 2,
    createdAt: "2026-07-16T11:00:00Z",
    updatedAt: "2026-07-22T08:00:00Z",
  },
  {
    id: "task-104",
    workspaceId: "ws-default",
    projectId: "proj-1",
    version: 1,
    title: "Prepare rebar fixings reinforcement checklist",
    description: "Compile QA/QC sign-off document for steel rebar binding and chair placement.",
    workPackageId: "wp-1",
    phaseId: "Phase 2: Superstructure",
    milestoneId: "Quality Assurance",
    status: "completed",
    priority: "normal",
    assigneeIds: ["user-rahul"],
    reporterId: "user-arjun",
    startDate: "2026-07-20",
    dueDate: "2026-07-22",
    completedAt: "2026-07-22T17:00:00Z",
    progress: 100,
    visibility: "project_team",
    checklistItemIds: [],
    dependencyIds: [],
    attachmentIds: [],
    commentCount: 0,
    createdAt: "2026-07-19T10:00:00Z",
    updatedAt: "2026-07-22T17:00:00Z",
  },
  {
    id: "task-103",
    workspaceId: "ws-default",
    projectId: "proj-1",
    version: 1,
    title: "Review reinforcement before slab casting",
    description: "Conduct structural engineer inspection of rebar spacing, cover blocks, and lap lengths.",
    workPackageId: "wp-1",
    phaseId: "Phase 2: Superstructure",
    milestoneId: "First Floor Slab",
    siteZoneId: "Zone A",
    status: "waiting",
    priority: "high",
    startDate: "2026-07-24",
    dueDate: "2026-07-25",
    progress: 40,
    visibility: "project_team",
    assigneeIds: ["user-arjun"],
    reporterId: "user-arjun",
    checklistItemIds: [],
    dependencyIds: ["task-101"],
    attachmentIds: [],
    commentCount: 1,
    createdAt: "2026-07-18T14:00:00Z",
    updatedAt: "2026-07-23T16:00:00Z",
  },
  {
    id: "task-101",
    workspaceId: "ws-default",
    projectId: "proj-1",
    version: 1,
    title: "Confirm first floor slab casting schedule",
    description: "Coordinate ready-mix concrete batching plant and site pumping logistics for first-floor slab.",
    workPackageId: "wp-1",
    phaseId: "Phase 2: Superstructure",
    milestoneId: "First Floor Slab",
    siteZoneId: "Zone A",
    status: "in_progress",
    priority: "high",
    assigneeIds: ["user-arjun", "user-rahul"],
    reporterId: "user-arjun",
    startDate: "2026-07-24",
    dueDate: "2026-07-28",
    progress: 60,
    visibility: "project_team",
    checklistItemIds: ["chk-101-1", "chk-101-2"],
    dependencyIds: [],
    attachmentIds: ["att-101-1"],
    commentCount: 1,
    createdAt: "2026-07-15T09:00:00Z",
    updatedAt: "2026-07-24T10:00:00Z",
  },
  {
    id: "task-105",
    workspaceId: "ws-default",
    projectId: "proj-1",
    version: 1,
    title: "Resolve staircase-opening structural revision",
    description: "Issue structural detail clarification drawing for modified staircase trimmer beam.",
    workPackageId: "wp-1",
    phaseId: "Phase 2: Superstructure",
    milestoneId: "Structural Revisions",
    status: "in_progress",
    priority: "normal",
    assigneeIds: ["user-priya"],
    reporterId: "user-arjun",
    startDate: "2026-07-25",
    dueDate: "2026-08-02",
    progress: 50,
    visibility: "project_team",
    checklistItemIds: [],
    dependencyIds: [],
    attachmentIds: [],
    commentCount: 3,
    createdAt: "2026-07-20T08:00:00Z",
    updatedAt: "2026-07-24T09:30:00Z",
  },

  // 2. Architectural Drawings (4 tasks)
  {
    id: "task-201",
    workspaceId: "ws-default",
    projectId: "proj-1",
    version: 1,
    title: "Publish ground-floor layout Rev-03",
    description: "Release coordinated GFC floor plan reflecting client-approved foyer layout revisions.",
    workPackageId: "wp-2",
    phaseId: "Phase 1: Design & Approval",
    milestoneId: "GFC Release",
    status: "completed",
    priority: "normal",
    assigneeIds: ["user-priya"],
    reporterId: "user-arjun",
    startDate: "2026-07-12",
    dueDate: "2026-07-18",
    completedAt: "2026-07-18T16:00:00Z",
    progress: 100,
    visibility: "client_visible",
    checklistItemIds: [],
    dependencyIds: [],
    attachmentIds: ["att-201-1"],
    commentCount: 5,
    createdAt: "2026-07-10T11:00:00Z",
    updatedAt: "2026-07-18T16:00:00Z",
  },
  {
    id: "task-203",
    workspaceId: "ws-default",
    projectId: "proj-1",
    version: 1,
    title: "Approve joinery specification revision",
    description: "Sign off veneer finish code and soft-close hardware specifications for master suite.",
    workPackageId: "wp-2",
    phaseId: "Phase 1: Design & Approval",
    milestoneId: "Interior Detailing",
    status: "waiting",
    priority: "high",
    blockerReason: "Awaiting client physical wood sample approval",
    startDate: "2026-07-22",
    dueDate: "2026-07-28",
    progress: 20,
    visibility: "client_visible",
    assigneeIds: ["user-priya", "user-arjun"],
    reporterId: "user-arjun",
    checklistItemIds: [],
    dependencyIds: [],
    attachmentIds: [],
    commentCount: 0,
    createdAt: "2026-07-19T15:00:00Z",
    updatedAt: "2026-07-23T11:00:00Z",
  },
  {
    id: "task-202",
    workspaceId: "ws-default",
    projectId: "proj-1",
    version: 1,
    title: "Review kitchen-island dimensional update",
    description: "Verify clearance between island counter and perimeter cabinetry against appliance cutouts.",
    workPackageId: "wp-2",
    phaseId: "Phase 1: Design & Approval",
    milestoneId: "Interior Detailing",
    status: "todo",
    priority: "low",
    assigneeIds: ["user-priya"],
    reporterId: "user-priya",
    startDate: "2026-07-26",
    dueDate: "2026-07-30",
    progress: 0,
    visibility: "project_team",
    checklistItemIds: [],
    dependencyIds: [],
    attachmentIds: [],
    commentCount: 1,
    createdAt: "2026-07-21T09:00:00Z",
    updatedAt: "2026-07-21T09:00:00Z",
  },
  {
    id: "task-204",
    workspaceId: "ws-default",
    projectId: "proj-1",
    version: 1,
    title: "Coordinate door and window schedule",
    description: "Finalize hardware specifications and frame opening sizes with aluminum fabrication contractor.",
    workPackageId: "wp-2",
    phaseId: "Phase 1: Design & Approval",
    milestoneId: "GFC Release",
    status: "in_progress",
    priority: "normal",
    assigneeIds: ["user-rahul"],
    reporterId: "user-arjun",
    startDate: "2026-07-26",
    dueDate: "2026-08-05",
    progress: 45,
    visibility: "project_team",
    checklistItemIds: [],
    dependencyIds: [],
    attachmentIds: [],
    commentCount: 2,
    createdAt: "2026-07-20T14:00:00Z",
    updatedAt: "2026-07-24T11:00:00Z",
  },

  // 3. MEP Coordination (4 tasks)
  {
    id: "task-301",
    workspaceId: "ws-default",
    projectId: "proj-1",
    version: 1,
    title: "Review electrical conduit layout",
    description: "Overlay electrical trunking pathways with ceiling drop beams on First Floor.",
    workPackageId: "wp-3",
    phaseId: "Phase 2: Superstructure",
    milestoneId: "MEP Rough-in",
    siteZoneId: "Zone A",
    status: "in_progress",
    priority: "high",
    assigneeIds: ["user-rahul"],
    reporterId: "user-arjun",
    startDate: "2026-07-22",
    dueDate: "2026-07-24",
    progress: 75,
    visibility: "project_team",
    checklistItemIds: [],
    dependencyIds: [],
    attachmentIds: [],
    commentCount: 3,
    createdAt: "2026-07-20T14:00:00Z",
    updatedAt: "2026-07-24T11:00:00Z",
  },
  {
    id: "task-302",
    workspaceId: "ws-default",
    projectId: "proj-1",
    version: 1,
    title: "Complete plumbing pressure test",
    description: "Hydrostatic testing of concealed CPVC water supply mains at 10 bar for 24 hours.",
    workPackageId: "wp-3",
    phaseId: "Phase 2: Superstructure",
    milestoneId: "MEP Testing",
    siteZoneId: "Zone B",
    status: "blocked",
    priority: "critical",
    blockerReason: "Pressure drop detected in Zone B riser elbow; requiring joint repair",
    startDate: "2026-07-17",
    dueDate: "2026-07-21",
    progress: 20,
    visibility: "project_team",
    assigneeIds: ["user-rahul"],
    reporterId: "user-arjun",
    checklistItemIds: [],
    dependencyIds: [],
    attachmentIds: [],
    commentCount: 7,
    createdAt: "2026-07-15T09:30:00Z",
    updatedAt: "2026-07-21T18:00:00Z",
  },
  {
    id: "task-303",
    workspaceId: "ws-default",
    projectId: "proj-1",
    version: 1,
    title: "Confirm service-shaft routing",
    description: "Verify vertical acoustic insulation and fire-stop collar detailing for drainage stacks.",
    workPackageId: "wp-3",
    phaseId: "Phase 2: Superstructure",
    milestoneId: "MEP Rough-in",
    status: "todo",
    priority: "normal",
    assigneeIds: ["user-rahul"],
    reporterId: "user-arjun",
    startDate: "2026-07-28",
    dueDate: "2026-08-01",
    progress: 0,
    visibility: "project_team",
    checklistItemIds: [],
    dependencyIds: [],
    attachmentIds: [],
    commentCount: 0,
    createdAt: "2026-07-22T13:00:00Z",
    updatedAt: "2026-07-22T13:00:00Z",
  },
  {
    id: "task-304",
    workspaceId: "ws-default",
    projectId: "proj-1",
    version: 1,
    title: "Coordinate electrical and plumbing sleeves",
    description: "Mark sleeve cutouts in beam shutters prior to slab concrete pour.",
    workPackageId: "wp-3",
    phaseId: "Phase 2: Superstructure",
    milestoneId: "MEP Rough-in",
    status: "completed",
    priority: "normal",
    assigneeIds: ["user-rahul"],
    reporterId: "user-arjun",
    startDate: "2026-07-15",
    dueDate: "2026-07-19",
    completedAt: "2026-07-19T15:00:00Z",
    progress: 100,
    visibility: "project_team",
    checklistItemIds: [],
    dependencyIds: [],
    attachmentIds: [],
    commentCount: 1,
    createdAt: "2026-07-14T08:00:00Z",
    updatedAt: "2026-07-19T15:00:00Z",
  },

  // 4. Procurement (4 tasks)
  {
    id: "task-401",
    workspaceId: "ws-default",
    projectId: "proj-1",
    version: 1,
    title: "Verify reinforcement-steel quantity",
    description: "Reconcile mill test certificates and weight slips for 16mm and 20mm Fe550D TMT bars.",
    workPackageId: "wp-4",
    phaseId: "Phase 1: Materials & Procurement",
    milestoneId: "Steel Procurement",
    status: "completed",
    priority: "high",
    assigneeIds: ["user-arjun"],
    reporterId: "user-arjun",
    startDate: "2026-07-18",
    dueDate: "2026-07-21",
    completedAt: "2026-07-21T11:00:00Z",
    progress: 100,
    visibility: "project_team",
    checklistItemIds: [],
    dependencyIds: [],
    attachmentIds: [],
    commentCount: 2,
    createdAt: "2026-07-17T10:00:00Z",
    updatedAt: "2026-07-21T11:00:00Z",
  },
  {
    id: "task-402",
    workspaceId: "ws-default",
    projectId: "proj-1",
    version: 1,
    title: "Finalise joinery material specification",
    description: "Lock commercial terms for marine grade IS 710 plywood and teak veneer sheets.",
    workPackageId: "wp-4",
    phaseId: "Phase 1: Materials & Procurement",
    milestoneId: "Joinery Procurement",
    status: "waiting",
    priority: "normal",
    startDate: "2026-07-23",
    dueDate: "2026-07-29",
    progress: 35,
    visibility: "project_team",
    assigneeIds: ["user-priya"],
    reporterId: "user-arjun",
    checklistItemIds: [],
    dependencyIds: [],
    attachmentIds: [],
    commentCount: 1,
    createdAt: "2026-07-21T16:00:00Z",
    updatedAt: "2026-07-23T14:00:00Z",
  },
  {
    id: "task-403",
    workspaceId: "ws-default",
    projectId: "proj-1",
    version: 1,
    title: "Confirm slab concrete booking",
    description: "Issue purchase order for 45 cubic meters M30 grade RMC with boom pump placement.",
    workPackageId: "wp-4",
    phaseId: "Phase 1: Materials & Procurement",
    milestoneId: "Concrete Procurement",
    status: "todo",
    priority: "high",
    assigneeIds: ["user-arjun"],
    reporterId: "user-arjun",
    startDate: "2026-07-24",
    dueDate: "2026-07-25",
    progress: 10,
    visibility: "project_team",
    checklistItemIds: [],
    dependencyIds: [],
    attachmentIds: [],
    commentCount: 0,
    createdAt: "2026-07-23T09:00:00Z",
    updatedAt: "2026-07-23T09:00:00Z",
  },
  {
    id: "task-404",
    workspaceId: "ws-default",
    projectId: "proj-1",
    version: 1,
    title: "Review supplier quotations",
    description: "Compare comparative statement for imported Italian marble slabs and laying labor.",
    workPackageId: "wp-4",
    phaseId: "Phase 1: Materials & Procurement",
    milestoneId: "Finishes Procurement",
    status: "in_progress",
    priority: "low",
    assigneeIds: ["user-priya"],
    reporterId: "user-arjun",
    startDate: "2026-07-20",
    dueDate: "2026-08-02",
    progress: 50,
    visibility: "project_team",
    checklistItemIds: [],
    dependencyIds: [],
    attachmentIds: [],
    commentCount: 3,
    createdAt: "2026-07-19T11:00:00Z",
    updatedAt: "2026-07-24T07:00:00Z",
  },

  // 5. Site Execution (4 tasks)
  {
    id: "task-501",
    workspaceId: "ws-default",
    projectId: "proj-1",
    version: 1,
    title: "Complete foundation-pit clearance",
    description: "Backfill and compact perimeter soil surrounding earth retention wall.",
    workPackageId: "wp-5",
    phaseId: "Phase 2: Superstructure",
    milestoneId: "Site Prep",
    status: "completed",
    priority: "normal",
    assigneeIds: ["user-rahul"],
    reporterId: "user-arjun",
    startDate: "2026-07-05",
    dueDate: "2026-07-10",
    completedAt: "2026-07-10T14:00:00Z",
    progress: 100,
    visibility: "project_team",
    checklistItemIds: [],
    dependencyIds: [],
    attachmentIds: [],
    commentCount: 1,
    createdAt: "2026-07-04T08:00:00Z",
    updatedAt: "2026-07-10T14:00:00Z",
  },
  {
    id: "task-502",
    workspaceId: "ws-default",
    projectId: "proj-1",
    version: 1,
    title: "Conduct weekly safety inspection",
    description: "Inspect scaffolding ties, edge protection, and PPE compliance across active work zones.",
    workPackageId: "wp-5",
    phaseId: "Phase 2: Superstructure",
    milestoneId: "Safety & Compliance",
    status: "todo",
    priority: "high",
    assigneeIds: ["user-rahul"],
    reporterId: "user-arjun",
    startDate: "2026-07-24",
    dueDate: "2026-07-24",
    progress: 0,
    visibility: "project_team",
    checklistItemIds: [],
    dependencyIds: [],
    attachmentIds: [],
    commentCount: 0,
    createdAt: "2026-07-23T15:00:00Z",
    updatedAt: "2026-07-23T15:00:00Z",
  },
  {
    id: "task-503",
    workspaceId: "ws-default",
    projectId: "proj-1",
    version: 1,
    title: "Submit site progress photographs",
    description: "Capture high-resolution photo documentation of shuttering progress for client portal.",
    workPackageId: "wp-5",
    phaseId: "Phase 2: Superstructure",
    milestoneId: "Site Progress Reporting",
    status: "in_progress",
    priority: "low",
    assigneeIds: ["user-rahul"],
    reporterId: "user-arjun",
    startDate: "2026-07-22",
    dueDate: "2026-07-27",
    progress: 80,
    visibility: "client_visible",
    checklistItemIds: [],
    dependencyIds: [],
    attachmentIds: [],
    commentCount: 2,
    createdAt: "2026-07-21T12:00:00Z",
    updatedAt: "2026-07-24T06:00:00Z",
  },
  {
    id: "task-504",
    workspaceId: "ws-default",
    projectId: "proj-1",
    version: 1,
    title: "Publish weekly site report",
    description: "Consolidate manpower count, material consumption, and weather log for Week 30.",
    workPackageId: "wp-5",
    phaseId: "Phase 2: Superstructure",
    milestoneId: "Site Progress Reporting",
    status: "todo",
    priority: "normal",
    assigneeIds: ["user-rahul"],
    reporterId: "user-arjun",
    startDate: "2026-07-26",
    dueDate: "2026-07-28",
    progress: 0,
    visibility: "client_visible",
    checklistItemIds: [],
    dependencyIds: [],
    attachmentIds: [],
    commentCount: 0,
    createdAt: "2026-07-23T16:00:00Z",
    updatedAt: "2026-07-23T16:00:00Z",
  },

  // 6. Client Approvals (3 tasks)
  {
    id: "task-601",
    workspaceId: "ws-default",
    projectId: "proj-1",
    version: 1,
    title: "Joinery specification approval",
    description: "Formal client approval signature for custom wardrobe finishes and veneer board samples.",
    workPackageId: "wp-6",
    phaseId: "Phase 1: Design & Approval",
    milestoneId: "Client Approval Gate",
    status: "waiting",
    priority: "critical",
    blockerReason: "Client requested additional teak veneer sample physical review in showroom",
    startDate: "2026-07-18",
    dueDate: "2026-07-22",
    progress: 10,
    visibility: "client_visible",
    assigneeIds: ["user-priya"],
    reporterId: "user-arjun",
    checklistItemIds: [],
    dependencyIds: [],
    attachmentIds: [],
    commentCount: 8,
    createdAt: "2026-07-15T10:00:00Z",
    updatedAt: "2026-07-22T16:00:00Z",
  },
  {
    id: "task-602",
    workspaceId: "ws-default",
    projectId: "proj-1",
    version: 1,
    title: "Kitchen-layout confirmation",
    description: "Obtain client sign-off on built-in appliance electrical points and gas line locations.",
    workPackageId: "wp-6",
    phaseId: "Phase 1: Design & Approval",
    milestoneId: "Client Approval Gate",
    status: "waiting",
    priority: "high",
    startDate: "2026-07-20",
    dueDate: "2026-07-27",
    progress: 50,
    visibility: "client_visible",
    assigneeIds: ["user-priya"],
    reporterId: "user-arjun",
    checklistItemIds: [],
    dependencyIds: [],
    attachmentIds: [],
    commentCount: 4,
    createdAt: "2026-07-18T11:00:00Z",
    updatedAt: "2026-07-24T09:00:00Z",
  },
  {
    id: "task-603",
    workspaceId: "ws-default",
    projectId: "proj-1",
    version: 1,
    title: "First-floor layout approval",
    description: "Client sign-off on master bedroom balcony extension and ensuite bathroom layout.",
    workPackageId: "wp-6",
    phaseId: "Phase 1: Design & Approval",
    milestoneId: "Client Approval Gate",
    status: "completed",
    priority: "critical",
    startDate: "2026-07-08",
    dueDate: "2026-07-12",
    completedAt: "2026-07-12T15:00:00Z",
    progress: 100,
    visibility: "client_visible",
    assigneeIds: ["user-priya"],
    reporterId: "user-arjun",
    checklistItemIds: [],
    dependencyIds: [],
    attachmentIds: [],
    commentCount: 3,
    createdAt: "2026-07-06T09:00:00Z",
    updatedAt: "2026-07-12T15:00:00Z",
  },
];

// Initial Checklists
export const INITIAL_CHECKLISTS: TaskChecklistItem[] = [
  {
    id: "chk-101-1",
    taskId: "task-101",
    label: "Verify batching plant RMC mix ratio (M30)",
    completed: true,
    createdAt: "2026-07-15T09:00:00Z",
    updatedAt: "2026-07-20T10:00:00Z",
  },
  {
    id: "chk-101-2",
    taskId: "task-101",
    label: "Confirm site concrete pump line setup and clearance",
    completed: false,
    createdAt: "2026-07-15T09:00:00Z",
    updatedAt: "2026-07-15T09:00:00Z",
  },
];

// Helper to compute operational urgency score for tasks
export function getTaskUrgencyScore(task: ProjectTask, currentDate: string = "2026-07-24"): number {
  // Completed / Cancelled tasks at the bottom
  if (task.status === "completed" || task.status === "cancelled") {
    return 1;
  }

  const isOverdue = !!(task.dueDate && task.dueDate < currentDate);
  const isBlocked = task.status === "blocked";
  const isDueToday = task.dueDate === currentDate;
  const isCritical = task.priority === "critical";

  // Tier 1: Overdue and/or Blocked (Highest urgency risk tasks)
  if (isOverdue || isBlocked) {
    if (isCritical) return 100;
    return 90;
  }

  // Tier 2: Due today
  if (isDueToday) {
    return 80;
  }

  // Tier 3: Waiting for action
  if (task.status === "waiting") {
    return 70;
  }

  // Tier 4: In progress
  if (task.status === "in_progress") {
    return 60;
  }

  // Tier 5: Upcoming / To do
  return 50;
}

// Mock In-Memory Store
class ProjectTaskMockRepository implements ProjectTaskRepository {
  private tasksStore: ProjectTask[] = [...INITIAL_TASKS];
  private workPackagesStore: WorkPackage[] = [...MOCK_WORK_PACKAGES];
  private checklistsStore: TaskChecklistItem[] = [...INITIAL_CHECKLISTS];
  private idempotencyMap: Map<string, unknown> = new Map();

  async getWorkPackages(workspaceId: string, projectId: string): Promise<WorkPackage[]> {
    return this.workPackagesStore
      .filter((wp) => wp.workspaceId === workspaceId && (wp.projectId === projectId || wp.projectId === "proj-1" || wp.projectId === "proj-001") && !wp.isArchived)
      .sort((a, b) => a.order - b.order);
  }

  async list(input: ListProjectTasksInput): Promise<ProjectTaskPage> {
    const { workspaceId, projectId, scope, searchQuery, statusFilter, priorityFilter, assigneeFilter, phaseFilter, workPackageFilter, sortBy, sortOrder } = input;

    let filtered = this.tasksStore.filter(
      (t) => t.workspaceId === workspaceId && (t.projectId === projectId || t.projectId === "proj-1" || t.projectId === "proj-001")
    );

    if (scope === "mine") {
      filtered = filtered.filter((t) => t.assigneeIds.includes("user-arjun"));
    }

    if (searchQuery && searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase().trim();
      const assigneeNames: Record<string, string> = {
        "user-rahul": "rahul sharma",
        "user-arjun": "arjun menon",
        "user-priya": "priya patel",
      };
      const wpMap = new Map(this.workPackagesStore.map((wp) => [wp.id, wp.name.toLowerCase()]));

      filtered = filtered.filter((t) => {
        const titleMatch = t.title.toLowerCase().includes(q);
        const descMatch = t.description?.toLowerCase().includes(q) ?? false;
        const phaseMatch = t.phaseId?.toLowerCase().includes(q) ?? false;
        const wpNameMatch = wpMap.get(t.workPackageId)?.includes(q) ?? false;
        const assigneeMatch = t.assigneeIds.some((id) => (assigneeNames[id] || "").includes(q));

        return titleMatch || descMatch || phaseMatch || wpNameMatch || assigneeMatch;
      });
    }

    if (statusFilter && statusFilter !== "all") {
      if (statusFilter === "active") {
        filtered = filtered.filter((t) => t.status !== "completed" && t.status !== "cancelled");
      } else {
        filtered = filtered.filter((t) => t.status === statusFilter);
      }
    }

    if (priorityFilter && priorityFilter !== "all") {
      filtered = filtered.filter((t) => t.priority === priorityFilter);
    }

    if (assigneeFilter && assigneeFilter !== "all") {
      filtered = filtered.filter((t) => {
        if (assigneeFilter === "unassigned") return t.assigneeIds.length === 0;
        return t.assigneeIds.includes(assigneeFilter);
      });
    }

    if (phaseFilter && phaseFilter !== "all") {
      filtered = filtered.filter((t) => t.phaseId === phaseFilter || t.workPackageId === phaseFilter);
    }

    if (workPackageFilter && workPackageFilter !== "all") {
      filtered = filtered.filter((t) => t.workPackageId === workPackageFilter);
    }

    // Sort tasks inside work package by Operational Urgency / Needs Attention tier order:
    // Tier 1: Overdue and Blocked
    // Tier 2: Due today
    // Tier 3: Waiting for action
    // Tier 4: In progress
    // Tier 5: Upcoming
    // Tier 6: Completed / Cancelled
    const dir = sortOrder === "desc" ? -1 : 1;
    filtered.sort((a, b) => {
      if (
        !sortBy ||
        sortBy === "needs_attention" ||
        sortBy === "recently_updated" ||
        sortBy === "updated_at"
      ) {
        const scoreA = getTaskUrgencyScore(a);
        const scoreB = getTaskUrgencyScore(b);
        if (scoreA !== scoreB) {
          return (scoreB - scoreA) * dir; // Higher urgency tier first
        }
        // Secondary sort: Priority
        const pMap: Record<string, number> = { critical: 4, high: 3, normal: 2, low: 1 };
        const pa = pMap[a.priority] || 0;
        const pb = pMap[b.priority] || 0;
        if (pa !== pb) return (pb - pa) * dir;

        // Tertiary sort: Due date (earlier due dates first)
        const da = a.dueDate || "9999-99-99";
        const db = b.dueDate || "9999-99-99";
        if (da !== db) return da.localeCompare(db) * dir;

        // Fallback: Updated timestamp
        const ta = new Date(a.updatedAt).getTime();
        const tb = new Date(b.updatedAt).getTime();
        return (tb - ta) * dir;
      } else if (sortBy === "created_at") {
        const ta = new Date(a.createdAt).getTime();
        const tb = new Date(b.createdAt).getTime();
        if (ta !== tb) return (tb - ta) * dir;
      } else if (sortBy === "due_date") {
        const da = a.dueDate || "9999-99-99";
        const db = b.dueDate || "9999-99-99";
        if (da !== db) return da.localeCompare(db) * dir;
      } else if (sortBy === "priority") {
        const pMap: Record<string, number> = { critical: 4, high: 3, normal: 2, low: 1 };
        const pa = pMap[a.priority] || 0;
        const pb = pMap[b.priority] || 0;
        if (pa !== pb) return (pb - pa) * dir;
      } else if (sortBy === "progress") {
        const pa = a.progress ?? 0;
        const pb = b.progress ?? 0;
        if (pa !== pb) return (pb - pa) * dir;
      } else if (sortBy === "status") {
        if (a.status !== b.status) return a.status.localeCompare(b.status) * dir;
      } else if (sortBy === "title") {
        if (a.title !== b.title) return a.title.localeCompare(b.title) * dir;
      }
      return a.id.localeCompare(b.id);
    });

    // Grouping by Work Packages
    const workPackages = await this.getWorkPackages(workspaceId, projectId);
    const groups = workPackages.map((wp) => {
      const wpTasks = filtered.filter((t) => t.workPackageId === wp.id);
      return {
        workPackage: wp,
        tasks: wpTasks,
        totalCount: wpTasks.length,
      };
    });

    // Calculate Attention Summary across current project tasks (derived from filtered task collection)
    const targetTasks = filtered.length > 0
      ? filtered
      : this.tasksStore.filter(
          (t) =>
            t.workspaceId === workspaceId &&
            (t.projectId === projectId || t.projectId === "proj-1" || t.projectId === "proj-001")
        );

    const overdueCount = targetTasks.filter(
      (t) => t.dueDate && t.dueDate < "2026-07-24" && t.status !== "completed" && t.status !== "cancelled"
    ).length;
    const blockedCount = targetTasks.filter((t) => t.status === "blocked").length;
    const awaitingClientApprovalCount = targetTasks.filter(
      (t) => t.workPackageId === "wp-6" && t.status === "waiting"
    ).length;
    const dueThisWeekCount = targetTasks.filter(
      (t) =>
        t.dueDate &&
        t.dueDate >= "2026-07-24" &&
        t.dueDate <= "2026-07-31" &&
        t.status !== "completed" &&
        t.status !== "cancelled"
    ).length;

    return {
      groups,
      totalCount: filtered.length,
      attentionSummary: {
        overdueCount,
        blockedCount,
        awaitingClientApprovalCount,
        dueThisWeekCount,
      },
    };
  }

  async getById(input: { workspaceId: string; projectId: string; taskId: string }): Promise<ProjectTask | null> {
    const task = this.tasksStore.find(
      (t) => t.id === input.taskId && t.workspaceId === input.workspaceId && (t.projectId === input.projectId || t.projectId === "proj-1" || t.projectId === "proj-001")
    );
    return task ? { ...task } : null;
  }

  async create(command: CreateProjectTaskCommand): Promise<ProjectTask> {
    if (this.idempotencyMap.has(command.idempotencyKey)) {
      return this.idempotencyMap.get(command.idempotencyKey) as ProjectTask;
    }

    const newTask: ProjectTask = {
      id: `task-${Date.now()}`,
      workspaceId: command.workspaceId,
      projectId: command.projectId,
      version: 1,
      title: command.title,
      description: command.description,
      workPackageId: command.workPackageId,
      phaseId: command.phaseId,
      milestoneId: command.milestoneId,
      siteZoneId: command.siteZoneId,
      status: command.status || "todo",
      priority: command.priority || "normal",
      assigneeIds: command.assigneeIds,
      reporterId: command.reporterId,
      startDate: command.startDate,
      dueDate: command.dueDate,
      progress: command.status === "completed" ? 100 : 0,
      visibility: command.visibility,
      checklistItemIds: [],
      dependencyIds: [],
      attachmentIds: [],
      commentCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.tasksStore.unshift(newTask);
    this.idempotencyMap.set(command.idempotencyKey, newTask);
    return { ...newTask };
  }

  async update(command: UpdateProjectTaskCommand): Promise<ProjectTask> {
    if (this.idempotencyMap.has(command.idempotencyKey)) {
      return this.idempotencyMap.get(command.idempotencyKey) as ProjectTask;
    }

    const index = this.tasksStore.findIndex(
      (t) => t.id === command.taskId && t.workspaceId === command.workspaceId && t.projectId === command.projectId
    );

    if (index === -1) {
      throw new ProjectTaskDomainError("TASK_NOT_FOUND", `Task ${command.taskId} not found.`);
    }

    const existing = this.tasksStore[index];
    if (existing.version !== command.expectedVersion) {
      throw new ProjectTaskDomainError("VERSION_CONFLICT", "Task version conflict.", {
        expected: command.expectedVersion,
        actual: existing.version,
      });
    }

    const patch = command.patch;
    const updated: ProjectTask = {
      ...existing,
      title: patch.title !== undefined ? patch.title : existing.title,
      description: patch.description !== undefined ? patch.description : existing.description,
      workPackageId: patch.workPackageId !== undefined ? patch.workPackageId : existing.workPackageId,
      phaseId: patch.phaseId !== undefined ? (patch.phaseId === null ? undefined : patch.phaseId) : existing.phaseId,
      milestoneId: patch.milestoneId !== undefined ? (patch.milestoneId === null ? undefined : patch.milestoneId) : existing.milestoneId,
      siteZoneId: patch.siteZoneId !== undefined ? (patch.siteZoneId === null ? undefined : patch.siteZoneId) : existing.siteZoneId,
      priority: patch.priority !== undefined ? patch.priority : existing.priority,
      assigneeIds: patch.assigneeIds !== undefined ? patch.assigneeIds : existing.assigneeIds,
      startDate: patch.startDate !== undefined ? (patch.startDate === null ? undefined : patch.startDate) : existing.startDate,
      dueDate: patch.dueDate !== undefined ? (patch.dueDate === null ? undefined : patch.dueDate) : existing.dueDate,
      version: existing.version + 1,
      updatedAt: new Date().toISOString(),
    };

    this.tasksStore[index] = updated;
    this.idempotencyMap.set(command.idempotencyKey, updated);
    return { ...updated };
  }

  async changeVisibility(command: ChangeProjectTaskVisibilityCommand): Promise<ProjectTask> {
    if (this.idempotencyMap.has(command.idempotencyKey)) {
      return this.idempotencyMap.get(command.idempotencyKey) as ProjectTask;
    }

    const index = this.tasksStore.findIndex(
      (t) => t.id === command.taskId && t.workspaceId === command.workspaceId && t.projectId === command.projectId
    );

    if (index === -1) {
      throw new ProjectTaskDomainError("TASK_NOT_FOUND", `Task ${command.taskId} not found.`);
    }

    const existing = this.tasksStore[index];
    if (existing.version !== command.expectedVersion) {
      throw new ProjectTaskDomainError("VERSION_CONFLICT", "Task version conflict.");
    }

    if (existing.visibility === "internal" && command.targetVisibility === "client_visible" && !command.confirmation) {
      throw new ProjectTaskDomainError("PERMISSION_DENIED", "Expanding visibility to client_visible requires confirmation.");
    }

    const updated: ProjectTask = {
      ...existing,
      visibility: command.targetVisibility,
      version: existing.version + 1,
      updatedAt: new Date().toISOString(),
    };

    this.tasksStore[index] = updated;
    this.idempotencyMap.set(command.idempotencyKey, updated);
    return { ...updated };
  }

  async changeStatus(input: ChangeProjectTaskStatusInput): Promise<ProjectTask> {
    if (this.idempotencyMap.has(input.idempotencyKey)) {
      return this.idempotencyMap.get(input.idempotencyKey) as ProjectTask;
    }

    const index = this.tasksStore.findIndex(
      (t) => t.id === input.taskId && t.workspaceId === input.workspaceId && t.projectId === input.projectId
    );

    if (index === -1) {
      throw new ProjectTaskDomainError("TASK_NOT_FOUND", `Task ${input.taskId} not found.`);
    }

    const existing = this.tasksStore[index];
    if (existing.version !== input.expectedVersion) {
      throw new ProjectTaskDomainError("VERSION_CONFLICT", "Task version conflict.");
    }

    if (input.status === "blocked" && !input.blockerReason) {
      throw new ProjectTaskDomainError("BLOCKER_REASON_REQUIRED", "Blocker reason is required when setting status to blocked.");
    }

    if (existing.workPackageId === "wp-6" && input.status === "completed" && !input.approvalEvidenceId) {
      throw new ProjectTaskDomainError("APPROVAL_EVIDENCE_REQUIRED", "Client approval tasks require approval evidence to complete.");
    }

    const updated: ProjectTask = {
      ...existing,
      status: input.status,
      blockerReason: input.status === "blocked" ? input.blockerReason : undefined,
      completedAt: input.status === "completed" ? new Date().toISOString() : existing.completedAt,
      progress: input.status === "completed" ? 100 : existing.progress,
      version: existing.version + 1,
      updatedAt: new Date().toISOString(),
    };

    this.tasksStore[index] = updated;
    this.idempotencyMap.set(input.idempotencyKey, updated);
    return { ...updated };
  }

  async delete(command: DeleteProjectTaskCommand): Promise<void> {
    if (this.idempotencyMap.has(command.idempotencyKey)) {
      return;
    }

    const hasDependents = this.tasksStore.some((t) => t.dependencyIds.includes(command.taskId));
    if (hasDependents) {
      throw new ProjectTaskDomainError("TASK_HAS_DEPENDENTS", "Cannot delete task because other tasks depend on it.");
    }

    const index = this.tasksStore.findIndex(
      (t) => t.id === command.taskId && t.workspaceId === command.workspaceId && t.projectId === command.projectId
    );

    if (index !== -1) {
      const existing = this.tasksStore[index];
      if (existing.version !== command.expectedVersion) {
        throw new ProjectTaskDomainError("VERSION_CONFLICT", "Task version conflict.");
      }
      this.tasksStore.splice(index, 1);
    }
    this.idempotencyMap.set(command.idempotencyKey, true);
  }

  async addChecklistItem(input: AddTaskChecklistItemInput): Promise<ProjectTaskMutationResult<TaskChecklistItem>> {
    const task = await this.getById(input);
    if (!task) throw new ProjectTaskDomainError("TASK_NOT_FOUND", "Task not found.");
    if (task.version !== input.expectedVersion) throw new ProjectTaskDomainError("VERSION_CONFLICT", "Version conflict.");

    const item: TaskChecklistItem = {
      id: `chk-${Date.now()}`,
      taskId: task.id,
      label: input.label,
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.checklistsStore.push(item);

    const index = this.tasksStore.findIndex((t) => t.id === task.id);
    const updatedTask = {
      ...task,
      checklistItemIds: [...task.checklistItemIds, item.id],
      version: task.version + 1,
      updatedAt: new Date().toISOString(),
    };
    this.tasksStore[index] = updatedTask;

    return { taskId: task.id, taskVersion: updatedTask.version, value: item };
  }

  async updateChecklistItem(input: UpdateTaskChecklistItemInput): Promise<ProjectTaskMutationResult<TaskChecklistItem>> {
    const task = await this.getById(input);
    if (!task) throw new ProjectTaskDomainError("TASK_NOT_FOUND", "Task not found.");
    if (task.version !== input.expectedVersion) throw new ProjectTaskDomainError("VERSION_CONFLICT", "Version conflict.");

    const chkIndex = this.checklistsStore.findIndex((c) => c.id === input.checklistItemId);
    if (chkIndex === -1) throw new ProjectTaskDomainError("TASK_NOT_FOUND", "Checklist item not found.");

    const updatedItem = {
      ...this.checklistsStore[chkIndex],
      completed: input.completed !== undefined ? input.completed : this.checklistsStore[chkIndex].completed,
      label: input.label || this.checklistsStore[chkIndex].label,
      updatedAt: new Date().toISOString(),
    };
    this.checklistsStore[chkIndex] = updatedItem;

    const taskChecklist = this.checklistsStore.filter((c) => task.checklistItemIds.includes(c.id));
    const completedCount = taskChecklist.filter((c) => c.completed).length;
    const progress = Math.round((completedCount / taskChecklist.length) * 100);

    const tIndex = this.tasksStore.findIndex((t) => t.id === task.id);
    const updatedTask = {
      ...task,
      progress,
      version: task.version + 1,
      updatedAt: new Date().toISOString(),
    };
    this.tasksStore[tIndex] = updatedTask;

    return { taskId: task.id, taskVersion: updatedTask.version, value: updatedItem };
  }

  async deleteChecklistItem(input: DeleteTaskChecklistItemInput): Promise<ProjectTaskMutationResult<void>> {
    const task = await this.getById(input);
    if (!task) throw new ProjectTaskDomainError("TASK_NOT_FOUND", "Task not found.");
    if (task.version !== input.expectedVersion) throw new ProjectTaskDomainError("VERSION_CONFLICT", "Version conflict.");

    this.checklistsStore = this.checklistsStore.filter((c) => c.id !== input.checklistItemId);

    const tIndex = this.tasksStore.findIndex((t) => t.id === task.id);
    const updatedTask = {
      ...task,
      checklistItemIds: task.checklistItemIds.filter((id) => id !== input.checklistItemId),
      version: task.version + 1,
      updatedAt: new Date().toISOString(),
    };
    this.tasksStore[tIndex] = updatedTask;

    return { taskId: task.id, taskVersion: updatedTask.version, value: undefined };
  }

  async attachFile(input: AttachTaskFileInput): Promise<ProjectTaskMutationResult<ProjectTask>> {
    const task = await this.getById(input);
    if (!task) throw new ProjectTaskDomainError("TASK_NOT_FOUND", "Task not found.");
    if (task.version !== input.expectedVersion) throw new ProjectTaskDomainError("VERSION_CONFLICT", "Version conflict.");

    const tIndex = this.tasksStore.findIndex((t) => t.id === task.id);
    const updatedTask = {
      ...task,
      attachmentIds: [...task.attachmentIds, input.attachmentId],
      version: task.version + 1,
      updatedAt: new Date().toISOString(),
    };
    this.tasksStore[tIndex] = updatedTask;

    return { taskId: task.id, taskVersion: updatedTask.version, value: { ...updatedTask } };
  }

  async removeAttachment(input: RemoveTaskAttachmentInput): Promise<ProjectTaskMutationResult<ProjectTask>> {
    const task = await this.getById(input);
    if (!task) throw new ProjectTaskDomainError("TASK_NOT_FOUND", "Task not found.");
    if (task.version !== input.expectedVersion) throw new ProjectTaskDomainError("VERSION_CONFLICT", "Version conflict.");

    const tIndex = this.tasksStore.findIndex((t) => t.id === task.id);
    const updatedTask = {
      ...task,
      attachmentIds: task.attachmentIds.filter((id) => id !== input.attachmentId),
      version: task.version + 1,
      updatedAt: new Date().toISOString(),
    };
    this.tasksStore[tIndex] = updatedTask;

    return { taskId: task.id, taskVersion: updatedTask.version, value: { ...updatedTask } };
  }

  async addDependency(input: AddTaskDependencyInput): Promise<ProjectTaskMutationResult<ProjectTask>> {
    const task = await this.getById(input);
    if (!task) throw new ProjectTaskDomainError("TASK_NOT_FOUND", "Task not found.");
    if (task.version !== input.expectedVersion) throw new ProjectTaskDomainError("VERSION_CONFLICT", "Version conflict.");

    const allTasksMap = new Map(this.tasksStore.map((t) => [t.id, t]));
    validateTaskDependencies(task, input.dependencyTaskId, allTasksMap);

    const tIndex = this.tasksStore.findIndex((t) => t.id === task.id);
    const updatedTask = {
      ...task,
      dependencyIds: [...task.dependencyIds, input.dependencyTaskId],
      version: task.version + 1,
      updatedAt: new Date().toISOString(),
    };
    this.tasksStore[tIndex] = updatedTask;

    return { taskId: task.id, taskVersion: updatedTask.version, value: { ...updatedTask } };
  }

  async removeDependency(input: RemoveTaskDependencyInput): Promise<ProjectTaskMutationResult<ProjectTask>> {
    const task = await this.getById(input);
    if (!task) throw new ProjectTaskDomainError("TASK_NOT_FOUND", "Task not found.");
    if (task.version !== input.expectedVersion) throw new ProjectTaskDomainError("VERSION_CONFLICT", "Version conflict.");

    const tIndex = this.tasksStore.findIndex((t) => t.id === task.id);
    const updatedTask = {
      ...task,
      dependencyIds: task.dependencyIds.filter((id) => id !== input.dependencyTaskId),
      version: task.version + 1,
      updatedAt: new Date().toISOString(),
    };
    this.tasksStore[tIndex] = updatedTask;

    return { taskId: task.id, taskVersion: updatedTask.version, value: { ...updatedTask } };
  }
}

export const projectTaskMockRepository = new ProjectTaskMockRepository();
