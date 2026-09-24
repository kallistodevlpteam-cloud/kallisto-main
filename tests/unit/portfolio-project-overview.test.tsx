import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PortfolioProjectOverview } from "@/features/portfolio/components/project-overview/portfolio-project-overview";
import {
  getDetailedPortfolioProject,
  getPortfolioPageData,
  getPortfolioProjects,
} from "@/features/portfolio/data/portfolio.mock";

vi.mock("@/hooks/use-odin", () => ({
  useOdin: () => ({
    isOdinOpen: false,
    openOdinWithPrompt: vi.fn(),
    toggleOdin: vi.fn(),
    closeOdin: vi.fn(),
  }),
}));

afterEach(cleanup);

describe("Portfolio Project Overview full-page experience", () => {
  const project = getDetailedPortfolioProject("nila-residence")!;
  const allProjects = getPortfolioProjects();
  const relatedProjects = allProjects.filter((p) => p.id !== "nila-residence").slice(0, 3);
  const data = getPortfolioPageData(true);

  it("does not render the redundant page header section", () => {
    render(
      <PortfolioProjectOverview
        project={project}
        profile={data.profile}
        relatedProjects={relatedProjects}
        isOwner={true}
      />,
    );

    expect(screen.queryByRole("link", { name: /back to portfolio/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Edit Project" })).not.toBeInTheDocument();
  });

  it("renders the full-width hero cover image with project title, location, client name, and overlay controls", () => {
    render(
      <PortfolioProjectOverview
        project={project}
        profile={data.profile}
        relatedProjects={relatedProjects}
        isOwner={true}
      />,
    );

    // Overlay content on the left bottom
    expect(screen.getByRole("heading", { name: "Nila Residence" })).toBeInTheDocument();
    expect(screen.getAllByText(/Residential architecture/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText("Kochi, Kerala").length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Anitha & Rajesh Menon/i).length).toBeGreaterThan(0);

    // Overlay controls on the right bottom
    expect(screen.getByText("01 / 08")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Previous image" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Next image" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /view.*gallery/i })).toBeInTheDocument();
  });

  it("renders the horizontal project snapshot statistics grid", () => {
    render(
      <PortfolioProjectOverview
        project={project}
        profile={data.profile}
        relatedProjects={relatedProjects}
        isOwner={true}
      />,
    );

    expect(screen.getByRole("heading", { name: "Project Snapshot" })).toBeInTheDocument();
    expect(screen.getAllByText("3,200 sq.ft").length).toBeGreaterThan(0);
    expect(screen.getByText("8.5 cents")).toBeInTheDocument();
    expect(screen.getByText("2 Floors")).toBeInTheDocument();
    expect(screen.getByText("4 BHK")).toBeInTheDocument();
  });

  it("triggers the fullscreen lightbox modal from the hero view gallery button", () => {
    render(
      <PortfolioProjectOverview
        project={project}
        profile={data.profile}
        relatedProjects={relatedProjects}
        isOwner={true}
      />,
    );

    // Project Gallery grid section is not in the page
    expect(screen.queryByRole("heading", { name: "Project Gallery" })).not.toBeInTheDocument();

    // Click View Gallery in Hero section
    const viewGalleryBtn = screen.getByRole("button", { name: /view.*gallery/i });
    fireEvent.click(viewGalleryBtn);

    // Lightbox modal is open
    expect(screen.getByRole("dialog", { name: "Project Gallery Lightbox" })).toBeInTheDocument();

    // Close lightbox via Close button
    const closeBtn = screen.getByRole("button", { name: "Close Lightbox" });
    fireEvent.click(closeBtn);
    expect(screen.queryByRole("dialog", { name: "Project Gallery Lightbox" })).not.toBeInTheDocument();
  });

  it("renders project summary editorial vision, approach, and context", () => {
    render(
      <PortfolioProjectOverview
        project={project}
        profile={data.profile}
        relatedProjects={relatedProjects}
        isOwner={true}
      />,
    );

    expect(screen.getByRole("heading", { name: "Project Summary" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Project Vision" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Design Approach" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Project Context" })).toBeInTheDocument();
  });

  it("does not render Project Timeline, Scope of Services, Project Team, Progress, Materials, Updates, Documents, Outcomes, and CTA", () => {
    render(
      <PortfolioProjectOverview
        project={project}
        profile={data.profile}
        relatedProjects={relatedProjects}
        isOwner={true}
      />,
    );

    expect(screen.queryByRole("heading", { name: "Project Timeline" })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Scope of Services" })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Project Team & Collaborators" })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Project Progress" })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Material Palette" })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Latest Project Updates" })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Project Documents" })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Project Outcomes" })).not.toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: /interested in working with/i }),
    ).not.toBeInTheDocument();
  });

  it("renders design highlights, location, feedback, and related projects", () => {
    render(
      <PortfolioProjectOverview
        project={project}
        profile={data.profile}
        relatedProjects={relatedProjects}
        isOwner={true}
      />,
    );

    // Design Highlights
    expect(screen.getByRole("heading", { name: "Design Highlights" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /central landscaped courtyard/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /passive cross ventilation/i })).toBeInTheDocument();

    // Location
    expect(screen.getByRole("heading", { name: "Project Location" })).toBeInTheDocument();
    expect(screen.getByText(/Bio-Climatic Zone:/i)).toBeInTheDocument();

    // Feedback
    expect(screen.getByRole("heading", { name: "Client Feedback & Review" })).toBeInTheDocument();
    expect(screen.getAllByText(/Anitha & Rajesh Menon/i).length).toBeGreaterThan(0);

    // More projects
    expect(screen.getByRole("heading", { name: "More Projects" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Courtyard House" })).toBeInTheDocument();
  });

  it("renders the edit option on the top right of the cover image for owners", () => {
    render(
      <PortfolioProjectOverview
        project={project}
        profile={data.profile}
        relatedProjects={relatedProjects}
        isOwner={true}
      />,
    );

    const editBtn = screen.getByRole("button", { name: "Edit options" });
    expect(editBtn).toBeInTheDocument();

    // Click edit options button to open dropdown
    fireEvent.click(editBtn);

    expect(screen.getByRole("menuitem", { name: /change cover image/i })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: /edit project details/i })).toBeInTheDocument();
  });

  it("does not render the cover image edit option when isOwner is false", () => {
    render(
      <PortfolioProjectOverview
        project={project}
        profile={data.profile}
        relatedProjects={relatedProjects}
        isOwner={false}
      />,
    );

    expect(screen.queryByRole("button", { name: "Edit options" })).not.toBeInTheDocument();
  });

  it("opens EditProjectModal from the edit menu and updates project details", () => {
    render(
      <PortfolioProjectOverview
        project={project}
        profile={data.profile}
        relatedProjects={relatedProjects}
        isOwner={true}
      />,
    );

    // Open edit menu
    const editBtn = screen.getByRole("button", { name: "Edit options" });
    fireEvent.click(editBtn);

    // Click Edit Project Details
    const editDetailsBtn = screen.getByRole("menuitem", { name: /edit project details/i });
    fireEvent.click(editDetailsBtn);

    // Modal dialog is displayed
    expect(screen.getByRole("dialog", { name: /edit project details/i })).toBeInTheDocument();

    // Change title
    const titleInput = screen.getByLabelText(/project title/i);
    fireEvent.change(titleInput, { target: { value: "Nila Residence Updated" } });

    // Submit changes
    const saveBtn = screen.getByRole("button", { name: /save changes/i });
    fireEvent.click(saveBtn);

    // Modal should be closed and hero heading updated
    expect(screen.queryByRole("dialog", { name: /edit project details/i })).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Nila Residence Updated" })).toBeInTheDocument();
  });

  it("allows editing Editorial Overview (Vision, Approach, Context) via the modal", () => {
    render(
      <PortfolioProjectOverview
        project={project}
        profile={data.profile}
        relatedProjects={relatedProjects}
        isOwner={true}
      />,
    );

    // Open edit menu & modal
    fireEvent.click(screen.getByRole("button", { name: "Edit options" }));
    fireEvent.click(screen.getByRole("menuitem", { name: /edit project details/i }));

    // Switch to Editorial Overview tab
    const editorialTab = screen.getByRole("tab", { name: /editorial overview/i });
    fireEvent.click(editorialTab);

    // Edit Vision
    const visionInput = screen.getByLabelText(/project vision/i);
    fireEvent.change(visionInput, {
      target: { value: "Custom vision highlighting tropical sanctuary and spatial harmony." },
    });

    // Edit Approach
    const approachInput = screen.getByLabelText(/design approach/i);
    fireEvent.change(approachInput, {
      target: { value: "Custom approach using vernacular courtyard and solar orientation." },
    });

    // Save changes
    fireEvent.click(screen.getByRole("button", { name: /save changes/i }));

    // Verify updated editorial content on the page
    expect(
      screen.getByText("Custom vision highlighting tropical sanctuary and spatial harmony."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Custom approach using vernacular courtyard and solar orientation."),
    ).toBeInTheDocument();
  });

  it("allows adding and modifying Design Highlights via the modal", () => {
    render(
      <PortfolioProjectOverview
        project={project}
        profile={data.profile}
        relatedProjects={relatedProjects}
        isOwner={true}
      />,
    );

    // Open modal
    fireEvent.click(screen.getByRole("button", { name: "Edit options" }));
    fireEvent.click(screen.getByRole("menuitem", { name: /edit project details/i }));

    // Switch to Design Highlights tab
    const highlightsTab = screen.getByRole("tab", { name: /design highlights/i });
    fireEvent.click(highlightsTab);

    // Add a new highlight
    const addInput = screen.getByPlaceholderText(/add architectural feature/i);
    fireEvent.change(addInput, { target: { value: "Rainwater Harvesting Cistern" } });
    fireEvent.click(screen.getByRole("button", { name: /^add$/i }));

    // Save changes
    fireEvent.click(screen.getByRole("button", { name: /save changes/i }));

    // Check that the new highlight appears in the Design Highlights section
    expect(
      screen.getByRole("heading", { name: "Rainwater Harvesting Cistern" }),
    ).toBeInTheDocument();
  });

  it("allows editing Location & Climate (District, Bio-Climatic Zone, Coordinates) via the modal", () => {
    render(
      <PortfolioProjectOverview
        project={project}
        profile={data.profile}
        relatedProjects={relatedProjects}
        isOwner={true}
      />,
    );

    // Open modal
    fireEvent.click(screen.getByRole("button", { name: "Edit options" }));
    fireEvent.click(screen.getByRole("menuitem", { name: /edit project details/i }));

    // Switch to Location & Climate tab
    const locationTab = screen.getByRole("tab", { name: /location & climate/i });
    fireEvent.click(locationTab);

    // Edit Bio-Climatic Zone
    const bioZoneInput = screen.getByLabelText(/bio-climatic zone/i);
    fireEvent.change(bioZoneInput, {
      target: { value: "Highland Monsoon Zone · Cool-Humid mountain microclimate." },
    });

    // Edit Coordinates
    const coordsInput = screen.getByLabelText(/map coordinates/i);
    fireEvent.change(coordsInput, {
      target: { value: "Latitude 10.0889° N · Longitude 77.0595° E" },
    });

    // Save changes
    fireEvent.click(screen.getByRole("button", { name: /save changes/i }));

    // Check that the updated bio-climatic zone and coordinates appear on the page
    expect(
      screen.getByText(/Highland Monsoon Zone · Cool-Humid mountain microclimate./i),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Latitude 10.0889° N · Longitude 77.0595° E"),
    ).toBeInTheDocument();
  });
});


