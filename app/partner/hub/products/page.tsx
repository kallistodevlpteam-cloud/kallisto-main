import { PartnerAppShell } from "@/partner-app/layout/partner-app-shell";
import { HubProductsWorkspace } from "@/partner-app/hub/components/hub-products-workspace";

export default function HubProductsPage() {
  return (
    <PartnerAppShell>
      <HubProductsWorkspace />
    </PartnerAppShell>
  );
}
