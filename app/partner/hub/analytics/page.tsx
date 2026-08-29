import { PartnerAppShell } from "@/partner-app/layout/partner-app-shell";
import { HubModulePlaceholder } from "@/partner-app/hub/components/hub-module-placeholder";

export default function HubAnalyticsPage() {
  return (
    <PartnerAppShell>
      <HubModulePlaceholder
        title="Supply Chain Analytics & Demand Forecasting"
        description="Material burn rates across active projects, seasonal price fluctuation curves, depot turnover ratios, and supplier lead-time accuracy."
        actionLabel="Export Forecast Data"
        actionHref="/partner/hub/analytics"
        metrics={[
          { label: "Turnover Ratio", value: "4.8x" },
          { label: "Lead Time Accuracy", value: "98.2%" },
          { label: "Material Cost Savings", value: "11.4%" },
        ]}
      />
    </PartnerAppShell>
  );
}
