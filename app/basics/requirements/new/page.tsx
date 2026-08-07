import { Suspense } from "react";
import { RequirementWizard } from "@/features/basics/components/requirement-wizard";
import {
  BasicsLoadingSkeleton,
  BasicsPageHeader,
} from "@/features/basics/components/basics-shared";
import { listBasicsProjectContexts } from "@/features/basics/repositories/basics-repositories";
import styles from "@/features/basics/components/basics-workspace.module.css";

export default async function NewRequirementPage() {
  const projects = await listBasicsProjectContexts();
  return (
    <div className={styles.page}>
      <BasicsPageHeader
        title="Post a Requirement"
        description="Create a structured specialist scope, set commercial expectations and choose who can respond."
      />
      <Suspense fallback={<BasicsLoadingSkeleton label="Loading requirement wizard" />}>
        <RequirementWizard projects={projects} />
      </Suspense>
    </div>
  );
}

