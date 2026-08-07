import {
  ArrowRight,
  Building2,
  CircuitBoard,
  Droplets,
  Flame,
  Layers3,
  Snowflake,
  Sparkles,
  Workflow,
} from "lucide-react";
import Link from "next/link";
import {
  basicsEngagementRepository,
  basicsProviderRepository,
  basicsRequirementRepository,
  listBasicsProjectContexts,
} from "../repositories/basics-repositories";
import { formatDate } from "../utils/basics-formatters";
import {
  BasicsEmptyState,
  BasicsPageHeader,
  BasicsStatusBadge,
} from "./basics-shared";
import { ExpertSearchBar } from "./expert-search-bar";
import { ProjectContextSelector } from "./project-context-selector";
import { ProviderCard } from "./provider-card";
import styles from "./basics-workspace.module.css";

const SPECIALIST_CATEGORIES = [
  { label: "Structural Engineering", query: "structural", icon: Building2 },
  { label: "MEP Consulting", query: "MEP", icon: Workflow },
  { label: "HVAC Design", query: "HVAC", icon: Snowflake },
  { label: "Electrical Design", query: "electrical", icon: CircuitBoard },
  { label: "Plumbing and Drainage", query: "plumbing", icon: Droplets },
  { label: "Fire and Life Safety", query: "fire", icon: Flame },
  { label: "Facade Engineering", query: "facade", icon: Layers3 },
  { label: "BIM and Coordination", query: "BIM", icon: Sparkles },
] as const;

export async function BasicsOverview({ projectId }: { projectId?: string }) {
  const [projects, providers, requirements, engagements] = await Promise.all([
    listBasicsProjectContexts(),
    basicsProviderRepository.listProviders({
      verified: true,
      sort: "recommended",
    }),
    basicsRequirementRepository.listRequirements({ ownerId: "user-current" }),
    basicsEngagementRepository.listEngagements(),
  ]);

  const selectedProject = projects.find((project) => project.id === projectId);
  const recommended = providers
    .filter(
      (provider) =>
        !selectedProject ||
        provider.projectTypes.some((type) =>
          selectedProject.projectType.toLowerCase().includes(type.toLowerCase().split(" ")[0]),
        ) ||
        provider.remoteAvailable,
    )
    .slice(0, 3);
  const activeRequirements = requirements
    .filter(
      (requirement) =>
        (!projectId || requirement.projectId === projectId) &&
        ["open", "reviewing"].includes(requirement.status),
    )
    .slice(0, 4);
  const activeEngagements = engagements
    .filter(
      (engagement) =>
        (!projectId || engagement.projectId === projectId) &&
        !["completed", "cancelled"].includes(engagement.status),
    )
    .slice(0, 4);

  return (
    <div className={styles.page}>
      <BasicsPageHeader
        title="Basics"
        description="Find and collaborate with verified construction specialists."
        actions={
          <>
            <Link className={styles.secondaryButton} href="/basics/experts">
              Find Experts
            </Link>
            <Link
              className={styles.primaryButton}
              href={`/basics/requirements/new${projectId ? `?projectId=${encodeURIComponent(projectId)}` : ""}`}
            >
              Post a Requirement
            </Link>
          </>
        }
      />

      <ProjectContextSelector projects={projects} />

      {!selectedProject ? (
        <div className={styles.notice}>
          <Building2 size={16} aria-hidden="true" />
          <span>
            No project is selected. Choose a project above for project-aware
            recommendations, or continue with an independent service requirement.
          </span>
        </div>
      ) : null}

      <ExpertSearchBar projectId={projectId} />

      <section className={styles.section} aria-labelledby="specialist-categories-title">
        <div className={styles.sectionHeader}>
          <div>
            <h2 id="specialist-categories-title">Specialist categories</h2>
            <p>Professional services for design, coordination and compliance.</p>
          </div>
          <Link className={styles.textLink} href="/basics/experts">
            View all services
            <ArrowRight size={12} aria-hidden="true" />
          </Link>
        </div>
        <div className={styles.categoryGrid}>
          {SPECIALIST_CATEGORIES.map(({ label, query, icon: Icon }) => {
            const count = providers.filter((provider) =>
              [
                provider.headline,
                ...provider.specializations,
              ]
                .join(" ")
                .toLowerCase()
                .includes(query.toLowerCase()),
            ).length;
            const params = new URLSearchParams({ q: query });
            if (projectId) params.set("projectId", projectId);
            return (
              <Link
                key={label}
                className={styles.categoryCard}
                href={`/basics/experts?${params.toString()}`}
              >
                <span className={styles.categoryIcon}>
                  <Icon size={15} aria-hidden="true" />
                </span>
                <span className={styles.categoryCopy}>
                  <strong>{label}</strong>
                  <span>{count || 1} verified providers</span>
                </span>
                <ArrowRight size={13} aria-hidden="true" />
              </Link>
            );
          })}
        </div>
      </section>

      <section className={styles.section} aria-labelledby="recommended-experts-title">
        <div className={styles.sectionHeader}>
          <div>
            <h2 id="recommended-experts-title">Recommended experts</h2>
            <p>
              {selectedProject
                ? `Matched to ${selectedProject.name} and its current project context.`
                : "Verified specialists with current availability."}
            </p>
          </div>
          <Link className={styles.textLink} href="/basics/experts?verified=true">
            See all experts
            <ArrowRight size={12} aria-hidden="true" />
          </Link>
        </div>
        {recommended.length > 0 ? (
          <div className={styles.providerGrid}>
            {recommended.map((provider) => (
              <ProviderCard
                key={provider.id}
                provider={provider}
                projectId={projectId}
              />
            ))}
          </div>
        ) : (
          <BasicsEmptyState
            title="No recommendations are available"
            description="Post a requirement so Kallisto can match the project scope to eligible providers."
            actionLabel="Post a requirement"
            href="/basics/requirements/new"
          />
        )}
      </section>

      <section className={styles.section} aria-labelledby="active-requirements-title">
        <div className={styles.sectionHeader}>
          <div>
            <h2 id="active-requirements-title">Active requirements</h2>
            <p>Open scopes currently receiving or reviewing proposals.</p>
          </div>
          <Link className={styles.textLink} href="/basics/requirements">
            View requirements
            <ArrowRight size={12} aria-hidden="true" />
          </Link>
        </div>
        {activeRequirements.length > 0 ? (
          <div className={`${styles.tableCard} ${styles.desktopTable}`}>
            <div className={`${styles.tableHeader} ${styles.requirementsColumns}`}>
              <span>Requirement</span>
              <span>Category</span>
              <span>Proposals</span>
              <span>Shortlisted</span>
              <span>Closes</span>
              <span />
            </div>
            {activeRequirements.map((requirement) => (
              <div
                className={`${styles.tableRow} ${styles.requirementsColumns}`}
                key={requirement.id}
              >
                <span className={styles.primaryCell}>
                  <strong>{requirement.title}</strong>
                  <span>{requirement.projectName ?? "No project"}</span>
                </span>
                <span className={styles.cellMuted}>{requirement.specialization}</span>
                <span className={styles.numeric}>{requirement.proposalCount}</span>
                <span className={styles.numeric}>
                  {requirement.shortlistedProposalIds.length}
                </span>
                <span>
                  <BasicsStatusBadge status={requirement.status} />
                  <span className={styles.cellMuted}>{formatDate(requirement.closesAt)}</span>
                </span>
                <Link
                  className={styles.iconButton}
                  href={`/basics/requirements/${requirement.id}`}
                  aria-label={`View ${requirement.title}`}
                >
                  <ArrowRight size={13} aria-hidden="true" />
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <BasicsEmptyState
            title="No active requirements"
            description="Post a structured scope to invite specialists and compare proposals."
            actionLabel="Post a requirement"
            href="/basics/requirements/new"
          />
        )}
      </section>

      <section className={styles.section} aria-labelledby="active-engagements-title">
        <div className={styles.sectionHeader}>
          <div>
            <h2 id="active-engagements-title">Active engagements</h2>
            <p>Specialist deliverables, milestones and reviews in progress.</p>
          </div>
          <Link className={styles.textLink} href="/basics/engagements">
            View engagements
            <ArrowRight size={12} aria-hidden="true" />
          </Link>
        </div>
        {activeEngagements.length > 0 ? (
          <div className={styles.engagementCardGrid}>
            {activeEngagements.map((engagement) => {
              const provider = providers.find(
                (item) => item.id === engagement.providerId,
              );
              const nextDeliverable = engagement.deliverables.find(
                (deliverable) => deliverable.status !== "approved",
              );
              return (
                <article className={styles.engagementCard} key={engagement.id}>
                  <div className={styles.inlineActions}>
                    <BasicsStatusBadge status={engagement.status} />
                    <BasicsStatusBadge
                      status={
                        engagement.paymentStatus === "partially_paid"
                          ? "pending"
                          : engagement.paymentStatus
                      }
                      label={engagement.paymentStatus.replaceAll("_", " ")}
                    />
                  </div>
                  <h3>{engagement.title}</h3>
                  <p>
                    {provider?.name ?? "Specialist provider"} · {engagement.projectName}
                  </p>
                  <div className={styles.engagementCardMeta}>
                    <span className={styles.metaItem}>
                      <strong>{nextDeliverable?.name ?? "Scope complete"}</strong>
                    </span>
                    <span className={styles.metaItem}>
                      Due {formatDate(nextDeliverable?.dueDate)}
                    </span>
                  </div>
                  <span className={styles.progressTrack}>
                    <span
                      className={styles.progressFill}
                      style={{ width: `${engagement.progress}%` }}
                    />
                  </span>
                  <div className={styles.cardFooter}>
                    <span className={styles.cellMuted}>{engagement.progress}% complete</span>
                    <Link
                      className={styles.secondaryButton}
                      href={`/basics/engagements/${engagement.id}`}
                    >
                      Open engagement
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <BasicsEmptyState
            title="No active engagements"
            description="Accept a proposal to create a tracked specialist engagement."
            actionLabel="Review proposals"
            href="/basics/proposals"
          />
        )}
      </section>
    </div>
  );
}

