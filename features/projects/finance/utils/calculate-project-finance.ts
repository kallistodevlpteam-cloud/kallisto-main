import {
  BudgetCategorySnapshot,
  FinanceInvoice,
  FinanceVariation,
  ProjectFinanceRecord,
  ProjectFinanceSummary,
  ProjectFinanceTransaction,
} from "../types/project-finance.types";
import { isIntegerPaise } from "./format-inr";

function requirePaise(value: number, fieldName: string): number {
  if (!isIntegerPaise(value)) {
    throw new Error(`${fieldName} must be an integer paise amount.`);
  }

  return value;
}

function sumPaise(values: number[], fieldName: string): number {
  return values.reduce(
    (total, value) => total + requirePaise(value, fieldName),
    0
  );
}

export function calculateApprovedVariationTotal(
  variations: FinanceVariation[]
): number {
  return sumPaise(
    variations
      .filter((variation) => variation.status === "approved")
      .map((variation) => variation.amount),
    "Approved variation"
  );
}

export function calculateApprovedProjectValue(
  baseContractValue: number,
  variations: FinanceVariation[]
): number {
  return (
    requirePaise(baseContractValue, "Base contract value") +
    calculateApprovedVariationTotal(variations)
  );
}

export function calculateInvoicedAmount(invoices: FinanceInvoice[]): number {
  return sumPaise(
    invoices
      .filter(
        (invoice) =>
          invoice.status !== "draft" && invoice.status !== "cancelled"
      )
      .map((invoice) => invoice.amount),
    "Invoice"
  );
}

export function calculateOverdueAmount(invoices: FinanceInvoice[]): number {
  return sumPaise(
    invoices
      .filter((invoice) => invoice.status === "overdue")
      .map((invoice) =>
        Math.max(
          0,
          requirePaise(invoice.amount, "Overdue invoice") -
            requirePaise(invoice.receivedAmount, "Overdue invoice received")
        )
      ),
    "Overdue amount"
  );
}

export function calculateReceivedAmount(
  transactions: ProjectFinanceTransaction[]
): number {
  return sumPaise(
    transactions
      .filter(
        (transaction) =>
          transaction.type === "client_receipt" &&
          transaction.status === "paid"
      )
      .map((transaction) => transaction.amount),
    "Client receipt"
  );
}

export function calculatePaidExpenses(
  transactions: ProjectFinanceTransaction[]
): number {
  return sumPaise(
    transactions
      .filter(
        (transaction) =>
          transaction.type === "expense" && transaction.status === "paid"
      )
      .map((transaction) => transaction.amount),
    "Paid expense"
  );
}

export function calculateApprovedCommitments(
  transactions: ProjectFinanceTransaction[]
): number {
  return sumPaise(
    transactions
      .filter(
        (transaction) =>
          transaction.type === "commitment" &&
          transaction.status === "approved"
      )
      .map((transaction) => transaction.amount),
    "Approved commitment"
  );
}

export function calculateOutstandingClientAmount(
  invoicedAmount: number,
  receivedAmount: number
): number {
  return (
    requirePaise(invoicedAmount, "Invoiced amount") -
    requirePaise(receivedAmount, "Received amount")
  );
}

export function calculateUnbilledProjectValue(
  approvedProjectValue: number,
  invoicedAmount: number
): number {
  return (
    requirePaise(approvedProjectValue, "Approved project value") -
    requirePaise(invoicedAmount, "Invoiced amount")
  );
}

export function calculateProjectFinanceSummary(
  record: ProjectFinanceRecord
): ProjectFinanceSummary {
  const approvedVariations = calculateApprovedVariationTotal(record.variations);
  const approvedProjectValue =
    requirePaise(record.baseContractValue, "Base contract value") +
    approvedVariations;
  const invoicedAmount = calculateInvoicedAmount(record.invoices);
  const receivedAmount = calculateReceivedAmount(record.transactions);
  const paidExpenses = calculatePaidExpenses(record.transactions);
  const committedExpenses = calculateApprovedCommitments(record.transactions);
  const totalCostExposure = paidExpenses + committedExpenses;

  return {
    projectId: record.projectId,
    approvedProjectValue,
    approvedVariations,
    invoicedAmount,
    receivedAmount,
    paidExpenses,
    committedExpenses,
    availableBalance: approvedProjectValue - totalCostExposure,
    overdueAmount: calculateOverdueAmount(record.invoices),
    outstandingClientAmount: calculateOutstandingClientAmount(
      invoicedAmount,
      receivedAmount
    ),
    unbilledProjectValue: calculateUnbilledProjectValue(
      approvedProjectValue,
      invoicedAmount
    ),
    currency: record.currency,
  };
}

export function calculateBudgetCategorySnapshots(
  record: ProjectFinanceRecord
): BudgetCategorySnapshot[] {
  return record.budgetCategories.map((category) => {
    const paidAmount = sumPaise(
      record.transactions
        .filter(
          (transaction) =>
            transaction.category === category.name &&
            transaction.type === "expense" &&
            transaction.status === "paid"
        )
        .map((transaction) => transaction.amount),
      `${category.name} paid expense`
    );
    const committedAmount = sumPaise(
      record.transactions
        .filter(
          (transaction) =>
            transaction.category === category.name &&
            transaction.type === "commitment" &&
            transaction.status === "approved"
        )
        .map((transaction) => transaction.amount),
      `${category.name} approved commitment`
    );
    const approvedAmount = requirePaise(
      category.approvedAmount,
      `${category.name} approved budget`
    );
    const totalExposure = paidAmount + committedAmount;
    const varianceAmount = approvedAmount - totalExposure;
    const exposurePercent =
      approvedAmount > 0 ? (totalExposure / approvedAmount) * 100 : 0;

    return {
      ...category,
      paidAmount,
      committedAmount,
      varianceAmount,
      exposurePercent,
      varianceState:
        varianceAmount < 0
          ? "over"
          : exposurePercent >= 80
            ? "approaching"
            : "neutral",
    };
  });
}
