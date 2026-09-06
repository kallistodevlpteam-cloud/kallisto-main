import { PartnerAppShell } from "@/partner-app/layout/partner-app-shell";
import { HubOrdersWorkspace } from "@/partner-app/hub/components/hub-orders-workspace";

export const metadata = {
  title: "Orders | Kallisto Hub",
  description: "Manage incoming contractor material requests and active orders.",
};

export default function HubOrdersPage() {
  return (
    <PartnerAppShell>
      <HubOrdersWorkspace />
    </PartnerAppShell>
  );
}
