import { StudioOutputVersion, StudioSourceInput, StudioTaskConfiguration } from "@/types/domain/studio";

export class StudioVersionService {
  static formatVersionLabel(versionNumber: number): string {
    const padded = String(versionNumber).padStart(2, "0");
    return `V${padded}`;
  }

  static createNewVersion(
    taskId: string,
    projectId: string,
    versionNumber: number,
    configuration: StudioTaskConfiguration,
    sourceInputs: StudioSourceInput[],
    userId: string,
    parentVersionId?: string
  ): StudioOutputVersion {
    const versionLabel = this.formatVersionLabel(versionNumber);
    const now = new Date().toISOString();

    return {
      id: `ver-${taskId}-${versionNumber}`,
      taskId,
      projectId,
      versionNumber,
      versionLabel,
      parentVersionId,
      configurationSnapshot: JSON.parse(JSON.stringify(configuration)),
      sourceInputSnapshots: sourceInputs.map((input) => ({
        id: input.id,
        name: input.name,
        type: input.type,
        fileUrl: input.fileUrl,
        snapshotTimestamp: now,
      })),
      createdAt: now,
      createdByUserId: userId,
    };
  }

  static assertVersionImmutable(version: StudioOutputVersion): void {
    if (version.approval?.decision === "approved" || version.publishRecord) {
      throw new Error(
        `Version ${version.versionLabel} is approved or published and cannot be modified. Create a new revision.`
      );
    }
  }
}
