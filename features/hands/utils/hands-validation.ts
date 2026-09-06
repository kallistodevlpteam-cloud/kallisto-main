import type {
  WorkforceRequestDraft,
  WorkforceRequestErrors,
} from "../types/hands.types";

export function validateWorkforceRequest(
  values: WorkforceRequestDraft,
): WorkforceRequestErrors {
  const errors: WorkforceRequestErrors = {};

  if (!values.projectId) {
    errors.projectId = "Select a project.";
  }

  if (values.isMultiTrade) {
    const validRows = (values.tradesBreakdown || []).filter(
      (item) =>
        Boolean(item.trade) &&
        Number(item.workerCount) > 0 &&
        Number.isFinite(Number(item.workerCount)),
    );

    if (validRows.length === 0) {
      errors.trade = "Add at least one labour trade with a valid worker count.";
      errors.workerCount = "Enter a worker count greater than zero.";
    }
  } else {
    const workerCount = Number(values.workerCount);

    if (!values.trade) {
      errors.trade = "Select a worker trade.";
    }

    if (
      values.workerCount.trim() === "" ||
      !Number.isFinite(workerCount) ||
      workerCount <= 0
    ) {
      errors.workerCount = "Enter a worker count greater than zero.";
    }
  }

  if (!values.startDate) {
    errors.startDate = "Select a start date.";
  }

  if (!values.expectedDuration.trim()) {
    errors.expectedDuration = "Enter the expected duration.";
  }

  return errors;
}

