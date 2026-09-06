import { ClientSettingsLayout } from "@/features/client/settings/components/client-settings-layout";
import { PaymentMethodsSection } from "@/features/client/settings/components/sections/payment-methods-section";

export default function ClientPaymentMethodsPage() {
  return (
    <ClientSettingsLayout>
      <PaymentMethodsSection />
    </ClientSettingsLayout>
  );
}
