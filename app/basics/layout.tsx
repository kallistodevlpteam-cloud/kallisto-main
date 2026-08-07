import { AppShell } from "@/components/layout/app-shell";
import { BasicsWorkspaceShell } from "@/features/basics/components/basics-workspace-shell";

export default function BasicsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <AppShell>
      <BasicsWorkspaceShell>{children}</BasicsWorkspaceShell>
    </AppShell>
  );
}

