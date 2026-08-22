"use client";

import {
  Activity,
  CheckCircle2,
  Database,
  KeyRound,
  Link2,
  RefreshCw,
  Rows3,
  Search,
  Server,
  TableProperties,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { TursoColumnInfo, TursoSchemaSnapshot, TursoTableSchema } from "@/types/domain/turso-schema";
import styles from "./schema-viewer.module.css";

interface TableDataResult {
  status: string;
  cols: string[];
  rows: unknown[][];
  message?: string;
}

interface RelationshipEdge {
  childTable: string;
  column: string;
  parentTable: string;
  refColumn: string | null;
  onDelete: string;
  onUpdate: string;
}

function collectRelationships(tables: TursoTableSchema[]): RelationshipEdge[] {
  const edges: RelationshipEdge[] = [];
  for (const table of tables) {
    for (const fk of table.foreignKeys) {
      edges.push({
        childTable: table.name,
        column: fk.column,
        parentTable: fk.refTable,
        refColumn: fk.refColumn,
        onDelete: fk.onDelete,
        onUpdate: fk.onUpdate,
      });
    }
  }
  return edges.sort((a, b) => a.childTable.localeCompare(b.childTable));
}

function referencingTables(tables: TursoTableSchema[], tableName: string): string[] {
  return tables
    .filter((table) => table.foreignKeys.some((fk) => fk.refTable === tableName))
    .map((table) => table.name)
    .sort();
}

function ColumnBadge({ column, fkTarget }: { column: TursoColumnInfo; fkTarget: string | null }) {
  return (
    <li className={styles.columnRow}>
      <span className={styles.columnName}>
        {column.pk > 0 && (
          <KeyRound className={styles.columnPkIcon} aria-label="Primary key" aria-hidden={false} />
        )}
        {column.name}
      </span>
      <span className={styles.columnFlags}>
        {column.notNull && (
          <span className={styles.flagTag} title="NOT NULL">
            req
          </span>
        )}
        <span className={styles.typeTag}>{column.type || "TEXT"}</span>
        {fkTarget && (
          <span className={styles.fkTag} title={`Foreign key → ${fkTarget}`}>
            <Link2 aria-hidden /> {fkTarget}
          </span>
        )}
      </span>
    </li>
  );
}

function formatCellValue(value: unknown): string {
  if (value === null || value === undefined) return "NULL";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}
function TableDataPreview({ tableName, open }: { tableName: string; open: boolean }) {
  const [data, setData] = useState<TableDataResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadedTable, setLoadedTable] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    if (loadedTable === tableName && data) return;

    let cancelled = false;

    fetch("/api/db-query", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sql: `SELECT * FROM "${tableName}" LIMIT 50` }),
      cache: "no-store",
    })
      .then(async (response) => {
        const payload = (await response.json()) as TableDataResult;
        if (!response.ok || payload.status !== "ok") {
          throw new Error(payload.message ?? `Query failed with status ${response.status}`);
        }
        return payload;
      })
      .then((payload) => {
        if (cancelled) return;
        setData(payload);
        setError(null);
        setLoadedTable(tableName);
      })
      .catch((reason: unknown) => {
        if (cancelled) return;
        setError(reason instanceof Error ? reason.message : "Failed to load table data.");
      });

    return () => {
      cancelled = true;
    };
  }, [open, tableName, loadedTable, data]);

  if (!open) return null;

  const isFetching = loadedTable !== tableName;

  if (isFetching && !data && !error) {
    return (
      <div className={styles.dataMessage}>
        <Activity aria-hidden /> Loading table data…
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${styles.dataMessage} ${styles.dataMessageError}`}>{error}</div>
    );
  }

  if (!data) return null;

  if (data.rows.length === 0) {
    return (
      <div className={styles.dataMessage}>
        <Rows3 aria-hidden /> This table has no data.
      </div>
    );
  }

  return (
    <div className={styles.dataTableWrap} role="region" aria-label={`${tableName} table data`}>
      <table className={styles.dataTable}>
        <thead>
          <tr>
            {data.cols.map((column) => (
              <th key={column} scope="col">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <td key={cellIndex}>{formatCellValue(cell)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className={styles.dataRowCount}>
        Showing {data.rows.length} row{data.rows.length === 1 ? "" : "s"}
      </div>
    </div>
  );
}

function TableCard({
  table,
  referencedBy,
}: {
  table: TursoTableSchema;
  referencedBy: string[];
}) {
  const [showData, setShowData] = useState(false);
  const fkTargets = new Map(table.foreignKeys.map((fk) => [fk.column, fk.refTable]));
  return (
    <article className={styles.tableCard}>
      <header className={styles.tableCardHeader}>
        <TableProperties className={styles.tableCardIcon} aria-hidden />
        <h3 className={styles.tableCardTitle}>{table.name}</h3>
        <span className={styles.rowCountBadge} title="Rows in table">
          {table.rowCount} rows
        </span>
      </header>
      <ul className={styles.columnList}>
        {table.columns.length === 0 && <li className={styles.noColumns}>No columns</li>}
        {table.columns.map((column) => (
          <ColumnBadge
            key={column.name}
            column={column}
            fkTarget={fkTargets.get(column.name) ?? null}
          />
        ))}
      </ul>
      {referencedBy.length > 0 && (
        <footer className={styles.tableCardFooter}>
          <span className={styles.referencedByLabel}>Referenced by:</span>
          {referencedBy.map((name) => (
            <span key={name} className={styles.referencedByChip}>
              {name}
            </span>
          ))}
        </footer>
      )}
      <button
        type="button"
        className={`${styles.dataToggle} ${showData ? styles.dataToggleActive : ""}`}
        aria-expanded={showData}
        onClick={() => setShowData((prev) => !prev)}
      >
        <Rows3 aria-hidden />
        {showData ? "Hide table data" : "View table data"}
      </button>
      <TableDataPreview tableName={table.name} open={showData} />
    </article>
  );
}

function ConnectionStatus({ snapshot, loading }: { snapshot: TursoSchemaSnapshot | null; loading: boolean }) {
  if (loading) {
    return (
      <span className={`${styles.statusChip} ${styles.statusLoading}`}>
        <Activity aria-hidden /> Checking connection…
      </span>
    );
  }
  if (snapshot?.connected) {
    return (
      <span className={`${styles.statusChip} ${styles.statusOk}`}>
        <CheckCircle2 aria-hidden /> Connected
      </span>
    );
  }
  return (
    <span className={`${styles.statusChip} ${styles.statusError}`}>
      <XCircle aria-hidden /> Disconnected
    </span>
  );
}

export function DatabaseSchemaViewer() {
  const [snapshot, setSnapshot] = useState<TursoSchemaSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [lastRefreshed, setLastRefreshed] = useState<string | null>(null);

  const fetchSnapshot = useCallback(async () => {
    try {
      const response = await fetch("/api/db-schema", { cache: "no-store" });
      const payload = (await response.json()) as TursoSchemaSnapshot;
      setSnapshot(payload);
      setLastRefreshed(payload.fetchedAt);
    } catch {
      setSnapshot({
        ok: false,
        connected: false,
        host: "",
        fetchedAt: new Date().toISOString(),
        tables: [],
        error: "Unable to reach the database schema service.",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/db-schema", { cache: "no-store" })
      .then((response) => response.json() as Promise<TursoSchemaSnapshot>)
      .then((payload) => {
        if (cancelled) return;
        setSnapshot(payload);
        setLastRefreshed(payload.fetchedAt);
      })
      .catch(() => {
        if (cancelled) return;
        setSnapshot({
          ok: false,
          connected: false,
          host: "",
          fetchedAt: new Date().toISOString(),
          tables: [],
          error: "Unable to reach the database schema service.",
        });
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const refresh = useCallback(() => {
    setLoading(true);
    void fetchSnapshot();
  }, [fetchSnapshot]);

  const totalColumns = useMemo(
    () => (snapshot?.tables ?? []).reduce((sum, table) => sum + (table.columns?.length ?? 0), 0),
    [snapshot],
  );

  const relationships = useMemo(() => collectRelationships(snapshot?.tables ?? []), [snapshot]);

  const totalRows = useMemo(
    () => (snapshot?.tables ?? []).reduce((sum, table) => sum + (table.rowCount ?? 0), 0),
    [snapshot],
  );

  const normalizedQuery = query.trim().toLowerCase();
  const visibleTables = useMemo(() => {
    const tables = snapshot?.tables ?? [];
    if (!normalizedQuery) return tables;
    return tables.filter(
      (table) =>
        table.name.toLowerCase().includes(normalizedQuery) ||
        table.columns.some((column) => column.name.toLowerCase().includes(normalizedQuery)),
    );
  }, [snapshot, normalizedQuery]);

  const isError = !loading && !snapshot?.connected;
  const isEmpty = !loading && snapshot?.connected && snapshot.tables.length === 0;

  return (
    <section className={styles.viewer}>
      <header className={styles.viewerHeader}>
        <div className={styles.viewerHeading}>
          <Database className={styles.viewerHeadingIcon} aria-hidden />
          <div>
            <h2 className={styles.viewerTitle}>Database Schema</h2>
            <p className={styles.viewerSubtitle}>
              Live schema of the Turso database backing this environment.
            </p>
          </div>
        </div>
        <div className={styles.viewerActions}>
          <ConnectionStatus snapshot={snapshot} loading={loading} />
          <button className={styles.refreshButton} type="button" onClick={refresh}>
            <RefreshCw className={loading ? styles.refreshSpinning : undefined} aria-hidden />
            Refresh
          </button>
        </div>
      </header>

      {snapshot?.connected && (
        <div className={styles.summaryStrip} role="list" aria-label="Schema summary">
          <div className={styles.summaryItem} role="listitem">
            <Server aria-hidden />
            <span className={styles.summaryValue}>{snapshot.tables.length}</span>
            <span className={styles.summaryLabel}>tables</span>
          </div>
          <div className={styles.summaryItem} role="listitem">
            <TableProperties aria-hidden />
            <span className={styles.summaryValue}>{totalColumns}</span>
            <span className={styles.summaryLabel}>columns</span>
          </div>
          <div className={styles.summaryItem} role="listitem">
            <Link2 aria-hidden />
            <span className={styles.summaryValue}>{relationships.length}</span>
            <span className={styles.summaryLabel}>relationships</span>
          </div>
          <div className={styles.summaryItem} role="listitem">
            <Database aria-hidden />
            <span className={styles.summaryValue}>{totalRows}</span>
            <span className={styles.summaryLabel}>rows</span>
          </div>
        </div>
      )}

      {loading && <div className={styles.messageBlock}>Loading live schema from Turso…</div>}

      {isError && (
        <div className={`${styles.messageBlock} ${styles.messageError}`}>
          <p className={styles.messageTitle}>Connection failed</p>
          <p className={styles.messageDetail}>
            {snapshot?.error ?? "The database could not be reached."} Verify that TURSO_DATABASE_URL
            and TURSO_DATABASE_TOKEN are configured in the server environment.
          </p>
          <button className={styles.retryButton} type="button" onClick={refresh}>
            Retry connection
          </button>
        </div>
      )}

      {isEmpty && (
        <div className={styles.messageBlock}>
          The database is connected, but contains no tables yet.
        </div>
      )}

      {!loading && snapshot?.connected && snapshot.tables.length > 0 && (
        <>
          <div className={styles.searchRow}>
            <label className={styles.searchLabel} htmlFor="schema-search">
              <Search aria-hidden />
              <span className="sr-only">Search tables and columns</span>
              <input
                id="schema-search"
                className={styles.searchInput}
                type="search"
                placeholder="Search tables or columns…"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </label>
            {normalizedQuery && (
              <span className={styles.searchCount}>
                {visibleTables.length} of {snapshot.tables.length} tables match
              </span>
            )}
          </div>

          <div className={styles.tableGrid}>
            {visibleTables.map((table) => (
              <TableCard
                key={table.name}
                table={table}
                referencedBy={referencingTables(snapshot.tables, table.name)}
              />
            ))}
          </div>

          {visibleTables.length === 0 && (
            <div className={styles.messageBlock}>No tables match “{query}”.</div>
          )}

          {relationships.length > 0 && (
            <section className={styles.relationshipsSection} aria-label="Table relationships">
              <h3 className={styles.relationshipsTitle}>
                <Link2 aria-hidden /> Relationships
              </h3>
              <ul className={styles.relationshipList}>
                {relationships.map((edge) => (
                  <li key={`${edge.childTable}.${edge.column}->${edge.parentTable}`} className={styles.relationshipRow}>
                    <code className={styles.edgeSource}>
                      {edge.childTable}.{edge.column}
                    </code>
                    <span className={styles.edgeArrow} aria-hidden>
                      →
                    </span>
                    <code className={styles.edgeTarget}>
                      {edge.parentTable}
                      {edge.refColumn ? `.${edge.refColumn}` : ""}
                    </code>
                    <span className={styles.edgeRule}>{edge.onDelete}</span>
                    <span className={styles.edgeRule}>{edge.onUpdate}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}

      <footer className={styles.viewerFooter}>
        {lastRefreshed && (
          <span>
            Last refreshed:{" "}
            {new Date(lastRefreshed).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}
          </span>
        )}
        {snapshot?.connected && <span className={styles.hostName}>{snapshot.host}</span>}
      </footer>
    </section>
  );
}