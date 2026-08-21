import { AppShell } from "@/components/layout/app-shell";
import { HomeWorkspace } from "@/features/home";

export default function RootHomePage() {
  return (
    <AppShell layoutProfile="project-dashboard">
      <HomeWorkspace />
    </AppShell>
  );
}
