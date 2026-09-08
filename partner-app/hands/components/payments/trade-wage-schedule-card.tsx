"use client";

import React from "react";
import { TradeWageRate } from "../../types/assignment-domain";
import styles from "./hands-payments.module.css";

interface TradeWageScheduleCardProps {
  scheduleTitle?: string;
  personnelCount?: number;
  tradeRates: TradeWageRate[];
  projectSelector?: React.ReactNode;
}

export function TradeWageScheduleCard({
  scheduleTitle = "Trade Wage Rate Schedule",
  personnelCount,
  tradeRates,
  projectSelector,
}: TradeWageScheduleCardProps) {
  const totalWorkers = personnelCount ?? tradeRates.reduce((sum, r) => sum + r.workersCount, 0);
  const totalDailyWage = tradeRates.reduce((sum, r) => sum + r.totalPerDay, 0);

  const formatCurrency = (val: number) => {
    return `₹${val.toLocaleString("en-IN")}`;
  };

  return (
    <div className={styles.tradeScheduleCard}>
      <div className={styles.tradeScheduleHeader}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <h3 className={styles.tradeScheduleTitle}>{scheduleTitle}</h3>
          {projectSelector}
        </div>
        <span className={styles.tradeScheduleCount}>
          {totalWorkers} Assigned Personnel
        </span>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table className={styles.tradeTable}>
          <thead>
            <tr>
              <th style={{ width: "40%" }}>Trade Category</th>
              <th className={styles.centerCol} style={{ width: "20%" }}>
                Worker Count
              </th>
              <th className={styles.numCol} style={{ width: "20%" }}>
                Daily Rate / Head
              </th>
              <th className={styles.numCol} style={{ width: "20%" }}>
                Daily Wage Cost
              </th>
            </tr>
          </thead>
          <tbody>
            {tradeRates.map((rate, idx) => {
              const tradeName = /^\d+\s/.test(rate.trade)
                ? rate.trade
                : `${rate.workersCount} ${rate.trade}`;
              return (
                <tr key={idx}>
                  <td className={styles.tradeCategoryCell}>{tradeName}</td>
                  <td className={styles.centerCol}>{rate.workersCount}</td>
                  <td className={styles.numCol}>{formatCurrency(rate.ratePerDay)}</td>
                  <td className={`${styles.numCol} ${styles.tradeWageCostCell}`}>
                    {formatCurrency(rate.totalPerDay)}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className={styles.tradeTableTotalRow}>
              <td>Total Daily Wage Commitment</td>
              <td className={styles.centerCol}>{totalWorkers}</td>
              <td className={styles.numCol} style={{ color: "#64748b", fontWeight: 500 }}>
                Blended Daily Total
              </td>
              <td className={`${styles.numCol} ${styles.tradeBlendedTotalVal}`}>
                {formatCurrency(totalDailyWage)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
