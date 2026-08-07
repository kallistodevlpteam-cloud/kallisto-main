import { describe, expect, it } from "vitest";
import { classifyStudioPrompt, normalizePrompt } from "@/features/studio/lib/classify-studio-prompt";

describe("classifyStudioPrompt", () => {
  it("normalizes casing, trailing emojis, and punctuation", () => {
    expect(normalizePrompt("Hi!")).toBe("hi");
    expect(normalizePrompt("HELLO 👋")).toBe("hello");
    expect(normalizePrompt("hoi...  ")).toBe("hoi");
    expect(normalizePrompt("Good Morning!")).toBe("good morning");
  });

  it("classifies common greetings correctly", () => {
    expect(classifyStudioPrompt("hi")).toEqual({ kind: "greeting" });
    expect(classifyStudioPrompt("Hi!")).toEqual({ kind: "greeting" });
    expect(classifyStudioPrompt("HELLO 👋")).toEqual({ kind: "greeting" });
    expect(classifyStudioPrompt("hoi")).toEqual({ kind: "greeting" });
    expect(classifyStudioPrompt("help")).toEqual({ kind: "greeting" });
    expect(classifyStudioPrompt("good morning")).toEqual({ kind: "greeting" });
  });

  it("classifies construction actionable prompts correctly", () => {
    expect(classifyStudioPrompt("Prepare a BOQ for civil package")).toEqual({
      kind: "actionable",
      intent: "create",
      outputType: "boq",
    });

    expect(classifyStudioPrompt("Create a cost estimate")).toEqual({
      kind: "actionable",
      intent: "create",
      outputType: "estimate",
    });

    expect(classifyStudioPrompt("Draft client proposal")).toEqual({
      kind: "actionable",
      intent: "create",
      outputType: "proposal",
    });

    expect(classifyStudioPrompt("Analyse uploaded architectural drawings")).toEqual({
      kind: "actionable",
      intent: "analyse",
    });
  });
});
