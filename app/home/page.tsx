import { AppShell } from "@/components/layout/app-shell";
import { HomeWorkspace } from "@/features/home";

export default function HomePage() {
  return (
    <AppShell>
      <HomeWorkspace />
    </AppShell>
  );
}
