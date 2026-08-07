"use client";

import { useMemo, useState } from "react";
import {
  CashFlowPeriod,
  CashFlowPoint,
} from "../types/project-finance.types";
import { formatINR, formatINRCompact } from "../utils/format-inr";
import styles from "./project-finance-workspace.module.css";

interface CashFlowCardProps {
  points: CashFlowPoint[];
}

const PERIODS: Array<{ id: CashFlowPeriod; label: string }> = [
  { id: "3", label: "3 months" },
  { id: "6", label: "6 months" },
  { id: "12", label: "12 months" },
  { id: "all", label: "All" },
];

export function CashFlowCard({ points }: CashFlowCardProps) {
  const [period, setPeriod] = useState<CashFlowPeriod>("6");
  const [activePointId, setActivePointId] = useState<string | null>(null);
  const visiblePoints = useMemo(() => {
    if (period === "all") {
      return points;
    }

    return points.slice(-Number(period));
  }, [period, points]);

  const chart = useMemo(() => {
    const width = 880;
    const height = 280;
    const margin = { top: 18, right: 18, bottom: 38, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    const values = visiblePoints.flatMap((point) => [
      point.clientInflow,
      point.projectOutflow,
      point.netCashPosition,
    ]);
    const domainMax = Math.max(...values, 100);
    const domainMin = Math.min(...values, 0);
    const range = Math.max(1, domainMax - domainMin);
    const groupWidth =
      visiblePoints.length > 0 ? innerWidth / visiblePoints.length : innerWidth;
    const y = (value: number) =>
      margin.top + ((domainMax - value) / range) * innerHeight;
    const zeroY = y(0);
    const linePath = visiblePoints
      .map((point, index) => {
        const x = margin.left + groupWidth * index + groupWidth / 2;
        return `${index === 0 ? "M" : "L"} ${x} ${y(point.netCashPosition)}`;
      })
      .join(" ");
    const ticks = Array.from({ length: 5 }, (_, index) => {
      const value = domainMin + (range / 4) * index;
      return {
        value: Math.round(value),
        y: y(value),
      };
    }).reverse();

    return {
      width,
      height,
      margin,
      innerWidth,
      innerHeight,
      groupWidth,
      y,
      zeroY,
      linePath,
      ticks,
    };
  }, [visiblePoints]);

  const activePoint = visiblePoints.find((point) => point.id === activePointId);

  if (points.length === 0) {
    return (
      <article className={`${styles.card} ${styles.cashFlowCard}`}>
        <div className={styles.cardHeader}>
          <div>
            <h3>Cash Flow</h3>
            <p>Client inflow, project outflow and net cash position</p>
          </div>
        </div>
        <div className={styles.compactEmptyState}>
          <p>Cash flow will appear after the first approved receipt or paid expense.</p>
        </div>
      </article>
    );
  }

  return (
    <article className={`${styles.card} ${styles.cashFlowCard}`}>
      <div className={styles.cashFlowHeader}>
        <div className={styles.cardHeader}>
          <div>
            <h3>Cash Flow</h3>
            <p>Client inflow, project outflow and net cash position</p>
          </div>
        </div>
        <div className={styles.periodControl} role="group" aria-label="Cash flow period">
          {PERIODS.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={period === item.id}
              className={period === item.id ? styles.periodButtonActive : styles.periodButton}
              onClick={() => setPeriod(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.chartLegend} aria-label="Cash flow chart legend">
        <span><i className={styles.legendInflow} /> Client inflow</span>
        <span><i className={styles.legendOutflow} /> Project outflow</span>
        <span><i className={styles.legendNet} /> Net cash position</span>
      </div>

      <div className={styles.chartWrap}>
        {activePoint && (
          <div className={styles.chartTooltip} role="status">
            <strong>{activePoint.periodLabel}</strong>
            <span>Inflow {formatINR(activePoint.clientInflow)}</span>
            <span>Outflow {formatINR(activePoint.projectOutflow)}</span>
            <span>Net {formatINR(activePoint.netCashPosition)}</span>
          </div>
        )}
        <svg
          className={styles.cashFlowChart}
          viewBox={`0 0 ${chart.width} ${chart.height}`}
          role="img"
          aria-labelledby="cash-flow-chart-title cash-flow-chart-description"
          preserveAspectRatio="xMidYMid meet"
        >
          <title id="cash-flow-chart-title">Project cash flow</title>
          <desc id="cash-flow-chart-description">
            Grouped bars compare client inflow and project outflow. A line shows net cash position.
          </desc>
          {chart.ticks.map((tick) => (
            <g key={tick.value}>
              <line
                x1={chart.margin.left}
                x2={chart.margin.left + chart.innerWidth}
                y1={tick.y}
                y2={tick.y}
                className={styles.chartGridLine}
              />
              <text
                x={chart.margin.left - 10}
                y={tick.y + 4}
                textAnchor="end"
                className={styles.chartAxisLabel}
              >
                {formatINRCompact(tick.value)}
              </text>
            </g>
          ))}
          <line
            x1={chart.margin.left}
            x2={chart.margin.left + chart.innerWidth}
            y1={chart.zeroY}
            y2={chart.zeroY}
            className={styles.chartZeroLine}
          />
          {visiblePoints.map((point, index) => {
            const centerX =
              chart.margin.left + chart.groupWidth * index + chart.groupWidth / 2;
            const barWidth = Math.min(18, chart.groupWidth * 0.22);
            const inflowY = chart.y(point.clientInflow);
            const outflowY = chart.y(point.projectOutflow);
            return (
              <g
                key={point.id}
                tabIndex={0}
                role="button"
                aria-label={`${point.periodLabel}: client inflow ${formatINR(
                  point.clientInflow
                )}, project outflow ${formatINR(
                  point.projectOutflow
                )}, net cash position ${formatINR(point.netCashPosition)}`}
                onFocus={() => setActivePointId(point.id)}
                onBlur={() => setActivePointId(null)}
                onMouseEnter={() => setActivePointId(point.id)}
                onMouseLeave={() => setActivePointId(null)}
              >
                <rect
                  x={centerX - barWidth - 2}
                  y={inflowY}
                  width={barWidth}
                  height={Math.max(0, chart.zeroY - inflowY)}
                  rx={3}
                  className={styles.chartInflowBar}
                />
                <rect
                  x={centerX + 2}
                  y={outflowY}
                  width={barWidth}
                  height={Math.max(0, chart.zeroY - outflowY)}
                  rx={3}
                  className={styles.chartOutflowBar}
                />
                <text
                  x={centerX}
                  y={chart.height - 14}
                  textAnchor="middle"
                  className={styles.chartAxisLabel}
                >
                  {point.periodLabel}
                </text>
              </g>
            );
          })}
          <path d={chart.linePath} className={styles.chartNetLine} />
          {visiblePoints.map((point, index) => {
            const x =
              chart.margin.left + chart.groupWidth * index + chart.groupWidth / 2;
            return (
              <circle
                key={`net-${point.id}`}
                cx={x}
                cy={chart.y(point.netCashPosition)}
                r={activePointId === point.id ? 5 : 3.5}
                className={styles.chartNetPoint}
              />
            );
          })}
        </svg>
      </div>
    </article>
  );
}
