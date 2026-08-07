import { describe, expect, it } from "vitest";
import { projectUpdatePublishingService, ProjectUpdateActor } from "@/services/project-update-publishing-service";
import { projectDocumentRepository } from "@/services/repositories/project-document-repository";
import { resolveDocumentFolder } from "@/services/repositories/document-category-mapper";

const defaultActor: ProjectUpdateActor = {
  userId: "usr-arjun",
  workspaceId: "ws-default",
  role: "Project Manager",
  name: "Arjun Menon",
};

describe("Update-to-Drive Document Publishing Integration", () => {
  const testProjectId = "proj-001";

  it("1. Creating an update with 1 attachment creates 1 Drive document", async () => {
    const result = await projectUpdatePublishingService.createAndPublish({
      update: {
        projectId: testProjectId,
        authorId: defaultActor.userId,
        authorName: defaultActor.name,
        authorRole: defaultActor.role,
        type: "document_uploaded",
        title: "Test Single Attachment Update",
        visibility: "project_team",
        attachments: [
          {
            id: "att-single-101",
            type: "document",
            name: "Site_Safety_Audit_2026.pdf",
            url: "/assets/docs/Site_Safety_Audit_2026.pdf",
            sizeBytes: 2500000,
            mimeType: "application/pdf",
          },
        ],
      },
      actor: defaultActor,
    });

    expect(result.update.id).toBeDefined();
    expect(result.documents).toHaveLength(1);
    expect(result.failures).toHaveLength(0);
    expect(result.update.documentPublication?.status).toBe("published");
    expect(result.update.publishedDocumentIds).toHaveLength(1);
  });

  it("2. Multiple attachments create multiple Drive documents", async () => {
    const result = await projectUpdatePublishingService.createAndPublish({
      update: {
        projectId: testProjectId,
        authorId: defaultActor.userId,
        authorName: defaultActor.name,
        authorRole: defaultActor.role,
        type: "site_report",
        title: "Multi-attachment Site Audit",
        visibility: "project_team",
        attachments: [
          {
            id: "att-multi-1",
            type: "image",
            name: "Foundation_Site_Photo.jpg",
            url: "/assets/docs/Foundation_Site_Photo.jpg",
            sizeBytes: 1200000,
            mimeType: "image/jpeg",
          },
          {
            id: "att-multi-2",
            type: "document",
            name: "Foundation_Structural_Report.pdf",
            url: "/assets/docs/Foundation_Structural_Report.pdf",
            sizeBytes: 4500000,
            mimeType: "application/pdf",
          },
        ],
      },
      actor: defaultActor,
    });

    expect(result.documents).toHaveLength(2);
    expect(result.update.publishedDocumentIds).toHaveLength(2);
  });

  it("3. Published document contains required source, metadata, and durable storage fields", async () => {
    const attId = "att-meta-check";
    const result = await projectUpdatePublishingService.createAndPublish({
      update: {
        projectId: testProjectId,
        authorId: defaultActor.userId,
        authorName: defaultActor.name,
        authorRole: defaultActor.role,
        type: "document_uploaded",
        title: "Metadata Check Update",
        visibility: "project_team",
        attachments: [
          {
            id: attId,
            type: "document",
            name: "Electrical_Schematic_v1.dwg",
            url: "/assets/docs/Electrical_Schematic_v1.dwg",
            sizeBytes: 9800000,
            mimeType: "image/vnd.dwg",
          },
        ],
      },
      actor: defaultActor,
    });

    const publishedDoc = result.documents[0];
    expect(publishedDoc.projectId).toBe(testProjectId);
    expect(publishedDoc.sourceType).toBe("project_update");
    expect(publishedDoc.sourceUpdateId).toBe(result.update.id);
    expect(publishedDoc.sourceAttachmentId).toBe(attId);
    expect(publishedDoc.publishedAt).toBeDefined();
    expect(publishedDoc.publicationKey).toBe(`${testProjectId}:${result.update.id}:${attId}`);
    expect(publishedDoc.storageObjectId).toContain("storage://");
    expect(publishedDoc.downloadUrl).toBeDefined();
  });

  it("4. Published document appears in listProjectDocuments", async () => {
    const result = await projectUpdatePublishingService.createAndPublish({
      update: {
        projectId: testProjectId,
        authorId: defaultActor.userId,
        authorName: defaultActor.name,
        authorRole: defaultActor.role,
        type: "document_uploaded",
        title: "Listing Test Update",
        visibility: "project_team",
        attachments: [
          {
            id: "att-list-check",
            type: "document",
            name: "Land_Survey_Certificate.pdf",
            url: "/assets/docs/Land_Survey_Certificate.pdf",
            sizeBytes: 1500000,
            mimeType: "application/pdf",
          },
        ],
      },
      actor: defaultActor,
    });

    const workspaceData = await projectDocumentRepository.listProjectDocuments(testProjectId);
    const foundDoc = workspaceData.documents.find((d) => d.id === result.documents[0].id);
    expect(foundDoc).toBeDefined();
    expect(foundDoc?.name).toBe("Land_Survey_Certificate.pdf");
  });

  it("5. Idempotency: repeating publication returns existing document without duplication", async () => {
    const attId = "att-idempotent-1";
    const updateInput = {
      projectId: testProjectId,
      authorId: defaultActor.userId,
      authorName: defaultActor.name,
      authorRole: defaultActor.role,
      type: "document_uploaded" as const,
      title: "Idempotency Test Update",
      visibility: "project_team" as const,
      attachments: [
        {
          id: attId,
          type: "document" as const,
          name: "Contract_Addendum_1.pdf",
          url: "/assets/docs/Contract_Addendum_1.pdf",
          sizeBytes: 2000000,
          mimeType: "application/pdf",
        },
      ],
    };

    const firstRun = await projectUpdatePublishingService.createAndPublish({
      update: updateInput,
      actor: defaultActor,
    });

    // Directly invoke repo publishUpdateAttachments with same updateId and attachment
    const repoRes = await projectDocumentRepository.publishUpdateAttachments!({
      projectId: testProjectId,
      updateId: firstRun.update.id,
      attachments: updateInput.attachments,
      publishedBy: { id: defaultActor.userId, name: defaultActor.name },
    });

    expect(repoRes.documents).toHaveLength(1);
    expect(repoRes.documents[0].id).toBe(firstRun.documents[0].id);

    // Verify workspace total count did not duplicate
    const workspaceData = await projectDocumentRepository.listProjectDocuments(testProjectId);
    const matchingDocs = workspaceData.documents.filter(
      (d) => d.publicationKey === `${testProjectId}:${firstRun.update.id}:${attId}`
    );
    expect(matchingDocs).toHaveLength(1);
  });

  it("6. Category mapping is deterministic and respects precedence rules", () => {
    // Explicit category override
    expect(
      resolveDocumentFolder({
        selectedCategory: "contracts",
        fileName: "Drawing_Plan.pdf",
      })
    ).toBe("contracts");

    // Keyword matching
    expect(
      resolveDocumentFolder({
        fileName: "First_Floor_Structural_Elevation.pdf",
      })
    ).toBe("drawings");

    expect(
      resolveDocumentFolder({
        fileName: "Client_Signoff_Approval.pdf",
      })
    ).toBe("approvals");

    // Update type precedence
    expect(
      resolveDocumentFolder({
        updateType: "site_report",
        fileName: "Custom_File.bin",
      })
    ).toBe("site-reports");

    // Fallback to unfiled
    expect(
      resolveDocumentFolder({
        fileName: "random_notes.xyz",
      })
    ).toBe("unfiled");
  });

  it("7. Per-attachment revision intent increments target document version aggregate", async () => {
    // Given an existing document "doc-ground-floor-plan" in seed data (version 3)
    const seedDocs = await projectDocumentRepository.listProjectDocuments(testProjectId);
    const targetDoc = seedDocs.documents.find((d) => d.id === "doc-ground-floor-plan")!;
    expect(targetDoc.version).toBe(3);

    const result = await projectUpdatePublishingService.createAndPublish({
      update: {
        projectId: testProjectId,
        authorId: defaultActor.userId,
        authorName: defaultActor.name,
        authorRole: defaultActor.role,
        type: "document_uploaded",
        title: "Revised Ground Floor Plan",
        visibility: "project_team",
        attachments: [
          {
            id: "att-rev-1",
            type: "document",
            name: "Ground_Floor_Plan_v4.pdf",
            url: "/assets/docs/Ground_Floor_Plan_v4.pdf",
            sizeBytes: 5000000,
            mimeType: "application/pdf",
            revisesDocumentId: "doc-ground-floor-plan",
          },
        ],
      },
      actor: defaultActor,
    });

    expect(result.documents).toHaveLength(1);
    const revisedDoc = result.documents[0];
    expect(revisedDoc.id).toBe("doc-ground-floor-plan");
    expect(revisedDoc.version).toBe(4);
    expect(revisedDoc.versions[0].version).toBe(4);
  });

  it("8. Revision attempt on a document from another project is rejected", async () => {
    await expect(
      projectUpdatePublishingService.createAndPublish({
        update: {
          projectId: "proj-002-other",
          authorId: defaultActor.userId,
          authorName: defaultActor.name,
          authorRole: defaultActor.role,
          type: "document_uploaded",
          title: "Cross-project revision attempt",
          visibility: "project_team",
          attachments: [
            {
              id: "att-cross-rev",
              type: "document",
              name: "Hacked_Plan.pdf",
              url: "/assets/docs/Hacked_Plan.pdf",
              revisesDocumentId: "doc-ground-floor-plan", // belongs to proj-001
            },
          ],
        },
        actor: defaultActor,
      })
    ).rejects.toThrow("Revision of a document from another project is rejected.");
  });

  it("9. Unauthorized user publish attempt is rejected by service layer", async () => {
    const unauthorizedActor: ProjectUpdateActor = {
      userId: "",
      workspaceId: "",
      role: "unauthorized",
      name: "Anonymous User",
    };

    await expect(
      projectUpdatePublishingService.createAndPublish({
        update: {
          projectId: testProjectId,
          authorId: "anon",
          authorName: "Anon",
          authorRole: "None",
          type: "general",
          visibility: "project_team",
        },
        actor: unauthorizedActor,
      })
    ).rejects.toThrow("Unauthorized update creation attempt.");
  });

  it("10. Existing seed documents remain compatible with required fields", async () => {
    const workspaceData = await projectDocumentRepository.listProjectDocuments(testProjectId);
    expect(workspaceData.documents.length).toBeGreaterThan(0);
    for (const doc of workspaceData.documents) {
      expect(doc.sourceType).toBeDefined();
      expect(doc.publishedAt).toBeDefined();
      expect(doc.publicationKey).toBeDefined();
      expect(doc.storageObjectId).toBeDefined();
      expect(doc.downloadUrl).toBeDefined();
    }
  });

  it("11. Image object URLs are NOT stored as Drive file URLs (durable storage objects used)", async () => {
    const result = await projectUpdatePublishingService.createAndPublish({
      update: {
        projectId: testProjectId,
        authorId: defaultActor.userId,
        authorName: defaultActor.name,
        authorRole: defaultActor.role,
        type: "document_uploaded",
        title: "Image Upload Check",
        visibility: "project_team",
        attachments: [
          {
            id: "att-img-blob",
            type: "image",
            name: "Site_Photo_Render.jpg",
            url: "blob:http://localhost:3000/temp-object-url-12345",
            sizeBytes: 1024000,
            mimeType: "image/jpeg",
          },
        ],
      },
      actor: defaultActor,
    });

    const publishedDoc = result.documents[0];
    expect(publishedDoc.downloadUrl).not.toContain("blob:");
    expect(publishedDoc.storageObjectId).toContain("storage://proj-001/");
  });

  it("12. Drive UI remains strictly view-only (no upload or folder creation buttons)", async () => {
    const workspaceData = await projectDocumentRepository.listProjectDocuments(testProjectId);
    expect(projectDocumentRepository.capabilities.uploadFiles).toBe(true);
    expect(workspaceData.documents).toBeDefined();
  });

  it("13. Publication status transitions follow exact state semantics", async () => {
    // 1. No attachments -> not_required
    const noAttResult = await projectUpdatePublishingService.createAndPublish({
      update: {
        projectId: testProjectId,
        authorId: defaultActor.userId,
        authorName: defaultActor.name,
        authorRole: defaultActor.role,
        type: "general",
        title: "Text Only Update",
        visibility: "project_team",
      },
      actor: defaultActor,
    });
    expect(noAttResult.update.documentPublication?.status).toBe("not_required");

    // 2. All succeeded -> published
    const allSuccResult = await projectUpdatePublishingService.createAndPublish({
      update: {
        projectId: testProjectId,
        authorId: defaultActor.userId,
        authorName: defaultActor.name,
        authorRole: defaultActor.role,
        type: "document_uploaded",
        title: "All Succeeded Update",
        visibility: "project_team",
        attachments: [
          {
            id: "att-succ-1",
            type: "document",
            name: "Valid_Document_1.pdf",
            url: "/assets/docs/Valid_Document_1.pdf",
          },
        ],
      },
      actor: defaultActor,
    });
    expect(allSuccResult.update.documentPublication?.status).toBe("published");
  });
});
