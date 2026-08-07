import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { HubWorkspace } from "@/features/hub/components/hub-workspace";
import { HUB_MOCK_WORKSPACE_DATA } from "@/features/hub/services/hub.mock";

afterEach(cleanup);

describe("Hub procurement workspace", () => {
  it(
    "renders the project-bound overview, actions, pipeline, and request workspace",
    async () => {
      render(
        <HubWorkspace
          loadWorkspace={async () => HUB_MOCK_WORKSPACE_DATA}
        />,
      );

      expect(
        await screen.findByRole("heading", { level: 1, name: "Hub" }),
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          "Source materials, compare supplier quotations, and track project deliveries.",
        ),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Explore Hub" }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "+ Create material request" }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("tab", { name: /Requirements/i }),
      ).toHaveAttribute("aria-selected", "true");

      expect(
        screen.getByRole("row", { name: /Ground floor concrete/i }),
      ).toBeInTheDocument();
      expect(
        screen.queryByRole("row", { name: /Bathroom fixtures/i }),
      ).not.toBeInTheDocument();
    },
    20_000,
  );

  it(
    "updates the request list through project, stage, search, and attention controls",
    async () => {
      render(
        <HubWorkspace
          loadWorkspace={async () => HUB_MOCK_WORKSPACE_DATA}
        />,
      );

      await screen.findByRole("heading", { level: 1, name: "Hub" });

      fireEvent.change(screen.getByLabelText("Filter by project"), {
        target: { value: "all" },
      });
      expect(
        screen.getByRole("row", { name: /Bathroom fixtures/i }),
      ).toBeInTheDocument();

      fireEvent.click(screen.getByRole("tab", { name: /Approval/i }));
      expect(
        screen.getByRole("row", { name: /Bathroom fixtures/i }),
      ).toBeInTheDocument();
      expect(
        screen.queryByRole("row", { name: /Ground floor concrete/i }),
      ).not.toBeInTheDocument();

      fireEvent.click(screen.getByRole("tab", { name: /Requirements/i }));
      fireEvent.change(screen.getByLabelText("Search material requests"), {
        target: { value: "electrical" },
      });
      expect(
        screen.getByRole("row", { name: /Electrical first fix/i }),
      ).toBeInTheDocument();
      expect(
        screen.queryByRole("row", { name: /Structural steel/i }),
      ).not.toBeInTheDocument();

      fireEvent.change(screen.getByLabelText("Search material requests"), {
        target: { value: "" },
      });
      fireEvent.click(screen.getByRole("switch", { name: "Needs attention" }));
      expect(
        screen.queryByRole("row", { name: /Structural steel/i }),
      ).not.toBeInTheDocument();
    },
    20_000,
  );

  it("supports keyboard row selection and renders loading and error states", async () => {
    const { unmount } = render(
      <HubWorkspace
        loadWorkspace={async () => HUB_MOCK_WORKSPACE_DATA}
      />,
    );

    const concreteRow = await screen.findByRole("row", {
      name: /Ground floor concrete/i,
    });
    fireEvent.keyDown(concreteRow, { key: "Enter" });
    expect(concreteRow).toHaveAttribute("aria-current", "true");
    unmount();

    render(
      <HubWorkspace
        loadWorkspace={() => new Promise(() => undefined)}
      />,
    );
    expect(
      screen.getByLabelText("Loading Hub procurement workspace"),
    ).toHaveAttribute("aria-busy", "true");
    cleanup();

    render(
      <HubWorkspace
        loadWorkspace={async () => {
          throw new Error("Supplier service unavailable");
        }}
      />,
    );
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Supplier service unavailable",
    );
    expect(
      screen.getByRole("button", { name: "Retry" }),
    ).toBeInTheDocument();
  });
});
