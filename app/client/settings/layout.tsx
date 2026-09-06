import React from "react";
import { AppShell } from "@/components/layout/app-shell";

interface ClientSettingsRootLayoutProps {
  children: React.ReactNode;
}

export default function ClientSettingsRootLayout({ children }: ClientSettingsRootLayoutProps) {
  return (
    <AppShell>
      <div style={{ width: "100%", height: "100%", margin: 0, padding: "28px 36px 0", boxSizing: "border-box", overflow: "hidden", display: "flex", flexDirection: "column" }}>
        {children}
      </div>
    </AppShell>
  );
}
