import { StudioTaskConfiguration, StudioValidationIssue } from "@/types/domain/studio";

export class StudioValidationService {
  static validateTaskConfiguration(
    config: StudioTaskConfiguration
  ): StudioValidationIssue[] {
    const issues: StudioValidationIssue[] = [];

    switch (config.workspaceType) {
      case "boq":
        if (!config.costLocation || config.costLocation.trim() === "") {
          issues.push({
            id: "val-boq-loc",
            severity: "error",
            code: "MISSING_COST_LOCATION",
            message: "Cost location is required for accurate rate analysis.",
            field: "costLocation",
          });
        }
        if (!config.drawingRevisionIds || config.drawingRevisionIds.length === 0) {
          issues.push({
            id: "val-boq-drawings",
            severity: "warning",
            code: "NO_DRAWING_LINK",
            message: "No drawing revision linked. Quantities must be manually verified.",
            field: "drawingRevisionIds",
          });
        }
        break;

      case "estimate":
        if (config.totalAreaSqFt <= 0) {
          issues.push({
            id: "val-est-area",
            severity: "error",
            code: "INVALID_AREA",
            message: "Project area must be greater than 0 sq ft.",
            field: "totalAreaSqFt",
          });
        }
        if (!config.includedPackages || config.includedPackages.length === 0) {
          issues.push({
            id: "val-est-packages",
            severity: "warning",
            code: "NO_PACKAGES_SELECTED",
            message: "No trade packages selected for cost estimation.",
            field: "includedPackages",
          });
        }
        break;

      case "visualisation":
        if (!config.designDirection || config.designDirection.trim() === "") {
          issues.push({
            id: "val-vis-dir",
            severity: "warning",
            code: "MISSING_DESIGN_DIRECTION",
            message: "Design direction is recommended for accurate render generation.",
            field: "designDirection",
          });
        }
        break;

      case "proposal":
        if (!config.targetAudience) {
          issues.push({
            id: "val-prop-audience",
            severity: "warning",
            code: "MISSING_TARGET_AUDIENCE",
            message: "Target audience helps format proposal terms.",
            field: "targetAudience",
          });
        }
        break;

      case "specification_report":
        if (config.reportCategory === "site_visit" && !config.siteVisitDate) {
          issues.push({
            id: "val-rep-date",
            severity: "error",
            code: "MISSING_SITE_VISIT_DATE",
            message: "Site visit date is required for site inspection reports.",
            field: "siteVisitDate",
          });
        }
        break;
    }

    return issues;
  }
}
