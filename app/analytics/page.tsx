import { AppShell } from "@/components/layout/app-shell";
import { RoutePageContainer } from "@/components/ui/route-page-container";

export default function AnalyticsPage() {
  return (
    <AppShell>
      <RoutePageContainer
        title="Analytics"
        description="Studio performance metrics, response times, and proposal conversion."
        primaryActionLabel="Export Report"
      />
    </AppShell>
  );
}
