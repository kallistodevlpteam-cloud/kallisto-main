import Link from "next/link";
import { Suspense } from "react";
import { Plus } from "lucide-react";
import {
  BasicsLoadingSkeleton,
  BasicsPageHeader,
} from "@/features/basics/components/basics-shared";
import { RequirementsList } from "@/features/basics/components/requirements-list";
import styles from "@/features/basics/components/basics-workspace.module.css";

export default function RequirementsPage() {
  return (
    <div className={styles.page}>
      <BasicsPageHeader
        title="Requirements"
        description="Post, invite, review and award project-specific professional service scopes."
        actions={
          <Link className={styles.primaryButton} href="/basics/requirements/new">
            <Plus size={13} aria-hidden="true" />
            Post a requirement
          </Link>
        }
      />
      <Suspense fallback={<BasicsLoadingSkeleton label="Loading requirements" />}>
        <RequirementsList />
      </Suspense>
    </div>
  );
}

