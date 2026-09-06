import { AppShell } from "@/components/layout/app-shell";
import { RoutePageContainer } from "@/components/ui/route-page-container";

export default function ClientHelpPage() {
  return (
    <AppShell>
      <RoutePageContainer
        title="Help & Support"
        category="Client Portal"
        description="Get assistance, read project delivery guides, and contact Kallisto concierge support."
      >
        <div style={{ padding: "8px 0" }}>
          {/* Foundation placeholder - features to be developed */}
        </div>
      </RoutePageContainer>
    </AppShell>
  );
}
