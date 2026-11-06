/**
 * SQL Security and Validation Layer for SQL Playground
 * Prevents execution of dangerous operations and enforces resource limits.
 */

export interface SecurityValidationResult {
  allowed: boolean;
  reason?: string;
}

// Blocked patterns that could harm the sandbox, escape SQLite, or read system files
const FORBIDDEN_PATTERNS = [
  /ATTACH\s+DATABASE/i,
  /DETACH\s+DATABASE/i,
  /PRAGMA\s+load_extension/i,
  /PRAGMA\s+database_list/i,
  /PRAGMA\s+compile_options/i,
  /PRAGMA\s+table_info/i, // We provide safe API schema introspection instead, but allowed if users query it
  /^\s*\.[a-z]+/im, // Dot commands like .shell, .read, .system
  /load_extension\s*\(/i,
  /readfile\s*\(/i,
  /writefile\s*\(/i,
];

// Dangerous keywords explicitly prohibited
const DANGEROUS_COMMANDS = [
  /\bSYSTEM\b/i,
  /\bEXEC\s*\(/i,
  /\bSP_\w+\b/i,
];

/**
 * Validates a SQL query against security policies before execution
 */
export function validateSqlQuery(sql: string): SecurityValidationResult {
  if (!sql || typeof sql !== 'string' || sql.trim().length === 0) {
    return {
      allowed: false,
      reason: 'SQL query cannot be empty.',
    };
  }

  // Prevent excessively large queries (DDoS / memory exhaustion)
  if (sql.length > 50000) {
    return {
      allowed: false,
      reason: 'SQL query exceeds the maximum allowed length of 50,000 characters.',
    };
  }

  // Check forbidden patterns
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

/**
 * Sanitizes error messages to ensure internal server paths or stack traces are not leaked
 */
export function sanitizeSqlError(error: unknown): string {
  if (!error) return 'An unknown error occurred during SQL execution.';

  const message = error instanceof Error ? error.message : String(error);

  // Strip system directory paths (e.g. /app/..., /home/..., C:\...)
  let cleanMsg = message.replace(/(\/|\b[A-Za-z]:\\)[^\s:]+/g, '[internal]');
  
  // Format common SQLite errors cleanly
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
