import { AppShell } from "@/components/layout/app-shell";
import { RoutePageContainer } from "@/components/ui/route-page-container";

export default function ToolsPage() {
  return (
    <AppShell>
      <RoutePageContainer
        title="More Tools"
        description="Additional integrations, calculation utilities, and workspace extensions."
        primaryActionLabel="Add Extension"
      />
    </AppShell>
  );
}
