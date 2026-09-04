import { Suspense } from "react";
import type { Metadata } from "next";
import { AppShell } from "@/components/layout/app-shell";
import { PortfolioAddProjectPage } from "@/features/portfolio/components/add-project/portfolio-add-project-page";

export const metadata: Metadata = {
  title: "Add Project — Portfolio | Kallisto",
  description: "Publish a new architectural project to your Kallisto portfolio.",
};

export default function NewPortfolioProjectRoute() {
  return (
    <AppShell>
      <div style={{ padding: 0, margin: 0, width: "100%" }}>
        <Suspense fallback={<div aria-label="Loading form..." />}>
          <PortfolioAddProjectPage />
        </Suspense>
      </div>
    </AppShell>
  );
}
