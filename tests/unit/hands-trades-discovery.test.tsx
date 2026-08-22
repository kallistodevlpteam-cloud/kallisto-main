import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { HandsTradeDiscovery } from "@/features/hands/components/hands-trade-discovery";

const mockPush = vi.fn();
let mockSearchParams = new URLSearchParams();

vi.mock("next/navigation", () => ({
  usePathname: () => "/hands/trades",
  useRouter: () => ({
    push: (url: string) => mockPush(url),
    replace: vi.fn(),
    prefetch: vi.fn(),
    refresh: vi.fn(),
  }),
  useSearchParams: () => mockSearchParams,
}));

describe("Hands trade discovery search results page", () => {
  beforeEach(() => {
    mockPush.mockClear();
    mockSearchParams = new URLSearchParams();
    vi.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  async function finishLoad() {
    await act(async () => {
      await vi.advanceTimersByTimeAsync(200);
    });
  }

  it("renders verified trade crew results and search header", async () => {
    render(<HandsTradeDiscovery />);
    await finishLoad();

    expect(
      screen.getByRole("textbox", {
        name: "Search trades, workforce, site supervisors or projects",
      }),
    ).toBeInTheDocument();

    expect(screen.getByText("Master Masons & Brickwork Team")).toBeInTheDocument();
    expect(screen.getByText("Certified MEP & Electrical Gang")).toBeInTheDocument();
    expect(screen.getByText("Site QA & Daily Shift Supervisors")).toBeInTheDocument();
  });

  it("filters crews by query parameter", async () => {
    mockSearchParams = new URLSearchParams("q=plumbing");
    render(<HandsTradeDiscovery />);
    await finishLoad();

    expect(
      screen.getByText("Plumbing & Drainage Specialists"),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("Certified MEP & Electrical Gang"),
    ).not.toBeInTheDocument();
  });

  it("opens workforce request drawer prefilled with trade when clicking Request Crew", async () => {
    render(<HandsTradeDiscovery />);
    await finishLoad();

    const requestButtons = screen.getAllByRole("button", {
      name: /Request Master Masons & Brickwork Team/i,
    });
    fireEvent.click(requestButtons[0]);

    expect(
      screen.getByRole("dialog", { name: "Request workforce" }),
    ).toBeInTheDocument();
  });
});
