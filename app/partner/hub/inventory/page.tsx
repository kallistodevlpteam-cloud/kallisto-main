import { PartnerAppShell } from "@/partner-app/layout/partner-app-shell";
import { HubModulePlaceholder } from "@/partner-app/hub/components/hub-module-placeholder";

export default function HubInventoryPage() {
  return (
    <PartnerAppShell>
      <HubModulePlaceholder
        title="Inventory & Depot Tracking"
        description="Real-time stock counts across warehouse bays, reorder alert triggers, batch expiry tracking, and physical audit logs."
        isLocked={true}
        lockedReason="Inventory tracking and bay allocation are managed contextually within the Products catalog during Beta trials. Full independent warehouse ERP modules unlock in subsequent releases."
      />
    </PartnerAppShell>
  );
}
