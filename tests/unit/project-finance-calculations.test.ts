import { describe, expect, it } from "vitest";
import { createMockProjectFinanceRecord } from "@/features/projects/finance/services/project-finance.mock";
import {
  calculateApprovedCommitments,
  calculateApprovedProjectValue,
  calculateOutstandingClientAmount,
  calculatePaidExpenses,
  calculateProjectFinanceSummary,
} from "@/features/projects/finance/utils/calculate-project-finance";
import {
  parseRupeesToPaise,
  rupeesToPaise,
} from "@/features/projects/finance/utils/format-inr";

const paise = rupeesToPaise;

describe("project finance calculations", () => {
  it("includes only approved variations in approved project value", () => {
    const record = createMockProjectFinanceRecord();

    expect(
      calculateApprovedProjectValue(
        record.baseContractValue,
        record.variations
      )
    ).toBe(paise(5_000_000));
  });

  it("excludes draft, pending and rejected expenses from paid cost", () => {
    const record = createMockProjectFinanceRecord();
    record.transactions.push(
      {
        ...record.transactions[0],
        id: "draft-expense",
        type: "expense",
        status: "draft",
        amount: paise(900_000),
      },
      {
        ...record.transactions[0],
        id: "rejected-expense",
        type: "expense",
        status: "rejected",
        amount: paise(800_000),
      }
    );

    expect(calculatePaidExpenses(record.transactions)).toBe(paise(2_260_000));
  });

  it("adds approved commitments to exposure without treating them as paid", () => {
    const record = createMockProjectFinanceRecord();

    expect(calculateApprovedCommitments(record.transactions)).toBe(
      paise(880_000)
    );
    expect(calculatePaidExpenses(record.transactions)).toBe(paise(2_260_000));
  });

  it("derives available balance and outstanding client amount in integer paise", () => {
    const summary = calculateProjectFinanceSummary(
      createMockProjectFinanceRecord()
    );

    expect(summary.approvedProjectValue).toBe(paise(5_000_000));
    expect(summary.invoicedAmount).toBe(paise(2_650_000));
    expect(summary.receivedAmount).toBe(paise(2_400_000));
    expect(summary.paidExpenses).toBe(paise(2_260_000));
    expect(summary.committedExpenses).toBe(paise(880_000));
    expect(summary.availableBalance).toBe(paise(1_860_000));
    expect(
      calculateOutstandingClientAmount(
        summary.invoicedAmount,
        summary.receivedAmount
      )
    ).toBe(paise(250_000));
  });

  it("parses editable rupee values without floating-point currency arithmetic", () => {
    expect(parseRupeesToPaise("₹1,25,000.50")).toBe(12_500_050);
    expect(parseRupeesToPaise("0")).toBe(0);
    expect(parseRupeesToPaise("")).toBeNull();
    expect(parseRupeesToPaise("12.345")).toBeNull();
    expect(parseRupeesToPaise("-100")).toBeNull();
  });
});
