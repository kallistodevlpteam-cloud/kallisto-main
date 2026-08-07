import {
  BoqItem,
  BoqNumericValue,
  BoqSection,
  BoqVariation,
} from "@/types/domain/project-boq";
import { getSectionItems } from "../utils/project-boq-hierarchy";

export function isMissingBoqValue(
  value: BoqNumericValue
): value is null | undefined {
  return value === null || value === undefined;
}

export function isValidBoqValue(value: BoqNumericValue): value is number {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value >= 0
  );
}

export function calculateBoqAmount(
  quantity: BoqNumericValue,
  rate: BoqNumericValue
): number | null {
  if (!isValidBoqValue(quantity) || !isValidBoqValue(rate)) {
    return null;
  }

  return quantity * rate;
}

export function countItemValidationIssues(item: BoqItem): number {
  let issues = 0;

  if (isMissingBoqValue(item.quantity)) {
    issues += 1;
  }

  if (isMissingBoqValue(item.rate)) {
    issues += 1;
  }

  return issues;
}

export function countBoqValidationIssues(
  sections: BoqSection[],
  hiddenValidationIssueCount = 0
): number {
  return sections.reduce(
    (sectionTotal, section) =>
      sectionTotal +
      getSectionItems(section).reduce(
        (itemTotal, item) => itemTotal + countItemValidationIssues(item),
        0
      ),
    hiddenValidationIssueCount
  );
}

export function getApprovedVariationTotal(
  variations: BoqVariation[]
): number {
  return variations
    .filter((variation) => variation.status === "Approved")
    .reduce((total, variation) => total + variation.financialImpact, 0);
}

export function getPendingVariationTotal(
  variations: BoqVariation[]
): number {
  return variations
    .filter(
      (variation) =>
        variation.status === "Pending" ||
        variation.status === "Submitted"
    )
    .reduce((total, variation) => total + variation.financialImpact, 0);
}

export function formatIndianCurrency(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatBoqNumber(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 2,
  }).format(value);
}

export function parseBoqInput(value: string): number | null {
  const trimmedValue = value.trim();

  if (trimmedValue === "") {
    return null;
  }

  const parsedValue = Number(trimmedValue.replace(/,/g, ""));
  if (!Number.isFinite(parsedValue) || parsedValue < 0) {
    throw new Error("Enter zero or a positive number.");
  }

  return parsedValue;
}
