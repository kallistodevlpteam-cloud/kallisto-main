import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PortfolioProfileCard } from "@/features/portfolio/components/portfolio-profile-card";
import { PortfolioProjectViewer } from "@/features/portfolio/components/portfolio-project-viewer";
import { getPortfolioPageData } from "@/features/portfolio/data/portfolio.mock";

vi.mock("@/hooks/use-odin", () => ({
  useOdin: () => ({
    isOdinOpen: false,
    openOdinWithPrompt: vi.fn(),
    toggleOdin: vi.fn(),
    closeOdin: vi.fn(),
  }),
}));

afterEach(cleanup);

describe("portfolio interface", () => {
  it("preserves the owner profile, statistics and portfolio controls", () => {
    const ownerData = getPortfolioPageData(true);
    const data = {
      ...ownerData,
      collections: ownerData.collections.slice(0, 3),
      projects: ownerData.projects.slice(0, 1),
    };
    render(
      <PortfolioProfileCard
        data={data}
        initialTab="projects"
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Arjun Architects" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Architect • Residential Designer • 3D Visualization Expert",
      ),
    ).toBeInTheDocument();
    expect(screen.getAllByText("Kochi, Kerala").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Project Coordination").length).toBeGreaterThan(
      0,
    );
    expect(
      screen.getByRole("heading", {
        name: "Design packages starting from ₹2.5 Lakhs",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("₹2.5L+")).toBeInTheDocument();
    expect(screen.getByText("₹5L+")).toBeInTheDocument();
    expect(screen.getByText("₹15L+")).toBeInTheDocument();
    expect(screen.getByText("Projects Completed")).toBeInTheDocument();
    expect(screen.getByText("Years Experience")).toBeInTheDocument();
    expect(screen.getByText("(32 Reviews)")).toBeInTheDocument();
    expect(screen.getByText("Client Satisfaction")).toBeInTheDocument();
    expect(screen.getByText("Followers")).toBeInTheDocument();
    expect(screen.getByLabelText("Upload photo")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Edit Portfolio" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Portfolio Highlights" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Selected work, process and professional focus"),
    ).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Tagged" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Reviews" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Pricing" })).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Add project" })).toHaveLength(1);
    expect(
      screen.getByRole("button", { name: "Add new collection" }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "View Plans" }));

    expect(
      screen.getByRole("tab", { name: "Pricing" }),
    ).toHaveAttribute("aria-selected", "true");
    expect(
      screen.getAllByRole("heading", { name: "Design packages starting from ₹2.5 Lakhs" }).length,
    ).toBeGreaterThan(0);
  });

  it("keeps private owner controls and draft content out of public mode", () => {
    const data = getPortfolioPageData(false);
    render(
      <PortfolioProfileCard
        data={data}
        initialTab="projects"
      />,
    );

    expect(
      screen.queryByRole("button", { name: "Edit Portfolio" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Manage collections" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Add project" }),
    ).not.toBeInTheDocument();
  });

  it("supports Escape, project navigation and public enquiry in the viewer", () => {
    const data = getPortfolioPageData(false);
    const onClose = vi.fn();
    const onNavigate = vi.fn();
    const project = data.projects[0];

    render(
      <PortfolioProjectViewer
        project={project}
        projects={data.projects}
        profile={data.profile}
        isOwner={false}
        onClose={onClose}
        onNavigate={onNavigate}
      />,
    );

    expect(
      screen.getByRole("dialog", { name: project.title }),
    ).toBeInTheDocument();
    expect(screen.getByText("Built-up area")).toBeInTheDocument();
    expect(screen.getByText("Scope of services")).toBeInTheDocument();
    expect(screen.getByText("Design highlights")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Send enquiry" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Share project" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Request consultation" }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/views/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/saves/i)).not.toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", {
        name: new RegExp(`Next project, ${data.projects[1].title}`),
      }),
    );
    expect(onNavigate).toHaveBeenCalledWith(data.projects[1]);

    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("filters the editorial catalogue by collection", () => {
    const data = getPortfolioPageData(false);
    render(<PortfolioProfileCard data={data} initialTab="projects" />);

    fireEvent.click(screen.getByRole("button", { name: "Renovation" }));

    expect(
      screen.getByText("Sera Villa Renovation"),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("Nila Residence"),
    ).not.toBeInTheDocument();
  });

  it("filters portfolio projects grid by category/project type", () => {
    const data = getPortfolioPageData(false);
    render(<PortfolioProfileCard data={data} initialTab="projects" />);

    // Verify category filter pills exist
    const categoryBar = screen.getByRole("tablist", { name: "Filter projects by category" });
    expect(categoryBar).toBeInTheDocument();

    const allPill = screen.getByRole("tab", { name: /^all/i });
    const residentialPill = screen.getByRole("tab", { name: /^residential/i });
    const commercialPill = screen.getByRole("tab", { name: /^commercial/i });

    expect(allPill).toHaveAttribute("aria-selected", "true");
    expect(residentialPill).toBeInTheDocument();
    expect(commercialPill).toBeInTheDocument();

    // Filter to Commercial
    fireEvent.click(commercialPill);
    expect(commercialPill).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("The Fern Office")).toBeInTheDocument();
    expect(screen.queryByText("Nila Residence")).not.toBeInTheDocument();

    // Filter back to All
    fireEvent.click(allPill);
    expect(allPill).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("Nila Residence")).toBeInTheDocument();
    expect(screen.getByText("The Fern Office")).toBeInTheDocument();
  });

  it("filters tagged collaborations grid by category/type", () => {
    const data = getPortfolioPageData(true);
    render(<PortfolioProfileCard data={data} initialTab="tagged" />);

    // Verify tagged category filter bar
    const categoryBar = screen.getByRole("tablist", { name: "Filter tagged projects by category" });
    expect(categoryBar).toBeInTheDocument();

    const allPill = screen.getByRole("tab", { name: /^all/i });
    const hospitalityPill = screen.getByRole("tab", { name: /^hospitality/i });
    const commercialPill = screen.getByRole("tab", { name: /^commercial/i });

    expect(allPill).toHaveAttribute("aria-selected", "true");
    expect(hospitalityPill).toBeInTheDocument();
    expect(commercialPill).toBeInTheDocument();

    // Filter to Hospitality
    fireEvent.click(hospitalityPill);
    expect(hospitalityPill).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("Terra Café")).toBeInTheDocument();
    expect(screen.queryByText("The Fern Office")).not.toBeInTheDocument();

    // Filter back to All
    fireEvent.click(allPill);
    expect(allPill).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("Terra Café")).toBeInTheDocument();
    expect(screen.getByText("The Fern Office")).toBeInTheDocument();
  });

  it("searches portfolio projects by project name or location and clears search", () => {
    const data = getPortfolioPageData(true);
    render(<PortfolioProfileCard data={data} initialTab="projects" />);

    const searchInput = screen.getByRole("searchbox", {
      name: "Search projects by name or location",
    });
    expect(searchInput).toBeInTheDocument();

    // 1. Search by project name: "Nila"
    fireEvent.change(searchInput, { target: { value: "Nila" } });
    expect(screen.getByText("Nila Residence")).toBeInTheDocument();
    expect(screen.queryByText("The Fern Office")).not.toBeInTheDocument();

    // 2. Search by location: "Thrissur"
    fireEvent.change(searchInput, { target: { value: "Thrissur" } });
    expect(screen.getByText("Courtyard House")).toBeInTheDocument();
    expect(screen.queryByText("Nila Residence")).not.toBeInTheDocument();

    // 3. Clear search button
    const clearBtn = screen.getByRole("button", { name: "Clear search" });
    fireEvent.click(clearBtn);
    expect(searchInput).toHaveValue("");
    expect(screen.getByText("Nila Residence")).toBeInTheDocument();
    expect(screen.getByText("The Fern Office")).toBeInTheDocument();
  });
});
