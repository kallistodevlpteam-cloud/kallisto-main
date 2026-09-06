import { ClientSettingsLayout } from "@/features/client/settings/components/client-settings-layout";
import { BillingInvoicesSection } from "@/features/client/settings/components/sections/billing-invoices-section";

export default function ClientBillingInvoicesPage() {
  return (
    <ClientSettingsLayout>
      <BillingInvoicesSection />
    </ClientSettingsLayout>
  );
}
