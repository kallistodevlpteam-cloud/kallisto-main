import { PartnerAppShell } from "@/partner-app/layout/partner-app-shell";
import { HubModulePlaceholder } from "@/partner-app/hub/components/hub-module-placeholder";

export default function HubPurchaseOrdersPage() {
  return (
    <PartnerAppShell>
      <HubModulePlaceholder
        title="Purchase Orders (PO)"
        description="Depot replenishment purchase orders raised with primary cement, steel, electrical, and plumbing manufacturers."
        actionLabel="Raise New PO"
        actionHref="/partner/hub/purchase-orders"
        metrics={[
          { label: "Open POs", value: "3" },
          { label: "Awaiting Delivery", value: "₹8.6 L" },
          { label: "Closed This Month", value: "18" },
        ]}
      />
    </PartnerAppShell>
  );
}
