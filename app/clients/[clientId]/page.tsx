import { redirect } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { projectService } from "@/services/repositories/project-service";
import { ChevronRight } from "lucide-react";
import styles from "@/features/projects/projects.module.css";

interface ClientDetailPageProps {
  params: Promise<{ clientId: string }>;
}

export default async function ClientDetailPage({ params }: ClientDetailPageProps) {
  const resolvedParams = await params;
  const clientId = resolvedParams.clientId;

  const client = await projectService.getClientById("ws-default", clientId);
  const clientProjects = await projectService.getProjects("ws-default", { clientId });

  if (!client) {
    redirect("/projects");
  }

  // If client has exactly 1 project, redirect directly to that project's Client tab
  if (clientProjects.length === 1) {
    redirect(`/projects/${clientProjects[0].id}?tab=client`);
  }

  // Otherwise, render lightweight internal client summary view
  return (
    <AppShell>
      <div className="workspace-container" style={{ padding: "24px", maxWidth: "900px" }}>
        <nav aria-label="Breadcrumb" style={{ fontSize: "12.5px", color: "var(--muted)", marginBottom: "12px" }}>
          <ol style={{ display: "flex", alignItems: "center", gap: "6px", listStyle: "none", padding: 0, margin: 0 }}>
            <li>
              <Link href="/home" style={{ color: "var(--muted)" }}>
                Kallisto
              </Link>
            </li>
            <li>/</li>
            <li>
              <Link href="/projects" style={{ color: "var(--muted)" }}>
                Projects
              </Link>
            </li>
            <li>/</li>
            <li style={{ color: "var(--ink)", fontWeight: 600 }}>{client.name}</li>
          </ol>
        </nav>

        <div style={{ background: "var(--surface)", border: "1px solid var(--line-strong)", borderRadius: "var(--radius-md)", padding: "24px" }}>
          <span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "var(--muted)" }}>
            Client Record Summary
          </span>
          <h1 style={{ margin: "4px 0 2px", fontSize: "22px", fontWeight: 750 }}>{client.name}</h1>
          {client.organisationName && (
            <p style={{ margin: "0 0 16px", fontSize: "13.5px", color: "var(--muted)" }}>{client.organisationName}</p>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginTop: "16px" }}>
            <div>
              <strong style={{ fontSize: "12px", color: "var(--muted)", textTransform: "uppercase" }}>Contact Details</strong>
              <p style={{ margin: "4px 0 0", fontSize: "13px" }}>Email: {client.contactDetails.email}</p>
              <p style={{ margin: "2px 0 0", fontSize: "13px" }}>Phone: {client.contactDetails.phone}</p>
            </div>
            <div>
              <strong style={{ fontSize: "12px", color: "var(--muted)", textTransform: "uppercase" }}>Billing & Location</strong>
              <p style={{ margin: "4px 0 0", fontSize: "13px" }}>Address: {client.billingAddress}</p>
            </div>
          </div>

          <div style={{ marginTop: "24px" }}>
            <h3 style={{ margin: "0 0 12px", fontSize: "15px", fontWeight: 700 }}>Associated Projects ({clientProjects.length})</h3>
            {clientProjects.length === 0 ? (
              <p style={{ fontSize: "13px", color: "var(--muted)" }}>No projects associated with this client yet.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {clientProjects.map((p) => (
                  <Link
                    key={p.id}
                    href={`/projects/${p.id}`}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "12px 16px",
                      background: "var(--surface-subtle)",
                      border: "1px solid var(--line)",
                      borderRadius: "var(--radius-sm)",
                      textDecoration: "none",
                      color: "inherit",
                    }}
                  >
                    <div>
                      <strong style={{ fontSize: "14px" }}>{p.name}</strong> ({p.projectCode})
                      <span style={{ display: "block", fontSize: "12px", color: "var(--muted)" }}>
                        Status: {p.status} · Phase: {p.phase}
                      </span>
                    </div>
                    <ChevronRight size={16} />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
