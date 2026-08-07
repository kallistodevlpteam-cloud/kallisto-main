export interface BuildMetadata {
  buildId: string;
  commitId: string;
  appVersion: string;
  isAvailable: boolean;
}

export function getBuildMetadata(): BuildMetadata {
  const buildId = process.env.NEXT_PUBLIC_BUILD_ID || process.env.BUILD_ID;
  const commitId = process.env.NEXT_PUBLIC_COMMIT_ID || process.env.COMMIT_ID;
  const appVersion = process.env.NEXT_PUBLIC_APP_VERSION || process.env.APP_VERSION;

  const isAvailable = !!(buildId && commitId && appVersion);

  return {
    buildId: buildId || "Unknown",
    commitId: commitId || "Unknown",
    appVersion: appVersion || "Unknown",
    isAvailable,
  };
}
