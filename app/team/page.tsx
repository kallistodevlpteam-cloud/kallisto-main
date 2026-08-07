import { AppShell } from "@/components/layout/app-shell";
import { TeamPage as TeamWorkspacePage } from "@/features/team/components/team-page";

export default function TeamPage() {
  return (
    <AppShell>
      <TeamWorkspacePage />
    </AppShell>
  );
}
