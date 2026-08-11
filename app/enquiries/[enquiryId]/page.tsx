import { Suspense } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { RoutePageContainer } from "@/components/ui/route-page-container";
import {
  EnquiryDetailWorkspace,
  EnquiryDetailSkeleton,
} from "@/features/enquiries/detail/components/enquiry-detail-workspace";

interface EnquiryDetailPageProps {
  params: Promise<{ enquiryId: string }>;
}

export default async function EnquiryDetailPage({ params }: EnquiryDetailPageProps) {
  const resolvedParams = await params;
  return (
    <AppShell layoutProfile="project-dashboard">
      <Suspense fallback={<EnquiryDetailSkeleton />}>
        <EnquiryDetailWorkspace
          key={resolvedParams.enquiryId}
          enquiryId={resolvedParams.enquiryId}
        />
      </Suspense>
    </AppShell>
  );
}
