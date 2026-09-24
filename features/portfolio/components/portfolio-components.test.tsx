import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { PortfolioPackageSummary } from "./portfolio-package-summary";
import { PortfolioCoverBanner } from "./portfolio-cover-banner";
import { PortfolioProfileHeader } from "./portfolio-profile-header";
import { PortfolioTabs } from "./portfolio-tabs";
import type { PortfolioProfile } from "../types/portfolio.types";

vi.mock("next/navigation", () => ({
  usePathname: () => "/portfolio",
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    refresh: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
}));

const MOCK_PROFILE: PortfolioProfile = {
  providerId: "arjun-architects",
  name: "Arjun Architects",
  profession: "Architect • Residential Designer • 3D Visualization Expert",
  location: "Kochi, Kerala",
  bio: "Residential and commercial architecture studio.",
  websiteLabel: "arjunarchitects.in",
  websiteUrl: "https://arjunarchitects.in",
  skills: [
    "Architecture",
    "Interior Design",
    "Project Coordination",
    "Residential",
    "Commercial",
  ],
  availability: "Available for selected projects",
  verified: true,
  avatarUrl: "/assets/profile_avatar.png",
  coverImageUrl: "/assets/hero-architecture-banner.webp",
};

describe("Portfolio Components", () => {
  afterEach(() => {
    cleanup();
  });

  describe("PortfolioPackageSummary Component", () => {
    it("renders heading and subtitle", () => {
      render(<PortfolioPackageSummary onViewPlans={vi.fn()} />);
      expect(
        screen.getByText("Design packages starting from ₹2.5 Lakhs"),
      ).toBeInTheDocument();
      expect(
        screen.getByText("Tailored solution for every scale of project."),
      ).toBeInTheDocument();
    });

    it("renders all package tiers with badges and prices", () => {
      render(<PortfolioPackageSummary onViewPlans={vi.fn()} />);
      expect(screen.getByText("BASIC")).toBeInTheDocument();
      expect(screen.getByText("₹2.5L+")).toBeInTheDocument();
      expect(screen.getByText("ADVANCED")).toBeInTheDocument();
      expect(screen.getByText("₹5L+")).toBeInTheDocument();
      expect(screen.getByText("LUXURY")).toBeInTheDocument();
      expect(screen.getByText("₹15L+")).toBeInTheDocument();
    });

    it("renders Send Enquiry and View Plans buttons and triggers callbacks", () => {
      const handleViewPlans = vi.fn();
      const handleSendEnquiry = vi.fn();
      render(
        <PortfolioPackageSummary
          onViewPlans={handleViewPlans}
          onSendEnquiry={handleSendEnquiry}
        />,
      );

      const sendEnquiryBtn = screen.getByRole("button", {
        name: /send enquiry/i,
      });
      const viewPlansBtn = screen.getByRole("button", { name: /view plans/i });

      expect(sendEnquiryBtn).toBeInTheDocument();
      expect(viewPlansBtn).toBeInTheDocument();

      fireEvent.click(sendEnquiryBtn);
      expect(handleSendEnquiry).toHaveBeenCalledTimes(1);

      fireEvent.click(viewPlansBtn);
      expect(handleViewPlans).toHaveBeenCalledTimes(1);
    });

    it("opens 3-dot menu and renders Edit and Hide options", () => {
      render(<PortfolioPackageSummary onViewPlans={vi.fn()} isOwner={true} />);
      const optionsBtn = screen.getByRole("button", { name: /package card options/i });
      expect(optionsBtn).toBeInTheDocument();

      fireEvent.click(optionsBtn);
      expect(screen.getByRole("menuitem", { name: /edit/i })).toBeInTheDocument();
      expect(screen.getByRole("menuitem", { name: /hide/i })).toBeInTheDocument();
    });

    it("triggers onHide callback when clicking Hide option", () => {
      const handleHide = vi.fn();
      render(<PortfolioPackageSummary onViewPlans={vi.fn()} isOwner={true} onHide={handleHide} />);

      const optionsBtn = screen.getByRole("button", { name: /package card options/i });
      fireEvent.click(optionsBtn);

      const hideBtn = screen.getByRole("menuitem", { name: /hide/i });
      fireEvent.click(hideBtn);

      expect(handleHide).toHaveBeenCalledTimes(1);
    });

    it("opens Edit modal, updates headline and rates, and saves changes", () => {
      const handleSave = vi.fn();
      render(
        <PortfolioPackageSummary
          onViewPlans={vi.fn()}
          isOwner={true}
          onSave={handleSave}
        />,
      );

      const optionsBtn = screen.getByRole("button", { name: /package card options/i });
      fireEvent.click(optionsBtn);

      const editBtn = screen.getByRole("menuitem", { name: /edit/i });
      fireEvent.click(editBtn);

      // Modal is open
      expect(screen.getByRole("heading", { name: /edit package summary/i })).toBeInTheDocument();

      const titleInput = screen.getByLabelText(/headline title/i) as HTMLInputElement;
      fireEvent.change(titleInput, { target: { value: "Premium Design packages starting from ₹3.5 Lakhs" } });

      const basicRateInput = screen.getByLabelText(/basic tier rate/i) as HTMLInputElement;
      fireEvent.change(basicRateInput, { target: { value: "₹3.5L+" } });

      const saveBtn = screen.getByRole("button", { name: /save changes/i });
      fireEvent.click(saveBtn);

      // Verify updated values on card
      expect(screen.getByText("Premium Design packages starting from ₹3.5 Lakhs")).toBeInTheDocument();
      expect(screen.getByText("₹3.5L+")).toBeInTheDocument();
      expect(handleSave).toHaveBeenCalledTimes(1);
    });
  });

  describe("PortfolioProfileHeader Component", () => {
    it("renders practice name, profession, location and skills", () => {
      render(
        <PortfolioProfileHeader
          isOwner={true}
          profile={MOCK_PROFILE}
          onProfileChange={vi.fn()}
        />,
      );

      expect(screen.getByText("Arjun Architects")).toBeInTheDocument();
      expect(
        screen.getByText(
          "Architect • Residential Designer • 3D Visualization Expert",
        ),
      ).toBeInTheDocument();
      expect(screen.getByText("Kochi, Kerala")).toBeInTheDocument();
      expect(screen.getByText("Architecture")).toBeInTheDocument();
      expect(screen.getByText("Interior Design")).toBeInTheDocument();
      expect(screen.getByText("Project Coordination")).toBeInTheDocument();
      expect(screen.getByText("+2 more")).toBeInTheDocument();
    });

    it("calls onCameraClick when camera button is clicked", () => {
      const handleCamera = vi.fn();
      render(
        <PortfolioProfileHeader
          isOwner={true}
          profile={MOCK_PROFILE}
          onProfileChange={vi.fn()}
          onCameraClick={handleCamera}
        />,
      );

      const cameraBtn = screen.getByRole("button", { name: /upload photo/i });
      fireEvent.click(cameraBtn);
      expect(handleCamera).toHaveBeenCalledTimes(1);
    });
  });

  describe("PortfolioCoverBanner Component", () => {
    it("renders banner image and actions", () => {
      render(
        <PortfolioCoverBanner
          isOwner={true}
          profile={MOCK_PROFILE}
          coverImageUrl={MOCK_PROFILE.coverImageUrl}
          onCoverSelected={vi.fn()}
          onEdit={vi.fn()}
        />,
      );

      expect(
        screen.getByLabelText("Portfolio cover"),
      ).toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: /edit portfolio/i }),
      ).not.toBeInTheDocument();
      expect(screen.getByRole("button", { name: /share/i })).toBeInTheDocument();
    });
  });

  describe("PortfolioTabs Component", () => {
    it("renders navigation tabs and triggers tab change", () => {
      const handleTabChange = vi.fn();
      render(
        <PortfolioTabs
          activeTab="projects"
          isOwner={true}
          onAddProject={vi.fn()}
          onTabChange={handleTabChange}
        />,
      );

      expect(screen.getByRole("tab", { name: /projects/i })).toBeInTheDocument();
      expect(
        screen.getByRole("tab", { name: /case studies/i }),
      ).toBeInTheDocument();
      expect(screen.getByRole("tab", { name: /tagged/i })).toBeInTheDocument();
      expect(screen.getByRole("tab", { name: /reviews/i })).toBeInTheDocument();
      expect(screen.getByRole("tab", { name: /pricing/i })).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /add project/i }),
      ).toBeInTheDocument();

      fireEvent.click(screen.getByRole("tab", { name: /pricing/i }));
      expect(handleTabChange).toHaveBeenCalledWith("pricing");
    });
  });
});
