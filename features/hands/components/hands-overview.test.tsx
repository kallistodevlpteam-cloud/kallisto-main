import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  within,
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

  it("renders the centered hero searchbox landing page on /hands by default", () => {
    render(<HandsOverview />);

    expect(
      screen.getByLabelText("Kallisto Hands Command Hub"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("textbox", {
        name: "Search trades, workforce, site supervisors or projects",
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "MEP" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Masonry" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "MEP" }));
    expect(mockPush).toHaveBeenCalledWith("/hands/trades?q=Electricians");
  });

  it("renders the loading skeleton before the operational dashboard", async () => {
    mockSearchParams = new URLSearchParams("view=dashboard");
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

  it("opens the workforce request drawer from landing and exposes required-field errors", async () => {
    render(<HandsOverview />);

    fireEvent.click(
      screen.getByRole("button", { name: "Request more workers" }),
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

  it("opens deployment details from a semantic table row in dashboard view and allows requesting replacement workers", async () => {
    mockSearchParams = new URLSearchParams("view=dashboard");
    render(<HandsOverview />);
    await finishOverviewLoad();

    fireEvent.click(
      screen.getByLabelText("Open deployment for Nila Residence"),
    );

    expect(
      screen.getByRole("dialog", { name: "Nila Residence" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Two workers have not checked in. Review today's attendance before confirming the daily record.",
      ),
    ).toBeInTheDocument();

    // Verify Today's Activity section
    expect(screen.getByText("Today's activity")).toBeInTheDocument();
    expect(
      screen.getByText(
        "First-floor brick masonry & lintel level preparation",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Perimeter brick masonry & plumb line verification",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Site supervisor log"),
    ).toBeInTheDocument();

    const requestReplacementBtn = screen.getByRole("button", {
      name: "Request replacement / extra workers",
    });
    expect(requestReplacementBtn).toBeInTheDocument();

    fireEvent.click(requestReplacementBtn);

    // Deployment drawer should be closed and workforce request drawer opened with prefilled fields
    expect(
      screen.queryByRole("dialog", { name: "Nila Residence" }),
    ).not.toBeInTheDocument();

    const workforceDrawer = screen.getByRole("dialog", {
      name: "Request workforce",
    });
    expect(workforceDrawer).toBeInTheDocument();

    // Verify prefilled project, trade and worker count inside the drawer
    const drawerScope = within(workforceDrawer);
    const projectSelect = drawerScope.getByLabelText(/Project/i);
    expect(projectSelect).toHaveValue("proj-001");

    const tradeSelect = drawerScope.getByLabelText(/Trade \/ category/i);
    expect(tradeSelect).toHaveValue("Masons");

    const countInput = drawerScope.getByLabelText(/Number of workers/i);
    expect(countInput).toHaveValue(2);
  });

  it("renders pending requests in card format on the requests tab and opens request details drawer", async () => {
    mockSearchParams = new URLSearchParams("tab=requests");
    render(<HandsOverview />);
    await finishOverviewLoad();

    const cardsGrid = screen.getByLabelText("Pending workforce request cards");
    expect(cardsGrid).toBeInTheDocument();

    // Verify project names and requested workers count on cards
    const gridScope = within(cardsGrid);
    expect(gridScope.getByText("Nila Residence")).toBeInTheDocument();
    expect(gridScope.getByText("10 workers")).toBeInTheDocument();
    expect(gridScope.getByText("Green Courtyard")).toBeInTheDocument();
    expect(gridScope.getByText("7 workers")).toBeInTheDocument();

    // Click on a multi-trade request card to open details drawer
    fireEvent.click(
      gridScope.getByRole("button", {
        name: /Multi-trade workforce request for Nila Residence/i,
      }),
    );

    const requestDrawer = screen.getByRole("dialog", {
      name: "Nila Residence",
    });
    expect(requestDrawer).toBeInTheDocument();
    expect(
      within(requestDrawer).getByText(
        "Apex Integrated Civil & Finishing Crew",
      ),
    ).toBeInTheDocument();
    expect(
      within(requestDrawer).getByText("Labour types breakdown"),
    ).toBeInTheDocument();
    expect(
      within(requestDrawer).getByText("Request specification"),
    ).toBeInTheDocument();
  });

  it("synchronizes tab selections through the Hands URL in dashboard view", async () => {
    mockSearchParams = new URLSearchParams("tab=deployments");
    render(<HandsOverview />);
    await finishOverviewLoad();

    fireEvent.click(screen.getByRole("tab", { name: "Attendance" }));

    expect(mockPush).toHaveBeenCalledWith("/hands?tab=attendance");
  });

  it("renders a clean placeholder for non-overview tabs", async () => {
    mockSearchParams = new URLSearchParams("tab=payments");

    render(<HandsOverview />);
    await finishOverviewLoad();

    expect(
      screen.getByRole("heading", { name: "Labour payments" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Return to overview" }),
    ).toBeInTheDocument();
  });
});
