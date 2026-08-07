import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { FeedbackPopover } from "../../components/layout/feedback-popover";

afterEach(cleanup);

describe("FeedbackPopover", () => {
  it("does not render when isOpen is false", () => {
    render(<FeedbackPopover isOpen={false} onClose={vi.fn()} />);
    expect(screen.queryByRole("dialog", { name: "Submit Feedback" })).not.toBeInTheDocument();
  });

  it("renders textarea, disclaimer text, and disabled submit button initially", () => {
    render(<FeedbackPopover isOpen={true} onClose={vi.fn()} />);
    expect(screen.getByRole("dialog", { name: "Submit Feedback" })).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Type your feedback here...")).toBeInTheDocument();
    expect(
      screen.getByText("We don't respond to submissions, but we read all of them carefully")
    ).toBeInTheDocument();

    const submitBtn = screen.getByRole("button", { name: "Submit" });
    expect(submitBtn).toBeDisabled();
  });

  it("enables submit button when text is typed and shows success message on submission", async () => {
    const handleClose = vi.fn();
    render(<FeedbackPopover isOpen={true} onClose={handleClose} />);

    const textarea = screen.getByPlaceholderText("Type your feedback here...");
    const submitBtn = screen.getByRole("button", { name: "Submit" });

    fireEvent.change(textarea, { target: { value: "Great workspace improvements!" } });
    expect(submitBtn).not.toBeDisabled();

    fireEvent.click(submitBtn);

    expect(await screen.findByText("Thank you for your feedback!")).toBeInTheDocument();
  });
});
