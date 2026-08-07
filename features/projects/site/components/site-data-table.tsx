import { ReactNode } from "react";
import styles from "./project-site-workspace.module.css";

export interface SiteDataColumn<T> {
  id: string;
  label: string;
  render: (record: T) => ReactNode;
  priority?: "primary" | "secondary";
}

interface SiteDataTableProps<T extends { id: string }> {
  caption: string;
  columns: Array<SiteDataColumn<T>>;
  records: T[];
}

export function SiteDataTable<T extends { id: string }>({
  caption,
  columns,
  records,
}: SiteDataTableProps<T>) {
  return (
    <div className={styles.dataTableContainer}>
      <div className={styles.dataTableScroller}>
        <table className={styles.dataTable}>
          <caption className="sr-only">{caption}</caption>
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column.id}>{column.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {records.map((record) => (
              <tr key={record.id}>
                {columns.map((column) => (
                  <td key={column.id}>{column.render(record)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={styles.dataCardList}>
        {records.map((record) => (
          <article key={record.id}>
            {columns.map((column) => (
              <div
                className={
                  column.priority === "primary"
                    ? styles.dataCardPrimary
                    : styles.dataCardField
                }
                key={column.id}
              >
                <span>{column.label}</span>
                <div>{column.render(record)}</div>
              </div>
            ))}
          </article>
        ))}
      </div>
    </div>
  );
}
