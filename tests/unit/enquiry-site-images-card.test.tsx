import React from "react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { EnquirySiteImagesCard } from "../../features/enquiries/detail/components/enquiry-site-images-card";

const BACKEND_SITE_IMAGES = [
  "/assets/nila-thumb1.jpg",
  "/assets/nila-thumb2.jpg",
  "/assets/nila-thumb3.jpg",
  "/assets/nila-thumb3.jpg",
  "/assets/nila-hero.jpg",
  "/assets/nila-hero-modern.jpg",
  "/assets/project-banner.jpg",
];

describe("EnquirySiteImagesCard", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders card title, 4 thumbnails, overflow tile, and collapse toggle from backend images", () => {
    const { container } = render(
      <EnquirySiteImagesCard images={BACKEND_SITE_IMAGES} />
    );

    expect(screen.getByText("Site Images Preview")).toBeInTheDocument();
    expect(screen.getByText("(7)")).toBeInTheDocument();
    expect(screen.getByText("+3")).toBeInTheDocument();
    expect(screen.getByText("more")).toBeInTheDocument();

    // 1 header toggle + 4 thumbnails + 1 overflow = 6
    expect(container.querySelectorAll("button").length).toBe(6);

    expect(
      screen.getByRole("button", { name: "View site image 1" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("img", { name: "Site image 1" })
    ).toHaveAttribute("src", expect.stringContaining("nila-thumb1"));
  });

  it("collapses and expands the image grid when the header is clicked", () => {
    const { container } = render(
      <EnquirySiteImagesCard images={BACKEND_SITE_IMAGES} />
    );

    const toggleBtn = container.querySelector("[data-testid='site-images-toggle']") as HTMLElement;
    expect(toggleBtn).toHaveAttribute("aria-expanded", "true");

    // Collapse — grid disappears
    fireEvent.click(toggleBtn);
    expect(toggleBtn).toHaveAttribute("aria-expanded", "false");
    expect(container.querySelectorAll("button").length).toBe(1); // only header toggle

    // Expand — grid reappears with all 5 controls (4 thumbs + overflow)
    fireEvent.click(toggleBtn);
    expect(toggleBtn).toHaveAttribute("aria-expanded", "true");
    expect(container.querySelectorAll("button").length).toBe(6);
  });

  it("shows no overflow tile when there are four or fewer backend images", () => {
    render(<EnquirySiteImagesCard images={BACKEND_SITE_IMAGES.slice(0, 4)} />);

    expect(screen.getByText("(4)")).toBeInTheDocument();
    expect(screen.queryByText("more")).not.toBeInTheDocument();
  });

  it("renders an empty state when the backend has no site images", () => {
    render(<EnquirySiteImagesCard images={[]} />);

    expect(screen.getByText("(0)")).toBeInTheDocument();
    expect(
      screen.getByText("No site images have been shared yet.")
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /View site image/i })).not.toBeInTheDocument();
  });

  it("handles image click and view-all clicks", () => {
    const handleImageClick = vi.fn();
    const handleViewAll = vi.fn();

    const { container } = render(
      <EnquirySiteImagesCard
        images={BACKEND_SITE_IMAGES}
        onImageClick={handleImageClick}
        onViewAll={handleViewAll}
      />
    );

    const buttons = container.querySelectorAll("button");
    // buttons[0] = header toggle, buttons[1..4] = thumbnails, buttons[5] = overflow
    fireEvent.click(buttons[1]);
    expect(handleImageClick).toHaveBeenCalledWith(0);

    fireEvent.click(buttons[5]);
    expect(handleViewAll).toHaveBeenCalledTimes(1);
  });
});