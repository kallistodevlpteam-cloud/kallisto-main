import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { EnquirySiteImagesCard } from "../../features/enquiries/detail/components/enquiry-site-images-card";

describe("EnquirySiteImagesCard", () => {
  it("renders card title, 4 site thumbnail buttons, the overflow tile, and the collapse toggle", () => {
    const { container } = render(<EnquirySiteImagesCard />);

    expect(screen.getByText("Site Images Preview")).toBeInTheDocument();
    expect(screen.getByText("+3")).toBeInTheDocument();
    expect(screen.getByText("more")).toBeInTheDocument();

    // 1 header toggle + 4 thumbnails + 1 overflow = 6
    expect(container.querySelectorAll("button").length).toBe(6);
  });

  it("collapses and expands the image grid when the header is clicked", () => {
    const { container } = render(<EnquirySiteImagesCard />);

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

  it("handles image click and view-all clicks", () => {
    const handleImageClick = vi.fn();
    const handleViewAll = vi.fn();

    const { container } = render(
      <EnquirySiteImagesCard
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
