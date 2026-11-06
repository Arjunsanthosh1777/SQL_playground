/**
 * TypeScript Interfaces and Types for SQL Playground
 */

export interface DatasetMeta {
  id: string;
  name: string;
  tagline: string;
  description: string;
  icon: string;
  tableCount: number;
  tables: string[];
}

export interface ColumnInfo {
  name: string;
  type: string;
  notNull: boolean;
  isPrimaryKey: boolean;
  defaultValue: any;
}

export interface ForeignKeyInfo {
  column: string;
  foreignTable: string;
  foreignColumn: string;
}

export interface TableSchema {
  name: string;
  rowCount: number;
  columns: ColumnInfo[];
  foreignKeys: ForeignKeyInfo[];
  sampleRows: any[][];
}

export interface QueryResultItem {
  columns: string[];
  values: any[][];
  rowCount: number;
  truncated: boolean;
  statementType: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' | 'DDL' | 'OTHER';
  rowsAffected?: number;
}

export interface ExecutionResponse {
  success: boolean;
  results: QueryResultItem[];
  executionTimeMs: number;
  error?: string;
  warnings?: string[];
}

export interface Challenge {
  id: string;
  title: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: 'SELECT' | 'WHERE' | 'ORDER BY' | 'GROUP BY' | 'JOIN' | 'INSERT' | 'UPDATE' | 'DELETE' | 'SUBQUERY';
  datasetId: 'students' | 'employees' | 'products' | 'customers_orders';
  description: string;
  instructions: string;
  hints: string[];
  starterSql: string;
  isDml?: boolean;
}

export interface VerificationResult {
  success: boolean;
  passed: boolean;
  message: string;
  userResult?: {
    columns: string[];
    values: any[][];
    rowCount: number;
  };
  expectedResult?: {
    columns: string[];
    values: any[][];
    rowCount: number;
  };
  error?: string;
}

export interface HistoryItem {
  id: string;
  sql: string;
  datasetId: string;
  timestamp: number;
  executionTimeMs: number;
  rowCount: number;
  success: boolean;
  error?: string;
}

export interface SavedQuery {
  id: string;
  title: string;
  sql: string;
  datasetId: string;
  notes?: string;
  createdAt: number;
}

export interface UserSettings {
  fontSize: number;
  lineNumbers: boolean;
  autoFormatOnRun: boolean;
  defaultDataset: string;
  sessionId: string;
}

export interface SampleQuery {
  id: string;
  title: string;
  datasetId: string;
  category: string;
  sql: string;
}
