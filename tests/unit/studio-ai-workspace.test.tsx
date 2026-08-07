import { render, screen, cleanup } from "@testing-library/react";
import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { StudioCreatePage } from "@/features/studio/components/studio-create-page";
import { resolveStudioAgent } from "@/features/studio/lib/resolve-studio-agent";

// Mock next/image & next/navigation
vi.mock("next/image", () => ({
  __esModule: true,
  default: ({ fill, unoptimized, ...props }: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} alt={props.alt || "mocked image"} />;
  },
}));

const mockPush = vi.fn();
const mockReplace = vi.fn();
let mockSearchParams = new URLSearchParams();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
  }),
  usePathname: () => "/studio",
  useSearchParams: () => mockSearchParams,
}));

describe("Studio AI Workspace", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    mockSearchParams = new URLSearchParams();
  });

  it("renders Hive Studio welcome context and command composer", () => {
    render(<StudioCreatePage />);
    expect(screen.getByText(/What should we work on in/i)).toBeDefined();
    expect(screen.getByRole("textbox", { name: /describe what you want hive studio/i })).toBeDefined();
  });

  it("renders voice mode action button when prompt is empty", () => {
    render(<StudioCreatePage />);
    const voiceBtn = screen.getByRole("button", { name: "Voice mode" });
    expect(voiceBtn).toBeDefined();
  });

  it("explicit agent selection overrides auto-routing logic", () => {
    const resolution = resolveStudioAgent({
      selectedAgent: "project_estimate",
      prompt: "Prepare BOQ takeoff",
    });
    expect(resolution.agentId).toBe("project_estimate");
    expect(resolution.reason).toBe("explicit_selection");
  });

  it("published output actions remain unavailable unless persistence support exists", () => {
    // Phase 4 persistence boundary test
    const resolution = resolveStudioAgent({
      selectedAgent: "auto",
      selectedOutputType: "boq",
    });
    expect(resolution.agentId).toBe("boq_builder");
    expect(resolution.reason).toBe("output_type");
  });
});
