/**
 * SQL Security and Validation Layer for SQL Playground
 */

export interface SecurityValidationResult {
  allowed: boolean;
  reason?: string;
}

const FORBIDDEN_PATTERNS = [
  /ATTACH\s+DATABASE/i,
  /DETACH\s+DATABASE/i,
  /PRAGMA\s+load_extension/i,
  /PRAGMA\s+database_list/i,
  /PRAGMA\s+compile_options/i,
  /^\s*\.[a-z]+/im,
  /load_extension\s*\(/i,
  /readfile\s*\(/i,
  /writefile\s*\(/i,
];

const DANGEROUS_COMMANDS = [
  /\bSYSTEM\b/i,
  /\bEXEC\s*\(/i,
  /\bSP_\w+\b/i,
];

export function validateSqlQuery(sql: string): SecurityValidationResult {
  if (!sql || typeof sql !== 'string' || sql.trim().length === 0) {
    return {
      allowed: false,
      reason: 'SQL query cannot be empty.',
    };
  }

  if (sql.length > 50000) {
    return {
      allowed: false,
      reason: 'SQL query exceeds the maximum allowed length of 50,000 characters.',
    };
  }

  for (const pattern of FORBIDDEN_PATTERNS) {
    if (pattern.test(sql)) {
      return {
        allowed: false,
        reason: 'Restricted SQL operation: Access to system files, extensions, or database attachments is disabled in practice mode.',
      };
    }
  }

  for (const pattern of DANGEROUS_COMMANDS) {
    if (pattern.test(sql)) {
      return {
        allowed: false,
        reason: 'Restricted system procedure or command detected.',
      };
    }
  }

  return { allowed: true };
}

export function sanitizeSqlError(error: unknown): string {
  if (!error) return 'An unknown error occurred during SQL execution.';

  const message = error instanceof Error ? error.message : String(error);
  let cleanMsg = message.replace(/(\/|\b[A-Za-z]:\\)[^\s:]+/g, '[internal]');
  
  if (cleanMsg.includes('no such table')) {
    const match = cleanMsg.match(/no such table:\s*([^\s,]+)/);
    return match ? `Table '${match[1]}' does not exist in this database. Check the Database Explorer for available tables.` : cleanMsg;
  }

  if (cleanMsg.includes('no such column')) {
    const match = cleanMsg.match(/no such column:\s*([^\s,]+)/);
    return match ? `Column '${match[1]}' was not found. Please verify column names in the schema view.` : cleanMsg;
  }

  if (cleanMsg.includes('syntax error')) {
    return `SQL Syntax Error: ${cleanMsg.replace(/.*syntax error/i, 'Syntax error')}`;
  }

  return cleanMsg;
}
