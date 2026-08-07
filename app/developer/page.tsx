import { AppShell } from "@/components/layout/app-shell";
import { DatabaseSchemaViewer } from "@/developer-console/database-schema/schema-viewer";

export default function DeveloperPage() {
  return (
    <AppShell>
      <DatabaseSchemaViewer />
    </AppShell>
  );
}