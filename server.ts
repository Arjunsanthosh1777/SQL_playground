/**
 * SQL Playground Full-Stack Server
 * Node.js / Express backend with Vite middleware in dev and isolated SQLite practice sandboxes.
 */

import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { databaseManager } from './server/databaseManager.ts';
import { DATASETS } from './server/seedData.ts';
import { CHALLENGES } from './server/challengesData.ts';
import { challengeVerifier } from './server/challengeVerifier.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  // Initialize SQLite WebAssembly engine & seeds
  await databaseManager.init();
  await challengeVerifier.init();

  // Helper to extract session ID from header or body
  const getSessionId = (req: Request): string => {
    return (
      (req.headers['x-session-id'] as string) ||
      (req.body && req.body.sessionId) ||
      'default-guest-session'
    );
  };

  // -------------------------------------------------------------
  // API ENDPOINTS
  // -------------------------------------------------------------

  // Health check
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      service: 'SQL Playground Sandbox API',
      timestamp: new Date().toISOString(),
    });
  });

  // Datasets list
  app.get('/api/datasets', (_req: Request, res: Response) => {
    const list = Object.values(DATASETS).map(d => ({
      id: d.id,
      name: d.name,
      tagline: d.tagline,
      description: d.description,
      icon: d.icon,
      tableCount: d.tableCount,
      tables: d.tables,
    }));
    res.json({ success: true, datasets: list });
  });

  // Dataset schema introspection
  app.get('/api/datasets/:id/schema', (req: Request, res: Response) => {
    const datasetId = req.params.id;
    const sessionId = getSessionId(req);

    if (!DATASETS[datasetId]) {
      return res.status(404).json({ success: false, error: `Dataset '${datasetId}' not found.` });
    }

    try {
      const tables = databaseManager.getSchema(sessionId, datasetId);
      res.json({
        success: true,
        datasetId,
        datasetName: DATASETS[datasetId].name,
        tables,
      });
    } catch (err: unknown) {
      res.status(500).json({
        success: false,
        error: err instanceof Error ? err.message : 'Failed to introspect database schema.',
      });
    }
  });

  // Query Execution Endpoint
  app.post('/api/execute', (req: Request, res: Response) => {
    const { sql, datasetId = 'students' } = req.body;
    const sessionId = getSessionId(req);

    if (!sql || typeof sql !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid SQL query in the request body.',
      });
    }

    if (!DATASETS[datasetId]) {
      return res.status(404).json({
        success: false,
        error: `Dataset '${datasetId}' not found. Available datasets: ${Object.keys(DATASETS).join(', ')}`,
      });
    }

    const executionResult = databaseManager.executeSql(sessionId, datasetId, sql);
    res.json(executionResult);
  });

  // Reset Dataset to pristine initial state
  app.post('/api/reset', (req: Request, res: Response) => {
    const { datasetId = 'students' } = req.body;
    const sessionId = getSessionId(req);

    if (!DATASETS[datasetId]) {
      return res.status(404).json({ success: false, error: `Dataset '${datasetId}' not found.` });
    }

    try {
      databaseManager.resetSessionDataset(sessionId, datasetId);
      const freshTables = databaseManager.getSchema(sessionId, datasetId);
      res.json({
        success: true,
        message: `Dataset '${DATASETS[datasetId].name}' successfully reset to pristine factory state.`,
        tables: freshTables,
      });
    } catch (err: unknown) {
      res.status(500).json({
        success: false,
        error: err instanceof Error ? err.message : 'Failed to reset dataset.',
      });
    }
  });

  // Challenge List
  app.get('/api/challenges', (_req: Request, res: Response) => {
    res.json({
      success: true,
      challenges: CHALLENGES.map(c => ({
        id: c.id,
        title: c.title,
        difficulty: c.difficulty,
        category: c.category,
        datasetId: c.datasetId,
        description: c.description,
        instructions: c.instructions,
        hints: c.hints,
        starterSql: c.starterSql,
        isDml: Boolean(c.isDml),
      })),
    });
  });

  // Challenge Verification & Auto-Grading
  app.post('/api/verify-challenge', async (req: Request, res: Response) => {
    const { challengeId, sql } = req.body;

    if (!challengeId || !sql) {
      return res.status(400).json({
        success: false,
        message: 'Both challengeId and sql are required.',
      });
    }

    try {
      const result = await challengeVerifier.verify(challengeId, sql);
      res.json({ success: true, ...result });
    } catch (err: unknown) {
      res.status(500).json({
        success: false,
        passed: false,
        message: err instanceof Error ? err.message : 'Evaluation error occurred.',
      });
    }
  });

  // Categorized Sample Queries
  app.get('/api/samples', (_req: Request, res: Response) => {
    const samples = [
      {
        id: 'sample-1',
        title: 'Filter High GPA Honors Students',
        datasetId: 'students',
        category: 'WHERE',
        sql: `SELECT first_name, last_name, gpa, enrollment_year\nFROM students\nWHERE gpa >= 3.80\nORDER BY gpa DESC;`,
      },
      {
        id: 'sample-2',
        title: 'Join Courses with Department and Professor',
        datasetId: 'students',
        category: 'JOIN',
        sql: `SELECT \n  c.course_code,\n  c.title AS course_title,\n  d.name AS department,\n  p.first_name || ' ' || p.last_name AS instructor\nFROM courses c\nJOIN departments d ON c.dept_id = d.dept_id\nJOIN professors p ON c.professor_id = p.professor_id\nORDER BY c.course_code;`,
      },
      {
        id: 'sample-3',
        title: 'Department Headcount & Salary Outlays',
        datasetId: 'employees',
        category: 'GROUP BY',
        sql: `SELECT \n  d.dept_name,\n  COUNT(e.emp_id) AS employee_count,\n  ROUND(AVG(e.salary), 2) AS avg_salary,\n  ROUND(SUM(e.salary), 2) AS total_payroll,\n  d.budget\nFROM departments d\nLEFT JOIN employees e ON d.dept_id = e.dept_id\nGROUP BY d.dept_id, d.dept_name, d.budget\nORDER BY total_payroll DESC;`,
      },
      {
        id: 'sample-4',
        title: 'Product Reorder Stock Alert with CASE',
        datasetId: 'products',
        category: 'CASE',
        sql: `SELECT \n  p.product_name,\n  c.name AS category,\n  p.units_in_stock,\n  p.reorder_level,\n  CASE\n    WHEN p.units_in_stock <= p.reorder_level THEN 'URGENT: Reorder'\n    WHEN p.units_in_stock <= p.reorder_level * 2 THEN 'Warning: Low'\n    ELSE 'Adequate'\n  END AS stock_health\nFROM products p\nJOIN categories c ON p.category_id = c.category_id\nORDER BY p.units_in_stock ASC;`,
      },
      {
        id: 'sample-5',
        title: 'Customer Lifetime Spend Analysis',
        datasetId: 'customers_orders',
        category: 'AGGREGATION',
        sql: `SELECT \n  c.customer_id,\n  c.first_name || ' ' || c.last_name AS customer_name,\n  c.city,\n  c.loyalty_tier,\n  COUNT(o.order_id) AS total_orders,\n  ROUND(SUM(o.total_amount), 2) AS total_spent\nFROM customers c\nJOIN orders o ON c.customer_id = o.customer_id\nGROUP BY c.customer_id, customer_name, c.city, c.loyalty_tier\nHAVING total_spent > 500\nORDER BY total_spent DESC;`,
      },
    ];

    res.json({ success: true, samples });
  });

  // -------------------------------------------------------------
  // VITE DEV SERVER / PRODUCTION STATIC SERVING
  // -------------------------------------------------------------
  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction) {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SQL Playground] Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[SQL Playground] Fatal startup error:', err);
  process.exit(1);
});
