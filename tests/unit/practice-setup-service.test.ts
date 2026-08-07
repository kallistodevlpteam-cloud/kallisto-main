import { describe, it, expect } from "vitest";
import {
  resolveProgressState,
  practiceSetupService,
} from "@/services/repositories/practice-setup-service";

describe("Practice Setup Progress State Resolver", () => {
  it("resolves 0-19% as critical (red, Action required)", () => {
    expect(resolveProgressState(0)).toEqual({
      state: "critical",
      colour: "red",
      label: "Action required",
    });
    expect(resolveProgressState(15)).toEqual({
      state: "critical",
      colour: "red",
      label: "Action required",
    });
    expect(resolveProgressState(19)).toEqual({
      state: "critical",
      colour: "red",
      label: "Action required",
    });
  });

  it("resolves 20-39% as low (orange, Needs attention)", () => {
    expect(resolveProgressState(20)).toEqual({
      state: "low",
      colour: "orange",
      label: "Needs attention",
    });
    expect(resolveProgressState(35)).toEqual({
      state: "low",
      colour: "orange",
      label: "Needs attention",
    });
    expect(resolveProgressState(39)).toEqual({
      state: "low",
      colour: "orange",
      label: "Needs attention",
    });
  });

  it("resolves 40-59% as progress (amber, In progress)", () => {
    expect(resolveProgressState(40)).toEqual({
      state: "progress",
      colour: "amber",
      label: "In progress",
    });
    expect(resolveProgressState(50)).toEqual({
      state: "progress",
      colour: "amber",
      label: "In progress",
    });
    expect(resolveProgressState(59)).toEqual({
      state: "progress",
      colour: "amber",
      label: "In progress",
    });
  });

  it("resolves 60-79% as good (blue, Almost ready)", () => {
    expect(resolveProgressState(60)).toEqual({
      state: "good",
      colour: "blue",
      label: "Almost ready",
    });
    expect(resolveProgressState(74)).toEqual({
      state: "good",
      colour: "blue",
      label: "Almost ready",
    });
    expect(resolveProgressState(79)).toEqual({
      state: "good",
      colour: "blue",
      label: "Almost ready",
    });
  });

  it("resolves 80-99% as strong (green, Final steps)", () => {
    expect(resolveProgressState(80)).toEqual({
      state: "strong",
      colour: "green",
      label: "Final steps",
    });
    expect(resolveProgressState(95)).toEqual({
      state: "strong",
      colour: "green",
      label: "Final steps",
    });
    expect(resolveProgressState(99)).toEqual({
      state: "strong",
      colour: "green",
      label: "Final steps",
    });
  });

  it("resolves 100% as complete (emerald, Complete)", () => {
    expect(resolveProgressState(100)).toEqual({
      state: "complete",
      colour: "emerald",
      label: "Complete",
    });
  });
});

describe("PracticeSetupService Dynamic Progress Logic", () => {
  it("derives percentage, stages, and progressState from authoritative state", () => {
    const progress = practiceSetupService.getProgress();
    expect(progress.totalPercentage).toBeGreaterThanOrEqual(0);
    expect(progress.progressState.label).toBeDefined();
    expect(progress.stages.length).toBe(4);
  });

  it("handles 100% completion and acknowledgment to hide setup card", () => {
    // Complete all required steps
    practiceSetupService.updateState({
      accountSetup: {
        name: "Arjun Menon",
        phone: "+91 98470 12345",
        email: "arjun@arjunarchitects.com",
        profession: "Lead Architect",
      },
      businessProfile: {
        companyName: "Arjun Architects",
        category: "Architecture",
        location: "Kochi",
        services: ["Residential"],
        contactDetails: "+91 98470 12345",
      },
      portfolio: {
        completedWorksCount: 3,
        hasCoverImage: true,
        hasProjectCategory: true,
        hasShortDescription: true,
      },
      verification: {
        hasIdentityDoc: true,
        hasBusinessProof: true,
        hasBankInfo: true,
        isSubmitted: true,
        status: "approved",
      },
      isAcknowledged: false,
    });

    const completedProgress = practiceSetupService.getProgress();
    expect(completedProgress.totalPercentage).toBe(100);
    expect(completedProgress.isComplete).toBe(true);
    expect(completedProgress.progressState.state).toBe("complete");
    expect(completedProgress.progressState.label).toBe("Complete");

    // Acknowledge completion removes card
    const acknowledgedProgress = practiceSetupService.acknowledgeCompletion();
    expect(acknowledgedProgress.displayMode).toBe("hidden");
  });
});
