import { ProjectBoqSnapshot } from "@/types/domain/project-boq";

export interface BoqExportRow {
  sectionCode: string;
  sectionTitle: string;
  subsectionCode: string;
  subsectionTitle: string;
  itemCode: string;
  itemDescription: string;
  unit: string;
  quantity: string;
  rate: string;
  amount: string;
  status: string;
  version: string;
}

export function buildBoqExportRows(
  snapshot: ProjectBoqSnapshot,
  selectedItemIds?: Set<string>
): string[][] {
  const currentVersionLabel =
    snapshot.versions.find((v) => v.id === snapshot.currentVersionId)?.label ?? "Current";

  const rows: string[][] = [
    [
      "Section Code",
      "Section Title",
      "Subsection Code",
      "Subsection Title",
      "Item Code",
      "Item Description",
      "Unit",
      "Quantity",
      "Rate",
      "Amount",
      "Status",
      "Version",
    ],
  ];

  for (const section of snapshot.sections) {
    // 1. Direct items
    for (const item of section.directItems) {
      if (selectedItemIds && selectedItemIds.size > 0 && !selectedItemIds.has(item.id)) {
        continue;
      }
      rows.push([
        section.code,
        section.title,
        "",
        "",
        item.code,
        item.description,
        item.unit,
        item.quantity !== null && item.quantity !== undefined ? String(item.quantity) : "",
        item.rate !== null && item.rate !== undefined ? String(item.rate) : "",
        item.amount !== null && item.amount !== undefined ? String(item.amount) : "",
        item.status,
        currentVersionLabel,
      ]);
    }

    // 2. Subsections
    for (const subsection of section.subsections) {
      for (const item of subsection.items) {
        if (selectedItemIds && selectedItemIds.size > 0 && !selectedItemIds.has(item.id)) {
          continue;
        }
        rows.push([
          section.code,
          section.title,
          subsection.code,
          subsection.title,
          item.code,
          item.description,
          item.unit,
          item.quantity !== null && item.quantity !== undefined ? String(item.quantity) : "",
          item.rate !== null && item.rate !== undefined ? String(item.rate) : "",
          item.amount !== null && item.amount !== undefined ? String(item.amount) : "",
          item.status,
          currentVersionLabel,
        ]);
      }
    }
  }

  return rows;
}

export function exportBoqCsv(
  snapshot: ProjectBoqSnapshot,
  selectedItemIds?: Set<string>
) {
  const rows = buildBoqExportRows(snapshot, selectedItemIds);
  const csv = rows
    .map((row) =>
      row
        .map((cell) => `"${String(cell).replaceAll('"', '""')}"`)
        .join(",")
    )
    .join("\n");

  const isSelectedOnly = selectedItemIds && selectedItemIds.size > 0;
  const suffix = isSelectedOnly ? "selected-items" : "full-boq";
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${snapshot.projectCode}-${suffix}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
