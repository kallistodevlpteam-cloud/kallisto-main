import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { HandsOverview } from "./hands-overview";

const mockPush = vi.fn();
let mockSearchParams = new URLSearchParams();

vi.mock("next/navigation", () => ({
  usePathname: () => "/hands",
  useRouter: () => ({
    push: (url: string) => mockPush(url),
    replace: vi.fn(),
    prefetch: vi.fn(),
    refresh: vi.fn(),
  }),
  useSearchParams: () => mockSearchParams,
}));

describe("Hands overview", () => {
  beforeEach(() => {
    mockPush.mockClear();
    mockSearchParams = new URLSearchParams();
    vi.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  async function finishOverviewLoad() {
    await act(async () => {
      await vi.advanceTimersByTimeAsync(350);
    });
  }

  it("renders the loading skeleton before the operational overview", async () => {
    render(<HandsOverview />);

    expect(
      screen.getByLabelText("Loading Hands overview"),
    ).toBeInTheDocument();

    await finishOverviewLoad();

    expect(
      screen.getByText("Workers on site today"),
    ).toBeInTheDocument();
    expect(screen.getByText("34")).toBeInTheDocument();
    expect(screen.getAllByText("Active deployments")[0]).toBeInTheDocument();
    expect(screen.getByText("Upcoming workforce demand")).toBeInTheDocument();
  });

  it("opens the workforce request drawer and exposes required-field errors", () => {
    render(<HandsOverview />);

    fireEvent.click(
      screen.getByRole("button", { name: "Request workforce" }),
    );

    const drawer = screen.getByRole("dialog", {
      name: "Request workforce",
    });
    expect(drawer).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: "Submit request" }),
    );

    expect(screen.getByText("Select a project.")).toBeInTheDocument();
    expect(screen.getByText("Select a worker trade.")).toBeInTheDocument();
    expect(
      screen.getByText("Enter a worker count greater than zero."),
    ).toBeInTheDocument();

    fireEvent.keyDown(document, { key: "Escape" });
    expect(
      screen.queryByRole("dialog", { name: "Request workforce" }),
    ).not.toBeInTheDocument();
  });

  it("opens deployment details from a semantic table row", async () => {
    render(<HandsOverview />);
    await finishOverviewLoad();

    fireEvent.click(
      screen.getByLabelText("Open deployment for Nila Residence"),
    );

    expect(
      screen.getByRole("dialog", { name: "Nila Residence" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Two workers have not checked in. Review today's attendance before confirming the daily record.")).toBeInTheDocument();
  });

  it("synchronizes tab selections through the Hands URL", () => {
    render(<HandsOverview />);

    fireEvent.click(screen.getByRole("tab", { name: "Attendance" }));

    expect(mockPush).toHaveBeenCalledWith("/hands?tab=attendance");
  });

  it("renders a clean placeholder for non-overview tabs", () => {
    mockSearchParams = new URLSearchParams("tab=payments");

    render(<HandsOverview />);

    expect(
      screen.getByRole("heading", { name: "Labour payments" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Return to overview" }),
    ).toBeInTheDocument();
  });
});
