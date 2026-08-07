import { describe, expect, it } from "vitest";
import { parseBoqImportFile } from "@/features/projects/boq/utils/project-boq-import";

describe("project BOQ staged import parser", () => {
  it("parses valid CSV file into staged items without mutating active BOQ", async () => {
    const csvContent = `Section Code,Section Title,Subsection Code,Subsection Title,Item Code,Description,Unit,Quantity,Rate
A,Demolition & Removal,A.01,Bathroom Demolition,A.01.01,Demolish wall tiles,m²,62,750
A,Demolition & Removal,A.01,Bathroom Demolition,A.01.02,Demolish floor tiles,m²,,750`;

    const file = new File([csvContent], "test-boq.csv", { type: "text/csv" });
    const result = await parseBoqImportFile(file);

    expect(result.totalRows).toBe(2);
    expect(result.items.length).toBe(2);

    expect(result.items[0].itemCode).toBe("A.01.01");
    expect(result.items[0].quantity).toBe(62);
    expect(result.items[0].rate).toBe(750);
    expect(result.items[0].amount).toBe(46500);

    // Row 2 missing quantity remains null (not zero)
    expect(result.items[1].quantity).toBeNull();
    expect(result.items[1].amount).toBeNull();
    expect(result.invalidRows).toBe(1);
  });

  it("handles non-installed XLSX/XLS files with an explicit dependency message", async () => {
    const file = new File(["dummy content"], "test-boq.xlsx", {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const result = await parseBoqImportFile(file);

    expect(result.issues[0]).toContain(
      "XLSX/XLS parsing requires an approved spreadsheet parser dependency"
    );
    expect(result.items.length).toBe(0);
  });
});
