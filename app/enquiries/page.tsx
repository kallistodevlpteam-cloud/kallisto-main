import { Suspense } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { RoutePageContainer } from "@/components/ui/route-page-container";
import { EnquiriesWorkspace, EnquiriesSkeleton } from "@/features/enquiries/components/enquiries-workspace";

export default function EnquiriesPage() {
  return (
    <AppShell>
      <RoutePageContainer
        title="Enquiries"
        description="Review and qualify incoming project leads and requirement reviews."
        showHeading={false}
        containerClassName="enquiries-page-container"
      >
        <Suspense fallback={<EnquiriesSkeleton />}>
          <EnquiriesWorkspace />
        </Suspense>
      </RoutePageContainer>
    </AppShell>
  );
}
