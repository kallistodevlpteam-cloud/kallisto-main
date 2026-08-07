import { createRef } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { BreadcrumbOverflowMenu } from "@/components/layout/breadcrumb-overflow-menu";
import { ProjectUpdatesPanel } from "@/features/documents/components/project-updates-panel";
import {
  PROJECT_UPDATE_TEXTAREA_MAX_HEIGHT,
  PROJECT_UPDATE_TEXTAREA_MIN_HEIGHT,
  syncProjectUpdateTextareaHeight,
  type UpdatePost,
} from "@/features/documents/hooks/use-project-updates-panel-state";

afterEach(cleanup);

describe("project dashboard Gate 3 hardening", () => {
  it.each([
    [24, PROJECT_UPDATE_TEXTAREA_MIN_HEIGHT, "hidden"],
    [72, 72, "hidden"],
    [144, PROJECT_UPDATE_TEXTAREA_MAX_HEIGHT, "hidden"],
    [240, PROJECT_UPDATE_TEXTAREA_MAX_HEIGHT, "auto"],
  ] as const)(
    "sizes a %ipx textarea to %ipx with %s vertical overflow",
    (scrollHeight, expectedHeight, expectedOverflow) => {
      const textarea = document.createElement("textarea");
      Object.defineProperty(textarea, "scrollHeight", {
        configurable: true,
        value: scrollHeight,
      });

      syncProjectUpdateTextareaHeight(textarea);

      expect(textarea.style.height).toBe(`${expectedHeight}px`);
      expect(textarea.style.overflowY).toBe(expectedOverflow);
      expect(textarea.style.overflowX).toBe("hidden");
    },
  );

  it("resets the composer height after submitting a maximum-height draft", () => {
    render(
      <ProjectUpdatesPanel
        layoutMode="rail"
        open={false}
        panelRef={createRef<HTMLDivElement>()}
        onClose={() => undefined}
      />,
    );
    const textarea = screen.getByLabelText("Share a project update") as HTMLTextAreaElement;
    Object.defineProperty(textarea, "scrollHeight", {
      configurable: true,
      get: () => (textarea.value ? 240 : 48),
    });
    fireEvent.change(textarea, { target: { value: "One\nTwo\nThree\nFour\nFive\nSix\nSeven\nEight\nNine\nTen" } });
    expect(textarea.style.height).toBe("144px");
    expect(textarea.style.overflowY).toBe("auto");

    fireEvent.click(screen.getByRole("button", { name: "Submit update" }));
    expect(textarea).toHaveValue("");
    expect(textarea.style.height).toBe("48px");
    expect(textarea.style.overflowY).toBe("hidden");
  });

  it("keeps an extreme unbroken update token in one accessible feed and composer", () => {
    const token = "https://example.com/" + "a".repeat(3000);
    const update: UpdatePost = {
      id: "long-token",
      authorName: "A".repeat(180),
      avatar: "/assets/arjun-avatar.jpg",
      role: "Project Manager",
      date: "12 May",
      tag: "Action " + "B".repeat(180),
      text: token,
    };

    render(
      <ProjectUpdatesPanel
        layoutMode="rail"
        open={false}
        panelRef={createRef<HTMLDivElement>()}
        onClose={() => undefined}
        initialUpdates={[update]}
      />,
    );

    expect(screen.getByText(token)).toHaveTextContent(token);
    expect(document.querySelectorAll("[data-updates-presentation]")).toHaveLength(1);
    expect(document.querySelectorAll("[data-updates-composer]")).toHaveLength(1);
    expect(screen.getByLabelText("Share a project update")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Select update attachment or action" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Audience: All" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Submit update" })).toBeInTheDocument();
  });

  it("operates the breadcrumb overflow menu with arrows and restores focus on Escape", () => {
    render(
      <ol>
        <BreadcrumbOverflowMenu
          items={[
            { label: "Projects", href: "/projects" },
            { label: "Nila Residence", href: "/projects/proj-001/overview" },
          ]}
        />
      </ol>,
    );
    const trigger = screen.getByRole("button", { name: "Show hidden breadcrumb items" });
    fireEvent.keyDown(trigger, { key: "ArrowDown" });
    expect(screen.getByRole("menu", { name: "Hidden breadcrumb items" })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "Projects" })).toHaveFocus();

    fireEvent.keyDown(screen.getByRole("menu", { name: "Hidden breadcrumb items" }), { key: "ArrowDown" });
    expect(screen.getByRole("menuitem", { name: "Nila Residence" })).toHaveFocus();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it("codifies Gate 3 containment, hit-area, focus, motion, and cleanup contracts", () => {
    const css = readFileSync(resolve(process.cwd(), "app/globals.css"), "utf8");
    const gallerySource = readFileSync(
      resolve(
        process.cwd(),
        "features/documents/components/gallery/project-gallery-viewer.tsx",
      ),
      "utf8",
    );

    expect(css).toContain("--control-hit-area: 40px");
    expect(css).toContain("--project-drawer-duration: 220ms");
    expect(css).toContain(".update-input-card:focus-within");
    expect(css).toContain("overflow-wrap: anywhere");
    expect(css).toContain("word-break: normal");
    expect(css).toContain("overflow-x: hidden");
    expect(css).toContain("animation: none");
    expect(css).not.toContain(".poc-wrapper:not([data-updates-mode])");
    expect(css.match(/\.post-media-banner\s*\{/g)).toHaveLength(1);
    expect(gallerySource).not.toContain("quality={100}");
  });
});
