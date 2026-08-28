import { AppShell } from "@/components/layout/app-shell";
import { ClientProvidersWorkspace } from "@/features/client/providers/components/client-providers-workspace";

export default function ClientProvidersPage() {
  return (
    <AppShell>
      <div style={{ width: "100%", margin: 0, padding: "28px 36px 60px", boxSizing: "border-box" }}>
        <ClientProvidersWorkspace />
      </div>
    </AppShell>
  );
}

