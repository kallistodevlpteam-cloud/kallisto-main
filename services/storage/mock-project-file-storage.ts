export interface StoredProjectFile {
  storageObjectId: string;
  downloadUrl: string;
  projectId: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  createdAt: string;
}

class MockProjectFileStorage {
  private store = new Map<string, StoredProjectFile>();

  async uploadFile(
    projectId: string,
    file: File,
  ): Promise<{ storageObjectId: string; downloadUrl: string }> {
    const storageObjectId = `storage://${projectId}/files/${Date.now()}-${Math.random().toString(36).substring(2, 7)}-${file.name}`;
    const downloadUrl = file.type.startsWith("image/")
      ? (typeof window !== "undefined" && file instanceof File ? URL.createObjectURL(file) : `/assets/docs/${file.name}`)
      : `/assets/docs/${file.name}`;

    const record: StoredProjectFile = {
      storageObjectId,
      downloadUrl,
      projectId,
      fileName: file.name,
      mimeType: file.type || "application/octet-stream",
      sizeBytes: file.size,
      createdAt: new Date().toISOString(),
    };

    this.store.set(storageObjectId, record);
    return { storageObjectId, downloadUrl };
  }

  async uploadAttachment(
    projectId: string,
    attachment: {
      id: string;
      name: string;
      url?: string;
      sizeBytes?: number;
      mimeType?: string;
    },
  ): Promise<{ storageObjectId: string; downloadUrl: string }> {
    const storageObjectId = `storage://${projectId}/attachments/${attachment.id}-${attachment.name}`;
    const downloadUrl = attachment.url && !attachment.url.startsWith("blob:")
      ? attachment.url
      : `/assets/docs/${attachment.name}`;

    const record: StoredProjectFile = {
      storageObjectId,
      downloadUrl,
      projectId,
      fileName: attachment.name,
      mimeType: attachment.mimeType || "application/octet-stream",
      sizeBytes: attachment.sizeBytes || 1024,
      createdAt: new Date().toISOString(),
    };

    this.store.set(storageObjectId, record);
    return { storageObjectId, downloadUrl };
  }

  getFile(storageObjectId: string): StoredProjectFile | undefined {
    return this.store.get(storageObjectId);
  }
}

export const mockProjectFileStorage = new MockProjectFileStorage();
