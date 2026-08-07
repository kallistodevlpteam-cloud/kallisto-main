export interface TursoColumnInfo {
  name: string;
  type: string;
  notNull: boolean;
  pk: number;
  defaultValue: string | null;
}

export interface TursoForeignKeyInfo {
  id: number;
  column: string;
  refTable: string;
  refColumn: string | null;
  onUpdate: string;
  onDelete: string;
}

export interface TursoTableSchema {
  name: string;
  columns: TursoColumnInfo[];
  foreignKeys: TursoForeignKeyInfo[];
  rowCount: number;
}

export interface TursoSchemaSnapshot {
  ok: boolean;
  connected: boolean;
  host: string;
  fetchedAt: string;
  tables: TursoTableSchema[];
  error?: string;
}