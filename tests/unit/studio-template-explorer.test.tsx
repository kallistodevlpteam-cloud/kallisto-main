import { render, screen, cleanup } from "@testing-library/react";
import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { StudioCreatePage } from "@/features/studio/components/studio-create-page";

// Mock next/image & next/navigation
vi.mock("next/image", () => ({
  __esModule: true,
  default: ({ fill, unoptimized, ...props }: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} alt={props.alt || "mocked image"} />;
  },
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
  usePathname: () => "/studio",
  useSearchParams: () => new URLSearchParams(),
}));

describe("StudioCreatePage", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders Hive Studio idle workspace elements", () => {
    render(<StudioCreatePage />);
    expect(screen.getByText(/What should we work on in/i)).toBeDefined();
    expect(screen.getByRole("textbox", { name: /describe what you want hive studio/i })).toBeDefined();
  });

  it("renders updated intent options grid", () => {
    render(<StudioCreatePage />);
    // Updated intent card titles as per current design
    expect(screen.getByText("Explore project")).toBeDefined();
    expect(screen.getByText("Create an output")).toBeDefined();
  });

  it("renders command composer and voice action controls", () => {
    render(<StudioCreatePage />);
    expect(screen.getByRole("button", { name: "Voice mode" })).toBeDefined();
  });

  it("composer textarea has accessible aria-label", () => {
    render(<StudioCreatePage />);
    const textarea = screen.getByRole("textbox", {
      name: /describe what you want hive studio/i,
    });
    expect(textarea).toBeDefined();
  });
});
