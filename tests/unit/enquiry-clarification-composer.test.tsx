import React from "react";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { EnquiryClarificationComposer } from "@/features/enquiries/detail/components/enquiry-clarification-composer";

describe("EnquiryClarificationComposer Component", () => {
  afterEach(cleanup);

  it("enables send button and sends when attachments are present without text", () => {
    const handleSend = vi.fn();
    render(
      <EnquiryClarificationComposer
        onSend={handleSend}
        attachments={[
          { id: "1", name: "Floor Plan.pdf", type: "image", previewUrl: "https://example.com/1.jpg" },
        ]}
      />
    );

    const sendBtn = screen.getByRole("button", { name: /send clarification/i });
    expect(sendBtn).not.toBeDisabled();

    fireEvent.click(sendBtn);
    expect(handleSend).toHaveBeenCalledTimes(1);
    expect(screen.getByText("Clarification request sent to client")).toBeInTheDocument();
  });

  it("enables send button when text is typed and calls onSend", () => {
    const handleSend = vi.fn();
    render(
      <EnquiryClarificationComposer
        onSend={handleSend}
        attachments={[]}
      />
    );

    const sendBtn = screen.getByRole("button", { name: /send clarification/i });
    expect(sendBtn).toBeDisabled();

    const textarea = screen.getByPlaceholderText(/what information do you need from the client/i);
    fireEvent.change(textarea, { target: { value: "Could you please share the site dimension plan?" } });

    expect(sendBtn).not.toBeDisabled();
    fireEvent.click(sendBtn);

    expect(handleSend).toHaveBeenCalledWith("Could you please share the site dimension plan?");
    expect(screen.getByText("Clarification request sent to client")).toBeInTheDocument();
  });

  it("syncs with updated initialMessage from parent", () => {
    const { rerender } = render(
      <EnquiryClarificationComposer initialMessage="" attachments={[]} />
    );

    const textarea = screen.getByPlaceholderText(/what information do you need from the client/i) as HTMLTextAreaElement;
    expect(textarea.value).toBe("");

    rerender(
      <EnquiryClarificationComposer initialMessage="Question appended from insight" attachments={[]} />
    );

    expect(textarea.value).toBe("Question appended from insight");
  });
});
