import { Suspense } from "react";
import { AppShell } from "@/components/layout/app-shell";
import {
  EnquiryDetailWorkspace,
  EnquiryDetailSkeleton,
} from "@/features/enquiries/detail/components/enquiry-detail-workspace";

interface ClientEnquiryDetailPageProps {
  params: Promise<{ enquiryId: string }>;
}

export default async function ClientEnquiryDetailPage({ params }: ClientEnquiryDetailPageProps) {
  const resolvedParams = await params;
  return (
    <AppShell layoutProfile="project-dashboard">
      <Suspense fallback={<EnquiryDetailSkeleton />}>
        <EnquiryDetailWorkspace enquiryId={resolvedParams.enquiryId} />
      </Suspense>
    </AppShell>
  );
}
