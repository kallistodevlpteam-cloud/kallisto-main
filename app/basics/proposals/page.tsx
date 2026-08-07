import { Suspense } from "react";
import {
  BasicsLoadingSkeleton,
  BasicsPageHeader,
} from "@/features/basics/components/basics-shared";
import { ProposalsList } from "@/features/basics/components/proposals-list";
import styles from "@/features/basics/components/basics-workspace.module.css";

export default function ProposalsPage() {
  return (
    <div className={styles.page}>
      <BasicsPageHeader
        title="Proposals"
        description="Review proposals received for your requirements and track proposals submitted as a provider."
      />
      <Suspense fallback={<BasicsLoadingSkeleton label="Loading proposals" />}>
        <ProposalsList />
      </Suspense>
    </div>
  );
}

