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
      screen.queryByRole("button", { name: "Edit Portfolio" }),
    ).not.toBeInTheDocument();
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

  it("hides package summary card and pricing section when hidePricing is true", () => {
    const data = getPortfolioPageData(false);
    render(
      <PortfolioProfileCard
        data={data}
        initialTab="projects"
        hidePricing={true}
      />,
    );

    // Package summary card should not be present
    expect(
      screen.queryByText(/Design packages starting from/i),
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/View Plans/i)).not.toBeInTheDocument();

    // Pricing tab should not be present
    expect(
      screen.queryByRole("tab", { name: /pricing/i }),
    ).not.toBeInTheDocument();
  });

  it("hides Edit Portfolio and overflow menu leaving only share button when shareOnly is true", () => {
    const data = getPortfolioPageData(true);
    render(
      <PortfolioProfileCard
        data={data}
        initialTab="projects"
        shareOnly={true}
      />,
    );

    expect(
      screen.queryByRole("button", { name: "Edit Portfolio" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "More portfolio actions" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Share" }),
    ).toBeInTheDocument();
  });

  it("hides Add project button when hideAddProject is true", () => {
    const data = getPortfolioPageData(true);
    render(
      <PortfolioProfileCard
        data={data}
        initialTab="projects"
        hideAddProject={true}
      />,
    );

    expect(
      screen.queryByRole("button", { name: "Add project" }),
    ).not.toBeInTheDocument();
  });

  it("opens the modal on clicking Add new collection and validates inputs", () => {
    const data = getPortfolioPageData(true);
    render(<PortfolioProfileCard data={data} initialTab="projects" />);

    // Click "+ New Collection"
    const addCollectionBtn = screen.getByRole("button", {
      name: "Add new collection",
    });
    fireEvent.click(addCollectionBtn);

    // Modal opens
    expect(
      screen.getByRole("dialog", { name: "New Collection" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Add title and multiple images for your highlights")).toBeInTheDocument();

    const titleInput = screen.getByPlaceholderText(
      "e.g., Luxury Residential, Concept Sketches, 3D Renders",
    );
    expect(titleInput).toBeInTheDocument();

    // Try submitting without title
    const submitBtn = screen.getByRole("button", { name: "Create Collection" });
    fireEvent.click(submitBtn);
    expect(
      screen.getByText("Please enter a collection title."),
    ).toBeInTheDocument();

    // Type title, submit without images
    fireEvent.change(titleInput, { target: { value: "Eco-Lodge Concepts" } });
    fireEvent.click(submitBtn);
    expect(
      screen.getByText("Please add at least one image to the collection."),
    ).toBeInTheDocument();

    // Close modal via Cancel button
    const cancelBtn = screen.getByRole("button", { name: "Cancel" });
    fireEvent.click(cancelBtn);
    expect(
      screen.queryByRole("dialog", { name: "New Collection" }),
    ).not.toBeInTheDocument();
  });

  it("creates a new collection with title and multiple images", () => {
    const data = getPortfolioPageData(true);
    render(<PortfolioProfileCard data={data} initialTab="projects" />);

    // Click "+ New Collection"
    fireEvent.click(
      screen.getByRole("button", { name: "Add new collection" }),
    );

    const titleInput = screen.getByPlaceholderText(
      "e.g., Luxury Residential, Concept Sketches, 3D Renders",
    );
    fireEvent.change(titleInput, { target: { value: "Modern Villas 2026" } });

    // Upload multiple images
    const fileInput = screen.getByLabelText("Upload multiple images").querySelector("input[type='file']")!;
    const file1 = new File(["img1"], "villa-front.jpg", { type: "image/jpeg" });
    const file2 = new File(["img2"], "villa-pool.jpg", { type: "image/jpeg" });

    fireEvent.change(fileInput, {
      target: { files: [file1, file2] },
    });

    // Should show 2 images selected and thumbnails
    expect(screen.getByText("2 images selected")).toBeInTheDocument();
    expect(screen.getByText("Cover")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add more images" })).toBeInTheDocument();

    // Submit form
    const submitBtn = screen.getByRole("button", { name: "Create Collection" });
    fireEvent.click(submitBtn);

    // Modal should close
    expect(
      screen.queryByRole("dialog", { name: "New Collection" }),
    ).not.toBeInTheDocument();

    // New collection should now appear in the highlights bar and be selected
    const newCollectionBtn = screen.getByRole("button", {
      name: "Modern Villas 2026",
    });
    expect(newCollectionBtn).toBeInTheDocument();
    expect(newCollectionBtn).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText("2 images")).toBeInTheDocument();
  });

  it("opens the image viewer modal with edit option when clicking a collection card", () => {
    const data = getPortfolioPageData(true);
    render(<PortfolioProfileCard data={data} initialTab="projects" />);

    // Click "Featured" collection card
    const featuredCard = screen.getByRole("button", { name: "Featured" });
    fireEvent.click(featuredCard);

    // Modal dialog opens for viewing the collection image
    expect(
      screen.getByRole("dialog", { name: "Featured" }),
    ).toBeInTheDocument();
    expect(
      screen.getByAltText("Featured preview"),
    ).toBeInTheDocument();

    // Edit button is available for owner
    const editBtn = screen.getByRole("button", { name: "Edit collection" });
    expect(editBtn).toBeInTheDocument();

    // Click Edit to toggle edit mode
    fireEvent.click(editBtn);

    // Edit form inputs should be visible
    const editInput = screen.getByDisplayValue("Featured");
    expect(editInput).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save Changes" })).toBeInTheDocument();

    // Change title and save
    fireEvent.change(editInput, { target: { value: "Featured Masterpieces" } });
    fireEvent.click(screen.getByRole("button", { name: "Save Changes" }));

    // Title should be updated in highlights bar
    expect(
      screen.getByRole("button", { name: "Featured Masterpieces" }),
    ).toBeInTheDocument();

    // Close viewer modal
    const closeBtn = screen.getByRole("button", { name: "Close viewer" });
    fireEvent.click(closeBtn);
    expect(
      screen.queryByRole("dialog", { name: "Featured Masterpieces" }),
    ).not.toBeInTheDocument();
  });

  it("displays 'Add case study' button on the Case Studies tab and 'Add project' on the Projects tab", () => {
    const data = getPortfolioPageData(true);
    render(<PortfolioProfileCard data={data} initialTab="projects" />);

    // On Projects tab: button says "Add project"
    expect(screen.getByRole("button", { name: "Add project" })).toBeInTheDocument();

    // Switch to Case Studies tab
    const caseStudiesTab = screen.getByRole("tab", { name: "Case Studies" });
    fireEvent.click(caseStudiesTab);

    // On Case Studies tab: button should say "Add case study" instead of "Add project"
    expect(screen.getByRole("button", { name: "Add case study" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Add project" })).not.toBeInTheDocument();
  });

  it("opens Add Case Study modal when clicking 'Add case study' and creates a new case study", () => {
    const data = getPortfolioPageData(true);
    render(<PortfolioProfileCard data={data} initialTab="case-studies" />);

    // Click "Add case study" button
    const addCaseStudyBtn = screen.getByRole("button", { name: "Add case study" });
    fireEvent.click(addCaseStudyBtn);

    // Add Case Study modal should be open
    expect(screen.getByRole("dialog", { name: "Add Case Study" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Architectural Narrative" })).toBeInTheDocument();

    // Select linked project from dropdown to test auto-population
    const projectSelect = screen.getByLabelText("Associated Project");
    fireEvent.change(projectSelect, { target: { value: data.projects[0].id } });

    // Title input should be updated
    const titleInput = screen.getByLabelText(/Case Study Title/i);
    expect(titleInput).toBeInTheDocument();
    fireEvent.change(titleInput, { target: { value: "Eco Villa Architectural Narrative" } });

    // Fill Client Brief & Design Response
    const briefInput = screen.getByLabelText("Client Brief");
    fireEvent.change(briefInput, { target: { value: "Client requested a carbon-neutral home." } });

    const responseInput = screen.getByLabelText("Design Response");
    fireEvent.change(responseInput, { target: { value: "We implemented rammed earth and passive solar design." } });

    // Upload an image via modal's file input
    const modal = screen.getByRole("dialog", { name: "Add Case Study" });
    const file = new File(["dummy-content"], "cover.jpg", { type: "image/jpeg" });
    const fileInput = modal.querySelector('input[type="file"]') as HTMLInputElement;
    expect(fileInput).not.toBeNull();
    fireEvent.change(fileInput, { target: { files: [file] } });

    // Submit form
    const submitBtn = screen.getByRole("button", { name: "Create Case Study" });
    fireEvent.click(submitBtn);

    // Modal should close
    expect(screen.queryByRole("dialog", { name: "Add Case Study" })).not.toBeInTheDocument();

    // The new case study should appear in both the case study list and preview panel
    expect(screen.getAllByText("Eco Villa Architectural Narrative").length).toBeGreaterThanOrEqual(2);
  });

  it("renders the Edit option in the top right of the case study cover image and updates the case study", () => {
    const data = getPortfolioPageData(true);
    render(<PortfolioProfileCard data={data} initialTab="case-studies" />);

    const activeCaseStudy = data.caseStudies[0];

    // Find the Edit button inside the case study preview cover area
    const editBtn = screen.getByRole("button", {
      name: `Edit ${activeCaseStudy.title}`,
    });
    expect(editBtn).toBeInTheDocument();

    // Click Edit button
    fireEvent.click(editBtn);

    // Edit Case Study modal should be open with pre-populated values
    expect(
      screen.getByRole("dialog", { name: "Edit Case Study" }),
    ).toBeInTheDocument();

    const titleInput = screen.getByLabelText(/Case Study Title/i);
    expect(titleInput).toHaveValue(activeCaseStudy.title);

    // Change title
    fireEvent.change(titleInput, {
      target: { value: "Updated Architectural Masterpiece 2026" },
    });

    // Submit using Save Changes button
    const saveBtn = screen.getByRole("button", { name: "Save Changes" });
    fireEvent.click(saveBtn);

    // Modal should close
    expect(
      screen.queryByRole("dialog", { name: "Edit Case Study" }),
    ).not.toBeInTheDocument();

    // The updated title should be displayed in the case study views
    expect(
      screen.getAllByText("Updated Architectural Masterpiece 2026").length,
    ).toBeGreaterThanOrEqual(1);
  });

  it("does not display 'Add project' or 'Add case study' button on the Pricing tab", () => {
    const data = getPortfolioPageData(true);
    render(<PortfolioProfileCard data={data} initialTab="pricing" />);

    // On Pricing tab: no dedicated action button should appear in the tabs header
    expect(screen.queryByRole("button", { name: "Add project" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Add case study" })).not.toBeInTheDocument();
  });

  it("allows owner to edit package details and saves updates in real-time", () => {
    const data = getPortfolioPageData(true);
    render(<PortfolioProfileCard data={data} initialTab="pricing" />);

    // Package cards should have Edit Package button for owner
    const editBasicBtn = screen.getByRole("button", {
      name: "Edit Basic Design Package package",
    });
    expect(editBasicBtn).toBeInTheDocument();

    // Click Edit Package
    fireEvent.click(editBasicBtn);

    // Edit Package modal should open
    expect(
      screen.getByRole("dialog", { name: "Edit Package Details" }),
    ).toBeInTheDocument();

    // Title input should have existing value
    const titleInput = screen.getByLabelText(/Package Title/i);
    expect(titleInput).toHaveValue("Basic Design Package");

    // Price input should have existing value
    const priceInput = screen.getByLabelText(/Rate \/ Price/i);
    expect(priceInput).toHaveValue("2,50,000");

    // Change title and price
    fireEvent.change(titleInput, {
      target: { value: "Starter Design Suite" },
    });
    fireEvent.change(priceInput, {
      target: { value: "3,00,000" },
    });

    // Save changes
    const saveBtn = screen.getByRole("button", { name: "Save Changes" });
    fireEvent.click(saveBtn);

    // Modal should close
    expect(
      screen.queryByRole("dialog", { name: "Edit Package Details" }),
    ).not.toBeInTheDocument();

    // Updated package title and price should now be visible on the card
    expect(screen.getByText("Starter Design Suite")).toBeInTheDocument();
    expect(screen.getByText("3,00,000")).toBeInTheDocument();
  });
});
