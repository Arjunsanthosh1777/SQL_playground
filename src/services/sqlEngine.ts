/**
 * Client-Side SQLite WebAssembly Engine
 * Runs SQLite directly inside the browser using sql.js.
 * Guarantees 100% functionality on static hosting platforms (Vercel, GitHub Pages, Netlify)
 * without requiring any backend Node.js server.
 */

import initSqlJs, { Database, SqlJsStatic } from 'sql.js';
import { DATASETS, DatasetMeta } from '../data/seedData.ts';
import { CHALLENGES, Challenge } from '../data/challengesData.ts';
import { validateSqlQuery, sanitizeSqlError } from '../data/security.ts';
import { TableSchema, ExecutionResponse, QueryResultItem, VerificationResult } from '../types/index.ts';

class ClientSqlEngine {
  private SQL: SqlJsStatic | null = null;
  private pristineBuffers: Map<string, Uint8Array> = new Map();
  private activeDbs: Map<string, Database> = new Map();
  private maxRows = 1000;
  private initPromise: Promise<void> | null = null;

  async init(): Promise<void> {
    if (this.SQL) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = (async () => {
      try {
        // Try local wasm first (served from /sql-wasm.wasm), then fallback to CDN
        this.SQL = await initSqlJs({
          locateFile: (file) => {
            if (file.endsWith('.wasm')) {
              return '/sql-wasm.wasm';
            }
            return file;
          },
        });
      } catch (localErr) {
        console.warn('Local WASM load failed, attempting CDN fallback...', localErr);
        this.SQL = await initSqlJs({
          locateFile: (file) => {
            if (file.endsWith('.wasm')) {
              return 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.12.0/sql-wasm.wasm';
            }
            return file;
          },
        });
      }

      // Build pristine snapshots for each dataset
      for (const [id, meta] of Object.entries(DATASETS)) {
        const db = new this.SQL.Database();
        db.run(meta.sqlSeed);
        const snapshot = db.export();
        this.pristineBuffers.set(id, snapshot);
        db.close();
      }

      console.log('[ClientSqlEngine] Initialized WebAssembly SQLite engine in browser.');
    })();

    return this.initPromise;
  }

  private getOrCreateDb(datasetId: string): Database {
    if (!this.SQL) throw new Error('Client SQL Engine not initialized.');
    let db = this.activeDbs.get(datasetId);
    if (!db) {
      const pristine = this.pristineBuffers.get(datasetId);
      if (!pristine) throw new Error(`Dataset '${datasetId}' not found.`);
      db = new this.SQL.Database(pristine);
      this.activeDbs.set(datasetId, db);
    }
    return db;
  }

  getDatasets(): DatasetMeta[] {
    return Object.values(DATASETS);
  }

  resetDataset(datasetId: string): void {
    if (!this.SQL) return;
    const existing = this.activeDbs.get(datasetId);
    if (existing) {
      try { existing.close(); } catch {}
    }
    const pristine = this.pristineBuffers.get(datasetId);
    if (pristine) {
      const fresh = new this.SQL.Database(pristine);
      this.activeDbs.set(datasetId, fresh);
    }
  }

  executeSql(datasetId: string, sql: string): ExecutionResponse {
    const startTime = performance.now();

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
      const db = this.getOrCreateDb(datasetId);
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

  getSchema(datasetId: string): TableSchema[] {
    const db = this.getOrCreateDb(datasetId);
    const tableRes = db.exec("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name ASC");
    if (tableRes.length === 0 || !tableRes[0].values) return [];

    const tables: TableSchema[] = [];

    for (const row of tableRes[0].values) {
      const tableName = String(row[0]);

      let rowCount = 0;
      try {
        const countRes = db.exec(`SELECT COUNT(*) FROM "${tableName}"`);
        if (countRes.length > 0 && countRes[0].values.length > 0) {
          rowCount = Number(countRes[0].values[0][0]);
        }
      } catch {}

      const columns: any[] = [];
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
      } catch {}

      const foreignKeys: any[] = [];
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
      } catch {}

      let sampleRows: any[][] = [];
      try {
        const sampleRes = db.exec(`SELECT * FROM "${tableName}" LIMIT 3`);
        if (sampleRes.length > 0) sampleRows = sampleRes[0].values;
      } catch {}

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

  async verifyChallenge(challengeId: string, userSql: string): Promise<VerificationResult> {
    await this.init();
    if (!this.SQL) throw new Error('SQL engine not initialized.');

    const challenge = CHALLENGES.find(c => c.id === challengeId);
    if (!challenge) {
      return { success: false, passed: false, message: `Challenge '${challengeId}' not found.` };
    }

    const validation = validateSqlQuery(userSql);
    if (!validation.allowed) {
      return { success: false, passed: false, message: validation.reason || 'Query disallowed by policy.' };
    }

    const pristine = this.pristineBuffers.get(challenge.datasetId);
    if (!pristine) return { success: false, passed: false, message: 'Dataset not found.' };

    const userDb = new this.SQL.Database(pristine);
    const expDb = new this.SQL.Database(pristine);

    try {
      if (challenge.isDml) {
        try {
          userDb.run(userSql.trim());
        } catch (err) {
          return {
            success: false,
            passed: false,
            message: `Execution failed: ${sanitizeSqlError(err)}`,
            error: sanitizeSqlError(err),
          };
        }

        expDb.run(challenge.expectedSql.trim());

        const verifyQuery = challenge.verifySql || 'SELECT 1;';
        const uRes = userDb.exec(verifyQuery);
        const eRes = expDb.exec(verifyQuery);

        const uCols = uRes[0]?.columns || [];
        const uVals = uRes[0]?.values || [];
        const eCols = eRes[0]?.columns || [];
        const eVals = eRes[0]?.values || [];

        const isMatch = JSON.stringify(uVals) === JSON.stringify(eVals);

        return {
          success: true,
          passed: isMatch,
          message: isMatch
            ? 'Outstanding! The database records were correctly modified.'
            : 'The query executed, but the resulting table records did not match the expected state.',
          userResult: { columns: uCols, values: uVals, rowCount: uVals.length },
          expectedResult: { columns: eCols, values: eVals, rowCount: eVals.length },
        };
      } else {
        let userRes;
        try {
          userRes = userDb.exec(userSql.trim());
        } catch (err) {
          return {
            success: false,
            passed: false,
            message: `Execution failed: ${sanitizeSqlError(err)}`,
            error: sanitizeSqlError(err),
          };
        }

        if (userRes.length === 0) {
          return {
            success: true,
            passed: false,
            message: 'Your query returned 0 result sets. Make sure you use a SELECT statement.',
          };
        }

        const expRes = expDb.exec(challenge.expectedSql.trim());
        const uCols = userRes[0].columns;
        const uVals = userRes[0].values;
        const eCols = expRes[0].columns;
        const eVals = expRes[0].values;

        const uData = { columns: uCols, values: uVals, rowCount: uVals.length };
        const eData = { columns: eCols, values: eVals, rowCount: eVals.length };

        if (uCols.length !== eCols.length) {
          return {
            success: true,
            passed: false,
            message: `Column count mismatch: returned ${uCols.length} columns, expected ${eCols.length}.`,
            userResult: uData,
            expectedResult: eData,
          };
        }

        if (uVals.length !== eVals.length) {
          return {
            success: true,
            passed: false,
            message: `Row count mismatch: returned ${uVals.length} rows, expected ${eVals.length}.`,
            userResult: uData,
            expectedResult: eData,
          };
        }

        const norm = (vals: any[][]) =>
          vals.map(r => r.map(c => (typeof c === 'number' ? Math.round(c * 100) / 100 : String(c).trim().toLowerCase())));

        const uNorm = norm(uVals);
        const eNorm = norm(eVals);

        if (JSON.stringify(uNorm) === JSON.stringify(eNorm)) {
          return {
            success: true,
            passed: true,
            message: `Excellent! Your query returned the exact ${uVals.length} expected rows with correct columns.`,
            userResult: uData,
            expectedResult: eData,
          };
        }

        if (!challenge.category.includes('ORDER BY')) {
          const sortFn = (a: any[], b: any[]) => JSON.stringify(a).localeCompare(JSON.stringify(b));
          if (JSON.stringify([...uNorm].sort(sortFn)) === JSON.stringify([...eNorm].sort(sortFn))) {
            return {
              success: true,
              passed: true,
              message: `Well done! All ${uVals.length} records and values match expected solution.`,
              userResult: uData,
              expectedResult: eData,
            };
          }
        }

        return {
          success: true,
          passed: false,
          message: 'The row count matches, but some column values or sorting do not match.',
          userResult: uData,
          expectedResult: eData,
        };
      }
    } finally {
      try {
        userDb.close();
        expDb.close();
      } catch {}
    }
  }

  getChallenges(): Challenge[] {
    return CHALLENGES;
  }
}

export const clientSqlEngine = new ClientSqlEngine();
