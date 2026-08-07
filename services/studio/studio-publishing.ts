import { StudioOutputVersion, StudioPublishRecord } from "@/types/domain/studio";

export class StudioPublishingService {
  private static publishedRecordCache: Map<string, StudioPublishRecord> = new Map();

  static publishVersion(
    version: StudioOutputVersion,
    projectId: string,
    publisherId: string,
    publisherName: string,
    idempotencyKey: string
  ): StudioPublishRecord {
    // Idempotency check: if already published with this idempotency key, return existing record
    const cacheKey = `${version.id}-${idempotencyKey}`;
    const existing = this.publishedRecordCache.get(cacheKey);
    if (existing) {
      return existing;
    }

    if (version.publishRecord) {
      return version.publishRecord;
    }

    const publishRecord: StudioPublishRecord = {
      id: `pub-${version.id}-${Date.now()}`,
      taskId: version.taskId,
      versionId: version.id,
      projectId,
      publisherId,
      publisherName,
      publishedAt: new Date().toISOString(),
      idempotencyKey,
      documentRef: `DOC-KAL-${version.projectId.toUpperCase()}-${version.versionLabel}`,
    };

    this.publishedRecordCache.set(cacheKey, publishRecord);
    return publishRecord;
  }
}
