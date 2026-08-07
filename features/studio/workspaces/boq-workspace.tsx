"use client";

import { Calculator, Download, Plus, Sparkles, TrendingUp } from "lucide-react";
import React, { useState } from "react";
import { BOQTaskConfiguration, StudioOutputVersion, StudioTask } from "@/types/domain/studio";
import styles from "./studio-workspace.module.css";

export interface BOQWorkspaceProps {
  task: StudioTask;
  version: StudioOutputVersion;
  readOnly?: boolean;
}

interface BOQLineItem {
  id: string;
  itemCode: string;
  description: string;
  quantity: number;
  unit: string;
  rate: number;
  amount: number;
  package: string;
}

const INITIAL_BOQ_ITEMS: BOQLineItem[] = [
  {
    id: "boq-01",
    itemCode: "CIV-01.1",
    description: "Excavation in all types of soil for foundation footings including lift & lead up to 50m.",
    quantity: 450,
    unit: "cum",
    rate: 380,
    amount: 171000,
    package: "Civil & Substructure",
  },
  {
    id: "boq-02",
    itemCode: "CIV-02.4",
    description: "M25 grade Reinforced Cement Concrete for columns, beams and slab suspended structures.",
    quantity: 180,
    unit: "cum",
    rate: 6800,
    amount: 1224000,
    package: "Civil & Substructure",
  },
  {
    id: "boq-03",
    itemCode: "FIN-01.2",
    description: "Italian Botticino Marble flooring laying over 20m thick cement mortar bed including polishing.",
    quantity: 320,
    unit: "sqm",
    rate: 4200,
    amount: 1344000,
    package: "Interior Finishes",
  },
  {
    id: "boq-04",
    itemCode: "WOD-03.1",
    description: "Teakwood frame door shutters with veneer finish, mortise locks and heavy-duty brass hinges.",
    quantity: 14,
    unit: "nos",
    rate: 28500,
    amount: 399000,
    package: "Joinery & Woodwork",
  },
];

export function BOQWorkspace({ task, version, readOnly }: BOQWorkspaceProps) {
  const [items, setItems] = useState<BOQLineItem[]>(INITIAL_BOQ_ITEMS);
  const config = version.configurationSnapshot as BOQTaskConfiguration;

  const totalBaseAmount = items.reduce((sum, item) => sum + item.amount, 0);
  const gstAmount = config.includeTaxes ? totalBaseAmount * 0.18 : 0;
  const grandTotal = totalBaseAmount + gstAmount;

  return (
    <div className={styles.editorContainer}>
      {/* Parameters Summary Row */}
      <div className={styles.paramsSummaryRow}>
        <div className={styles.paramItem}>
          <span className={styles.paramLabel}>Cost Location:</span>
          <span className={styles.paramVal}>{config.costLocation || "Hyderabad, India"}</span>
        </div>
        <div className={styles.paramItem}>
          <span className={styles.paramLabel}>Measurement Standard:</span>
          <span className={styles.paramVal}>{config.measurementStandard || "IS 1200"}</span>
        </div>
        <div className={styles.paramItem}>
          <span className={styles.paramLabel}>Taxes Included:</span>
          <span className={styles.paramVal}>{config.includeTaxes ? "18% GST Applied" : "Exclusive of GST"}</span>
        </div>
      </div>

      {/* BOQ Items Table */}
      <div className={styles.tableWrap}>
        <table className={styles.boqTable}>
          <thead>
            <tr>
              <th>Code</th>
              <th>Description</th>
              <th>Package</th>
              <th className={styles.textRight}>Qty</th>
              <th>Unit</th>
              <th className={styles.textRight}>Rate (₹)</th>
              <th className={styles.textRight}>Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td className={styles.codeCell}>{item.itemCode}</td>
                <td className={styles.descCell}>{item.description}</td>
                <td><span className={styles.packagePill}>{item.package}</span></td>
                <td className={styles.textRight}>{item.quantity}</td>
                <td>{item.unit}</td>
                <td className={styles.textRight}>{item.rate.toLocaleString("en-IN")}</td>
                <td className={styles.textRightFont}>{item.amount.toLocaleString("en-IN")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Financial Summary Box */}
      <div className={styles.financialSummaryCard}>
        <div className={styles.finRow}>
          <span>Base BOQ Subtotal:</span>
          <span>₹ {totalBaseAmount.toLocaleString("en-IN")}</span>
        </div>
        {config.includeTaxes && (
          <div className={styles.finRow}>
            <span>Applicable GST (18%):</span>
            <span>₹ {gstAmount.toLocaleString("en-IN")}</span>
          </div>
        )}
        <div className={`${styles.finRow} ${styles.finRowTotal}`}>
          <span>Approved Revised BOQ Total:</span>
          <span>₹ {grandTotal.toLocaleString("en-IN")}</span>
        </div>
      </div>
    </div>
  );
}
