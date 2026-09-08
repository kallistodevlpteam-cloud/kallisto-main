import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ActiveDeploymentWorkspace } from "@/features/hands/components/active-deployment-workspace";
import { getDeploymentById } from "@/features/hands/services/hands.mock";

// Mock next/image
vi.mock("next/image", () => ({
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} alt={props.alt || "mock image"} />;
  },
}));

// Mock next/navigation
vi.mock("next/navigation", () => ({
  usePathname: () => "/hands/deployments/deployment-nila",
  useRouter: () => ({
    push: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
}));

describe("ActiveDeploymentWorkspace Component", () => {
  const deployment = getDeploymentById("deployment-nila")!;

  it("renders dedicated active deployment project page with title and site assignment", () => {
    render(<ActiveDeploymentWorkspace deployment={deployment} basePath="/hands" />);

    expect(screen.getAllByText("Nila Residence").length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Thiruvananthapuram, Kerala/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText("8 masons · 10 helpers").length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Rajeev K\./i).length).toBeGreaterThan(0);
  });

  it("displays Labour Contractor Profiles with verified badges and details", () => {
    render(<ActiveDeploymentWorkspace deployment={deployment} basePath="/hands" />);

    expect(screen.getAllByText("Apex Integrated Civil").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Malabar Site Crew").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Kallisto Civil Guild").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Verified Site Workforce").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Rajan K.").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Gireesh Kumar").length).toBeGreaterThan(0);
  });

  it("renders today's site activity and supervisor site log", () => {
    render(<ActiveDeploymentWorkspace deployment={deployment} basePath="/hands" />);

    expect(
      screen.getAllByText(/First-floor brick masonry & lintel level preparation/i).length,
    ).toBeGreaterThan(0);
    expect(screen.getAllByText(/Site supervisor log/i).length).toBeGreaterThan(0);
  });

  it("opens request workers drawer when clicking Request Workers button", () => {
    render(<ActiveDeploymentWorkspace deployment={deployment} basePath="/hands" />);

    const requestBtns = screen.getAllByRole("button", { name: /Request Workers/i });
    expect(requestBtns.length).toBeGreaterThan(0);
    fireEvent.click(requestBtns[0]);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
});
