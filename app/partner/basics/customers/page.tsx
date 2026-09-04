import { PartnerAppShell } from "@/partner-app/layout/partner-app-shell";
import { BasicsModulePlaceholder } from "@/partner-app/basics/components/basics-module-placeholder";

export default function BasicsCustomersPage() {
  return (
    <PartnerAppShell>
      <BasicsModulePlaceholder
        title="Client & Customer Directory"
        description="Homeowners, commercial property managers, and practice leads with active maintenance contracts."
        actionLabel="Add Customer"
        actionHref="/partner/basics/customers"
        metrics={[
          { label: "Active Customers", value: "48" },
          { label: "Annual Contracts", value: "19" },
          { label: "Repeat Bookings", value: "72%" },
        ]}
      />
    </PartnerAppShell>
  );
}
