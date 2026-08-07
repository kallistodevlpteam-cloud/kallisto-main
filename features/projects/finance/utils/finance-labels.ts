import {
  FinanceInvoiceStatus,
  FinanceTransactionStatus,
  PaymentMilestoneStatus,
  ProjectFinanceTransaction,
} from "../types/project-finance.types";

export function formatMilestoneStatus(
  status: PaymentMilestoneStatus
): string {
  const labels: Record<PaymentMilestoneStatus, string> = {
    upcoming: "Upcoming",
    invoice_ready: "Invoice ready",
    invoice_sent: "Invoice sent",
    partially_paid: "Partially paid",
    paid: "Paid",
    overdue: "Overdue",
  };
  return labels[status];
}

export function formatTransactionStatus(
  status: FinanceTransactionStatus
): string {
  const labels: Record<FinanceTransactionStatus, string> = {
    draft: "Draft",
    pending: "Pending",
    approved: "Approved",
    paid: "Paid",
    rejected: "Rejected",
    cancelled: "Cancelled",
  };
  return labels[status];
}

export function formatInvoiceStatus(status: FinanceInvoiceStatus): string {
  const labels: Record<FinanceInvoiceStatus, string> = {
    draft: "Draft",
    sent: "Invoice sent",
    partially_paid: "Partially paid",
    paid: "Paid",
    overdue: "Overdue",
    cancelled: "Cancelled",
  };
  return labels[status];
}

export function formatTransactionType(
  transaction: ProjectFinanceTransaction
): string {
  if (transaction.type === "client_receipt") {
    return "Client receipt";
  }

  if (transaction.type === "commitment") {
    return "Commitment";
  }

  if (transaction.type === "refund") {
    return "Refund";
  }

  if (transaction.type === "adjustment") {
    return "Adjustment";
  }

  if (transaction.category === "Materials") {
    return "Material expense";
  }

  if (transaction.category === "Labour") {
    return "Labour payment";
  }

  if (transaction.category === "Design and consultancy") {
    return "Consultant payment";
  }

  return "Project expense";
}

export function getStatusTone(
  status:
    | FinanceTransactionStatus
    | PaymentMilestoneStatus
    | FinanceInvoiceStatus
): "success" | "warning" | "danger" | "neutral" | "info" {
  if (status === "paid" || status === "approved") {
    return "success";
  }

  if (
    status === "pending" ||
    status === "partially_paid" ||
    status === "invoice_ready"
  ) {
    return "warning";
  }

  if (status === "overdue" || status === "rejected") {
    return "danger";
  }

  if (status === "sent" || status === "invoice_sent") {
    return "info";
  }

  return "neutral";
}
