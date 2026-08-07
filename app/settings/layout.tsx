import React from "react";
import { AppShell } from "@/components/layout/app-shell";
import { SettingsLayout } from "@/components/layout/settings-layout";

interface SettingsRootLayoutProps {
  children: React.ReactNode;
}

export default function SettingsRootLayout({ children }: SettingsRootLayoutProps) {
  return (
    <AppShell>
      <SettingsLayout>{children}</SettingsLayout>
    </AppShell>
  );
}
