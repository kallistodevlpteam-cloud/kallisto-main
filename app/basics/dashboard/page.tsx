import { Suspense } from "react";
import { BasicsDashboardWorkspace } from "@/features/basics/components/basics-dashboard-workspace";
import { BasicsLoadingSkeleton } from "@/features/basics/components/basics-shared";
import styles from "@/features/basics/components/basics-workspace.module.css";

export default async function BasicsDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ projectId?: string }>;
}) {
  const query = await searchParams;

  return (
    <div className={styles.profilePage}>
      <Suspense fallback={<BasicsLoadingSkeleton label="Loading Basics dashboard" />}>
        <BasicsDashboardWorkspace projectId={query.projectId} />
      </Suspense>
    </div>
  );
}
