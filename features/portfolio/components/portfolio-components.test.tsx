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
        screen.getByRole("button", { name: /edit portfolio/i }),
      ).toBeInTheDocument();
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
