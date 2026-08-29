import { PartnerAppShell } from "@/partner-app/layout/partner-app-shell";
import { HubModulePlaceholder } from "@/partner-app/hub/components/hub-module-placeholder";

export default function HubDeliveriesPage() {
  return (
    <PartnerAppShell>
      <HubModulePlaceholder
        title="Delivery & Logistics Fleet"
        description="Dispatch manifests, carrier assignments, gate passes, GPS tracking, and digital Proof of Delivery (POD) logs."
        actionLabel="Create Dispatch Manifest"
        actionHref="/partner/hub/deliveries"
        metrics={[
          { label: "Vehicles in Transit", value: "5" },
          { label: "Delivered Today", value: "8" },
          { label: "Average Delivery Time", value: "2.4 Hrs" },
        ]}
      />
    </PartnerAppShell>
  );
}
