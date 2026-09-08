import { notFound } from "next/navigation";
import { PartnerAppShell } from "@/partner-app/layout/partner-app-shell";
import { getAssignmentById } from "@/partner-app/hands/mock/assignments-mock-data";
import { AssignmentDetailPage } from "@/partner-app/hands/components/assignment-detail/assignment-detail-page";

interface HandsAssignmentDetailRouteProps {
  params: Promise<{ id: string }>;
}

export default async function HandsAssignmentDetailRoute({
  params,
}: HandsAssignmentDetailRouteProps) {
  const resolvedParams = await params;
  const assignmentId = resolvedParams.id;

  const assignment = getAssignmentById(assignmentId);
  if (!assignment) {
    notFound();
  }

  return (
    <PartnerAppShell>
      <AssignmentDetailPage assignment={assignment} />
    </PartnerAppShell>
  );
}
