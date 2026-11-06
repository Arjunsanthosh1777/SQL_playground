/**
 * Challenge Verifier for SQL Playground
 * Safely grades student SQL queries by running them in isolated scratch databases
 * and comparing result sets and table states against canonical solutions.
 */

import initSqlJs, { SqlJsStatic } from 'sql.js';
import { DATASETS } from './seedData.ts';
import { CHALLENGES, Challenge } from './challengesData.ts';
import { validateSqlQuery, sanitizeSqlError } from './security.ts';

export interface VerificationResult {
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

export class ChallengeVerifier {
  private SQL: SqlJsStatic | null = null;
  private datasetSeeds: Map<string, string> = new Map();

  async init(): Promise<void> {
    if (!this.SQL) {
      this.SQL = await initSqlJs();
      for (const [id, meta] of Object.entries(DATASETS)) {
        this.datasetSeeds.set(id, meta.sqlSeed);
      }
    }
  }

  async verify(challengeId: string, userSql: string): Promise<VerificationResult> {
    await this.init();
    if (!this.SQL) throw new Error('SQL engine failed to initialize.');

    const challenge = CHALLENGES.find(c => c.id === challengeId);
    if (!challenge) {
      return {
        passed: false,
        message: `Challenge '${challengeId}' not found.`,
      };
    }

    // 1. Security check
    const validation = validateSqlQuery(userSql);
    if (!validation.allowed) {
      return {
        passed: false,
        message: validation.reason || 'Query disallowed by security policy.',
      };
    }

    const seed = this.datasetSeeds.get(challenge.datasetId);
    if (!seed) {
      return { passed: false, message: 'Dataset seed not found.' };
    }

    // Create two isolated scratch databases
    const userDb = new this.SQL.Database();
    userDb.run(seed);

    const expectedDb = new this.SQL.Database();
    expectedDb.run(seed);

    try {
      if (challenge.isDml) {
        // Evaluate DML by executing both, then running verifySql on both
        try {
          userDb.run(userSql.trim());
        } catch (err) {
          return {
            passed: false,
            message: `Execution failed: ${sanitizeSqlError(err)}`,
            error: sanitizeSqlError(err),
          };
        }

        expectedDb.run(challenge.expectedSql.trim());

        const verifyQuery = challenge.verifySql || 'SELECT 1;';
        const userVerifyRes = userDb.exec(verifyQuery);
        const expectedVerifyRes = expectedDb.exec(verifyQuery);

        const userCols = userVerifyRes[0]?.columns || [];
        const userVals = userVerifyRes[0]?.values || [];
        const expCols = expectedVerifyRes[0]?.columns || [];
        const expVals = expectedVerifyRes[0]?.values || [];

        const isMatch = JSON.stringify(userVals) === JSON.stringify(expVals);

        if (isMatch) {
          return {
            passed: true,
            message: 'Outstanding! The database state was correctly modified according to the challenge requirements.',
            userResult: { columns: userCols, values: userVals, rowCount: userVals.length },
            expectedResult: { columns: expCols, values: expVals, rowCount: expVals.length },
          };
        } else {
          return {
            passed: false,
            message: 'The query executed, but the resulting table records did not match the expected state.',
            userResult: { columns: userCols, values: userVals, rowCount: userVals.length },
            expectedResult: { columns: expCols, values: expVals, rowCount: expVals.length },
          };
        }
      } else {
        // Standard SELECT evaluation
        let userRes;
        try {
          userRes = userDb.exec(userSql.trim());
        } catch (err) {
          return {
            passed: false,
            message: `Execution failed: ${sanitizeSqlError(err)}`,
            error: sanitizeSqlError(err),
          };
        }

        if (userRes.length === 0) {
          return {
            passed: false,
            message: 'Your query returned 0 result sets. Make sure you use a SELECT statement.',
          };
        }

        const expectedRes = expectedDb.exec(challenge.expectedSql.trim());
        const userCols = userRes[0].columns;
        const userVals = userRes[0].values;
        const expCols = expectedRes[0].columns;
        const expVals = expectedRes[0].values;

        const userResultData = { columns: userCols, values: userVals, rowCount: userVals.length };
        const expectedResultData = { columns: expCols, values: expVals, rowCount: expVals.length };

        // Compare column count
        if (userCols.length !== expCols.length) {
          return {
            passed: false,
            message: `Column count mismatch: your query returned ${userCols.length} column(s), but the challenge expects ${expCols.length} column(s).`,
            userResult: userResultData,
            expectedResult: expectedResultData,
          };
        }

        // Compare row count
        if (userVals.length !== expVals.length) {
          return {
            passed: false,
            message: `Row count mismatch: your query returned ${userVals.length} row(s), but expected ${expVals.length} row(s). Check your WHERE / JOIN / LIMIT clauses.`,
            userResult: userResultData,
            expectedResult: expectedResultData,
          };
        }

        // Compare values
        // Check exact match (or normalized value match)
        const normalize = (vals: any[][]) =>
          vals.map(r => r.map(c => (typeof c === 'number' ? Math.round(c * 100) / 100 : String(c).trim().toLowerCase())));

        const userNorm = normalize(userVals);
        const expNorm = normalize(expVals);

        const exactOrderMatch = JSON.stringify(userNorm) === JSON.stringify(expNorm);
        if (exactOrderMatch) {
          return {
            passed: true,
            message: `Excellent! Your query returned the exact ${userVals.length} expected rows with correct columns and ordering.`,
            userResult: userResultData,
            expectedResult: expectedResultData,
          };
        }

        // Check if unordered match (if challenge doesn't require strict ordering)
        if (!challenge.category.includes('ORDER BY')) {
          const sortFn = (a: any[], b: any[]) => JSON.stringify(a).localeCompare(JSON.stringify(b));
          const sortedUser = [...userNorm].sort(sortFn);
          const sortedExp = [...expNorm].sort(sortFn);
          if (JSON.stringify(sortedUser) === JSON.stringify(sortedExp)) {
            return {
              passed: true,
              message: `Well done! Your query returned all ${userVals.length} correct records with expected values.`,
              userResult: userResultData,
              expectedResult: expectedResultData,
            };
          }
        }

        return {
          passed: false,
          message: 'The row count matches, but some column values or sorting do not match the expected answer. Compare your output with the expected output table below.',
          userResult: userResultData,
          expectedResult: expectedResultData,
        };
      }
    } finally {
      try {
        userDb.close();
        expectedDb.close();
      } catch (e) {
        // ignore
      }
    }
  }
}

export const challengeVerifier = new ChallengeVerifier();
