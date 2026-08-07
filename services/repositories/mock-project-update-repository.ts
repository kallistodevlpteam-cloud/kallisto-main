import {
  ProjectUpdate,
  ProjectUpdatePage,
  ProjectUpdateReply,
  ListProjectUpdatesInput,
  CreateProjectUpdateInput,
  CreateProjectUpdateReplyInput,
} from "@/types/domain/project-update";
import { ProjectUpdateRepository } from "./project-update-repository";

const INITIAL_MOCK_UPDATES: ProjectUpdate[] = [
  {
    id: "upd-001",
    projectId: "ws-default-proj-001",
    authorId: "usr-arjun",
    authorName: "Arjun Menon",
    authorRole: "Project Manager",
    authorAvatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    type: "milestone",
    body: "Phase 3 structural slab casting & roof waterproofing completed on schedule. Inspection report uploaded for client review.",
    visibility: "project_team",
    isPinned: true,
    pinnedBy: "Arjun Menon",
    attachments: [
      {
        id: "att-101",
        type: "image",
        url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80",
        name: "Phase 3 Progress Video.mp4",
        sizeBytes: 15450000,
        mimeType: "video/mp4",
        overlayBadgeText: "0:42 HD Progress Video",
      },
    ],
    acknowledgedAvatars: [
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    ],
    acknowledgementCount: 7,
    acknowledgedByCurrentUser: false,
    savedByCurrentUser: false,
    reactions: { acknowledged: 7, looks_good: 3 },
    replyCount: 0,
    replies: [],
    createdAt: "2026-05-12T10:00:00Z",
  },
  {
    id: "upd-002",
    projectId: "ws-default-proj-001",
    authorId: "usr-priya",
    authorName: "Priya Sharma",
    authorRole: "Lead Architect",
    authorAvatar:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    type: "approval_decided",
    body: "Updated interior living room elevations and luxury marble flooring specifications approved by client team.",
    visibility: "project_team",
    attachments: [
      {
        id: "att-102",
        type: "image",
        url: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80",
        name: "Living Room Render.jpg",
        sizeBytes: 3120000,
        mimeType: "image/jpeg",
        overlayBadgeText: "3 Renders Attached",
      },
    ],
    acknowledgedAvatars: [
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=100&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
    ],
    acknowledgementCount: 7,
    acknowledgedByCurrentUser: false,
    savedByCurrentUser: false,
    reactions: { acknowledged: 7 },
    replyCount: 0,
    replies: [],
    createdAt: "2026-05-10T14:00:00Z",
  },
  {
    id: "upd-010",
    projectId: "ws-default-proj-001",
    authorId: "usr-site-team",
    authorName: "Site Team",
    authorRole: "Field Engineering",
    authorAvatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    type: "task_completed",
    title: "Excavation and foundation pit clearance",
    body: "Excavation work for the north wing footing and drainage channel has been completed and verified by site surveyors.",
    visibility: "project_team",
    linkedEntity: {
      type: "task",
      id: "tsk-excavation",
      title: "Excavation work & Soil clearance",
      subtitle: "Assigned to Site Team · Verified by Lead Engineer",
      status: "Completed",
    },
    acknowledgementCount: 4,
    acknowledgedByCurrentUser: false,
    savedByCurrentUser: false,
    reactions: { acknowledged: 4, looks_good: 2 },
    replyCount: 0,
    replies: [],
    createdAt: "2024-05-12T07:30:00Z",
  },
  {
    id: "upd-011",
    projectId: "ws-default-proj-001",
    authorId: "usr-arjun",
    authorName: "Arjun Menon",
    authorRole: "Project Manager",
    authorAvatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    type: "document_uploaded",
    title: "Ground Floor Layout Drawing — Rev 02 Published",
    body: "Revised architectural layout drawing featuring modified kitchen island measurements and utility shaft routing.",
    visibility: "client_visible",
    attachments: [
      {
        id: "att-104",
        type: "document",
        url: "/assets/docs/ground_floor_rev02.pdf",
        name: "Ground Floor Drawing — Rev 02.pdf",
        sizeBytes: 8808038,
        mimeType: "application/pdf",
      },
    ],
    linkedEntity: {
      type: "document",
      id: "doc-gf-rev02",
      title: "Ground Floor Plan Rev 02",
      subtitle: "PDF · 8.4 MB · Uploaded by Arjun Menon",
      status: "Approved",
    },
    acknowledgementCount: 6,
    acknowledgedByCurrentUser: true,
    savedByCurrentUser: true,
    reactions: { acknowledged: 6 },
    replyCount: 1,
    replies: [
      {
        id: "rep-011",
        updateId: "upd-011",
        authorId: "usr-anoop",
        authorName: "Anoop Menon",
        authorRole: "Client Representative",
        body: "Received and reviewed. The kitchen layout dimension adjustment looks great.",
        createdAt: "2024-05-11T16:20:00Z",
      },
    ],
    createdAt: "2024-05-11T14:15:00Z",
  },
  {
    id: "upd-004",
    projectId: "ws-default-proj-001",
    authorId: "usr-priya",
    authorName: "Priya Patel",
    authorRole: "Lead Architect",
    authorAvatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80",
    type: "approval_requested",
    title: "Client Sign-off Requested: Teak Joinery Specification Revision",
    body: "Custom joinery specifications for living room wall cladding and entrance foyer panelling require formal client approval prior to timber procurement.",
    visibility: "client_visible",
    linkedEntity: {
      type: "approval",
      id: "appr-joinery-rev",
      title: "Joinery Material & Finish Revision",
      subtitle: "Requested by Lead Architect · Pending Client Review",
      status: "Pending",
    },
    acknowledgementCount: 3,
    acknowledgedByCurrentUser: false,
    savedByCurrentUser: false,
    reactions: { needs_attention: 2 },
    replyCount: 0,
    replies: [],
    createdAt: "2024-05-10T16:00:00Z",
  },
  {
    id: "upd-005",
    projectId: "ws-default-proj-001",
    authorId: "usr-rahul",
    authorName: "Rahul Sharma",
    authorRole: "Structural Engineer",
    authorAvatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
    type: "site_report",
    title: "Weekly Site Feasibility & Quality Check Report #14",
    body: "Comprehensive weekly audit completed. Soil moisture levels are nominal, concrete setting temperatures logged within standard threshold limits.",
    visibility: "internal",
    attachments: [
      {
        id: "att-105",
        type: "image",
        url: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&auto=format&fit=crop&q=80",
        name: "Site Safety Check.jpg",
        sizeBytes: 1540000,
        mimeType: "image/jpeg",
      },
      {
        id: "att-106",
        type: "document",
        url: "/assets/docs/weekly_report_14.pdf",
        name: "Quality Audit Report #14.pdf",
        sizeBytes: 3200000,
        mimeType: "application/pdf",
      },
    ],
    linkedEntity: {
      type: "site_report",
      id: "rep-site-14",
      title: "Weekly Feasibility Audit #14",
      subtitle: "Author: Rahul Sharma · Status: Verified",
      status: "Verified",
    },
    acknowledgementCount: 2,
    acknowledgedByCurrentUser: false,
    savedByCurrentUser: false,
    reactions: { acknowledged: 2 },
    replyCount: 0,
    replies: [],
    createdAt: "2024-05-09T09:30:00Z",
  },
];

class MockProjectUpdateRepositoryImpl implements ProjectUpdateRepository {
  private updatesStore: ProjectUpdate[] = [...INITIAL_MOCK_UPDATES];

  async list(input: ListProjectUpdatesInput): Promise<ProjectUpdatePage> {
    let result = this.updatesStore.filter(
      (u) =>
        !input.projectId ||
        u.projectId === input.projectId ||
        u.projectId.includes(input.projectId) ||
        input.projectId.includes(u.projectId)
    );

    // 1. Apply update type filter
    if (input.typeFilter && input.typeFilter !== "all") {
      const filterKey = input.typeFilter.toLowerCase();
      result = result.filter((u) => {
        if (filterKey === "milestone") return u.type === "milestone";
        if (filterKey === "task") return u.type === "task_completed";
        if (filterKey === "document") return u.type === "document_uploaded";
        if (filterKey === "approval") return u.type.startsWith("approval");
        if (filterKey === "site") return u.type === "site_report";
        if (filterKey === "finance") return u.type === "payment" || u.type === "variation";
        if (filterKey === "mentions") return u.mentionedUserIds?.length;
        return u.type === filterKey;
      });
    }

    // 2. Sort order: Default is latest first
    const isOldest = input.sort === "oldest";
    result.sort((a, b) => {
      const timeA = new Date(a.createdAt).getTime();
      const timeB = new Date(b.createdAt).getTime();

      // Pinned posts always stay at the top when sorting latest
      if (!isOldest) {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
      }

      if (timeA !== timeB) {
        return isOldest ? timeA - timeB : timeB - timeA;
      }
      // Secondary stable tie-breaker by id
      return a.id.localeCompare(b.id);
    });

    // 3. Cursor pagination handling
    let startIndex = 0;
    if (input.cursor) {
      const cursorIndex = result.findIndex(
        (u) => u.id === input.cursor?.id && u.createdAt === input.cursor?.createdAt
      );
      if (cursorIndex !== -1) {
        startIndex = cursorIndex + 1;
      }
    }

    const pageSize = input.limit || 15;
    const pageItems = result.slice(startIndex, startIndex + pageSize);
    const hasMore = startIndex + pageSize < result.length;

    let nextCursor: ProjectUpdatePage["nextCursor"] = undefined;
    if (hasMore && pageItems.length > 0) {
      const lastItem = pageItems[pageItems.length - 1];
      nextCursor = { createdAt: lastItem.createdAt, id: lastItem.id };
    }

    return {
      items: pageItems,
      nextCursor,
      hasMore,
    };
  }

  async getById(updateId: string): Promise<ProjectUpdate | null> {
    const item = this.updatesStore.find((u) => u.id === updateId);
    return item ? { ...item } : null;
  }

  async create(input: CreateProjectUpdateInput): Promise<ProjectUpdate> {
    const now = new Date().toISOString();
    const newUpdate: ProjectUpdate = {
      id: `upd-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      projectId: input.projectId,
      authorId: input.authorId,
      authorName: input.authorName,
      authorRole: input.authorRole,
      authorAvatar: input.authorAvatar,
      type: input.type,
      title: input.title,
      body: input.body,
      visibility: input.visibility,
      attachments: input.attachments || [],
      linkedEntity: input.linkedEntity,
      acknowledgementCount: 0,
      acknowledgedByCurrentUser: false,
      savedByCurrentUser: false,
      reactions: {},
      replyCount: 0,
      replies: [],
      createdAt: now,
      updatedAt: now,
    };

    this.updatesStore = [newUpdate, ...this.updatesStore];
    return newUpdate;
  }

  async acknowledge(updateId: string): Promise<ProjectUpdate> {
    const index = this.updatesStore.findIndex((u) => u.id === updateId);
    if (index === -1) throw new Error(`Update ${updateId} not found`);

    const update = this.updatesStore[index];
    const isAck = !update.acknowledgedByCurrentUser;
    const countChange = isAck ? 1 : -1;

    const updated: ProjectUpdate = {
      ...update,
      acknowledgedByCurrentUser: isAck,
      acknowledgementCount: Math.max(0, update.acknowledgementCount + countChange),
    };

    this.updatesStore[index] = updated;
    return updated;
  }

  async save(updateId: string): Promise<ProjectUpdate> {
    const index = this.updatesStore.findIndex((u) => u.id === updateId);
    if (index === -1) throw new Error(`Update ${updateId} not found`);

    const update = this.updatesStore[index];
    const updated: ProjectUpdate = {
      ...update,
      savedByCurrentUser: !update.savedByCurrentUser,
    };

    this.updatesStore[index] = updated;
    return updated;
  }

  async togglePin(updateId: string, pinnedBy = "Arjun Menon"): Promise<ProjectUpdate> {
    const index = this.updatesStore.findIndex((u) => u.id === updateId);
    if (index === -1) throw new Error(`Update ${updateId} not found`);

    const update = this.updatesStore[index];
    const isPinned = !update.isPinned;

    const updated: ProjectUpdate = {
      ...update,
      isPinned,
      pinnedBy: isPinned ? pinnedBy : undefined,
    };

    this.updatesStore[index] = updated;
    return updated;
  }

  async createReply(
    input: CreateProjectUpdateReplyInput
  ): Promise<{ update: ProjectUpdate; reply: ProjectUpdateReply }> {
    const index = this.updatesStore.findIndex((u) => u.id === input.updateId);
    if (index === -1) throw new Error(`Update ${input.updateId} not found`);

    const update = this.updatesStore[index];
    const now = new Date().toISOString();
    const reply: ProjectUpdateReply = {
      id: `rep-${Date.now()}`,
      updateId: input.updateId,
      authorId: input.authorId,
      authorName: input.authorName,
      authorRole: input.authorRole,
      authorAvatar: input.authorAvatar,
      body: input.body,
      attachments: input.attachments,
      createdAt: now,
    };

    const updatedReplies = [...(update.replies || []), reply];
    const updated: ProjectUpdate = {
      ...update,
      replyCount: updatedReplies.length,
      replies: updatedReplies,
    };

    this.updatesStore[index] = updated;
    return { update: updated, reply };
  }

  async delete(updateId: string): Promise<boolean> {
    const initialLen = this.updatesStore.length;
    this.updatesStore = this.updatesStore.filter((u) => u.id !== updateId);
    return this.updatesStore.length < initialLen;
  }
}

export const mockProjectUpdateRepository = new MockProjectUpdateRepositoryImpl();
