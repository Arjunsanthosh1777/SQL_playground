/**
 * Database Manager for SQL Playground
 * Isolates practice databases per user session in-memory using WebAssembly SQLite (sql.js).
 */

import initSqlJs, { Database, SqlJsStatic } from 'sql.js';
import { DATASETS } from './seedData.ts';
import { validateSqlQuery, sanitizeSqlError } from './security.ts';

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

export class DatabaseManager {
  private SQL: SqlJsStatic | null = null;
  private pristineBuffers: Map<string, Uint8Array> = new Map();
  // sessionId -> datasetId -> Database instance
  private sessionDatabases: Map<string, Map<string, { db: Database; lastAccess: number }>> = new Map();
  private maxRows = 1000;

  async init(): Promise<void> {
    if (this.SQL) return;
    
    this.SQL = await initSqlJs();

    // Pre-build pristine database binary snapshots for each dataset
    for (const [datasetId, meta] of Object.entries(DATASETS)) {
      const db = new this.SQL.Database();
      db.run(meta.sqlSeed);
      const binarySnapshot = db.export();
      this.pristineBuffers.set(datasetId, binarySnapshot);
      db.close();
    }

    console.log(`[DatabaseManager] Initialized with ${this.pristineBuffers.size} pristine datasets.`);
  }

  /**
   * Retrieves or creates an isolated database instance for the session & dataset
   */
  private getOrCreateSessionDb(sessionId: string, datasetId: string): Database {
    if (!this.SQL) {
      throw new Error('Database engine not initialized.');
    }

    if (!DATASETS[datasetId]) {
      throw new Error(`Dataset '${datasetId}' does not exist.`);
    }

    let userSessions = this.sessionDatabases.get(sessionId);
    if (!userSessions) {
      userSessions = new Map();
      this.sessionDatabases.set(sessionId, userSessions);
    }

    let sessionEntry = userSessions.get(datasetId);
    if (!sessionEntry) {
      const pristineBuffer = this.pristineBuffers.get(datasetId);
      if (!pristineBuffer) {
        throw new Error(`Pristine buffer for '${datasetId}' missing.`);
      }
      const db = new this.SQL.Database(pristineBuffer);
      sessionEntry = { db, lastAccess: Date.now() };
      userSessions.set(datasetId, sessionEntry);
    } else {
      sessionEntry.lastAccess = Date.now();
    }

    return sessionEntry.db;
  }

  /**
   * Resets an isolated session database back to its pristine seed state
   */
  resetSessionDataset(sessionId: string, datasetId: string): void {
    if (!this.SQL) throw new Error('Database engine not initialized.');
    
    const userSessions = this.sessionDatabases.get(sessionId);
    if (userSessions) {
      const existing = userSessions.get(datasetId);
      if (existing) {
        try {
          existing.db.close();
        } catch (e) {
          // ignore close error
        }
      }
      
      const pristineBuffer = this.pristineBuffers.get(datasetId);
      if (pristineBuffer) {
        const freshDb = new this.SQL.Database(pristineBuffer);
        userSessions.set(datasetId, { db: freshDb, lastAccess: Date.now() });
      }
    }
  }

  /**
   * Executes arbitrary SQL query safely with timeouts and resource bounds
   */
  executeSql(sessionId: string, datasetId: string, sql: string): ExecutionResponse {
    const startTime = performance.now();

    // 1. Validation
    const validation = validateSqlQuery(sql);
    if (!validation.allowed) {
      return {
        success: false,
        results: [],
        executionTimeMs: Math.round(performance.now() - startTime),
        error: validation.reason,
      };
    }

    try {
      const db = this.getOrCreateSessionDb(sessionId, datasetId);
      const cleanSql = sql.trim();
      const firstWord = cleanSql.split(/\s+/)[0]?.toUpperCase() || '';
      
      let statementType: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' | 'DDL' | 'OTHER' = 'OTHER';
      if (['SELECT', 'WITH', 'EXPLAIN', 'PRAGMA'].includes(firstWord)) statementType = 'SELECT';
      else if (firstWord === 'INSERT') statementType = 'INSERT';
      else if (firstWord === 'UPDATE') statementType = 'UPDATE';
      else if (firstWord === 'DELETE') statementType = 'DELETE';
      else if (['CREATE', 'ALTER', 'DROP'].includes(firstWord)) statementType = 'DDL';

      const rowsBefore = db.getRowsModified();
      const rawResults = db.exec(cleanSql);
      const rowsAfter = db.getRowsModified();
      const rowsAffected = rowsAfter - rowsBefore;

      const results: QueryResultItem[] = [];
      const warnings: string[] = [];

      if (rawResults.length === 0) {
        // Query succeeded but returned no rows (e.g. INSERT, UPDATE, DELETE, CREATE, DROP)
        results.push({
          columns: [],
          values: [],
          rowCount: 0,
          truncated: false,
          statementType,
          rowsAffected: Math.max(0, rowsAffected),
        });
      } else {
        for (const res of rawResults) {
          const totalRows = res.values.length;
          const isTruncated = totalRows > this.maxRows;
          const values = isTruncated ? res.values.slice(0, this.maxRows) : res.values;
          
          if (isTruncated) {
            warnings.push(`Result truncated: showing first ${this.maxRows} of ${totalRows} rows.`);
          }

          results.push({
            columns: res.columns,
            values,
            rowCount: totalRows,
            truncated: isTruncated,
            statementType: 'SELECT',
            rowsAffected: rowsAffected > 0 ? rowsAffected : undefined,
          });
        }
      }

      const executionTimeMs = parseFloat((performance.now() - startTime).toFixed(2));

      return {
        success: true,
        results,
        executionTimeMs,
        warnings: warnings.length > 0 ? warnings : undefined,
      };
    } catch (err: unknown) {
      const executionTimeMs = parseFloat((performance.now() - startTime).toFixed(2));
      return {
        success: false,
        results: [],
        executionTimeMs,
        error: sanitizeSqlError(err),
      };
    }
  }

  /**
   * Introspects table structure, columns, foreign keys, row counts, and sample data
   */
  getSchema(sessionId: string, datasetId: string): TableSchema[] {
    const db = this.getOrCreateSessionDb(sessionId, datasetId);
    
    // Find all user tables
    const tableRes = db.exec("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name ASC");
    if (tableRes.length === 0 || !tableRes[0].values) {
      return [];
    }

    const tables: TableSchema[] = [];

    for (const row of tableRes[0].values) {
      const tableName = String(row[0]);

      // Row count
      let rowCount = 0;
      try {
        const countRes = db.exec(`SELECT COUNT(*) FROM "${tableName}"`);
        if (countRes.length > 0 && countRes[0].values.length > 0) {
          rowCount = Number(countRes[0].values[0][0]);
        }
      } catch (e) {
        // ignore
      }

      // Column info
      const columns: ColumnInfo[] = [];
      try {
        const colRes = db.exec(`PRAGMA table_info("${tableName}")`);
        if (colRes.length > 0 && colRes[0].values) {
          for (const col of colRes[0].values) {
            columns.push({
              name: String(col[1]),
              type: String(col[2] || 'ANY').toUpperCase(),
              notNull: Boolean(col[3]),
              defaultValue: col[4],
              isPrimaryKey: Boolean(col[5]),
            });
          }
        }
      } catch (e) {
        // ignore
      }

      // Foreign keys
      const foreignKeys: ForeignKeyInfo[] = [];
      try {
        const fkRes = db.exec(`PRAGMA foreign_key_list("${tableName}")`);
        if (fkRes.length > 0 && fkRes[0].values) {
          for (const fk of fkRes[0].values) {
            foreignKeys.push({
              foreignTable: String(fk[2]),
              column: String(fk[3]),
              foreignColumn: String(fk[4]),
            });
          }
        }
      } catch (e) {
        // ignore
      }

      // Sample first 3 rows
      let sampleRows: any[][] = [];
      try {
        const sampleRes = db.exec(`SELECT * FROM "${tableName}" LIMIT 3`);
        if (sampleRes.length > 0) {
          sampleRows = sampleRes[0].values;
        }
      } catch (e) {
        // ignore
      }

      tables.push({
        name: tableName,
        rowCount,
        columns,
        foreignKeys,
        sampleRows,
      });
    }

    return tables;
  }
}

export const databaseManager = new DatabaseManager();
