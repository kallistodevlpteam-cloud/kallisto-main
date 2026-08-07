export type CurrencyCode = "INR";

/**
 * All finance amounts are integer paise. Formatting is the only place where
 * values are converted to rupees.
 */
export type MoneyAmount = {
  amount: number;
  currency: CurrencyCode;
};

export type FinanceTransactionType =
  | "client_receipt"
  | "expense"
  | "commitment"
  | "refund"
  | "adjustment";

export type FinanceTransactionStatus =
  | "draft"
  | "pending"
  | "approved"
  | "paid"
  | "rejected"
  | "cancelled";

export type PaymentMilestoneStatus =
  | "upcoming"
  | "invoice_ready"
  | "invoice_sent"
  | "partially_paid"
  | "paid"
  | "overdue";

export type FinanceInvoiceStatus =
  | "draft"
  | "sent"
  | "partially_paid"
  | "paid"
  | "overdue"
  | "cancelled";

export type FinanceView =
  | "overview"
  | "milestones"
  | "transactions"
  | "invoices"
  | "reports";

export type CashFlowPeriod = "3" | "6" | "12" | "all";

export interface FinanceEvidence {
  id: string;
  name: string;
  url: string;
  mimeType: string;
  uploadedAt: string;
}

export interface ProjectFinanceSummary {
  projectId: string;
  approvedProjectValue: number;
  approvedVariations: number;
  invoicedAmount: number;
  receivedAmount: number;
  paidExpenses: number;
  committedExpenses: number;
  availableBalance: number;
  overdueAmount: number;
  outstandingClientAmount: number;
  unbilledProjectValue: number;
  currency: CurrencyCode;
}

export interface PaymentMilestone {
  id: string;
  projectId: string;
  title: string;
  plannedDate: string;
  amount: number;
  invoicedAmount: number;
  receivedAmount: number;
  status: PaymentMilestoneStatus;
}

export interface ProjectFinanceTransaction {
  id: string;
  projectId: string;
  date: string;
  description: string;
  type: FinanceTransactionType;
  status: FinanceTransactionStatus;
  category: string;
  counterparty?: string;
  reference?: string;
  milestoneId?: string;
  invoiceId?: string;
  paymentMethod?: string;
  amount: number;
  currency: CurrencyCode;
  evidenceFiles?: FinanceEvidence[];
  createdAt: string;
}

export interface FinanceVariation {
  id: string;
  projectId: string;
  title: string;
  amount: number;
  status: "draft" | "pending" | "approved" | "rejected";
}

export interface FinanceInvoice {
  id: string;
  projectId: string;
  invoiceNumber: string;
  title: string;
  issuedDate: string;
  dueDate: string;
  amount: number;
  receivedAmount: number;
  status: FinanceInvoiceStatus;
  milestoneId?: string;
}

export interface BudgetCategoryAllocation {
  id: string;
  projectId: string;
  name: string;
  approvedAmount: number;
}

export type BudgetVarianceState = "neutral" | "approaching" | "over";

export interface BudgetCategorySnapshot extends BudgetCategoryAllocation {
  paidAmount: number;
  committedAmount: number;
  varianceAmount: number;
  exposurePercent: number;
  varianceState: BudgetVarianceState;
}

export interface CashFlowPoint {
  id: string;
  projectId: string;
  periodLabel: string;
  periodStart: string;
  clientInflow: number;
  projectOutflow: number;
  netCashPosition: number;
}

export interface FinanceAttentionItem {
  id: string;
  label: string;
  tone: "warning" | "danger";
  targetView: FinanceView;
}

export interface ProjectFinanceRecord {
  projectId: string;
  projectName: string;
  projectCode: string;
  baseContractValue: number;
  currency: CurrencyCode;
  variations: FinanceVariation[];
  invoices: FinanceInvoice[];
  milestones: PaymentMilestone[];
  transactions: ProjectFinanceTransaction[];
  budgetCategories: BudgetCategoryAllocation[];
  cashFlow: CashFlowPoint[];
  updatedAt: string;
}

export interface ProjectFinanceSnapshot {
  projectId: string;
  projectName: string;
  projectCode: string;
  summary: ProjectFinanceSummary;
  milestones: PaymentMilestone[];
  transactions: ProjectFinanceTransaction[];
  invoices: FinanceInvoice[];
  budgetCategories: BudgetCategorySnapshot[];
  cashFlow: CashFlowPoint[];
  attentionItems: FinanceAttentionItem[];
  updatedAt: string;
}

export interface CreateFinanceTransactionInput {
  idempotencyKey: string;
  type: FinanceTransactionType;
  date: string;
  amount: number;
  counterparty?: string;
  category: string;
  paymentMethod: string;
  reference?: string;
  milestoneId?: string;
  invoiceId?: string;
  description: string;
  evidenceFile?: {
    name: string;
    mimeType: string;
  };
}

export interface AddFinanceTransactionResult {
  transaction: ProjectFinanceTransaction;
  snapshot: ProjectFinanceSnapshot;
}
