import { render, screen, cleanup } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ProviderProfile } from "@/features/basics/components/provider-profile";
import { MOCK_BASICS_PROVIDERS } from "@/features/basics/data/mock-basics-data";
import { availabilityLabels } from "@/features/basics/utils/basics-formatters";

describe("ProviderProfile Redesigned Hero Header", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders the redesigned hero card matching target UI layout", async () => {
    const provider = MOCK_BASICS_PROVIDERS[0];
    const ui = await ProviderProfile({
      providerId: provider.id,
      tab: "services",
    });

    render(ui);

    // 1. Profile hero section
    const heroSection = screen.getByRole("region", {
      name: `${provider.name} Profile Card`,
    });
    expect(heroSection).toBeInTheDocument();

    // 2. Identity block: Provider name and headline
    expect(
      screen.getByRole("heading", { level: 1, name: provider.name }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Verified")).toBeInTheDocument();
    expect(
      screen.getByText(
        provider.headline ||
          `${provider.specializations[0] ?? "Specialist"} in Architectural Design`,
      ),
    ).toBeInTheDocument();

    // 3. Primary expertise
    expect(screen.getByText("Primary expertise:")).toBeInTheDocument();
    expect(screen.getAllByText(provider.specializations[0]).length).toBeGreaterThanOrEqual(1);

    // 4. Contact metadata
    expect(
      screen.getByText(`${provider.location.city}, ${provider.location.state}`),
    ).toBeInTheDocument();
    expect(
      screen.getByText(`${provider.slug}@kallisto.io`),
    ).toBeInTheDocument();

    // 5. Action buttons in hero: Message is present, Edit Profile is removed
    const messageBtn = screen.getByRole("link", { name: "Message" });
    expect(messageBtn).toHaveAttribute(
      "href",
      expect.stringContaining(`providerId=${encodeURIComponent(provider.id)}`),
    );
    expect(screen.queryByRole("link", { name: "Edit Profile" })).not.toBeInTheDocument();

    // 6. Professional verified badge is removed
    expect(screen.queryByText("Professional verified")).not.toBeInTheDocument();

    // 7. Availability badge is rendered in the cover banner
    expect(screen.getByText(availabilityLabels[provider.availability])).toBeInTheDocument();

    // 8. 4-column performance metrics bar with Years of Experience
    const metricsBar = screen.getByLabelText("Provider Performance Metrics");
    expect(metricsBar).toBeInTheDocument();

    expect(screen.getByText("Hours Logged")).toBeInTheDocument();
    expect(screen.getByText("Completed Projects")).toBeInTheDocument();
    expect(screen.getByText("Years of Experience")).toBeInTheDocument();
    expect(screen.getByText(`${provider.yearsOfExperience} yrs`)).toBeInTheDocument();
    expect(screen.queryByText("Active Tasks")).not.toBeInTheDocument();
    expect(screen.getByText("Overall Rating")).toBeInTheDocument();

    expect(screen.getByText(String(provider.completedEngagements))).toBeInTheDocument();
    expect(screen.getByText(new RegExp(`${provider.rating.toFixed(1)}`))).toBeInTheDocument();

    // 6. Tabs are preserved
    expect(screen.getByRole("link", { name: "Services" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Overview" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Experience" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Reviews" })).toBeInTheDocument();

    // 7. Right column order panel is preserved
    expect(
      screen.getByRole("complementary", {
        name: "Place an order with this provider",
      }),
    ).toBeInTheDocument();
  });

  it("renders the redesigned two-column review cards matching reference UI", async () => {
    const provider = MOCK_BASICS_PROVIDERS[0];
    const ui = await ProviderProfile({
      providerId: provider.id,
      tab: "reviews",
    });

    render(ui);

    const review = provider.reviews[0];
    expect(
      screen.getByRole("heading", { level: 3, name: review.reviewerName }),
    ).toBeInTheDocument();
    expect(screen.getByText("Total Spend:")).toBeInTheDocument();
    expect(screen.getByText("Total Review:")).toBeInTheDocument();
    expect(screen.getByText(review.review)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Public Comment" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Direct Message" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: new RegExp(`review by ${review.reviewerName}`),
      }),
    ).toBeInTheDocument();
  });

  it("renders the overview tab with icons for Expertise, Technical capabilities, and Commercial indication", async () => {
    const provider = MOCK_BASICS_PROVIDERS[0];
    const ui = await ProviderProfile({
      providerId: provider.id,
      tab: "overview",
    });

    render(ui);

    expect(
      screen.getByRole("heading", { level: 2, name: /Expertise and project fit/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: /Technical capabilities/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: /Commercial indication/i }),
    ).toBeInTheDocument();
  });

  it("renders Available now badge in the top right of the cover image", async () => {
    const availableProvider = MOCK_BASICS_PROVIDERS.find((p) => p.availability === "available_now")!;
    const ui = await ProviderProfile({
      providerId: availableProvider.id,
      tab: "overview",
    });

    render(ui);

    const badge = screen.getByText("Available now");
    expect(badge).toBeInTheDocument();
    expect(badge.closest("._coverBadgeContainer_1ef131, [class*='coverBadgeContainer']")).toBeInTheDocument();
  });

  it("renders the experience tab with icons for Qualifications and credentials and Practice experience", async () => {
    const provider = MOCK_BASICS_PROVIDERS[0];
    const ui = await ProviderProfile({
      providerId: provider.id,
      tab: "experience",
    });

    render(ui);

    expect(
      screen.getByRole("heading", { level: 2, name: /Qualifications and credentials/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: /Practice experience/i }),
    ).toBeInTheDocument();
  });
});
