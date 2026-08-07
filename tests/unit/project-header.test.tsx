import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ProjectCoverBanner } from "@/features/projects/components/project-header/project-cover-banner";
import { ProjectIdentity } from "@/features/projects/components/project-header/project-identity";
import { ProjectMetricsStrip } from "@/features/projects/components/project-header/project-metrics-strip";
import { ProjectNavigationTabs } from "@/features/projects/components/project-header/project-navigation-tabs";

vi.mock("next/image", () => ({
  default: ({
    alt,
    fill: _fill,
    priority: _priority,
    unoptimized: _unoptimized,
    ...props
  }: React.ImgHTMLAttributes<HTMLImageElement> & {
    fill?: boolean;
    priority?: boolean;
    unoptimized?: boolean;
  }) => (
    // The mock intentionally renders a native image so component semantics remain testable.
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt || ""} {...props} />
  ),
}));

afterEach(() => {
  cleanup();
});

describe("Project profile header", () => {
  it("renders the project cover and exposes the edit action", () => {
    const onEditCover = vi.fn();

    render(
      <ProjectCoverBanner
        coverImageUrl="https://example.com/project.jpg"
        projectName="Nila Residence"
        onEditCover={onEditCover}
      />
    );

    expect(
      screen.getByRole("img", { name: "Nila Residence project cover" })
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Edit project cover" }));
    expect(onEditCover).toHaveBeenCalledOnce();
  });

  it("renders model-provided identity data and preserves the client action", () => {
    const onClientClick = vi.fn();

    render(
      <ProjectIdentity
        clientName="Anoop Kumar"
        location="Trivandrum, Kerala"
        projectCode="KAL-2024-001"
        projectName="Nila Residence"
        projectType="Luxury Residential Villa"
        statusLabel="Active"
        thumbnailImageUrl="https://example.com/thumb.jpg"
        onClientClick={onClientClick}
      />
    );

    expect(
      screen.getByRole("heading", { name: "Nila Residence" })
    ).toBeInTheDocument();
    expect(screen.getByText("Luxury Residential Villa")).toBeInTheDocument();
    expect(screen.getByText("Trivandrum, Kerala")).toBeInTheDocument();
    expect(screen.getByText("KAL-2024-001")).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: "Client: Anoop Kumar" })
    );
    expect(onClientClick).toHaveBeenCalledOnce();
  });

  it("renders four project metrics and keeps the team action accessible", () => {
    const onViewTeam = vi.fn();

    render(
      <ProjectMetricsStrip
        manager={{ name: "Arjun Mehta" }}
        milestone={{
          title: "Roof Slab Casting",
          supportingText: "3 days remaining",
        }}
        progressPercent={68}
        teamAdditionalCount={12}
        teamMembers={[
          { id: "rk", name: "Ravi Kumar", initials: "RK" },
          { id: "ps", name: "Priya Shah", initials: "PS" },
          { id: "nl", name: "Nikhil Lal", initials: "NL" },
          { id: "dv", name: "Divya Varma", initials: "DV" },
        ]}
        onViewTeam={onViewTeam}
      />
    );

    expect(screen.getByText("Project progress")).toBeInTheDocument();
    expect(screen.getByText("Next milestone")).toBeInTheDocument();
    expect(screen.getByText("Project manager")).toBeInTheDocument();
    expect(screen.getByText("Project team")).toBeInTheDocument();
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "68");
    expect(screen.getByText("Roof Slab Casting")).toBeInTheDocument();
    expect(screen.getByText("3 days remaining")).toBeInTheDocument();
    expect(screen.getByText("Arjun Mehta")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "View Team" }));
    expect(onViewTeam).toHaveBeenCalledOnce();
  });

  it("retains active-tab state and routes selection through the parent callback", () => {
    const onSelect = vi.fn();

    render(
      <ProjectNavigationTabs
        activeTab="BOQ"
        items={[
          { key: "updates", label: "Updates" },
          { key: "boq", label: "BOQ" },
          { key: "finance", label: "Finance" },
        ]}
        onSelect={onSelect}
      />
    );

    expect(screen.getByRole("button", { name: "BOQ" })).toHaveAttribute(
      "aria-current",
      "page"
    );
    fireEvent.click(screen.getByRole("button", { name: "Finance" }));
    expect(onSelect).toHaveBeenCalledWith("Finance");
  });
});
