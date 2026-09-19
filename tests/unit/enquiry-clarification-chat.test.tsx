import React from "react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { EnquiryClarificationChat } from "@/features/enquiries/detail/components/enquiry-clarification-chat";
import { EnquiryDetailWorkspace } from "@/features/enquiries/detail/components/enquiry-detail-workspace";

vi.mock("next/navigation", () => ({
  usePathname: () => "/client/enquiries/prj-9",
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
}));

describe("Enquiry Clarification Chat", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders messages and allows client to reply to service provider question", () => {
    const handleStatusChange = vi.fn();
    const handleStageChange = vi.fn();
    const handleSendProposal = vi.fn();

    render(
      <EnquiryClarificationChat
        enquiryId="prj-9"
        isClient={true}
        providerName="Kallisto Studio Architects"
        clientName="Kavita Pillai"
        currentStage="clarification"
        onClientStatusChange={handleStatusChange}
        onStageChange={handleStageChange}
        onSendProposal={handleSendProposal}
      />
    );

    // Displays chat title and service provider's initial question
    expect(screen.getByText("Messages & Clarifications")).toBeDefined();
    expect(
      screen.getByText(/Please confirm whether the quoted budget includes furniture/i)
    ).toBeDefined();

    // Client replies
    const replyInput = screen.getByPlaceholderText("Type a message...");
    expect(replyInput).toBeDefined();

    fireEvent.change(replyInput, {
      target: {
        value: "Yes, the ₹95L budget includes loose furniture and lighting fixtures.",
      },
    });

    const sendBtn = screen.getByRole("button", { name: /Send message/i });
    fireEvent.click(sendBtn);

    // Client message appears in the chat
    expect(
      screen.getByText(
        "Yes, the ₹95L budget includes loose furniture and lighting fixtures."
      )
    ).toBeDefined();

    // Status change callback was called
    expect(handleStatusChange).toHaveBeenCalledWith("Clarification Provided");
  });

  it("renders chat section on client enquiry detail workspace (such as prj-9 and prj-8) below ODIN Studio Insights", () => {
    // prj-9 has status "Revision Requested" -> chat is rendered below ODIN Studio Insights
    const { unmount } = render(<EnquiryDetailWorkspace enquiryId="prj-9" isClient={true} />);
    expect(screen.getByLabelText("Enquiry clarifications chat")).toBeDefined();
    expect(screen.getByText(/Please confirm whether the quoted budget includes furniture/i)).toBeDefined();
    unmount();

    // prj-8 has status "Proposal Received" -> chat is rendered below ODIN Studio Insights
    render(<EnquiryDetailWorkspace enquiryId="prj-8" isClient={true} />);
    expect(screen.getByLabelText("Enquiry clarifications chat")).toBeDefined();
  });
});
