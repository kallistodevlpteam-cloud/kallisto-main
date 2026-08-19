import {
  ProjectDocument,
  ProjectDocumentFolder,
  ProjectDocumentOwner,
  ProjectDocumentSource,
  ProjectDocumentStatus,
  ProjectDocumentUploadProgress,
  ProjectDocumentUploadResult,
  ProjectDocumentWorkspaceData,
} from "@/types/domain/project-document";
import { ProjectUpdateAttachment, ProjectUpdateType } from "@/types/domain/project-update";
import { resolveDocumentFolder } from "./document-category-mapper";

export interface ProjectDocumentRepositoryCapabilities {
  createFolder: boolean;
  uploadFiles: boolean;
  starDocuments: boolean;
}

export interface CreateProjectDocumentFolderInput {
  projectId: string;
  name: string;
  parentId: string | null;
}

export interface UploadProjectDocumentsInput {
  projectId: string;
  folderId: string | null;
  files: File[];
  uploadedBy: { id: string; name: string };
}

export interface PublishUpdateAttachmentsInput {
  projectId: string;
  updateId: string;
  updateType?: ProjectUpdateType;
  attachments: ProjectUpdateAttachment[];
  publishedBy: ProjectDocumentOwner;
  folderId?: string | null;
  revisesDocumentId?: string;
}

export interface PublishUpdateAttachmentsResult {
  documents: ProjectDocument[];
  failures: Array<{
    attachmentId: string;
    fileName: string;
    error: string;
  }>;
}

export interface ProjectDocumentRepository {
  capabilities: ProjectDocumentRepositoryCapabilities;
  listProjectDocuments(projectId: string): Promise<ProjectDocumentWorkspaceData>;
  getByPublicationKey?(publicationKey: string): Promise<ProjectDocument | null>;
  publishUpdateAttachments?(
    input: PublishUpdateAttachmentsInput,
  ): Promise<PublishUpdateAttachmentsResult>;
  createFolder?(
    input: CreateProjectDocumentFolderInput,
  ): Promise<ProjectDocumentFolder>;
  uploadProjectDocuments?(
    input: UploadProjectDocumentsInput,
    onProgress: (progress: ProjectDocumentUploadProgress) => void,
  ): Promise<ProjectDocumentUploadResult>;
  setDocumentStarred?(
    projectId: string,
    documentId: string,
    isStarred: boolean,
  ): Promise<ProjectDocument>;
  setDocumentArchived?(
    projectId: string,
    documentId: string,
    isArchived: boolean,
  ): Promise<ProjectDocument>;
  setDocumentInBin?(
    projectId: string,
    documentId: string,
    isInBin: boolean,
  ): Promise<ProjectDocument>;
}

const MINUTE = 60_000;
const DAY = 24 * 60 * MINUTE;
const seedLoadedAt = Date.now();

const ownerDirectory = {
  arjun: {
    id: "arjun-mehta",
    name: "Arjun Mehta",
    avatarUrl: "/assets/drive/reference-contributor.jpg",
  },
  neha: { id: "neha-rao", name: "Neha Rao" },
  priya: { id: "priya-nair", name: "Priya Nair" },
  rahul: { id: "rahul-kumar", name: "Rahul Kumar" },
  anoop: { id: "anoop-kumar", name: "Anoop Kumar" },
} as const;

const initialFolders: ProjectDocumentFolder[] = [
  { id: "drawings", projectId: "proj-001", name: "Drawings", count: 0, parentId: null },
  { id: "documents", projectId: "proj-001", name: "Documents", count: 0, parentId: null },
  { id: "approvals", projectId: "proj-001", name: "Approvals", count: 0, parentId: null },
  { id: "contracts", projectId: "proj-001", name: "Contracts", count: 0, parentId: null },
  { id: "site-reports", projectId: "proj-001", name: "Site Reports", count: 0, parentId: null },
  { id: "renderings", projectId: "proj-001", name: "Renderings", count: 0, parentId: null },
  { id: "boq-estimates", projectId: "proj-001", name: "BOQ & Estimates", count: 0, parentId: null },
  { id: "photos-media", projectId: "proj-001", name: "Photos & Media", count: 0, parentId: null },
  { id: "unfiled", projectId: "proj-001", name: "Unfiled", count: 0, parentId: null },
];

interface SeedDocumentInput {
  id: string;
  projectId?: string;
  name: string;
  extension: string;
  folderId: string;
  status: ProjectDocumentStatus;
  source: ProjectDocumentSource;
  owner: keyof typeof ownerDirectory;
  version: number;
  sizeBytes: number;
  updatedDaysAgo: number;
  starred?: boolean;
  visibility?: ProjectDocument["visibility"];
}

function createSeedDocument(input: SeedDocumentInput): ProjectDocument {
  const owner = ownerDirectory[input.owner];
  const pId = input.projectId ?? "proj-001";
  const updatedAt = new Date(
    seedLoadedAt - input.updatedDaysAgo * DAY - (input.version * 7 + 5) * MINUTE,
  ).toISOString();
  const createdAt = new Date(
    new Date(updatedAt).getTime() - Math.max(1, input.version) * 4 * DAY,
  ).toISOString();
  const versions = Array.from({ length: Math.min(input.version, 3) }, (_, index) => {
    const version = input.version - index;
    return {
      version,
      status: index === 0 ? input.status : ("superseded" as const),
      createdAt: new Date(new Date(updatedAt).getTime() - index * 3 * DAY).toISOString(),
      createdBy: owner.name,
      sizeBytes: Math.max(80_000, input.sizeBytes - index * 91_000),
    };
  });

  return {
    id: input.id,
    projectId: pId,
    name: input.name,
    extension: input.extension,
    categoryId: input.folderId,
    folderId: input.folderId,
    status: input.status,
    visibility: input.visibility ?? "client_visible",
    source: input.source,
    sourceType: "system",
    publishedAt: createdAt,
    publicationKey: `system:seed:${input.id}`,
    storageObjectId: `storage://${pId}/seed/${input.id}-${input.name}`,
    downloadUrl: `/assets/docs/${input.name}`,
    version: input.version,
    sizeBytes: input.sizeBytes,
    owner: { ...owner },
    linkedMilestone: input.folderId === "site-reports"
      ? { id: "milestone-roof-slab", name: "Roof Slab Casting" }
      : undefined,
    sharedWith: input.visibility === "restricted"
      ? [{ ...ownerDirectory.anoop }]
      : [{ ...ownerDirectory.anoop }, { ...ownerDirectory.priya }],
    versions,
    recentActivity: [
      {
        id: `${input.id}-activity`,
        action: input.status === "approved" ? `Approved revision R${String(input.version).padStart(2, "0")}` : `Updated revision R${String(input.version).padStart(2, "0")}`,
        actorName: owner.name,
        createdAt: updatedAt,
      },
    ],
    isStarred: Boolean(input.starred),
    createdAt,
    updatedAt,
    approvedAt: input.status === "approved" ? updatedAt : undefined,
    approvedBy: input.status === "approved" ? ownerDirectory.anoop.name : undefined,
  };
}

const seedDocuments = [
  ["doc-ground-floor-plan", "Ground Floor Plan.pdf", "pdf", "drawings", "approved", "team", "arjun", 3, 4_404_019, 0, true],
  ["doc-structural-layout", "Structural Layout.dwg", "dwg", "drawings", "in_review", "team", "neha", 2, 13_421_773, 1, true],
  ["doc-detailed-boq", "Detailed BOQ.xlsx", "xlsx", "boq-estimates", "draft", "team", "arjun", 4, 1_887_437, 2, false],
  ["doc-client-agreement", "Client Agreement.pdf", "pdf", "contracts", "approved", "client", "priya", 1, 2_202_010, 3, true],
  ["doc-site-inspection-report", "Site Inspection Report.pdf", "pdf", "site-reports", "changes_requested", "field", "rahul", 2, 6_815_744, 4, false],
  ["doc-first-floor-plan", "First Floor Plan.pdf", "pdf", "drawings", "approved", "team", "arjun", 3, 4_107_184, 1, false],
  ["doc-electrical-layout", "Electrical Layout.dwg", "dwg", "drawings", "in_review", "team", "neha", 2, 9_437_184, 2, false],
  ["doc-plumbing-layout", "Plumbing Layout.pdf", "pdf", "drawings", "draft", "team", "rahul", 1, 3_417_184, 5, false],
  ["doc-elevation-set", "Elevation Set.pdf", "pdf", "drawings", "rejected", "client", "neha", 2, 8_117_184, 8, false],
  ["doc-roof-plan", "Roof Plan.pdf", "pdf", "drawings", "approved", "team", "arjun", 4, 5_617_184, 10, true],
  ["doc-window-schedule", "Window Schedule.xlsx", "xlsx", "approvals", "approved", "team", "neha", 2, 980_412, 12, false],
  ["doc-client-signoff", "Concept Client Sign-off.pdf", "pdf", "approvals", "approved", "client", "priya", 1, 740_213, 2, true],
  ["doc-building-permit", "Building Permit.pdf", "pdf", "approvals", "in_review", "system", "priya", 2, 3_240_213, 5, false],
  ["doc-material-approval", "Material Approval Register.xlsx", "xlsx", "approvals", "changes_requested", "team", "rahul", 5, 1_140_213, 7, false],
  ["doc-design-approval", "Design Approval Notes.docx", "docx", "approvals", "draft", "client", "neha", 1, 640_213, 14, false],
  ["doc-scope-contract", "Scope of Works.pdf", "pdf", "contracts", "approved", "client", "priya", 2, 1_941_220, 9, false],
  ["doc-subcontract", "Electrical Subcontract.pdf", "pdf", "contracts", "draft", "team", "arjun", 1, 2_140_102, 16, false],
  ["doc-site-log-07", "Site Progress Log 07.pdf", "pdf", "site-reports", "in_review", "field", "rahul", 7, 7_109_021, 1, true],
  ["doc-safety-report", "Safety Inspection Report.pdf", "pdf", "site-reports", "approved", "field", "rahul", 2, 3_709_021, 6, false],
  ["doc-cost-summary", "Cost Summary.xlsx", "xlsx", "boq-estimates", "approved", "team", "arjun", 3, 1_109_021, 3, false],
  ["doc-rate-analysis", "Rate Analysis.xlsx", "xlsx", "boq-estimates", "draft", "team", "arjun", 2, 2_009_021, 11, false],
  ["doc-kitchen-render", "Kitchen Render.png", "png", "renderings", "approved", "team", "neha", 1, 8_409_021, 4, true],
  ["doc-site-photo-set", "Site Photo Set.zip", "zip", "renderings", "in_review", "field", "rahul", 3, 18_409_021, 2, false],
  ["doc-handover-checklist", "Handover Checklist.pdf", "pdf", "documents", "draft", "team", "priya", 1, 809_021, 18, false],
] as const;

const documents: ProjectDocument[] = seedDocuments.map((entry) =>
  createSeedDocument({
    id: entry[0],
    name: entry[1],
    extension: entry[2],
    folderId: entry[3],
    status: entry[4],
    source: entry[5],
    owner: entry[6],
    version: entry[7],
    sizeBytes: entry[8],
    updatedDaysAgo: entry[9],
    starred: entry[10],
    visibility: entry[0] === "doc-client-agreement" ? "restricted" : "client_visible",
  }),
);

const folders: ProjectDocumentFolder[] = initialFolders.map((folder) => ({ ...folder }));
let mutationSequence = 0;

function ensureProjectDocuments(projectId: string) {
  if (!folders.some((folder) => folder.projectId === projectId)) {
    initialFolders.forEach((folder) => {
      folders.push({
        ...folder,
        projectId,
      });
    });
  }

  if (!documents.some((doc) => doc.projectId === projectId)) {
    seedDocuments.forEach((entry) => {
      documents.push(
        createSeedDocument({
          id: `${entry[0]}-${projectId}`,
          projectId,
          name: entry[1],
          extension: entry[2],
          folderId: entry[3],
          status: entry[4],
          source: entry[5],
          owner: entry[6],
          version: entry[7],
          sizeBytes: entry[8],
          updatedDaysAgo: entry[9],
          starred: entry[10],
          visibility: entry[0] === "doc-client-agreement" ? "restricted" : "client_visible",
        }),
      );
    });
  }
}

function cloneDocument(document: ProjectDocument): ProjectDocument {
  return {
    ...document,
    owner: { ...document.owner },
    linkedMilestone: document.linkedMilestone ? { ...document.linkedMilestone } : undefined,
    sharedWith: document.sharedWith.map((user) => ({ ...user })),
    versions: document.versions.map((version) => ({ ...version })),
    recentActivity: document.recentActivity.map((activity) => ({ ...activity })),
  };
}

function getFolderCount(projectId: string, folderId: string): number {
  return documents.filter(
    (document) =>
      document.projectId === projectId &&
      document.folderId === folderId &&
      !document.isInBin &&
      document.status !== "archived",
  ).length;
}

function slugifyFolderName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function inferSource(file: File): ProjectDocumentSource {
  return file.type.startsWith("image/") ? "field" : "team";
}

export const projectDocumentRepository: ProjectDocumentRepository = {
  capabilities: {
    createFolder: true,
    uploadFiles: true,
    starDocuments: true,
  },

  async listProjectDocuments(projectId) {
    ensureProjectDocuments(projectId);
    const projectDocuments = documents
      .filter((document) => document.projectId === projectId)
      .map(cloneDocument);
    const activeDocuments = projectDocuments.filter(
      (document) => !document.isInBin && document.status !== "archived",
    );

    return {
      documents: projectDocuments,
      folders: folders
        .filter((folder) => folder.projectId === projectId)
        .map((folder) => ({ ...folder, count: getFolderCount(projectId, folder.id) })),
      totalFileCount: activeDocuments.length,
      lastUpdatedAt:
        activeDocuments.reduce<string | null>((latest, document) => {
          if (!latest || new Date(document.updatedAt) > new Date(latest)) {
            return document.updatedAt;
          }
          return latest;
        }, null) ?? new Date().toISOString(),
    };
  },

  async getByPublicationKey(publicationKey: string): Promise<ProjectDocument | null> {
    const found = documents.find((doc) => doc.publicationKey === publicationKey);
    return found ? cloneDocument(found) : null;
  },

  async publishUpdateAttachments(input): Promise<PublishUpdateAttachmentsResult> {
    const publishedDocs: ProjectDocument[] = [];
    const failures: Array<{ attachmentId: string; fileName: string; error: string }> = [];
    const now = new Date().toISOString();

    for (const attachment of input.attachments) {
      const pubKey = `${input.projectId}:${input.updateId}:${attachment.id}`;

      // Idempotency check 1: Document with publicationKey already exists
      const existingKeyDoc = documents.find((d) => d.publicationKey === pubKey);
      if (existingKeyDoc) {
        publishedDocs.push(cloneDocument(existingKeyDoc));
        continue;
      }

      // Check per-attachment or input revisesDocumentId
      const targetRevId = attachment.revisesDocumentId || input.revisesDocumentId;
      if (targetRevId) {
        const targetDocIndex = documents.findIndex((d) => d.id === targetRevId);
        if (targetDocIndex !== -1) {
          const targetDoc = documents[targetDocIndex];
          if (targetDoc.projectId !== input.projectId) {
            failures.push({
              attachmentId: attachment.id,
              fileName: attachment.name,
              error: "Revision of a document from another project is rejected.",
            });
            continue;
          }

          // Apply revision update to aggregate
          const nextVersion = targetDoc.version + 1;
          const newVersionRecord = {
            version: nextVersion,
            status: "draft" as const,
            createdAt: now,
            createdBy: input.publishedBy.name,
            sizeBytes: attachment.sizeBytes || targetDoc.sizeBytes,
          };

          targetDoc.version = nextVersion;
          targetDoc.sizeBytes = attachment.sizeBytes || targetDoc.sizeBytes;
          targetDoc.updatedAt = now;
          targetDoc.versions = [newVersionRecord, ...targetDoc.versions];
          targetDoc.recentActivity = [
            {
              id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
              action: `Updated revision R${String(nextVersion).padStart(2, "0")}`,
              actorName: input.publishedBy.name,
              createdAt: now,
            },
            ...targetDoc.recentActivity,
          ];

          publishedDocs.push(cloneDocument(targetDoc));
          continue;
        }
      }

      // New Document creation path
      mutationSequence += 1;
      const extension = attachment.name.includes(".")
        ? attachment.name.split(".").pop()?.toLowerCase() ?? "file"
        : "file";

      const folderId = input.folderId ?? resolveDocumentFolder({
        selectedCategory: input.folderId ?? undefined,
        attachmentCategory: attachment.documentCategory,
        updateType: input.updateType,
        fileName: attachment.name,
        mimeType: attachment.mimeType,
      });

      const newDoc: ProjectDocument = {
        id: `doc-pub-${mutationSequence}-${attachment.id}`,
        projectId: input.projectId,
        name: attachment.name,
        extension,
        categoryId: folderId,
        folderId,
        status: "draft",
        visibility: "client_visible",
        source: attachment.type === "image" ? "field" : "team",
        sourceType: "project_update",
        sourceUpdateId: input.updateId,
        sourceAttachmentId: attachment.id,
        publishedAt: now,
        publicationKey: pubKey,
        storageObjectId: attachment.storageObjectId || `storage://${input.projectId}/attachments/${attachment.id}`,
        downloadUrl: attachment.downloadUrl || attachment.url || `/assets/docs/${attachment.name}`,
        version: 1,
        sizeBytes: attachment.sizeBytes || 1024,
        owner: { ...input.publishedBy },
        sharedWith: [],
        versions: [
          {
            version: 1,
            status: "draft",
            createdAt: now,
            createdBy: input.publishedBy.name,
            sizeBytes: attachment.sizeBytes || 1024,
          },
        ],
        recentActivity: [
          {
            id: `pub-act-${mutationSequence}`,
            action: "Published via Project Update",
            actorName: input.publishedBy.name,
            createdAt: now,
          },
        ],
        isStarred: false,
        createdAt: now,
        updatedAt: now,
      };

      documents.unshift(newDoc);
      publishedDocs.push(cloneDocument(newDoc));
    }

    return { documents: publishedDocs, failures };
  },

  async createFolder({ projectId, name, parentId }) {
    const normalizedName = name.trim().toLocaleLowerCase();
    const duplicate = folders.some(
      (folder) =>
        folder.projectId === projectId &&
        (folder.parentId ?? null) === parentId &&
        folder.name.trim().toLocaleLowerCase() === normalizedName,
    );

    if (duplicate) {
      throw new Error("A folder with this name already exists here.");
    }

    mutationSequence += 1;
    const folder: ProjectDocumentFolder = {
      id: `${slugifyFolderName(name) || "folder"}-${mutationSequence}`,
      projectId,
      name: name.trim(),
      count: 0,
      parentId,
    };
    folders.push(folder);
    return { ...folder };
  },

  async uploadProjectDocuments(input, onProgress) {
    const uploaded: ProjectDocument[] = [];
    const failures: Array<{ fileName: string; error: string }> = [];

    for (const file of input.files) {
      onProgress({ fileName: file.name, progress: 0, state: "queued" });
      await Promise.resolve();
      onProgress({ fileName: file.name, progress: 45, state: "uploading" });

      const extension = file.name.includes(".")
        ? file.name.split(".").pop()?.toLowerCase() ?? "file"
        : "file";
      const validationError =
        file.size > 25 * 1024 * 1024
          ? "File exceeds the 25 MB upload limit."
          : extension === "exe"
            ? "This file type is not allowed."
            : null;

      if (validationError) {
        failures.push({ fileName: file.name, error: validationError });
        onProgress({
          fileName: file.name,
          progress: 45,
          state: "failed",
          error: validationError,
        });
        continue;
      }

      mutationSequence += 1;
      const now = new Date().toISOString();
      const document: ProjectDocument = {
        id: `uploaded-document-${mutationSequence}`,
        projectId: input.projectId,
        name: file.name,
        extension,
        categoryId: input.folderId ?? "unfiled",
        folderId: input.folderId ?? "unfiled",
        status: "draft",
        visibility: "internal",
        source: inferSource(file),
        sourceType: "manual_admin",
        publishedAt: now,
        publicationKey: `manual:upload:${mutationSequence}`,
        storageObjectId: `storage://${input.projectId}/manual/${mutationSequence}-${file.name}`,
        downloadUrl: `/assets/docs/${file.name}`,
        version: 1,
        sizeBytes: file.size,
        owner: { ...input.uploadedBy },
        sharedWith: [],
        versions: [
          {
            version: 1,
            status: "draft",
            createdAt: now,
            createdBy: input.uploadedBy.name,
            sizeBytes: file.size,
          },
        ],
        recentActivity: [
          {
            id: `upload-activity-${mutationSequence}`,
            action: "Uploaded revision R01",
            actorName: input.uploadedBy.name,
            createdAt: now,
          },
        ],
        isStarred: false,
        createdAt: now,
        updatedAt: now,
      };
      documents.unshift(document);
      uploaded.push(cloneDocument(document));
      onProgress({ fileName: file.name, progress: 100, state: "complete" });
    }

    return { uploaded, failures };
  },

  async setDocumentStarred(projectId, documentId, isStarred) {
    const document = documents.find(
      (candidate) => candidate.projectId === projectId && candidate.id === documentId,
    );
    if (!document) {
      throw new Error("Document not found.");
    }
    document.isStarred = isStarred;
    document.updatedAt = new Date().toISOString();
    return cloneDocument(document);
  },

  async setDocumentArchived(projectId, documentId, isArchived) {
    const document = documents.find(
      (candidate) => candidate.projectId === projectId && candidate.id === documentId,
    );
    if (!document) {
      throw new Error("Document not found.");
    }
    document.status = isArchived ? "archived" : "in_review";
    document.updatedAt = new Date().toISOString();
    return cloneDocument(document);
  },

  async setDocumentInBin(projectId, documentId, isInBin) {
    const document = documents.find(
      (candidate) => candidate.projectId === projectId && candidate.id === documentId,
    );
    if (!document) {
      throw new Error("Document not found.");
    }
    document.isInBin = isInBin;
    document.updatedAt = new Date().toISOString();
    return cloneDocument(document);
  },
};
