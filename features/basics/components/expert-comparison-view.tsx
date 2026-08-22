"use client";

import {
  AnalyticsDuotoneIcon,
  BasicsDuotoneIcon,
  CalendarDuotoneIcon,
  DocumentsDuotoneIcon,
  EnquiriesDuotoneIcon,
  HandsDuotoneIcon,
  HomeDuotoneIcon,
  HubDuotoneIcon,
  PaymentsDuotoneIcon,
  PortfolioDuotoneIcon,
  ProjectsDuotoneIcon,
  SpreadsheetDuotoneIcon,
  StudioDuotoneIcon,
  TeamDuotoneIcon,
} from "@/components/layout/sidebar-icons";
import { BadgeCheck, Globe, Sparkles, Star, X } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { basicsProviderRepository } from "../repositories/basics-repositories";
import type { BasicsProvider } from "../types/basics.types";
import {
  availabilityLabels,
  formatCurrency,
  pricingLabels,
  verificationLabels,
} from "../utils/basics-formatters";
import { BasicsLoadingSkeleton } from "./basics-shared";
import { ProviderLogoTile } from "./provider-logo-tile";
import styles from "./basics-workspace.module.css";

export function ExpertComparisonView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawIds = searchParams.get("ids") || searchParams.get("compare") || "";
  const providerIds = rawIds.split(",").filter(Boolean);
  const projectId = searchParams.get("projectId") ?? undefined;

  const [providers, setProviders] = useState<BasicsProvider[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const list = await Promise.all(
          providerIds.map((id) => basicsProviderRepository.getProvider(id)),
        );
        if (!cancelled) {
          setProviders(list.filter((p): p is BasicsProvider => Boolean(p)));
        }
      } catch {
        if (!cancelled) setProviders([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    if (providerIds.length > 0) {
      void load();
    } else {
      setProviders([]);
      setLoading(false);
    }
    return () => {
      cancelled = true;
    };
  }, [rawIds]);

  function removeProvider(id: string) {
    const updated = providerIds.filter((pId) => pId !== id);
    const params = new URLSearchParams();
    if (updated.length > 0) params.set("ids", updated.join(","));
    if (projectId) params.set("projectId", projectId);
    router.push(params.toString() ? `/basics/experts/compare?${params.toString()}` : `/basics/experts/compare`);
  }

  if (loading) {
    return (
      <div className={styles.page}>
        <BasicsLoadingSkeleton label="Loading specialist comparison matrix" />
      </div>
    );
  }

  if (providers.length < 2) {
    return (
      <div className={styles.page} style={{ gap: "24px", width: "100%", margin: "0" }}>
        <div className={styles.comparisonEmptyState} style={{ maxWidth: "680px" }}>
          <div className={styles.comparisonEmptyIconWrap}>
            <Sparkles size={28} className={styles.comparisonEmptyIcon} />
          </div>
          <h2 style={{ margin: "0 0 6px", fontSize: "18px", fontWeight: "750", color: "#0f172a" }}>
            Select at least 2 specialists to compare
          </h2>
          <p style={{ margin: "0 0 18px", color: "#64748b", fontSize: "13.5px", maxWidth: "460px", textAlign: "left", lineHeight: "1.5" }}>
            Choose up to 3 verified architecture, engineering, or consulting specialists from the directory to review their pricing, experience, software, and delivery credentials side-by-side.
          </p>
          <Link href={`/basics/experts${projectId ? `?projectId=${projectId}` : ""}`} className={styles.primaryButton}>
            <span>Browse Experts Directory</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page} style={{ gap: "20px", width: "100%", margin: "0" }}>
      {/* Top Header */}
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <h1 style={{ margin: 0, fontSize: "22px", fontWeight: "800", color: "#0f172a", letterSpacing: "-0.02em" }}>
              Compare Specialists ({providers.length})
            </h1>
            <p style={{ margin: "3px 0 0", color: "#64748b", fontSize: "13.5px" }}>
              Side-by-side technical capabilities, verified credentials, pricing models, and past delivery track record.
            </p>
          </div>
        </div>
      </div>

      {/* Comparison Table / Matrix */}
      <div className={styles.compareMatrixWrap}>
        <div
          className={styles.compareGrid}
          style={{ gridTemplateColumns: `190px repeat(${providers.length}, 290px) minmax(0, 1fr)` }}
        >
          {/* Row 1: Brand / Studio Logo */}
          <div className={styles.compareRowLabelCell} style={{ alignItems: "flex-start", paddingTop: "20px" }}>
            <PortfolioDuotoneIcon size={16} className={styles.compareRowDuotoneIcon} />
            <span>Brand</span>
          </div>
          {providers.map((provider) => (
            <div key={provider.id} className={styles.compareDataCell} style={{ padding: "0 16px 16px" }}>
              <div className={styles.compareLogoWrap}>
                <button
                  type="button"
                  className={styles.compareRemoveBtn}
                  onClick={() => removeProvider(provider.id)}
                  title={`Remove ${provider.name} from comparison`}
                  aria-label={`Remove ${provider.name}`}
                >
                  <X size={12} aria-hidden="true" />
                </button>
                <ProviderLogoTile name={provider.name} />
              </div>
            </div>
          ))}
          <div className={styles.compareFillerCell} />

          {/* Row 2: Brand Title / Name */}
          <div className={styles.compareRowLabelCell}>
            <EnquiriesDuotoneIcon size={16} className={styles.compareRowDuotoneIcon} />
            <span>Brand Title</span>
          </div>
          {providers.map((provider) => (
            <div key={provider.id} className={styles.compareDataCell}>
              <h3 className={styles.compareHeaderName}>
                <Link href={`/basics/experts/${provider.id}${projectId ? `?projectId=${projectId}` : ""}`}>
                  {provider.name}
                </Link>
              </h3>
            </div>
          ))}
          <div className={styles.compareFillerCell} />

          {/* Row 3: Domain / Specialization */}
          <div className={styles.compareRowLabelCell}>
            <BasicsDuotoneIcon size={16} className={styles.compareRowDuotoneIcon} />
            <span>Domain</span>
          </div>
          {providers.map((provider) => (
            <div key={provider.id} className={styles.compareDataCell}>
              <span style={{ color: "#334155", fontSize: "13px", fontWeight: "600" }}>
                {provider.specializations[0] ?? (provider.companyName && provider.companyName !== provider.name ? provider.companyName : "Specialist")}
              </span>
            </div>
          ))}
          <div className={styles.compareFillerCell} />

          {/* Row 4: Rate / Pricing */}
          <div className={styles.compareRowLabelCell}>
            <PaymentsDuotoneIcon size={16} className={styles.compareRowDuotoneIcon} />
            <span>Rate</span>
          </div>
          {providers.map((provider) => (
            <div key={provider.id} className={styles.compareDataCell}>
              <div className={styles.comparePriceRow} style={{ margin: 0 }}>
                <span className={styles.comparePriceAmount}>
                  {provider.pricing.startingFrom
                    ? formatCurrency(provider.pricing.startingFrom, provider.pricing.currency)
                    : "Custom"}
                </span>
                <span className={styles.comparePriceSubtext}>
                  {pricingLabels[provider.pricing.model] || "Fixed fee"}
                </span>
              </div>
            </div>
          ))}
          <div className={styles.compareFillerCell} />

          {/* Section 1: Overview & Rating */}
          <div className={styles.compareSectionDivider} style={{ gridColumn: `1 / -1` }}>
            <span>Overview & Rating</span>
          </div>

          {/* Row: Rating */}
          <div className={styles.compareRowLabelCell}>
            <AnalyticsDuotoneIcon size={16} className={styles.compareRowDuotoneIcon} />
            <span>Rating</span>
          </div>
          {providers.map((p) => (
            <div key={p.id} className={styles.compareDataCell}>
              <span className={styles.compareRatingBadge}>
                <Star size={11} fill="#eab308" color="#eab308" aria-hidden="true" />
                <strong className={styles.compareRatingValue}>{p.rating.toFixed(1)}</strong>
                <span className={styles.compareRatingCount}>({p.reviewCount} reviews)</span>
              </span>
            </div>
          ))}
          <div className={styles.compareFillerCell} />

          {/* Row: Experience */}
          <div className={styles.compareRowLabelCell}>
            <CalendarDuotoneIcon size={16} className={styles.compareRowDuotoneIcon} />
            <span>Experience</span>
          </div>
          {providers.map((p) => (
            <div key={p.id} className={styles.compareDataCell}>
              <strong style={{ fontSize: "13.5px", color: "#0f172a" }}>{p.yearsOfExperience} years</strong>
            </div>
          ))}
          <div className={styles.compareFillerCell} />

          {/* Row: Completed Consults */}
          <div className={styles.compareRowLabelCell}>
            <TeamDuotoneIcon size={16} className={styles.compareRowDuotoneIcon} />
            <span>Completed Consults</span>
          </div>
          {providers.map((p) => (
            <div key={p.id} className={styles.compareDataCell}>
              <strong style={{ fontSize: "13.5px", color: "#0f172a" }}>{p.completedEngagements}+ projects</strong>
            </div>
          ))}
          <div className={styles.compareFillerCell} />

          {/* Row: Verification Level */}
          <div className={styles.compareRowLabelCell}>
            <HandsDuotoneIcon size={16} className={styles.compareRowDuotoneIcon} />
            <span>Verification</span>
          </div>
          {providers.map((p) => (
            <div key={p.id} className={styles.compareDataCell}>
              <span className={styles.compareBadgePill}>
                <BadgeCheck size={12} style={{ color: "#0284c7" }} />
                <span>{verificationLabels[p.verificationLevel] || "Verified"}</span>
              </span>
            </div>
          ))}
          <div className={styles.compareFillerCell} />

          {/* Section 2: Location & Availability */}
          <div className={styles.compareSectionDivider} style={{ gridColumn: `1 / -1` }}>
            <span>Location & Availability</span>
          </div>

          {/* Row: Location */}
          <div className={styles.compareRowLabelCell}>
            <HomeDuotoneIcon size={16} className={styles.compareRowDuotoneIcon} />
            <span>Location</span>
          </div>
          {providers.map((p) => (
            <div key={p.id} className={styles.compareDataCell}>
              <span>{p.location.city}, {p.location.state}</span>
            </div>
          ))}
          <div className={styles.compareFillerCell} />

          {/* Row: Availability */}
          <div className={styles.compareRowLabelCell}>
            <CalendarDuotoneIcon size={16} className={styles.compareRowDuotoneIcon} />
            <span>Availability</span>
          </div>
          {providers.map((p) => (
            <div key={p.id} className={styles.compareDataCell}>
              <span style={{ fontSize: "12px", fontWeight: "600", color: p.availability === "available_now" ? "#166534" : "#475569" }}>
                {availabilityLabels[p.availability]}
              </span>
            </div>
          ))}
          <div className={styles.compareFillerCell} />

          {/* Row: Remote / Onsite */}
          <div className={styles.compareRowLabelCell}>
            <HubDuotoneIcon size={16} className={styles.compareRowDuotoneIcon} />
            <span>Work Model</span>
          </div>
          {providers.map((p) => (
            <div key={p.id} className={styles.compareDataCell}>
              <div style={{ display: "flex", flexDirection: "column", gap: "2px", fontSize: "11.5px" }}>
                <span>{p.remoteAvailable ? "✓ Remote consulting" : "✕ No remote"}</span>
                <span>{p.onsiteAvailable ? "✓ On-site visits available" : "✕ Remote only"}</span>
              </div>
            </div>
          ))}
          <div className={styles.compareFillerCell} />

          {/* Section 3: Technical Skills & Compliance */}
          <div className={styles.compareSectionDivider} style={{ gridColumn: `1 / -1` }}>
            <span>Technical Skills & Compliance</span>
          </div>

          {/* Row: Software Skills */}
          <div className={styles.compareRowLabelCell}>
            <SpreadsheetDuotoneIcon size={16} className={styles.compareRowDuotoneIcon} />
            <span>Software Skills</span>
          </div>
          {providers.map((p) => (
            <div key={p.id} className={styles.compareDataCell}>
              <div className={styles.compareTagCloud}>
                {p.softwareSkills.map((tool) => (
                  <span key={tool} className={styles.compareTag}>{tool}</span>
                ))}
              </div>
            </div>
          ))}
          <div className={styles.compareFillerCell} />

          {/* Row: Building Codes */}
          <div className={styles.compareRowLabelCell}>
            <DocumentsDuotoneIcon size={16} className={styles.compareRowDuotoneIcon} />
            <span>Building Codes</span>
          </div>
          {providers.map((p) => (
            <div key={p.id} className={styles.compareDataCell}>
              <div className={styles.compareTagCloud}>
                {p.codeKnowledge.map((code) => (
                  <span key={code} className={styles.compareTag}>{code}</span>
                ))}
              </div>
            </div>
          ))}
          <div className={styles.compareFillerCell} />

          {/* Row: Languages */}
          <div className={styles.compareRowLabelCell}>
            <Globe size={16} className={styles.compareRowDuotoneIcon} />
            <span>Languages</span>
          </div>
          {providers.map((p) => (
            <div key={p.id} className={styles.compareDataCell}>
              <span>{p.languages.join(", ")}</span>
            </div>
          ))}
          <div className={styles.compareFillerCell} />

          {/* Final Row: Action CTA Button on the Bottom */}
          <div className={styles.compareRowLabelCell} style={{ borderBottom: "none", paddingTop: "20px" }}>
            <StudioDuotoneIcon size={16} className={styles.compareRowDuotoneIcon} />
            <span>Action</span>
          </div>
          {providers.map((provider) => {
            const hireParams = new URLSearchParams({ providerId: provider.id });
            if (projectId) hireParams.set("projectId", projectId);

            return (
              <div key={provider.id} className={styles.compareDataCell} style={{ borderBottom: "none", paddingTop: "20px" }}>
                <Link
                  href={`/basics/requirements/new?${hireParams.toString()}`}
                  className={styles.compareHireBtn}
                >
                  <span>Hire {provider.name.split(" ")[0]}</span>
                </Link>
              </div>
            );
          })}
          <div className={styles.compareFillerCell} style={{ borderBottom: "none" }} />
        </div>
      </div>
    </div>
  );
}
