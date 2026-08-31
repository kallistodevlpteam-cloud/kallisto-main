import { PartnerAppShell } from "@/partner-app/layout/partner-app-shell";
import { HandsRequestsWorkspace } from "@/partner-app/hands/components/requests/hands-requests-workspace";

export const metadata = {
  title: "Workforce Requests | Kallisto Hands",
  description: "Review incoming workforce demand requirements and respond to project needs in real time.",
};

export default function HandsRequestsPage() {
  return (
    <PartnerAppShell>
      <HandsRequestsWorkspace />
    </PartnerAppShell>
  );
}
