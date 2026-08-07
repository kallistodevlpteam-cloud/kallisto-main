import {
  AddFinanceTransactionResult,
  CreateFinanceTransactionInput,
  FinanceAttentionItem,
  ProjectFinanceRecord,
  ProjectFinanceSnapshot,
  ProjectFinanceTransaction,
} from "../types/project-finance.types";
import {
  calculateBudgetCategorySnapshots,
  calculateProjectFinanceSummary,
} from "../utils/calculate-project-finance";
import { isIntegerPaise } from "../utils/format-inr";
import { createMockProjectFinanceRecord } from "./project-finance.mock";

export interface ProjectFinanceService {
  getProjectFinance(
    projectId: string,
    projectName: string,
    projectCode: string
  ): Promise<ProjectFinanceSnapshot>;
  addTransaction(
    projectId: string,
    input: CreateFinanceTransactionInput
  ): Promise<AddFinanceTransactionResult>;
}

function createAttentionItems(
  record: ProjectFinanceRecord
): FinanceAttentionItem[] {
  const overdueInvoices = record.invoices.filter(
    (invoice) => invoice.status === "overdue"
  );
  const pendingExpenses = record.transactions.filter(
    (transaction) =>
      transaction.type === "expense" && transaction.status === "pending"
  );
  const nextInvoiceReadyMilestone = record.milestones.find(
    (milestone) => milestone.status === "invoice_ready"
  );
  const items: FinanceAttentionItem[] = [];

  if (overdueInvoices.length > 0) {
    items.push({
      id: "attention-overdue-invoices",
      label: `${overdueInvoices.length} overdue client ${
        overdueInvoices.length === 1 ? "invoice" : "invoices"
      }`,
      tone: "danger",
      targetView: "invoices",
    });
  }

  if (pendingExpenses.length > 0) {
    items.push({
      id: "attention-pending-expenses",
      label: `${pendingExpenses.length} expenses awaiting approval`,
      tone: "warning",
      targetView: "transactions",
    });
  }

  if (nextInvoiceReadyMilestone) {
    items.push({
      id: "attention-payment-due",
      label: "Milestone payment due in 3 days",
      tone: "warning",
      targetView: "milestones",
    });
  }

  return items;
}

function sortTransactions(
  transactions: ProjectFinanceTransaction[]
): ProjectFinanceTransaction[] {
  return [...transactions].sort((left, right) => {
    const dateOrder = right.date.localeCompare(left.date);
    return dateOrder === 0 ? right.createdAt.localeCompare(left.createdAt) : dateOrder;
  });
}

function createSnapshot(record: ProjectFinanceRecord): ProjectFinanceSnapshot {
  return {
    projectId: record.projectId,
    projectName: record.projectName,
    projectCode: record.projectCode,
    summary: calculateProjectFinanceSummary(record),
    milestones: [...record.milestones],
    transactions: sortTransactions(record.transactions),
    invoices: [...record.invoices],
    budgetCategories: calculateBudgetCategorySnapshots(record),
    cashFlow: [...record.cashFlow],
    attentionItems: createAttentionItems(record),
    updatedAt: record.updatedAt,
  };
}

function emptyProjectFinanceRecord(
  projectId: string,
  projectName: string,
  projectCode: string
): ProjectFinanceRecord {
  return {
    projectId,
    projectName,
    projectCode,
    baseContractValue: 0,
    currency: "INR",
    variations: [],
    invoices: [],
    milestones: [],
    transactions: [],
    budgetCategories: [],
    cashFlow: [],
    updatedAt: new Date().toISOString(),
  };
}

function cloneRecord(record: ProjectFinanceRecord): ProjectFinanceRecord {
  return structuredClone(record);
}

export class MemoryProjectFinanceService implements ProjectFinanceService {
  private readonly records = new Map<string, ProjectFinanceRecord>();
  private readonly idempotentTransactions = new Map<string, string>();

  constructor(initialRecords: ProjectFinanceRecord[] = []) {
    initialRecords.forEach((record) => {
      this.records.set(record.projectId, cloneRecord(record));
    });
  }

  async getProjectFinance(
    projectId: string,
    projectName: string,
    projectCode: string
  ): Promise<ProjectFinanceSnapshot> {
    let record = this.records.get(projectId);

    if (!record) {
      record = emptyProjectFinanceRecord(projectId, projectName, projectCode);
      this.records.set(projectId, record);
    }

    return createSnapshot(cloneRecord(record));
  }

  async addTransaction(
    projectId: string,
    input: CreateFinanceTransactionInput
  ): Promise<AddFinanceTransactionResult> {
    const record = this.records.get(projectId);
    if (!record) {
      throw new Error("The project finance record could not be found.");
    }

    if (!input.idempotencyKey.trim()) {
      throw new Error("An idempotency key is required.");
    }

    const existingTransactionId = this.idempotentTransactions.get(
      input.idempotencyKey
    );
    if (existingTransactionId) {
      const existingTransaction = record.transactions.find(
        (transaction) => transaction.id === existingTransactionId
      );
      if (existingTransaction) {
        return {
          transaction: structuredClone(existingTransaction),
          snapshot: createSnapshot(cloneRecord(record)),
        };
      }
    }

    if (!isIntegerPaise(input.amount) || input.amount <= 0) {
      throw new Error("Amount must be greater than zero.");
    }

    if (!input.date) {
      throw new Error("Date is required.");
    }

    if (
      (input.type === "expense" || input.type === "commitment") &&
      !input.counterparty?.trim()
    ) {
      throw new Error("Counterparty is required for expenses and commitments.");
    }

    const timestamp = new Date().toISOString();
    const transaction: ProjectFinanceTransaction = {
      id: `finance-transaction-${crypto.randomUUID()}`,
      projectId,
      date: input.date,
      description: input.description.trim() || "Finance transaction",
      type: input.type,
      status: input.type === "client_receipt" ? "paid" : "pending",
      category: input.category,
      counterparty: input.counterparty?.trim() || undefined,
      reference: input.reference?.trim() || undefined,
      milestoneId: input.milestoneId || undefined,
      invoiceId: input.invoiceId || undefined,
      paymentMethod: input.paymentMethod,
      amount: input.amount,
      currency: "INR",
      createdAt: timestamp,
      evidenceFiles: input.evidenceFile
        ? [
            {
              id: `finance-evidence-${crypto.randomUUID()}`,
              name: input.evidenceFile.name,
              url: `memory://finance-evidence/${encodeURIComponent(
                input.evidenceFile.name
              )}`,
              mimeType:
                input.evidenceFile.mimeType || "application/octet-stream",
              uploadedAt: timestamp,
            },
          ]
        : undefined,
    };

    record.transactions.push(transaction);
    record.updatedAt = timestamp;
    this.idempotentTransactions.set(input.idempotencyKey, transaction.id);

    return {
      transaction: structuredClone(transaction),
      snapshot: createSnapshot(cloneRecord(record)),
    };
  }
}

export const projectFinanceService = new MemoryProjectFinanceService([
  createMockProjectFinanceRecord(),
]);
