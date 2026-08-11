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

  it("renders backend-provided site image URLs without fabricating fallbacks", () => {
    const { container } = render(
      <EnquirySiteImagesCard
        title="All Site Images"
        totalCount={2}
        images={[
          { id: "site-1", src: "/assets/nila-thumb1.jpg", alt: "Site image 1" },
          { id: "site-2", src: "/assets/scattered.webp", alt: "Site image 2" },
        ]}
      />
    );

    // 2 normal thumbnails + 1 overflow tile reusing the first image
    const images = container.querySelectorAll("img");
    expect(images.length).toBeGreaterThanOrEqual(2);
    const srcs = Array.from(images).map((img) => img.getAttribute("src") ?? "");
    expect(srcs.some((src) => src.includes("nila-thumb1.jpg"))).toBe(true);
    expect(srcs.some((src) => src.includes("scattered.webp"))).toBe(true);
    expect(srcs.some((src) => src.includes("project-banner.jpg"))).toBe(false);
    expect(container.querySelectorAll("button")[0]).toHaveTextContent("All Site Images");
  });

  it("shows an empty state when the backend provides no site images", () => {
    const { container } = render(
      <EnquirySiteImagesCard title="All Site Images" totalCount={0} images={[]} />
    );

    expect(container.querySelector("p[aria-label='No site images available']")).toHaveTextContent(
      "No site images have been shared yet."
    );
    expect(container.querySelectorAll("img")).toHaveLength(0);
    expect(container.querySelectorAll("button")).toHaveLength(1);
  });
});
