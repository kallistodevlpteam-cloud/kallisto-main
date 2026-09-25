"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  X,
  Building2,
  MapPin,
  Calendar,
  Users,
  ShieldCheck,
  Sparkles,
  Phone,
  FileText,
  ExternalLink,
  Activity,
  DollarSign,
} from "lucide-react";
import { HandsProjectRecord } from "../../types/project-domain";

interface HandsProjectDrawerProps {
  project: HandsProjectRecord | null;
  isOpen: boolean;
  onClose: () => void;
}

const FALLBACK_IMAGE = "/assets/projects/greenfield-villa.png";

export function HandsProjectDrawer({
  project,
  isOpen,
  onClose,
}: HandsProjectDrawerProps) {
  const [imgSrc, setImgSrc] = React.useState<string>(project?.coverImage || FALLBACK_IMAGE);

  React.useEffect(() => {
    if (project?.coverImage) {
      setImgSrc(project.coverImage);
    }
  }, [project?.coverImage]);

  if (!isOpen || !project) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 999,
        display: "flex",
        justifyContent: "flex-end",
        backgroundColor: "rgba(15, 23, 42, 0.45)",
        backdropFilter: "blur(4px)",
        animation: "fadeIn 0.2s ease-out",
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "520px",
          height: "100%",
          backgroundColor: "#ffffff",
          boxShadow: "-4px 0 24px rgba(15, 23, 42, 0.15)",
          display: "flex",
          flexDirection: "column",
          overflowY: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header Image & Close */}
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "180px",
            backgroundColor: "#0f172a",
          }}
        >
          <Image
            src={imgSrc}
            alt={project.projectName}
            fill
            style={{ objectFit: "cover", opacity: 0.85 }}
            onError={() => setImgSrc(FALLBACK_IMAGE)}
          />
          <button
            type="button"
            onClick={onClose}
            style={{
              position: "absolute",
              top: "14px",
              right: "14px",
              width: "32px",
              height: "32px",
              borderRadius: "9999px",
              backgroundColor: "rgba(15, 23, 42, 0.65)",
              color: "#ffffff",
              border: "none",
              display: "grid",
              placeItems: "center",
              cursor: "pointer",
              backdropFilter: "blur(4px)",
            }}
          >
            <X size={16} />
          </button>

          <div
            style={{
              position: "absolute",
              bottom: "16px",
              left: "16px",
              right: "16px",
              color: "#ffffff",
            }}
          >
            <span
              style={{
                fontSize: "11px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                backgroundColor: "rgba(255,255,255,0.2)",
                padding: "2px 8px",
                borderRadius: "4px",
                backdropFilter: "blur(4px)",
              }}
            >
              {project.category}
            </span>
            <h2
              style={{
                margin: "6px 0 2px",
                fontSize: "20px",
                fontWeight: 750,
                letterSpacing: "-0.02em",
                textShadow: "0 1px 3px rgba(0,0,0,0.5)",
              }}
            >
              {project.projectName}
            </h2>
            <div style={{ fontSize: "13px", opacity: 0.9, display: "flex", alignItems: "center", gap: "6px" }}>
              <span>{project.clientName}</span>
              <span>·</span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "3px" }}>
                <MapPin size={12} /> {project.location}
              </span>
            </div>
          </div>
        </div>

        {/* Drawer Content */}
        <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "20px", flex: 1 }}>
          {/* Odin AI Brief */}
          {project.odinBrief && (
            <div
              style={{
                padding: "14px",
                borderRadius: "12px",
                backgroundColor: "#f0fdf4",
                border: "1px solid #bbf7d0",
                display: "flex",
                flexDirection: "column",
                gap: "6px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#166534", fontSize: "12px", fontWeight: 700 }}>
                <Sparkles size={14} color="#16a34a" />
                <span>ODIN SITE INTELLIGENCE</span>
              </div>
              <p style={{ margin: 0, fontSize: "12.5px", color: "#14532d", lineHeight: 1.5 }}>
                {project.odinBrief}
              </p>
            </div>
          )}

          {/* Quick Metrics Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px" }}>
            <div style={{ padding: "12px", backgroundColor: "#f8fafc", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
              <div style={{ fontSize: "11px", color: "#64748b", fontWeight: 500 }}>Shift Timeline</div>
              <div style={{ fontSize: "13.5px", fontWeight: 700, color: "#0f172a", marginTop: "2px" }}>
                Day {project.currentDay} of {project.totalDays} Shifts
              </div>
              <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>
                {project.startDate} – {project.endDate}
              </div>
            </div>

            <div style={{ padding: "12px", backgroundColor: "#f8fafc", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
              <div style={{ fontSize: "11px", color: "#64748b", fontWeight: 500 }}>Daily Billing Value</div>
              <div style={{ fontSize: "13.5px", fontWeight: 700, color: "#0f172a", marginTop: "2px" }}>
                ₹{project.dailyBillingRate.toLocaleString("en-IN")} / day
              </div>
              <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>
                Total: ₹{project.totalContractValue.toLocaleString("en-IN")}
              </div>
            </div>
          </div>

          {/* Supervisor Card */}
          <div style={{ padding: "14px", backgroundColor: "#f8fafc", borderRadius: "12px", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              {project.supervisor.avatar ? (
                <Image
                  src={project.supervisor.avatar}
                  alt={project.supervisor.name}
                  width={36}
                  height={36}
                  style={{ borderRadius: "9999px", objectFit: "cover" }}
                />
              ) : (
                <div style={{ width: 36, height: 36, borderRadius: "9999px", backgroundColor: "#e2e8f0", display: "grid", placeItems: "center", fontWeight: 700, color: "#475569" }}>
                  {project.supervisor.name[0]}
                </div>
              )}
              <div>
                <div style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a" }}>{project.supervisor.name}</div>
                <div style={{ fontSize: "11.5px", color: "#64748b" }}>Assigned Site Supervisor</div>
              </div>
            </div>

            <a
              href={`tel:${project.supervisor.phone}`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                padding: "6px 12px",
                borderRadius: "8px",
                backgroundColor: "#ffffff",
                border: "1px solid #cbd5e1",
                fontSize: "12px",
                fontWeight: 600,
                color: "#0f172a",
                textDecoration: "none",
              }}
            >
              <Phone size={13} />
              <span>Call</span>
            </a>
          </div>

          {/* Assigned Crew List */}
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
              <h3 style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: "#0f172a" }}>
                Assigned Trade Crew ({project.crew.length})
              </h3>
              <span style={{ fontSize: "12px", color: "#059669", fontWeight: 600 }}>
                {project.attendance.present} Present
              </span>
            </div>

            {project.crew.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {project.crew.map((w) => (
                  <div
                    key={w.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "8px 12px",
                      borderRadius: "8px",
                      backgroundColor: "#f8fafc",
                      border: "1px solid #f1f5f9",
                      fontSize: "12.5px",
                    }}
                  >
                    <div>
                      <strong style={{ color: "#0f172a" }}>{w.name}</strong>
                      <span style={{ color: "#64748b", marginLeft: "6px" }}>
                        ({w.trade} · {w.level})
                      </span>
                    </div>

                    <span
                      style={{
                        padding: "2px 6px",
                        borderRadius: "4px",
                        fontSize: "11px",
                        fontWeight: 600,
                        backgroundColor: w.status === "Present" ? "#ecfdf5" : "#fef2f2",
                        color: w.status === "Present" ? "#047857" : "#b91c1c",
                      }}
                    >
                      {w.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ fontSize: "12.5px", color: "#64748b", fontStyle: "italic" }}>
                No specific crew roster assigned yet for this stage.
              </div>
            )}
          </div>
        </div>

        {/* Drawer Footer CTA */}
        <div style={{ padding: "16px 20px", borderTop: "1px solid #e2e8f0", backgroundColor: "#fafafa" }}>
          <Link
            href={`/partner/hands/projects/${project.id}`}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              width: "100%",
              height: "40px",
              borderRadius: "8px",
              backgroundColor: "#0f172a",
              color: "#ffffff",
              fontSize: "13px",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            <span>Open Full Site Workspace</span>
            <ExternalLink size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
