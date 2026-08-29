import { PartnerAppShell } from "@/partner-app/layout/partner-app-shell";
import { HubModulePlaceholder } from "@/partner-app/hub/components/hub-module-placeholder";

export default function HubSuppliersPage() {
  return (
    <PartnerAppShell>
      <HubModulePlaceholder
        title="Suppliers & Manufacturer Directory"
        description="Authorized wholesale distributors, manufacturer contracts, credit terms, and delivery performance metrics."
        isLocked={true}
        lockedReason="Supplier records and brands are linked directly to each material SKU within the Products catalog during Beta trials. Dedicated multi-vendor procurement unlocks in subsequent releases."
      />
    </PartnerAppShell>
  );
}
