import { Suspense } from "react";
import {
  BasicsLoadingSkeleton,
  BasicsPageHeader,
} from "@/features/basics/components/basics-shared";
import { EngagementsList } from "@/features/basics/components/engagements-list";
import styles from "@/features/basics/components/basics-workspace.module.css";

export default function EngagementsPage() {
  return (
    <div className={styles.page}>
      <BasicsPageHeader
        title="Engagements"
        description="Track specialist scope, deliverables, milestones, approvals and evidence-backed payment status."
      />
      <Suspense fallback={<BasicsLoadingSkeleton label="Loading engagements" />}>
        <EngagementsList />
      </Suspense>
    </div>
  );
}

