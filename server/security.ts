/**
 * SQL Security and Validation Layer for SQL Playground (Backend)
 */

export interface SecurityValidationResult {
  allowed: boolean;
  reason?: string;
}

const FORBIDDEN_PATTERNS = [
  /ATTACH\s+DATABASE/i,
  /DETACH\s+DATABASE/i,
  /PRAGMA\s+load_extension/i,
  /load_extension\s*\(/i,
  /readfile\s*\(/i,
  /writefile\s*\(/i,
  /^\s*\.[a-z]+/im,
];

function stripCommentsAndLiterals(sql: string): string {
  let cleaned = sql.replace(/\/\*[\s\S]*?\*\//g, ' ');
  cleaned = cleaned.replace(/--.*$/gm, ' ');
  cleaned = cleaned.replace(/'(?:''|[^'])*'/g, "''");
  cleaned = cleaned.replace(/"(?:""|[^"])*"/g, '""');
  return cleaned;
}

export function validateSqlQuery(sql: string): SecurityValidationResult {
  if (!sql || typeof sql !== 'string' || sql.trim().length === 0) {
    return {
      allowed: false,
      reason: 'SQL query cannot be empty.',
    };
  }

  if (sql.length > 500000) {
    return {
      allowed: false,
      reason: 'SQL query exceeds the maximum allowed length of 500,000 characters.',
    };
  }

  const cleanedCode = stripCommentsAndLiterals(sql);

  for (const pattern of FORBIDDEN_PATTERNS) {
    if (pattern.test(cleanedCode)) {
      return {
        allowed: false,
        reason: 'Restricted SQL operation: Access to system files, extensions, or database attachments is disabled in practice mode.',
      };
    }
  }

  return { allowed: true };
}

export function sanitizeSqlError(error: unknown, failingStatement?: string, lineNumber?: number): string {
  if (!error) return 'An unknown error occurred during SQL execution.';

  const rawMessage = error instanceof Error ? error.message : String(error);
  let cleanMsg = rawMessage.replace(/(\/|\b[A-Za-z]:\\)[^\s:]+/g, '[internal]');
  
  if (cleanMsg.includes('no such table')) {
    const match = cleanMsg.match(/no such table:\s*([^\s,]+)/);
    cleanMsg = match ? `Table '${match[1]}' does not exist. Check table names in the Database Explorer.` : cleanMsg;
  } else if (cleanMsg.includes('no such column')) {
    const match = cleanMsg.match(/no such column:\s*([^\s,]+)/);
    cleanMsg = match ? `Column '${match[1]}' was not found in the referenced table.` : cleanMsg;
  } else if (cleanMsg.includes('syntax error')) {
    cleanMsg = `Syntax Error: ${cleanMsg.replace(/.*syntax error/i, 'Syntax error')}`;
  } else if (cleanMsg.includes('UNIQUE constraint failed')) {
    cleanMsg = `Constraint Error: ${cleanMsg}`;
  } else if (cleanMsg.includes('FOREIGN KEY constraint failed')) {
    cleanMsg = `Foreign Key Error: Referenced record does not exist in parent table.`;
  }

  if (lineNumber !== undefined && lineNumber > 0) {
    cleanMsg = `[Line ${lineNumber}] ${cleanMsg}`;
  }

  if (failingStatement) {
    const preview = failingStatement.trim().replace(/\s+/g, ' ');
    const truncated = preview.length > 70 ? preview.substring(0, 67) + '...' : preview;
    cleanMsg += `\nFailing SQL: ${truncated}`;
  }

  return cleanMsg;
}
