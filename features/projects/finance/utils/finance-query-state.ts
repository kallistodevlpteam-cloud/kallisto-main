import { FinanceView } from "../types/project-finance.types";

export const FINANCE_VIEWS: Array<{ id: FinanceView; label: string }> = [
  { id: "overview", label: "Overview" },
  { id: "milestones", label: "Milestones" },
  { id: "transactions", label: "Transactions" },
  { id: "invoices", label: "Invoices" },
  { id: "reports", label: "Reports" },
];

export function isFinanceView(value: string | null): value is FinanceView {
  return FINANCE_VIEWS.some((view) => view.id === value);
}

export function createFinanceViewUrl(
  currentUrl: string,
  view: FinanceView
): string {
  const url = new URL(currentUrl);
  url.searchParams.set("tab", "finance");
  url.searchParams.set("financeView", view);
  return `${url.pathname}${url.search}`;
}
