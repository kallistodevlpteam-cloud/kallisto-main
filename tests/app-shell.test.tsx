import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { AppShell } from "../components/layout/app-shell";
import { isSidebarItemActive, SIDEBAR_NAVIGATION } from "../components/layout/sidebar-navigation";
import { homeWorkspaceService } from "../services/repositories/home-workspace-service";

beforeEach(() => {
  Object.defineProperty(window, "innerWidth", {
    writable: true,
    configurable: true,
    value: 1920,
  });
});

afterEach(cleanup);

describe("AppShell", () => {
  it("uses the required workflow hierarchy from one navigation configuration", () => {
    expect(SIDEBAR_NAVIGATION.map((item) => item.label)).toEqual([
      "Home",
      "Enquiries",
      "Projects",
      "Hive Studio",
      "Calendar",
      "Team",
      "Payments",
      "Analytics",
      "Portfolio",
      "Hub",
      "Hands",
      "Basics",
      "Developer",
      "More tools",
    ]);
  });

  it("matches direct and nested navigation routes", () => {
    expect(isSidebarItemActive("/", "/home")).toBe(true);
    expect(isSidebarItemActive("/projects/residence-24", "/projects")).toBe(true);
    expect(isSidebarItemActive("/project-settings", "/projects")).toBe(false);
  });

  it("loads the Enquiries badge from the workspace data source", async () => {
    render(<AppShell />);

    expect(await screen.findByLabelText("4 pending enquiries")).toHaveTextContent("4");
    expect(await homeWorkspaceService.getPendingEnquiryCount()).toBe(4);
  });

  it("renders the new section labels without the removed Pinned label", () => {
    render(<AppShell />);

    expect(screen.getByText("Work")).toBeInTheDocument();
    expect(screen.getByText("Business")).toBeInTheDocument();
    expect(screen.getByText("Presence")).toBeInTheDocument();
    expect(screen.getByText("Connectors")).toBeInTheDocument();
    expect(screen.queryByText("Pinned")).not.toBeInTheDocument();
  });

  it("opens and closes the Odin workspace", () => {
    render(<AppShell />);

    const askButton = screen.getByRole("button", { name: /^ask odin$/i });
    expect(screen.queryByRole("complementary", { name: /odin assistant/i })).not.toBeInTheDocument();

    fireEvent.click(askButton);
    expect(askButton).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("complementary", { name: /odin assistant/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /close assistant panel/i }));
    expect(screen.queryByRole("complementary", { name: /odin assistant/i })).not.toBeInTheDocument();
  });

  it("toggles sidebar between expanded and collapsed modes", () => {
    render(<AppShell />);

    const collapseButton = screen.getAllByRole("button", { name: /collapse sidebar/i })[0];
    expect(screen.getByRole("complementary", { name: /primary navigation/i })).toBeInTheDocument();

    fireEvent.click(collapseButton);
    expect(screen.getByRole("complementary", { name: /compact navigation/i })).toBeInTheDocument();

    const expandButton = screen.getAllByRole("button", { name: /expand sidebar/i })[0];
    fireEvent.click(expandButton);
    expect(screen.getByRole("complementary", { name: /primary navigation/i })).toBeInTheDocument();
  });

  it("opens and closes mobile navigation drawer", () => {
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 800,
    });

    render(<AppShell />);

    fireEvent.click(screen.getByRole("button", { name: /open navigation/i }));
    expect(screen.getByRole("button", { name: /close navigation/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /close navigation/i }));
    expect(screen.queryByRole("button", { name: /close navigation/i })).not.toBeInTheDocument();
  });
});

