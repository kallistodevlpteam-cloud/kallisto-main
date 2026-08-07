import { describe, expect, it } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useStudioComposer } from "@/features/studio/hooks/use-studio-composer";

describe("useStudioComposer Versioning & Draft Restoration", () => {
  it("increments version on prompt change and restores draft correctly", () => {
    const { result } = renderHook(() => useStudioComposer());

    expect(result.current.version).toBe(0);

    act(() => {
      result.current.setPrompt("Initial prompt");
    });

    expect(result.current.version).toBe(1);
    expect(result.current.prompt).toBe("Initial prompt");

    act(() => {
      result.current.restoreDraft({ prompt: "Restored prompt", attachments: [] });
    });

    expect(result.current.version).toBe(2);
    expect(result.current.prompt).toBe("Restored prompt");
  });
});
