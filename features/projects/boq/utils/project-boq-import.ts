export interface StagedImportItem {
  sectionCode: string;
  sectionTitle: string;
  subsectionCode: string;
  subsectionTitle: string;
  itemCode: string;
  description: string;
  unit: string;
  quantity: number | null;
  rate: number | null;
  amount: number | null;
}

export interface BoqImportResult {
  fileName: string;
  totalRows: number;
  validRows: number;
  invalidRows: number;
  duplicateCodeCount: number;
  detectedSectionCount: number;
  detectedSubsectionCount: number;
  items: StagedImportItem[];
  issues: string[];
}

export async function parseBoqImportFile(file: File): Promise<BoqImportResult> {
  const extension = file.name.split(".").pop()?.toLowerCase();

  if (extension === "xlsx" || extension === "xls") {
    return {
      fileName: file.name,
      totalRows: 0,
      validRows: 0,
      invalidRows: 1,
      duplicateCodeCount: 0,
      detectedSectionCount: 0,
      detectedSubsectionCount: 0,
      items: [],
      issues: [
        "XLSX/XLS parsing requires an approved spreadsheet parser dependency. Please upload a standard CSV file.",
      ],
    };
  }

  if (extension !== "csv") {
    return {
      fileName: file.name,
      totalRows: 0,
      validRows: 0,
      invalidRows: 1,
      duplicateCodeCount: 0,
      detectedSectionCount: 0,
      detectedSubsectionCount: 0,
      items: [],
      issues: ["Unsupported file format. Please upload a valid CSV file."],
    };
  }

  const text =
    typeof file.text === "function"
      ? await file.text()
      : await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve((reader.result as string) || "");
          reader.onerror = () => reject(new Error("Failed to read file"));
          reader.readAsText(file);
        });
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length === 0) {
    return {
      fileName: file.name,
      totalRows: 0,
      validRows: 0,
      invalidRows: 1,
      duplicateCodeCount: 0,
      detectedSectionCount: 0,
      detectedSubsectionCount: 0,
      items: [],
      issues: ["File is empty."],
    };
  }

  // Parse CSV rows handling quotes
  const parseCsvRow = (line: string): string[] => {
    const cells: string[] = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === "," && !inQuotes) {
        cells.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    cells.push(current.trim());
    return cells;
  };

  const headerCells = parseCsvRow(lines[0]).map((c) => c.toLowerCase());
  const hasHeader =
    headerCells.includes("code") ||
    headerCells.includes("item code") ||
    headerCells.includes("description") ||
    headerCells.includes("section code");

  const dataLines = hasHeader ? lines.slice(1) : lines;
  const items: StagedImportItem[] = [];
  const issues: string[] = [];
  const seenCodes = new Set<string>();
  const sections = new Set<string>();
  const subsections = new Set<string>();

  let validRows = 0;
  let invalidRows = 0;
  let duplicateCodeCount = 0;

  for (let idx = 0; idx < dataLines.length; idx++) {
    const rawLine = dataLines[idx];
    const cells = parseCsvRow(rawLine);
    if (cells.length < 3) {
      continue;
    }

    // Flexible column mapping:
    // If 9+ columns: Section Code | Section Title | Subsection Code | Subsection Title | Item Code | Description | Unit | Quantity | Rate
    // If 7 columns: Code | Description | Unit | Quantity | Rate | Amount | Status
    let sectionCode = "A";
    let sectionTitle = "Demolition & Removal Works";
    let subsectionCode = "";
    let subsectionTitle = "";
    let itemCode = `IMP-${idx + 1}`;
    let description = "";
    let unit = "m²";
    let rawQty = "";
    let rawRate = "";

    if (cells.length >= 9) {
      sectionCode = cells[0] || "A";
      sectionTitle = cells[1] || "General Works";
      subsectionCode = cells[2] || "";
      subsectionTitle = cells[3] || "";
      itemCode = cells[4] || `IMP-${idx + 1}`;
      description = cells[5] || "";
      unit = cells[6] || "LS";
      rawQty = cells[7] || "";
      rawRate = cells[8] || "";
    } else if (cells.length >= 5) {
      itemCode = cells[0] || `IMP-${idx + 1}`;
      description = cells[1] || "";
      unit = cells[2] || "LS";
      rawQty = cells[3] || "";
      rawRate = cells[4] || "";
    }

    if (!description) {
      invalidRows++;
      issues.push(`Row ${idx + 1}: Missing description.`);
      continue;
    }

    if (seenCodes.has(itemCode)) {
      duplicateCodeCount++;
      issues.push(`Row ${idx + 1}: Duplicate item code "${itemCode}".`);
    } else {
      seenCodes.add(itemCode);
    }

    const qty = rawQty !== "" && !isNaN(Number(rawQty)) ? Number(rawQty) : null;
    const rate = rawRate !== "" && !isNaN(Number(rawRate)) ? Number(rawRate) : null;
    const amount = qty !== null && rate !== null ? qty * rate : null;

    if (qty === null || rate === null) {
      invalidRows++;
      issues.push(
        `Row ${idx + 1} (${itemCode}): Missing ${qty === null ? "Quantity" : ""}${
          qty === null && rate === null ? " & " : ""
        }${rate === null ? "Rate" : ""} - marked as Needs Attention.`
      );
    } else {
      validRows++;
    }

    if (sectionCode) sections.add(sectionCode);
    if (subsectionCode) subsections.add(`${sectionCode}:${subsectionCode}`);

    items.push({
      sectionCode,
      sectionTitle,
      subsectionCode,
      subsectionTitle,
      itemCode,
      description,
      unit,
      quantity: qty,
      rate,
      amount,
    });
  }

  return {
    fileName: file.name,
    totalRows: dataLines.length,
    validRows,
    invalidRows,
    duplicateCodeCount,
    detectedSectionCount: sections.size || 1,
    detectedSubsectionCount: subsections.size,
    items,
    issues,
  };
}
